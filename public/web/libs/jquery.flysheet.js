jQuery.fn.flySheet = function(paramsPassed) {
    var $target = this;
    var defaults = {
        content: 'body',
        distanceToActivate: 50, //per cent of window size from top
        speed: 1500, //pixels per second
        switchDistance: 200 //pixels from window side to calculate highlighted
    }
    var $el = $(this);
    var options = {};
    var checkpoints = [];
    var $fly = $('<ul/>');
    $.extend(options, defaults, paramsPassed);

    var $content = $(options.content);
    var $headings = $content.find('h1');
    var fsClickHandler = function (e) {
        var $this = $(this);
        var fsIndex = $this.attr('fs-target');
        var scrollTo = checkpoints[fsIndex];
        var aTime = Math.round(Math.abs(window.pageYOffset - scrollTo) / options.speed * 1000);
        $('html, body').animate({
            scrollTop: scrollTo
        }, aTime, function(){
            $el.find('.active').removeClass('active');
            $this.addClass('active');
        });
    }
    var scrollHandler = function () {
        if ($content.is(':visible')) {
            var scrollPos = window.pageYOffset + options.distanceToActivate;

            if (scrollPos > checkpoints[0] && scrollPos < $content.offset().top + $content.height()) {
                for (var i = 0; i<checkpoints.length-1; i++) {
                    if (scrollPos >= checkpoints[i] &&
                        scrollPos <= checkpoints[i + 1]) {
                        $el.find('.active').removeClass('active');
                        $el.find('[fs-target='+i+']').addClass('active');
                        break;
                    }
                }
                if (scrollPos >= checkpoints[checkpoints.length-1] &&
                    scrollPos <= $content.offset().top + $content.height()) {
                    $el.find('.active').removeClass('active');
                    $el.find('[fs-target='+(checkpoints.length-1)+']').addClass('active');
                }

            } else {
                $el.find('.active').removeClass('active');
            }
        }
    }

    $headings.each(function(index){
        var $this = $(this);
        var fsEntryLi = $('<li></li>');
        var fsEntryA = $('<a></a>').text($this.text()).attr('fs-target',index).appendTo(fsEntryLi);
        fsEntryLi.appendTo($fly);
        $this.attr('fs-index',index);
        checkpoints[index] = $this.offset().top;
    });

    $target.empty();
    $fly.appendTo($target);
    $fly.on('click','a', fsClickHandler);
    var lastScrollTop = 0;
    $(window).on( "scroll.lc-perpage", scrollHandler);
    $(window).on( "resize.lc-perpage", scrollHandler)

}