<script setup>
import { ref, nextTick } from 'vue';
import axios from 'axios';

const NODE_URL = import.meta.env.VITE_NODE_URL;
const isOpen = ref(false);
const input = ref('');
const isLoading = ref(false); // 👈 로딩 상태 추가
const chatContainer = ref(null); // 👈 스크롤 영역 참조 추가

const messages = ref([
  { sender: 'bot', text: '안녕하세요 로보커피입니다. 주문을 입력해 주세요. (예: 아이스티 1잔)' }
]);

// 채팅창을 최하단으로 스크롤하는 함수
const scrollToBottom = async () => {
  await nextTick(); // DOM 업데이트 완료 후 실행
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const handleSend = async () => {
  if (!input.value.trim() || isLoading.value) return;
  
  const userMessage = input.value;
  messages.value.push({ sender: 'user', text: userMessage });
  input.value = '';
  
  // 사용자 메시지 추가 후 스크롤 하단 이동
  scrollToBottom();

  // 로딩 시작
  isLoading.value = true;
  scrollToBottom(); // 로딩 말풍선 표시 후 스크롤 하단 이동

  try {
    // 8000번 Node.js 서버로 요청
    const res = await axios.post(`http://localhost:8000/api/chat/recommend`, {
      userId: 'user',
      preference: userMessage
    });

    if (res.data.success) {
      messages.value.push({ sender: 'bot', text: res.data.answer });
    } else {
      messages.value.push({ sender: 'bot', text: '답변을 가져오지 못했습니다.' });
    }
  } catch (error) {
    console.error('[Vue] Node 서버 통신 에러:', error);
    messages.value.push({ sender: 'bot', text: '서버 통신 오류가 발생했습니다.' });
  } finally {
    // 로딩 종료 및 스크롤 하단 이동
    isLoading.value = false;
    scrollToBottom();
  }
};

const handleCloseOrders = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/close-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    messages.value.push({ sender: 'bot', text: data.reply });
  } catch (error) {
    messages.value.push({ sender: 'bot', text: '주문 마감 처리 중 오류가 발생했습니다.' });
  } finally {
    scrollToBottom();
  }
};

const handleDeliveryArrival = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/delivery-arrival', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    messages.value.push({ sender: 'bot', text: data.reply });
  } catch (error) {
    messages.value.push({ sender: 'bot', text: '배달 도착 알림 전송 중 오류가 발생했습니다.' });
  } finally {
    scrollToBottom();
  }
};
</script>

<template>
  <div style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
    <button
      v-if="!isOpen"
      @click="isOpen = true"
      style="
        background-color: #333;
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        font-size: 16px;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      "
    >
      챗봇
    </button>

    <div
      v-if="isOpen"
      style="
        width: 350px;
        height: 480px;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      "
    >
      <div
        style="
          background-color: #333;
          color: #fff;
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <span style="font-size: 14px; font-weight: bold;">로보커피 주문 챗봇</span>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button
            @click="handleCloseOrders"
            style="background-color: #ffc107; border: none; color: #000; padding: 4px 6px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold;"
            title="주문 마감 및 매터모스트 정산 전송"
          >
            주문마감
          </button>
          <button
            @click="handleDeliveryArrival"
            style="background-color: #28a745; border: none; color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold;"
            title="매터모스트 배달 도착 알림 전송"
          >
            배달도착
          </button>
          <button
            @click="isOpen = false"
            style="background: none; border: none; color: #fff; cursor: pointer; font-size: 16px; margin-left: 4px;"
          >
            X
          </button>
        </div>
      </div>

      <!-- ref="chatContainer" 연결 -->
      <div
        ref="chatContainer"
        style="
          flex: 1;
          padding: 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        "
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :style="{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.sender === 'user' ? '#007bff' : '#f1f1f0',
            color: msg.sender === 'user' ? '#fff' : '#000',
            padding: '8px 12px',
            borderRadius: '6px',
            maxWidth: '80%',
            fontSize: '14px',
            whiteSpace: 'pre-wrap'
          }"
        >
          {{ msg.text }}
        </div>

        <!-- 답변 생성 중 로딩 표시 -->
        <div
          v-if="isLoading"
          style="
            align-self: flex-start;
            background-color: #f1f1f0;
            color: #666;
            padding: 8px 12px;
            border-radius: 6px;
            max-width: 80%;
            font-size: 14px;
            font-style: italic;
          "
        >
          답변 생성 중 입니다....
        </div>
      </div>

      <form
        @submit.prevent="handleSend"
        style="display: flex; border-top: 1px solid #ccc;"
      >
        <input
          type="text"
          v-model="input"
          :disabled="isLoading"
          placeholder="예: 아이스티 1잔"
          style="flex: 1; padding: 10px; border: none; outline: none; font-size: 14px;"
        />
        <button
          type="submit"
          :disabled="isLoading"
          :style="{
            backgroundColor: isLoading ? '#aaa' : '#007bff',
            color: '#fff',
            border: 'none',
            padding: '0 16px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }"
        >
          전송
        </button>
      </form>
    </div>
  </div>
</template>