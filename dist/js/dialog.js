const Dialog = {
	init: function() {
		this.dialogs = $('#lightbox');
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

    $('.modal').on('click', function(e) {
      if (e.target === this) {
        $dialog.addClass('hidden');
      }
    });

    $('[data-dialog-open-id="share"]').on('click', (e) =>{
      e.preventDefault()
      e.stopPropagation()
      $dialog.removeClass('hidden');
    })
	},

	openDialog: function($dialog) {
		$dialog.removeClass('hidden');
	}
};

const Lightbox = {
  tabsInit: function() {
    $('#share_modal_tab').on('click', function(e) {
      e.preventDefault();
      $('.modal-dialog').removeClass('modal-collaborate-share modal-embed-media modal-link-settings-share');
      $('.modal-dialog').addClass('modal-email-share');
      $('.modal-share-icon').each(function() {
        $(this).removeClass('active');
      });
      $(this).addClass('active');
    });
    $('#collaborate_tab').on('click', function(e) {
      e.preventDefault();
      $('.modal-dialog').removeClass('modal-email-share modal-embed-media modal-link-settings-share');
      $('.modal-dialog').addClass('modal-collaborate-share');
      $('.modal-share-icon').each(function() {
        $(this).removeClass('active');
      });
      $(this).addClass('active');
    });
    $('#embed_modal_tab').on('click', function(e) {
      e.preventDefault();
      $('.modal-dialog').removeClass('modal-email-share modal-collaborate-share modal-link-settings-share');
      $('.modal-dialog').addClass('modal-embed-media');
      $('.modal-share-icon').each(function() {
        $(this).removeClass('active');
      });
      $(this).addClass('active');
    });
    $('#link-settings').on('click', function(e) {
      e.preventDefault();
      $('.modal-dialog').removeClass('modal-email-share modal-collaborate-share modal-embed-media');
      $('.modal-dialog').addClass('modal-link-settings-share');
      $('.modal-share-icon').each(function() {
        $(this).removeClass('active');
      });
      $(this).addClass('active');
    });

    // WIP - Rework this code, only for the test
    $(document).on("focus", "#email_to", function() {
      $(this).closest(".modal-email-wrapper").addClass("!border-blue-500");
      $(".recent-suggestions").removeClass("hidden");
    });
    
    $(document).on("blur", "#email_to", function() {
      console.log("blur");
      $(this).closest(".modal-email-wrapper").removeClass("!border-blue-500");
      $(".recent-suggestions").addClass("hidden");
    });
    
    $(document).on("change", ".switcher input[type='checkbox']", function() {
      $(this).closest(".switcher").find(".switcher-label").text($(this).is(":checked") ? 'Yes' : 'No');
    });

    $(document).on("click", ".link-settings-item__header .switcher input[type='checkbox']", function() {
      const footer = $(this).closest(".link-settings-item").find(".link-settings-item__footer");
      if(footer.length) {
        const height = footer[0].scrollHeight;
        
        if($(this).is(":checked")) {
          footer.css("max-height", `${height}px`);
          setTimeout(() => {
            footer.css("overflow", "visible");
          }, 200);
        } else {
          footer.css("max-height", "0px");
          footer.css("overflow", "hidden");
        }
      }
    });

    $(document).on("click", "#qr-code-btn", function() {
      const qrCodeModal = $(".qrcode-modal");
      if($(this).hasClass("active")) {
        qrCodeModal.fadeOut(150);
        $(this).removeClass("active");
      } else {
        qrCodeModal.fadeIn(150);
        $(this).addClass("active");
      }
    });

    $(document).on("click", ".qrcode-modal .icn-close", function() {
      $(".qrcode-modal").fadeOut(150);
      $("#qr-code-btn").removeClass("active");
    });

    $(document).on("click", ".qrcode-modal", function(e) {
      if($(e.target).hasClass("qrcode-modal")) {
        $(".qrcode-modal").fadeOut(150);
        $("#qr-code-btn").removeClass("active");
      }
    });

    $('#embed_size_optns_cntrols input').on('change', function() {
      if($('.fixed_siz input').is(':checked')) {
        $('.video_size_embed').css('display', 'flex');
      } else {
        $('.video_size_embed').css('display', 'none');
      }
    });
  }
}

$(document).ready(() => {
	Dialog.init();
  Lightbox.tabsInit();
});