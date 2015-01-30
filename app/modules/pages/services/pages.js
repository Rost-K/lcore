var handleUploaded = require('../../helpers/handleUploaded.js');
var filesBaseHelpers = require('../../files/helpers/filesbase.js');

var getPage = function (serviceReq, callback) {
    var alias = serviceReq.data.alias;
    var fields = serviceReq.data.fields;
    var options = {};
    if (fields) {
        options.fields = {};
        for (var i = 0; i<fields.length; i++) {
            options.fields[fields[i]] = 1;
        }
    }
    var pagesCollection = this.db.collection('pages');
    pagesCollection.findOne({
            deleted: {$ne: true},
            alias: alias
        },
        options,
        function(err, result) {
            if (err) throw err;
 //           result = result || null;
            callback({data: {page: result}})
    });
}

var getList = function (serviceReq, callback) {

    var data = serviceReq.data;
    var req = this;
    var dataObj = [];
    var groupsCollection = req.db.collection('groups');
    var pagesCollection = req.db.collection('pages');

    var query = {
        deleted: {$ne: true}
    }
    if (data.pages) {
        if (data.pages != 'empty') {
            for (var i=0; i<data.pages.length; i++) {
                if (data.pages[i]._bsontype) {
                    dataObj.push(data.pages[i]);
                } else {
                    dataObj.push (req.db.ObjectID.createFromHexString(data.pages[i]));
                }
            }
        }
        query._id = {$in: dataObj};
    }

    var listQuery = function (queryObject) {
        pagesCollection.find(queryObject, {title: 1, alias: 1, type: 1}).toArray(
            function(err, result) {
                if (err) throw err;
                callback({data: {list: result}})
            }
        );
    }
    if (serviceReq.data.group) {
        var group = serviceReq.data.group;
        groupsCollection.find({
            alias: group
        }).toArray(
            function(err, result) {
                if (err) throw err;
                if (result.length) {
                    query._id = {$in: result[0].pages}
                    listQuery(query);
                } else {
                    callback({data: {list: {}}})
                }
            }
        );
    } else {
        listQuery(query);
    }

}

var attachFiles = function (serviceReq, callback) {
    var pagesCollection = this.db.collection('pages');
    var handleCallback = function (imageData) {
        pagesCollection.updateById( serviceReq.data.page_id,
            { $push: { files: imageData._id } },
            function (err, result){
                callback({data: null});
            }
        );
    }
    handleUploaded(serviceReq, handleCallback, this);

}

var getAttachedFiles = function (serviceReq, callback) {
    var db = this.db;
    var pagesCollection = this.db.collection('pages');
    pagesCollection.findById(serviceReq.data.page_id,
        {fields: {files:1}},
        function(err, result) {
            if (err) throw err;
            filesBaseHelpers.getFilesListData(db, result.files, callback);
        });

}

var savePage = function (serviceReq, callback) {
    var data = serviceReq.data;
    var req = this;
    data._id = data._id || '';
    var addToGroup = false;
    if (!data.alias && !data._id && !data.title) {
        callback({err: 'ERR_MOD_PAGES_SERV_WRONG_SAVE_PAGE_DATA'});
        return;
    }
    var pagesCollection = req.db.collection('pages');
    if (data.addToGroup) {
        addToGroup = data.addToGroup;
        delete data.addToGroup;
    }
    var checkAliasReq = {
        alias: data.alias,
        deleted: {$ne: true}
    }
    if (data._id !== '') {
        checkAliasReq._id = {
            $ne: req.db.ObjectID.createFromHexString(data._id)
        }
    }
    pagesCollection.count(checkAliasReq, function(err, count) {
        if (count > 0) {
            callback({data: {errors: [{field: 'alias', type:'same-alias'}]}});
            return;
        } else {
            if (data._id === '') {
               delete data._id;
               pagesCollection.insert(data, {strict: true}, function (err, result){
                   var resVal = result[0];
                   if (addToGroup) {
                       req.core.services.call({
                           name: 'groups',
                           method: 'setPages',
                           data:{
                               addToGroup: addToGroup,
                               pages:[resVal._id]
                           }
                       }, function (answer) {
                           callback({data: resVal});
                       })
                   } else {
                       callback({data: resVal});
                   }

               });
                return;
            }  else {
                data._id = req.db.ObjectID.createFromHexString(data._id);
                pagesCollection.save(data, {strict: true}, function (err, result){
                    callback({data: result});
                });
                return;
            }
        }
    });
}
var deletePages = function (serviceReq, callback) {
    var data = serviceReq.data || [];
    var that = this;
    var pagesCollection = that.db.collection('pages');

    if (data.length > 0) {
        var dataIDs = [];
        for (var i=0; i<data.length; i++) {
            dataIDs.push(pagesCollection.id(data[i]));
        }

        pagesCollection.update({_id: {$in: dataIDs}}, {$set: {deleted: true}}, {safe: true, multi: true}, function(answer){

            callback({data:{}})
        })
    } else {
        callback({data:{}});
    }


}
module.exports = {
    methods: {
//        groups: getGroups,
        page: getPage,
        attachFiles: attachFiles,
        getAttachedFiles: getAttachedFiles,
        /*defaultMethod: returnEmpty*/
        list: getList,
        save: savePage,
        delete: deletePages
    }
}