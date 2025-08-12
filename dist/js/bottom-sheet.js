const BottomSheet = {
	isMobile: window.innerWidth < 1024,
	isDragging: false,
	dragStartY: 0,
	activeDragInstance: null,
	showSheetTimeout: null,
	sheetClosePercent: 45,
	heightTrigger: 0,
	scrollbarWidth: 0,
	instanceCounter: 0,
	state: {
		dropdownStack: [],
		dialogStack: [],
	},
	lockCount: 0,
	DEBUG: true,
	log(...args) {
		if (this.DEBUG) console.log("[BottomSheet]", ...args);
	},

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

	getStack(type) {
		return type === "dialog"
			? this.state.dialogStack
			: this.state.dropdownStack;
	},
	getTop(type) {
		const s = this.getStack(type);
		return s.length ? s[s.length - 1] : null;
	},
	getInstanceById(type, instanceId) {
		const s = this.getStack(type);
		return s.find((i) => i.id === instanceId) || null;
	},
	lockPageScroll() {
		if (!this.lockCount) {
			$("html").css("padding-right", `${this.scrollbarWidth}px`);
			$("html").addClass("overflow-hidden");
		}
		this.lockCount += 1;
	},
	unlockPageScroll() {
		this.lockCount = Math.max(0, this.lockCount - 1);
		if (!this.lockCount) {
			$("html").css("padding-right", "0");
			$("html").removeClass("overflow-hidden");
		}
	},

	init() {
		this.scrollbarWidth = this.getScrollbarWidth();
		this.bindGlobalEvents();
		this.handleResize();
		this.log("init", {
			isMobile: this.isMobile,
			scrollbarWidth: this.scrollbarWidth,
		});
	},

	bindGlobalEvents() {
		this.log("bindGlobalEvents");
		$(window).on("resize", () => {
			this.handleResize();
		});

		$(document).on("keydown", (e) => {
			if (e.key === "Escape" && this.activeSheet) {
				this.close();
			}
		});
	},

	setupEventHandlers(overlayElement, closeButtonElement, type, instanceId) {
		this.log("setupEventHandlers", {
			overlayLen: overlayElement && overlayElement.length,
			closeBtnLen: closeButtonElement && closeButtonElement.length,
		});
		if (overlayElement && overlayElement.length) {
			overlayElement
				.off(`click.bottomSheet-${type}-${instanceId}`)
				.on(`click.bottomSheet-${type}-${instanceId}`, (e) => {
					this.log("overlay click");
					if (e.target === e.currentTarget) {
						e.preventDefault();
						e.stopPropagation();
						this.close(type, instanceId);
					}
				});
		}

		if (closeButtonElement && closeButtonElement.length) {
			closeButtonElement
				.off(`click.bottomSheet-${type}-${instanceId}`)
				.on(`click.bottomSheet-${type}-${instanceId}`, (e) => {
					this.log("close button click");
					e.preventDefault();
					e.stopPropagation();
					this.close(type, instanceId);
				});
		}
	},

	handleResize() {
		this.isMobile = window.innerWidth < 1024;
		["dropdown", "dialog"].forEach((type) => {
			const top = this.getTop(type);
			if (top) {
				this.calculateContentHeight(top.modal, top.content[0]);
				this.setSheetHeight(
					top.modal,
					top.body,
					top.modal.data("default-height") || this.config.defaultHeight,
					top.heightTrigger || 0,
				);
			}
		});
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
			overlayElement = modal.find(this.config.selectors.overlaySelector),
			closeButtonElement = modal.find(
				this.config.selectors.closeButtonSelector,
			),
			scrollBlockElement = null,
			type = "dropdown",
			defaultHeight = null,
			maxHeight = null,
		} = options;

		this.config.maxHeight =
			defaultHeight !== null ? defaultHeight : this.config.maxHeight;

		body.removeClass("hidden");

		this.heightTrigger = triggerHeight;
		if (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
		this.log("open", {
			hasEvent: !!event,
			modalLen: modal && modal.length,
			bodyLen: body && body.length,
			contentLen: content && content.length,
			overlayLen: overlayElement && overlayElement.length,
			closeBtnLen: closeButtonElement && closeButtonElement.length,
		});
		const instanceId = ++this.instanceCounter;
		this.setupEventHandlers(
			overlayElement,
			closeButtonElement,
			type,
			instanceId,
		);

		this.openSheet(
			modal,
			body,
			content,
			scrollBlockElement,
			type,
			instanceId,
			triggerHeight,
			defaultHeight,
			maxHeight,
		);
	},

	close(type = "dropdown", instanceId = null) {
		this.log("close", {
			type,
			instanceId,
		});
		this.closeActiveSheet(type, instanceId);
	},

	openSheet(
		$sheetModal,
		$sheetBody,
		$sheetContent,
		scrollBlockElement,
		type = "dropdown",
		instanceId,
		triggerHeight,
		defaultHeight,
		maxHeight,
	) {
		this.log("openSheet:start", {
			id: $sheetModal && $sheetModal.attr && $sheetModal.attr("id"),
			bodyCls: $sheetBody && $sheetBody.attr && $sheetBody.attr("class"),
			contentCls:
				$sheetContent && $sheetContent.attr && $sheetContent.attr("class"),
			hasScrollBlock: !!scrollBlockElement,
			type,
		});
		// STACK: do not close previous of same type, we will stack

		if (typeof MobileMenu !== "undefined" && MobileMenu.isMobileMenuActive) {
			MobileMenu.closeMobileMenu();
		}

		// push into stack
		const instance = {
			id: this.instanceCounter,
			modal: $sheetModal,
			body: $sheetBody,
			content: $sheetContent,
			overlay: $sheetModal.find(this.config.selectors.overlaySelector),
			closeBtn: $sheetModal.find(this.config.selectors.closeButtonSelector),
			scrollBlock: scrollBlockElement ? scrollBlockElement : $sheetContent,
			showTimeout: null,
			heightTrigger: triggerHeight || 0,
			defaultHeightOverride: defaultHeight,
			maxHeight: maxHeight != null ? maxHeight : this.config.maxHeight,
		};
		const stack = this.getStack(type);
		stack.push(instance);

		this.lockPageScroll();

		$sheetModal.removeClass("hidden");
		if (instance.showTimeout) clearTimeout(instance.showTimeout);

		$sheetBody.css("height", "auto");
		this.calculateContentHeight($sheetModal, $sheetContent[0]);
		$sheetBody.css("height", "0");

		instance.showTimeout = setTimeout(() => {
			this.setSheetHeight(
				$sheetModal,
				$sheetBody,
				instance.defaultHeightOverride != null
					? instance.defaultHeightOverride
					: $sheetModal.data("default-height") || this.config.defaultHeight,
				instance.heightTrigger,
				instance.maxHeight,
			);
			$sheetModal.addClass("show-sheet");
			this.log("openSheet:show", {
				defaultHeight:
					instance.defaultHeightOverride ?? $sheetModal.data("default-height"),
			});
		}, this.config.showDelay);

		this.setupDragHandlers($sheetBody, type, instanceId);
	},

	closeActiveSheet(type = "dropdown", instanceId = null) {
		const inst = this.getInstanceById(type, instanceId);
		if (inst) {
			inst.body.css("transition", "");
			inst.body.removeClass("not-selectable");
			$("body").css("cursor", "default");
		}
		const stack = this.getStack(type);
		if (!stack.length) return;
		let idx = stack.length - 1;
		if (instanceId !== null) {
			const found = stack.findIndex((i) => i.id === instanceId);
			if (found === -1) return;
			idx = found;
		}
		const instance = stack[idx];
		this.log("closeActiveSheet", { type, instanceId: instance.id });

		// remove handlers for this instance
		$(window)
			.off(`mousemove.touchDrag-${type} touchmove.touchDrag-${type}`)
			.off(`mouseup.touchDrag-${type} touchend.touchDrag-${type}`);
		instance.body.off("mousedown.touchDrag touchstart.touchDrag");
		instance.overlay.off(`click.bottomSheet-${type}-${instance.id}`);
		instance.closeBtn.off(`click.bottomSheet-${type}-${instance.id}`);

		this.setSheetHeight(
			instance.modal,
			instance.body,
			0,
			instance.heightTrigger,
		);
		instance.modal.removeClass("show-sheet");

		this.unlockPageScroll();

		setTimeout(() => {
			instance.modal.addClass("hidden");
			stack.splice(idx, 1);
		}, this.config.animationDuration);
	},

	// lock/unlock overridden by ref-count above

	setSheetHeight(
		$sheetModal,
		$sheetBody,
		value,
		heightTrigger = 0,
		maxHeight = this.config.maxHeight,
	) {
		const height = Math.max(0, Math.min(maxHeight, value));
		const viewportHeight = window.innerHeight;
		const heightInPixels = (height * viewportHeight) / 100;

		const finalHeight = value === 0 ? 0 : heightInPixels + heightTrigger;
		$sheetBody.css("height", `${finalHeight}px`);
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

	setupDragHandlers($sheetBody, type, instanceId) {
		$sheetBody
			.off(
				`mousedown.touchDrag-${type}-${instanceId} touchstart.touchDrag-${type}-${instanceId}`,
			)
			.on(
				`mousedown.touchDrag-${type}-${instanceId} touchstart.touchDrag-${type}-${instanceId}`,
				(e) => {
					this.handleDragStart(e, type, instanceId);
				},
			);

		$(window)
			.off(
				`mousemove.touchDrag-${type}-${instanceId} touchmove.touchDrag-${type}-${instanceId}`,
			)
			.on(
				`mousemove.touchDrag-${type}-${instanceId} touchmove.touchDrag-${type}-${instanceId}`,
				(e) => {
					this.handleDragMove(e, type, instanceId);
				},
			);

		$(window)
			.off(
				`mouseup.touchDrag-${type}-${instanceId} touchend.touchDrag-${type}-${instanceId}`,
			)
			.on(
				`mouseup.touchDrag-${type}-${instanceId} touchend.touchDrag-${type}-${instanceId}`,
				() => {
					this.handleDragEnd(type, instanceId);
				},
			);
	},

	handleDragStart(event, type, instanceId) {
		const inst = this.getInstanceById(type, instanceId) || this.getTop(type);
		if (!inst) return;

		const $scrollBlock = inst.scrollBlock;
		const contentScrollTop = $scrollBlock.scrollTop();

		if (contentScrollTop > 0) {
			return;
		}

		this.isDragging = true;
		this.activeDragInstance = { type, instanceId };
		this.dragStartY = event.touches ? event.touches[0].pageY : event.pageY;

		inst.body.css("transition", "none");
		inst.body.addClass("not-selectable");
		$("body").css("cursor", "grabbing");
	},

	handleDragMove(event, type, instanceId) {
		if (!this.isDragging || !this.activeDragInstance) return;

		// Проверяем, что drag происходит на том же instance, на котором начался
		if (
			this.activeDragInstance.type !== type ||
			this.activeDragInstance.instanceId !== instanceId
		) {
			return;
		}

		const inst = this.getInstanceById(type, instanceId);
		if (!inst) return;

		event.preventDefault();
		event.stopPropagation();

		const $scrollBlock = inst.scrollBlock;
		const currentY = event.touches ? event.touches[0].pageY : event.pageY;
		const deltaY = this.dragStartY - currentY;

		if (deltaY < 0 && $scrollBlock.scrollTop() === 0) {
			this.hideContentScroll(type, instanceId);
		}

		if (deltaY < 0 && $scrollBlock.scrollTop() > 0) {
			return;
		}

		const viewportHeight = window.innerHeight;
		const deltaHeight = (deltaY / viewportHeight) * 100;

		const newHeight = Math.min(
			this.config.maxHeight,
			inst.modal.data("height") + deltaHeight,
		);
		this.setSheetHeight(
			inst.modal,
			inst.body,
			newHeight,
			inst.heightTrigger || 0,
		);

		this.dragStartY = currentY;
	},

	handleDragEnd(type, instanceId) {
		if (!this.isDragging || !this.activeDragInstance) return;

		// Проверяем, что drag заканчивается на том же instance, на котором начался
		if (
			this.activeDragInstance.type !== type ||
			this.activeDragInstance.instanceId !== instanceId
		) {
			return;
		}

		const inst = this.getInstanceById(type, instanceId);
		if (!inst) return;

		inst.body.css("transition", "");
		inst.body.removeClass("not-selectable");

		this.isDragging = false;
		this.activeDragInstance = null;
		const $sheetModal = inst.modal;

		$("body").css("cursor", "");
		this.showContentScroll(type, instanceId);

		if ($sheetModal.data("height") < this.sheetClosePercent) {
			this.close(type, inst.id);
		} else {
			this.setSheetHeight(
				$sheetModal,
				inst.body,
				$sheetModal.data("default-height") || this.config.defaultHeight,
				inst.heightTrigger || 0,
			);
		}
	},

	hideContentScroll(type, instanceId) {
		const inst = this.getInstanceById(type, instanceId) || this.getTop(type);
		if (inst && inst.scrollBlock) {
			inst.scrollBlock.addClass("overflow-y-hidden!");
		}
	},

	showContentScroll(type, instanceId) {
		const inst = this.getInstanceById(type, instanceId) || this.getTop(type);
		if (inst && inst.scrollBlock) {
			inst.scrollBlock.removeClass("overflow-y-hidden!");
		}
	},

	openSubMenu(itemId) {
		const inst = this.getTop("dropdown");
		if (!inst) return;

		const $sheetModal = inst.modal;
		const $subMenu = $sheetModal.find(`[data-dropdown-sub="${itemId}"]`);

		if (!$subMenu.length) return;

		$sheetModal.find(".js-dropdown-primary-list").addClass("hidden");
		$subMenu.removeClass("hidden");

		setTimeout(() => {
			this.calculateContentHeight($sheetModal, inst.content[0]);
			this.setSheetHeight(
				$sheetModal,
				inst.body,
				$sheetModal.data("default-height") || this.config.defaultHeight,
				inst.heightTrigger || 0,
			);
		}, this.config.showDelay);
	},

	closeSubMenu() {
		const inst = this.getTop("dropdown");
		if (!inst) return;

		const $sheetModal = inst.modal;

		$sheetModal.find(".js-dropdown-sub-list").addClass("hidden");
		$sheetModal.find(".js-dropdown-primary-list").removeClass("hidden");

		setTimeout(() => {
			this.calculateContentHeight($sheetModal, inst.content[0]);
			this.setSheetHeight(
				$sheetModal,
				inst.body,
				$sheetModal.data("default-height") || this.config.defaultHeight,
				inst.heightTrigger || 0,
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
			const modalBody = modal.find(".modal-change-plan");
			const modalContent = modal.find(".modal-content");

			BottomSheet.open({
				event: e,
				modal: modal,
				body: modalBody,
				content: modalContent,
				overlayElement: modal.find(".modal"),
				scrollBlockElement: modal.find(".modal-body"),
				closeButtonElement: modal.find("[data-dialog-close]"),
			});
		}
	});
});
