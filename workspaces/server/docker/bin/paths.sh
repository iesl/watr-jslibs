#!/bin/bash

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

DROOT=$(dirname "$SCRIPTPATH/..")
CONFIG="$DROOT/config"
IMAGES="$DROOT/images"
COMPOSE="$DROOT/compose"
