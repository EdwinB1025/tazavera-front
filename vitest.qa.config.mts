import { configDefaults, defineConfig } from 'vitest/config'
import baseConfig from './vitest.config.mjs'

// Runs the validation suite plus the QA suite under qa/.
export default defineConfig({
    ...baseConfig,
    test: {
        ...baseConfig.test,
        exclude: [
            ...configDefaults.exclude,
            'qa/src/features/offering-management/ui/OfferingActions.test.tsx',
        ],
    },
})
