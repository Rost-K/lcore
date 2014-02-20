module.exports = function (config){
    var mu = require('mu2');
    mu.root = config.appdir + '/modules'
    return {
        render: function (templateReq, callback) {
            (function(templateReq, callback){
                var response = '';
                mu.compileAndRender(templateReq.file,templateReq.data)
                    .on('data', function (data){
                        response += data.toString();
                    })
                    .on('end', function () {
                        callback({text:response});
                    });
            })(templateReq, callback)

        }
    }
}