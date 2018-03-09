(function ($) {

	'use strict';

	$(document).ready(function() {
		
		$(window).scroll(function(){
			var sticky = $('.main-header'),
				scroll = $(window).scrollTop();
		  
			scroll >= 10 ? sticky.addClass('active') : sticky.removeClass('active');
		  });
			
	})

}(jQuery));
