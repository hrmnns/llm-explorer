import React, { createContext, useState, useEffect, useContext } from 'react';

const ScenarioContext = createContext();

// --- NEU: Der Scenario-Checker als interne Hilfsfunktion ---
const validateScenario = (s) => {
  const errors = [];
  const warnings = [];

  // 1. Basis-Validierung
  if (!s.id || !s.name) errors.push("ID oder Name fehlt");

  // 2. Phasen-Check
  if (!s.phase_3_ffn?.activations) {
    errors.push("Phase 3: 'activations' Liste fehlt");
  }
  if (!s.phase_4_decoding?.top_k_tokens) {
    errors.push("Phase 4: 'top_k_tokens' fehlen");
  }

  // 3. Kausalitäts-Mapping Check
  if (s.phase_3_ffn?.activations && s.phase_4_decoding?.top_k_tokens) {
    const p3Ids = s.phase_3_ffn.activations.map(a => String(a.id).trim().toLowerCase());

    s.phase_4_decoding.top_k_tokens.forEach(t => {
      if (t.category_link) {
        const link = String(t.category_link).trim().toLowerCase();
        if (!p3Ids.includes(link)) {
          errors.push(`Kausalitäts-Lücke: Token "${t.token}" verweist auf die fehlende Kategorie "${t.category_link}"`);
        }
      } else {
        warnings.push(`Token "${t.token}" hat keinen category_link (kein Bias-Einfluss)`);
      }
    });
  }

  // 4. NEU: Settings-Check (für Punkt 3: Dokumentations-Modus)
  const settings = s.phase_4_decoding?.settings;
  if (!settings) {
    warnings.push("Keine Phase 4 Settings gefunden (Nutze globale Defaults)");
  } else {
    if (settings.logit_bias_multiplier === undefined) {
      warnings.push("logit_bias_multiplier fehlt (Default: 12)");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const ScenarioProvider = ({ children }) => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scenariosData, setScenariosData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); // NEU: Fehler pro Szenario speichern

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const dataPath = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}data/scenarios.json`;

    fetch(dataPath)
      .then((response) => {
        if (!response.ok) throw new Error(`Server-Fehler: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const scenarioArray = data.scenarios || [];

        // --- NEU: Jedes Szenario beim Laden validieren ---
        const validatedScenarios = scenarioArray.map(s => {
          const check = validateScenario(s);
          if (!check.isValid) {
            console.warn(`Szenario "${s.name}" ist fehlerhaft:`, check.errors);
          }
          // Wir speichern den Validierungsstatus direkt am Objekt für das UI
          return { ...s, isValid: check.isValid, validationErrors: check.errors };
        });

        setScenariosData(data);
        setScenarios(validatedScenarios);

        if (validatedScenarios.length > 0) {
          // Wir setzen das erste VALIDIERTE Szenario als aktiv
          const firstValid = validatedScenarios.find(s => s.isValid) || validatedScenarios[0];
          setActiveScenario(firstValid);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ladefehler:", error);
        setLoading(false);
      });
  }, []);

  const handleScenarioChange = (scenarioId) => {
    const selected = scenarios.find(s => String(s.id) === String(scenarioId));
    if (selected) {
      setActiveScenario(selected);
    }
  };

  return (
    <ScenarioContext.Provider value={{
      scenarios,
      scenariosData,
      activeScenario,
      setActiveScenario,
      handleScenarioChange,
      loading,
      validationErrors // Falls das UI Fehlermeldungen anzeigen soll
    }}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenarios = () => useContext(ScenarioContext);