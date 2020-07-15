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

    echo "docker builder build -t $tag -f $dockerfile ."
    docker builder build -t $tag -f $dockerfile .
    # docker builder build \
    #        --build-arg DOCKER=$DOCKER \
    #        --build-arg CONFIG=$CONFIG \
    #        --build-arg SHARED=$SHARED \
    #        -t $tag \
    #        $imaged
done
