$(document).ready(function() {
	let dropdownIdTimer = null;
	const dropdownWrappers = $('.dropdown-wrapper');

	$('.dropdown-button').on('click', function(e) {
		if(window.innerWidth > 1024) {
			e.preventDefault();
			const dropdownId = $(this).attr('data-id');
			
			const dropdownWrapper = $(this).closest('.dropdown-wrapper');
			const dropdownContent = dropdownWrapper.find(`.dropdown-content[data-dropdown-id="${dropdownId}"]`);
			$('.dropdown-content').removeClass('active');
			$('.dropdown-content').css('display', 'none');
			$('.dropdown-wrapper').removeClass('active');
			$('.dropdown-button').removeClass('active');

			$(this).toggleClass('active');
			dropdownWrapper.toggleClass('active');
			if($(this).hasClass('active')) {
				dropdownContent.css('display', 'block');
				clearTimeout(dropdownIdTimer);
				dropdownIdTimer = setTimeout(() => {
					dropdownContent.addClass('active');
				}, 10);
			} else {
				$('.dropdown-content').removeClass('active');
				$('.dropdown-content').css('display', 'none');
			}
		}
	});

	$(document).on('click', function(e) {
		const dropdown = $(e.target).closest('.dropdown-wrapper');
		
		if (!dropdown.length) {
			const dropdownContent = $('.dropdown-wrapper .dropdown-content');
			const dropdownButton = $('.dropdown-wrapper .dropdown-button');
			dropdownContent.removeClass('active');
			dropdownButton.removeClass('active');
			$('.dropdown-wrapper').removeClass('active');
			clearTimeout(dropdownIdTimer);
			dropdownIdTimer = setTimeout(() => {
				dropdownContent.css('display', 'none');
			}, 150);
		}
	});

	// Mobile select list type
	$('[data-id="dropdown-grid"]').on('click', function(e) {
		if(window.innerWidth < 1024) {
			e.preventDefault();
			e.stopImmediatePropagation();
			const dropdownButton = $(this).closest('.dropdown-wrapper').find('.dropdown-button');
			const svgTypeList = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M7 6H18M7 12H18M7 18H18" stroke="#122345" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
			</svg>`
			const svgTypeGrid = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="5.5" y="5.5" width="5" height="5" fill="white" stroke="#122345"></rect>
				<rect x="13.5" y="5.5" width="5" height="5" fill="white" stroke="#122345"></rect>
				<rect x="5.5" y="13.5" width="5" height="5" fill="white" stroke="#122345"></rect>
				<rect x="13.5" y="13.5" width="5" height="5" fill="white" stroke="#122345"></rect>
			</svg>`

			$(this).toggleClass('active-mobile');
			if(!$(this).hasClass('active-mobile')) {
				dropdownButton.find('svg').replaceWith(svgTypeGrid);
				updateContentType();
			} else {
				dropdownButton.find('svg').replaceWith(svgTypeList);
				updateContentType('list');
			}
		}
	});


	// Select Type

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
		updateContentType(contentType);
	});

	function updateContentType(contentType) {
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
	}

	// Select files
	const selectWrapper = $('.selected-wrapper');	
	const selectItem = $('[data-select-item]');
	const titleLibrary = $('#title-library');
	const titleLibraryTextDefault = titleLibrary.text();
	
	selectItem.on('change', function(e) {
		const selectedItems = selectItem.filter(':checked');
		$(this).closest('a').toggleClass('active-select');

		if (selectedItems.length > 0) {
			selectWrapper.css('display', 'flex');
			selectWrapper.siblings('div').css('display', 'none');
			selectWrapper.addClass('active');
			titleLibrary.text(selectedItems.length + ' Items');
			$('[data-content-type]').addClass('list-select-active');
		} else {
			selectWrapper.removeClass('active');	
			selectWrapper.css('display', 'none');
			selectWrapper.siblings('div').css('display', 'flex');
			titleLibrary.text(titleLibraryTextDefault);
			$('[data-content-type]').removeClass('list-select-active');
			$('.is-select-btn').text('Select');
		}
	});

	$('.close-selected-wrapper').on('click', function(e) {
		e.preventDefault();
		$('.dropdown-wrapper').removeClass('active-select');
		selectWrapper.removeClass('active');
		selectWrapper.css('display', 'none');
		selectWrapper.siblings('div').css('display', 'flex');
		selectItem.prop('checked', false);
		titleLibrary.text(titleLibraryTextDefault);
		$('[data-content-type]').removeClass('list-select-active');
		$('.is-select-btn').text('Select');
	});

	$('.is-select-btn').on('click', function(e) {
		e.preventDefault();
		$(this).text($(this).text() === 'Cancel' ? 'Select' : 'Cancel');
		$('[data-content-type]').toggleClass('list-select-active');
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
		$('aside').toggleClass('active');
	});

	$('.mobile-menu-overlay').on('click', function() {
		if($('aside').hasClass('active') && window.innerWidth < 1024) {
			$('aside').removeClass('active');
			$(".hamburger").removeClass('is-active');
		}
	});
});
