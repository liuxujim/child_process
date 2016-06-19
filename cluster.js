var fs = require('fs');
var path = require('path');

var cluster = require('cluster');
cluster.setupMaster({
    exec: "worker.js"
});
var cpus = require('os').cpus();

// Restart times
var limit = 10;
var during = 60000;
var restart = [];
var isTooFrequently = function () {
    var time = Date.now();
    var length = restart.push(time);
    if (length > limit) {
        restart = restart.slice(limit * -1);
    }
    return restart.length >= limit && restart[restart.length - 1] - restart[0] < during;
};


var workers = {};
var createWorker = function () {

    if (isTooFrequently()) {
        process.emit('giveup', length, during);
        return;
    }

    worker = cluster.fork();

    worker.on('message', function (message) {
        if (message.act === 'suicide') {
            createWorker();
        }
    });
    worker.on('exit', function () {
        console.log('Worker ' + worker.id + ' exited.');
        delete workers[worker.id];
        createWorker();
    });

    workers[worker.pid] = worker;
    console.log('Create worker. id: ' + worker.id);
};

for (var i = 0; i < cpus.length; i++) {
    createWorker();
}



//write the pid into file

var pidfile = path.join(__dirname, 'app.pid');
fs.writeFileSync(pidfile, process.pid);

process.on('SIGTERM', function () {
    if (fs.existsSync(pidfile)) {
        fs.unlinkSync(pidfile);
    }
    process.exit(0);
});
