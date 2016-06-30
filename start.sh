trap 'killall' INT

killall() {
    trap '' INT TERM
    kill -TERM 0
    wait
}

# npm install -g static
static -p 8080 frontend/dist &
gulp &
gulp extension &

cat #run forever