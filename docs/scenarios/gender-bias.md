# Szenario-Dokumentation: Gender-Bias (Die Ärztin)

## 1. Übersicht & Didaktik

**ID:** `gender-bias-doctor-001`

**Prompt:** *"Die Ärztin sagte dem Pfleger, dass"*

### Lernziel

Dieses Szenario visualisiert den **Stereotyp-Bias** in Sprachmodellen. Nutzer lernen:

1. Wie das Modell statistische Assoziationen (Pfleger  Maskulin) gegenüber grammatikalischen Regeln gewichtet.
2. Wie **Positional Encodings** die Wortreihenfolge im Vektorraum fixieren.
3. Wie man durch gezielte Verstärkung des **Logik-Heads** (Head 3) grammatikalische Korrektheit erzwingt.

## 2. Technische Logik: Die Kausalitäts-Brücke

* **Phase 1 (Embedding):** Durch die Ergänzung der `positional_vector`-Werte (von -0.5 bis 0.5) erhält jedes Wort eine eindeutige Koordinate auf der X-Achse. Der **Position Weight Slider** skaliert diese Distanz.
* **Phase 2 (Attention):** Das Wort „dass“ (Source 5) fungiert als Abfrage. Head 1 sucht nach dem Pfleger (Bias), während Head 3 die Ärztin (Logik) adressiert.
* **Phase 3 (FFN):** Die Aktivierung der Wissenskategorien erfolgt generisch:
* `Maskulin` ist verknüpft mit **Head 1**.
* `Feminin` ist verknüpft mit **Head 3**.


* **Phase 4 (Decoding):** Der Output-Logit wird durch die FFN-Aktivierung moduliert. Bei Gleichstand (50/50) entscheidet die Temperatur über das Sampling.

## 3. Vollständiges Szenario-JSON (`scenarios.json`)

```json
{
  "id": "gender-bias-doctor-001",
  "name": "Gender-Bias: Die Ärztin",
  "input_prompt": "Die Ärztin sagte dem Pfleger, dass",
  "explanation": "Head 1 steuert Maskulin, Head 3 steuert Feminin.",
  "phase_0_tokenization": {
    "tokens": [
      { "id": "0", "text": "Die" },
      { "id": "1", "text": "Ärztin" },
      { "id": "2", "text": "sagte" },
      { "id": "3", "text": "dem" },
      { "id": "4", "text": "Pfleger" },
      { "id": "5", "text": "dass" }
    ]
  },
  "phase_1_embedding": {
    "token_vectors": [
      { "token_index": 0, "base_vector": [0.1, 0.5], "positional_vector": [-0.5, 0.0] },
      { "token_index": 1, "base_vector": [-0.2, 0.9], "positional_vector": [-0.3, 0.1] },
      { "token_index": 2, "base_vector": [0.1, 0.0], "positional_vector": [-0.1, 0.0] },
      { "token_index": 3, "base_vector": [0.5, -0.1], "positional_vector": [0.1, 0.0] },
      { "token_index": 4, "base_vector": [0.9, -0.2], "positional_vector": [0.3, -0.1] },
      { "token_index": 5, "base_vector": [0.0, 0.0], "positional_vector": [0.5, 0.0] }
    ]
  },
  "phase_2_attention": {
    "attention_profiles": [
      {
        "id": "biased-mode",
        "label": "Kontext",
        "rules": [
          { "head": 1, "source": "5", "target": "4", "strength": 1.0 },
          { "head": 3, "source": "5", "target": "1", "strength": 1.0 }
        ]
      }
    ]
  },
  "phase_3_ffn": {
    "activation_profiles": [
      {
        "ref_profile_id": "biased-mode",
        "activations": [
          { "label": "Maskulin", "activation": 0.50, "linked_head": 1, "color": "#3b82f6" },
          { "label": "Feminin", "activation": 0.50, "linked_head": 3, "color": "#f472b6" }
        ]
      }
    ]
  },
  "phase_4_decoding": {
    "outputs": [
      { "label": "er", "logit": 5.0, "type": "Maskulin" },
      { "label": "sie", "logit": 5.0, "type": "Feminin" }
    ]
  }
}

```

## 4. Test-Szenarien & Labor-Protokoll

| Testfall | Fokus | Aktion | Erwartetes Resultat |
| --- | --- | --- | --- |
| **A: Position Check** | **Phase 1** | Bewege **Position Weight Slider** | Tokens wandern auf der X-Achse (Reihenfolge wird sichtbar). |
| **B: Logik-Sieg** | **Phase 2 & 3** | Wort **"dass"** selektieren, **Head 3 auf Max** | Kategorie **"Feminin"** leuchtet rosa auf (ca. 36-50%). |
| **C: Bias-Sieg** | **Phase 2 & 3** | Wort **"dass"** selektieren, **Head 1 auf Max** | Kategorie **"Maskulin"** leuchtet blau auf. |
| **D: Wissens-Leere** | **Phase 3** | Alle Slider auf **0.0** | Beide Kategorien in Phase 3 bleiben bei **0%**. |
| **E: Sampling-Stress** | **Phase 4** | **Temperatur auf 1.5** | Balken zittern; Modell wechselt instabil zwischen "er" und "sie". |

## 5. Durchführungshinweise

1. **Phase 1 Visualisierung:** Achte darauf, dass beim Verschieben des Position-Sliders die Tokens `Die`, `Ärztin` etc. ihre relative Ordnung beibehalten, aber der Abstand sich skaliert.
2. **Aktivierungskontrolle:** In Phase 3 ist die 20% Hürde (MLP-Gate) entscheidend. Ein aktiver Head muss die Aktivierung über diesen Punkt heben, damit das Signal in Phase 4 ankommt.
3. **Inspektor-Nutzung:** Klicke in Phase 3 auf die rosa Karte ("Feminin"), um zu prüfen, ob der `linked_head: 3` korrekt im Debug-Fenster angezeigt wird.

**Möchtest du, dass ich nun das nächste "Hero-Szenario" – „Das Schloss“ (Polysemie) – mit denselben Qualitätsstandards und Positions-Vektoren für dich erstelle?**
