/*{
    header: page.title,
        content: page.content
}
*/
module.exports = {
    render: function (data, callback, context) {
        var core = context.core;

        var bundle = involve('/modules/helpers/bundle.js');
        var bundleData = [];
        var templatingData = data;
        templatingData.titles = [];
        templatingData.content = templatingData.content || [];

        var itemCreator = function (itemData) {
            return function (callback) {
                switch (itemData.type) {
                    case 'text': {
                        core.templates.render({
                            file: 'pages/templates/tabs/tab-text.html',
                            data: itemData
                        }, function(answer){
                            callback(answer);
                        });
                        break;
                    }
                    case 'gallery': {
                        core.templates.render({
                            file: 'pages/templates/tabs/tab-gal.html',
                            data: itemData
                        }, function(answer){
                            callback(answer);
                        });
                        break;
                    }
                    default : {
                        callback({text:''})
                    }
                }
            }
        }
        var bundleCallback = function (result) {
            templatingData.tabs = result;
            core.templates.render({
                file: 'pages/templates/type-tabs.html',
                data: templatingData
            }, function(answer){
                callback(answer);
            });
        }

        for (var i=0; i<data.content.length; i++) {
            if (i == 0) {
                data.content[i].active = true;
            }
            templatingData.titles.push ({
                num: i,
                title:data.content[i].title,
                active: data.content[i].active,
                key: data.content[i].key,
                type: data.content[i].type
            });

            data.content[i].num = i;

            bundleData[i] = itemCreator (data.content[i]);
        }
        bundle(bundleData, bundleCallback);
    }
}
