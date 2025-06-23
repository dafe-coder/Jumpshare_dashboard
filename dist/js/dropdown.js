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
	sheetClosePercent: 45,	
	heightTrigger: 25,
	scrollableParents: [],
	scrollHandlers: [],

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
			const $wrapper = $button.closest('.dropdown-wrapper');
			
			const $sheetModal = $wrapper.find(`[data-sheet-modal][data-dropdown-id="${dropdownId}"]`);
			const hasSheetModal = $sheetModal.length > 0;
			
			if (this.isMobile && hasSheetModal) {
				e.preventDefault();
				e.stopImmediatePropagation();
				this.openSheet($sheetModal);
				$('html').addClass('overflow-hidden');
			} else {
				this.handleDropdownClick(e);
			}
		});

		this.subMenuItems.on('click', (e) => {
			const $item = $(e.currentTarget);
			const $wrapper = $item.closest('.dropdown-wrapper');
			const dropdownId = $item.closest('.js-dropdown').attr('data-dropdown-id');
			
			const $sheetModal = $wrapper.find(`[data-sheet-modal][data-dropdown-id="${dropdownId}"]`);
			const hasSheetModal = $sheetModal.length > 0;
			
			if (this.isMobile && hasSheetModal) {
				const itemId = $item.data('sheet-item-id');
				if (itemId) {
					this.openSubMenu(itemId);
				}
			} else {
				this.handleSubMenuItemClick(e);
			}
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
		
		$('.js-dropdown-body').on('mousedown touchstart', (e) => {
			this.handleDragStart(e);
		});
		
		$(window).on('mousemove touchmove', (e) => {
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
			
			if (this.isMobile) {
				this.dropdownContents.removeClass('active').addClass('hidden');
				this.dropdownButtons.removeClass('active');
				this.dropdownWrappers.removeClass('active');
				this.subMenuItems.removeClass('active');
				$('.js-dropdown-sub-list').removeClass('active').addClass('hidden');
			} else {
				this.closeActiveSheet();
			}
			
			if (this.activeSheet) {
				this.calculateContentHeight(this.activeSheet);
				this.setSheetHeight(this.activeSheet, this.activeSheet.data('default-height') || 0);
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
			this.dropdownContents.not($content).removeClass('active').addClass('hidden');
			this.dropdownButtons.not($button).removeClass('active');
			this.dropdownWrappers.not($wrapper).removeClass('active');
			this.subMenuItems.removeClass('active');
			$('.js-dropdown-sub-list').removeClass('active').addClass('hidden');
			
			$button.addClass('active');
			$wrapper.addClass('active');
			$content.removeClass('hidden');
			
			clearTimeout(this.dropdownIdTimer);
			this.dropdownIdTimer = setTimeout(() => {
				$content.addClass('active');
				this.adjustElementPosition($content);
			}, 10);
		} else {
			$button.removeClass('active');
			$wrapper.removeClass('active');
			$content.removeClass('active').addClass('hidden');
			$content.removeClass('dropdown-fixed');
			this.detachScrollListeners();
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
			this.subMenuItems.not($item).removeClass('active');
			this.subMenuItems.not($item).find('.js-dropdown-sub-list').addClass('hidden');
			
			if(!$item.hasClass('active')) {
				$item.addClass('active');
				$content.removeClass('hidden');
				this.adjustElementPosition($content);
			} else {
				$item.removeClass('active');
				$content.addClass('hidden');
			}
		}
	},

	handleDocumentClick(e) {
		const $dropdown = $(e.target).closest('.dropdown-wrapper');
		
		if (!$dropdown.length) {
			this.dropdownContents.removeClass('active').addClass('hidden');
			this.dropdownButtons.removeClass('active');
			this.dropdownWrappers.removeClass('active');
			this.subMenuItems.removeClass('active');
			$('.js-dropdown-sub-list').removeClass('active').addClass('hidden');
			
			this.dropdownContents.removeClass('dropdown-fixed');
			this.detachScrollListeners();
			
			clearTimeout(this.dropdownIdTimer);
			this.dropdownIdTimer = setTimeout(() => {
				this.dropdownContents.addClass('hidden');
			}, 150);
		}
	},

	adjustElementPosition($element) {
		if (!$element || !$element.length) {
			return;
		}

		const hasOverflowVisible = $element.attr('data-overflow-visible') !== undefined;
		const needsFixedPosition = hasOverflowVisible && this.isInsideOverflowHidden($element);

		if (needsFixedPosition) {
			$element.addClass('dropdown-fixed');
			this.attachScrollListeners($element);
			this.calculateFixedPosition($element);
			return;
		} else {
			$element.removeClass('dropdown-fixed');
			this.detachScrollListeners();
		}

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

	isInsideOverflowHidden($element) {
		let $parent = $element.parent();
		while ($parent.length && !$parent.is('body')) {
			const overflow = $parent.css('overflow');
			if (overflow === 'hidden' || overflow === 'scroll' || overflow === 'auto') {
				return true;
			}
			$parent = $parent.parent();
		}
		return false;
	},

	calculateFixedPosition($element) {
		const $trigger = $element.closest('.dropdown-wrapper').find('.dropdown-button');
		const triggerRect = $trigger[0].getBoundingClientRect();
		const dropdownRect = $element[0].getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const viewportWidth = window.innerWidth;

		let top, left, right;
		if (triggerRect.bottom + 10 + dropdownRect.height > viewportHeight) {
			top = triggerRect.top - dropdownRect.height - 10;
		} else {
			top = triggerRect.bottom + 10;
		}

		const hasRightClass = Array.from($element[0].classList).some(cls => cls.startsWith('right-'));
		if (hasRightClass) {
			left = 'auto';
			right = (viewportWidth - triggerRect.right) + 'px';
		} else {
			left = triggerRect.left + 'px';
			right = 'auto';
		}

		$element.css({
			'top': top + 'px',
			'left': left,
			'right': right
		});
	},

	adjustElementPositionOnResize() {
		$(window).on('resize', () => {
			clearTimeout(this.resizeTimer);
			this.resizeTimer = setTimeout(() => {
				const $activeDropdown = this.dropdownContents.filter('.active');
				if ($activeDropdown.length) {
					if ($activeDropdown.hasClass('dropdown-fixed')) {
						this.calculateFixedPosition($activeDropdown);
					} else {
						this.adjustElementPosition($activeDropdown);
					}
				}
			}, 50);
		});

		$(window).on('scroll', () => {
			const $activeDropdown = this.dropdownContents.filter('.active.dropdown-fixed');
			if ($activeDropdown.length) {
				this.calculateFixedPosition($activeDropdown);
			}
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
				$content.addClass('hidden');
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
				const svgTypeList = `<svg class="icon icon-md text-blue-500">
					<use href="#list"></use>
				</svg>`;
				const svgTypeGrid = `<svg class="icon icon-md">
					<use href="#large-grid"></use>
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
	
	openSheet($sheetModal) {
		if(MobileMenu.isMobileMenuActive) {
			MobileMenu.closeMobileMenu();
		}

		if (this.activeSheet) {
			this.closeActiveSheet();
		}

		this.activeSheet = $sheetModal;
		
		$('html').css('padding-right', `${this.scrollbarWidth}px`);
		$('html').addClass('overflow-hidden');
		
		$sheetModal.removeClass('hidden');
		clearTimeout(this.showSheetTimeout);
		$sheetModal.find('.js-dropdown-body').css('height', 'auto');
		this.calculateContentHeight($sheetModal);
		$sheetModal.find('.js-dropdown-body').css('height', '0');
		
		$sheetModal.find('.js-dropdown-content').css({
			'overscroll-behavior': 'contain',
			'-webkit-overflow-scrolling': 'touch'
		});
		
		this.showSheetTimeout = setTimeout(() => {
			this.setSheetHeight($sheetModal, $sheetModal.data('default-height') || 0);
			$sheetModal.addClass('show-sheet');
		}, 10);
	},
	
	openSubMenu(itemId) {
		if (!this.activeSheet) return;
		
		const $sheetModal = this.activeSheet;
		const $subMenu = $sheetModal.find(`[data-dropdown-sub="${itemId}"]`);
			
		if (!$subMenu.length) return;
		
		$sheetModal.find('.js-dropdown-primary-list').addClass('hidden');
		$subMenu.removeClass('hidden');
		
		clearTimeout(this.showSheetTimeout);
		this.showSheetTimeout = setTimeout(() => {
			this.calculateContentHeight($sheetModal);
			this.setSheetHeight($sheetModal, $sheetModal.data('default-height') || 0);
		}, 10);
	},
	
	closeSubMenu() {
		if (!this.activeSheet) return;
		
		const $sheetModal = this.activeSheet;
		
		$sheetModal.find('.js-dropdown-sub-list').addClass('hidden');
		$sheetModal.find('.js-dropdown-primary-list').removeClass('hidden');
		
		clearTimeout(this.showSheetTimeout);
		this.showSheetTimeout = setTimeout(() => {
			this.calculateContentHeight($sheetModal);
			this.setSheetHeight($sheetModal, $sheetModal.data('default-height') || 0);
		}, 10);
	},
	
	closeActiveSheet() {
		if (this.activeSheet) {
			const $sheetModal = this.activeSheet;
			this.setSheetHeight($sheetModal, 0);
			$sheetModal.removeClass('show-sheet');
			
			$sheetModal.find('.js-dropdown-sub-list').addClass('hidden');
			$sheetModal.find('.js-dropdown-primary-list').removeClass('hidden');
			$('html').css('padding-right', '0');
			$('html').removeClass('overflow-hidden');
			
			$sheetModal.find('.js-dropdown-content').css({
				'overscroll-behavior': '',
				'-webkit-overflow-scrolling': ''
			});

			setTimeout(() => {
				$sheetModal.addClass('hidden');
				this.activeSheet = null;
			}, 500);
		}
	},
	
	calculateContentHeight($sheetModal) {
		const $content = $sheetModal.find('.js-dropdown-content');
		const contentHeight = $content[0].scrollHeight;
		const windowHeight = window.innerHeight;
		const heightPercent = Math.min(80, (contentHeight / windowHeight) * 100);
		$sheetModal.data('height', heightPercent);
		$sheetModal.data('default-height', heightPercent);
	},
	
	setSheetHeight($sheetModal, value) {
		const height = Math.max(0, Math.min(80, value));
		const viewportHeight = window.innerHeight;
		const heightInPixels = (height * viewportHeight) / 100;
		$sheetModal.find('.js-dropdown-body').css('height', `${heightInPixels + this.heightTrigger}px`);
		$sheetModal.data('height', height);
	},
	
	handleDragStart(event) {
		if (!this.activeSheet) return;
		
		const $sheetModal = this.activeSheet;
		const $content = $sheetModal.find('.js-dropdown-content');
		const contentScrollTop = $content.scrollTop();
		
		if (contentScrollTop > 0) {
			return;
		}
		
		this.isDragging = true;
		this.dragStartY = event.touches ? event.touches[0].pageY : event.pageY;
		
		$sheetModal.find('.js-dropdown-body').addClass('not-selectable');
		$sheetModal.find('.js-dropdown-trigger').css('cursor', 'grabbing');
		$('body').css('cursor', 'grabbing');
	},
	
	handleDragMove(event) {
		if (!this.isDragging || !this.activeSheet) return;
		
		const $sheetModal = this.activeSheet;
		const $content = $sheetModal.find('.js-dropdown-content');
		const currentY = event.touches ? event.touches[0].pageY : event.pageY;
		const deltaY = this.dragStartY - currentY;
		
		if(deltaY < 0 && $content.scrollTop() === 0) {
			this.hideContentScroll();
		}
		if (deltaY < 0 && $content.scrollTop() > 0) {
			return;
		}
		
		const viewportHeight = window.innerHeight;
		const deltaHeight = (deltaY / viewportHeight) * 100;
		
		const newHeight = Math.min(80, $sheetModal.data('height') + deltaHeight);
		this.setSheetHeight($sheetModal, newHeight);
		
		this.dragStartY = currentY;
	},
	
	handleDragEnd() {
		if (!this.isDragging || !this.activeSheet) return;
		
		this.isDragging = false;
		const $sheetModal = this.activeSheet;
		
		$sheetModal.find('.js-dropdown-body').removeClass('not-selectable');
		$sheetModal.find('.js-dropdown-trigger').css('cursor', '');
		$('body').css('cursor', '');
		this.showContentScroll();
		
		if ($sheetModal.data('height') < this.sheetClosePercent) {
			this.closeActiveSheet();
		} else {
			this.setSheetHeight($sheetModal, $sheetModal.data('default-height') || 0);
		}
	},
	hideContentScroll() {
		const $content = this.activeSheet.find('.js-dropdown-content');
		$content.addClass('overflow-y-hidden!');
	},
	showContentScroll() {
		const $content = this.activeSheet.find('.js-dropdown-content');
		$content.removeClass('overflow-y-hidden!');
	},

	attachScrollListeners($element) {
		this.detachScrollListeners();
		this.scrollableParents = [];
		this.scrollHandlers = [];
		let parent = $element.parent();
		while (parent.length && !parent.is('body')) {
			const overflow = parent.css('overflow');
			if (overflow === 'auto' || overflow === 'scroll' || overflow === 'hidden') {
				this.scrollableParents.push(parent[0]);
			}
			parent = parent.parent();
		}
		const self = this;
		this.scrollableParents.forEach(function(el) {
			const handler = function() {
				self.calculateFixedPosition(self.dropdownContents.filter('.active.dropdown-fixed'));
			};
			el.addEventListener('scroll', handler, { passive: true });
			self.scrollHandlers.push({el, handler});
		});
	},

	detachScrollListeners() {
		if (this.scrollHandlers && this.scrollHandlers.length) {
			this.scrollHandlers.forEach(function(obj) {
				obj.el.removeEventListener('scroll', obj.handler);
			});
		}
		this.scrollableParents = [];
		this.scrollHandlers = [];
	}
};

$(document).ready(() => {
	Dropdown.init();
});