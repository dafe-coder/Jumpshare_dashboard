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
		this.initTranscriptSearch();
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
		const tabItems = $("[data-tab-inside]");
		const goBackBtn = $("[data-tab-inside-go-back]");
		console.log(tabItems);

		self.currentTab = self.getCurrentActiveTab();

		goBackBtn.on("click", function (e) {
			e.preventDefault();
			self.goBackTab();
		});

		tabItems.on("click", function (e) {
			e.preventDefault();
			const targetTab = e.currentTarget;
			const tabInside = targetTab.getAttribute("data-tab-inside");
			console.log(tabInside);

			self.saveTabState();

			self.switchTab(tabInside);
			if (tabInside === "lead-capture") {
				$(".file-viewer-lead-capture").removeClass("hidden");
			} else if (tabInside === "analytics-tab") {
				Dropdown.closeAllDropdowns();
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
		const smilePicker = $("#file-viewer-smiles-picker");

		const replyBlock = `<li
								class="border border-blue-500 rounded-xl flex flex-col gap-4 px-3 pt-4 pb-3.5 mx-3 relative"
							>
								<textarea
									name="reply-comment"
									id="reply-comment"
									class="w-full outline-none border-none text-sm text-dark-800 placeholder:text-gray-900 resize-none mx-2"
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
											class="btn btn-transparent-with-border h-7.5 px-3.5 comment-reply-cancel-btn"
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
			smilePicker.toggleClass("hidden");
			commentDrawButton.toggleClass("active");
			$("#file-viewer-draw-tools").toggleClass("hidden");
		});

		$("#file-viewer-draw-tools-cancel-button").on("click", function () {
			$("#file-viewer-draw-tools").addClass("hidden");
			commentDrawButton.removeClass("active");
			smilePicker.removeClass("hidden");
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
	initTranscriptSearch: function () {
		const transcriptSearchButton = $(".transcript-search-button");
		const transcriptHeaderSearch = $("#transcript-header-search");
		const transcriptHeader = $("#transcript-header");
		const transcriptHeaderAll = $(".transcript-header");
		const transcriptSearchCancelButton = $("#transcript-search-cancel-button");
		const transcriptSearchResultsNav = $("#transcript-search-results-nav");
		const transcriptUpgradePlan = $("#transcript-upgrade-plan");
		const transcriptHeaderTitle = $("#transcript-header-title");
		const transcriptEditButton = $("#transcript-edit-button");
		const transcriptLangHeader = $("#transcript-lang-header");
		const transcriptLangButton = $("#transcript-lang-button");
		const transcriptMainContent = $("#transcript-main-content");
		const transcriptHeaderGoBackButton = $("[data-transcript-header-go-back]");

		transcriptHeaderGoBackButton.on("click", function () {
			transcriptHeaderAll.addClass("hidden");
			transcriptHeader.removeClass("hidden");
			transcriptMainContent.removeClass("can-edit");
		});

		transcriptEditButton.on("click", function () {
			transcriptHeaderAll.addClass("hidden");
			transcriptMainContent.addClass("can-edit");
			$("#transcript-edit-header").removeClass("hidden");
		});

		transcriptMainContent.find("span").on("click", function (e) {
			if (!transcriptMainContent.hasClass("can-edit")) return;
			const $this = $(this);
			$this.addClass("dropdown-button");
			$this.wrap("<span class='dropdown-wrapper'></span>");
			$this.attr("data-id", "transcript-correct-word-dropdown");
			const $dropdown = `
			<div class="js-dropdown w-[333px] left-1/2 -translate-x-1/2 hidden shadow-[0px_4px_12px_rgba(0,0,0,0.1)] rounded-xl"
				data-dropdown-id="transcript-correct-word-dropdown"
				data-sheet-modal
				data-overflow-visible
				>
				<div class="js-dropdown-overlay"></div>
				<div class="js-dropdown-body">
					<div class="js-dropdown-trigger">
						<span></span>
					</div>
					<div class="js-dropdown-content [&_p]:text-dark-800 [&_span]:text-dark-800 p-4 pr-[19px] cursor-default">
						<p class="text-xs font-medium">Correct</p>
						<button class="btn absolute top-2 right-2 size-6 text-dark-800 p-0 hover:bg-gray-200 rounded-md" type="button" data-close-dropdown-button>
							<svg class="icon icon-s">
								<use href="#icon-close"></use>
							</svg>
						</button>
						<input class="form-control-settings mt-3 w-full h-9 rounded-sm px-3" type="text" placeholder="Type your correction" value="${$this.text()}">
						<div class="flex items-center mt-4">
							<button type="button" class="btn px-2 text-dark-800 text-[13px] -ml-2">
								<svg class="icon icon-sm">
									<use href="#icon-trash"></use>
								</svg>
								<span>Delete word</span>
							</button>
							<div class="flex items-center gap-1.5 ml-auto">
								<button type="button" class="btn btn-border-default text-dark-800 text-[13px]">Correct All</button>
								<button type="button" class="btn btn-primary text-[13px]">Correct</button>
							</div>
						</div>
					</div>
				</div>
			`;
			if (!$this.find(".js-dropdown").length) {
				$this.parent(".dropdown-wrapper").append($dropdown);
			}

			Dropdown.handleDropdownClick(e);

			$("[data-close-dropdown-button]").on("click", function () {
				Dropdown.closeDropdown(
					$(this),
					$(this).closest(".dropdown-wrapper"),
					$(this).closest(".js-dropdown"),
				);
				$this.removeClass("active");
			});
		});

		transcriptLangButton.on("click", function () {
			transcriptHeaderAll.addClass("hidden");
			transcriptLangHeader.removeClass("hidden");
		});

		transcriptSearchButton.on("click", function () {
			transcriptHeaderAll.addClass("hidden");
			transcriptHeaderSearch.removeClass("hidden");
			transcriptHeaderSearch.find("input").focus();
		});
		transcriptSearchCancelButton.on("click", function () {
			transcriptHeader.removeClass("hidden");
			transcriptHeaderSearch.addClass("hidden");
		});

		transcriptHeaderSearch.find("input").on("input", function () {
			const inputValue = $(this).val();
			if (inputValue.length > 0) {
				transcriptSearchResultsNav.removeClass("hidden");
			} else {
				transcriptSearchResultsNav.addClass("hidden");
			}
		});

		// TODO: Delete this after the transcript feature is implemented (This indicates to activate the plan)
		transcriptHeaderTitle.on("click", function () {
			transcriptUpgradePlan.toggleClass("hidden");
			$("#transcript-main-content").toggleClass("hidden");
		});
	},
};

$(document).ready(() => {
	fileViewer.init();
});
