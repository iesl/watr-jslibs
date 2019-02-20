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

PROJECTS=(
    'watrmarks.js'
    'shared'
    'vue-components'
    'client-app'
    '.'
)

oneach() {
    op1=$1;
    op2=$2;

    for proj in "${PROJECTS[@]}"
    do
        echo ">> $proj"
        cd "packages/$proj"
        if [[ ! -z "$op1" ]]; then
            echo "running $op1"
            eval $op1
        else
            echo "no op1 specified "
        fi

        cd $root

        if [[ ! -z "$op2" ]]; then
            echo "running $op2"
            eval $op2
        else
            echo "no op2 specified "
        fi

        echo -e "\n\n"
    done
}

if [ -z "$install" ]; then
    ## ...
    oneach "npm outdated"
else
    oneach "npm update" "lerna bootstrap"

fi

# oneach "npm install -D ts-jest@latest"
# oneach "npm install -D ts-node@latest"
# oneach "npm install -D tippy.js@latest"
# oneach "npm update" "lerna bootstrap"
