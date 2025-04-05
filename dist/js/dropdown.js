const Dropdown = {
	dropdownIdTimer: null,
	resizeTimer: null,

	init() {	
		this.dropdownIdTimer = null;
		this.resizeTimer = null;
		this.dropdownWrappers = $('.dropdown-wrapper');
		this.dropdownButtons = $('.dropdown-button');
		this.dropdownContents = $('.dropdown-content');
		this.subMenuItems = $('.sub-menu-item');
		this.bootstrap();
		this.adjustElementPositionOnResize();
		this.initGridDropdown();
		this.initMobileGridDropdown();
	},

	bootstrap() {
		this.dropdownButtons.on('click', (e) => {
			this.handleDropdownClick(e);
		});

		this.subMenuItems.on('click', (e) => {
			this.handleSubMenuItemClick(e);
		});

		$(document).on('click', (e) => {
			this.handleDocumentClick(e);
		});
	},

	handleDropdownClick(e) {
		e.preventDefault();
		const $button = $(e.currentTarget);
		const dropdownId = $button.attr('data-id');
		
		const $wrapper = $button.closest('.dropdown-wrapper');
		const $content = $wrapper.find(`.dropdown-content[data-dropdown-id="${dropdownId}"]`);
		
		if(!$button.hasClass('active')) {
			this.subMenuItems.removeClass('active');
			this.dropdownContents.removeClass('active').css('display', 'none');
			this.dropdownWrappers.removeClass('active');
			this.dropdownButtons.removeClass('active');
			$button.addClass('active');
			$wrapper.addClass('active');
			$content.css('display', 'block');
			
			clearTimeout(this.dropdownIdTimer);
			this.dropdownIdTimer = setTimeout(() => {
				$content.addClass('active');
				this.adjustElementPosition($content);
			}, 10);
		} else {
			$button.removeClass('active');
			$wrapper.removeClass('active');
			$content.removeClass('active').css('display', 'none');
		}
	},

	handleSubMenuItemClick(e) {
		e.preventDefault();
		const $item = $(e.currentTarget);
		const $content = $item.find('.dropdown-content');
		
		this.subMenuItems.not($item).removeClass('active');
		this.subMenuItems.not($item).find('.dropdown-content').css('display', 'none');
		
		if(!$item.hasClass('active')) {
			$item.addClass('active');
			$content.css('display', 'block');
			this.adjustElementPosition($content);
		} else {
			$item.removeClass('active');
			$content.css('display', 'none');
		}
	},

	handleDocumentClick(e) {
		const $dropdown = $(e.target).closest('.dropdown-wrapper');
		
		if (!$dropdown.length) {
			this.dropdownContents.removeClass('active').css('display', 'none');
			this.dropdownButtons.removeClass('active');
			this.dropdownWrappers.removeClass('active');
			this.subMenuItems.removeClass('active');
			
			clearTimeout(this.dropdownIdTimer);
			this.dropdownIdTimer = setTimeout(() => {
				this.dropdownContents.css('display', 'none');
			}, 150);
		}
	},

	adjustElementPosition($element) {
		const hasSubContent = $element.closest('.sub-menu-item').children('.dropdown-sub-content').length > 0;
			
		if($element.attr('data-dropdown-id') === 'dropdown-settings' || hasSubContent) {
			$element.css({
				'top': '10px',
				'left': '100%',
				'right': 'auto'
			});
		}
		
		const rect = $element[0].getBoundingClientRect();
		const viewportHeight = $(window).height();
		const viewportWidth = $(window).width();
		
		if (rect.bottom > viewportHeight) {
			const overflowBottom = rect.bottom - viewportHeight;
			const newTop = parseInt($element.css('top')) - overflowBottom - 20;
			$element.css('top', newTop + 'px');
		}
		
		if (rect.right > viewportWidth && ($element.attr('data-dropdown-id') === 'dropdown-settings' || hasSubContent)) {
			$element.addClass('adjust-position-right')
				.css({
					'left': 'auto',
					'right': '100%'
				});
		}
	},

	adjustElementPositionOnResize() {
		$(window).on('resize', () => {
			clearTimeout(this.resizeTimer);
			this.resizeTimer = setTimeout(() => {
				const $activeDropdown = this.dropdownContents.filter('.active');
				if ($activeDropdown.length) {
					this.adjustElementPosition($activeDropdown);
				}
			}, 50);
		});
	},

	initGridDropdown() {
		$("[data-dropdown-id='dropdown-grid'] a").on("click", (e) => {
			e.preventDefault();
			const $button = $(e.currentTarget).closest('.dropdown-wrapper').find('.dropdown-button');
			const $content = $(e.currentTarget).closest('.dropdown-content');
			const $svg = $(e.currentTarget).find('svg');

			$button.find('svg').replaceWith($svg.clone());
			$button.removeClass('active');
			this.dropdownWrappers.removeClass('active');
			$content.removeClass('active');
			
			clearTimeout(this.dropdownIdTimer);
			this.dropdownIdTimer = setTimeout(() => {
				$content.css('display', 'none');
			}, 150);

			const contentType = $(e.currentTarget).attr('data-link-type');
			this.updateContentType(contentType);
		});
	},

	updateContentType(contentType) {
		const $contentTypeElements = $(`[data-content-type]`);
		switch(contentType) {
			case 'list':
				$contentTypeElements.addClass('list-type').removeClass('grid-type');
				break;
			case 'grid':
				$contentTypeElements.addClass('grid-type').removeClass('list-type');
				break;
			default:
				$contentTypeElements.removeClass('list-type grid-type');
				break;
		}
	},

	initMobileGridDropdown() {
		$('[data-id="dropdown-grid"]').on('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			
			if(window.innerWidth < 1024) {
				const $button = $(e.currentTarget).closest('.dropdown-wrapper').find('.dropdown-button');
				const svgTypeList = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M7 6H18M7 12H18M7 18H18" stroke="#122345" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
				</svg>`;
				const svgTypeGrid = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="5.5" y="5.5" width="5" height="5" fill="white" stroke="#122345"></rect>
					<rect x="13.5" y="5.5" width="5" height="5" fill="white" stroke="#122345"></rect>
					<rect x="5.5" y="13.5" width="5" height="5" fill="white" stroke="#122345"></rect>
					<rect x="13.5" y="13.5" width="5" height="5" fill="white" stroke="#122345"></rect>
				</svg>`;

				$(e.currentTarget).toggleClass('active-mobile');
				if(!$(e.currentTarget).hasClass('active-mobile')) {
					$button.find('svg').replaceWith(svgTypeGrid);
					this.updateContentType();
				} else {
					$button.find('svg').replaceWith(svgTypeList);
					this.updateContentType('list');
				}
			}
		});
	}
};

$(document).ready(() => {
	Dropdown.init();
});