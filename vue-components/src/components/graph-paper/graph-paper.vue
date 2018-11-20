<template lang="html" src="./filter-engine.html"    ></template>
<script   lang="ts"   src="./filter-engine.ts"        ></script>
<style    lang="less" src="./filter-engine.less" scoped></style>
const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"],
        include: path.resolve(__dirname, "../")
      }
    ]
  }
};
