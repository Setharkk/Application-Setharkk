<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">
        <router-link to="/">
          <img src="/logo.png" alt="Logo" />
          <span>Application Setharkk</span>
        </router-link>
      </div>

      <nav class="main-nav">
        <router-link to="/" class="nav-link" active-class="active">
          <i class="fas fa-home"></i>
          Accueil
        </router-link>
        <router-link to="/analysis" class="nav-link" active-class="active">
          <i class="fas fa-chart-line"></i>
          Analyse
        </router-link>
        <router-link to="/editor" class="nav-link" active-class="active">
          <i class="fas fa-edit"></i>
          Éditeur
        </router-link>
        <router-link to="/seo" class="nav-link" active-class="active">
          <i class="fas fa-search"></i>
          SEO
        </router-link>
      </nav>

      <div class="user-menu">
        <button class="notifications-btn" @click="toggleNotifications">
          <i class="fas fa-bell"></i>
          <span v-if="unreadNotifications" class="notification-badge">
            {{ unreadNotifications }}
          </span>
        </button>
        <div class="user-profile" @click="toggleUserMenu">
          <img :src="userAvatar" :alt="userName" />
          <span>{{ userName }}</span>
          <i class="fas fa-chevron-down"></i>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'AppHeader',
  setup() {
    const store = useStore();
    const router = useRouter();
    const showUserMenu = ref(false);

    const userName = computed(() => store.state.auth.user?.name || 'Utilisateur');
    const userAvatar = computed(() => store.state.auth.user?.avatar || '/default-avatar.png');
    const unreadNotifications = computed(() => store.state.notifications.unreadCount);

    const toggleNotifications = () => {
      store.dispatch('notifications/togglePanel');
    };

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value;
    };

    const logout = async () => {
      await store.dispatch('auth/logout');
      router.push('/login');
    };

    return {
      userName,
      userAvatar,
      unreadNotifications,
      toggleNotifications,
      toggleUserMenu,
      logout
    };
  }
};
</script>

<style lang="scss" scoped>
.app-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    a {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #2c3e50;
      font-weight: 600;
      font-size: 1.2em;

      img {
        height: 32px;
        width: auto;
      }
    }
  }

  .main-nav {
    display: flex;
    gap: 20px;

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: #64748b;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.3s ease;

      i {
        font-size: 1.1em;
      }

      &:hover {
        color: #2c3e50;
        background: #f1f5f9;
      }

      &.active {
        color: #3b82f6;
        background: #eff6ff;
      }
    }
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 16px;

    .notifications-btn {
      position: relative;
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: #64748b;
      transition: color 0.3s ease;

      &:hover {
        color: #2c3e50;
      }

      .notification-badge {
        position: absolute;
        top: 0;
        right: 0;
        background: #ef4444;
        color: white;
        font-size: 0.75em;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
      }
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s ease;

      &:hover {
        background: #f1f5f9;
      }

      img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }

      span {
        color: #2c3e50;
        font-weight: 500;
      }

      i {
        color: #64748b;
        font-size: 0.8em;
      }
    }
  }
}

@media (max-width: 768px) {
  .app-header {
    .container {
      padding: 0 10px;
    }

    .logo span {
      display: none;
    }

    .main-nav {
      .nav-link span {
        display: none;
      }
    }

    .user-menu {
      .user-profile span {
        display: none;
      }
    }
  }
}
</style> 