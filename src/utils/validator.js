import { RootSchema, ScenarioSchema } from '../schemas/model.js';

/**
 * Validates a single scenario object against the Zod schema.
 * Returns { isValid, errors, warnings, data }
 * 
 * Note: Zod handles errors, but "warnings" (domain specific logic that isn't strictly invalid)
 * might still need manual checks if not expressible in Zod.
 */
export const validateScenario = (scenario) => {
    const result = ScenarioSchema.safeParse(scenario);

    if (!result.success) {
        // Format Zod errors
        const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return {
            isValid: false,
            errors,
            warnings: [],
            data: null
        };
    }

    // Custom Domain Logic Warnings (that Zod accepts but might be "weird")
    const warnings = [];
    const s = result.data;

    // 3. Goal-Seeking Check (Ported from original)
    if (s.phase_3_ffn?.activations) {
        s.phase_3_ffn.activations.forEach(cat => {
            if (cat.linked_head === undefined) {
                // This is allowed by schema (optional), but might be a warning in logic
                // warnings.push(`Phase 3: "${cat.id}" is missing linked_head`);
            }
        });

        const profile = s.phase_2_attention?.attention_profiles?.[0];
        if (profile) {
            const p2Labels = profile.rules.map(r => String(r.label).toLowerCase());
            s.phase_3_ffn.activations.forEach(cat => {
                if (!p2Labels.includes(String(cat.id).toLowerCase())) {
                    warnings.push(`Phase 2: No rule found for head linked to "${cat.id}"`);
                }
            });
        }
    }

    return {
        isValid: true,
        errors: [],
        warnings,
        data: s
    };
};

/**
 * Validates the full root JSON object
 */
export const validateRoot = (json) => {
    return RootSchema.safeParse(json);
};
