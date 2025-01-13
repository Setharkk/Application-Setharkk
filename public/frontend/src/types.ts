import type { RouteRecordName } from 'vue-router'

export interface Action {
  id: string;
  label: string;
  icon?: string;
  handler?: () => void;
}

export interface Message {
  id: number;
  type: 'user' | 'assistant';
  sender: string;
  avatar: string;
  content: string;
  time: string;
  actions?: Action[];
}

export interface ModuleTitles {
  [key: string]: string;
  dashboard: string;
  seo: string;
  memory: string;
  analytics: string;
  reports: string;
  settings: string;
}

export interface Route {
  name: RouteRecordName;
  path: string;
  label: string;
  icon: string;
} 