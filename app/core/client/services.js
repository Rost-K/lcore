var call = function(request, callback) {
    $.ajax({
        type: "POST",
        url: '/services/'+request.name,
        data:  JSON.stringify(request),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        success: callback
    })
}

module.exports = {
    call: call
}