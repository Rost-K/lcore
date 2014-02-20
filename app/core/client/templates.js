var mustache = involve('/core/client/mustache.js');
var compiledTemplates = {};

var renderer = function (templateReq, callback) {
    if (typeof templateReq.file == "undefined") {
        var response = mustache.render(templateReq.template, templateReq.data);
        callback({text:response});
    } else if (typeof compiledTemplates[templateReq.file] != 'function') {
        $.ajax({
            type: "POST",
            url: '/templates/get',
            data: {file: templateReq.file},
            dataType: 'json',
            success: function(res) {
                if (!res.err) {
                    compiledTemplates[templateReq.file] = mustache.compile(res.content);
                    var response = compiledTemplates[templateReq.file](templateReq.data);
                    callback({text:response});
                } else {
                    callback({error:err});
                }
            }
        })
    } else {
        var response = compiledTemplates[templateReq.file](templateReq.data);
        callback({text:response});
    }
}

module.exports = {
    render: renderer
}