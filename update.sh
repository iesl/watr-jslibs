#!/bin/bash

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

# oneach "npm outdated"
oneach "npm install -D @types/jest@latest"
# oneach "npm update" "lerna bootstrap"



# echo watrmarks.js
# cd packages/watrmarks.js && npm outdated
# cd $root

# echo shared
# cd packages/shared && npm outdated
# cd $root

# echo vue-components
# cd packages/vue-components && npm outdated
# cd $root

# echo client-app
# cd packages/client-app && npm outdated
# cd $root

# npm outdated


# echo watrmarks.js
# cd packages/watrmarks.js && npm update
# cd $root
# lerna bootstrap

# echo shared
# cd packages/shared && npm update
# cd $root
# lerna bootstrap

# echo vue-components
# cd packages/vue-components && npm update
# cd $root
# lerna bootstrap

# echo client-app
# cd packages/client-app && npm update
# cd $root
# lerna bootstrap

# npm update
# lerna bootstrap
