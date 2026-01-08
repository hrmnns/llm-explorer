import React, { createContext, useState, useEffect, useContext } from 'react';

const ScenarioContext = createContext();

export const ScenarioProvider = ({ children }) => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scenariosData, setScenariosData] = useState(null); 

  // Initiales Laden der scenarios.json
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const dataPath = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}data/scenarios.json`;

    console.log("Fetch-Versuch von:", dataPath);

    fetch(dataPath)
      .then((response) => {
        if (!response.ok) throw new Error(`Server-Fehler: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("Daten empfangen:", data);
        setScenariosData(data);

        // WICHTIG: Wir greifen auf den Schlüssel "scenarios" im Objekt zu
        const scenarioArray = data.scenarios;

        if (Array.isArray(scenarioArray) && scenarioArray.length > 0) {
          setScenarios(scenarioArray);
          setActiveScenario(scenarioArray[0]);
          setLoading(false); // Das beendet den "Lade Simulation..." Screen
        } else {
          console.error("Strukturfehler: 'scenarios' Feld nicht gefunden oder leer", data);
        }
      })
      .catch((error) => {
        console.error("Ladefehler:", error);
        // Damit die App nicht ewig hängen bleibt, beenden wir das Laden 
        // auch bei einem Fehler und zeigen eine Meldung
        setLoading(false);
      });
  }, []);

  // Global Reset Funktion: Wird beim Szenarien-Wechsel aufgerufen
  const handleScenarioChange = (scenarioId) => {
    // Wir wandeln beide Seiten in Strings um, um sicherzugehen
    const selected = scenarios.find(s => String(s.id) === String(scenarioId));
    if (selected) {
      setActiveScenario(selected);
    } else {
      console.error("Szenario nicht gefunden für ID:", scenarioId);
    }
  };

  return (
    <ScenarioContext.Provider value={{
      scenarios,
      scenariosData,
      activeScenario,
      setActiveScenario, // <- Das hier MUSS rein, damit Header.jsx darauf zugreifen kann
      handleScenarioChange,
      loading
    }}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenarios = () => useContext(ScenarioContext);