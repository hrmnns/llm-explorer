# Szenario-Dokumentation: Gender-Bias (Die Ärztin)

## 1. Übersicht & Didaktik

**ID:** `gender-bias-doctor-001`

**Prompt:** *"Die Ärztin sagte dem Pfleger, dass"*

### Lernziel

Dieses Szenario visualisiert den **Stereotyp-Bias**. In vielen Trainingsdaten sind "Pfleger" maskulin und "Ärzte" maskulin assoziiert. Das Modell tendiert dazu, ein nachfolgendes Pronomen ("er") auf den Pfleger zu beziehen, obwohl die Grammatik (Subjekt-Fokus) auf die Ärztin ("sie") zielt. Der Nutzer lernt, wie man durch Verstärkung des **Logik-Heads** die grammatikalische Korrektheit gegen den statistischen Bias durchsetzt.

## 2. Technische Logik: Die Kausalitäts-Brücke

* **Bias-Falle:** Head 1 (Semantik) hat eine sehr starke natürliche Verbindung zwischen "dass" und "Pfleger" (Stereotyp-Assoziation).
* **Logik-Korrektur:** Head 3 (Logik) muss manuell verstärkt werden, um die Verbindung zum Subjekt ("Ärztin") über den 50%-Kipppunkt zu heben.
* **Mathematik:** Bei Default-Einstellung (0.7) bleibt die "Feminin"-Aktivierung bei ~38% (negativer Logit-Shift). Erst bei Slider-Maximum (~1.0) springt sie auf ~55% (positiver Boost).

## 3. Vollständiges Szenario-JSON (`scenarios.json`)

```json
{
  "id": "gender-bias-doctor-001",
  "name": "Gender-Bias: Die Ärztin",
  "input_prompt": "Die Ärztin sagte dem Pfleger, dass",
  "explanation": "Dieses Szenario zeigt, wie ein statistischer Bias in den Attention-Heads dazu führt, dass das Modell Pronomen falsch zuordnet, und wie Logik-Fokus dies korrigiert.",
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
            "head": 1, "source": "5", "target": "4", "strength": 0.90,
            "explanation": "Semantik-Bias: Starke Assoziation zwischen Pflegeberuf und Maskulin-Pronomen."
          },
          {
            "head": 3, "source": "5", "target": "1", "strength": 0.55,
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
          { "label": "Maskulin", "activation": 0.75, "color": "#3b82f6" },
          { "label": "Feminin", "activation": 0.55, "color": "#f472b6" }
        ]
      }
    ]
  },
  "phase_4_decoding": {
    "outputs": [
      {
        "label": "er",
        "logit": 5.2,
        "type": "Maskulin",
        "causality_trace": "Standard-Sieger durch hohen Bias-Wert in Head 1."
      },
      {
        "label": "sie",
        "logit": 5.0,
        "type": "Feminin",
        "causality_trace": "Benötigt Verstärkung von Head 3 (Logik), um den Bias zu überwinden."
      }
    ]
  }
}

```

## 4. Test-Szenarien & Labor-Protokoll

| Testfall | Fokus (Phase 2) | Einstellung Phase 2 (Attention) | Einstellung Phase 4 (Decoding) | Resultat (Phase 4) | Didaktik |
| --- | --- | --- | --- | --- | --- |
| **A: Stereotyp-Sieg** | Wort **"dass"** auswählen | Alle Slider **Mittelstellung** (0.70) | **Temp** auf **0.7** (Default) | **"er"** gewinnt | Das Modell folgt dem antrainierten Bias. |
| **B: Logik-Korrektur** | Wort **"dass"** auswählen | **Head 3 (Logik)** auf **Maximum** (1.00) | **Temp** auf **0.7** | **"sie"** überholt **"er"** | Grammatik schlägt Bias durch manuelle Aufmerksamkeit. |
| **C: MLP-Blockade** | Wort **"dass"** auswählen | **Head 3 (Logik)** auf **Minimum** (0.00) | **Temp** auf **0.7** | **"er"** bei **100%** | Das korrekte "sie" fällt unter das 20%-Gate. |

## 5. Durchführungshinweise

1. **Beobachte Phase 3:** Bei Slider-Stellung 0.7 (Default) siehst du, dass die Kategorie **"Feminin"** bei ca. **38%** liegt. Das ergibt einen negativen Logit-Shift.
2. **Der Kipppunkt:** Schiebe den **Logik-Slider** langsam nach rechts. Sobald der Wert im Badge über **0.90** steigt, springt die Aktivierung in Phase 3 über **50%**.
3. **Das Ergebnis:** Im Decoder siehst du nun, wie der Balken für **"sie"** einen positiven Boost erhält und den blauen Balken für **"er"** überholt.
