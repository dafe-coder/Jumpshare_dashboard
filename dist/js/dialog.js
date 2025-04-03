const Dialog = {
	init: function() {
		this.dialogs = $('.dialog');
		this.dialogs.each((_, dialog) => {
			this.initDialog($(dialog));
		});
	},

	initDialog: function($dialog) {
		const $closeBtn = $('[data-dialog-close]');
		
		$dialog.on('click', (e) => {
			if (e.target === $dialog[0]) {
				$dialog.addClass('hidden');
			}
		});

		$closeBtn.on('click', () => {
			$dialog.addClass('hidden');
		});
	},

	openDialog: function($dialog) {
		$dialog.removeClass('hidden');
	}
};

$(document).ready(() => {
	Dialog.init();
});