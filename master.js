var fork = require('child_process').fork;
var cpus = require('os').cpus();
var server = require('net').createServer();
server.listen(1337);

// Restart times
var limit = 10;
var during = 60000;
var restart = [];
var length = 0;
var isTooFrequently = function () {
    var time = Date.now();
    length = restart.push(time);
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

    var worker = fork(__dirname + '/worker.js');
    worker.on('message', function (message) {
        if (message.act === 'suicide') {
            createWorker();
        }
    });
    worker.on('exit', function () {
        console.log('Worker ' + worker.pid + ' exited.');
        delete workers[worker.pid];
        createWorker();
    });
    worker.send('server', server);
    workers[worker.pid] = worker;
    console.log('Create worker. pid: ' + worker.pid);
};
for (var i = 0; i < cpus.length; i++) {
    createWorker();
}
process.on('exit', function () {
    for (var pid in workers) {
        workers[pid].kill();
    }
});

