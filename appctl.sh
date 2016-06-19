#!/bin/sh
DIR=`pwd`
NODE=`which node`
# get action
ACTION=$1

#START FILE NAME
START_FILE = $2

# help
usage() {
echo "Usage: ./appctl.sh {start|stop|restart}"
exit 1;
}
get_pid() {
if [ -f ./app.pid ]; then
echo `cat ./app.pid`
fi
}
# start app
start() {
pid=`get_pid`
if [ ! -z $pid ]; then
echo 'server is already running'
else
$NODE $DIR/$START_FILE 2>&1 &
echo 'server is running'
fi
}
# stop app
stop() {
pid=`get_pid`
if [ -z $pid ]; then
echo 'server not running'
else
echo "server is stopping ..."
kill -15 $pid
echo "server stopped !"
fi
}

restart() {
stop
sleep 0.5
echo =====
start
}
case "$ACTION" in
start)
start
;;
stop)
stop
;;
restart)
restart
;;
*)
usage
;;
esac