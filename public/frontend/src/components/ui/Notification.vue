<template>
  <v-snackbar
    v-model="show"
    :color="notification.type"
    :timeout="notification.timeout"
    :location="location"
    class="notification"
  >
    <div class="d-flex align-center">
      <v-icon
        :icon="getIcon"
        class="mr-2"
      />
      {{ notification.message }}
    </div>

    <template v-if="notification.dismissible" v-slot:actions>
      <v-btn
        icon="mdi-close"
        variant="text"
        @click="dismiss"
      />
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import type { PropType } from 'vue'
import type { Notification } from '@/types/notifications'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'Notification',

  props: {
    notification: {
      type: Object as PropType<Notification>,
      required: true
    },
    location: {
      type: String,
      default: 'top'
    }
  },

  setup(props) {
    const store = useStore()
    const show = ref(true)

    const getIcon = computed(() => {
      switch (props.notification.type) {
        case 'success':
          return 'mdi-check-circle'
        case 'error':
          return 'mdi-alert-circle'
        case 'warning':
          return 'mdi-alert'
        case 'info':
          return 'mdi-information'
        default:
          return 'mdi-bell'
      }
    })

    const dismiss = () => {
      show.value = false
      store.dispatch('notifications/removeNotification', props.notification.id)
    }

    return {
      show,
      getIcon,
      dismiss
    }
  }
})
</script>

<style scoped>
.notification {
  margin-bottom: 8px;
}
</style> 