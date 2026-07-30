<script setup>
import { ref } from 'vue';

const isOpen = ref(false);
const input = ref('');
const messages = ref([
  { sender: 'bot', text: '안녕하세요 로보커피입니다. 주문을 입력해 주세요. (예: 5반 아메리카노 1잔)' }
]);

const handleSend = async () => {
  if (!input.value.trim()) return;

  const userMessage = input.value;
  messages.value.push({ sender: 'user', text: userMessage });
  input.value = '';

  try {
    const response = await fetch('http://127.0.0.1:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: '웹사장님', text: userMessage })
    });
    const data = await response.json();

    messages.value.push({ sender: 'bot', text: data.reply });
  } catch (error) {
    messages.value.push({ sender: 'bot', text: '서버 통신 오류가 발생했습니다.' });
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
        width: 320px;
        height: 450px;
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
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <span>로보커피 주문 챗봇</span>
        <button
          @click="isOpen = false"
          style="background: none; border: none; color: #fff; cursor: pointer; font-size: 16px;"
        >
          X
        </button>
      </div>

      <div
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
      </div>

      <form
        @submit.prevent="handleSend"
        style="display: flex; border-top: 1px solid #ccc;"
      >
        <input
          type="text"
          v-model="input"
          placeholder="예: 5반 아메리카노 1잔"
          style="flex: 1; padding: 10px; border: none; outline: none; font-size: 14px;"
        />
        <button
          type="submit"
          style="background-color: #007bff; color: #fff; border: none; padding: 0 16px; cursor: pointer;"
        >
          전송
        </button>
      </form>
    </div>
  </div>
</template>