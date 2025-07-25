const BottomSheet = {
	isMobile: window.innerWidth < 1024,
	isDragging: false,
	dragStartY: 0,
	showSheetTimeout: null,
	sheetClosePercent: 45,
	heightTrigger: 0,
	activeSheet: null,
	activeSheetBody: null,
	activeSheetContent: null,
	scrollbarWidth: 0,

	config: {
		defaultHeight: 0,
		maxHeight: 80,
		animationDuration: 500,
		showDelay: 10,
		selectors: {
			body: ".js-dropdown-body",
			content: ".js-dropdown-content",
			overlaySelector: ".js-dropdown-overlay",
			closeButtonSelector: ".js-sheet-close",
		},
	},

	init() {
		this.scrollbarWidth = this.getScrollbarWidth();
		this.bindGlobalEvents();
		this.handleResize();
	},

	bindGlobalEvents() {
		$(window).on("resize", () => {
			this.handleResize();
		});

		$(document).on("keydown", (e) => {
			if (e.key === "Escape" && this.activeSheet) {
				this.close();
			}
		});
	},

	setupEventHandlers(overlaySelector, closeButtonSelector) {
		$(document).off("click", this.config.selectors.overlaySelector);
		$(document).off("click", this.config.selectors.closeButtonSelector);

		$(document).on("click", overlaySelector, (e) => {
			if ($(e.target).is(overlaySelector)) {
				e.preventDefault();
				e.stopPropagation();
				this.close();
			}
		});

		$(document).on("click", closeButtonSelector, (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.close();
		});
	},

	handleResize() {
		this.isMobile = window.innerWidth < 1024;

		if (this.activeSheet) {
			this.calculateContentHeight(this.activeSheet);
			this.setSheetHeight(
				this.activeSheet,
				this.activeSheet.data("default-height") || this.config.defaultHeight,
			);
		}
	},

	getScrollbarWidth() {
		const outer = document.createElement("div");
		outer.style.visibility = "hidden";
		outer.style.overflow = "scroll";
		outer.style.msOverflowStyle = "scrollbar";
		document.body.appendChild(outer);

		const inner = document.createElement("div");
		outer.appendChild(inner);

		const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
		outer.parentNode.removeChild(outer);
		return scrollbarWidth;
	},

	open(options) {
		const {
			event,
			modal,
			body = modal.find(this.config.selectors.body),
			content = modal.find(this.config.selectors.content),
			triggerHeight = 0,
			overlaySelector = this.config.selectors.overlaySelector,
			closeButtonSelector = this.config.selectors.closeButtonSelector,
		} = options;

		this.heightTrigger = triggerHeight;
		if (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
		this.setupEventHandlers(overlaySelector, closeButtonSelector);

		this.openSheet(modal, body, content);
	},

	close(e) {
		this.closeActiveSheet();
	},

	openSheet($sheetModal, $sheetBody, $sheetContent) {
		if (this.activeSheet) {
			this.closeActiveSheet();
		}

		if (typeof MobileMenu !== "undefined" && MobileMenu.isMobileMenuActive) {
			MobileMenu.closeMobileMenu();
		}

		this.activeSheet = $sheetModal;
		this.activeSheetBody = $sheetBody;
		this.activeSheetContent = $sheetContent;

		this.lockPageScroll();

		$sheetModal.removeClass("hidden");
		clearTimeout(this.showSheetTimeout);

		$sheetBody.css("height", "auto");
		this.calculateContentHeight($sheetModal, $sheetContent[0]);
		$sheetBody.css("height", "0");

		this.showSheetTimeout = setTimeout(() => {
			this.setSheetHeight(
				$sheetModal,
				$sheetBody,
				$sheetModal.data("default-height") || this.config.defaultHeight,
			);
			$sheetModal.addClass("show-sheet");
		}, this.config.showDelay);

		this.setupDragHandlers($sheetBody);
	},

	closeActiveSheet() {
		if (!this.activeSheet) return;

		const $sheetModal = this.activeSheet;
		const $sheetBody = this.activeSheetBody;

		this.setSheetHeight($sheetModal, $sheetBody, 0);
		$sheetModal.removeClass("show-sheet");

		this.unlockPageScroll();

		setTimeout(() => {
			$sheetModal.addClass("hidden");
			this.activeSheet = null;
			this.activeSheetBody = null;
			this.activeSheetContent = null;
		}, this.config.animationDuration);
	},

	lockPageScroll() {
		$("html").css("padding-right", `${this.scrollbarWidth}px`);
		$("html").addClass("overflow-hidden");
	},

	unlockPageScroll() {
		$("html").css("padding-right", "0");
		$("html").removeClass("overflow-hidden");
	},

	setSheetHeight($sheetModal, $sheetBody, value) {
		const height = Math.max(0, Math.min(this.config.maxHeight, value));
		const viewportHeight = window.innerHeight;
		const heightInPixels = (height * viewportHeight) / 100;

		$sheetBody.css("height", `${heightInPixels + this.heightTrigger}px`);
		$sheetModal.data("height", height);
	},

	calculateContentHeight($sheetModal, $sheetContent) {
		const contentHeight = $sheetContent.scrollHeight;
		const windowHeight = window.innerHeight;
		const heightPercent = Math.min(
			this.config.maxHeight,
			(contentHeight / windowHeight) * 100,
		);

		$sheetModal.data("height", heightPercent);
		$sheetModal.data("default-height", heightPercent);
	},

	setupDragHandlers($sheetBody) {
		$sheetBody.off("mousedown touchstart").on("mousedown touchstart", (e) => {
			this.handleDragStart(e);
		});

		$(window)
			.off("mousemove touchmove")
			.on("mousemove touchmove", (e) => {
				this.handleDragMove(e);
			});

		$(window)
			.off("mouseup touchend")
			.on("mouseup touchend", () => {
				this.handleDragEnd();
			});
	},

	handleDragStart(event) {
		if (!this.activeSheet) return;

		const $content = this.activeSheetContent;
		const contentScrollTop = $content.scrollTop();

		if (contentScrollTop > 0) {
			return;
		}

		this.isDragging = true;
		this.dragStartY = event.touches ? event.touches[0].pageY : event.pageY;

		this.activeSheetBody.addClass("not-selectable");
		$("body").css("cursor", "grabbing");
	},

	handleDragMove(event) {
		event.preventDefault();
		event.stopPropagation();
		if (!this.isDragging || !this.activeSheet) return;

		const $content = this.activeSheetContent;
		const currentY = event.touches ? event.touches[0].pageY : event.pageY;
		const deltaY = this.dragStartY - currentY;

		if (deltaY < 0 && $content.scrollTop() === 0) {
			this.hideContentScroll();
		}

		if (deltaY < 0 && $content.scrollTop() > 0) {
			return;
		}

		const viewportHeight = window.innerHeight;
		const deltaHeight = (deltaY / viewportHeight) * 100;

		const newHeight = Math.min(
			this.config.maxHeight,
			this.activeSheet.data("height") + deltaHeight,
		);
		this.setSheetHeight(this.activeSheet, this.activeSheetBody, newHeight);

		this.dragStartY = currentY;
	},

	handleDragEnd() {
		event.preventDefault();
		event.stopPropagation();
		if (!this.isDragging || !this.activeSheet) return;

		this.isDragging = false;
		const $sheetModal = this.activeSheet;

		this.activeSheetBody.removeClass("not-selectable");
		$("body").css("cursor", "");
		this.showContentScroll();

		if ($sheetModal.data("height") < this.sheetClosePercent) {
			this.close();
		} else {
			this.setSheetHeight(
				$sheetModal,
				this.activeSheetBody,
				$sheetModal.data("default-height") || this.config.defaultHeight,
			);
		}
	},

	hideContentScroll() {
		if (this.activeSheetContent) {
			this.activeSheetContent.addClass("overflow-y-hidden!");
		}
	},

	showContentScroll() {
		if (this.activeSheetContent) {
			this.activeSheetContent.removeClass("overflow-y-hidden!");
		}
	},

	openSubMenu(itemId) {
		if (!this.activeSheet) return;

		const $sheetModal = this.activeSheet;
		const $subMenu = $sheetModal.find(`[data-dropdown-sub="${itemId}"]`);

		if (!$subMenu.length) return;

		$sheetModal.find(".js-dropdown-primary-list").addClass("hidden");
		$subMenu.removeClass("hidden");

		clearTimeout(this.showSheetTimeout);
		this.showSheetTimeout = setTimeout(() => {
			this.calculateContentHeight($sheetModal, this.activeSheetContent[0]);
			this.setSheetHeight(
				$sheetModal,
				this.activeSheetBody,
				$sheetModal.data("default-height") || this.config.defaultHeight,
			);
		}, this.config.showDelay);
	},

	closeSubMenu() {
		if (!this.activeSheet) return;

		const $sheetModal = this.activeSheet;

		$sheetModal.find(".js-dropdown-sub-list").addClass("hidden");
		$sheetModal.find(".js-dropdown-primary-list").removeClass("hidden");

		clearTimeout(this.showSheetTimeout);
		this.showSheetTimeout = setTimeout(() => {
			this.calculateContentHeight($sheetModal, this.activeSheetContent[0]);
			this.setSheetHeight(
				$sheetModal,
				this.activeSheetBody,
				$sheetModal.data("default-height") || this.config.defaultHeight,
			);
		}, this.config.showDelay);
	},

	isActive() {
		return this.activeSheet !== null;
	},

	getActiveSheet() {
		return this.activeSheet;
	},
};

$(document).ready(() => {
	BottomSheet.init();

	$('[data-dialog="change-plan"]').on("click", (e) => {
		if (BottomSheet.isMobile) {
			const modal = $("#lightbox");
			const modalBody = modal.find(".edit-billing-details");
			const modalContent = modal.find(".modal-content");

			BottomSheet.open({
				event: e,
				modal: modal,
				body: modalBody,
				content: modalContent,
				overlaySelector: ".modal",
				closeButtonSelector: "[data-dialog-close]",
			});
		}
	});
});
