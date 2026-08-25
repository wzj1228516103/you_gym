<script setup lang="ts">
import { computed, ref } from 'vue';
import { loginAdmin, registerAdmin } from './api';

const emit = defineEmits<{ authenticated: [token: string] }>();

const mode = ref<'login' | 'register'>('login');
const username = ref('');
const password = ref('');
const displayName = ref('');
const inviteCode = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const notice = ref('');
const isDevelopment = import.meta.env.DEV;

const canSubmit = computed(() => {
  if (username.value.trim().length < 3 || password.value.length < 12) return false;
  if (mode.value === 'login') return true;
  return Boolean(displayName.value.trim() && inviteCode.value.trim() && password.value === confirmPassword.value);
});

function switchMode(nextMode: 'login' | 'register') {
  mode.value = nextMode;
  error.value = '';
  notice.value = '';
  password.value = '';
  confirmPassword.value = '';
}

async function submit() {
  if (!canSubmit.value) return;
  loading.value = true;
  error.value = '';
  notice.value = '';
  try {
    if (mode.value === 'login') {
      const result = await loginAdmin(username.value.trim(), password.value);
      emit('authenticated', result.token);
      return;
    }
    await registerAdmin({
      username: username.value.trim(),
      displayName: displayName.value.trim(),
      password: password.value,
      inviteCode: inviteCode.value.trim(),
    });
    switchMode('login');
    notice.value = '账号创建成功，请使用新账号登录';
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '请求失败';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-brand">
      <div class="auth-brand-mark">YG</div>
      <p class="auth-product">YOU GYM</p>
      <h1>运营管理后台</h1>
      <p class="auth-description">训练内容、解剖数据、用户行为与系统权限统一管理。</p>
      <div class="auth-status"><span /> 本地开发环境</div>
    </section>

    <section class="auth-panel" aria-label="后台账号认证">
      <div class="auth-tabs" role="tablist">
        <button :class="['auth-tab', mode === 'login' && 'active']" type="button" @click="switchMode('login')">登录</button>
        <button :class="['auth-tab', mode === 'register' && 'active']" type="button" @click="switchMode('register')">注册</button>
      </div>

      <div class="auth-heading">
        <p class="eyebrow">{{ mode === 'login' ? 'WELCOME BACK' : 'INVITED ACCESS' }}</p>
        <h2>{{ mode === 'login' ? '登录管理后台' : '开通员工账号' }}</h2>
        <p>{{ mode === 'login' ? '使用管理员或员工账号继续' : '注册账号默认为普通员工，权限由超级管理员调整' }}</p>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <label v-if="mode === 'register'">
          <span>姓名</span>
          <input v-model="displayName" required maxlength="120" autocomplete="name" placeholder="输入员工姓名" />
        </label>
        <label>
          <span>用户名</span>
          <input v-model="username" required minlength="3" maxlength="80" pattern="[A-Za-z0-9._-]+" autocomplete="username" placeholder="输入用户名" />
        </label>
        <label>
          <span>密码</span>
          <input v-model="password" required minlength="12" maxlength="200" type="password" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" placeholder="至少 12 位" />
        </label>
        <label v-if="mode === 'register'">
          <span>确认密码</span>
          <input v-model="confirmPassword" required minlength="12" maxlength="200" type="password" autocomplete="new-password" placeholder="再次输入密码" />
        </label>
        <label v-if="mode === 'register'">
          <span>注册邀请码</span>
          <input v-model="inviteCode" required maxlength="200" type="password" autocomplete="one-time-code" placeholder="输入运营团队邀请码" />
        </label>

        <p v-if="error" class="auth-message error" role="alert">{{ error }}</p>
        <p v-if="notice" class="auth-message success" role="status">{{ notice }}</p>

        <button class="auth-submit" type="submit" :disabled="loading || !canSubmit">
          {{ loading ? '处理中...' : mode === 'login' ? '登录' : '创建普通员工账号' }}
        </button>
      </form>

      <button v-if="isDevelopment" class="auth-dev-entry" type="button" @click="emit('authenticated', 'local-admin')">使用本地超级管理员进入</button>
    </section>
  </main>
</template>
