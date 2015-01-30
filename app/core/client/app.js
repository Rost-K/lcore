

module.exports = function () {
    var urlhandler = involve('/core/client/urlhandler.js');

    var app = {};
    var controllers = {};
    var views = {};

    for (var key in lapiCore.appConf.controllers) {
        controllers[key] = involve (lapiCore.appConf.controllers[key]);
    }
    for (var key in lapiCore.appConf.views) {
        views[key] = involve (lapiCore.appConf.views[key]);
    }
    lapiCore.appStructure.controllers = controllers;
    lapiCore.appStructure.views = views;
    core = involve('/core/client/core.js');
    urlhandler.start();


}

