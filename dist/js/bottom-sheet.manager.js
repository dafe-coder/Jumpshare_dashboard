/* BottomSheet Manager v2
 * - Multi-stacks by type (dropdown, dialogue, ...)
 * - Per-instance: defaultHeight, maxHeight, triggerHeight
 * - Independent overlays (transmitted from outside)
 * - Smooth animations; drag only for its own instance
 * - Ref-count for scroll-lock
 */
(function (window, $) {
	"use strict";

	if (!$) return;

	const DEFAULTS = {
		defaultHeight: 0, // percent of viewport
		maxHeight: 80, // percent of viewport
		animationMs: 500,
		showDelay: 10,
		zIndexBase: {
			dropdown: 1000,
			dialog: 2000,
		},
	};

	let INSTANCE_COUNTER = 0;

	class BSInstance {
		constructor(manager, type, elements, opts) {
			this.isMobile = window.innerWidth < 1024;
			this.manager = manager;
			this.type = type;
			this.id = ++INSTANCE_COUNTER;

			this.$modal = elements.modal; // jQuery
			this.$body = elements.body;
			this.$content = elements.content;
			this.$overlay = elements.overlay;
			this.$closeBtn = elements.closeBtn;
			this.$scrollBlock = elements.scrollBlock || this.$content;

			this.defaultHeight = isFinite(opts.defaultHeight)
				? Number(opts.defaultHeight)
				: null;
			this.maxHeight = isFinite(opts.maxHeight)
				? Number(opts.maxHeight)
				: DEFAULTS.maxHeight;
			this.triggerHeight = isFinite(opts.triggerHeight)
				? Number(opts.triggerHeight)
				: 0;
			this.animationMs = isFinite(opts.animationMs)
				? Number(opts.animationMs)
				: DEFAULTS.animationMs;
			this.showDelay = isFinite(opts.showDelay)
				? Number(opts.showDelay)
				: DEFAULTS.showDelay;

			this.drag = {
				active: false,
				startY: 0,
			};
			this._timeouts = { show: null };
			this._ns = `.bs-${this.type}-${this.id}`;
		}

		get currentPercent() {
			const val = this.$modal.data("height");
			return isFinite(val) ? Number(val) : 0;
		}

		clampPercent(value) {
			const v = Math.max(0, Math.min(this.maxHeight, value));
			return v;
		}

		calculateAutoPercent() {
			const contentHeight = this.$content[0]
				? this.$content[0].scrollHeight
				: 0;
			const vh = window.innerHeight || 1;
			return Math.min(this.maxHeight, (contentHeight / vh) * 100);
		}

		setHeight(percent) {
			const clamped = this.clampPercent(percent);
			const vh = window.innerHeight || 1;
			const px =
				(clamped * vh) / 100 + (clamped === 0 ? 0 : this.triggerHeight);
			this.$body.css("height", `${px}px`);
			this.$modal.data("height", clamped);
		}

		attachHandlers() {
			// Overlay/close
			if (this.$overlay && this.$overlay.length) {
				this.$overlay.off(`click${this._ns}`).on(`click${this._ns}`, (e) => {
					if (e.target === e.currentTarget) {
						e.preventDefault();
						e.stopPropagation();
						this.manager.closeById(this.type, this.id);
					}
				});
			}
			if (this.$closeBtn && this.$closeBtn.length) {
				this.$closeBtn.off(`click${this._ns}`).on(`click${this._ns}`, (e) => {
					e.preventDefault();
					e.stopPropagation();
					this.manager.closeById(this.type, this.id);
				});
			}

			// Drag
			this.$body
				.off(`mousedown${this._ns} touchstart${this._ns}`)
				.on(`mousedown${this._ns} touchstart${this._ns}`, (e) =>
					this.onDragStart(e),
				);

			$(window)
				.off(`mousemove${this._ns} touchmove${this._ns}`)
				.on(`mousemove${this._ns} touchmove${this._ns}`, (e) =>
					this.onDragMove(e),
				);

			$(window)
				.off(`mouseup${this._ns} touchend${this._ns}`)
				.on(`mouseup${this._ns} touchend${this._ns}`, () => this.onDragEnd());
		}

		detachHandlers() {
			if (this.$overlay) this.$overlay.off(this._ns);
			if (this.$closeBtn) this.$closeBtn.off(this._ns);
			this.$body && this.$body.off(this._ns);
			$(window).off(this._ns);
		}

		onDragStart(event) {
			if (!this.$modal) return;
			// allow drag only if scroll is at top
			const sb = this.$scrollBlock;
			if (sb && sb.length && sb.scrollTop() > 0) return;

			this.drag.active = true;
			this.drag.startY = event.touches ? event.touches[0].pageY : event.pageY;
			this.$body.css("transition", "none").addClass("not-selectable");
			$("body").css("cursor", "grabbing");
		}

		onDragMove(event) {
			if (!this.drag.active) return;
			event.preventDefault();
			event.stopPropagation();

			const currentY = event.touches ? event.touches[0].pageY : event.pageY;
			const deltaY = this.drag.startY - currentY;

			const vh = window.innerHeight || 1;
			const deltaPercent = (deltaY / vh) * 100;
			const next = this.currentPercent + deltaPercent;
			this.setHeight(next);
			this.drag.startY = currentY;
		}

		onDragEnd() {
			if (!this.drag.active) return;
			this.drag.active = false;
			this.$body.css("transition", "").removeClass("not-selectable");
			$("body").css("cursor", "");

			if (this.currentPercent < this.manager.config.closeThresholdPercent) {
				this.manager.closeById(this.type, this.id);
			} else {
				const target =
					this.defaultHeight != null
						? this.defaultHeight
						: this.$modal.data("default-height") ||
							this.manager.config.defaultHeight;
				this.setHeight(target);
			}
		}

		open() {
			// compute height
			const autoPercent = this.calculateAutoPercent();
			const startTarget =
				this.defaultHeight != null
					? this.defaultHeight
					: this.$modal.data("default-height") ||
						autoPercent ||
						this.manager.config.defaultHeight;

			// z-index by global order
			const z = this.manager.getNextZ(this.type);
			this.$modal.css("z-index", z);

			this.$modal.removeClass("hidden");
			this.$body.css("height", "auto");
			// recalc in case of auto
			this.$modal.data("default-height", autoPercent);
			this.$body.css("height", "0");

			this._timeouts.show = setTimeout(() => {
				this.setHeight(startTarget);
				this.$modal.addClass("show-sheet");
			}, this.showDelay);

			this.attachHandlers();
		}

		close(immediate = false) {
			if (this._timeouts.show) {
				clearTimeout(this._timeouts.show);
				this._timeouts.show = null;
			}

			this.setHeight(0);
			this.$modal.removeClass("show-sheet");
			const finish = () => {
				this.$modal.addClass("hidden");
				this.detachHandlers();
			};
			if (immediate) finish();
			else setTimeout(finish, this.animationMs);
		}
	}

	class BSManager {
		constructor() {
			this.config = {
				defaultHeight: DEFAULTS.defaultHeight,
				maxHeight: DEFAULTS.maxHeight,
				animationMs: DEFAULTS.animationMs,
				showDelay: DEFAULTS.showDelay,
				zIndexBase: { ...DEFAULTS.zIndexBase },
				closeThresholdPercent: 5, // ниже 5% закрываем при drag
			};
			this.stacks = new Map(); // type -> Array<BSInstance>
			this.openOrder = []; // для глобального top (ESC)
			this.lockCount = 0;
			this._bindGlobal();
		}

		_bindGlobal() {
			$(window).on("keydown.bs-manager", (e) => {
				if (e.key === "Escape") {
					const top = this.getGlobalTop();
					if (top) this.closeById(top.type, top.id);
				}
			});
		}

		getStack(type) {
			if (!this.stacks.has(type)) this.stacks.set(type, []);
			return this.stacks.get(type);
		}

		getTop(type) {
			const s = this.getStack(type);
			return s.length ? s[s.length - 1] : null;
		}

		getGlobalTop() {
			return this.openOrder.length
				? this.openOrder[this.openOrder.length - 1]
				: null;
		}

		getNextZ(type) {
			const base = this.config.zIndexBase[type] || 1000;
			return base + this.openOrder.length + 1;
		}

		lockScroll() {
			if (!this.lockCount) {
				const sw = this._getScrollbarWidth();
				$("html").css("padding-right", `${sw}px`).addClass("overflow-hidden");
			}
			this.lockCount += 1;
		}

		unlockScroll() {
			this.lockCount = Math.max(0, this.lockCount - 1);
			if (!this.lockCount) {
				$("html").css("padding-right", "0").removeClass("overflow-hidden");
			}
		}

		_getScrollbarWidth() {
			const outer = document.createElement("div");
			outer.style.visibility = "hidden";
			outer.style.overflow = "scroll";
			document.body.appendChild(outer);
			const inner = document.createElement("div");
			outer.appendChild(inner);
			const sw = outer.offsetWidth - inner.offsetWidth;
			outer.parentNode.removeChild(outer);
			return sw;
		}

		open(opts) {
			const {
				type,
				modal,
				body,
				content,
				overlayElement,
				closeButtonElement,
				scrollBlockElement,
				defaultHeight = null,
				maxHeight = null,
				triggerHeight = 0,
				showDelay,
				animationMs,
			} = opts;

			if (!type) throw new Error("BottomSheet: type is required");
			if (!modal || !body || !content)
				throw new Error("BottomSheet: modal, body, content are required");

			const elements = {
				modal,
				body,
				content,
				overlay: overlayElement,
				closeBtn: closeButtonElement,
				scrollBlock: scrollBlockElement,
			};

			const instance = new BSInstance(this, type, elements, {
				defaultHeight,
				maxHeight,
				triggerHeight,
				showDelay: showDelay != null ? showDelay : this.config.showDelay,
				animationMs:
					animationMs != null ? animationMs : this.config.animationMs,
			});

			// push to stack
			const stack = this.getStack(type);
			stack.push(instance);
			this.openOrder.push(instance);

			this.lockScroll();
			instance.open();
			return instance.id;
		}

		closeTop(type) {
			const inst = type ? this.getTop(type) : this.getGlobalTop();
			if (inst) this.closeById(inst.type, inst.id);
		}

		closeById(type, id) {
			const stack = this.getStack(type);
			const idx = stack.findIndex((i) => i.id === id);
			if (idx === -1) return;

			const inst = stack[idx];
			inst.close();

			// remove from containers after animation
			setTimeout(() => {
				stack.splice(idx, 1);
				const orderIdx = this.openOrder.findIndex((i) => i.id === id);
				if (orderIdx !== -1) this.openOrder.splice(orderIdx, 1);
				this.unlockScroll();
			}, inst.animationMs);
		}

		closeAll(type) {
			if (type) {
				const s = [...this.getStack(type)];
				s.reverse().forEach((i) => this.closeById(type, i.id));
			} else {
				const all = [...this.openOrder];
				all.reverse().forEach((i) => this.closeById(i.type, i.id));
			}
		}
	}

	// Export
	const manager = new BSManager();
	window.BottomSheetManager = manager;
	window.BS = manager;

	// Lightweight compat wrapper (optional)
	window.BottomSheetV2 = {
		open: function (options) {
			const id = manager.open({
				type: options.type || "dropdown",
				modal: options.modal,
				body: options.body,
				content: options.content,
				overlayElement: options.overlayElement,
				closeButtonElement: options.closeButtonElement,
				scrollBlockElement: options.scrollBlockElement,
				defaultHeight: options.defaultHeight,
				maxHeight: options.maxHeight,
				triggerHeight: options.triggerHeight,
				animationMs: options.animationDuration,
				showDelay: options.showDelay,
			});
			return id;
		},
		closeTop: function (type) {
			manager.closeTop(type);
		},
		closeById: function (type, id) {
			manager.closeById(type, id);
		},
		closeAll: function (type) {
			manager.closeAll(type);
		},
	};
	Object.defineProperty(BS, "isMobile", {
		get() {
			return window.innerWidth < 1024;
		},
	});
})(window, window.jQuery);
