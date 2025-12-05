const Dropdown = {
	dropdownIdTimer: null,
	resizeTimer: null,
	wasMobile: window.innerWidth < 1024,
	dropdownWrappers: null,
	dropdownButtons: null,
	dropdownContents: null,
	subMenuItems: null,
	defaultDropdownButtonText: "",

	config: {
		animationDelay: 350,
		resizeDelay: 50,
	},

	init() {
		this.initSelectors();
		this.bootstrap();
		this.adjustElementPositionOnResize();
		this.initGridDropdown();
		this.initMobileGridDropdown();

		this.cleanupActiveDropdowns();
	},

	initSelectors() {
		this.dropdownWrappers = $(".dropdown-wrapper");
		this.dropdownButtons = $(".dropdown-button");
		this.dropdownContents = $(".js-dropdown");
		this.subMenuItems = $(".sub-menu-item");
	},

	bootstrap() {
		this.bindDropdownEvents();
		this.bindSubMenuEvents();
		this.bindDocumentEvents();
		// this.bindMobileEvents();
	},

	bindDropdownEvents() {
		this.dropdownContents.on("click", (e) => {
			e.preventDefault();
		});

		this.dropdownButtons.on("click.dropdown-buttons", (e) => {
			const $button = $(e.currentTarget);
			const dropdownId = $button.attr("data-id");
			if (window.innerWidth < 1024 && dropdownId === "dropdown-grid") {
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			const $wrapper = $button.closest(".dropdown-wrapper");

			const $sheetModal = $wrapper.find(
				`[data-sheet-modal][data-dropdown-id="${dropdownId}"]`,
			);
			const hasSheetModal = $sheetModal.length > 0;
			if (Helpers.isMobile() && hasSheetModal) {
				BottomSheetLite.open({
					event: e,
					modal: $sheetModal,
					triggerHeight: 25,
					overlayElement: $sheetModal.find(".js-dropdown-overlay"),
					closeButtonElement: $sheetModal.find(".js-sheet-close"),
					body: $sheetModal.find(".js-dropdown-body"),
					content: $sheetModal.find(".js-dropdown-content"),
					scrollBlockElement: $sheetModal.find(".js-dropdown-content"),
					type: "dropdown",
				});
			} else {
				this.handleDropdownClick(e);
			}
		});
	},

	bindSubMenuEvents() {
		this.subMenuItems.on("click", (e) => {
			const $item = $(e.currentTarget);

			const dropdownId = $item.closest(".js-dropdown").attr("data-dropdown-id");

			const $sheetModal = $item.closest(
				`[data-sheet-modal][data-dropdown-id="${dropdownId}"]`,
			);
			const hasSheetModal = $sheetModal.length > 0;

			if (Helpers.isMobile() && hasSheetModal) {
				BottomSheetLite.openSubMenu($item.attr("data-dropdown-sub-id"));
			} else {
				this.handleSubMenuItemClick(e);
			}
		});

		$(".js-dropdown-sub-list .go-back").on("click", (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			// BottomSheet.closeSubMenu();
		});
	},

	bindDocumentEvents() {
		$(document).on("click", (e) => {
			if (!Helpers.isMobile()) {
				this.handleDocumentClick(e);
			}
		});

		$(window).on("resize", () => {
			this.handleWindowResize();
		});
	},

	setTransformOrigin($content) {
		if (!$content || !$content.length || !$content[0]) {
			return;
		}
		const $wrapper = $content.closest(".dropdown-wrapper");
		const contentRect = $content[0].getBoundingClientRect();
		const wrapperRect = $wrapper[0].getBoundingClientRect();

		const relativeTop = contentRect.top - wrapperRect.top;
		const relativeBottom = wrapperRect.bottom - contentRect.bottom;

		let verticalOrigin = "center";
		if (relativeTop >= 0) {
			verticalOrigin = "top";
		} else if (relativeBottom >= 0) {
			verticalOrigin = "bottom";
		}

		$content.attr("data-transform-origin", `${verticalOrigin} center`);
	},

	handleDropdownClick(e) {
		e.preventDefault();
		clearTimeout(this.dropdownIdTimer);
		const $button = $(e.currentTarget);
		const dropdownId = $button.attr("data-id");

		const $wrapper = $button.closest(".dropdown-wrapper");
		const $content = $wrapper.find(
			`.js-dropdown[data-dropdown-id="${dropdownId}"]`,
		);
		const isDropdownSelect = $content.is("[data-dropdown-select]");
		if (!$wrapper.hasClass("dropdown-wrapper-selected") && isDropdownSelect) {
			this.defaultDropdownButtonText = $button.find("span").text();
		}
		console.log(this.defaultDropdownButtonText);

		if (isDropdownSelect) {
			$wrapper
				.find(".js-dropdown-list-selected li")
				.on("click.dropdown-select-item", (e) => {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					const $item = $(e.currentTarget);
					const $button = $wrapper.find(".dropdown-button");
					$wrapper.addClass("dropdown-wrapper-selected");
					$item.siblings().removeClass("selected");
					$item.addClass("selected");
					$button.find("span").text($item.find("span").text());
					this.closeAllDropdowns();
				});
			$wrapper
				.find(".dropdown-button-select-cancel")
				.on("click.dropdown-select-cancel", (e) => {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					$wrapper.removeClass("dropdown-wrapper-selected");
					$button.find("span").text(this.defaultDropdownButtonText);
					$wrapper.find(".js-dropdown-list li").removeClass("selected");
					this.closeAllDropdowns();
					$wrapper
						.find(".js-dropdown-list li")
						.off("click.dropdown-select-item");
					$(this).off("click.dropdown-select-cancel");
				});
		}

		if (!$button.hasClass("active")) {
			clearTimeout(this.dropdownIdCloseAllTimer);
			clearTimeout(this.dropdownIdCloseTimer);

			this.closeAllDropdowns();

			$button.addClass("active");
			$wrapper.addClass("active");
			$content.removeClass(
				"hidden dropdown-animate-hide dropdown-animate-show",
			);
			this.adjustElementPosition($content);

			this.dropdownIdTimer = setTimeout(() => {
				$content.addClass("active");
				$content.addClass("dropdown-animate-show");
				this.setTransformOrigin($content);
			}, 1);
		} else {
			this.closeDropdown($button, $wrapper, $content);
		}
	},

	handleSubMenuItemClick(e) {
		e.preventDefault();
		const $item = $(e.currentTarget);
		const $content = $item.find(".js-dropdown-sub-list");

		this.dropdownWrappers = $(".dropdown-wrapper");
		this.dropdownButtons = $(".dropdown-button");
		this.dropdownContents = $(".js-dropdown");
		this.subMenuItems = $(".sub-menu-item");

		this.subMenuItems.not($item).removeClass("active");
		this.subMenuItems
			.not($item)
			.find(".js-dropdown-sub-list")
			.addClass("hidden");

		if (!$item.hasClass("active")) {
			$item.addClass("active");
			$content.removeClass("hidden");
			this.adjustElementPosition($content);
		} else {
			$item.removeClass("active");
			$content.addClass("hidden");
		}
	},

	handleDocumentClick(e) {
		const $dropdown = $(e.target).closest(".dropdown-wrapper");

		if (!$dropdown.length) {
			this.closeAllDropdowns();
		}
	},

	handleWindowResize() {
		const isMobile = window.innerWidth < 1024;
		const wasMobile = this.wasMobile;

		if (isMobile && !wasMobile) {
			this.closeAllDropdowns(true);
		} else if (!isMobile && wasMobile) {
			BottomSheetLite.closeAll(true);
		}
		this.wasMobile = isMobile;
	},

	cleanupActiveDropdowns() {
		clearTimeout(this.dropdownIdCloseAllTimer);
		clearTimeout(this.dropdownIdCloseTimer);

		const $activeDropdown = this.dropdownContents.filter(".active");
		const $activeButton = this.dropdownButtons.filter(".active");
		const $activeWrapper = this.dropdownWrappers.filter(".active");
		const $activeSubMenu = this.subMenuItems.filter(".active");
		const $activeSubList = $(".js-dropdown-sub-list.active");

		if ($activeDropdown.length > 0) {
			$activeDropdown
				.removeClass("active dropdown-animate-show dropdown-animate-hide")
				.addClass("hidden");
			$activeButton.removeClass("active");
			$activeWrapper.removeClass("active");
			$activeSubMenu.removeClass("active");
			$activeSubList.removeClass("active").addClass("hidden");
		}
	},

	closeAllDropdowns(immediate = false) {
		clearTimeout(this.dropdownIdCloseAllTimer);
		clearTimeout(this.dropdownIdCloseTimer);

		const $activeDropdown = $(".js-dropdown.active");
		const $activeButton = $(".dropdown-button.active");
		const $activeWrapper = $(".dropdown-wrapper.active");
		const $activeSubMenu = $(".sub-menu-item.active");
		const $activeSubList = $(".js-dropdown-sub-list.active");
		this.detachScrollListeners();

		if ($activeDropdown.length === 0) {
			return;
		}

		$activeDropdown.removeClass("active dropdown-animate-show");
		$activeButton.removeClass("active");
		$activeWrapper.removeClass("active");
		$activeSubMenu.removeClass("active");
		$activeSubList.removeClass("active").addClass("hidden");

		$activeDropdown.addClass("dropdown-animate-hide");

		$(".js-dropdown-sub-list").addClass("hidden");

		if (immediate) {
			$activeDropdown.removeClass("dropdown-animate-hide").addClass("hidden");
		} else {
			this.dropdownIdCloseAllTimer = setTimeout(() => {
				const $stillClosing = $(".js-dropdown.dropdown-animate-hide");
				$stillClosing.removeClass("dropdown-animate-hide").addClass("hidden");
			}, this.config.animationDelay);
		}
	},

	closeDropdown($button, $wrapper, $content) {
		clearTimeout(this.dropdownIdCloseAllTimer);
		clearTimeout(this.dropdownIdCloseTimer);

		$button.removeClass("active");
		$wrapper.removeClass("active");
		this.detachScrollListeners();
		$content.removeClass("dropdown-animate-show");
		$content.addClass("dropdown-animate-hide");

		this.dropdownIdCloseTimer = setTimeout(() => {
			$content.removeClass("dropdown-fixed");
			if ($content.hasClass("dropdown-animate-hide")) {
				$content.removeClass("active dropdown-animate-hide").addClass("hidden");
			}
		}, this.config.animationDelay);
	},

	adjustElementPosition($element) {
		if (!$element || !$element.length) {
			return;
		}

		const hasOverflowVisible =
			$element.attr("data-overflow-visible") !== undefined;
		const needsFixedPosition =
			hasOverflowVisible && this.isInsideOverflowHidden($element);

		if (needsFixedPosition && !Helpers.isMobile()) {
			$element.addClass("dropdown-fixed");
			this.attachScrollListeners($element);
			this.calculateFixedPosition($element);
			return;
		} else {
			$element.removeClass("dropdown-fixed");
			this.detachScrollListeners();
		}

		const hasSubContent =
			$element.closest(".sub-menu-item").children(".js-dropdown-sub-list")
				.length > 0;
		if (
			$element.attr("data-dropdown-id") === "dropdown-settings" ||
			hasSubContent
		) {
			$element.css({
				top: "10px",
				left: "100%",
				right: "auto",
			});
		}

		const rect = $element[0].getBoundingClientRect();
		const viewportHeight = $(window).height();
		const viewportWidth = $(window).width();

		if (rect.bottom > viewportHeight) {
			const overflowBottom = rect.bottom - viewportHeight;
			const newTop = parseInt($element.css("top")) - overflowBottom - 20;
			$element.css("top", newTop + "px");
		}

		if (
			rect.right > viewportWidth &&
			($element.attr("data-dropdown-id") === "dropdown-settings" ||
				hasSubContent)
		) {
			$element.addClass("adjust-position-right").css({
				left: "auto",
				right: "100%",
			});
		}
	},

	isInsideOverflowHidden($element) {
		let $parent = $element.parent();
		while ($parent.length && !$parent.is("body")) {
			const overflow = $parent.css("overflow");
			if (
				overflow === "hidden" ||
				overflow === "scroll" ||
				overflow === "auto"
			) {
				return true;
			}
			$parent = $parent.parent();
		}
		return false;
	},

	calculateFixedPosition($element) {
		const $trigger = $element
			.closest(".dropdown-wrapper")
			.find(".dropdown-button");
		const triggerRect = $trigger[0].getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const viewportWidth = window.innerWidth;
		const offset = 10;

		let dropdownHeight = $element[0].offsetHeight || $element[0].scrollHeight;
		let dropdownWidth = $element[0].offsetWidth || $element[0].scrollWidth;

		let top, left, right;

		if (triggerRect.bottom + offset + dropdownHeight > viewportHeight) {
			top = triggerRect.top - dropdownHeight - offset;
		} else {
			top = triggerRect.bottom + offset;
		}

		const hasRightClass = Array.from($element[0].classList).some((cls) =>
			cls.startsWith("right-"),
		);

		const hasPositionXParent =
			$element.attr("data-position-x-parent") !== undefined;

		if (hasPositionXParent) {
			const parentWrapper = $element.closest(".dropdown-parent-wrapper");
			if (parentWrapper.length) {
				const parentRect = parentWrapper[0].getBoundingClientRect();
				const parentCenter =
					parentRect.left +
					parentRect.width +
					(dropdownWidth - parentRect.width) / 2;
				left = parentCenter - dropdownWidth / 2 + "px";
				right = "auto";
			} else {
				if (hasRightClass) {
					left = "auto";
					right = viewportWidth - triggerRect.right + "px";
				} else {
					left = triggerRect.left + "px";
					right = "auto";
				}
			}
		} else {
			if (hasRightClass) {
				left = "auto";
				right = viewportWidth - triggerRect.right + "px";
			} else {
				left = triggerRect.left + "px";
				right = "auto";
			}
		}

		$element.css({
			top: top + "px",
			left: left,
			right: right,
		});

		if (!hasPositionXParent) {
			const dropdownRect = $element[0].getBoundingClientRect();

			const overflowTop = dropdownRect.top < 0 ? Math.abs(dropdownRect.top) : 0;
			const overflowBottom =
				dropdownRect.bottom > viewportHeight
					? dropdownRect.bottom - viewportHeight
					: 0;
			const overflowLeft =
				dropdownRect.left < 0 ? Math.abs(dropdownRect.left) : 0;
			const overflowRight =
				dropdownRect.right > viewportWidth
					? dropdownRect.right - viewportWidth
					: 0;

			if (overflowTop || overflowBottom || overflowLeft || overflowRight) {
				$element.css("transform", "none");

				dropdownHeight = $element[0].offsetHeight || $element[0].scrollHeight;
				dropdownWidth = $element[0].offsetWidth || $element[0].scrollWidth;

				if (overflowTop) {
					top = offset + overflowTop;
				} else if (overflowBottom) {
					top = triggerRect.bottom - offset - overflowBottom;
				}

				if (hasRightClass) {
					if (overflowLeft) {
						right =
							viewportWidth - dropdownWidth - offset - overflowLeft + "px";
					} else if (overflowRight) {
						right =
							triggerRect.right - viewportWidth + offset + overflowRight + "px";
					}
				} else {
					if (overflowRight) {
						left = triggerRect.left - offset - overflowRight + "px";
					} else if (overflowLeft) {
						left = offset + overflowLeft + "px";
					}
				}
			}
		}

		$element.css({
			top: top + "px",
			left: left,
			right: right,
		});
	},

	adjustElementPositionOnResize() {
		$(window).on("resize", () => {
			clearTimeout(this.resizeTimer);
			this.resizeTimer = setTimeout(() => {
				const $activeDropdown = this.dropdownContents.filter(".active");
				if ($activeDropdown.length) {
					if ($activeDropdown.hasClass("dropdown-fixed")) {
						this.calculateFixedPosition($activeDropdown);
					} else {
						this.adjustElementPosition($activeDropdown);
					}
				}
			}, this.config.resizeDelay);
		});

		$(window).on("scroll", () => {
			const $activeDropdown = this.dropdownContents.filter(
				".active.dropdown-fixed",
			);
			if ($activeDropdown.length) {
				this.calculateFixedPosition($activeDropdown);
			}
		});
	},

	initGridDropdown() {
		$("[data-dropdown-id='dropdown-grid'] a").on("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			const $button = $(e.currentTarget)
				.closest(".dropdown-wrapper")
				.find(".dropdown-button");
			const $content = $(e.currentTarget).closest(".js-dropdown");
			const $svg = $(e.currentTarget).find("svg");

			$button.find("svg").replaceWith($svg.clone());
			this.closeDropdown(
				$button,
				$button.closest(".dropdown-wrapper"),
				$content,
			);

			const contentType = $(e.currentTarget).attr("data-link-type");
			this.updateContentType(contentType);
		});
	},

	updateContentType(contentType) {
		const $contentTypeElements = $(`[data-content-type]`);
		const $dashboardContainer = $(".dashboard-container");
		switch (contentType) {
			case "list":
				$contentTypeElements.addClass("list-type").removeClass("grid-type");
				$dashboardContainer.addClass("list-type").removeClass("grid-type");
				break;
			case "grid":
				$contentTypeElements.addClass("grid-type").removeClass("list-type");
				$dashboardContainer.addClass("grid-type").removeClass("list-type");
				break;
			default:
				$contentTypeElements.removeClass("list-type grid-type");
				$dashboardContainer.removeClass("list-type grid-type");
				break;
		}
	},

	initMobileGridDropdown() {
		$('[data-id="dropdown-grid"]').on("click", (e) => {
			if (window.innerWidth < 1024) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				const $button = $(e.currentTarget)
					.closest(".dropdown-wrapper")
					.find(".dropdown-button");
				const svgTypeList = `<svg class="icon icon-md text-blue-500">
					<use href="#icon-list"></use>
				</svg>`;
				const svgTypeGrid = `<svg class="icon icon-md">
					<use href="#icon-large-grid"></use>
				</svg>`;

				$(e.currentTarget).toggleClass("active-mobile");
				if (!$(e.currentTarget).hasClass("active-mobile")) {
					$button.find("svg").replaceWith(svgTypeGrid);
					this.updateContentType();
				} else {
					$button.find("svg").replaceWith(svgTypeList);
					this.updateContentType("list");
				}
			}
		});
	},

	scrollableParents: [],
	scrollHandlers: [],

	attachScrollListeners($element) {
		this.detachScrollListeners();
		this.scrollableParents = [];
		this.scrollHandlers = [];

		let parent = $element.parent();
		while (parent.length && !parent.is("body")) {
			const overflow = parent.css("overflow");
			if (
				overflow === "auto" ||
				overflow === "scroll" ||
				overflow === "hidden"
			) {
				this.scrollableParents.push(parent[0]);
			}
			parent = parent.parent();
		}

		const self = this;
		this.scrollableParents.forEach(function (el) {
			const handler = function () {
				self.calculateFixedPosition($(".js-dropdown.active.dropdown-fixed"));
			};
			el.addEventListener("scroll", handler, { passive: true });
			self.scrollHandlers.push({ el, handler });
		});
	},

	detachScrollListeners() {
		if (this.scrollHandlers && this.scrollHandlers.length) {
			this.scrollHandlers.forEach(function (obj) {
				obj.el.removeEventListener("scroll", obj.handler);
			});
		}
		this.scrollableParents = [];
		this.scrollHandlers = [];
	},
};

$(document).ready(() => {
	Dropdown.init();
});
