var appdir = __dirname + '/app';
var config = require (appdir+"/config");
config.appdir = appdir;
config.pubdir = __dirname + config.publicFolder;

var appStructure = require(config.appdir + '/core/server/build.js')(config);

global.involve = function (path) {
    return require (config.appdir + path);
}

var connect = require("connect");

var coreWare = require(appdir + "/core/server/coreware.js");
var lapauth = require("lapauth");
connect()
    .use(connect.logger())
    .use(connect.static(__dirname + "/public"))
   /* .use(function(err, req, res, next){
        if (err) {
            console.error(err.stack);
            res.end(404, 'Something broke!');
        } else {
            next()
        }
    })    */
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'kcat', cookie: { maxAge: 120*60*1000 }}))
    .use(connect.bodyParser())
    .use(lapauth(config, appStructure))
    .use(coreWare(config, appStructure))
    .listen(3000);