$(document).ready(function() {
	let dropdownIdTimer = null;
	const dropdownWrappers = $('.dropdown-wrapper');

	$('.dropdown-button').on('click', function(e) {
		e.preventDefault();
		const dropdownId = $(this).attr('id');
		const dropdownWrapper = $(this).closest('.dropdown-wrapper');
		const dropdownContent = dropdownWrapper.find(`.dropdown-content[data-dropdown-id="${dropdownId}"]`);
		
		dropdownWrapper.toggleClass('active');
		dropdownContent.css('display', 'block');
		clearTimeout(dropdownIdTimer);
		dropdownIdTimer = setTimeout(() => {
			dropdownContent.toggleClass('active');
		}, 150);
	});

	$('.dropdown-wrapper').on('mouseleave', function(e) {
		const dropdownContent = $(this).find('.dropdown-content');
		dropdownContent.removeClass('active');
		$(this).removeClass('active');
		clearTimeout(dropdownIdTimer);
		dropdownIdTimer = setTimeout(() => {
			dropdownContent.css('display', 'none');
		}, 150);
	});

	const content = $('[data-content-type]');

	$("[data-dropdown-id='dropdown-grid'] a").on("click", function(e) {
		e.preventDefault();
		const dropdownButton = $(this).closest('.dropdown-wrapper').find('.dropdown-button');
		const dropdownContent = $(this).closest('.dropdown-content');
		const svg = $(this).find('svg');

		dropdownButton.find('svg').replaceWith(svg.clone());
		dropdownButton.removeClass('active');
		dropdownWrappers.removeClass('active');
		dropdownContent.removeClass('active');
		clearTimeout(dropdownIdTimer);
		dropdownIdTimer = setTimeout(() => {
			dropdownContent.css('display', 'none');
		}, 150);
		
		content.addClass('hidden');
		const contentType = $(this).attr('data-link-type');
		const contentTypeElements = $(`[data-content-type="${contentType}"]`);
		contentTypeElements.removeClass('hidden');

		if(contentType === 'list') {
			contentTypeElements.addClass('flex');
		} else {
			contentTypeElements.addClass('grid');
		}
	
	});

});
