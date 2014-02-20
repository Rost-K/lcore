/*{
    header: page.title,
        content: page.content
}
*/
module.exports = {
    render: function (data, callback, context) {
        var core = context.core;

        core.templates.render({
            file: 'pages/templates/type-plain.html',
            data: data
        }, function(answer){
            callback(answer);
        });
    }
}
