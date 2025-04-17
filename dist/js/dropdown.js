const Dropdown = {
	dropdownIdTimer: null,
	resizeTimer: null,
	sheets: {},
	activeSheet: null,
	isDragging: false,
	dragStartY: 0,
	isMobile: window.innerWidth < 1024,
	showSheetTimeout: null,
	scrollbarWidth: 0,

	init() {	
		this.dropdownIdTimer = null;
		this.resizeTimer = null;
		this.scrollbarWidth = this.getScrollbarWidth();
		this.dropdownWrappers = $('.dropdown-wrapper');
		this.dropdownButtons = $('.dropdown-button');
		this.dropdownContents = $('.js-dropdown');
		this.subMenuItems = $('.sub-menu-item');
		this.initializeSheets();
		this.bootstrap();
		this.adjustElementPositionOnResize();
		this.initGridDropdown();
		this.initMobileGridDropdown();
	},

	initializeSheets() {
		$('[data-sheet-modal]').each((_, element) => {
			const $sheet = $(element);
			const sheetId = $sheet.data('dropdown-id');
			
			this.sheets[sheetId] = {
				element: $sheet,
				overlay: $sheet.find('.js-dropdown-overlay'),
				body: $sheet.find('.js-dropdown-body'),
				content: $sheet.find('.js-dropdown-content'),
				trigger: $sheet.find('.js-dropdown-trigger'),
				height: 0,
				defaultHeight: 0
			};
		});
	},

	bootstrap() {
		this.dropdownContents.on('click', (e) => {
			e.preventDefault();
		});

		this.dropdownButtons.on('click', (e) => {
			const $button = $(e.currentTarget);
			const dropdownId = $button.attr('data-id');
			
			if (this.isMobile) {
				e.preventDefault();
				e.stopImmediatePropagation();
				this.openSheet(dropdownId);
				$('html').addClass('overflow-hidden');
			} else {
				this.handleDropdownClick(e);
			}
		});

		this.subMenuItems.on('click', (e) => {
			this.handleSubMenuItemClick(e);
		});

		$(document).on('click', (e) => {
			this.handleDocumentClick(e);
		});

		$('[data-dropdown-sub-id]').on('click', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			const itemId = $(e.currentTarget).data('dropdown-sub-id');
			this.openSubMenu(itemId);
		});
		
		$('.js-dropdown-sub-list .go-back').on('click', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.closeSubMenu();
		});
		
		$('.js-dropdown-trigger').on('mousedown touchstart', (e) => {
			e.preventDefault();
			this.handleDragStart(e);
		});
		
		$(window).on('mousemove touchmove', (e) => {
			e.preventDefault();
			this.handleDragMove(e);
		});
		
		$(window).on('mouseup touchend', () => {
			this.handleDragEnd();
		});
		
		$('.js-dropdown-overlay').on('click', () => {
			this.closeActiveSheet();
			$('html').removeClass('overflow-hidden');
		});
		
		$(window).on('resize', () => {
			this.isMobile = window.innerWidth < 1024;
			if (!this.isMobile) {
				this.closeActiveSheet();
			} else if (this.activeSheet) {
				this.calculateContentHeight(this.sheets[this.activeSheet]);
				this.setSheetHeight(this.sheets[this.activeSheet], this.sheets[this.activeSheet].defaultHeight);
			}
		});
	},

	handleDropdownClick(e) {
		e.preventDefault();
		const $button = $(e.currentTarget);
		const dropdownId = $button.attr('data-id');
		
		const $wrapper = $button.closest('.dropdown-wrapper');
		const $content = $wrapper.find(`.js-dropdown[data-dropdown-id="${dropdownId}"]`);
		
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
		const $content = $item.find('.js-dropdown-sub-list');
		
		if (this.isMobile) {
			const itemId = $item.data('sheet-item-id');
			if (itemId) {
				this.openSubMenu(itemId);
			}
		} else {
			// Для десктопа
			this.subMenuItems.not($item).removeClass('active');
			this.subMenuItems.not($item).find('.js-dropdown-sub-list').css('display', 'none');
			
			if(!$item.hasClass('active')) {
				$item.addClass('active');
				$content.css('display', 'block');
				this.adjustElementPosition($content);
			} else {
				$item.removeClass('active');
				$content.css('display', 'none');
			}
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
		const hasSubContent = $element.closest('.sub-menu-item').children('.js-dropdown-sub-list').length > 0;
			
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
			const $content = $(e.currentTarget).closest('.js-dropdown');
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
	},

	getScrollbarWidth() {
		const outer = document.createElement('div');
		outer.style.visibility = 'hidden';
		outer.style.overflow = 'scroll';
		outer.style.msOverflowStyle = 'scrollbar';
		document.body.appendChild(outer);
		
		const inner = document.createElement('div');
		outer.appendChild(inner);
		
		const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
		
		outer.parentNode.removeChild(outer);
		return scrollbarWidth;
	},
	
	openSheet(sheetId) {
		const sheet = this.sheets[sheetId];
		if (!sheet) return;
		
		this.activeSheet = sheetId;
		
		$('html').css('padding-right', `${this.scrollbarWidth}px`);
		$('html').addClass('overflow-hidden');
		
		sheet.element.removeClass('hidden');
		clearTimeout(this.showSheetTimeout);
		sheet.body.css('height', 'auto');
		this.calculateContentHeight(sheet);
		sheet.body.css('height', '0');
		this.showSheetTimeout = setTimeout(() => {
			this.setSheetHeight(sheet, sheet.defaultHeight);
			sheet.element.addClass('show-sheet');
		}, 10);
	},
	
	openSubMenu(itemId) {
		if (!this.activeSheet) return;
		
		const sheet = this.sheets[this.activeSheet];
		const subMenu = sheet.element.find(`[data-dropdown-sub="${itemId}"]`);
			
		if (!subMenu.length) return;
		
		sheet.element.find('.js-dropdown-primary-list').addClass('hidden');
		
		subMenu.removeClass('hidden');
		console.log(subMenu);
		
		clearTimeout(this.showSheetTimeout);
		this.showSheetTimeout = setTimeout(() => {
			this.calculateContentHeight(sheet);
			this.setSheetHeight(sheet, sheet.defaultHeight);
		}, 10);
	},
	
	closeSubMenu() {
		if (!this.activeSheet) return;
		
		const sheet = this.sheets[this.activeSheet];
		
		sheet.element.find('.js-dropdown-sub-list').addClass('hidden');
		
		sheet.element.find('.js-dropdown-primary-list').removeClass('hidden');
		
		clearTimeout(this.showSheetTimeout);
		this.showSheetTimeout = setTimeout(() => {
			this.calculateContentHeight(sheet);
			this.setSheetHeight(sheet, sheet.defaultHeight);
		}, 10);
	},
	
	closeActiveSheet() {
		if (!this.activeSheet) return;
		
		const sheet = this.sheets[this.activeSheet];
		this.setSheetHeight(sheet, 0);
		sheet.element.removeClass('show-sheet');
		
		sheet.element.find('.js-dropdown-sub-list').addClass('hidden');
		sheet.element.find('.js-dropdown-primary-list').removeClass('hidden');
		$('html').css('padding-right', '0');
		$('html').removeClass('overflow-hidden');

		setTimeout(() => {
			sheet.element.addClass('hidden');
			this.activeSheet = null;
		}, 500);
	},
	
	calculateContentHeight(sheet) {
		const body = sheet.content;
		
		const contentHeight = body[0].scrollHeight;
		const windowHeight = window.innerHeight;
		const heightPercent = (contentHeight / windowHeight) * 100;
		
		sheet.height = heightPercent;
		sheet.defaultHeight = heightPercent;
		
		return heightPercent;
	},
	
	setSheetHeight(sheet, value) {
		const height = Math.max(0, Math.min(100, value));
		const windowHeight = window.innerHeight;
		const heightInPixels = (height * windowHeight) / 100;
		
		sheet.body.css({
			'height': `${heightInPixels}px`,
		});
		sheet.height = height;
	},
	
	handleDragStart(event) {
		if (!this.activeSheet) return;
		
		this.isDragging = true;
		this.dragStartY = event.touches ? event.touches[0].pageY : event.pageY;
		
		const sheet = this.sheets[this.activeSheet];
		sheet.body.addClass('not-selectable');
		sheet.trigger.css('cursor', 'grabbing');
		$('body').css('cursor', 'grabbing');
	},
	
	handleDragMove(event) {
		if (!this.isDragging || !this.activeSheet) return;
		
		const sheet = this.sheets[this.activeSheet];
		const currentY = event.touches ? event.touches[0].pageY : event.pageY;
		const deltaY = this.dragStartY - currentY;
		const deltaHeight = (deltaY / window.innerHeight) * 100;
		
		this.setSheetHeight(sheet, sheet.height + deltaHeight);
		this.dragStartY = currentY;
	},
	
	handleDragEnd() {
		if (!this.isDragging || !this.activeSheet) return;
		
		this.isDragging = false;
		const sheet = this.sheets[this.activeSheet];
		
		sheet.body.removeClass('not-selectable');
		sheet.trigger.css('cursor', '');
		$('body').css('cursor', '');
		
		if (sheet.height < 25) {
			this.closeActiveSheet();
		} else {
			this.setSheetHeight(sheet, sheet.defaultHeight);
		}
	}
};

$(document).ready(() => {
	Dropdown.init();
});