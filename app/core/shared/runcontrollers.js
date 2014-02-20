
    var runControllers = function(core, reqData, runList, callback, fail) {
        var runControl = {
            list: [],
            marker: 0,
            results: []
        };
        var errors = [];

        for (key in runList) {
            var conObj = {
                name: key,
                data: runList[key]
            };
            runControl.list.push(conObj);
        }
       // console.log(runControl);
        var nextIteration = function (answer, err) {
            runControl.results.push (answer);
            runControl.marker++;

            var errorRenderCallback = function (errortext) {
                runControl.results.push( {
                    content: {
                        body: errortext.text
                    }
                })
                callback(runControl.results, errors);
            }
            if (typeof err == 'array' && err.length) {
                errors.push (err);
            }
            if (runControl.marker >= runControl.list.length) {
                if (!core.getDecisive()) {
                    core.displayError({
                        code: '404',
                        text: 'Страница не обнаружена'
                    }, errorRenderCallback )

                } else {
                    callback(runControl.results, errors);
                }
            } else {
                iterateController();
            }
        }

        var iterateController = function () {
            console.log('iterating ', runControl);
            var conReq = JSON.parse(JSON.stringify(reqData));
            conReq.routingData = runControl.list[runControl.marker].data.routingData;
            var contextObject = {
                core: core,
                request: conReq
            };
            runControl.list[runControl.marker].data.handler.call(contextObject, nextIteration);
        }

        iterateController();
    }
    module.exports = runControllers;
