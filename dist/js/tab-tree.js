const TabTree = {
	init: function () {
		this.initTabTree();
	},
	initTabTree: function () {
		const tabTreeItems = $("[data-tab-tree-id]");
		if (tabTreeItems.length === 0) {
			return;
		}
		tabTreeItems.on("click", function (e) {
			e.preventDefault();
			const targetTab = $(e.currentTarget);
			const targetTabId = targetTab.attr("data-tab-tree-id");

			const tabContent = targetTab
				.closest("[data-tab-tree-wrapper]")
				.find(`[data-tab-tree-content="${targetTabId}"]`);

			tabContent.removeClass("hidden");
			tabContent.siblings("[data-tab-tree-content]").addClass("hidden");

			targetTab.addClass("active");
			targetTab.siblings("[data-tab-tree-id]").removeClass("active");
		});
	},
};

$(document).ready(function () {
	TabTree.init();
});
