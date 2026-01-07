import React from 'react';

const phases = [
  { id: 0, name: "Tokenization" },
  { id: 1, name: "Embedding" },
  { id: 2, name: "Attention" },
  { id: 3, name: "FFN" },
  { id: 4, name: "Decoding" },
  { id: 5, name: "Analysis" }
];

const PhaseNavigator = ({ activePhase, setActivePhase }) => {
  return (
    <nav className="flex justify-center bg-slate-900 border-b border-slate-800 p-2 gap-2">
      {scenarios?.length > 0 && scenarios.map(s => (
        <button key={s.id}>{s.name}</button>
      ))}
    </nav>
  );
};

export default PhaseNavigator;