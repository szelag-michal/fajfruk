(function ($) {

	'use strict';

	$(document).ready(function() {
		var sticky = $('.content');
		var headerH = $('.main-header').height()
		var marginTop = $('.entry').height() - $(window).height() + headerH;
		var stickySidebar = sticky.offset().top + marginTop;
		
		
		console.log(marginTop)
	    $(window).scroll(function() {  
		if ($(window).scrollTop() > stickySidebar) {
			sticky.addClass('affix');
			$('.entry').css('top',-marginTop)
		}
		else {
			sticky.removeClass('affix');
		}  
	});

		$(window).scroll(function(){
			var sticky = $('.main-header'),
				scroll = $(window).scrollTop();
		  
			if (scroll >= 10) sticky.addClass('active');
			else sticky.removeClass('active');
		  });

			$('#filters').on( 'click', 'a', function(e) {
				e.preventDefault();
				$(this).parent().addClass('active');
				$(this).parent().siblings().removeClass('active')
				$('.listing').isotope({
					itemSelector: 'article', 
					filter: $( this ).attr('data-filter')
				});
			});
	})

}(jQuery));
