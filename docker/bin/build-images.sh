#!/bin/bash

SCRIPT=$(readlink -f "$0")
BIN=$(dirname "$SCRIPT")
. $BIN/paths.sh

DOCKER_BUILDKIT=1

docker --log-level debug builder build -t adamchandra/watr-front -f $IMAGES/watr-front/Dockerfile .
