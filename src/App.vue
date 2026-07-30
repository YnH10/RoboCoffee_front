<!-- src/App.vue -->
<template>
  <!-- URL에 따라 해당하는 View 컴포넌트(DashboardView 등)를 렌더링해주는 역할 -->
  <router-view />
</template>

<script setup>
// App.vue는 뼈대 역할만 하므로 특별한 로직이 필요 없습니다.
</script>

<style>
/* 전역 스타일은 main.css에서 관리하므로 여기는 비워둡니다. */
</style>