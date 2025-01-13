<template>
  <button 
    :class="['btn', variant, size, { disabled }]" 
    :disabled="disabled"
    @click="handleClick"
    :type="type">
    <i v-if="icon" :class="['fas', `fa-${icon}`]"></i>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'success', 'danger', 'warning', 'info'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'button',
      validator: value => ['button', 'submit', 'reset'].includes(value)
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = (event) => {
      if (!props.disabled) {
        emit('click', event);
      }
    };

    return {
      handleClick
    };
  }
};
</script>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  i {
    font-size: 1em;
  }

  &.small {
    padding: 6px 12px;
    font-size: 0.875rem;
  }

  &.large {
    padding: 12px 24px;
    font-size: 1.125rem;
  }

  &.primary {
    background: #4CAF50;
    color: white;
    &:hover:not(.disabled) {
      background: darken(#4CAF50, 10%);
    }
  }

  &.secondary {
    background: #6c757d;
    color: white;
    &:hover:not(.disabled) {
      background: darken(#6c757d, 10%);
    }
  }

  &.success {
    background: #28a745;
    color: white;
    &:hover:not(.disabled) {
      background: darken(#28a745, 10%);
    }
  }

  &.danger {
    background: #dc3545;
    color: white;
    &:hover:not(.disabled) {
      background: darken(#dc3545, 10%);
    }
  }

  &.warning {
    background: #ffc107;
    color: #212529;
    &:hover:not(.disabled) {
      background: darken(#ffc107, 10%);
    }
  }

  &.info {
    background: #17a2b8;
    color: white;
    &:hover:not(.disabled) {
      background: darken(#17a2b8, 10%);
    }
  }

  &.disabled {
    opacity: 0.65;
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style> 