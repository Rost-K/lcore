var listPages = function (callback) {
    var buildTree = involve('/modules/helpers/treebuilder/buildtree.js');
    //var context = this;
    var core = this.core;
    var reqdata = this.request;
    var passedKeys = [
        'cat',
        'sortfield',
        'sortway',
        'page'
    ]
    var tableFields = [
        {
            name: 'title',
            title: 'Название'
        },
        {
            name: 'alias',
            title: 'Указатель'
        },
        {
            name: 'type',
            title: 'Тип'
        }
    ]

    core.services.call({
            name: 'groups',
            method: 'get',
            data:{}
        },
        function(answer) {
            var currentGroup = reqdata.routingData.group?reqdata.routingData.group:'all';
            var tree = buildTree({
                data: answer.data,
                activeGroup: currentGroup
            });
            core.shared.currentGroup = tree.current;
            var pagesData;
            if (currentGroup == 'all') {
                pagesData = null;
            } else {
                pagesData = tree.current.pages.length ? tree.current.pages : 'empty';
            }

            core.services.call({
                    name: 'pages',
                    method: 'list',
                    data:{
                        pages: pagesData
                    }
                },
                function(answer) {
                    var list = answer.data.list;
                    var rows = [];
                    for (var i=0; i < list.length; i++ ) {
                        var item = list[i];
                        var cells = []
                        for (var k=0; k < tableFields.length; k++ ) {
                            if (k == 0) {
                                var content = '<a href="/page/'+item.alias+'/">'+item.title+'</a>';
                            } else {
                                var content = item[tableFields[k].name] ? item[tableFields[k].name] : '';
                            }
                            cells.push({
                                content: content
                            });
                        }
                        rows.push({
                            _id: item._id,
                            alias: item.alias,
                            cells: cells
                        });
                    }
                    core.templates.render({
                        file: 'pages/templates/admin/list.html',
                        data: {
                            columns: tableFields,
                            rows: rows,
                            count: rows.length,
                            tree: tree.html
                        }
                    }, function(answer){
                        if (tree.current) {
                            var title = tree.current.title;
                        } else {
                            var title = 'Весь список';
                        }
                        var content = answer.text;
                        core.templates.render({
                            file: 'pages/templates/admin/toppanel.html',
                            data: {}
                        }, function(answer){
                            var panel = answer.text;
                            core.templates.render({
                                file: 'admin/templates/admin.html',
                                data: {
                                    title: 'Страницы',
                                    subtitle: title,
                                    panel: panel,
                                    content: content
                                }
                            }, function(answer){
                                callback({content:{body: answer.text}});
                            });
                        });
                    });
                }
            );
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
            pattern: '/admin/pages/:keyvalues',
            handler: listPages
        }
    ]
}