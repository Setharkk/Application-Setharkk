<template>
  <div class="loading-spinner" :class="{ overlay, [`size-${size}`]: true }">
    <div class="spinner" :style="{ borderTopColor: color }"></div>
    <div v-if="message" class="message" :style="{ color: textColor }">{{ message }}</div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: ''
    },
    overlay: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    color: {
      type: String,
      default: '#3498db'
    },
    textColor: {
      type: String,
      default: '#666'
    }
  }
};
</script>

<style lang="scss" scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;

  &.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 1000;
    backdrop-filter: blur(2px);
  }

  &.size-small .spinner {
    width: 24px;
    height: 24px;
    border-width: 2px;
  }

  &.size-medium .spinner {
    width: 40px;
    height: 40px;
    border-width: 3px;
  }

  &.size-large .spinner {
    width: 60px;
    height: 60px;
    border-width: 4px;
  }

  .spinner {
    border-style: solid;
    border-color: #f3f3f3;
    border-radius: 50%;
    animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .message {
    margin-top: 12px;
    font-size: 0.9em;
    text-align: center;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 
