import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Test files that fail inside the vmThreads VM context (they redefine
// window.location, use crypto.subtle or load proxy.ts); they keep the
// default forks pool. Patterns match both the src/ and the qa/ copies.
const forksFiles = [
    'proxy.test.ts',
    '**/src/app/shell/AppShell.test.tsx',
    '**/src/features/auth/api/authorize.test.ts',
    '**/src/features/auth/model/session.test.ts',
    '**/src/pages/callback/ui/CallbackScreen.test.tsx',
    '**/src/pages/register/ui/RegisterClient.test.tsx',
    '**/src/shared/ui/SignedOutPrompt.test.tsx',
]

export default defineConfig({
    plugins: [react()],
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        environment: 'jsdom',
        // next-intl's ESM build imports `next/server` and `next/navigation`
        // without an extension, which Node cannot resolve from an external
        // module; inlined, Vite resolves them (adopt-next-intl-routing D2).
        server: { deps: { inline: ['next-intl', 'use-intl'] } },
        // The QA suite runs only with `npm run test:qa` (vitest.qa.config.mts).
        exclude: [...configDefaults.exclude, 'qa/**'],
        // vmThreads creates jsdom once per worker and keeps per-file isolation.
        projects: [
            {
                extends: true,
                test: { name: 'vm', pool: 'vmThreads', exclude: forksFiles },
            },
            {
                extends: true,
                test: { name: 'forks', include: forksFiles },
            },
        ],
    },
})
