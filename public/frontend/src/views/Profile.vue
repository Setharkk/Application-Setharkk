<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <v-card>
          <v-card-title class="text-h5 font-weight-bold">
            Mon Profil
          </v-card-title>
          
          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="updateProfile">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.firstName"
                    label="Prénom"
                    :rules="nameRules"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.lastName"
                    label="Nom"
                    :rules="nameRules"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                  <v-text-field
                    v-model="profile.email"
                    label="Email"
                    :rules="emailRules"
                    required
                    disabled
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                  <v-text-field
                    v-model="profile.phone"
                    label="Téléphone"
                    :rules="phoneRules"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                  <v-textarea
                    v-model="profile.bio"
                    label="Bio"
                    rows="3"
                    :rules="bioRules"
                  ></v-textarea>
                </v-col>
              </v-row>
              
              <v-divider class="my-5"></v-divider>
              
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-4">Changer le mot de passe</h3>
                  
                  <v-text-field
                    v-model="passwords.current"
                    label="Mot de passe actuel"
                    type="password"
                    :rules="currentPasswordRules"
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="passwords.new"
                    label="Nouveau mot de passe"
                    type="password"
                    :rules="newPasswordRules"
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="passwords.confirm"
                    label="Confirmer le nouveau mot de passe"
                    type="password"
                    :rules="confirmPasswordRules"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!valid"
              @click="updateProfile"
            >
              Enregistrer les modifications
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { useStore } from 'vuex'
import type { VForm } from 'vuetify/components'

interface Profile {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
}

interface Passwords {
  current: string
  new: string
  confirm: string
}

export default defineComponent({
  name: 'Profile',
  
  setup() {
    const store = useStore()
    const form = ref<VForm | null>(null)
    const valid = ref(false)
    const loading = ref(false)
    
    const profile = reactive<Profile>({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: ''
    })
    
    const passwords = reactive<Passwords>({
      current: '',
      new: '',
      confirm: ''
    })
    
    // Règles de validation
    const nameRules = [
      (v: string) => !!v || 'Ce champ est requis',
      (v: string) => v.length >= 2 || 'Minimum 2 caractères'
    ]
    
    const emailRules = [
      (v: string) => !!v || 'L\'email est requis',
      (v: string) => /.+@.+\..+/.test(v) || 'L\'email doit être valide'
    ]
    
    const phoneRules = [
      (v: string) => !v || /^\+?[\d\s-]{10,}$/.test(v) || 'Le numéro de téléphone doit être valide'
    ]
    
    const bioRules = [
      (v: string) => !v || v.length <= 500 || 'La bio ne doit pas dépasser 500 caractères'
    ]
    
    const currentPasswordRules = [
      (v: string) => !v || v.length >= 8 || 'Le mot de passe doit contenir au moins 8 caractères'
    ]
    
    const newPasswordRules = [
      (v: string) => !v || v.length >= 8 || 'Le mot de passe doit contenir au moins 8 caractères',
      (v: string) => !v || /[A-Z]/.test(v) || 'Le mot de passe doit contenir au moins une majuscule',
      (v: string) => !v || /\d/.test(v) || 'Le mot de passe doit contenir au moins un chiffre'
    ]
    
    const confirmPasswordRules = [
      (v: string) => !v || v === passwords.new || 'Les mots de passe ne correspondent pas'
    ]
    
    // Méthodes
    const updateProfile = async () => {
      if (!form.value?.validate()) return
      
      loading.value = true
      try {
        const updateData: any = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          bio: profile.bio
        }
        
        if (passwords.new) {
          updateData.currentPassword = passwords.current
          updateData.newPassword = passwords.new
        }
        
        await store.dispatch('auth/updateProfile', updateData)
        store.dispatch('notifications/addNotification', {
          type: 'success',
          message: 'Profil mis à jour avec succès'
        })
        
        // Réinitialiser les mots de passe
        passwords.current = ''
        passwords.new = ''
        passwords.confirm = ''
      } catch (error: any) {
        store.dispatch('notifications/addNotification', {
          type: 'error',
          message: error.message || 'Erreur lors de la mise à jour du profil'
        })
      } finally {
        loading.value = false
      }
    }
    
    // Charger les données du profil
    const loadProfile = () => {
      const user = store.getters['auth/currentUser']
      if (user) {
        profile.firstName = user.firstName || ''
        profile.lastName = user.lastName || ''
        profile.email = user.email || ''
        profile.phone = user.phone || ''
        profile.bio = user.bio || ''
      }
    }
    
    // Charger les données au montage
    loadProfile()
    
    return {
      form,
      valid,
      loading,
      profile,
      passwords,
      nameRules,
      emailRules,
      phoneRules,
      bioRules,
      currentPasswordRules,
      newPasswordRules,
      confirmPasswordRules,
      updateProfile
    }
  }
})
</script> 