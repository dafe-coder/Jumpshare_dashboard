const BottomSheetLite = {
	instanceCounter: 0,
	nextZIndex: 10001,
	state: { dropdownStack: [], dialogStack: [], activeDrag: null },
	closeThresholdPercent: 20, // how many percent decrease from top to close
	portalContainer: null,
	originalPositions: new Map(),
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
	getInstanceById(type, id) {
		return this.getStack(type).find((i) => i.id === id) || null;
	},
	getNextZIndex() {
		return this.nextZIndex++;
	},
	createPortalContainer() {
		if (!this.portalContainer) {
			this.portalContainer = $('<div class="bottom-sheet-portal"></div>');
			$("body").append(this.portalContainer);
		}
		return this.portalContainer;
	},
	moveToPortal(modal) {
		const originalParent = modal.parent();
		const originalNextSibling = modal[0].nextSibling;
		this.originalPositions.set(modal[0], {
			parent: originalParent,
			nextSibling: originalNextSibling,
		});

		this.createPortalContainer().append(modal);
	},
	restoreFromPortal(modal) {
		const originalPos = this.originalPositions.get(modal[0]);
		if (originalPos) {
			if (originalPos.nextSibling) {
				originalPos.parent[0].insertBefore(modal[0], originalPos.nextSibling);
			} else {
				originalPos.parent.append(modal);
			}
			this.originalPositions.delete(modal[0]);
		}
	},
	init() {
		$(window).on("resize.bottomSheetLite", () => {
			["dropdown", "dialog"].forEach((t) => {
				const top = this.getTop(t);
				if (!top) return;
				this.calculateContentHeight(top.modal, top.content[0]);
				this.setSheetHeight(
					top.modal,
					top.body,
					top.modal.data("default-height") || this.config.defaultHeight,
					top.heightTrigger || 0,
				);
			});
		});
		$(document).on("keydown.bottomSheetLite", (e) => {
			if (e.key === "Escape") this.close();
		});
	},
	detachSheetEvents(type, inst) {
		$(window)
			.off(
				`mousemove.touchDrag-${type}-${inst.id} touchmove.touchDrag-${type}-${inst.id}`,
			)
			.off(
				`mouseup.touchDrag-${type}-${inst.id} touchend.touchDrag-${type}-${inst.id}`,
			);
		inst.body.off(
			`mousedown.touchDrag-${type}-${inst.id} touchstart.touchDrag-${type}-${inst.id}`,
		);
		inst.overlay.off(`click.bottomSheet-${type}-${inst.id}`);
		inst.closeBtn.off(`click.bottomSheet-${type}-${inst.id}`);
	},
	open(opts) {
		if (!Helpers.isMobile()) {
			return;
		}
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
			type = "dropdown",
			defaultHeight = null,
			maxHeight = null,
		} = opts;
		if (event) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
		const id = ++this.instanceCounter;
		const inst = {
			id,
			modal,
			body,
			content,
			overlay: overlayElement,
			closeBtn: closeButtonElement,
			scrollBlock: content,
			heightTrigger: triggerHeight || 0,
			defaultHeightOverride: defaultHeight,
			maxHeight: maxHeight != null ? maxHeight : this.config.maxHeight,
			zIndex: this.getNextZIndex(),
			gesture: null,
			isDismissAllowed: true,
		};
		this.getStack(type).push(inst);

		this.moveToPortal(modal);

		modal.css("z-index", inst.zIndex).removeClass("hidden");
		body.removeClass("hidden").css("height", "auto");
		if (inst.defaultHeightOverride != null) {
			modal.data("default-height", inst.defaultHeightOverride);
		}
		this.calculateContentHeight(modal, content[0]);
		body.css("height", "0");
		MobileMenu.closeMobileMenu();
		Helpers.lockPageScroll();
		setTimeout(() => {
			modal.addClass("anim-sheet");
			this.setSheetHeight(
				modal,
				body,
				inst.defaultHeightOverride != null
					? inst.defaultHeightOverride
					: modal.data("default-height") || this.config.defaultHeight,
				inst.heightTrigger,
			);
			try {
				const scEl = inst.scrollBlock && inst.scrollBlock[0];
				if (scEl) inst.isDismissAllowed = scEl.scrollTop <= 0;
			} catch (e) {}
		}, this.config.showDelay);
		this.bindSheetEvents(type, inst);
	},
	close(type = "dropdown", instanceId = null, immediate = false) {
		this.closeAllSubMenus();
		const stack = this.getStack(type);
		if (!stack.length) return;
		let idx = stack.length - 1;
		if (instanceId != null) {
			const f = stack.findIndex((i) => i.id === instanceId);
			if (f === -1) return;
			idx = f;
		}
		const inst = stack[idx];
		if (
			this.state.activeDrag &&
			this.state.activeDrag.type === type &&
			this.state.activeDrag.id === inst.id
		) {
			this.state.activeDrag = null;
		}
		this.detachSheetEvents(type, inst);
		this.setSheetHeight(inst.modal, inst.body, 0, inst.heightTrigger);
		inst.modal.removeClass("anim-sheet");
		stack.splice(idx, 1);
		if (
			this.state.dropdownStack.length === 0 &&
			this.state.dialogStack.length === 0
		) {
			Helpers.unlockPageScroll();
		}
		if (immediate) {
			inst.modal.addClass("hidden");
			inst.body.removeClass("hidden");
			inst.body.css("height", "auto");
			this.restoreFromPortal(inst.modal);
		} else {
			setTimeout(() => {
				inst.modal.addClass("hidden");
				inst.body.addClass("hidden");
				this.restoreFromPortal(inst.modal);
			}, this.config.animationDuration);
		}
	},
	closeAll(immediate) {
		["dropdown", "dialog"].forEach((type) => {
			const stack = this.getStack(type);
			while (stack.length) {
				const top = stack[stack.length - 1];
				this.close(type, top.id, immediate);
			}
		});
	},
	bindSheetEvents(type, inst) {
		const id = inst.id;
		const nsDown = `mousedown.touchDrag-${type}-${id} touchstart.touchDrag-${type}-${id}`;
		const nsMove = `mousemove.touchDrag-${type}-${id} touchmove.touchDrag-${type}-${id}`;
		const nsUp = `mouseup.touchDrag-${type}-${id} touchend.touchDrag-${type}-${id}`;
		const nsGoBack = `mousedown.bottomSheetSubMenu-${type}-${id} touchstart.bottomSheetSubMenu-${type}-${id}`;
		if (inst.overlay && inst.overlay.length) {
			inst.overlay
				.off(`click.bottomSheet-${type}-${id}`)
				.on(`click.bottomSheet-${type}-${id}`, (e) => {
					if (e.target !== e.currentTarget) return;
					e.preventDefault();
					e.stopPropagation();
					this.close(type, id);
				});
		}
		if (inst.closeBtn && inst.closeBtn.length) {
			inst.closeBtn
				.off(`click.bottomSheet-${type}-${id}`)
				.on(`click.bottomSheet-${type}-${id}`, (e) => {
					e.preventDefault();
					e.stopPropagation();
					this.close(type, id);
				});
		}
		inst.body.off(nsDown).on(nsDown, (e) => {
			this.state.activeDrag = { type, id };
			try {
				e.stopPropagation();
				e.stopImmediatePropagation();
			} catch (err) {}
			this.gestureStart(e, type, id);
		});
		$(window)
			.off(nsMove)
			.on(nsMove, (e) => this.gestureMove(e, type, id))
			.off(nsUp)
			.on(nsUp, () => this.gestureEnd(type, id));

		$(".js-dropdown-sub-list .go-back").on(nsGoBack, (e) => {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			this.closeAllSubMenus();
		});
	},
	openSubMenu(itemId) {
		const inst = this.getTop("dropdown");
		if (!inst) return;

		const $sheetModal = inst.modal;
		const $sheetPrimaryBody = $sheetModal.find(".js-dropdown-primary-list");
		const $subMenu = $sheetModal.find(`[data-dropdown-sub="${itemId}"]`);
		$subMenu.removeClass("hidden");
		$sheetPrimaryBody.addClass("hidden");
	},
	closeAllSubMenus() {
		const inst = this.getTop("dropdown");
		if (!inst) return;

		const $sheetModal = inst.modal;
		const $sheetPrimaryBody = $sheetModal.find(".js-dropdown-primary-list");
		const $subMenu = $sheetModal.find(`[data-dropdown-sub]`);
		$sheetPrimaryBody.removeClass("hidden");
		$subMenu.addClass("hidden");
	},
	setSheetHeight(modal, body, value, heightTrigger = 0) {
		const h = Math.max(0, value);
		const vh = window.innerHeight;
		const px = (h * vh) / 100;
		const finalPx = value === 0 ? 0 : px + heightTrigger;
		body.css("height", `${finalPx}px`);
		modal.data("height", h);
	},
	calculateContentHeight(modal, contentEl) {
		const contentHeight = contentEl.scrollHeight;
		const windowHeight = window.innerHeight;
		const heightPercent = Math.min(
			this.config.maxHeight,
			(contentHeight / windowHeight) * 100,
		);
		modal.data("height", heightPercent);
		modal.data("default-height", heightPercent);
	},
	findScrollable(startEl, rootEl) {
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
				if (canScrollY && el.scrollHeight > el.clientHeight) return el;
			} catch (e) {}
			el = el.parentElement;
		}
		return null;
	},
	gestureStart(event, type, id) {
		const inst = this.getInstanceById(type, id) || this.getTop(type);
		if (!inst) return;
		const contentRoot = inst.content && inst.content[0];
		const startTarget =
			event.target ||
			(event.touches && event.touches[0] && event.touches[0].target);
		const scrollBlock = inst.scrollBlock && inst.scrollBlock[0];
		const scrollEl =
			this.findScrollable(startTarget, contentRoot) || scrollBlock || null;
		try {
			if (scrollEl) inst.isDismissAllowed = scrollEl.scrollTop <= 0;
		} catch (e) {}

		const y = event.touches ? event.touches[0].pageY : event.pageY;
		const startHeight =
			inst.modal.data("height") ||
			inst.modal.data("default-height") ||
			this.config.defaultHeight;
		inst.gesture = {
			startY: y,
			prevY: y,
			scrollEl,
			captured: false,
			startHeight,
		};
		inst.body.css("transition", "none");
		inst.body.addClass("not-selectable");
		$("body").css("cursor", "grabbing");
	},
	gestureMove(event, type, id) {
		if (
			!this.state.activeDrag ||
			this.state.activeDrag.id !== id ||
			this.state.activeDrag.type !== type
		)
			return;
		const inst = this.getInstanceById(type, id);
		if (!inst.isDismissAllowed) return;
		if (!inst || !inst.gesture) return;
		const g = inst.gesture;
		const y = event.touches ? event.touches[0].pageY : event.pageY;
		let dy = y - g.prevY;
		g.prevY = y;
		const scrollEl = g.scrollEl;
		const dragThreshold = 30; // px
		if (!g.captured) {
			// Ignore tiny movements; do not capture yet
			if (Math.abs(y - g.startY) < dragThreshold) {
				return;
			}
			if (scrollEl) {
				const atTop = scrollEl.scrollTop <= 0;
				inst.isDismissAllowed = atTop;
				if (dy > 0 && atTop) {
					g.captured = true;
					try {
						g.prevOverflowY = scrollEl.style.overflowY;
						scrollEl.style.overflowY = "hidden";
					} catch (e) {}
					if (event.cancelable) {
						try {
							event.preventDefault();
						} catch (e) {}
					}
				} else {
					return;
				}
			} else {
				if (dy > 0) {
					g.captured = true;
				}
				if (event.cancelable) {
					try {
						event.preventDefault();
					} catch (e) {}
				}
			}
		}
		if (!g.captured) return;
		if (event.cancelable) {
			try {
				event.preventDefault();
			} catch (e) {}
		}
		const vh = window.innerHeight;
		const deltaPercent = (-dy / vh) * 100;
		const newHeight = Math.max(
			0,
			Math.min(inst.maxHeight, inst.modal.data("height") + deltaPercent),
		);

		this.setSheetHeight(
			inst.modal,
			inst.body,
			newHeight,
			inst.heightTrigger || 0,
		);
	},
	gestureEnd(type, id) {
		if (
			!this.state.activeDrag ||
			this.state.activeDrag.id !== id ||
			this.state.activeDrag.type !== type
		)
			return;
		const inst = this.getInstanceById(type, id);
		if (!inst || !inst.gesture) return;
		inst.body.css("transition", "");
		inst.body.removeClass("not-selectable");
		$("body").css("cursor", "");
		const g = inst.gesture;
		if (!g.captured) {
			inst.gesture = null;
			this.state.activeDrag = null;
			return;
		}
		try {
			if (g && g.captured && g.scrollEl) {
				g.scrollEl.style.overflowY = g.prevOverflowY || "";
			}
		} catch (e) {}
		const current = inst.modal.data("height") || 0;

		const startHeight =
			g.startHeight != null
				? g.startHeight
				: inst.modal.data("default-height") || this.config.defaultHeight;
		console.log(startHeight, current, "======= start");

		const shouldClose = startHeight - current >= this.closeThresholdPercent; // close if reduced
		const isBelowMinHeight = startHeight < this.closeThresholdPercent; // close if modal height is less than close threshold percent
		if ((shouldClose || isBelowMinHeight) && inst.isDismissAllowed) {
			this.close(type, id);
			inst.gesture = null;
			this.state.activeDrag = null;
			return;
		}
		const target =
			inst.defaultHeightOverride ||
			inst.modal.data("default-height") ||
			this.config.defaultHeight;

		this.setSheetHeight(inst.modal, inst.body, target, inst.heightTrigger || 0);
		inst.gesture = null;
		this.state.activeDrag = null;
	},
};

$(document).ready(() => {
	BottomSheetLite.init();
});
