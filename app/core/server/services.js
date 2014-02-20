module.exports = function (config, appStructure, serviceReqInstance){
    var services = appStructure.services;
    return {
        call: function(request, callback) {
            var name = request.name;
            var method = request.method;
            if (!request.data) request.data = {};
            if (typeof services[name] !== "undefined") {
                if (typeof services[name].methods[method] == "undefined") {
                    if (typeof services[name].methods.defaultMethod != "undefined") {
                        method = 'defaultMethod';
                    } else {
                        replier({err: 'Unknown method'})
                    }
                }
                var contextObject = {
                    core: this,
                    request: serviceReqInstance,
                    db: appStructure.db
                };
                services[name].methods[method].call(contextObject, request, callback);
            } else {
                callback({err: 'No service'});
            }


        }
    }
}