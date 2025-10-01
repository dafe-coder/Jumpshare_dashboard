## BottomSheetLite — Documentation

### Purpose

BottomSheetLite is a minimal, reliable mobile bottom sheet: native scroll inertia, swipe-to-dismiss only from scroll top, smooth snap back to default height, overlay/close button.

### Usage

Include after jQuery and your modal HTML:

```html
<script src="dist/js/bottom-sheet.lite.js"></script>
<script>
  $(function(){ BottomSheetLite.init(); });
  $('[data-dialog="change-plan"]').on('click', function(e){
    const modal = $('#lightbox');
    BottomSheetLite.open({
      event: e,
      modal: modal,
      body: modal.find('.js-dropdown-body'),
      content: modal.find('.js-dropdown-content'),
      overlayElement: modal.find('.js-dropdown-overlay'),
      scrollBlockElement: modal.find('.modal-body'),
      closeButtonElement: modal.find('[data-dialog-close]'),
      type: 'dropdown',
      triggerHeight: 0
    });
  });
```

### Public API

- init(): sets up resize and Esc listeners.
- open(options): opens a bottom sheet.
- close(type? = 'dropdown', instanceId?): closes the top or a specific sheet.

### open(options) parameters

- modal: jQuery root modal element.
- body: jQuery sheet body (the element whose height is animated).
- content: jQuery content element (used to measure default height).
- overlayElement: jQuery overlay; clicking the backdrop closes the sheet.
- closeButtonElement: jQuery close button.
- scrollBlockElement: scrollable container; defaults to content.
- type: 'dropdown' | 'dialog' (separate stacks).
- triggerHeight: pixel offset added to computed height.
- defaultHeight: initial height in % (auto-computed from content if omitted).
- maxHeight: maximum height in % (defaults to 80).

### Gesture behavior

- Swipe down begins dismissal only when the inner scroll is at top.
- Content scroll remains native with inertia; the sheet captures only at scroll top.
- Moving finger back up moves the sheet with the finger up to its default height.
- Dismissal threshold: closes when current height < 45% and isDismissAllowed = true.

### Key details

- isDismissAllowed: derived from scrollTop to prevent closing while content isn’t at the top.
- Heights are viewport-based percentages; setSheetHeight stores current value in modal.data('height').
- Multiple sheets are supported via per-type stacks.

### Layout tips (Tailwind v4, no tailwind.config.js)

- Wraps: use overflow-hidden and max-w-full where needed.
- Truncated text: `overflow-hidden whitespace-nowrap text-ellipsis`.
- For flex children to shrink: add `min-w-0` on the parent.

### Troubleshooting

- "Sheet dismisses while content still scrolls": ensure scrollBlockElement is the actual scrollable container with `overflow-y: auto|scroll` and tall content.
- "Text overflows": add `min-w-0` to parent and `text-ellipsis` to the text node.
