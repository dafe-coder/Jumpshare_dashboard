const Dropdown = {
	dropdownIdTimer: null,
	resizeTimer: null,
	isMobile: window.innerWidth < 1024,

	dropdownWrappers: null,
	dropdownButtons: null,
	dropdownContents: null,
	subMenuItems: null,

	config: {
		animationDelay: 150,
		resizeDelay: 50,
	},

	init() {
		this.initElements();
		this.bootstrap();
		this.adjustElementPositionOnResize();
		this.initGridDropdown();
		this.initMobileGridDropdown();
	},

	initElements() {
		this.dropdownWrappers = $(".dropdown-wrapper");
		this.dropdownButtons = $(".dropdown-button");
		this.dropdownContents = $(".js-dropdown");
		this.subMenuItems = $(".sub-menu-item");
	},

	bootstrap() {
		this.bindDropdownEvents();
		this.bindSubMenuEvents();
		this.bindDocumentEvents();
		this.bindMobileEvents();
	},

	bindDropdownEvents() {
		this.dropdownContents.on("click", (e) => {
			e.preventDefault();
		});

		this.dropdownButtons.on("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			const $button = $(e.currentTarget);
			const dropdownId = $button.attr("data-id");
			const $wrapper = $button.closest(".dropdown-wrapper");

			const $sheetModal = $wrapper.find(
				`[data-sheet-modal][data-dropdown-id="${dropdownId}"]`,
			);
			const hasSheetModal = $sheetModal.length > 0;
			if (this.isMobile && hasSheetModal) {
				BottomSheet.open({
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
			const $wrapper = $item.closest(".dropdown-wrapper");
			const dropdownId = $item.closest(".js-dropdown").attr("data-dropdown-id");

			const $sheetModal = $wrapper.find(
				`[data-sheet-modal][data-dropdown-id="${dropdownId}"]`,
			);
			const hasSheetModal = $sheetModal.length > 0;

			if (this.isMobile && hasSheetModal) {
				const itemId = $item.data("sheet-item-id");
				if (itemId) {
					BottomSheet.openSubMenu(itemId);
				}
			} else {
				this.handleSubMenuItemClick(e);
			}
		});

		$(".js-dropdown-sub-list .go-back").on("click", (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			BottomSheet.closeSubMenu();
		});
	},

	bindDocumentEvents() {
		$(document).on("click", (e) => {
			if (!BottomSheet.isMobile) {
				this.handleDocumentClick(e);
			}
		});

		$(window).on("resize", () => {
			this.handleWindowResize();
		});
	},

	bindMobileEvents() {
		if (BottomSheet.isMobile) {
			$(".js-dropdown-overlay").on("click", () => {
				BottomSheet.close();
			});
		}
	},

	setTransformOrigin($content) {
		const $wrapper = $content.closest(".dropdown-wrapper");
		const contentRect = $content[0].getBoundingClientRect();
		const wrapperRect = $wrapper[0].getBoundingClientRect();

		const relativeLeft = contentRect.left - wrapperRect.left;
		const relativeTop = contentRect.top - wrapperRect.top;
		const relativeRight = wrapperRect.right - contentRect.right;
		const relativeBottom = wrapperRect.bottom - contentRect.bottom;
		console.log({
			relativeLeft,
			relativeTop,
			relativeRight,
			relativeBottom,
		});

		let horizontalOrigin = "center";
		if (relativeLeft >= 0) {
			horizontalOrigin = "left";
		} else if (relativeRight >= 0) {
			horizontalOrigin = "right";
		}

		let verticalOrigin = "center";
		if (relativeTop >= 0) {
			verticalOrigin = "top";
		} else if (relativeBottom >= 0) {
			verticalOrigin = "bottom";
		}

		$content.attr(
			"data-transform-origin",
			`${verticalOrigin} ${horizontalOrigin}`,
		);
	},

	handleDropdownClick(e) {
		e.preventDefault();
		const $button = $(e.currentTarget);
		const dropdownId = $button.attr("data-id");

		const $wrapper = $button.closest(".dropdown-wrapper");
		const $content = $wrapper.find(
			`.js-dropdown[data-dropdown-id="${dropdownId}"]`,
		);

		if (!$button.hasClass("active")) {
			this.closeAllDropdowns();

			$button.addClass("active");
			$wrapper.addClass("active");
			$content.removeClass("hidden");

			$content.css("scale", "1");
			this.adjustElementPosition($content);
			$content.css("scale", "0.95");
			clearTimeout(this.dropdownIdTimer);
			this.dropdownIdTimer = setTimeout(() => {
				$content.addClass("active");
				this.setTransformOrigin($content);
				$content.addClass("dropdown-animate");
			}, 1);
		} else {
			this.closeDropdown($button, $wrapper, $content);
		}
	},

	handleSubMenuItemClick(e) {
		e.preventDefault();
		const $item = $(e.currentTarget);
		const $content = $item.find(".js-dropdown-sub-list");

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
		this.isMobile = window.innerWidth < 1024;

		if (this.isMobile) {
			this.closeAllDropdowns();
		} else {
			BottomSheet.close();
		}
	},

	closeAllDropdowns() {
		this.dropdownContents.removeClass("active dropdown-animate");
		this.dropdownButtons.removeClass("active");
		this.dropdownWrappers.removeClass("active");
		this.subMenuItems.removeClass("active");
		$(".js-dropdown-sub-list").removeClass("active").addClass("hidden");

		this.detachScrollListeners();

		clearTimeout(this.dropdownIdTimer);

		this.dropdownIdTimer = setTimeout(() => {
			this.dropdownContents.removeClass("dropdown-fixed");
			this.dropdownContents.addClass("hidden");
		}, this.config.animationDelay);
	},

	closeDropdown($button, $wrapper, $content) {
		$button.removeClass("active");
		$wrapper.removeClass("active");
		this.detachScrollListeners();
		$content.removeClass("dropdown-animate");

		clearTimeout(this.dropdownIdTimer);
		this.dropdownIdTimer = setTimeout(() => {
			$content.removeClass("dropdown-fixed");
			$content.removeAttr("data-transform-origin");
			$content.removeClass("active").addClass("hidden");
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

		if (needsFixedPosition && !BottomSheet.isMobile) {
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
		const dropdownRect = $element[0].getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const viewportWidth = window.innerWidth;

		let top, left, right;

		if (triggerRect.bottom + 10 + dropdownRect.height > viewportHeight) {
			top = triggerRect.top - dropdownRect.height - 10;
		} else {
			top = triggerRect.bottom + 10;
		}

		const hasRightClass = Array.from($element[0].classList).some((cls) =>
			cls.startsWith("right-"),
		);
		if (hasRightClass) {
			left = "auto";
			right = viewportWidth - triggerRect.right + "px";
		} else {
			left = triggerRect.left + "px";
			right = "auto";
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
		switch (contentType) {
			case "list":
				$contentTypeElements.addClass("list-type").removeClass("grid-type");
				break;
			case "grid":
				$contentTypeElements.addClass("grid-type").removeClass("list-type");
				break;
			default:
				$contentTypeElements.removeClass("list-type grid-type");
				break;
		}
	},

	initMobileGridDropdown() {
		$('[data-id="dropdown-grid"]').on("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();

			if (window.innerWidth < 1024) {
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
				self.calculateFixedPosition(
					self.dropdownContents.filter(".active.dropdown-fixed"),
				);
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
