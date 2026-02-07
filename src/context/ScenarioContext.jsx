import React, { createContext, useState, useEffect, useContext } from 'react';

const ScenarioContext = createContext();

import { validateScenario } from '../utils/validator';

// The manual validateScenario function has been removed in favor of the Zod-based implementation.


export const ScenarioProvider = ({ children }) => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scenariosData, setScenariosData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

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

        const validatedScenarios = scenarioArray.map(s => {
          const check = validateScenario(s);
          if (!check.isValid) {
            console.warn(`Szenario "${s.name}" ist fehlerhaft:`, check.errors);
          }
          return { ...s, isValid: check.isValid, validationErrors: check.errors };
        });

        setScenariosData(data);
        setScenarios(validatedScenarios);

        if (validatedScenarios.length > 0) {
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
      validationErrors
    }}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenarios = () => useContext(ScenarioContext);