var getGroups = function (serviceReq, callback) {
    var groupsCollection = this.db.collection('groups');
    groupsCollection.find({}).toArray(
        function(err, result) {
            if (err) throw err;
            callback({data: result})
        }
    );
}
var getPage = function (serviceReq, callback) {
    var alias = serviceReq.data.alias;
    var pagesCollection = this.db.collection('pages');
    pagesCollection.findOne({
            deleted: {$ne: true},
            alias: alias
        },
        function(err, result) {
            if (err) throw err;
 //           result = result || null;
            callback({data: {page: result}})
    });
}

var getList = function (serviceReq, callback) {

    var menuCollection = this.db.collection('menus');
    var pagesCollection = this.db.collection('pages');
    var query = {
        deleted: {$ne: true}
    }
    var listQuery = function (queryObject) {
        pagesCollection.find(queryObject, {title: 1, alias: 1, type: 1}).toArray(
            function(err, result) {
                if (err) throw err;
                callback({data: {list: result}})
            }
        );
    }
    if (serviceReq.data.cat) {
        var cat = serviceReq.data.cat;
        menuCollection.find({
            name: cat
        }).toArray(
            function(err, result) {
                if (err) throw err;
                if (result.length) {
                    listQuery(query._id = {$in: result[0].elements});
                } else {
                    callback({data: {list: {}}})
                }
            }
        );
    } else {
        listQuery(query);
    }

}
var savePage = function (serviceReq, callback) {
    var data = serviceReq.data;
    var req = this;
    data._id = data._id || '';
    if (!data.alias && !data._id && !data.title) {
        callback({err: 'ERR_MOD_PAGES_SERV_WRONG_SAVE_PAGE_DATA'});
        return;
    }
    var pagesCollection = req.db.collection('pages');

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
                   console.log(result);

                    callback({data: {}});
                });
                return;
            }  else {
                data._id = req.db.ObjectID.createFromHexString(data._id);
                pagesCollection.save(data, {strict: true}, function (err, result){
                    console.log(result);

                    callback({data: {}});
                });
                callback({data: {}});
                return;
            }
        }
    });
    console.log(data);
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
        console.log(dataIDs);
        pagesCollection.update({_id: {$in: dataIDs}}, {$set: {deleted: true}}, {safe: true, multi: true}, function(answer){
            console.log(answer);
            callback({data:{}})
        })
    } else {
        callback({data:{}});
    }


}
module.exports = {
    methods: {
        groups: getGroups,
        page: getPage,
        /*defaultMethod: returnEmpty*/
        list: getList,
        save: savePage,
        delete: deletePages
    }
}