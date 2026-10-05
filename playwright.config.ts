import { defineConfig, devices } from '@playwright/test'

const PORT = 3200

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    channel: process.env.PW_CHANNEL || undefined, // localmente: PW_CHANNEL=chrome (sem baixar o Chromium)
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
      testIgnore: /mobile\.spec\.ts/,
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    // NEXT_PUBLIC_* é lido no build: o env precisa estar no mesmo comando
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/dashboard`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { NEXT_PUBLIC_APP_MODE: 'demo', AI_PROVIDER: 'groq', GROQ_API_KEY: 'e2e-sem-chave-real' },
  },
})
