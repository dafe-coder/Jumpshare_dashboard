const Helpers = {
	isMobile() {
		return window.innerWidth < 1024;
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
		if (document.body.dataset.scrollLocked === "1") return;
		$("body").addClass("page-lock");

		const hasVScroll = this.pageHasVerticalScrollbar();
		const sw = this.getScrollbarWidth();
		if (sw > 0 && hasVScroll) {
			$("body").css("padding-right", `${sw}px`);
		}

		const y = window.scrollY || window.pageYOffset || 0;
		document.body.dataset.scrollLocked = "1";
		document.body.dataset.scrollY = String(y);
		document.documentElement.style.overscrollBehavior = "none";

		const b = document.body;
		b.style.position = "fixed";
		b.style.top = `-${y}px`;
		b.style.left = "0";
		b.style.right = "0";
		b.style.width = "100%";
		b.style.overflow = "hidden";
	},
	unlockPageScroll() {
		if (document.body.dataset.scrollLocked !== "1") return;
		$("body").removeClass("page-lock");

		$("body").css("padding-right", "0");
		document.documentElement.style.overscrollBehavior = "";

		const b = document.body;
		const y =
			Math.abs(parseInt(b.style.top || "0", 10)) ||
			Number(document.body.dataset.scrollY) ||
			0;
		b.style.position = "";
		b.style.top = "";
		b.style.left = "";
		b.style.right = "";
		b.style.width = "";
		b.style.overflow = "";

		delete document.body.dataset.scrollLocked;
		delete document.body.dataset.scrollY;
		window.scrollTo(0, y);
	},
};
