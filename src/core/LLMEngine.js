/**
 * LLMEngine - Core Logic for the LLM Simulator
 * 
 * This class encapsulates the mathematical operations of the simulation
 * (Embedding, Attention, FFN, Decoding) ensuring they are pure and testable
 * outside of the React lifecycle.
 */

export class LLMEngine {
    constructor(config = {}) {
        this.noise = config.noise || 0;
        this.temperature = config.temperature || 0.7;
        this.mlpThreshold = config.mlpThreshold || 0.5;
        this.positionWeight = config.positionWeight || 0;
        this.headOverrides = config.headOverrides || {};
        this.activeProfileId = config.activeProfileId || 'scientific';
        this.defaultHeadStrength = config.defaultHeadStrength ?? 0.7;
        this.gumbelSeeds = {};
    }

    updateConfig(newConfig) {
        Object.assign(this, newConfig);
    }

    /**
     * Phase 1: Embedding Calculation
     * Transforms raw tokens into 2D vectors mixed with positional data and noise.
     */
    computeEmbeddings(scenario) {
        if (!scenario?.phase_1_embedding) return [];

        return scenario.phase_1_embedding.token_vectors.map(v => {
            const xBase = v.base_vector[0];
            const yBase = v.base_vector[1];
            const xPos = (v.positional_vector?.[0] || 0) * this.positionWeight;
            const yPos = (v.positional_vector?.[1] || 0) * this.positionWeight;

            // Jitter (deterministic if noise is 0)
            const noiseX = (Math.random() - 0.5) * this.noise * 25;
            const noiseY = (Math.random() - 0.5) * this.noise * 25;

            const signalQuality = Math.max(0, 1 - (this.noise / 5));

            return {
                ...v,
                displayX: (xBase + xPos) * 150 + noiseX,
                displayY: (yBase + yPos) * 150 + noiseY,
                signalQuality
            };
        });
    }

    /**
     * Phase 2: Attention Mechanism
     * Aggregates signal quality based on current state.
     */
    computeAttention(scenario, processedVectors) {
        if (!scenario?.phase_2_attention?.attention_profiles) {
            return { avgSignal: 1.0, profiles: [] };
        }

        const avgSignal = processedVectors.reduce((acc, v) => acc + v.signalQuality, 0) / (processedVectors.length || 1);

        return {
            avgSignal,
            profiles: scenario.phase_2_attention.attention_profiles
        };
    }

    /**
     * Phase 3: Feed Forward Network
     * Calculates activation levels for semantic categories based on attention rules and overrides.
     */
    computeFFN(scenario, activeAttention) {
        const activationsSource = scenario?.phase_3_ffn?.activations;
        const tokens = scenario?.phase_0_tokenization?.tokens;

        if (!activationsSource || !tokens) return [];

        const activeAttProfile = activeAttention.profiles.find(p => String(p.id) === String(this.activeProfileId)) || activeAttention.profiles[0];
        const rules = activeAttProfile?.rules || [];
        const globalSignal = activeAttention.avgSignal || 0;

        return activationsSource.map((cat, index) => {
            const linkedHeadId = cat.linked_head || (index + 1);
            let totalActivation = 0;

            tokens.forEach(t => {
                const tokenKey = `${this.activeProfileId}_s${t.id}_h${linkedHeadId}`;

                // Get override value (from UI sliders) or default
                const sliderVal = this.headOverrides[tokenKey] !== undefined
                    ? parseFloat(this.headOverrides[tokenKey])
                    : this.defaultHeadStrength;

                // Find applicable rules
                const relevantRules = rules.filter(r =>
                    Number(r.head) === Number(linkedHeadId) &&
                    String(r.source) === String(t.id)
                );

                // Sum up rule strengths
                relevantRules.forEach(rule => {
                    totalActivation += (sliderVal / this.defaultHeadStrength) * parseFloat(rule.strength) * globalSignal;
                });
            });

            // Activation function (clamped 0..1)
            const finalActivation = Math.max(0, Math.min(1.0, totalActivation * 0.33));

            return {
                ...cat,
                activation: finalActivation,
                isActive: finalActivation >= this.mlpThreshold,
                linked_head: linkedHeadId
            };
        });
    }

    /**
     * Phase 4: Decoding / Logits
     * Calculates final token probabilities based on FFN activations, temperature and noise.
     */
    computeDecoding(scenario, activeFFN) {
        if (!scenario?.phase_4_decoding) return [];

        const tokens = scenario.phase_4_decoding.top_k_tokens || [];
        const multiplier = scenario.phase_4_decoding.settings?.logit_bias_multiplier || 12;

        const calculatedData = tokens.map(tokenItem => {
            const matchingCat = activeFFN.find(f => String(f.id).toLowerCase() === String(tokenItem.category_link).toLowerCase());
            const liveActivation = matchingCat ? matchingCat.activation : 0.5;

            // Logit Bias
            const bias = (liveActivation - 0.5) * multiplier;
            const baseLogit = tokenItem.base_logit !== undefined ? tokenItem.base_logit : 4.0;

            // Noise Decay
            const decay = 1 - (Math.min(1, this.noise / 2) * (tokenItem.noise_sensitivity || 0.5));

            // Gumbel noise for dynamic temperature response
            if (this.gumbelSeeds[tokenItem.token] === undefined) {
                const u = Math.max(0.00001, Math.random());
                this.gumbelSeeds[tokenItem.token] = -Math.log(-Math.log(u));
            }
            const gumbel = this.gumbelSeeds[tokenItem.token] * (this.temperature * 1.5);

            const adjustedLogit = (baseLogit + bias) * decay + gumbel;

            return {
                ...tokenItem,
                logit: adjustedLogit,
                liveActivation,
                ffnBoost: bias,
                exp: Math.exp(adjustedLogit / Math.max(this.temperature, 0.01))
            };
        });

        // Softmax
        const sumExponents = calculatedData.reduce((acc, curr) => acc + curr.exp, 0) || 1;

        return calculatedData.map(item => ({
            ...item,
            probability: item.exp / sumExponents
        })).sort((a, b) => b.probability - a.probability);
    }

    /**
     * Main Pipeline execution
     */
    runPipeline(scenario) {
        if (!scenario) return null;

        const processedVectors = this.computeEmbeddings(scenario);
        const activeAttention = this.computeAttention(scenario, processedVectors);
        const activeFFN = this.computeFFN(scenario, activeAttention);
        const finalOutputs = this.computeDecoding(scenario, activeFFN);

        return {
            processedVectors,
            activeAttention,
            activeFFN,
            finalOutputs
        };
    }
}
