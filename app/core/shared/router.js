
var router = function (url, patterns) {
    var checkRoute = function(route, pattern) {
        var patternElem = pattern.split('/');
        var routeElem = route.split('/');
        var ret = {};

        var createKeyValues = function (startIndex, routeElem, ret) {
            for (var i = startIndex; i < routeElem.length; i = i + 2) {
                ret[routeElem[i]] = routeElem[i+1];
            }
        }

        for (var i=0; i<patternElem.length; i++) {
            pEl = patternElem[i];
            rEl = routeElem[i];

            if ((pEl !== '*' && pEl!==':keyvalues')) {
                if (typeof rEl == 'undefined') {
                    return false;
                }
                if (pEl.indexOf(':') !== 0 && pEl !== rEl) {
                    return false;
                }

            }
            if (pEl === rEl) {
                continue;
            }
            if (pEl === '*') {
                break;
            }
            if (pEl === ':keyvalues') {
                createKeyValues(i, routeElem, ret);
                break;
            }
            if (pEl.indexOf(':') === 0) {
                ret[pEl.replace(':','')] = rEl;
            }
        }
        return ret;
    }

    var checkControllerRoutes = function(route, controllerPatterns) {
        var handlingData = {};
        for (var i=0; i<controllerPatterns.length; i++) {
            handlingData = checkRoute(url, controllerPatterns[i].pattern);
            if (handlingData !== false) {
                return {
                    routingData: handlingData,
                    handler: controllerPatterns[i].handler
                }
            }
        }
        return false;
    }

    var returnData = false;
    var controllerResults = {};

    for (key in patterns) {
        controllerResults = checkControllerRoutes(url, patterns[key].routes);
        if (controllerResults !== false) {
            if (typeof returnData != 'object') returnData = {};
            returnData[key] = controllerResults
        }
    }
    return returnData;
}

module.exports = router;





