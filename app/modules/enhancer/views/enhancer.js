var stickyHead = involve('/modules/enhancer/components/stickyHead.js');

var tabEnhancer = function () {
    var $pane = $('.tab-pane.active');
    if ($pane.length) {
        var paneTop = $pane.offset().top;
        if (!$pane.attr('tocReady')) {
            $pane.find('.toc').flySheet({
                'content': $pane.find('.text-content')
            });
            $pane.attr('tocReady', true);
        }
        $pane.find('.toc').affix({
            offset: {
                top: paneTop,
                bottom: $(document).height() - $pane.height() - paneTop /*+ $pane.find('.toc').height()*/
            }
        });
    }
    $('.gall').magnificPopup({
        delegate: 'span',
        type: 'image',
        gallery:{
            enabled:true
        }
    });
    var ewall = new freewall(".gall");
    ewall.reset({
        selector: '.gal-cell',
        animate: true,
        cell: {
            width: 20,
            height: 200
        },
        onResize: function() {
            ewall.fitWidth();
        }
    });
    ewall.fitWidth();
    // for scroll bar appear;
    $(window).trigger("resize");
}

var enhance = function (callback) {
    $('body').removeClass('admin');
    $('body').addClass('site');
    $('#myTab a:first').tab('show');
    $('#myTab a').click(function (e) {
        e.preventDefault()
        $(this).tab('show');
        tabEnhancer();
    });
    tabEnhancer();
}
var enhanceAdmin = function (callback) {
    $('body').addClass('admin');
    $('body').removeClass('site');
    stickyHead();
    if (lapiCore.appConf.user) {
        addAdminPanel.call(this, callback);
    } else {
        callback();
    }

}
module.exports = {
    routes: [
        {
            pattern: '/admin/*',
            handler: enhanceAdmin
        },
        {
            pattern: '/*',
            handler: enhance
        }
    ]
}