// SVG sprite
fetch('assets/icons-sprite.svg')
.then(response => response.text())
.then(svg => {
	const div = document.createElement('div');
	div.innerHTML = svg;
	document.body.insertBefore(div.firstChild, document.body.firstChild);
});

$(document).ready(function() {

	// Tabs
	const tabs = $('[data-tab-id]');
	tabs.on('click', function(e) {
		e.preventDefault();
		const tabId = $(this).attr('data-tab-id');
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$(`[data-tab-content-id="${tabId}"]`).addClass('active');
		$(`[data-tab-content-id="${tabId}"]`).siblings().removeClass('active');
	});


	// Select files \ folders
	const selectWrapper = $('.selected-wrapper');	
	const selectItem = $('[data-select-item]');
	const titleLibrary = $('#title-library');
	const titleLibraryTextDefault = titleLibrary.text();
	const defaultSelectBtnCode = $('.is-select-btn').html();
	
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
			$('.is-select-btn').html(defaultSelectBtnCode);
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
		$('.is-select-btn').html(defaultSelectBtnCode);
	});

	$('.is-select-btn').on('click', function(e) {
		e.preventDefault();
		$(this).toggleClass('active-select');
		if($(this).hasClass('active-select')) {
			$(this).html('Cancel');
		} else {
			$(this).html(defaultSelectBtnCode);
		}
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
	
	// Upload files
	const uploadFilesModal = $('#upload-files-modal');
	$('#upload-files-btn').on('click', function(e) {
		e.preventDefault();
		uploadFilesModal.addClass('active');
	});

	uploadFilesModal.on('click', function(e) {
		e.preventDefault();
		if(!e.target.closest('.upload-files-drop-zone')) {
			uploadFilesModal.removeClass('active');
		}
	});

	// Fake loading
	const fakeLoading = $('.fake-loading');
	const fakeLoadingContent = $('.fake-loading-content');
	fakeLoadingContent.addClass('hidden!');

	setTimeout(() => {
		fakeLoading.addClass('hidden!');
		fakeLoadingContent.removeClass('hidden!');
	}, 2000);


	// Drag and drop
	const dragAndDrop = $('.drag-and-drop');
	let dragCounter = 0;
	
	dragAndDrop.on('dragenter', function(e) {
		e.preventDefault();
		dragCounter++;

		if(dragCounter === 1) {
			uploadFilesModal.addClass('active');
			dragAndDrop.addClass('active');
		}
	});

	dragAndDrop.on('dragleave', function(e) {
		e.preventDefault();
		dragCounter--;

		if(dragCounter === 0) {
			uploadFilesModal.removeClass('active');
			dragAndDrop.removeClass('active');
		}
	});

	dragAndDrop.on('drop', function(e) {
		e.preventDefault();
		dragCounter = 0;
		uploadFilesModal.removeClass('active');
		dragAndDrop.removeClass('active');
	});

	dragAndDrop.on('dragend', function(e) {
		e.preventDefault();
		dragCounter = 0;
		uploadFilesModal.removeClass('active');
		dragAndDrop.removeClass('active');
	});
	

	// Header scroll hide
	let lastScrollTop = 0;
	let header = $('header');
	let headerHeight = header.outerHeight();
	let isScrolling = false;
	let documentHeight = $(document).height() - $(window).height();

	$(window).scroll(function() {
		if (!isScrolling && window.innerWidth < 1024) {
			window.requestAnimationFrame(function() {
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
						'transform': 'translateY(-100%)',
					});
					$('.subheader-nav').addClass('top-0!');
				} else {
					header.css({
						'transform': 'translateY(0)',
					});
					$('.subheader-nav').removeClass('top-0!');
				}

				lastScrollTop = currentScroll;
				isScrolling = false;
			});
		}
		isScrolling = true;
	});

	$(window).resize(function() {
		documentHeight = $(document).height() - $(window).height();
	});
});
