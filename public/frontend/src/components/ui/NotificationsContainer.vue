<template>
  <div class="notifications-container">
    <TransitionGroup name="notification">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
      />
    </TransitionGroup>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import Notification from './Notification.vue'

export default defineComponent({
  name: 'NotificationsContainer',

  components: {
    Notification
  },

  setup() {
    const store = useStore()
    const notifications = computed(() => store.getters['notifications/notifications'])

    return {
      notifications
    }
  }
})
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 