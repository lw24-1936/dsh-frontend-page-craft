<template>
  <div>
    <img src="/logo.png">
    <ul>
      <li v-for="item in items">{{ item.name }}</li>
      <li v-for="row in rows" v-if="row.visible">{{ row.name }}</li>
    </ul>
    <article v-html="rawHtml"></article>
    <a href="https://example.com" target="_blank">文档</a>
    <div @click="selectAll">全选</div>
    <iframe src="/frame"></iframe>
  </div>
</template>

<script setup lang="ts">
const rawHtml = '<b>x</b>'
const payload: any = {}
eval('1')
var total = 0
console.debug(total)
const apiKey = "abcdefghijklmnop1234"
debugger
</script>
