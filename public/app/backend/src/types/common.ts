// Types de base
export type UUID = string;
export type ISODateTime = string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject { [key: string]: JSONValue }
export type JSONArray = JSONValue[];

// Interfaces de réponse
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  code?: string;
  message?: string;
  data?: T;
  errors?: ValidationErrors;
  timestamp: ISODateTime;
}

export interface ValidationErrors {
  [field: string]: string[];
}

// Interfaces du Chat
export interface ChatMessage {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatContext {
  sessionId: string;
  messages: ChatMessage[];
  metadata: Record<string, any>;
  lastActivity: string;
}

// Interfaces de la Mémoire
export interface MemoryState {
  shortTerm: Map<number, any>;
  longTerm: Map<number, any>;
  context: Record<string, any>;
  patterns: Set<string>;
}

export interface Pattern {
  id: UUID;
  type: string;
  data: any;
  confidence: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// Interfaces des Modules
export interface Module {
  id: UUID;
  name: string;
  version: string;
  description?: string;
  status: ModuleStatus;
  actions: Set<string>;
  config: Record<string, any>;
  metadata?: Record<string, any>;
}

export type ModuleStatus = 'active' | 'inactive' | 'error' | 'loading';

export interface ModuleAction {
  moduleId: UUID;
  action: string;
  params?: Record<string, any>;
  timestamp: ISODateTime;
}

// Interfaces Système
export interface SystemCommand {
  command: string;
  params?: Record<string, any>;
  timestamp: ISODateTime;
}

export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'error';
  uptime: number;
  memory: {
    total: number;
    used: number;
    free: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  storage: {
    total: number;
    used: number;
    free: number;
  };
  services: Record<string, ServiceStatus>;
  lastUpdate: ISODateTime;
}

export interface ServiceStatus {
  status: 'running' | 'stopped' | 'error';
  lastCheck: ISODateTime;
  error?: string;
  metadata?: Record<string, any>;
}

// Interfaces de Diagnostic
export interface DiagnosticResult {
  id: UUID;
  type: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
  timestamp: ISODateTime;
}

// Interfaces d'Apprentissage
export interface LearningStatus {
  active: boolean;
  progress: number;
  currentTask?: string;
  patterns: {
    total: number;
    learned: number;
    pending: number;
  };
  lastUpdate: ISODateTime;
}

// Interfaces de Maintenance
export interface BackupMetadata {
  id: UUID;
  type: 'full' | 'partial';
  timestamp: ISODateTime;
  size: number;
  modules: string[];
  checksum: string;
  metadata?: Record<string, any>;
}

export interface OptimizationResult {
  success: boolean;
  improvements: {
    type: string;
    metric: string;
    before: number;
    after: number;
  }[];
  timestamp: ISODateTime;
}

// Interfaces de Documentation
export interface Documentation {
  version: string;
  lastUpdate: ISODateTime;
  sections: DocumentationSection[];
}

export interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  subsections?: DocumentationSection[];
  metadata?: Record<string, any>;
}

export interface TaskResult {
  success: boolean;
  error?: string;
  context?: Record<string, any>;
  state?: Record<string, any>;
} 