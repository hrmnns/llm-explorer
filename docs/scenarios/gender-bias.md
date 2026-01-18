# Szenario-Dokumentation: Gender-Bias (Die Ärztin)

## 1. Übersicht & Didaktik

**ID:** `gender-bias-doctor-001`

**Prompt:** *"Die Ärztin sagte dem Pfleger, dass"*

### Lernziel

Dieses Szenario visualisiert den **Stereotyp-Bias**. In vielen Trainingsdaten sind "Pfleger" maskulin assoziiert. Das Modell tendiert dazu, ein Pronomen ("er") auf den Pfleger zu beziehen, obwohl die Grammatik auf das Subjekt ("Ärztin") zielt. Der Nutzer lernt, wie die **universelle Kausalitätskette** genutzt wird, um durch den **Logik-Head** grammatikalische Korrektheit gegen statistische Vorurteile durchzusetzen.

## 2. Technische Logik: Die Kausalitäts-Brücke

* **Universelle Verknüpfung:** In Phase 3 ist die Kategorie "Feminin" über `linked_head: 3` fest an den **Logik-Head** gebunden, während "Maskulin" über `linked_head: 1` am **Semantik-Head (Bias)** hängt.
* **Bias-Falle:** Ohne manuellen Eingriff dominiert der statistische Bias von Head 1, da "Pfleger" im Embedding-Raum näher an maskulinen Pronomen liegt.
* **Logik-Korrektur:** Durch Verstärkung von Head 3 wird die Aktivierung der femininen Kategorie über das **MLP-Gate (20%)** und den **Neutral-Punkt (50%)** gehoben.
* **Modulation:** Die Live-Aktivierung in Phase 3 steuert den Logit-Shift in Phase 4 ().

## 3. Vollständiges Szenario-JSON (`scenarios.json`)

```json
{
  "id": "gender-bias-doctor-001",
  "name": "Gender-Bias: Die Ärztin",
  "input_prompt": "Die Ärztin sagte dem Pfleger, dass",
  "explanation": "Dieses Szenario zeigt, wie man durch Verstärkung des Logik-Heads die grammatikalische Korrektheit gegen den statistischen Bias durchsetzt.",
  "phase_0_tokenization": {
    "tokens": [
      { "id": "0", "text": "Die", "explanation": "Artikel (Feminin)." },
      { "id": "1", "text": "Ärztin", "explanation": "Subjekt (Feminin, Anker)." },
      { "id": "2", "text": "sagte", "explanation": "Verb der Mitteilung." },
      { "id": "3", "text": "dem", "explanation": "Artikel (Maskulin)." },
      { "id": "4", "text": "Pfleger", "explanation": "Objekt (Maskulin)." },
      { "id": "5", "text": "dass", "explanation": "Subjunktion (Referenz-Start)." }
    ]
  },
  "phase_1_embedding": {
    "token_vectors": [
      { "token_index": 0, "base_vector": [-0.1, 0.7], "positional_vector": [0.0, 0.1] },
      { "token_index": 1, "base_vector": [-0.2, 0.9], "positional_vector": [0.1, 0.1] },
      { "token_index": 2, "base_vector": [0.1, 0.0], "positional_vector": [0.2, 0.1] },
      { "token_index": 3, "base_vector": [0.7, -0.1], "positional_vector": [0.3, 0.1] },
      { "token_index": 4, "base_vector": [0.9, -0.2], "positional_vector": [0.4, 0.1] },
      { "token_index": 5, "base_vector": [0.0, 0.0], "positional_vector": [0.5, 0.1] }
    ]
  },
  "phase_2_attention": {
    "attention_profiles": [
      {
        "id": "biased-mode",
        "label": "Kontext: Stereotyp-Bias",
        "rules": [
          {
            "head": 1, "source": "5", "target": "4", "strength": 0.80,
            "explanation": "Bias-Head: Assoziation zwischen Pflegeberuf und Maskulin-Pronomen."
          },
          {
            "head": 3, "source": "5", "target": "1", "strength": 0.85,
            "explanation": "Logik: Grammatikalische Rückführung zum Subjekt (Ärztin)."
          }
        ]
      }
    ]
  },
  "phase_3_ffn": {
    "activation_profiles": [
      {
        "ref_profile_id": "biased-mode",
        "activations": [
          { "label": "Maskulin", "activation": 0.45, "linked_head": 1, "color": "#3b82f6" },
          { "label": "Feminin", "activation": 0.40, "linked_head": 3, "color": "#f472b6" }
        ]
      }
    ]
  },
  "phase_4_decoding": {
    "outputs": [
      { "label": "er", "logit": 5.0, "type": "Maskulin", "causality_trace": "Gewinnt bei Standardeinstellung durch Bias in Head 1." },
      { "label": "sie", "logit": 5.0, "type": "Feminin", "causality_trace": "Überholt 'er', wenn Head 3 (Logik) verstärkt wird." }
    ]
  }
}

```

## 4. Test-Szenarien & Labor-Protokoll

| Testfall | Fokus (Phase 2) | Einstellung Phase 2 (Attention) | Einstellung Phase 4 (Decoding) | Resultat (Phase 4) | Didaktik |
| --- | --- | --- | --- | --- | --- |
| **A: Stereotyp-Sieg** | Wort **"dass"** (ID 5) | **Head 1: 1.00** / **Head 3: 0.70** | **Temp: 0.50** | **"er"** gewinnt deutlich | Der statistische Bias (Head 1) führt das Modell. |
| **B: Logik-Korrektur** | Wort **"dass"** (ID 5) | **Head 1: 0.00** / **Head 3: 1.00** | **Temp: 0.50** | **"sie"** überholt **"er"** | Grammatik schlägt Bias durch gezielte Logik-Resonanz. |
| **C: MLP-Blockade** | Wort **"dass"** (ID 5) | **Alle Slider: 0.00** | **Temp: 0.70** | Beide Balken bei **0%** | Signal unter 20%: MLP-Gate blockiert die Wissensextraktion. |
| **D: Sampling-Rauschen** | Wort **"dass"** (ID 5) | **Head 1: 1.00** / **Head 3: 1.00** | **Temp: 1.50** | Instabile Verteilung | Hohe Kreativität führt zu unvorhersehbarem Sampling. |

## 5. Durchführungshinweise

1. **Vorbereitung:** Stellen Sie sicher, dass in Phase 2 das Token **"dass"** (ID 5) als Source ausgewählt ist. Nur dann reagieren Phase 3 und 4 auf die Slider-Änderungen.
2. **Beobachtung Phase 3:** Schieben Sie den **Logik-Slider (Head 3)** auf **1.00**. Beobachten Sie, wie der rosa Balken ("Feminin") über die MLP-Schwelle steigt.
3. **Inspektor-Check:** Klicken Sie in Phase 4 auf den Balken **"sie"**. Der Inspektor zeigt nun unter "Einfluss durch" den Wert **Head 3** und einen positiven **Logit-Shift** an.
4. **Resampling:** Nutzen Sie in Testfall D den **🎲 Re-Sample** Button, um zu sehen, wie das Modell zwischen den beiden (nun fast gleichwertigen) Optionen hin- und hergewürfelt wird.
