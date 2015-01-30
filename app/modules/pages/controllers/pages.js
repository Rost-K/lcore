var fullPage = function (callback) {
    var context = this;
    var core = this.core;
    var reqdata = this.request;

    var _ = involve('/modules/helpers/underscore-min.js');
    var editMode = (reqdata.routingData.edit === null);

    var pageTypes = {
        tabs: involve('/modules/pages/controllers/types/tabs.js'),
        plain: involve('/modules/pages/controllers/types/plain.js')
    }

    var mainRenderCallback = function (data) {
        core.templates.render({
            file: 'pages/templates/full.html',
            data: data
        }, function(answer){
            callback({content:{body: answer.text}});
        });
    }

    var serviceReqData = {
        alias: reqdata.routingData.alias
    }
    core.services.call({
            name: 'pages',
            method: 'page',
            data:serviceReqData
        },
        function(answer) {
            var page = answer.data.page;
            core.shared.pageData = page;
            if (page == null) {
                callback({content:{}},
                    {
                        type: 'ERR_MOD_PAGES_NOT_FOUND',
                        code: 404
                    }
                );
                return;
            }
            if (pageTypes[page.type]) {
                var renderData = _.extend({
                    "hide-header": !editMode && !!page['hide-intro'],
                    "edit-mode": editMode
                }, page);

                core.setDecisive(true);
                pageTypes[page.type].render(renderData, mainRenderCallback, context);
            } else {
                callback({content:{}},
                    {
                        type: 'ERR_MOD_PAGES_UNKNOWN_TYPE',
                        code: 404
                    }
                );
            }
        }
    );

}
module.exports = {
    routes: [
        /*{
         pattern: '/page/:keyvalues',
         handler: logData
         },*/

        {
            pattern: '/page/:alias/:keyvalues',
            handler: fullPage
        },
        {
            pattern: '/page/:alias',
            handler: fullPage
        }
    ]
}