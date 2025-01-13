<template>
  <div class="notifications">
    <TransitionGroup name="notification">
      <div 
        v-for="notification in allNotifications" 
        :key="notification.id"
        :class="['notification', notification.type]"
        @click="dismissNotification(notification.id)"
      >
        <div class="notification-content">
          <i :class="['fas', getIcon(notification.type)]"></i>
          <div class="message">{{ notification.message }}</div>
        </div>
        <div class="progress-bar" :style="{ animationDuration: `${notification.duration}ms` }"></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'Notifications',
  setup() {
    const store = useStore();
    
    const allNotifications = computed(() => [
      ...store.state.notifications.errors.map(error => ({
        ...error,
        type: 'error'
      })),
      ...store.state.notifications.items.map(notif => ({
        ...notif,
        type: notif.type || 'info'
      }))
    ].sort((a, b) => b.timestamp - a.timestamp));

    const getIcon = (type) => {
      switch (type) {
        case 'error': return 'fa-exclamation-circle';
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
      }
    };

    const dismissNotification = (id) => {
      store.dispatch('notifications/dismiss', id);
    };

    onMounted(() => {
      // Auto-dismiss notifications after their duration
      allNotifications.value.forEach(notification => {
        if (notification.duration) {
          setTimeout(() => {
            dismissNotification(notification.id);
          }, notification.duration);
        }
      });
    });

    return {
      allNotifications,
      getIcon,
      dismissNotification
    };
  }
};
</script>

<style lang="scss" scoped>
.notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.notification {
  padding: 12px;
  border-radius: 6px;
  background: white;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  .notification-content {
    display: flex;
    align-items: center;
    gap: 10px;

    i {
      font-size: 1.2em;
    }

    .message {
      flex: 1;
      font-size: 0.95em;
      line-height: 1.4;
    }
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    transform-origin: left;
    animation: progress linear forwards;
  }

  &.error {
    background: #fee2e2;
    color: #991b1b;
    .progress-bar {
      background: #ef4444;
    }
  }

  &.success {
    background: #dcfce7;
    color: #166534;
    .progress-bar {
      background: #22c55e;
    }
  }

  &.warning {
    background: #fef3c7;
    color: #92400e;
    .progress-bar {
      background: #f59e0b;
    }
  }

  &.info {
    background: #dbeafe;
    color: #1e40af;
    .progress-bar {
      background: #3b82f6;
    }
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style> 