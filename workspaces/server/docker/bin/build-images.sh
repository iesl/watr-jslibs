#!/bin/bash

SCRIPT=$(readlink -f "$0")
BIN=$(dirname "$SCRIPT")
. $BIN/paths.sh

DOCKER_BUILDKIT=1

docker build -t acs/rest-portal $IMAGES/rest-portal
