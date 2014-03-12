var connect = require("connect");

connect()
    .use(connect.logger())
    .use(connect.static(__dirname + "/public"))
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'kcat', cookie: { maxAge: 120*60*1000 }}))
    .use(connect.multipart({ uploadDir: __dirname+'/upl' }))
    .use(connect.bodyParser())
    .use(function(req, res){
        console.log(req.body, req.files);
        res.end('{ "file": { "url" : "/path/to/file.jpg" } }');
    })

    .listen(3000);