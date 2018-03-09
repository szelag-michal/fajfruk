(function(factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {

    var instanceNum = 0,
        $html = $('html'),
        $document = $(document),
        $window = $(window);

    function SimpleLightbox(options) {

        this.init.apply(this, arguments);

    }

    SimpleLightbox.defaults = {

        // add custom classes to lightbox elements
        elementClass: '',
        elementLoadingClass: 'lb-loading',
        htmlClass: 'lb-active',
        closeBtnClass: '',
        nextBtnClass: '',
        prevBtnClass: '',
        loadingTextClass: '',

        // customize / localize controls captions
        closeBtnCaption: 'Close',
        nextBtnCaption: 'Next',
        prevBtnCaption: 'Previous',
        loadingCaption: 'Loading...',

        bindToItems: true, // set click event handler to trigger lightbox on provided $items
        closeOnOverlayClick: true,
        closeOnEscapeKey: true,
        nextOnImageClick: true,
        showCaptions: true,

        captionAttribute: 'data-captions', // choose data source for library to glean image caption from
        urlAttribute: 'href', // where to expect large image

        startAt: 0, // start gallery at custom index
        loadingTimeout: 100, // time after loading element will appear

        appendTarget: 'body', // append elsewhere if needed

        beforeSetContent: null, // convenient hooks for extending library behavoiur
        beforeClose: null,
        beforeDestroy: null,

        videoRegex: new RegExp(/youtube.com|vimeo.com/) // regex which tests load url for iframe content

    };

    $.extend(SimpleLightbox.prototype, {

        init: function(options) {

            this.options = $.extend({}, SimpleLightbox.defaults, options);
            this.ens = '.lb-' + (++instanceNum);
            this.items = [];
            this.captions = [];

            var self = this;

            if (this.options.$items) {

                this.$items = this.options.$items;

                this.$items.each(function() {

                    var $item = $(this);

                    self.items.push($item.attr(self.options.urlAttribute));
                    self.captions.push($item.attr(self.options.captionAttribute));

                });

                this.options.bindToItems && this.$items.on('click' + this.ens, function(e) {

                    e.preventDefault();
                    self.showPosition(self.$items.index($(e.currentTarget)));

                });

            } else if (this.options.items) {

                this.items = this.options.items;

            }

            if (this.options.captions) {
                this.captions = this.options.captions;
            }

        },

        next: function() {

            return this.showPosition(this.currentPosition + 1);

        },

        prev: function() {

            return this.showPosition(this.currentPosition - 1);

        },

        normalizePosition: function(position) {

            if (position >= this.items.length) {
                position = 0;
            } else if (position < 0) {
                position = this.items.length - 1;
            }

            return position;

        },

        showPosition: function(position) {

            var self = this;

            this.currentPosition = this.normalizePosition(position);

            return this.setupLightboxHtml().prepareItem(this.currentPosition, this.setContent).show();

        },

        loading: function(on) {

            var self = this;

            if (on) {

                this.loadingTimeout = setTimeout(function() {

                    self.$el.addClass(self.options.elementLoadingClass);

                    self.$content.html('<p class="lb-loadingText ' + self.options.loadingTextClass + '">' + self.options.loadingCaption + '</p>');
                    self.show();

                }, this.options.loadingTimeout);

            } else {

                this.$el && this.$el.removeClass(this.options.elementLoadingClass);
                clearTimeout(this.loadingTimeout);

            }

        },

        prepareItem: function(position, callback) {

            var self = this,
                url = this.items[position];

            this.loading(true);

            if (this.options.videoRegex.test(url)) {

                callback.call(self, $('<div class="lb-frame-container"><iframe class="lb-frame" frameborder="0" allowfullscreen src="' + url + '"></iframe></div>'));

            } else {

                var $imageCont = $('<div class="lb-image-wrap"><img class="lb-image" src="' + url + '" /></div>');

                this.$currentImage = $imageCont.find('.lb-image');

                if (this.options.showCaptions && this.captions[position]) {
                    $imageCont.append('<div class="lb-caption">' + this.captions[position] + '</div>');
                }

                this.loadImage(url, function() {

                    self.setImageDimensions();

                    callback.call(self, $imageCont);

                    self.loadImage(self.items[self.normalizePosition(self.currentPosition + 1)]);

                });

            }

            return this;

        },

        loadImage: function(url, callback) {

            if (!this.options.videoRegex.test(url)) {

                var image = new Image();
                callback && (image.onload = callback);
                image.src = url;

            }

        },

        setupLightboxHtml: function() {

            var o = this.options;

            if (!this.$el) {

                this.$el = $(
                    '<div class="lb-element ' + o.elementClass + '">' +
                        '<div class="lb-overlay"></div>' +

                            '<div class="lb-content-outer">' +
                                '<div class="lb-content"></div>' +
                                '<a href="#" class="btn lb-close-btn ' + o.closeBtnClass + '"><svg class="icon"><use xlink:href="assets/img/symbol-defs.svg#icon-close"></use></svg></a>' +
                            '</div>' +
                            
                    '</div>'
                );

                if (this.items.length > 1) {

                    $(
                        '<div class="lb-arrows">' +
                            '<a href="#" class="btn prev lb-arrow' + o.prevBtnClass + '"><svg class="icon"><use xlink:href="assets/img/symbol-defs.svg#icon-prev"></use></svg></a>' +
                            '<a href="#" class="btn next lb-arrow' + o.nextBtnClass + '"><svg class="icon"><use xlink:href="assets/img/symbol-defs.svg#icon-next"></use></svg></a>' +
                        '</div>'
                    ).appendTo(this.$el.find('.lb-content-outer'));

                }

                this.$content = this.$el.find('.lb-content');

            }

            this.$content.empty();

            return this;

        },

        show: function() {

            if (!this.modalInDom) {

                this.$el.appendTo($(this.options.appendTarget));
                $html.addClass(this.options.htmlClass);
                this.setupLightboxEvents();

                this.modalInDom = true;

            }

            return this;

        },

        setContent: function(content) {

            var $content = $(content);

            this.loading(false);

            this.setupLightboxHtml();
            this.options.beforeSetContent && this.options.beforeSetContent($content, this);
            this.$content.html($content);

            return this;

        },

        setImageDimensions: function() {

            this.$currentImage && this.$currentImage.css('max-height', $window.height() + 'px');

        },

        setupLightboxEvents: function() {

            var self = this;

            if (!this.lightboxEventsSetuped) {

                this.$el.on('click' + this.ens, function(e) {
                    e.preventDefault();
                    var $target = $(e.target);

                    if ($target.is('.lb-close-btn') || (self.options.closeOnOverlayClick && $target.is('.lb-content-outer'))) {
                        
                        self.close();

                    } else if ($target.is('.lb-arrow')) {
                        
                        $target.hasClass('next') ? self.next() : self.prev();

                    } else if (self.options.nextOnImageClick && self.items.length > 1 && $target.is('.lb-image')) {

                        self.next();

                    }

                });

                $document.on('keyup' + this.ens, function(e) {

                    self.options.closeOnEscapeKey && e.keyCode === 27 && self.close();

                    if (self.items.length > 1) {
                        (e.keyCode === 39 || e.keyCode === 68) && self.next();
                        (e.keyCode === 37 || e.keyCode === 65) && self.prev();
                    }

                });

                $window.on('resize' + this.ens, function() {

                    self.setImageDimensions();

                });

                this.lightboxEventsSetuped = true;

            }

        },

        close: function() {

            if (this.modalInDom) {

                this.options.beforeClose && this.options.beforeClose(this);

                this.$el && this.$el.off(this.ens);
                $document.off(this.ens);
                $window.off(this.ens);
                this.lightboxEventsSetuped = false;

                this.$el.detach();
                $html.removeClass(this.options.htmlClass);
                this.modalInDom = false;
            }

        },

        destroy: function() {

            this.close();
            this.options.beforeDestroy && this.options.beforeDestroy(this);
            this.$items && this.$items.off(this.ens);
            this.$el && this.$el.remove();

        }

    });

    SimpleLightbox.open = function(options) {

        var instance = new SimpleLightbox(options);

        return options.content ? instance.setContent(options.content).show() : instance.showPosition(instance.options.startAt);

    };

    $.fn.simpleLightbox = function(options) {

        var lightboxInstance,
            $items = this;

        return this.each(function() {
            if (!$.data(this, 'simpleLightbox')) {
                lightboxInstance = lightboxInstance || new SimpleLightbox($.extend({}, options, {$items: $items}));
                $.data(this, 'simpleLightbox', lightboxInstance);
            }
        });

    };

    $.simpleLightbox = $.SimpleLightbox = SimpleLightbox;

    return $;

}));