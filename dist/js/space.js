$(document).ready(function () {
	const spaceName = $("#space-name");
	const spaceIcon = $("#space-icon");

	spaceName.on("input", function (e) {
		const value = spaceName.val().trimStart();

		if (value.length > 0) {
			spaceIcon.find("span").text(value[0]);
			spaceIcon.addClass("space-icon-active");
		} else {
			spaceIcon.find("span").text("S");
			spaceIcon.removeClass("space-icon-active");
		}
	});

	// Pick color icon
	const colorIcon = $("#pick-color-icons li");

	colorIcon.on("click", function () {
		spaceIcon.removeClass("space-icon-active");
		const color = $(this).css("color");
		colorIcon.removeClass("active");

		$(this).addClass("active");
		spaceIcon.css({
			"background-color": color,
			"border-color": color,
			color: "#fff",
		});
	});
});
