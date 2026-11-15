<template>
  <section>
    <img src="/hero.webp" alt="产品截图" />
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
    <button type="button" @click="selectAll">全选</button>
    <a href="https://example.com" target="_blank" rel="noopener noreferrer">文档</a>
  </section>
</template>

<script setup lang="ts">
const items = [{ id: 1, name: 'A' }]

function selectAll(): void {
  items.length = 0
}
</script>

<style scoped>
.action:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
