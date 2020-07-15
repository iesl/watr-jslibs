#!/bin/bash

SCRIPT=$(readlink -f "$0")
BIN=$(dirname "$SCRIPT")

DROOT="$BIN/.."
CONFIG="$DROOT/config"
IMAGES="$DROOT/images"
COMPOSE="$DROOT/compose"
PRJ_ROOT=$(pwd)
