$(document).ready(function() {
	const sheet = $("#sheet")
	const sheetContents = sheet.find(".content")
	const draggableArea = $("#menuTrigger")

	let sheetHeight // in vh
	const setSheetHeight = (value) => {
		sheetHeight = Math.max(0, Math.min(100, value))
		sheetContents.css("height", `${sheetHeight}vh`)
		if (sheetHeight === 100) {
			sheetContents.addClass("fullscreen")
		} else {
			sheetContents.removeClass("fullscreen")
		}
	}
	const setIsSheetShown = (value) => {
		sheet.attr("data-aria-hidden", String(!value))
	}
	// Open the sheet when clicking the 'open sheet' button
	setSheetHeight(Math.min(50, 720 / window.innerHeight * 100))
	setIsSheetShown(true)

	// Hide the sheet when clicking the 'close' button
	// sheet.querySelector(".close-sheet").addEventListener("click", () => {
	// 	setIsSheetShown(false)
	// })

	// Hide the sheet when clicking the background
	sheet.find(".overlay").click(function() {
		setIsSheetShown(false)
	})

	const touchPosition = (event) =>
	event.touches ? event.touches[0] : event
	let dragPosition
	const onDragStart = (event) => {
		dragPosition = touchPosition(event).pageY
		sheetContents.addClass("not-selectable")
		draggableArea.css("cursor", "grabbing")
		$("body").css("cursor", "grabbing")
	}
	const onDragMove = (event) => {
		if (dragPosition === undefined) return
		const y = touchPosition(event).pageY
		const deltaY = dragPosition - y
		const deltaHeight = deltaY / window.innerHeight * 100
		setSheetHeight(sheetHeight + deltaHeight)
		dragPosition = y
	}
	const onDragEnd = () => {
		dragPosition = undefined
		sheetContents.removeClass("not-selectable")
		draggableArea.css("cursor", "")
		$("body").css("cursor", "")
		if (sheetHeight < 25) {
			setIsSheetShown(false)
		} else {
			setSheetHeight(50)
		}
	}
	draggableArea.on("mousedown touchstart", onDragStart)
	$(window).on("mousemove touchmove", onDragMove)
	$(window).on("mouseup touchend", onDragEnd)
});