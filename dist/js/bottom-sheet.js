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
	nextZIndex: 10001,
	isDismissAllowed: true,
	state: {
		dropdownStack: [],
		dialogStack: [],
	},
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
	getNextZIndex() {
		return this.nextZIndex++;
	},

	getTotalOpenSheets() {
		return this.state.dropdownStack.length + this.state.dialogStack.length;
	},

	findDragTarget(element) {
		let $element = $(element);

		for (const type of ["dropdown", "dialog"]) {
			const stack = this.getStack(type);
			for (const instance of stack) {
				if (instance.body && instance.body.find(element).length > 0) {
					if (this.isDragTarget($element, instance)) {
						return {
							type: type,
							instanceId: instance.id,
							instance: instance,
						};
					}
				}
			}
		}

		return null;
	},

	isDragTarget($element, instance) {
		if (
			$element.hasClass("js-drag-handle") ||
			$element.hasClass("drag-handle")
		) {
			return true;
		}

		if (
			instance.body &&
			instance.body.find(".js-dropdown-header, .modal-header").find($element)
				.length > 0
		) {
			return true;
		}

		if (
			instance.body &&
			instance.body.find("[data-drag-area]").find($element).length > 0
		) {
			return true;
		}
		return true;
	},

	// Find closest scrollable ancestor inside sheet content
	findScrollableAncestor(startEl, rootEl) {
		let el =
			startEl instanceof HTMLElement
				? startEl
				: startEl && startEl.nodeType
					? startEl
					: null;
		const root = rootEl instanceof HTMLElement ? rootEl : null;
		while (
			el &&
			el !== root &&
			el !== document.body &&
			el !== document.documentElement
		) {
			try {
				const style = window.getComputedStyle(el);
				const canScrollY =
					style.overflowY === "auto" || style.overflowY === "scroll";
				if (canScrollY && el.scrollHeight > el.clientHeight) {
					return el;
				}
			} catch (e) {}
			el = el.parentElement;
		}
		return null;
	},

	lockPageScroll() {
		const hasVScroll = this.pageHasVerticalScrollbar();
		if (this.scrollbarWidth > 0 && hasVScroll) {
			$("html").css("padding-right", `${this.scrollbarWidth}px`);
		}
		$("html").addClass("overflow-hidden");
		$("body").addClass("overflow-hidden");
		this.log("lockPageScroll: initial lock applied");
	},
	unlockPageScroll() {
		$("html").css("padding-right", "0");
		$("html").removeClass("overflow-hidden");
		$("body").removeClass("overflow-hidden");
		this.log("unlockPageScroll: page scroll unlocked");
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

	pageHasVerticalScrollbar() {
		const doc = document.documentElement;
		const body = document.body;
		const scrollHeight = Math.max(
			doc.scrollHeight,
			doc.offsetHeight,
			body ? body.scrollHeight : 0,
			body ? body.offsetHeight : 0,
		);
		return scrollHeight > window.innerHeight;
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

		if (typeof MobileMenu !== "undefined" && MobileMenu.isMobileMenuActive) {
			MobileMenu.closeMobileMenu();
		}

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
			zIndex: this.getNextZIndex(),
			isDismissAllowed: true,
		};
		const stack = this.getStack(type);
		stack.push(instance);

		this.log("openSheet: sheet added to stack", {
			type,
			instanceId: instance.id,
			totalSheets: this.getTotalOpenSheets(),
		});

		this.lockPageScroll();

		$sheetModal.removeClass("hidden");
		if (instance.showTimeout) clearTimeout(instance.showTimeout);

		$sheetModal.css("z-index", instance.zIndex);

		$sheetBody.css("height", "auto");
		this.calculateContentHeight($sheetModal, $sheetContent[0]);
		$sheetBody.css("height", "0");
		$sheetModal.addClass("show-sheet");

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
			this.log("openSheet:show", {
				defaultHeight:
					instance.defaultHeightOverride ?? $sheetModal.data("default-height"),
			});

			// Инициализируем состояние разрешения закрытия на основании текущего скролла
			try {
				const scEl = instance.scrollBlock && instance.scrollBlock[0];
				if (scEl) {
					instance.isDismissAllowed = scEl.scrollTop <= 0;
				}
			} catch (e) {}
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

		stack.splice(idx, 1);

		const totalSheets = this.getTotalOpenSheets();
		this.log("closeActiveSheet: remaining sheets", { totalSheets });
		console.log(totalSheets);

		if (totalSheets === 0) {
			this.log("closeActiveSheet: unlocking page scroll - no more sheets");
			this.unlockPageScroll();
		}

		setTimeout(() => {
			instance.modal.addClass("hidden");
			instance.body.addClass("hidden");
		}, this.config.animationDuration);
	},

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
					const realTarget = this.findDragTarget(e.target);
					if (
						realTarget &&
						realTarget.type === type &&
						realTarget.instanceId === instanceId
					) {
						this.handleDragStart(e, type, instanceId);
					} else {
						this.log("setupDragHandlers: drag target mismatch, ignoring", {
							handlerType: type,
							handlerInstanceId: instanceId,
							realTarget: realTarget,
						});
					}
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
		this.log("handleDragStart", {
			type,
			instanceId,
			inst: inst ? inst.id : null,
		});
		if (!inst) return;

		const $scrollBlock = inst.scrollBlock;
		// Cache closest scrollable container for this drag (supports nested scrolls)
		const contentRoot = inst.content && inst.content[0];
		const startTarget =
			event.target ||
			(event.touches && event.touches[0] && event.touches[0].target);
		this.dragScrollable =
			this.findScrollableAncestor(startTarget, contentRoot) ||
			($scrollBlock && $scrollBlock[0]) ||
			null;

		this.isDragging = true;
		// Do not reset dragReadyToClose here: it must persist to the next gesture
		this.dragArmUntilLift = false;
		this.activeDragInstance = { type, instanceId };
		this.dragStartY = event.touches ? event.touches[0].pageY : event.pageY;

		try {
			const scEl = this.dragScrollable || ($scrollBlock && $scrollBlock[0]);
			if (scEl) {
				inst.isDismissAllowed = scEl.scrollTop <= 0;
			} else {
				inst.isDismissAllowed = true;
			}
		} catch (e) {}

		inst.body.css("transition", "none");
		inst.body.addClass("not-selectable");
		$("body").css("cursor", "grabbing");
	},

	handleDragMove(event, type, instanceId) {
		if (!this.isDragging || !this.activeDragInstance) return;
		if (
			this.activeDragInstance.type !== type ||
			this.activeDragInstance.instanceId !== instanceId
		) {
			return;
		}

		const inst = this.getInstanceById(type, instanceId);
		if (!inst) return;

		const $scrollBlock = inst.scrollBlock;
		const currentY = event.touches ? event.touches[0].pageY : event.pageY;
		let deltaY = this.dragStartY - currentY; // >0 up, <0 down

		// If we armed closing and finger is still down, ignore further down moves until lift
		if (this.dragArmUntilLift && deltaY < 0) {
			this.dragStartY = currentY;
			return;
		}
		// Moving up does not cancel readiness once armed; only clear arm-until-lift
		if (deltaY > 0) {
			this.dragArmUntilLift = false;
		}

		const scrollEl = this.dragScrollable || ($scrollBlock && $scrollBlock[0]);
		if (scrollEl) {
			const scrollTop = scrollEl.scrollTop;
			const maxScrollTop = scrollEl.scrollHeight - scrollEl.clientHeight;
			const canScrollDown = deltaY > 0 && maxScrollTop - scrollTop > 0;
			const canScrollUp = deltaY < 0 && scrollTop > 0;
			// Если контент может скроллиться в сторону жеста — отдаём нативному скроллу (инерция сохранится)
			// но только пока закрытие ещё не заармлено
			if (!this.dragReadyToClose && (canScrollDown || canScrollUp)) {
				this.dragStartY = currentY;
				return;
			}
		}

		if (deltaY === 0) {
			this.dragStartY = currentY;
			return;
		}

		// Обновляем разрешение закрытия в процессе жеста, завязано на вершину скролла
		try {
			const atTopNow = scrollEl
				? scrollEl.scrollTop <= 0
				: $scrollBlock.scrollTop() <= 0;
			inst.isDismissAllowed = !!atTopNow;
		} catch (e) {}

		// Только при жесте вниз и если разрешено закрытие — армим закрытие
		if (deltaY < 0 && inst.isDismissAllowed) {
			// Перехватываем только когда начинаем двигать шит, чтобы отключить нативную прокрутку
			if (event.cancelable) {
				try {
					event.preventDefault();
				} catch (e) {}
			}
			if (event.stopPropagation) {
				try {
					event.stopPropagation();
				} catch (e) {}
			}
			const isAtTop = scrollEl
				? scrollEl.scrollTop <= 0
				: $scrollBlock.scrollTop() <= 0;
			if (isAtTop) {
				if (!this.dragReadyToClose) {
					// Arm closing but require finger lift before applying
					this.dragReadyToClose = true;
					this.dragArmUntilLift = true;
					this.dragStartY = currentY;
					return;
				}
				this.hideContentScroll(type, instanceId);
			}
		}

		// Если ещё не заармлено закрытие — не двигаем шит, отдаём жест контенту
		if (!this.dragReadyToClose) {
			this.dragStartY = currentY;
			return;
		}

		// Перехватываем жест и двигаем шит в обе стороны пока заармлено
		if (event.cancelable) {
			try {
				event.preventDefault();
			} catch (e) {}
		}
		if (event.stopPropagation) {
			try {
				event.stopPropagation();
			} catch (e) {}
		}
		this.hideContentScroll(type, instanceId);

		const viewportHeight = window.innerHeight;
		const deltaHeight = (deltaY / viewportHeight) * 100;
		const defaultHeight =
			inst.defaultHeightOverride !== null
				? inst.defaultHeightOverride
				: inst.modal.data("default-height") || this.config.defaultHeight;
		const newHeight = Math.min(
			this.config.maxHeight,
			// вверх — не выше defaultHeight; вниз — вплоть до 0
			Math.max(
				0,
				deltaY > 0
					? Math.min(defaultHeight, inst.modal.data("height") + deltaHeight)
					: inst.modal.data("height") + deltaHeight,
			),
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
		// Permit closing on next gesture only (require lift)
		this.dragArmUntilLift = false;

		if ($sheetModal.data("height") < this.sheetClosePercent) {
			// Закрываем только если разрешено
			if (inst.isDismissAllowed) {
				this.close(type, inst.id);
			}
		} else {
			this.setSheetHeight(
				$sheetModal,
				inst.body,
				inst.defaultHeightOverride !== null
					? inst.defaultHeightOverride
					: $sheetModal.data("default-height"),
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
	(function () {
		function isScrollable(el) {
			if (!el) return false;
			var cs = getComputedStyle(el);
			return (
				(cs.overflowY === "auto" || cs.overflowY === "scroll") &&
				el.scrollHeight > el.clientHeight
			);
		}

		function findScrollable(root, target) {
			var el = target;
			while (
				el &&
				el !== root &&
				el !== document.body &&
				el !== document.documentElement
			) {
				if (isScrollable(el)) return el;
				el = el.parentElement;
			}
			return isScrollable(root) ? root : null;
		}

		function attach(root) {
			if (!root) return;
			var startY = 0;
			root.addEventListener(
				"touchstart",
				function (e) {
					if (e.touches.length !== 1) return;
					startY = e.touches[0].clientY;
				},
				{ passive: true },
			);

			root.addEventListener(
				"touchmove",
				function (e) {
					if (e.touches.length !== 1) return;
					var dy = e.touches[0].clientY - startY;
					var sc = findScrollable(root, e.target) || root;
					var atTop = sc.scrollTop <= 0 && dy > 0;
					var atBottom =
						sc.scrollTop + sc.clientHeight >= sc.scrollHeight && dy < 0;
					if (atTop || atBottom) e.preventDefault();
				},
				{ passive: false },
			);
		}

		Array.prototype.forEach.call(
			document.querySelectorAll(".modal-content, .modal-body"),
			attach,
		);
	})();
});
