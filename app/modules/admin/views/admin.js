var addAdminPanel = function (callback) {
    var slido = $('#slido');
    $('#center-panel').addClass('slido-on');
    if (slido.length == 0) {
        this.core.templates.render({
            file: 'admin/templates/slido.html',
            data:{}
        }, function(answer){
            $('body').prepend(answer.text);
            $('nav.slido ul ul').each(function(){
                var $this = $(this);
                var parentLink = $this.parents('li').first().children('a');
                if ($this.find('.title').length) {
                    return
                } else {
                    var titleText = parentLink.text();
                    var backLink = $('<i>',{class:'fa fa-caret-right goback'});
                    var titleSpan = $('<span>',{class: 'title'});
                    titleSpan.html(titleText).append(backLink);
                    titleSpan.prependTo($this);
                    var closeNested = function () {
                        $(this).parents('ul').first().animate({width:'0px'},500);
                    }
                    titleSpan.on('click', closeNested);
                    parentLink.prepend($('<i>',{class:'fa fa-caret-left goforth'}));
                }
            })
            $('#openMenu').on('click',function(e) {
                e.preventDefault();
                var $this = $(this);
                if($this.is('.opened')) {
                    $('#slido').find('nav').animate({width:'0px'},500);
                    $('#slido').find('ul ul').animate({width:'0px'},500);
                    $this.removeClass('opened');

                } else {
                    $('.slido ul ul').css({width:'0px'});
                    $('#slido').find('nav').animate({width:'300px'},500);
                    $this.addClass('opened');
                }
            });
            $('nav.slido a').on('click',function(e) {

                var $this = $(this);
                var nestedUL = $this.parents('li').children('ul');
                if (nestedUL.length) {
                    e.preventDefault();
                    nestedUL.animate({width:'300px'},500);
                }
            })
            callback();
        })
    } else {
        callback();
    }
}
    var adminEnhancer = function (callback) {
        var req = this;
        if (lapiCore.appConf.user) {
            addAdminPanel.call(this, function() {
                if (req.request.routingData.page) {
                    $('#editButton').attr('href','/page/' + req.request.routingData.page + '/edit').show();
                } else {
                    $('#editButton').parent('div').hide();
                }
                callback();
            });

        } else {
            $('#center-panel').removeClass('slido-on');
            $('#slido').remove();
            callback();
        }
    }
    module.exports = {
     routes: [
     {
         pattern: '/:keyvalues',
         handler: adminEnhancer
     }
     ]
 }