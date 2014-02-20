var helpers = {};
helpers.copyObj = function(obj) {
    return JSON.parse(JSON.stringify(obj));
}

helpers.decodeURIString = function (URIString) {
    var content = {};
    if (URIString) {
        var data = URIString;
        var qs = data.split('&');
        for(var i = 0, result = {}; i < qs.length; i++){
            qs[i] = qs[i].split('=');
            content[qs[i][0]] = decodeURIComponent(qs[i][1]);
        }
    }
    return content;
}

helpers.decodeCookies = function(cookieStr) {
    if (typeof cookieStr == 'undefined' || !cookieStr) {
        return {};//code
    }
    var cookieArr = cookieStr.split('; ');
    console.log('decoding cookie - '+JSON.stringify(cookieArr)+'\n');
    var retArr = {};
    for (var i = 0; i<cookieArr.length; i++) {
        var pr = cookieArr[i].split('=');
        var key = pr[0];
        var value = decodeURIComponent(pr[1]);
        retArr[key] = value;
    }
    return retArr;
}
helpers.cookies = involve('/core/client/helpers/cookies.js');
module.exports = helpers;