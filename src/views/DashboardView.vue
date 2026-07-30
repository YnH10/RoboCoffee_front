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
        <h2 class="title-medium mb-4">📋 배달앱 주문용 취합 리스트</h2>
        <ul class="grouped-list">
          <li v-for="(item, index) in groupedOrders" :key="index" class="grouped-item">
            <div class="item-info">
              <span class="menu-name">{{ item.menu }}</span>
              <span class="menu-option">{{ item.option }}</span>
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
        <h2 class="title-medium mb-4">👥 팀원 개별 주문 내역</h2>
        <ul class="user-list">
          <li v-for="(user, index) in userOrders" :key="index" class="user-item">
            <div class="user-avatar">{{ user.name.charAt(0) }}</div>
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-menu">{{ user.menu }} ({{ user.option }})</div>
            </div>
            <div class="user-price">{{ user.price.toLocaleString() }}원</div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 상태 관리
const isClosed = ref(false);

// 더미 데이터 (RAG & DB 연동 전 시각화용)
const groupedOrders = ref([
  { menu: '아이스 아메리카노', option: '기본', count: 5 },
  { menu: '아이스 아메리카노', option: '디카페인', count: 2 },
  { menu: '아이스 바닐라 라떼', option: '기본', count: 3 },
  { menu: '복숭아 아이스티', option: '샷 추가', count: 1 },
]);

const userOrders = ref([
  { name: '김싸피', menu: '아이스 아메리카노', option: '기본', price: 1500 },
  { name: '이광주', menu: '아이스 아메리카노', option: '디카페인', price: 2500 },
  { name: '박코딩', menu: '아이스 바닐라 라떼', option: '기본', price: 3000 },
  { name: '최프론', menu: '복숭아 아이스티', option: '샷 추가', price: 3500 },
]);

// 계산된 속성
const totalCount = computed(() => groupedOrders.value.reduce((acc, cur) => acc + cur.count, 0));
const totalPrice = computed(() => userOrders.value.reduce((acc, cur) => acc + cur.price, 0));

// 액션 핸들러
const handleCloseOrder = () => {
  if (confirm('주문을 마감하고 각 팀원에게 정산 DM을 발송하시겠습니까?')) {
    isClosed.value = true;
    alert('정산 요청 알림이 매터모스트로 발송되었습니다!');
  }
};

const handleArrival = () => {
  alert('채널에 배달 도착 알림을 쏘았습니다!');
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.status-badge {
  background-color: var(--ssafy-blue-light);
  color: var(--ssafy-blue);
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

/* Cards (Toss Style) */
.card {
  background-color: var(--toss-card-bg);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
}

/* Summary Section */
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
  color: var(--toss-text-main);
}
.info-value.price {
  color: var(--ssafy-blue);
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
}
.btn {
  flex: 1;
  padding: 18px 24px;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn:hover {
  transform: translateY(-2px);
}
.btn-primary {
  background-color: var(--compose-yellow);
  color: #000000;
}
.btn-primary:hover { background-color: var(--compose-yellow-hover); }

.btn-secondary {
  background-color: var(--ssafy-blue-light);
  color: var(--ssafy-blue);
}
.btn-secondary:hover { filter: brightness(0.95); }

/* Layout Grid */
.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* Lists */
ul { list-style: none; }
.grouped-item, .user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--toss-border);
}
.grouped-item:last-child, .user-item:last-child { border-bottom: none; }

.item-info { display: flex; flex-direction: column; gap: 4px; }
.menu-name { font-size: 17px; font-weight: 600; }
.menu-option { font-size: 14px; color: var(--toss-text-sub); }

.item-stats { display: flex; align-items: center; gap: 16px; }
.item-count { font-size: 18px; font-weight: 700; color: var(--ssafy-blue); }
.btn-check {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid var(--toss-border);
  background: white;
  cursor: pointer;
  color: var(--toss-text-sub);
}
.btn-check:hover { background: var(--toss-bg); }

/* User List Specific */
.user-avatar {
  width: 40px; height: 40px;
  background-color: var(--compose-yellow);
  border-radius: 50%;
  display: flex; justify-content: center; align-items: center;
  font-weight: 700; font-size: 15px;
}
.user-info { flex: 1; margin-left: 16px; }
.user-name { font-weight: 600; font-size: 16px; }
.user-menu { font-size: 14px; color: var(--toss-text-sub); margin-top: 2px; }
.user-price { font-weight: 700; font-size: 16px; }

/* 반응형 (모바일 사이즈 대응) */
@media (max-width: 768px) {
  .grid-layout { grid-template-columns: 1fr; }
  .summary-info { flex-direction: column; gap: 16px; }
  .action-buttons { flex-direction: column; }
}
</style>