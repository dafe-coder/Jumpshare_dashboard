const Dialog = {
	init: function() {
		this.dialogs = document.querySelectorAll(".dialog")
		this.dialogs.forEach(dialog => {
			this.initDialog(dialog)
		})
	},

	initDialog: function(dialog) {
		const closeBtn = dialog.querySelector(".dialog-close")
		
		dialog.addEventListener("click", (e) => {
			if(e.target === dialog) {
				dialog.classList.add("hidden")
			}
		})

		closeBtn.addEventListener("click", () => {
			dialog.classList.add("hidden")
		})
	},

	openDialog: function(dialog) {
		dialog.classList.remove("hidden")
	}
	
}

Dialog.init()