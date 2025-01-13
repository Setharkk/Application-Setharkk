<template>
  <div class="app-layout">
    <AppHeader />
    <main class="main-content">
      <slot></slot>
    </main>
    <AppFooter />
    <Notifications />
  </div>
</template>

<script>
import AppHeader from './Header.vue';
import AppFooter from './Footer.vue';
import Notifications from '../common/Notifications.vue';

export default {
  name: 'AppLayout',
  components: {
    AppHeader,
    AppFooter,
    Notifications
  }
};
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  padding: 84px 20px 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .main-content {
    padding: 74px 10px 10px;
  }
}
</style> 