import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        environment: 'jsdom',
        // The QA suite runs only with `npm run test:qa` (vitest.qa.config.mts).
        exclude: [...configDefaults.exclude, 'qa/**'],
    },
})
