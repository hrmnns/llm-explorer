import { z } from 'zod';

// --- Phase 0: Tokenization ---
const TokenSchema = z.object({
    id: z.string(),
    text: z.string(),
    explanation: z.string().optional(),
    color: z.string().optional(), // UI-specific, but often present
});

const Phase0Schema = z.object({
    tokens: z.array(TokenSchema),
});

// --- Phase 1: Embedding ---
const AxisDefSchema = z.object({
    positive: z.string(),
    negative: z.string(),
    description: z.string().optional(),
});

const AxisMapSchema = z.object({
    x_axis: AxisDefSchema,
    y_axis: AxisDefSchema,
});

const TokenVectorSchema = z.object({
    token_index: z.number(),
    text: z.string(),
    base_vector: z.tuple([z.number(), z.number()]),
    positional_vector: z.tuple([z.number(), z.number()]).optional(),
    explanation: z.string().optional(),
});

const Phase1Schema = z.object({
    axis_map: AxisMapSchema.optional(), // Made optional based on previous validation logic
    token_vectors: z.array(TokenVectorSchema),
});

// --- Phase 2: Attention ---
const AttentionRuleSchema = z.object({
    head: z.number(),
    label: z.string(),
    source: z.union([z.string(), z.number()]), // ID can be string or number in JSON
    target: z.union([z.string(), z.number()]),
    strength: z.number(),
    explanation: z.string().optional(),
});

const AttentionProfileSchema = z.object({
    id: z.string(),
    label: z.string(),
    rules: z.array(AttentionRuleSchema),
});

const Phase2Schema = z.object({
    settings: z.object({
        default_head_strength: z.number().optional(),
    }).optional(),
    attention_profiles: z.array(AttentionProfileSchema),
});

// --- Phase 3: FFN ---
const FFNActivationSchema = z.object({
    id: z.string(),
    label: z.string(),
    linked_head: z.number().optional(), // Critical for Goal-Seeking
    color: z.string().optional(),
    icon: z.string().optional(),
    explanation: z.string().optional(),
});

const Phase3Schema = z.object({
    activations: z.array(FFNActivationSchema),
});

// --- Phase 4: Decoding ---
const TopKTokenSchema = z.object({
    token: z.string(),
    base_logit: z.number(),
    category_link: z.string().optional(),
    noise_sensitivity: z.number().optional(),
});

const DecodingSettingsSchema = z.object({
    default_temperature: z.number().optional(),
    default_noise: z.number().optional(),
    default_mlp_threshold: z.number().optional(),
    logit_bias_multiplier: z.number().optional(),
});

const Phase4Schema = z.object({
    settings: DecodingSettingsSchema.optional(),
    top_k_tokens: z.array(TopKTokenSchema),
});

// --- Phase 5: Analysis (Optional) ---
const Phase5Schema = z.object({
    // Define if structure is known, otherwise loose object
}).passthrough().optional();


// --- Main Scenario Schema ---
export const ScenarioSchema = z.object({
    id: z.string(),
    name: z.string(),
    input_prompt: z.string(),
    explanation: z.string().optional(),

    phase_0_tokenization: Phase0Schema,
    phase_1_embedding: Phase1Schema.optional(),
    phase_2_attention: Phase2Schema.optional(),
    phase_3_ffn: Phase3Schema.optional(),
    phase_4_decoding: Phase4Schema.optional(),
    phase_5_analysis: Phase5Schema,
});

export const RootSchema = z.object({
    project: z.string(),
    version: z.union([z.string(), z.number()]),
    scenarios: z.array(ScenarioSchema),
});
