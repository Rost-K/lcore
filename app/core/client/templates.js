var handlebars = involve('/core/client/handlebars.js');
handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    };

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});
var compiledTemplates = {};

var renderer = function (templateReq, callback) {
    if (typeof templateReq.file == "undefined") {
        var response = handlebars.render(templateReq.template, templateReq.data);
        callback({text:response});
    } else if (typeof compiledTemplates[templateReq.file] != 'function') {
        $.ajax({
            type: "POST",
            url: '/templates/get',
            data: {file: templateReq.file},
            dataType: 'json',
            success: function(res) {
                if (!res.err) {
                    compiledTemplates[templateReq.file] = handlebars.compile(res.content);
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