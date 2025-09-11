const Tooltip = {
	init() {
		this.initListeners();
	},
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
				const isActive = $btn.hasClass("active");

				$(".tooltip-btn.active").each(function () {
					$(this)
						.removeClass("active")
						.find(".tooltip-body")
						.removeClass("block");
				});

				if (!isActive) {
					$btn.addClass("active");
					$body.addClass("block");
					Tooltip.positionTooltip($btn, $body);
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
				const isActive = $btn.hasClass("active");

				$(".tooltip-btn.active").each(function () {
					$(this)
						.removeClass("active")
						.find(".tooltip-body")
						.removeClass("block");
				});

				if (!isActive) {
					$btn.addClass("active");
					$body.addClass("block");
					Tooltip.positionTooltip($btn, $body);
				}
			});

			$(document).on("touchstart click", function () {
				$(".tooltip-btn.active").each(function () {
					$(this)
						.removeClass("active")
						.find(".tooltip-body")
						.removeClass("block");
				});
			});
		} else {
			tooltipBtns.on("mouseover", function () {
				const tooltipBody = $(this).find(".tooltip-body");
				$(this).addClass("active");
				tooltipBody.addClass("block");
				Tooltip.positionTooltip($(this), tooltipBody);
			});
			tooltipBtns.on("mouseleave", function () {
				const tooltipBody = $(this).find(".tooltip-body");
				$(this).removeClass("active");
				tooltipBody.removeClass("block");
			});
		}
	},
	positionTooltip($btn, $body) {
		if (!$btn || !$btn.length || !$body || !$body.length) {
			return;
		}
		const margin = 16;
		const viewportWidth = $(window).width();
		const viewportHeight = $(window).height();

		$body.css({ left: "", top: "" });

		const tooltipHeight = $body.outerHeight();
		const rect = $body[0].getBoundingClientRect();

		let shift = 0;
		if (rect.left < margin) {
			shift += margin - rect.left;
		}
		if (rect.right > viewportWidth - margin) {
			shift -= rect.right - (viewportWidth - margin);
		}
		if (shift !== 0) {
			const currentLeft = parseFloat($body.css("left")) || 0;
			$body.css({ left: currentLeft + shift + "px" });
		}

		const rectAfter = $body[0].getBoundingClientRect();
		if (rectAfter.bottom > viewportHeight - margin) {
			$body.css({ top: -tooltipHeight - 2 + "px" });
		}
	},
};

$(document).ready(() => {
	Tooltip.init();
});
