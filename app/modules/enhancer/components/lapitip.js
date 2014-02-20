var lapitip = function(config) {
    /*
        container: selector to element where tooltip element will be placed. Default to [data-section="body"]
        generator: function that receives element parameter and generates content
        selector
     */
    var $elements = config.selector ? $(config.selector) : $('.tooltipable');
    var $container = config.container ? $(config.container) : $('[data-section="body"]');
    var $tip = $('<div></div>',{
        style:
            'background: black;' +
            'position:absolute;' +
            'display: none;'
    });
    $tip.appendTo($container);
    $elements.on('mouseover', function (){
        var $el = $(this);
        var content = config.generator($el);
        var top = $el.offset().top;
        var left = $el.offset().left;
        var height = $el.outerHeight();
        var width = $el.outerWidth();
        console.log({top: (top + height - 10), left: (parseInt(left + width / 2))});
        $tip.html(content).appendTo($el).css({top: (top + height - 10), left: (parseInt(left + width / 2))}).show();
    })
    $elements.on('mouseout', function (){
        $tip.hide();
    })
}

module.exports = lapitip;