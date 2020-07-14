#!/bin/sh

SCRIPT=$(readlink -f "$0")
BIN=$(dirname "$SCRIPT")
. $BIN/paths.sh

docker-compose \
    -f $COMPOSE/docker-compose.yml \
    $@


