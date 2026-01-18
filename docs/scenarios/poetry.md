# Szenario-Dokumentation: Poesie-Generator (Creative Association)

## 1. Übersicht & Didaktik

**ID:** `poetry-generator-001`

**Prompt:** *"Der Mond scheint hell auf das"*

### Lernziel

Dieses Szenario demonstriert die **schöpferische Varianz** eines LLMs. Es zeigt, wie semantische Attention-Heads (Phase 2) poetische Konzepte aktivieren (Phase 3) und wie die Temperatur (Phase 4) die Wahrscheinlichkeitsverteilung glättet, um kreative Wortfolgen ("Silbermeer") gegenüber rein statistischen Wahrscheinlichkeiten ("Dach") zu bevorzugen.

## 2. Technische Logik: Die Kausalitäts-Brücke

Das Szenario nutzt die semantische Resonanz, um das interne Weltwissen umzusteuern:

* **Semantische Resonanz:** Head 1 verknüpft die visuellen Reize "Mond" und "hell" mit dem Ziel-Token.
* **Kreativ-Bias:** In Phase 3 ist die Kategorie "Poetisch" hinterlegt, die durch Head 1 (Semantik) verstärkt wird.
* **Softmax-Glättung:** Durch Erhöhung der Temperatur werden die Logit-Abstände relativiert, was die Auswahlvielfalt erhöht.

## 3. Vollständiges Szenario-JSON (`scenarios.json`)

```json
{
  "id": "poetry-generator-001",
  "name": "Poesie-Generator: Kreative Resonanz",
  "input_prompt": "Der Mond scheint hell auf das",
  "explanation": "Dieses Szenario zeigt die kreative Seite des Modells. Durch semantische Verknüpfung und hohe Temperatur entstehen atmosphärische Wortfolgen statt reiner Fakten.",
  "phase_0_tokenization": {
    "tokens": [
      { "id": "0", "text": "Der", "explanation": "Artikel." },
      { "id": "1", "text": "Mond", "explanation": "Semantischer Anker (Natur/Nacht)." },
      { "id": "2", "text": "scheint", "explanation": "Verb (Licht-Emission)." },
      { "id": "3", "text": "hell", "explanation": "Adjektiv (Intensität)." },
      { "id": "4", "text": "auf", "explanation": "Präposition (Richtung)." },
      { "id": "5", "text": "das", "explanation": "Artikel (Neutral)." }
    ]
  },
  "phase_1_embedding": {
    "token_vectors": [
      { "token_index": 0, "base_vector": [-0.1, -0.1], "positional_vector": [0.0, 0.1] },
      { "token_index": 1, "base_vector": [0.8, 0.9], "positional_vector": [0.1, 0.1] },
      { "token_index": 2, "base_vector": [0.3, 0.4], "positional_vector": [0.2, 0.1] },
      { "token_index": 3, "base_vector": [0.6, 0.7], "positional_vector": [0.3, 0.1] },
      { "token_index": 4, "base_vector": [-0.2, -0.3], "positional_vector": [0.4, 0.1] },
      { "token_index": 5, "base_vector": [0.1, -0.1], "positional_vector": [0.5, 0.1] }
    ]
  },
  "phase_2_attention": {
    "attention_profiles": [
      {
        "id": "poetic-mode",
        "label": "Kontext: Lyrische Atmosphäre",
        "rules": [
          {
            "head": 1,
            "source": "5",
            "target": "1",
            "strength": 0.90,
            "explanation": "Semantik: 'Mond' aktiviert nächtliche Bildsprache."
          },
          {
            "head": 1,
            "source": "5",
            "target": "3",
            "strength": 0.85,
            "explanation": "Semantik: 'hell' verstärkt visuelle Kontraste."
          }
        ]
      }
    ]
  },
  "phase_3_ffn": {
    "activation_profiles": [
      {
        "ref_profile_id": "poetic-mode",
        "activations": [
          { "label": "Poetisch", "activation": 0.85, "color": "#a855f7" },
          { "label": "Wissenschaftlich", "activation": 0.15, "color": "#3b82f6" },
          { "label": "Funktional", "activation": 0.40, "color": "#10b981" }
        ]
      }
    ]
  },
  "phase_4_decoding": {
    "outputs": [
      {
        "label": "Silbermeer",
        "logit": 4.8,
        "type": "Poetisch",
        "causality_trace": "Metaphorische Verknüpfung von Licht und Reflexion."
      },
      {
        "label": "Dunkelblau",
        "logit": 4.5,
        "type": "Poetisch",
        "causality_trace": "Farbausdruck der nächtlichen Szenerie."
      },
      {
        "label": "Dach",
        "logit": 5.2,
        "type": "Funktional",
        "causality_trace": "Die wahrscheinlichste, aber unkreative Fortsetzung."
      },
      {
        "label": "Fensterglas",
        "logit": 4.0,
        "type": "Funktional",
        "causality_trace": "Physisches Objekt im Lichtstrahl."
      }
    ]
  }
}

```


## 4. Test-Szenarien & Labor-Protokoll

| Testfall | Fokus (Phase 2) | Einstellung Phase 2 (Attention) | Einstellung Phase 4 (Decoding) | Resultat (Phase 4) | Didaktik |
| --- | --- | --- | --- | --- | --- |
| **A: Determinismus** | Wort **"das"** auswählen | Alle Slider **Mittelstellung** (Default) | **Creativity (Temp)** auf **Minimum** (ganz links) | Favorit springt auf **~100%** | Unterdrückung von Varianz; Modell wird starr. |
| **B: Poesie-Sieg** | Wort **"das"** auswählen | **Head 1 (Semantik)** auf **Maximum** (ganz rechts) | **Creativity (Temp)** auf **Mittelstellung** | **Silbermeer** überholt das Wort **Dach** | Semantische Steuerung des Wissens (Phase 2 -> 3). |
| **C: Kreativität** | Wort **"das"** auswählen | **Head 1 (Semantik)** auf **Maximum** | **Creativity (Temp)** auf **Maximum** (ganz rechts) | Balken fast **gleich hoch**; viele Optionen | Hohe Entropie: Vielfalt durch geglättete Kurve. |
| **D: Nüchternheit** | Wort **"das"** auswählen | **Head 1 (Semantik)** auf **Minimum** (ganz links) | **Creativity (Temp)** auf **Mittelstellung** | **Dach** gewinnt deutlich vor Lyrik | Rückfall auf statistische Basis-Logits ohne Fokus. |

## 5. UI/UX Dokumentation & Testdurchführung

* **Vorbereitung:** Stellen Sie sicher, dass in Phase 2 das Token **"das"** (ID 5) selektiert ist, um die Aufmerksamkeit für die Vorhersage zu steuern.
* **Phase 3 Monitoring:** Beobachten Sie beim Verschieben von **Head 1**, wie die violette Kategorie ("Poetisch") über die **MLP-Schwelle (20%)** steigt. Erst dann erhält "Silbermeer" den notwendigen Logit-Boost.
* **Sampling-Test:** Nutzen Sie in Testfall C den **🎲 Re-Sample** Button. Bei hoher Temperatur sollte das System bei jedem Klick zwischen den Top-Kandidaten wechseln.
* **Visualisierungen:** Bei hoher Temperatur und Noise zeigt der Simulator einen **Jitter-Effekt** (Zittern der Balken), um die mathematische Unsicherheit darzustellen.
