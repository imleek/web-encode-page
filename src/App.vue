<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NGlobalStyle } from 'naive-ui'
import { useTheme } from '@/composables/useTheme'
import Home from '@/views/Home.vue'

const { theme } = useTheme()
</script>

<template>
  <NConfigProvider :theme="theme">
    <NGlobalStyle />
    <NMessageProvider>
      <Home />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

body.dark {
  color-scheme: dark;
}
</style>
