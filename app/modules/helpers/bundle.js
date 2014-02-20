module.exports = function (input, callback) {
    var marker = 0;
    var length = 0;
    var _ = involve('/modules/helpers/underscore-min.js');

    if (Object.prototype.toString.call(input) === '[object Object]') {
        var result = {};
        for (var key in input) {
            length++;
        }
    } else if (Object.prototype.toString.call(input) === '[object Array]') {
        var result = [];
        length = input.length;
    } else {
        callback(null);
        return true;
    }
    if (_.isEmpty(input)) {
        callback(result);
        return true;
    }
    var callbackGenerator = function (target, point) {
        return function (data) {
            target[point] = data;
            marker++;
            if (marker == length) callback(target);
        };
    }

    if (Object.prototype.toString.call(input) === '[object Object]') {
        var result = {};
        for (var key in input) {
            input[key](callbackGenerator(result, key));
        }
    } else {
        var result = [];
        for (var i = 0; i < input.length; i++) {
            input[i](callbackGenerator(result, i));
        }
    }
}