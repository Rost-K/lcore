var pushStateAvailable = true;
var core = {};
var helpers = involve('/core/client/helpers.js');
var router = involve('/core/shared/router.js');
var runControllers = involve('/core/shared/runControllers.js');

if (typeof history.pushState === 'undefined') {
    pushStateAvailable = false;
}

var generateReq = function (url) {
    var reqdata = {};
    reqdata.url = url;
    reqdata.errors = [];
    reqdata.body = {};
    reqdata.cookies = helpers.decodeCookies(document.cookie);
    if (reqdata.cookies['lc.user'] && !lapiCore.appConf.user) {
        lapiCore.appConf.user = JSON.parse(reqdata.cookies['lc.user']);
    }
    if (lapiCore.appConf.user) {
        reqdata.user = lapiCore.appConf.user;
    }
    return reqdata;
}
routeViews = function(reqdata, url) {
    var routeResult = router(url, lapiCore.appStructure.views);
    var viewCallback = function(data) {

    }

    if (routeResult !== false) {
        //runControllers(reqdata, routeResult, viewCallback);
        runControllers(core, reqdata, routeResult, viewCallback);
    } else {
        // alert('routing failed');
    }
}

routeControllers = function(url) {
    //Creating reqdata object for current request
    var reqdata = generateReq(url);

    var routeResult = router (url, lapiCore.appStructure.controllers);
    var controllingCallback = function(data) {
        for (var i = 0; i < data.length; i++) {
            for (outkey in data[i].content) {
                $('[data-section="'+outkey+'"]').replaceWith(data[i].content[outkey]);
            }
        }
        routeViews(reqdata, url);
    }
    core.shared = {};
    runControllers(core, reqdata, routeResult, controllingCallback);

    var routeResult = router(url, lapiCore.controlRoutes);

    if (routeResult !== false) {
        runControllers(reqdata, routeResult, controllingCallback);
    } else {
        // alert('routing failed');
    }
}
var decisive = false;
var setDecisive = function (newDecisive) {
    decisive = newDecisive;
}
var getDecisive = function () {
    return decisive;
}

var displayError = function (errorData, callback) {
    this.templates.render({
            file: 'templates/error.html',
            data: errorData
        },
        callback);
}
//Public methods
core.services = involve('/core/client/services.js');
core.templates = involve('/core/client/templates.js');
core.setDecisive = setDecisive;
core.getDecisive = getDecisive;
core.displayError = displayError;
core.routeURL = function (url, doNotPush) {
    decisive = false;
    routeControllers(url);
    if (!doNotPush) {
        if (pushStateAvailable) {
            history.pushState(null, null, url);
        } else {
            //window.location = '/#!' + url;
        }
    }
    // console.log(routeResult);
}
core.shared = lapiCore.appConf.share;
//route views after initial loading
var url = document.location.pathname;

(function(url){
    var reqdata = generateReq(url);
    routeViews(reqdata,url);
})(url);

module.exports = core;

