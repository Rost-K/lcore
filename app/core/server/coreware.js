var router = require ('../shared/router.js');
var fs = require ('fs');
var coreWare = function (config, appStructure) {
    console.log('App started');
    return function (req, res, next) {
        var serviceReqInstance = {
            url: req.url,
            method: req.method,
            cookies: req.cookies,
            body: req.body,
            files: req.files,
            session: req.session
        }

        var controllerReqInstance = {
            url: req.url,
            cookies: req.cookies,
            user: req.user
        }

        var core = require ('./core.js')(config, appStructure, serviceReqInstance);

        var templatingCallback = function(content) {
            if (core.getStatusCode()) {
                res.writeHead(core.getStatusCode());
            }
            res.end(content.text);
        }

        var controllingCallback;
        controllingCallback = function (data, err) {
            console.log(err);
            var templateData = {};
            for (var i = 0; i < data.length; i++) {
                for (outkey in data[i].content) {
                    templateData[outkey] = data[i].content[outkey];
                }
            }
            templateData['appDependencies'] = appStructure.dependencies;
            var outputStructure = JSON.parse(JSON.stringify(appStructure.appConfig));
            if (req.user) {
                outputStructure.user = req.user;
            }
            templateData['sharedData'] = JSON.stringify(core.share);
            templateData['appStructure'] = JSON.stringify(outputStructure);

            console.log('---');
            console.log(JSON.stringify(core.share));
            templateReq = {
                file: "templates/main.html",
                data: templateData
            }
            core.templates.render(templateReq, templatingCallback);
        };
        // Handler for service call from browser
        var serviceCallback = function(answer) {
            res.end(JSON.stringify(answer))
        }
        var templateGetCallback = function(err, data) {
            if (err) {
                res.end(JSON.stringify({error: 'Wrong file name'}));
            }
            res.end(JSON.stringify({content: data}));
        }

        var emptyHandler = function (reqdata, callback) {
        }

        var serviceResult = router (req.url, {service: {routes: [{pattern:'/services/:name', handler: emptyHandler}]}});

        if (serviceResult) {
            core.services.call(serviceReqInstance.body, serviceCallback);
        } else {
            var templateGetResult = router (req.url, {getTemplate: {routes: [{pattern:'/templates/get', handler: emptyHandler}]}});
            if (templateGetResult) {
                var filename = req.body.file;
                if (filename.indexOf('./') < 0 && filename.indexOf(':') < 0 && filename.indexOf('~') < 0) {
                    fs.readFile(config.appdir + '/modules/' + filename, {encoding: 'utf-8'}, templateGetCallback);
                } else {
                    res.end(JSON.stringify({error: 'Wrong file name'}));
                }
            } else {
                var routeResult = router (req.url, appStructure.controllers);
                var runControllers = require ('../shared/runcontrollers.js');
                if (routeResult) {
                    runControllers(core, controllerReqInstance, routeResult, controllingCallback);
                } else {
                    res.writeHead(404);
                    res.end('Not Found');
                }
            }
        };
    }
}
    module.exports = coreWare;