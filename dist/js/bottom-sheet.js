const BottomSheet = {
	sheetHeight: 0,
	sheetHeightDefault: 0,
	sheet: null,
	sheetContents: null,
	draggableArea: null,
	isDragging: false,
	dragStartY: 0,
	
	bootstrap: function() {
		this.sheet = $("#sheet")
		this.sheetContents = this.sheet.find(".content")
		this.draggableArea = $("#menuTrigger")
		this.init()
	},
	
	setSheetHeight: function(value) {
		this.sheetHeight = Math.max(0, Math.min(100, value))
		this.sheetContents.css("height", `${this.sheetHeight}vh`)
	},
	
	setIsSheetShown: function(value) {
		const html = $("html")
		if (value) {
			html.css("overflow", "hidden")
			this.sheet.removeClass("hidden")
			this.setSheetHeight(0)
			setTimeout(() => {
				this.sheet.addClass("show-sheet")
				this.setSheetHeight(this.calculateContentHeight())
				this.sheetHeightDefault = this.calculateContentHeight()
			}, 10)
		} else {
			this.setSheetHeight(0)
			html.css("overflow", "auto")
			this.sheet.removeClass("show-sheet")
			setTimeout(() => this.sheet.addClass("hidden"), 500)
		}
	},
	
	handleDragStart: function(event) {
		this.isDragging = true
		this.dragStartY = event.touches ? event.touches[0].pageY : event.pageY
		this.sheetContents.addClass("not-selectable")
		this.draggableArea.css("cursor", "grabbing")
		$("body").css("cursor", "grabbing")
	},
	
	handleDragMove: function(event) {
		if (!this.isDragging) return
		
		const currentY = event.touches ? event.touches[0].pageY : event.pageY
		const deltaY = this.dragStartY - currentY
		const deltaHeight = (deltaY / window.innerHeight) * 100
		
		this.setSheetHeight(this.sheetHeight + deltaHeight)
		this.dragStartY = currentY
	},
	
	handleDragEnd: function() {
		if (!this.isDragging) return
		
		this.isDragging = false
		this.sheetContents.removeClass("not-selectable")
		this.draggableArea.css("cursor", "")
		$("body").css("cursor", "")

		if (this.sheetHeight < 25) {
			this.setIsSheetShown(false)
		} else {
			this.setSheetHeight(this.sheetHeightDefault)
		}
	},
	
	calculateContentHeight: function() {
		const items = this.sheetContents.find("ul li")
		const itemHeight = 40 
		const height = (((items.length + 1) * itemHeight) / window.innerHeight) * 100 
		this.sheetHeight = height
		return height
	},
	
	init: function() {
		const boundDragStart = this.handleDragStart.bind(this)
		const boundDragMove = this.handleDragMove.bind(this)
		const boundDragEnd = this.handleDragEnd.bind(this)

		this.draggableArea.on("mousedown touchstart", boundDragStart)
		$(window).on("mousemove touchmove", boundDragMove)
		$(window).on("mouseup touchend", boundDragEnd)

		this.sheet.find(".overlay").on("click", () => {
			this.setIsSheetShown(false)
			this.setSheetHeight(0)
		})

		$("[data-open-sheet]").on("click", () => {
			if(window.innerWidth < 1024) {
				this.setIsSheetShown(true)
			}
		})
	}
}

$(document).ready(() => BottomSheet.bootstrap())