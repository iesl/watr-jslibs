#!/bin/sh

root=$(pwd)

echo watrmarks.js
cd packages/watrmarks.js && npm outdated
cd $root

echo shared
cd packages/shared && npm outdated
cd $root

echo vue-components
cd packages/vue-components && npm outdated
cd $root

echo client-app
cd packages/client-app && npm outdated
cd $root

npm outdated


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
