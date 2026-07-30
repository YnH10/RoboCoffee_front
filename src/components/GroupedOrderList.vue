<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const orders = ref([]);
let timer = null;

// 백엔드에서 전체 주문 목록을 가져오는 함수
const fetchOrders = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/orders');
    const data = await response.json();
    orders.value = data;
  } catch (error) {
    console.error('주문 목록 로드 실패:', error);
  }
};

// 메뉴 이름별로 총 수량을 자동 합산하는 computed 속성 (배달앱 취합용)
const groupedOrders = computed(() => {
  const map = {};
  orders.value.forEach(order => {
    const menu = order.menu;
    const qty = Number(order.quantity) || 1;
    if (!map[menu]) {
      map[menu] = 0;
    }
    map[menu] += qty;
  });
  return Object.entries(map).map(([menu, totalQuantity]) => ({ menu, totalQuantity }));
});

// 컴포넌트가 화면에 나타날 때 데이터 조회 및 3초마다 실시간 동기화 시작
onMounted(() => {
  fetchOrders();
  timer = setInterval(fetchOrders, 3000); 
});

// 컴포넌트가 사라질 때 타이머 해제
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 18px; color: #333;">📋 배달앱 주문 취합 리스트 (실시간 연동)</h3>
    
    <div v-if="groupedOrders.length === 0" style="color: #666; text-align: center; padding: 20px;">
      접수된 주문이 없습니다.
    </div>

    <table v-else style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
          <th style="padding: 10px; text-align: left; color: #495057;">메뉴명</th>
          <th style="padding: 10px; text-align: right; color: #495057;">총 주문 수량</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in groupedOrders" :key="index" style="border-bottom: 1px solid #dee2e6;">
          <td style="padding: 10px; color: #212529;">{{ item.menu }}</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; color: #007bff;">{{ item.totalQuantity }}잔</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>