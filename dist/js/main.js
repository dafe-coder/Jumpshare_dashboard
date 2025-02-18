$(document).ready(function() {
	let dropdownIdTimer = null;
	const dropdownWrappers = $('.dropdown-wrapper');

	$('.dropdown-button').on('click', function(e) {
		e.preventDefault();
		const dropdownId = $(this).attr('id');
		const dropdownWrapper = $(this).closest('.dropdown-wrapper');
		const dropdownContent = dropdownWrapper.find(`.dropdown-content[data-dropdown-id="${dropdownId}"]`);

		$(this).toggleClass('active');
		dropdownWrapper.toggleClass('active');
		dropdownContent.css('display', 'block');
		clearTimeout(dropdownIdTimer);
		dropdownIdTimer = setTimeout(() => {
			dropdownContent.toggleClass('active');
		}, 150);
	});

	$('.dropdown-wrapper').on('mouseleave', function(e) {
		const dropdownContent = $(this).find('.dropdown-content');
		const dropdownButton = $(this).find('.dropdown-button');
		dropdownContent.removeClass('active');
		dropdownButton.removeClass('active');
		$(this).removeClass('active');
		clearTimeout(dropdownIdTimer);
		dropdownIdTimer = setTimeout(() => {
			dropdownContent.css('display', 'none');
		}, 150);
	});


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

		const contentType = $(this).attr('data-link-type');
		const contentTypeElements = $(`[data-content-type]`);
		switch(contentType) {
			case 'list':
				contentTypeElements.addClass('list-type');
				contentTypeElements.removeClass('grid-type');
				break;
			case 'grid':
				contentTypeElements.addClass('grid-type');
				contentTypeElements.removeClass('list-type');
				break;
			default:
				contentTypeElements.removeClass('list-type');
				contentTypeElements.removeClass('grid-type');
				break;
		}
	
	});

	// Select files
	const selectWrapper = $('.selected-wrapper');	
	const selectItem = $('[data-select-item]');

	selectItem.on('change', function(e) {
		const selectedItems = selectItem.filter(':checked');
		if (selectedItems.length > 0) {
			selectWrapper.css('display', 'flex');
			clearTimeout(dropdownIdTimer);
			dropdownIdTimer = setTimeout(() => {
				selectWrapper.addClass('active');
			}, 10);
		} else {
			selectWrapper.removeClass('active');
			dropdownIdTimer = setTimeout(() => {
				selectWrapper.css('display', 'none');
			}, 300);
		}
		selectWrapper.find('.selected-count').text(selectedItems.length);
	});

	$('.close-selected-wrapper').on('click', function(e) {
		e.preventDefault();
		selectWrapper.removeClass('active');
		clearTimeout(dropdownIdTimer);
		dropdownIdTimer = setTimeout(() => {
			selectWrapper.css('display', 'none');
		}, 300);
		selectItem.prop('checked', false);
	});


	// Mobile search
	function updatePlaceholder() {
		const input = $('input[data-mobile-placeholder]');
		if (input.length) {
			const isMobile = window.innerWidth < 790;
			input.attr('placeholder', isMobile ? input.data('mobilePlaceholder') : 'Search for people, Files, folder & spaces');
		}
	}
	
	window.addEventListener('resize', updatePlaceholder);
	updatePlaceholder();
	
	// Mobile menu
	$(".hamburger").on('click', function() {
		$(this).toggleClass('is-active');
	});
});
