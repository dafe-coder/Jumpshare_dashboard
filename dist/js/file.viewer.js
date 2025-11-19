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
	isReplyMode: false,
	init: function () {
		this.sidebar = $("#file-viewer-sidebar");
		this.resizeHandle = $("#file-viewer-resize-handle-sidebar");
		this.wrapper = $(".file-viewer-wrapper");
		this.scrollableContent = this.sidebar.find(".overflow-y-auto");
		this.initResizeHandle();
		this.initScrollObserver();
		this.checkSidebarScroll();
		this.initContentTab();
		this.initLeadCapture();
		this.initCommentNavigation();
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
	goBackTab: function () {
		if (this.tabHistory.length > 0) {
			const previousTab = this.tabHistory.pop();
			if (previousTab) {
				this.switchTab(previousTab);
				if (previousTab === "lead-capture") {
					$(".file-viewer-lead-capture").removeClass("hidden");
				} else {
					$(".file-viewer-lead-capture").addClass("hidden");
				}
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
			self.goBackTab();
		});

		tabItems.on("click", function (e) {
			e.preventDefault();
			const targetTab = e.currentTarget;
			const tabInside = targetTab.getAttribute("data-tab-inside");

			self.saveTabState();

			self.switchTab(tabInside);
			if (tabInside === "lead-capture") {
				$(".file-viewer-lead-capture").removeClass("hidden");
			} else {
				$(".file-viewer-lead-capture").addClass("hidden");
			}
			self.checkSidebarScroll();
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
	initLeadCapture: function () {
		const showSkipButtonInput = $("#allow-viewer-to-skip");
		showSkipButtonInput.on("change", function () {
			if (showSkipButtonInput.is(":checked")) {
				$(".file-viewer-lead-capture-skip-button").removeClass("hidden");
			} else {
				$(".file-viewer-lead-capture-skip-button").addClass("hidden");
			}
		});

		const formTitle = $(".file-viewer-lead-capture-title");
		const formTitleInput = $("#file-viewer-lead-capture-title-input");
		formTitleInput.on("input", function () {
			const title = formTitleInput.val();
			if (title) {
				formTitle.text(title);
			}
		});

		const formDescription = $(".file-viewer-lead-capture-description");
		const formDescriptionInput = $(
			"#file-viewer-lead-capture-description-input",
		);
		formDescriptionInput.on("input", function () {
			const description = formDescriptionInput.val();
			if (description) {
				formDescription.text(description);
			}
		});

		const formButtonText = $("#file-viewer-lead-capture-button-submit");
		const formButtonTextInput = $(
			"#file-viewer-lead-capture-button-text-input",
		);
		formButtonTextInput.on("input", function () {
			const buttonText = formButtonTextInput.val();
			if (buttonText) {
				formButtonText.text(buttonText);
			}
		});
	},
	initCommentNavigation: function () {
		const commentDrawButton = $("#comment-draw-button");
		const commentBox = $(".comment-box");
		const commentTextarea = $("#comment-textarea");
		const commentCancelButton = $("#comment-cancel-button");
		const commentReplyBtn = $(".comment-reply-btn");
		const replyBlock = `<li
								class="border border-blue-500 rounded-xl flex flex-col gap-4 px-3 pt-4 pb-3.5 mx-3 relative"
							>
								<textarea
									name="reply-comment"
									id="reply-comment"
									class="w-full outline-none border-none text-sm text-gray-900 placeholder:text-gray-900 resize-none mx-2"
									rows="1"
									placeholder="Leave a reply"
								></textarea>
								<div class="flex justify-between gap-2">
									<button
										aria-label="Choose Smile"
										type="button"
										class="btn btn-white hover:bg-gray-200 p-0 size-8"
									>
										<svg class="icon size-4">
											<use href="#icon-smile"></use>
										</svg>
									</button>
									<div class="flex items-center gap-2">
										<button
											type="button"
											class="btn btn-transparent h-7.5 px-3.5 comment-reply-cancel-btn"
										>
											Cancel
										</button>
										<button
											type="button"
											class="btn btn-primary h-7.5 px-3.5"
										>
											Reply
										</button>
									</div>
								</div>
							</li>`;

		commentDrawButton.on("click", function () {
			commentDrawButton.toggleClass("active");
			commentBox.toggleClass("active-comment-draw-tools");
		});

		commentTextarea.on("input", function () {
			const textareaValue = commentTextarea.val();
			if (textareaValue.length > 0) {
				commentBox.addClass("active-comment-box");
			} else {
				commentBox.removeClass("active-comment-box");
			}
		});

		commentCancelButton.on("click", function () {
			commentBox.removeClass("active-comment-box");
			commentBox.removeClass("active-comment-draw-tools");
			commentDrawButton.removeClass("active");
			commentTextarea.val("");
		});

		commentReplyBtn.on("click", function (e) {
			$(this).addClass("hidden");
			const currentComment = $(this).closest("li");
			currentComment.after(replyBlock);
		});

		$(document).on("click", ".comment-reply-cancel-btn", function (e) {
			const replyBlockElement = $(this).closest("li");
			const currentComment = replyBlockElement.prev("li");
			const replyBtn = currentComment.find(".comment-reply-btn");
			replyBtn.removeClass("hidden");
			replyBlockElement.remove();
		});
	},
};

$(document).ready(() => {
	fileViewer.init();
});
