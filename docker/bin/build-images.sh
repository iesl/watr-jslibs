#!/bin/bash

SCRIPT=$(readlink -f "$0")
BIN=$(dirname "$SCRIPT")
. $BIN/paths.sh

DOCKER_BUILDKIT=1
for imaged in $IMAGES/*
do
    base=$(basename $imaged)
    tag="adamchandra/$base"
    dockerfile="$imaged/Dockerfile"

    # docker builder build -t $tag -f $dockerfile .
    docker builder build -t $tag $dockerfile
done
