(function ($) {

	'use strict';

	$(document).ready(function() {
		
		
		var sticky = $('.content');
		var headerH = $('.main-header').height()
		var marginTop = $('.entry').height() - $(window).height() + headerH;
		var stickySidebar = sticky.offset().top + marginTop;
		
		$('.scrolltop').click(function(e) {
      e.preventDefault();
      $("html, body").animate({ scrollTop: 0 }, "slow");
    })
		console.log(marginTop)
	    $(window).scroll(function() {  
		if ($(window).scrollTop() > stickySidebar) {
      $('.scrolltop').addClass('active');
			sticky.addClass('affix');
			$('.entry').css('top',-marginTop)
		}
		else {
      sticky.removeClass('affix');
      $('.scrolltop').remove('active');
		}  
	});

		

			
	})

}(jQuery));
