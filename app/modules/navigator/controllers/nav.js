    var navGenerator = function (callback) {
        var serviceReqData = {
            cat: 'main'
        }
        var core = this.core;
        core.services.call({name: 'pages', method: 'list', data:serviceReqData}, function(answer) {
            var list = answer.data.list;
            var nav = [];
            for(var i=0; i<list.length; i++) {
                nav[i] = {};
                nav[i].title = list[i].title;
                nav[i].href = '/page/'+list[i].alias;
            }

            core.templates.render({
                file: 'navigator/templates/navbar.html',
                data:{
                    nav: nav
                }
            }, function(answer){
                callback({content:{navbar: answer.text}});
            });
        });

    }
    module.exports = {
        routes: [

            {
                pattern: '*',
                handler: navGenerator
            }
        ]
    }