import MarketingView from '@/views/Marketing/index.vue';

export default [
  {
    path: '/marketing',
    name: 'Marketing',
    component: MarketingView,
    meta: {
      requiresAuth: true,
      title: 'Marketing'
    },
    children: [
      {
        path: '',
        redirect: { name: 'MarketingAnalytics' }
      },
      {
        path: 'analytics',
        name: 'MarketingAnalytics',
        component: () => import('@/components/Marketing/MarketingAnalytics.vue'),
        meta: {
          title: 'Analyses Marketing'
        }
      },
      {
        path: 'campaigns',
        name: 'CampaignManager',
        component: () => import('@/components/Marketing/CampaignManager.vue'),
        meta: {
          title: 'Gestion des Campagnes'
        }
      },
      {
        path: 'campaigns/:id/analytics',
        name: 'CampaignAnalytics',
        component: () => import('@/views/Marketing/CampaignAnalytics.vue'),
        props: true,
        meta: {
          title: 'Analyses de Campagne'
        }
      },
      {
        path: 'automation',
        name: 'AutomationDashboard',
        component: () => import('@/components/Marketing/AutomationDashboard.vue'),
        meta: {
          title: 'Automatisation Marketing'
        }
      },
      {
        path: 'reports',
        name: 'ReportGenerator',
        component: () => import('@/components/Marketing/ReportGenerator.vue'),
        meta: {
          title: 'Générateur de Rapports'
        }
      }
    ]
  }
]; 