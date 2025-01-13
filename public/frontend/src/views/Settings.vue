<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Paramètres</v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <v-form ref="form" v-model="isValid" @submit.prevent="saveSettings">
              <!-- Section Notifications -->
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-4">Notifications</h3>
                  <v-switch
                    v-model="localSettings.emailNotifications"
                    label="Recevoir les notifications par email"
                    color="primary"
                    hide-details
                    class="mb-4"
                  />
                  <v-switch
                    v-model="localSettings.marketingEmails"
                    label="Recevoir les emails marketing"
                    color="primary"
                    hide-details
                    class="mb-4"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <!-- Section Langue et Région -->
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-4">Langue et Région</h3>
                  <v-select
                    v-model="localSettings.language"
                    :items="languages"
                    label="Langue"
                    item-title="name"
                    item-value="code"
                    class="mb-4"
                  />
                  <v-select
                    v-model="localSettings.timezone"
                    :items="timezones"
                    label="Fuseau horaire"
                    class="mb-4"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <!-- Section Apparence -->
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-4">Apparence</h3>
                  <v-switch
                    v-model="localSettings.theme.dark"
                    label="Thème sombre"
                    color="primary"
                    hide-details
                    class="mb-4"
                    @change="toggleTheme"
                  />
                  <v-select
                    v-model="localSettings.defaultView"
                    :items="views"
                    label="Vue par défaut"
                    item-title="name"
                    item-value="value"
                    class="mb-4"
                  >
                    <template v-slot:prepend-item="{ item }">
                      <v-icon :icon="item.raw.icon" class="mr-2" />
                    </template>
                  </v-select>
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <!-- Section Sécurité -->
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-4">Sécurité</h3>
                  <v-switch
                    v-model="localSettings.sessionTimeout"
                    label="Déconnexion automatique après inactivité"
                    color="primary"
                    hide-details
                    class="mb-4"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <!-- Section Sauvegardes -->
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-4">Configuration des sauvegardes</h3>
                  
                  <v-switch
                    v-model="localSettings.backups.enabled"
                    label="Activer les sauvegardes automatiques"
                    color="primary"
                    hide-details
                    class="mb-4"
                  />

                  <v-select
                    v-model="localSettings.backups.frequency"
                    :items="backupFrequencies"
                    label="Fréquence des sauvegardes"
                    :disabled="!localSettings.backups.enabled"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="localSettings.backups.retentionDays"
                    type="number"
                    label="Nombre de jours de rétention"
                    :rules="[v => v > 0 || 'La rétention doit être supérieure à 0']"
                    :disabled="!localSettings.backups.enabled"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="localSettings.backups.path"
                    label="Chemin de sauvegarde"
                    :disabled="!localSettings.backups.enabled"
                    class="mb-4"
                  />

                  <v-btn
                    color="primary"
                    prepend-icon="mdi-backup-restore"
                    :loading="backupLoading"
                    :disabled="backupLoading"
                    @click="backupNow"
                    class="mb-4"
                  >
                    Sauvegarder maintenant
                  </v-btn>

                  <div v-if="lastBackup" class="text-caption">
                    Dernière sauvegarde : {{ formatDate(lastBackup) }}
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <!-- Historique des sauvegardes -->
              <v-row>
                <v-col cols="12">
                  <backup-history />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!isValid || loading"
              @click="saveSettings"
            >
              Enregistrer les modifications
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog 2FA -->
    <v-dialog v-model="showTwoFactorDialog" max-width="500" persistent>
      <v-card>
        <v-card-title>Configuration de l'authentification à deux facteurs</v-card-title>
        <v-card-text>
          <div v-if="qrCode" class="text-center my-4">
            <img :src="qrCode" alt="QR Code" class="qr-code" />
            <p class="mt-2">Scannez ce QR code avec votre application d'authentification</p>
          </div>
          
          <v-text-field
            v-model="verificationCode"
            label="Code de vérification"
            type="number"
            :rules="verificationCodeRules"
            maxlength="6"
            class="mt-4"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="cancelTwoFactor" :disabled="verifying">
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :loading="verifying"
            :disabled="!verificationCode || verifying"
            @click="verifyTwoFactor"
          >
            Vérifier
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import type { VForm } from 'vuetify/components'
import type { Settings, Language, View } from '@/types/settings'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import BackupHistory from '@/components/backup/BackupHistory.vue'

