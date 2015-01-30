module.exports = {
    publicFolder: '/public',
    modules: require('./modules.js'),
    db: {
        host: "127.0.0.1",
        port: 27017,
        db_name: "vxtest"
    },
    images: {
        breakpoints: [ 100,
            300,
            600,
            900,
            1350
        ]
    }
}