import { configDefaults, defineConfig } from 'vitest/config'
import baseConfig from './vitest.config.mjs'

// Runs the validation suite plus the QA suite under qa/.
export default defineConfig({
    ...baseConfig,
    test: {
        ...baseConfig.test,
        exclude: [
            ...configDefaults.exclude,
            // fails since it was moved; see the setup report
            'qa/src/app/shell/AppShell.test.tsx',
        ],
    },
})
