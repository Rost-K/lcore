
var compiledTemplates = {};


module.exports = function (config){
    var handlebars = require('handlebars');
    handlebars.registerHelper("if", function(conditional, options) {
        if (options.hash.desired === options.hash.type) {
            options.fn(this);
        } else {
            options.inverse(this);
        }
    });
    var fs = require('fs');
    var root = config.appdir + '/modules';
    var render = function (templateReq, callback) {
        if (typeof templateReq.file == "undefined") {
            var response = handlebars.compile(templateReq.template)(templateReq.data);
            callback({text:response});
        } else if (typeof compiledTemplates[templateReq.file] != 'function') {
            fs.readFile(root + '/' + templateReq.file, {encoding: 'utf-8'},function (err, data) {
                    if (!err) {
                        compiledTemplates[templateReq.file] = handlebars.compile(data);
                        var response = compiledTemplates[templateReq.file](templateReq.data);
                        callback({text:response});
                    } else {
                        callback({error:err});
                    }

            })
        } else {
            var response = compiledTemplates[templateReq.file](templateReq.data);
            callback({text:response});
        }
    }
    return {
        render: render
    }
}