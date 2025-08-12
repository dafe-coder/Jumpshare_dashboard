const Dialog = {
	init: function () {
		this.initDialog($("#lightbox"));
	},

	initDialog: function ($dialog) {
		const $closeBtn = $("#lightbox [data-dialog-close]");
		console.log("[Dialog] initDialog", { closeBtns: $closeBtn.length });

		$dialog.on("click", (e) => {
			if (e.target === $dialog[0] && !BottomSheet.isMobile) {
				$dialog.addClass("hidden");
				$dialog.find(".modal-dialog").addClass("hidden");
			}
		});

		$closeBtn.on("click", () => {
			console.log("[Dialog] closeBtn click (desktop)");
			if (!BottomSheet.isMobile) {
				$dialog.addClass("hidden");
				$dialog.find(".modal-dialog").addClass("hidden");
			}
		});
		$("#lightbox .modal").on("click", function (e) {
			if (e.target === this && !BottomSheet.isMobile) {
				$dialog.addClass("hidden");
				$dialog.find(".modal-dialog").addClass("hidden");
			}
		});
		$("[data-dialog-open-id]").on("click", function (e) {
			e.preventDefault();
			e.stopPropagation();
			const dialogId = $(this).attr("data-dialog-open-id");
			console.log("[Dialog] open click", {
				dialogId,
				isMobile: BottomSheet.isMobile,
			});

			if (BottomSheet.isMobile) {
				const body = $dialog.find(`.modal-${dialogId}`);
				const content = body.find(".modal-content");

				if (dialogId === "email-share-dialog") {
					BottomSheet.open({
						event: e,
						modal: $dialog,
						body,
						content,
						overlayElement: $dialog.find(".modal"),
						scrollBlockElement: body.find(".modal-body"),
						closeButtonElement: body.find("[data-dialog-close]"),
						type: "dialog",
						maxHeight: 90,
						defaultHeight: 90,
					});
				} else {
					BottomSheet.open({
						event: e,
						modal: $dialog,
						body,
						content,
						overlayElement: $dialog.find(".modal"),
						scrollBlockElement: body.find(".modal-body"),
						closeButtonElement: body.find("[data-dialog-close]"),
						type: "dialog",
					});
				}
			} else {
				Dropdown.closeAllDropdowns();
				$dialog.removeClass("hidden");
				$dialog.find(`.modal-${dialogId}`).removeClass("hidden");
			}
		});
	},

	openDialog: function ($dialog) {
		$dialog.removeClass("hidden");
	},
};

const Lightbox = {
	tabsInit: function () {
		$("#share_modal_tab").on("click", function (e) {
			e.preventDefault();
			$(".modal-email-share-dialog").removeClass(
				"modal-collaborate-share modal-embed-media modal-link-settings-share",
			);
			$(".modal-email-share-dialog").addClass("modal-email-share");
			$(".modal-share-icon").each(function () {
				$(this).removeClass("active");
			});
			$(this).addClass("active");
		});
		$("#collaborate_tab").on("click", function (e) {
			e.preventDefault();
			$(".modal-email-share-dialog").removeClass(
				"modal-email-share modal-embed-media modal-link-settings-share",
			);
			$(".modal-email-share-dialog").addClass("modal-collaborate-share");
			$(".modal-share-icon").each(function () {
				$(this).removeClass("active");
			});
			$(this).addClass("active");
		});
		$("#embed_modal_tab").on("click", function (e) {
			e.preventDefault();
			$(".modal-email-share-dialog").removeClass(
				"modal-email-share modal-collaborate-share modal-link-settings-share",
			);
			$(".modal-email-share-dialog").addClass("modal-embed-media");
			$(".modal-share-icon").each(function () {
				$(this).removeClass("active");
			});
			$(this).addClass("active");
		});
		$("#link-settings").on("click", function (e) {
			e.preventDefault();
			$(".modal-email-share-dialog").removeClass(
				"modal-email-share modal-collaborate-share modal-embed-media",
			);
			$(".modal-email-share-dialog").addClass("modal-link-settings-share");
			$(".modal-share-icon").each(function () {
				$(this).removeClass("active");
			});
			$(this).addClass("active");
		});

		// WIP - Rework this code, only for the test
		$(document).on("focus", "#email_to", function () {
			$(this).closest(".modal-email-wrapper").addClass("!border-blue-500");
			$(".recent-suggestions").removeClass("hidden");
		});

		$(document).on("blur", "#email_to", function () {
			console.log("blur");
			$(this).closest(".modal-email-wrapper").removeClass("!border-blue-500");
			$(".recent-suggestions").addClass("hidden");
		});

		$(document).on("change", ".switcher input[type='checkbox']", function () {
			const switcherLabel = $(this)
				.closest(".switcher")
				.find(".switcher-label");
			switcherLabel.text(
				$(this).is(":checked")
					? switcherLabel.attr("data-switcher-label-on")
					: switcherLabel.attr("data-switcher-label-off"),
			);
		});

		$(document).on(
			"click",
			".link-settings-item__header .switcher input[type='checkbox']",
			function () {
				const footer = $(this)
					.closest(".link-settings-item")
					.find(".link-settings-item__footer");
				if (footer.length) {
					const height = footer[0].scrollHeight;

					if ($(this).is(":checked")) {
						footer.css("max-height", `${height}px`);
						setTimeout(() => {
							footer.css("overflow", "visible");
						}, 200);
					} else {
						footer.css("max-height", "0px");
						footer.css("overflow", "hidden");
					}
				}
			},
		);

		$(document).on("click", "#qr-code-btn", function () {
			const qrCodeModal = $(".qrcode-modal");
			if ($(this).hasClass("active")) {
				qrCodeModal.fadeOut(150);
				$(this).removeClass("active");
			} else {
				qrCodeModal.fadeIn(150);
				$(this).addClass("active");
			}
		});

		$(document).on("click", ".qrcode-modal .icn-close", function () {
			$(".qrcode-modal").fadeOut(150);
			$("#qr-code-btn").removeClass("active");
		});

		$(document).on("click", ".qrcode-modal", function (e) {
			if ($(e.target).hasClass("qrcode-modal")) {
				$(".qrcode-modal").fadeOut(150);
				$("#qr-code-btn").removeClass("active");
			}
		});

		$("#embed_size_optns_cntrols input").on("change", function () {
			if ($(".fixed_siz input").is(":checked")) {
				$(".video_size_embed").css("display", "flex");
			} else {
				$(".video_size_embed").css("display", "none");
			}
		});

		$("#email_to").on("input", (e) => {
			if (e.target.value.length > 0) {
				$("#email_message").removeClass("hidden");
				$("#share-select-role").removeClass("hidden");
			} else {
				$("#email_message").addClass("hidden");
				$("#share-select-role").addClass("hidden");
			}
		});
		$("#hide_video_title").on("change", (e) => {
			if (e.target.checked) {
				$("#preview-window-private").removeClass("hidden");
				$("#preview-window-info").addClass("hidden");
			} else {
				$("#preview-window-private").addClass("hidden");
				$("#preview-window-info").removeClass("hidden");
			}
		});
	},
};

$(document).ready(() => {
	Dialog.init();
	Lightbox.tabsInit();
	// setTimeout(() => {
	// 	const $dialog = $("#lightbox");
	// 	$dialog.removeClass("hidden");
	// }, 400);
});
