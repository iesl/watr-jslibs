<template>
    <div>
        <span>
            <input>Filter</input>
            <button>Reset</button>
        </span>
        <div class="thinborder">
            <div>Query Term</div>
            <div>Hit: <span id="trace-menu-terms-hit"></span> </div>
            <div>Other: <span id="trace-menu-terms-other"></span> </div>
        </div>
        <div class="thinborder">
            <div>Trace Logs</div>
            <div>Hit: <span id="trace-menu-hits"></span> </div>
        </div>
    </div>
</template>

<script lang="ts" >
import { makeFilter } from './FilterWidget';

export default makeFilter;
</script>

<style scoped lang="less">
  @import "./FilterWidget";
</style>
