const fileViewer = {
	sidebar: null,
	resizeHandle: null,
	wrapper: null,
	scrollableContent: null,
	resizeObserver: null,
	resizeTimeout: null,
	isResizing: false,
	sidebarWidth: 430,
	minSidebarWidth: 320,
	maxSidebarWidth: 600,
	startX: 0,
	startWidth: 0,
	tabHistory: [],
	currentTab: null,
	init: function () {
		this.sidebar = $("#file-viewer-sidebar");
		this.resizeHandle = $("#file-viewer-resize-handle-sidebar");
		this.wrapper = $(".file-viewer-wrapper");
		this.scrollableContent = this.sidebar.find(".overflow-y-auto");
		this.initResizeHandle();
		this.initScrollObserver();
		this.checkSidebarScroll();
		this.initContentTab();
	},
	getCurrentActiveTab: function () {
		const activeContent = this.sidebar.find(
			"[data-tab-inside-content]:not(.hidden)",
		);
		if (activeContent.length) {
			return activeContent.attr("data-tab-inside-content");
		}
		return null;
	},
	saveTabState: function () {
		if (this.currentTab) {
			this.tabHistory.push(this.currentTab);
		}
	},
	switchTab: function (tabId) {
		const tabContent = $(`[data-tab-inside-content="${tabId}"]`);
		if (tabContent.length) {
			tabContent.removeClass("hidden");
			tabContent.siblings("[data-tab-inside-content]").addClass("hidden");
			this.currentTab = tabId;
		}
	},
	goBack: function () {
		if (this.tabHistory.length > 0) {
			const previousTab = this.tabHistory.pop();
			if (previousTab) {
				this.switchTab(previousTab);
			}
		}
	},
	initContentTab: function () {
		const self = this;
		const tabItems = self.sidebar.find("[data-tab-inside]");
		const goBackBtn = $("[data-tab-inside-go-back]");

		self.currentTab = self.getCurrentActiveTab();

		goBackBtn.on("click", function (e) {
			e.preventDefault();
			self.goBack();
		});

		tabItems.on("click", function (e) {
			e.preventDefault();
			const targetTab = e.currentTarget;
			const tabInside = targetTab.getAttribute("data-tab-inside");

			self.saveTabState();

			self.switchTab(tabInside);
		});
	},
	getCurrentSidebarWidth: function () {
		const gridTemplate = this.wrapper.css("grid-template-columns");
		const match = gridTemplate.match(/1fr\s+(\d+)px/);
		if (match) {
			return parseInt(match[1], 10);
		}
		return this.sidebarWidth;
	},
	initResizeHandle: function () {
		const self = this;

		this.resizeHandle.on("mousedown", function (e) {
			e.preventDefault();

			$(document).off("mousemove.fileViewer mouseup.fileViewer");

			self.isResizing = true;
			self.startX = e.clientX;
			self.startWidth = self.getCurrentSidebarWidth();
			self.resizeHandle.addClass("active-resize");

			$(document).on("mousemove.fileViewer", function (e) {
				if (!self.isResizing) return;
				const diffX = e.clientX - self.startX;
				let newWidth = self.startWidth - diffX;

				newWidth = Math.max(
					self.minSidebarWidth,
					Math.min(self.maxSidebarWidth, newWidth),
				);

				if (newWidth <= 380) {
					self.sidebar.addClass("sidebar-small");
				} else {
					self.sidebar.removeClass("sidebar-small");
				}

				self.sidebarWidth = newWidth;
				self.wrapper.css("grid-template-columns", `1fr ${newWidth}px`);
				self.checkSidebarScroll();
			});

			$(document).on("mouseup.fileViewer", function () {
				self.isResizing = false;
				self.resizeHandle.removeClass("active-resize");
				$(document).off("mousemove.fileViewer mouseup.fileViewer");
			});
		});
	},
	initScrollObserver: function () {
		const self = this;

		if (window.ResizeObserver && this.scrollableContent.length) {
			this.resizeObserver = new ResizeObserver(function () {
				self.checkSidebarScroll();
			});
			this.resizeObserver.observe(this.scrollableContent[0]);
		} else {
			$(window).on("resize.fileViewer", function () {
				clearTimeout(self.resizeTimeout);
				self.resizeTimeout = setTimeout(function () {
					self.checkSidebarScroll();
				}, 100);
			});
		}
	},
	checkSidebarScroll: function () {
		if (!this.scrollableContent.length) return;

		const element = this.scrollableContent[0];
		const hasScroll = element.scrollHeight > element.clientHeight;

		this.sidebar.toggleClass("sidebar-has-scrollbar", hasScroll);
	},
};

$(document).ready(() => {
	fileViewer.init();
});
