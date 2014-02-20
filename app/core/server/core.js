module.exports = function (config, appStructure, reqInstance){
    var decisive = false;
    var setDecisive = function (newDecisive) {
        decisive = newDecisive;
    }
    var getDecisive = function () {
        return decisive;
    }
    var statusCode = false;
    var displayError = function (errorData, callback) {
        statusCode = errorData.code;
        this.templates.render({
                file: 'templates/error.html',
                data: errorData
            },
            callback);
    }
    var getStatusCode = function () {
        return statusCode;
    }
    return {
        setDecisive: setDecisive,
        getDecisive: getDecisive,
        getStatusCode: getStatusCode,
        displayError: displayError,
        share: {},
        templates: require('./templates.js')(config),
        services: require('./services.js')(config, appStructure, reqInstance)
    }
}