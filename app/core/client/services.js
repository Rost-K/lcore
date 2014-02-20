var call = function(request, callback) {
    $.ajax({
        type: "POST",
        url: '/services/'+request.name,
        data: request,
        dataType: 'json',
        success: callback
    })
}

module.exports = {
    call: call
}