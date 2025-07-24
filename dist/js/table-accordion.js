const TableAccordion = {
	init: function () {
		this.accordions = $(".table-accordion-wrapper");
		this.initAccordion();
	},
	initAccordion: function () {
		const openAccordionLinks = $(".table-accordion-open");

		openAccordionLinks.on("click", function (e) {
			e.preventDefault();
			const wasActive = $(this).hasClass("active");

			$(".table-accordion-body").slideUp(250);
			$(".table-accordion-open").removeClass("active");
			$(".table-accordion-icon").removeClass("-scale-100");

			if (!wasActive) {
				const wrapper = $(this).closest(".table-accordion-wrapper");
				const body = wrapper.find(".table-accordion-body");
				const icon = wrapper.find(".table-accordion-icon");
				icon.addClass("-scale-100");
				body.slideDown(250);
				$(this).addClass("active");
			}
		});
	},
};

$(document).ready(() => {
	TableAccordion.init();
});
