<template>
  <div class="settings">
    <h1>Paramètres</h1>
    <div class="settings-section">
      <h2>Préférences</h2>
      <div class="setting-item">
        <label>
          <input type="checkbox" v-model="settings.darkMode" />
          Mode sombre
        </label>
      </div>
      <div class="setting-item">
        <label>Langue :</label>
        <select v-model="settings.language">
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>
      <div class="setting-item">
        <label>
          <input type="checkbox" v-model="settings.notifications" />
          Activer les notifications
        </label>
      </div>
      <button @click="saveSettings">Sauvegarder</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

interface Settings {
  darkMode: boolean
  language: string
  notifications: boolean
}

export default defineComponent({
  name: 'Settings',
  setup() {
    const settings = ref<Settings>({
      darkMode: false,
      language: 'fr',
      notifications: true
    })

    const saveSettings = () => {
      // TODO: Implémenter la sauvegarde des paramètres
      console.log('Paramètres sauvegardés:', settings.value)
    }

    return {
      settings,
      saveSettings
    }
  }
})
</script>

<style scoped>
.settings {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.settings-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item label {
  display: block;
  margin-bottom: 5px;
}

.setting-item select {
  width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
}

button:hover {
  background-color: #45a049;
}
</style> 