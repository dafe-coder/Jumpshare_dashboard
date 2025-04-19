const MobileMenu = {
	hamburger: null,
	overlay: null,
	aside: null,

	init: function() {
		this.hamburger = $(".hamburger");
		this.overlay = $(".mobile-menu-overlay");
		this.aside = $("aside");
	},

	initMobileMenu: function() {
		const self = this;
		
		this.hamburger.on('click', function() {
			$(this).toggleClass('is-active');
			self.aside.toggleClass('active');
		}.bind(this));

		this.overlay.on('click', function() {
			if(self.aside.hasClass('active') && window.innerWidth < 1024) {
				self.closeMobileMenu();
			}
		}.bind(this));
	},

	closeMobileMenu: function() {
		this.aside.removeClass('active');
		this.hamburger.removeClass('is-active');
	},

	bootstrap: function() {
		this.init();
		this.initMobileMenu();
	}
};

$(document).ready(function() {
	MobileMenu.bootstrap();
});