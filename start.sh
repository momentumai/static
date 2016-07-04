#!/usr/bin/env bash
trap 'killall' INT

killall() {
    trap '' INT TERM
    kill -TERM 0
    wait
}

# npm install -g static-server
static-server -p 8080 frontend/dist &
gulp &
# gulp extension &

cat #run forever