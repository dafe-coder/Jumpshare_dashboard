const Helpers = {
	isMobile: window.innerWidth < 1024,
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
	lockPageScroll() {
		const hasVScroll = this.pageHasVerticalScrollbar();
		if (this.getScrollbarWidth() > 0 && hasVScroll) {
			$("html").css("padding-right", `${this.getScrollbarWidth()}px`);
		}
		$("body").addClass("overflow-hidden");
	},
	unlockPageScroll() {
		$("html").css("padding-right", "0");
		$("body").removeClass("overflow-hidden");
	},
};
