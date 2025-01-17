/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_RETRY_ATTEMPTS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 