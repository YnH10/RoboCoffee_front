<!-- src/App.vue -->
<script setup>
import FloatingChat from './components/FloatingChat.vue';
</script>

<template>
  <!-- URL에 따라 해당하는 View 컴포넌트(DashboardView 등)를 렌더링해주는 역할 -->
  <router-view />

  <!-- 모든 페이지에서 공통으로 우측 하단에 고정될 플로팅 챗봇 -->
  <FloatingChat />
</template>

<style>
/* 전역 스타일은 main.css에서 관리하므로 여기는 비워둡니다. */
</style>