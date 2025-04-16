class BottomSheet {
	constructor() {
		this.sheets = {};
		this.activeSheet = null;
		this.isDragging = false;
		this.dragStartY = 0;
		this.isMobile = window.innerWidth < 1024;
		this.showSheetTimeout = null;
		this.scrollbarWidth = this.getScrollbarWidth();
	}
	
	static init() {
		const instance = new BottomSheet();
		instance.initializeSheets();
		instance.bindEvents();
		return instance;
	}
	
	initializeSheets() {
		$('[data-sheet-modal]').each((_, element) => {
			const $sheet = $(element);
			const sheetId = $sheet.data('sheet-modal');
			
			this.sheets[sheetId] = {
				element: $sheet,
				overlay: $sheet.find('.bottom-sheet-overlay'),
				body: $sheet.find('.bottom-sheet-body'),
				content: $sheet.find('.bottom-sheet-content'),
				trigger: $sheet.find('.bottom-sheet-trigger'),
				height: 0,
				defaultHeight: 0
			};
		});
	}
	
	bindEvents() {
		if (!this.isMobile) return;
		
		$('[data-sheet-id]').on('click', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			const sheetId = $(e.currentTarget).data('sheet-id');
			this.openSheet(sheetId);
			$('html').addClass('overflow-hidden');
		});
		
		$('[data-sheet-item-id]').on('click', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			const itemId = $(e.currentTarget).data('sheet-item-id');
			this.openSubMenu(itemId);
		});
		
		$('.sub-sheet-menu .go-back').on('click', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.closeSubMenu();
		});
		
		$('.bottom-sheet-trigger').on('mousedown touchstart', (e) => {
			this.handleDragStart(e);
		});
		
		$(window).on('mousemove touchmove', (e) => {
			this.handleDragMove(e);
		});
		
		$(window).on('mouseup touchend', () => {
			this.handleDragEnd();
		});
		
		$('.bottom-sheet-overlay').on('click', () => {
			this.closeActiveSheet();
			$('html').removeClass('overflow-hidden');
		});
		
		$(window).on('resize', () => {
			this.isMobile = window.innerWidth < 1024;
			if (!this.isMobile) {
				this.closeActiveSheet();
				$('[data-sheet-id]').off('click');
				$('.bottom-sheet-trigger').off('mousedown touchstart');
				$(window).off('mousemove touchmove');
				$(window).off('mouseup touchend');
				$('.bottom-sheet-overlay').off('click');
			} else if (this.activeSheet) {
				this.calculateContentHeight(this.sheets[this.activeSheet]);
				this.setSheetHeight(this.sheets[this.activeSheet], this.sheets[this.activeSheet].defaultHeight);
			}
		});
	}
	
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
	}
	
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
	}
	
	openSubMenu(itemId) {
		if (!this.activeSheet) return;
		
		const sheet = this.sheets[this.activeSheet];
		const subMenu = sheet.element.find(`[data-sheet-menu-id="${itemId}"]`);
		
		if (!subMenu.length) return;
		
		sheet.element.find('.primary-sheet-menu').addClass('hidden');
		
		subMenu.removeClass('hidden');
		clearTimeout(this.showSheetTimeout);
		this.showSheetTimeout = setTimeout(() => {
			this.calculateContentHeight(sheet);
			this.setSheetHeight(sheet, sheet.defaultHeight);
		}, 10);
	}
	
	closeSubMenu() {
		if (!this.activeSheet) return;
		
		const sheet = this.sheets[this.activeSheet];
		
		sheet.element.find('.sub-sheet-menu').addClass('hidden');
		
		sheet.element.find('.primary-sheet-menu').removeClass('hidden');
		
		clearTimeout(this.showSheetTimeout);
		this.showSheetTimeout = setTimeout(() => {
			this.calculateContentHeight(sheet);
			this.setSheetHeight(sheet, sheet.defaultHeight);
		}, 10);
	}
	
	closeActiveSheet() {
		if (!this.activeSheet) return;
		
		const sheet = this.sheets[this.activeSheet];
		this.setSheetHeight(sheet, 0);
		sheet.element.removeClass('show-sheet');
		
		sheet.element.find('.sub-sheet-menu').addClass('hidden');
		sheet.element.find('.primary-sheet-menu').removeClass('hidden');
		$('html').css('padding-right', '0');
			$('html').removeClass('overflow-hidden');

		setTimeout(() => {
			sheet.element.addClass('hidden');
			this.activeSheet = null;
		}, 500);
	}
	
	calculateContentHeight(sheet) {
		const body = sheet.content;
		
		const contentHeight = body[0].scrollHeight;
		const windowHeight = window.innerHeight;
		const heightPercent = (contentHeight / windowHeight) * 100;
		
		console.log('Content height:', contentHeight);
		console.log('Window height:', windowHeight);
		console.log('Height percent:', heightPercent);
		
		sheet.height = heightPercent;
		sheet.defaultHeight = heightPercent;
		
		return heightPercent;
	}
	
	setSheetHeight(sheet, value) {
		const height = Math.max(0, Math.min(100, value));
		const windowHeight = window.innerHeight;
		const heightInPixels = (height * windowHeight) / 100;
		console.log(heightInPixels);
		
		sheet.body.css({
			'height': `${heightInPixels}px`,
		});
		sheet.height = height;
	}
	
	handleDragStart(event) {
		if (!this.activeSheet) return;
		
		this.isDragging = true;
		this.dragStartY = event.touches ? event.touches[0].pageY : event.pageY;
		
		const sheet = this.sheets[this.activeSheet];
		sheet.body.addClass('not-selectable');
		sheet.trigger.css('cursor', 'grabbing');
		$('body').css('cursor', 'grabbing');
	}
	
	handleDragMove(event) {
		if (!this.isDragging || !this.activeSheet) return;
		
		const sheet = this.sheets[this.activeSheet];
		const currentY = event.touches ? event.touches[0].pageY : event.pageY;
		const deltaY = this.dragStartY - currentY;
		const deltaHeight = (deltaY / window.innerHeight) * 100;
		
		this.setSheetHeight(sheet, sheet.height + deltaHeight);
		this.dragStartY = currentY;
	}
	
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
}

$(document).ready(() => BottomSheet.init());