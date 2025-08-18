const Sidebar = {
	init() {
		this.initElements();
	},
	initElements() {
		this.sidebarNavItems = document.querySelectorAll(".aside-nav-item");

		if (this.sidebarNavItems.length > 0) {
			const currentPath = window.location.pathname;
			const currentPage = currentPath.split("/").pop();

			this.sidebarNavItems.forEach((item) => {
				const itemPath = item.getAttribute("href");
				const baseFileName = itemPath.split("/").pop();

				const isActive = [
					baseFileName,
					baseFileName.replace(".html", "-free.html"),
					baseFileName.replace(".html", "-state.html"),
					baseFileName.replace(".html", "-empty.html"),
				].includes(currentPage);

				if (isActive) {
					item.classList.add("active");
				}
			});
		}
	},
};

document.addEventListener("DOMContentLoaded", () => {
	Sidebar.init();
});
