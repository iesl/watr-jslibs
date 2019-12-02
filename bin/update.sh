#!/bin/bash

showhelp() {
    echo "Usage: $SCRIPT: "
    echo "  todo  "
    exit 2
}

# default arg vals
install=

while getopts "ih" name; do
    case $name in
        i)    install=1;;
        h)    showhelp $0;;
        [?])  showhelp $0;;
    esac
done

root=$(pwd)

if [ -z "$install" ]; then
    ## ...
    lerna --concurrency 1 exec -- ncu --loglevel verbose
else
    lerna --concurrency 1 exec -- ncu --loglevel verbose -ui

fi
