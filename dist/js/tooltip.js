const Tooltip = {
	init() {
		this.initListeners();
	},

	scrollableParents: [],
	scrollHandlers: [],
	resizeTimer: null,
	initListeners() {
		const tooltipBtns = $(".tooltip-btn");

		const isTouchDevice = window.matchMedia(
			"(hover: none), (pointer: coarse)",
		).matches;

		if (isTouchDevice) {
			let justHandledTouch = false;

			tooltipBtns.on("touchstart", function (e) {
				e.preventDefault();
				e.stopPropagation();
				justHandledTouch = true;
				setTimeout(function () {
					justHandledTouch = false;
				}, 400);

				const $btn = $(this);
				const $body = $btn.find(".tooltip-body");
				const isActive = $btn.hasClass("tooltip-open");

				$(".tooltip-btn.tooltip-open").each(function () {
					$(this)
						.removeClass("tooltip-open")
						.find(".tooltip-body")
						.removeClass("block");
				});

				if (!isActive) {
					$btn.addClass("tooltip-open");
					$body.addClass("block");
					Tooltip.positionTooltip($btn, $body);
					Tooltip.attachScrollListeners($btn, $body);
				}
			});

			tooltipBtns.on("click", function (e) {
				if (justHandledTouch) {
					e.preventDefault();
					return;
				}
				e.preventDefault();
				e.stopPropagation();

				const $btn = $(this);
				const $body = $btn.find(".tooltip-body");
				const isActive = $btn.hasClass("tooltip-open");

				$(".tooltip-btn.tooltip-open").each(function () {
					$(this)
						.removeClass("tooltip-open")
						.find(".tooltip-body")
						.removeClass("block");
				});

				if (!isActive) {
					$btn.addClass("tooltip-open");
					$body.addClass("block");
					Tooltip.positionTooltip($btn, $body);
					Tooltip.attachScrollListeners($btn, $body);
				}
			});

			$(document).on("touchstart click", function () {
				$(".tooltip-btn.tooltip-open").each(function () {
					$(this)
						.removeClass("tooltip-open")
						.find(".tooltip-body")
						.removeClass("block");
				});
				Tooltip.detachScrollListeners();
			});
		} else {
			tooltipBtns.on("mouseover", function () {
				const tooltipBody = $(this).find(".tooltip-body");
				$(this).addClass("tooltip-open");
				tooltipBody.addClass("block");
				Tooltip.positionTooltip($(this), tooltipBody);
				Tooltip.attachScrollListeners($(this), tooltipBody);
			});
			tooltipBtns.on("mouseleave", function () {
				const tooltipBody = $(this).find(".tooltip-body");
				$(this).removeClass("tooltip-open");
				tooltipBody.removeClass("block");
				Tooltip.detachScrollListeners();
			});
		}

		$(window).on("resize", () => {
			clearTimeout(Tooltip.resizeTimer);
			Tooltip.resizeTimer = setTimeout(() => {
				const $activeBtn = $(".tooltip-btn.tooltip-open");
				if ($activeBtn.length) {
					const $body = $activeBtn.find(".tooltip-body.block");
					Tooltip.positionTooltip($activeBtn, $body);
				}
			}, 50);
		});

		$(window).on("scroll", () => {
			const $activeBtn = $(".tooltip-btn.tooltip-open");
			if ($activeBtn.length) {
				const $body = $activeBtn.find(".tooltip-body.block");
				Tooltip.positionTooltip($activeBtn, $body);
			}
		});
	},
	positionTooltip($btn, $body) {
		if (!$btn || !$btn.length || !$body || !$body.length) {
			return;
		}
		Tooltip.calculateFixedPosition($btn, $body);
	},

	calculateFixedPosition($btn, $body) {
		const margin = 16;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		$body.css({ position: "fixed", left: "", right: "", top: "" });

		const btnRect = $btn[0].getBoundingClientRect();
		const bodyRect = $body[0].getBoundingClientRect();

		let gap = 8;
		const className = $body.attr("class") || "";
		const match = className.match(/top-\[calc\(100%\+(\d+)px\)\]/);
		if (match && match[1]) {
			gap = parseInt(match[1], 10) || gap;
		}

		let top;
		const forceAbove = $body.hasClass("top-auto");

		if (forceAbove) {
			top = btnRect.top - bodyRect.height - gap;
		} else {
			if (btnRect.bottom + gap + bodyRect.height > viewportHeight - margin) {
				top = btnRect.top - bodyRect.height - gap;
			} else {
				top = btnRect.bottom + gap;
			}
		}

		let left = btnRect.left + (btnRect.width - bodyRect.width) / 2;
		left = Math.max(
			margin,
			Math.min(left, viewportWidth - margin - bodyRect.width),
		);

		$body.css({ top: top + "px", left: left + "px" });
	},

	attachScrollListeners($btn, $body) {
		Tooltip.detachScrollListeners();
		Tooltip.scrollableParents = [];
		Tooltip.scrollHandlers = [];

		let parent = $btn.parent();
		while (parent.length && !parent.is("body")) {
			const overflow = parent.css("overflow");
			if (
				overflow === "auto" ||
				overflow === "scroll" ||
				overflow === "hidden"
			) {
				Tooltip.scrollableParents.push(parent[0]);
			}
			parent = parent.parent();
		}

		const handler = function () {
			Tooltip.positionTooltip($btn, $body);
		};
		Tooltip.scrollableParents.forEach(function (el) {
			el.addEventListener("scroll", handler, { passive: true });
			Tooltip.scrollHandlers.push({ el, handler });
		});
	},

	detachScrollListeners() {
		if (Tooltip.scrollHandlers && Tooltip.scrollHandlers.length) {
			Tooltip.scrollHandlers.forEach(function (obj) {
				obj.el.removeEventListener("scroll", obj.handler);
			});
		}
		Tooltip.scrollableParents = [];
		Tooltip.scrollHandlers = [];
	},
};

$(document).ready(() => {
	Tooltip.init();
});
