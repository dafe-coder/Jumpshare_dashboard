// SVG sprite
fetch("assets/icons-sprite.svg")
	.then((response) => response.text())
	.then((svg) => {
		const div = document.createElement("div");
		div.innerHTML = svg;
		document.body.insertBefore(div.firstChild, document.body.firstChild);
	});
fetch("assets/menu-icons-sprite.svg")
	.then((response) => response.text())
	.then((svg) => {
		const div = document.createElement("div");
		div.innerHTML = svg;
		document.body.insertBefore(div.firstChild, document.body.firstChild);
	});

$(document).ready(function () {
	// Lazy images
	const lazyImages = document.querySelectorAll(".lazy-image");

	if ("IntersectionObserver" in window) {
		const imageObserver = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const img = entry.target;
						img.src = img.getAttribute("data-src");
						img.srcset = img.getAttribute("data-srcset");
						img.classList.remove("lazy-image");
						observer.unobserve(img);
					}
				});
			},
			{
				rootMargin: "1500px",
			},
		);

		lazyImages.forEach((image) => {
			imageObserver.observe(image);
		});
	} else {
		lazyImages.forEach((img) => {
			img.src = img.getAttribute("data-src");
			img.srcset = img.getAttribute("data-srcset");
			img.classList.remove("lazy-image");
		});
	}

	// Collapse sidebar
	const collapseSidebarBtn = $("#collapse-sidebar-btn");
	collapseSidebarBtn.on("click", function (e) {
		e.preventDefault();
		const sidebar = $("aside");
		sidebar.toggleClass("active-sidebar");
		collapseSidebarBtn.toggleClass("active-collapse-sidebar-btn");
		console.log(sidebar.width());

		sidebar.width(sidebar.width() === 240 ? 64 : 240);
	});

	// Tabs
	const tabs = $("[data-tab-id]");
	tabs.on("click", function (e) {
		e.preventDefault();
		const tabId = $(this).attr("data-tab-id");
		$(this).addClass("active");
		$(this).siblings().removeClass("active");
		$(`[data-tab-content-id="${tabId}"]`).addClass("active");
		$(`[data-tab-content-id="${tabId}"]`).siblings().removeClass("active");
	});

	// Select files \ folders
	const selectWrapper = $(".selected-wrapper");
	const selectItem = $("[data-select-item]");
	const titleLibrary = $("#title-library");
	const titleLibraryTextDefault = titleLibrary.text();

	selectItem.on("change", function (e) {
		const selectedItems = selectItem.filter(":checked");
		$(this).closest("a").toggleClass("active-select");

		if (selectedItems.length > 0) {
			selectWrapper.css("display", "flex");
			selectWrapper.siblings("div").css("display", "none");
			selectWrapper.addClass("active");
			titleLibrary.text(selectedItems.length + " Items");
			$("[data-content-type]").addClass("list-select-active");
		} else {
			selectWrapper.removeClass("active");
			selectWrapper.css("display", "none");
			selectWrapper.siblings("div").css("display", "flex");
			titleLibrary.text(titleLibraryTextDefault);
			$("[data-content-type]").removeClass("list-select-active");
		}
	});

	$(".close-selected-wrapper").on("click", function (e) {
		e.preventDefault();
		$(".dropdown-wrapper").removeClass("active-select");
		selectWrapper.removeClass("active");
		selectWrapper.css("display", "none");
		selectWrapper.siblings("div").css("display", "flex");
		selectItem.prop("checked", false);
		titleLibrary.text(titleLibraryTextDefault);
		$("[data-content-type]").removeClass("list-select-active");
	});

	$(".is-select-btn").on("click", function (e) {
		e.preventDefault();
		$(this).toggleClass("active-select");
		$("[data-content-type]").toggleClass("list-select-active");
	});

	// Mobile search
	function updatePlaceholder() {
		const input = $("input[data-mobile-placeholder]");
		if (input.length) {
			const isMobile = window.innerWidth < 790;
			input.attr(
				"placeholder",
				isMobile
					? input.data("mobilePlaceholder")
					: "Search for people, Files, folder & spaces",
			);
		}
	}

	window.addEventListener("resize", updatePlaceholder);
	updatePlaceholder();

	// Upload files
	const uploadFilesModal = $("#upload-files-modal");
	$("#upload-files-btn").on("click", function (e) {
		e.preventDefault();
		uploadFilesModal.addClass("active");
	});

	uploadFilesModal.on("click", function (e) {
		e.preventDefault();
		if (!e.target.closest(".upload-files-drop-zone")) {
			uploadFilesModal.removeClass("active");
		}
	});

	// Fake loading
	const fakeLoading = $(".fake-loading");
	const fakeLoadingContent = $(".fake-loading-content");
	fakeLoadingContent.addClass("hidden!");

	setTimeout(() => {
		fakeLoading.addClass("hidden!");
		fakeLoadingContent.removeClass("hidden!");
	}, 2000);

	// Drag and drop
	const dragAndDrop = $(".drag-and-drop");
	let dragCounter = 0;

	dragAndDrop.on("dragenter", function (e) {
		e.preventDefault();
		const dataTransfer = e.originalEvent.dataTransfer;

		if (dataTransfer.types.includes("Files")) {
			dragCounter++;

			if (dragCounter === 1) {
				uploadFilesModal.addClass("active");
				dragAndDrop.addClass("active");
			}
		}
	});

	dragAndDrop.on("dragover", function (e) {
		e.preventDefault();
		const dataTransfer = e.originalEvent.dataTransfer;

		if (dataTransfer.types.includes("Files")) {
			dataTransfer.dropEffect = "copy";
		}
	});

	dragAndDrop.on("dragleave", function (e) {
		e.preventDefault();
		const dataTransfer = e.originalEvent.dataTransfer;

		if (dataTransfer.types.includes("Files")) {
			dragCounter--;

			if (dragCounter === 0) {
				uploadFilesModal.removeClass("active");
				dragAndDrop.removeClass("active");
			}
		}
	});

	dragAndDrop.on("drop", function (e) {
		e.preventDefault();
		const dataTransfer = e.originalEvent.dataTransfer;

		if (dataTransfer.types.includes("Files")) {
			const files = Array.from(dataTransfer.files);
			const validFiles = files.filter((file) => {
				const type = file.type;
				return (
					type.startsWith("image/") ||
					type.startsWith("video/") ||
					type.startsWith("application/")
				);
			});

			if (validFiles.length > 0) {
				// Здесь можно добавить обработку загруженных файлов
				console.log("Valid files dropped:", validFiles);
			}
		}

		dragCounter = 0;
		uploadFilesModal.removeClass("active");
		dragAndDrop.removeClass("active");
	});

	dragAndDrop.on("dragend", function (e) {
		e.preventDefault();
		const dataTransfer = e.originalEvent.dataTransfer;

		if (dataTransfer.types.includes("Files")) {
			dragCounter = 0;
			uploadFilesModal.removeClass("active");
			dragAndDrop.removeClass("active");
		}
	});

	// Header scroll hide
	let lastScrollTop = 0;
	let header = $("header");
	let headerHeight = header.outerHeight();
	let isScrolling = false;
	let documentHeight = $(document).height() - $(window).height();

	$(window).scroll(function () {
		if (!isScrolling && window.innerWidth < 1024) {
			window.requestAnimationFrame(function () {
				let currentScroll = $(window).scrollTop();

				if (currentScroll < 0 || currentScroll > documentHeight) {
					isScrolling = false;
					return;
				}

				if (Math.abs(currentScroll - lastScrollTop) < 5) {
					isScrolling = false;
					return;
				}

				if (currentScroll > lastScrollTop && currentScroll > headerHeight) {
					header.css({
						top: "-100%",
						transition: "top 0.3s ease",
					});
					$(".subheader-nav").addClass("top-0!");
				} else {
					header.css({
						top: "0",
						transition: "top 0.3s ease",
					});
					$(".subheader-nav").removeClass("top-0!");
				}

				lastScrollTop = currentScroll;
				isScrolling = false;
			});
		}
		isScrolling = true;
	});

	$(window).resize(function () {
		documentHeight = $(document).height() - $(window).height();
	});

	// Define browser UI height
	function updateBrowserUIHeight() {
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.clientHeight;
		const browserUIHeight = windowHeight - documentHeight;
		document.documentElement.style.setProperty(
			"--browser-ui-height",
			`${browserUIHeight}px`,
		);
	}
	// Update when loading and window resize
	updateBrowserUIHeight();
	window.addEventListener("resize", updateBrowserUIHeight);

	// Progress bar
	function showProgressBar() {
		const progressBar = $("#progress-bar");

		progressBar
			.css("width", "0%")
			.removeClass("scale-x-0")
			.addClass("scale-x-100");

		progressBar.animate(
			{
				width: "100%",
			},
			1000,
			"linear",
			function () {
				setTimeout(hideProgressBar, 200);
			},
		);
	}

	function hideProgressBar() {
		$("#progress-bar")
			.removeClass("scale-x-100")
			.addClass("scale-x-0")
			.css("width", "0%");
	}

	$(document).ready(function () {
		showProgressBar();
	});

	$(document).on("click", 'a[href]:not([href=""])', function (e) {
		const link = $(this);
		const href = link.attr("href");
		if (
			href &&
			href !== "#" &&
			!link.attr("target") &&
			!e.ctrlKey &&
			!e.metaKey
		) {
			showProgressBar();
		}
	});

	// Settings tab
	const tabNav =
		document.querySelector(".grid[data-tab-nav]") ||
		document.querySelector(".grid");
	if (!tabNav) return;

	const tabButtons = tabNav.querySelectorAll("[data-settings-tab-id]");
	const tabContents = document.querySelectorAll("[data-settings-tab-content]");
	const slider = tabNav.querySelector(".settings-tab-slider");

	function activateTab(idx) {
		tabContents.forEach((el, i) => {
			el.classList.toggle("hidden", i !== idx);
		});
		tabButtons.forEach((btn, i) => {
			btn.classList.toggle("text-dark-800", i === idx);
			btn.classList.toggle("font-medium", i === idx);
		});
		if (slider) {
			const percent = 100 / tabButtons.length;
			slider.style.width = `calc(${percent}%)`;
			slider.style.transition =
				"left 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1)";

			if (idx === 0) {
				slider.style.left = "4px";
			} else if (idx === tabButtons.length - 1) {
				slider.style.left = `calc(${percent * idx}% - 4px)`;
			} else {
				slider.style.left = `calc(${percent * idx}% + 4px)`;
			}
		}
	}

	tabButtons.forEach((btn, idx) => {
		btn.addEventListener("click", () => activateTab(idx));
	});

	activateTab(0);
});
