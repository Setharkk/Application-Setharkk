import { Dashboard } from '../components/Dashboard';
import { RealtimeEditor } from '../components/RealtimeEditor/RealtimeEditor';
import { SeoAnalyzer } from '../components/SEO/SeoAnalyzer';
import { Chat } from '../components/Chat/Chat';

export const routes = [
  {
    path: '/',
    component: Dashboard,
    label: 'Tableau de bord',
    icon: 'home'
  },
  {
    path: '/editor',
    component: RealtimeEditor,
    label: 'Éditeur en temps réel',
    icon: 'edit'
  },
  {
    path: '/editor/:documentId',
    component: RealtimeEditor,
    hidden: true
  },
  {
    path: '/seo',
    component: SeoAnalyzer,
    label: 'Analyseur SEO',
    icon: 'search'
  },
  {
    path: '/chat',
    component: Chat,
    label: 'Assistant IA',
    icon: 'message'
  }
]; 