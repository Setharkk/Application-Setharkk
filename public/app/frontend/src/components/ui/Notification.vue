<template>
  <v-snackbar
    v-model="isVisible"
    :color="props.type"
    :timeout="props.timeout"
  >
    {{ props.message }}
    <template v-slot:action="{ attrs }">
      <v-btn
        text
        v-bind="attrs"
        @click="isVisible = false"
      >
        Fermer
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref } from 'vue/dist/vue.esm-bundler'

interface NotificationProps {
  message: string
  type?: string
  timeout?: number
}

const props = defineProps<NotificationProps>()
const isVisible = ref(true)
</script> 