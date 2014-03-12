var listPages = function (callback) {
    var buildTree = involve('/modules/helpers/treebuilder/buildtree.js');
    var context = this;
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

   /* var serviceReqData = {
        cat: 'main'
    }   */

    core.services.call({
            name: 'pages',
            method: 'list',
            data:{}
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
            core.services.call({
                    name: 'pages',
                    method: 'groups',
                    data:{}
            },
            function(answer) {
                console.log(answer);
                var treeHTML = buildTree(answer.data);
                core.templates.render({
                    file: 'pages/templates/admin/list.html',
                    data: {
                        columns: tableFields,
                        rows: rows,
                        count: rows.length,
                        tree: treeHTML
                    }
                }, function(answer){
                    core.templates.render({
                        file: 'admin/templates/admin.html',
                        data: {
                            title: 'Страницы',
                            subtitle: 'Весь список',
                            content: answer.text
                        }
                    }, function(answer){
                        callback({content:{body: answer.text}});
                    });
                });
            });
        });
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