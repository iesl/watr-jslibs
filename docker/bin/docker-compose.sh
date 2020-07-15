#!/bin/sh

SCRIPT=$(readlink -f "$0")
BIN=$(dirname "$SCRIPT")
. $BIN/paths.sh

docker-compose \
    -f $COMPOSE/watr-front.yml \
    -f $COMPOSE/filebeat.yml \
    -f $COMPOSE/elk.yml \
    $@


