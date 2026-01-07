import React, { createContext, useState, useEffect, useContext } from 'react';

const ScenarioContext = createContext();

export const ScenarioProvider = ({ children }) => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initiales Laden der scenarios.json
  useEffect(() => {
    // Erstellt den korrekten Pfad, egal ob lokal oder auf GitHub
    const baseUrl = import.meta.env.BASE_URL;
    const dataPath = `${baseUrl}data/scenarios.json`;

    fetch(dataPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setScenarios(data);
        if (data.length > 0) setActiveScenario(data[0]);
      })
      .catch((error) => console.error("Fehler beim Laden der Szenarien:", error));
  }, []);

  // Global Reset Funktion: Wird beim Szenarien-Wechsel aufgerufen
  const handleScenarioChange = (scenarioId) => {
    const selected = scenarios.find(s => s.id === scenarioId);
    setActiveScenario(selected);

    // Da die App beim Szenarienwechsel neu lädt, 
    // werden die States im useLLMSimulator automatisch 
    // auf ihre Default-Werte (noise=0, temp=1.0) zurückgesetzt.
    // Falls du eine manuelle Reset-Funktion willst, könntest du diese hier triggern.
  };

  return (
    <ScenarioContext.Provider value={{ scenarios, activeScenario, handleScenarioChange, loading }}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenarios = () => useContext(ScenarioContext);