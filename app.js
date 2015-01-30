var appdir = __dirname + '/app';
global.appdir = appdir;
var config = require (appdir+"/config");
config.appdir = appdir;
config.pubdir = __dirname + config.publicFolder;

var appStructure = require(config.appdir + '/core/server/build.js')(config);

global.involve = function (path) {
    return require (config.appdir + path);
}

var app = require("express");
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var multiparty = require('multiparty');

var coreWare = require(appdir + "/core/server/coreware.js");
var serveImage = require(appdir + "/core/server/serveImage.js");
var lapauth = require("lapauth");

app()
    .use(app.static(__dirname + "/public"))
    .use(cookieParser())
    .use(session({ secret: 'kcat', cookie: { maxAge: 120*60*1000 }}))
    .use(bodyParser())
    .use('/image/bp-:bpoint/:image_id',serveImage(config, appStructure))
    .use('/image/:image_id',serveImage(config, appStructure))
    .use(function (req, res, next) {
        if (req.method == 'POST' && req.headers['content-type'].indexOf('multipart/form-data') >= 0) {

            var form = new multiparty.Form({
                uploadDir: __dirname + '/upltmp',
                autoFiles: true,
                autoFields: true
            });

            form.parse(req, function (err, fields, files) {
                if (files) req.files = files;
                var bodyFields = {
                    name: fields['service.name'][0],
                    method: fields['service.method'][0],
                    data: {}
                };
                for (var key in fields) {
                    if (key.indexOf('data.') == 0) {
                        bodyFields.data[key.replace('data.','')] = fields[key][0];
                    }

                }
                req.body = bodyFields;
                next();
            });
        }
        else {
            next()
        }
    }
)
    .use(lapauth(config, appStructure))
    .use(coreWare(config, appStructure))
    .listen(3000);