module.exports = function(config) {

    var fs = require('fs');
    var path = require('path');
    var rimraf = require ('rimraf');
    var mkdirp = require('mkdirp');

    var appStructure = {};
    var modules = {};
    var controllers = {};
    var controllersDepList = [];
    var dependencies = [];
    var services = {};
    var appConfig = {
        controllers: {},
        views: {}
    }

    var addDependency = function (item, addTo) {
        if (addTo.indexOf(item) < 0) {
            addTo.push(item);
        }
    }
    rimraf.sync(config.appdir + '/..' + config.publicFolder + '/app');

    for (var k = 0; k < config.modules.length; k++) {
        var modName = config.modules[k].name;
        modules[modName] = require (config.appdir + '/modules/' + modName);
        for (var key in modules[modName].controllers) {
            controllers[key] = require (config.appdir + '/modules/' + modName + '/' + modules[modName].controllers[key]);
            addDependency('/modules/' + modName +  modules[modName].controllers[key], controllersDepList);
            appConfig.controllers[key] = '/modules/' + modName +  modules[modName].controllers[key];
        }
        for (var key in modules[modName].views) {
            addDependency('/modules/' + modName +  modules[modName].views[key], controllersDepList);
            appConfig.views[key] = '/modules/' + modName +  modules[modName].views[key];
        }
        for (var key in modules[modName].services) {
            services[key] = require (config.appdir + '/modules/' + modName + '/' + modules[modName].services[key]);
        }
    }
    appStructure.controllers = controllers;
    appStructure.services = services;

//Build scripts for browser
    var buildDependencies = function (startList,prefix) {
        var modules = startList.concat([]);
        var worklist = startList;

        var iterateDep = function () {
            var tlist = [];
            for (var i=0; i < worklist.length; i++) {
                var res = fs.readFileSync(config.appdir + worklist[i]);
                var fileContent = res.toString();
                var reqPattern=/involve\(["'](.*?)[\w\d\.]+["']\)/gm;
                var reqMatches = fileContent.match(reqPattern);
                if(reqMatches) {
                    for (var k=0; k < reqMatches.length; k++) {
                        var modName = reqMatches[k].replace('involve(','');
                        var modName = modName.replace(')','');
                        var modName = modName.replace(/ /g,'');
                        var modName = modName.replace(/"/g,'');
                        var modName = modName.replace(/'/g,'');
                        if (modules.indexOf(modName) < 0) {
                            modules.push(modName);
                            tlist.push(modName);
                        }
                    }
                }
                var startingLine = 'lapiCore.modulesPre[\''+worklist[i]+'\'] = function (module) { \n';
                var endingLine = '\n}';

                var itemDir = path.dirname(worklist[i]);
                if (!fs.existsSync(config.pubdir + '/app' + itemDir)) {
                    mkdirp.sync(config.pubdir + '/app' + itemDir);
                }
                fs.writeFileSync(config.pubdir + '/app' + worklist[i],
                    startingLine + fileContent + endingLine);

            }

            worklist = tlist;
        }
        while (worklist.length > 0) {
            iterateDep();
        }
        modules.reverse();
        for (var k=0; k < modules.length; k++) {
            modules[k] = modules[k];
        }
        return modules;
    }

    var dependencies = buildDependencies(['/core/client/app.js']);
    dependencies = dependencies.concat(buildDependencies(controllersDepList));

    appStructure.db = require('mongoskin').db(config.db.host+':'+config.db.port+'/'+config.db.db_name, {safe:true});
    appStructure.dependencies = [];
    for (var i=0; i < dependencies.length; i++){
        appStructure.dependencies.push({src: '/app' + dependencies[i]});
    };
    appStructure.appConfig = appConfig;
    return appStructure;
}