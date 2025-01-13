interface Config {
  apiUrl: string
  wsUrl: string
  timeout: number
  retryAttempts: number
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  wsUrl: import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) ?? 5000,
  retryAttempts: Number(import.meta.env.VITE_RETRY_ATTEMPTS) ?? 3
}

export default config 