export default defineComponent({
  name: 'Settings',

  setup() {
    const store = useStore()
    const form = ref<VForm | null>(null)
    const isValid = ref(true)
    const loading = ref(false)
    const showTwoFactorDialog = ref(false)
    const verifying = ref(false)
    const qrCode = ref('')
    const verificationCode = ref('')

    // Données locales
    const localSettings = reactive<Settings>({
      emailNotifications: true,
      marketingEmails: false,
      language: 'fr',
      timezone: 'Europe/Paris',
      defaultView: 'dashboard',
      sessionTimeout: true,
      theme: {
        dark: false,
        customColors: false
      },
      backups: {
        enabled: false,
        frequency: 'daily',
        retentionDays: 30,
        path: 'C:/backups/setharkk'
      }
    })

    // Options des sélecteurs
    const languages: Language[] = [
      { name: 'Français', code: 'fr' },
      { name: 'English', code: 'en' }
    ]

    const timezones = [
      'Europe/Paris',
      'Europe/London',
      'America/New_York',
      'Asia/Tokyo'
    ]

    const views: View[] = [
      { name: 'Tableau de bord', value: 'dashboard', icon: 'mdi-view-dashboard' },
      { name: 'Éditeur', value: 'editor', icon: 'mdi-pencil' },
      { name: 'SEO', value: 'seo', icon: 'mdi-magnify' },
      { name: 'Mots-clés', value: 'keywords', icon: 'mdi-tag-multiple' }
    ]

    const backupFrequencies = [
      { title: 'Toutes les heures', value: 'hourly' },
      { title: 'Tous les jours', value: 'daily' },
      { title: 'Toutes les semaines', value: 'weekly' },
      { title: 'Tous les mois', value: 'monthly' }
    ]

    const backupLoading = ref(false)
    const lastBackup = ref(null)

    // Règles de validation
    const verificationCodeRules = [
      (v: string) => !!v || 'Le code est requis',
      (v: string) => /^\d{6}$/.test(v) || 'Le code doit contenir 6 chiffres'
    ]

    // Méthodes
    const loadSettings = async () => {
      loading.value = true
      try {
        const settings = await store.dispatch('settings/fetchSettings')
        Object.assign(localSettings, settings)
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
      } finally {
        loading.value = false
      }
    }

    const saveSettings = async () => {
      if (!form.value?.validate()) return

      loading.value = true
      try {
        await store.dispatch('settings/updateSettings', localSettings)
        store.dispatch('notifications/addNotification', {
          type: 'success',
          message: 'Paramètres enregistrés avec succès'
        })
      } catch (error: any) {
        store.dispatch('notifications/addNotification', {
          type: 'error',
          message: error.message || 'Erreur lors de l\'enregistrement des paramètres'
        })
      } finally {
        loading.value = false
      }
    }

    const toggleTheme = (value: boolean) => {
      store.commit('theme/setDark', value)
    }

    const handleTwoFactorChange = async (value: boolean) => {
      if (value) {
        try {
          const response = await store.dispatch('settings/generateTwoFactorSecret')
          qrCode.value = response.qrCode
          showTwoFactorDialog.value = true
        } catch (error: any) {
          localSettings.twoFactorAuth = false
          store.dispatch('notifications/addNotification', {
            type: 'error',
            message: error.message || 'Erreur lors de la génération du code QR'
          })
        }
      } else {
        try {
          await store.dispatch('settings/disableTwoFactor')
          store.dispatch('notifications/addNotification', {
            type: 'success',
            message: 'Authentification à deux facteurs désactivée'
          })
        } catch (error: any) {
          localSettings.twoFactorAuth = true
          store.dispatch('notifications/addNotification', {
            type: 'error',
            message: error.message || 'Erreur lors de la désactivation de l\'authentification à deux facteurs'
          })
        }
      }
    }

    const verifyTwoFactor = async () => {
      if (!verificationCode.value) return

      verifying.value = true
      try {
        await store.dispatch('settings/verifyTwoFactor', verificationCode.value)
        showTwoFactorDialog.value = false
        store.dispatch('notifications/addNotification', {
          type: 'success',
          message: 'Authentification à deux facteurs activée avec succès'
        })
      } catch (error: any) {
        localSettings.twoFactorAuth = false
        store.dispatch('notifications/addNotification', {
          type: 'error',
          message: error.message || 'Code de vérification invalide'
        })
      } finally {
        verifying.value = false
        verificationCode.value = ''
      }
    }

    const cancelTwoFactor = () => {
      localSettings.twoFactorAuth = false
      showTwoFactorDialog.value = false
      verificationCode.value = ''
    }

    const backupNow = async () => {
      backupLoading.value = true
      try {
        await store.dispatch('admin/backupDatabase')
        lastBackup.value = new Date()
        store.dispatch('notifications/addNotification', {
          type: 'success',
          message: 'Sauvegarde effectuée avec succès'
        })
      } catch (error: any) {
        store.dispatch('notifications/addNotification', {
          type: 'error',
          message: error.message || 'Erreur lors de la sauvegarde'
        })
      } finally {
        backupLoading.value = false
      }
    }

    // Chargement initial
    onMounted(() => {
      loadSettings()
    })

    return {
      form,
      isValid,
      loading,
      localSettings,
      languages,
      timezones,
      views,
      showTwoFactorDialog,
      verifying,
      qrCode,
      verificationCode,
      verificationCodeRules,
      saveSettings,
      toggleTheme,
      handleTwoFactorChange,
      verifyTwoFactor,
      cancelTwoFactor,
      backupFrequencies,
      backupLoading,
      lastBackup,
      backupNow
    }
  }
})
</script>

<style lang="scss" scoped>
.qr-code {
  max-width: 200px;
  height: auto;
}

.v-card-text {
  .v-row {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
}

.v-divider {
  opacity: 0.12;
}

.text-h6 {
  color: var(--v-primary-base);
  font-weight: 500;
}
</style> 