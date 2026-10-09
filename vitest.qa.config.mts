import { configDefaults, defineConfig } from 'vitest/config'
import baseConfig from './vitest.config.mjs'

// Runs the validation suite plus the QA suite under qa/.
export default defineConfig({
    ...baseConfig,
    test: {
        ...baseConfig.test,
        exclude: [
            ...configDefaults.exclude,
            // stale since fix-production-aut-findings (R42); see the merge report
            'qa/src/widgets/offering-list/lib/resolve-taxonomies.test.ts',
            // imports ThemeSelect, deleted by refine-header-aut (design.md D4b)
            'qa/src/widgets/app-header/ui/ThemeSelect.test.tsx',
            // superseded by the validation suite's row tests (refine-evaluation-flow D5); pending deletion
            'qa/src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx',
        ],
    },
})
