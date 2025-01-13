<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Application Setharkk</h3>
          <p>Une solution complète pour l'analyse et l'optimisation de votre contenu.</p>
        </div>

        <div class="footer-section">
          <h4>Navigation</h4>
          <nav>
            <router-link to="/">Accueil</router-link>
            <router-link to="/analysis">Analyse</router-link>
            <router-link to="/editor">Éditeur</router-link>
            <router-link to="/seo">SEO</router-link>
          </nav>
        </div>

        <div class="footer-section">
          <h4>Contact</h4>
          <div class="contact-info">
            <a href="mailto:contact@setharkk.com">
              <i class="fas fa-envelope"></i>
              contact@setharkk.com
            </a>
            <a href="tel:+33123456789">
              <i class="fas fa-phone"></i>
              +33 1 23 45 67 89
            </a>
          </div>
        </div>

        <div class="footer-section">
          <h4>Suivez-nous</h4>
          <div class="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-linkedin"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Application Setharkk. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  setup() {
    const currentYear = new Date().getFullYear();
    return { currentYear };
  }
};
</script>

<style lang="scss" scoped>
.app-footer {
  background: #1e293b;
  color: #f8fafc;
  padding: 60px 0 20px;
  margin-top: auto;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-section {
    h3 {
      font-size: 1.5em;
      margin-bottom: 15px;
      color: #f8fafc;
    }

    h4 {
      font-size: 1.1em;
      margin-bottom: 15px;
      color: #e2e8f0;
    }

    p {
      color: #cbd5e1;
      line-height: 1.6;
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 10px;

      a {
        color: #cbd5e1;
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: #f8fafc;
        }
      }
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 10px;

      a {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #cbd5e1;
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: #f8fafc;
        }

        i {
          font-size: 1.1em;
        }
      }
    }

    .social-links {
      display: flex;
      gap: 15px;

      a {
        color: #cbd5e1;
        font-size: 1.5em;
        transition: color 0.3s ease;

        &:hover {
          color: #f8fafc;
        }
      }
    }
  }

  .footer-bottom {
    padding-top: 20px;
    border-top: 1px solid #334155;
    text-align: center;
    color: #94a3b8;
    font-size: 0.9em;
  }
}

@media (max-width: 768px) {
  .app-footer {
    padding: 40px 0 20px;

    .footer-content {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .footer-section {
      text-align: center;

      .contact-info a,
      .social-links {
        justify-content: center;
      }
    }
  }
}
</style> 