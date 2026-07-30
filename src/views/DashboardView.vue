<!-- src/views/DashboardView.vue -->
<template>
  <div class="dashboard-container">
    <!-- Header 영역 -->
    <header class="header">
      <div>
        <h1 class="title-large">Coffy Manager ☕</h1>
        <p class="text-sub mt-1">싸피 광주 16기 컴포즈커피 주문 현황</p>
      </div>
      <div class="status-badge" :class="{ 'is-closed': isClosed }">
        {{ isClosed ? '🔴 주문 마감' : '🟢 주문 접수 중' }}
      </div>
    </header>

    <!-- 요약 및 액션 카드 (Summary & Action) -->
    <section class="card summary-card">
      <div class="summary-info">
        <div class="info-item">
          <span class="text-sub">총 수량</span>
          <div class="info-value">{{ totalCount }}잔</div>
        </div>
        <div class="info-item">
          <span class="text-sub">예상 결제 금액</span>
          <div class="info-value price">{{ totalPrice.toLocaleString() }}원</div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn btn-primary" @click="handleCloseOrder">
          🔒 주문 마감 및 정산 요청
        </button>
        <button class="btn btn-secondary" @click="handleArrival">
          🛵 배달 도착 알림 쏘기
        </button>
      </div>
    </section>

    <div class="grid-layout">
      <!-- 취합 리스트 (배달앱 주문용) -->
      <section class="card">
        <h2 class="title-medium mb-4">📋 배달앱 주문용 취합 리스트 (실시간)</h2>
        <div v-if="groupedOrders.length === 0" class="empty-text">접수된 주문이 없습니다.</div>
        <ul v-else class="grouped-list">
          <li v-for="(item, index) in groupedOrders" :key="index" class="grouped-item">
            <div class="item-info">
              <span class="menu-name">{{ item.menu }}</span>
            </div>
            <div class="item-stats">
              <span class="item-count">{{ item.count }}잔</span>
              <button class="btn-check">✓</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- 개별 주문 내역 -->
      <section class="card">
        <h2 class="title-medium mb-4">👥 팀원 개별 주문 내역 (실시간)</h2>
        <div v-if="orders.length === 0" class="empty-text">주문 내역이 없습니다.</div>
        <ul v-else class="user-list">
          <li v-for="(user, index) in orders" :key="index" class="user-item">
            <div class="user-avatar">{{ user.user_name ? user.user_name.charAt(0) : '?' }}</div>
            <div class="user-info">
              <div class="user-name">{{ user.user_name }}</div>
              <div class="user-menu">{{ user.menu }} (수량: {{ user.quantity }}잔)</div>
            </div>
            <div class="user-price">{{ (user.quantity * 2000).toLocaleString() }}원</div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const isClosed = ref(false);
const orders = ref([]);
let timer = null;

// 백엔드 API에서 실시간 주문 목록 가져오기 (Vite Proxy 적용)
const fetchOrders = async () => {
  try {
    const response = await fetch('/api/orders');
    if (!response.ok) throw new Error('서버 응답 오류');
    const data = await response.json();
    orders.value = data;
  } catch (error) {
    console.error('주문 목록 조회 실패:', error);
  }
};

// 메뉴별 수량 자동 합산 (배달앱 취합용)
const groupedOrders = computed(() => {
  const map = {};
  orders.value.forEach(order => {
    const menu = order.menu;
    const qty = Number(order.quantity) || 1;
    if (!map[menu]) map[menu] = 0;
    map[menu] += qty;
  });
  return Object.entries(map).map(([menu, count]) => ({ menu, count }));
});

// 총 수량 및 총 가격 계산
const totalCount = computed(() => orders.value.reduce((acc, cur) => acc + (Number(cur.quantity) || 1), 0));
const totalPrice = computed(() => totalCount.value * 2000);

// 컴포넌트 마운트 시 3초마다 실시간 폴링 시작
onMounted(() => {
  fetchOrders();
  timer = setInterval(fetchOrders, 3000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// 주문 마감 및 정산 요청 버튼 기능 구현
const handleCloseOrder = async () => {
  if (confirm('주문을 마감하고 매터모스트로 정산 내용을 전송하시겠습니까?')) {
    try {
      const response = await fetch('/api/close-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      isClosed.value = true;
      alert(data.reply || '주문 마감 및 정산 내용이 매터모스트에 전송되었습니다.');
    } catch (error) {
      console.error('주문 마감 처리 실패:', error);
      alert('주문 마감 처리 중 오류가 발생했습니다.');
    }
  }
};

// 배달 도착 알림 쏘기 버튼 기능 구현
const handleArrival = async () => {
  try {
    const response = await fetch('/api/delivery-arrival', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    alert(data.reply || '배달 도착 알림이 매터모스트에 전송되었습니다.');
  } catch (error) {
    console.error('배달 도착 알림 전송 실패:', error);
    alert('알림 전송 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.status-badge {
  background-color: #E0F2FE;
  color: #0284C7;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
}
.status-badge.is-closed {
  background-color: #FEE2E2;
  color: #EF4444;
}
.mt-1 { margin-top: 4px; }
.mb-4 { margin-bottom: 20px; }
.card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 24px;
}
.summary-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.summary-info {
  display: flex;
  gap: 48px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-value {
  font-size: 36px;
  font-weight: 800;
  color: #111827;
}
.info-value.price {
  color: #2563EB;
}
.action-buttons {
  display: flex;
  gap: 12px;
}
.btn {
  flex: 1;
  padding: 18px 24px;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn:hover {
  transform: translateY(-2px);
}
.btn-primary {
  background-color: #FACC15;
  color: #000000;
}
.btn-primary:hover { background-color: #EAB308; }
.btn-secondary {
  background-color: #E0F2FE;
  color: #0284C7;
}
.btn-secondary:hover { filter: brightness(0.95); }
.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
ul { list-style: none; padding: 0; margin: 0; }
.grouped-item, .user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #F3F4F6;
}
.grouped-item:last-child, .user-item:last-child { border-bottom: none; }
.item-info { display: flex; flex-direction: column; gap: 4px; }
.menu-name { font-size: 17px; font-weight: 600; }
.item-stats { display: flex; align-items: center; gap: 16px; }
.item-count { font-size: 18px; font-weight: 700; color: #2563EB; }
.btn-check {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid #E5E7EB;
  background: white;
  cursor: pointer;
  color: #6B7280;
}
.btn-check:hover { background: #F9FAFB; }
.user-avatar {
  width: 40px; height: 40px;
  background-color: #FACC15;
  border-radius: 50%;
  display: flex; justify-content: center; align-items: center;
  font-weight: 700; font-size: 15px;
}
.user-info { flex: 1; margin-left: 16px; }
.user-name { font-weight: 600; font-size: 16px; }
.user-menu { font-size: 14px; color: #6B7280; margin-top: 2px; }
.user-price { font-weight: 700; font-size: 16px; }
.empty-text {
  text-align: center;
  color: #9CA3AF;
  padding: 20px 0;
}
@media (max-width: 768px) {
  .grid-layout { grid-template-columns: 1fr; }
  .summary-info { flex-direction: column; gap: 16px; }
  .action-buttons { flex-direction: column; }
}
</style>