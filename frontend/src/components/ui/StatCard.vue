<template>
  <v-card :color="color" dark>
    <v-card-text>
      <div class="d-flex align-center">
        <div class="stat-icon mr-4">
          <v-icon size="32">{{ icon }}</v-icon>
        </div>
        <div>
          <div class="text-subtitle-2">{{ title }}</div>
          <div class="text-h4">{{ value }}</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StatCard',

  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    color: {
      type: String,
      default: 'primary'
    },
    icon: {
      type: String,
      required: true
    }
  }
})
</script>

<style scoped>
.stat-icon {
  opacity: 0.8;
}
</style> 