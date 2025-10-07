## BottomSheetLite — Documentation

BottomSheetLite is a lightweight, dependency-free bottom sheet for mobile and desktop overlays. It preserves native scroll inertia, allows swipe-to-dismiss only from scroll top, and smoothly snaps back to its default height.

### Purpose

- Minimal surface area with clear, predictable behavior
- Native-feeling gestures and scroll inertia
- Separate stacks for dropdown-like sheets and dialog-like modals

### Installation

Include after jQuery and your modal/dropdown HTML:

```html
<script src="dist/js/helpers.js"></script>
<script src="dist/js/bottom-sheet.lite.js"></script>
```

### Markup — Dropdown mode

```html
<!-- Dropdown root -->
<div
	class="js-dropdown hidden"
	data-dropdown-id="dropdown-spaces-item"
	data-sheet-modal
	data-overflow-visible
>
	<div class="js-dropdown-overlay"></div>
	<div class="js-dropdown-body">
		<div class="js-dropdown-trigger">
			<!-- Optional trigger container -->
			<span></span>
		</div>
		<div class="js-dropdown-content">Content here</div>
	</div>
</div>
```

Data attributes (dropdowns):

- `data-overflow-visible`: render above any parent with overflow hidden/scroll
- `data-dropdown-id`: unique id to locate the dropdown on the page
- `data-sheet-modal`: enables BottomSheet behavior; otherwise desktop-only behavior remains

Open dropdown programmatically:

```html
<script>
	$(document).on("click", '[data-open-dropdown="spaces-item"]', function (e) {
		const $sheetModal = $('[data-dropdown-id="dropdown-spaces-item"]');
		BottomSheetLite.open({
			event: e,
			modal: $sheetModal,
			type: "dropdown",
			overlayElement: $sheetModal.find(".js-dropdown-overlay"),
			body: $sheetModal.find(".js-dropdown-body"),
			content: $sheetModal.find(".js-dropdown-content"),
			scrollBlockElement: $sheetModal.find(".js-dropdown-content"),
			closeButtonElement: $sheetModal.find(".js-sheet-close"),
			triggerHeight: 25,
		});
	});
	BottomSheetLite.init();
	// Optional: call once during app bootstrap to wire listeners
</script>
```

### Markup — Dialog mode

```html
<div id="lightbox" class="hidden">
	<div class="modal" id="modal">
		<div class="modal-dialog modal-bs modal-create-space hidden">
			<button
				type="button"
				class="close pull-right"
				data-dismiss="modal"
				data-dialog-close
			>
				<span class="icn-close"></span>
				<span class="sr-only">Close modal</span>
			</button>
			<div class="modal-content">Content here</div>
		</div>
	</div>
</div>
```

Open dialog programmatically:

```html
<script>
	$('[data-dialog="change-plan"]').on("click", function (e) {
		const $dialog = $("#lightbox");
		const $body = $dialog.find(".modal-dialog");
		const $content = $dialog.find(".modal-content");
		BottomSheetLite.open({
			event: e,
			modal: $dialog,
			type: "dialog",
			overlayElement: $dialog.find(".modal"),
			body: $body,
			content: $content,
			closeButtonElement: $body.find("[data-dialog-close]"),
		});
	});
	BottomSheetLite.init();
</script>
```

### Public API

- `init()` — sets up resize and Esc listeners. Call once at startup.
- `open(options)` — opens a bottom sheet.
- `close(type = 'dropdown', instanceId?)` — closes the top sheet of the given type, or a specific instance by id.
- `closeAll(immediate = false)` — closes all sheets; when `true`, closes immediately without animation.

### open(options)

Required elements are jQuery-wrapped:

- `modal`: root modal element
- `body`: sheet body (the element whose height is animated)
- `content`: content element (used to measure default height)

Common options:

- `overlayElement`: backdrop element; clicking closes the sheet
- `closeButtonElement`: close button inside the sheet
- `type`: `'dropdown' | 'dialog'` (separate stacks)
- `triggerHeight`: number — pixel offset added to computed height (default 0)
- `defaultHeight`: number — initial height in %, auto-computed if omitted
- `maxHeight`: number — maximum height in %, default 80
- `scrollBlockElement`: element that controls scroll capture behavior

### Events

BottomSheetLite dispatches jQuery events on the `modal` root:

- `beforeOpen` — right before opening
- `open` — after opening animation completes
- `beforeClose` — right before closing
- `close` — after closing animation completes

```js
$(modal).on("open", function () {
	/* ... */
});
```

### Gesture behavior

- Swipe down begins dismissal only when the inner scroll is at top
- Native content scroll inertia is preserved; the sheet takes over only at scrollTop = 0
- Moving the finger back up returns the sheet toward its default height
- Dismissal threshold: 20% from the top of the sheet body

### Key details

- `isDismissAllowed` derives from `scrollTop` to avoid accidental closing
- Heights are viewport-based percentages; `setSheetHeight` stores current value in `modal.data('height')`
- Multiple sheets are supported via per-type stacks (dropdown vs dialog)

### Accessibility

- Support `Esc` to close (wired in `init()`)
- Automatic closing when resizing the browser window

### Troubleshooting

- Sheet does not close on swipe: ensure inner scroll container reaches `scrollTop === 0`
- Wrong initial height: verify `content` exists and has measurable height; set `defaultHeight` explicitly if needed
- Backdrop not clickable: check `overlayElement` points to the actual backdrop element
