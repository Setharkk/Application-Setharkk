<template>
  <div class="toast-container">
    <v-slide-y-transition group>
      <v-alert
        v-for="toast in toasts"
        :key="toast.id"
        :type="toast.type"
        :value="true"
        class="toast-alert ma-2"
        dismissible
        @click="removeToast(toast.id)"
      >
        {{ toast.message }}
      </v-alert>
    </v-slide-y-transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useToast } from '@/composables/useToast'

export default defineComponent({
  name: 'Toast',

  setup() {
    const { toasts, removeToast } = useToast()

    return {
      toasts,
      removeToast
    }
  }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.toast-alert {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 