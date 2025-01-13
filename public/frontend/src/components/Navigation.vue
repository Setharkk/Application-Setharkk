<template>
  <nav class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <!-- En-tête du menu -->
    <div class="sidebar-header">
      <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      <h2 v-if="!isCollapsed">Setharkk</h2>
      <button class="collapse-btn" @click="toggleCollapse">
        <i :class="isCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
      </button>
    </div>

    <!-- Menu principal -->
    <div class="menu">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path"
        class="menu-item"
        :class="{ active: currentRoute === item.path }"
      >
        <i :class="item.icon"></i>
        <span v-if="!isCollapsed">{{ item.name }}</span>
        <div v-if="item.badge" class="badge" :class="item.badge.type">
          {{ item.badge.value }}
        </div>
      </router-link>
    </div>

    <!-- Menu utilisateur -->
    <div class="user-section">
      <div class="user-info" v-if="!isCollapsed">
        <img :src="userAvatar" alt="Avatar" class="user-avatar" />
        <div class="user-details">
          <h3>{{ userName }}</h3>
          <p>{{ userRole }}</p>
        </div>
      </div>
      <div class="user-actions">
        <button class="action-btn" @click="openSettings">
          <i class="fas fa-cog"></i>
          <span v-if="!isCollapsed">Paramètres</span>
        </button>
        <button class="action-btn logout" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span v-if="!isCollapsed">Déconnexion</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// État
const isCollapsed = ref(false)
const route = useRoute()
const router = useRouter()

// Props avec valeurs par défaut
const userName = ref('John Doe')
const userRole = ref('Administrateur')
const userAvatar = ref('/avatars/default.png')

// Items du menu
const menuItems = [
  {
    name: 'Tableau de bord',
    path: '/',
    icon: 'fas fa-home'
  },
  {
    name: 'Analyses',
    path: '/analytics',
    icon: 'fas fa-chart-line',
    badge: { type: 'info', value: 'New' }
  },
  {
    name: 'Rapports',
    path: '/reports',
    icon: 'fas fa-file-alt'
  },
  {
    name: 'Marketing',
    path: '/marketing',
    icon: 'fas fa-bullhorn'
  },
  {
    name: 'Clients',
    path: '/customers',
    icon: 'fas fa-users'
  },
  {
    name: 'Messages',
    path: '/messages',
    icon: 'fas fa-envelope',
    badge: { type: 'warning', value: '5' }
  }
]

// Route active
const currentRoute = computed(() => route.path)

// Méthodes
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const openSettings = () => {
  router.push('/settings')
}

const handleLogout = async () => {
  // Logique de déconnexion
  try {
    // await store.dispatch('auth/logout')
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #1a1c23;
  color: #a0aec0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #2d3748;
}

.logo {
  width: 32px;
  height: 32px;
}

.collapse-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: #2d3748;
  color: #fff;
}

.menu {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #a0aec0;
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 1rem;
  position: relative;
}

.menu-item:hover {
  background: #2d3748;
  color: #fff;
}

.menu-item.active {
  background: #2d3748;
  color: #4299e1;
  border-left: 3px solid #4299e1;
}

.menu-item i {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.badge {
  position: absolute;
  right: 1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: bold;
}

.badge.info {
  background: #4299e1;
  color: white;
}

.badge.warning {
  background: #ed8936;
  color: white;
}

.user-section {
  padding: 1rem;
  border-top: 1px solid #2d3748;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details h3 {
  color: #fff;
  font-size: 0.875rem;
  margin: 0;
}

.user-details p {
  color: #a0aec0;
  font-size: 0.75rem;
  margin: 0;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  width: 100%;
}

.action-btn:hover {
  background: #2d3748;
  color: #fff;
}

.action-btn.logout {
  color: #fc8181;
}

.action-btn.logout:hover {
  background: #fc8181;
  color: #fff;
}
</style> 