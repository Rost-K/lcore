var dashboard = function (callback) {
    var core = this.core;
    var reqdata = this.request;

    if (typeof reqdata.user == 'object') {
        core.templates.render({
            file: 'pages/templates/full.html',
            data:{
                text: 'You are logged in. <a href="/admin">GO TO</a>'
            }
        }, function(answer){
            core.setDecisive(true);
            callback({content: {
                body: answer.text,
                bodyclass: 'admin'
            }});
        });
    } else {
        core.templates.render({
            file: 'admin/templates/loginform.html',
            data:{}
        },  function(answer){
            core.setDecisive(true);
            callback({content: {
                body: answer.text,
                bodyclass: 'admin'
            }});
        });

    }
}
module.exports = {
    routes: [
        {
            pattern: '/admin/',
            handler: dashboard
        },
        {
            pattern: '/admin',
            handler: dashboard
        }
    ]
}
