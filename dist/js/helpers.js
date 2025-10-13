const Helpers = {
	isMobile() {
		return window.innerWidth < 1024;
	},
	getScrollbarWidth() {
		const outer = $("<div>").css({
			visibility: "hidden",
			overflow: "scroll",
			msOverflowStyle: "scrollbar",
		});
		$("body").append(outer);

		const inner = $("<div>");
		outer.append(inner);

		const scrollbarWidth = outer[0].offsetWidth - inner[0].offsetWidth;
		outer.remove();
		return scrollbarWidth;
	},
	pageHasVerticalScrollbar() {
		const doc = $("html")[0];
		const body = $("body")[0];
		const scrollHeight = Math.max(
			doc.scrollHeight,
			doc.offsetHeight,
			body ? body.scrollHeight : 0,
			body ? body.offsetHeight : 0,
		);
		return scrollHeight > $(window).height();
	},
	lockPageScroll() {
		if ($("body").data("scroll-locked") === "1") return;

		$("body").addClass("page-lock");

		const hasVScroll = this.pageHasVerticalScrollbar();
		const sw = this.getScrollbarWidth();
		if (sw > 0 && hasVScroll) {
			$("body").css("padding-right", `${sw}px`);
		}

		const y = $(window).scrollTop();
		$("body").data("scroll-locked", "1");
		$("body").data("scroll-y", y);
		$("html").css("overscroll-behavior", "none");

		$("body").css({
			position: "fixed",
			top: `-${y}px`,
			left: "0",
			right: "0",
			width: "100%",
			overflow: "hidden",
		});
	},
	unlockPageScroll() {
		if ($("body").data("scroll-locked") !== "1") return;
		$("body").removeClass("page-lock");

		$("body").css("padding-right", "0");
		$("html").css("overscroll-behavior", "");

		const y =
			Math.abs(parseInt($("body").css("top") || "0", 10)) ||
			$("body").data("scroll-y") ||
			0;

		$("body").css({
			position: "",
			top: "",
			left: "",
			right: "",
			width: "",
			overflow: "",
		});

		$("body").removeData("scroll-locked");
		$("body").removeData("scroll-y");
		$(window).scrollTop(y);
	},
};
