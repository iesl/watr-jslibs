<script lang="ts" src="./login.ts" />

<style lang="less" scoped>
</style>

<template lang="html">

  <div>
    <nav>
      
      <ul>
        <li v-if="!isAuthenticated">
          <a href="#" @click.prevent="login">Login</a>
        </li>
        <li v-if="isAuthenticated">
          <a href="#" @click.prevent="logout">Log out</a>
        </li>
      </ul>
    </nav>
    
  </div>

</template>
