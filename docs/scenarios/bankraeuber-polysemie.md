# Szenario-Dokumentation: Die dreifache Bank

## 1. Übersicht & Didaktik

* **ID:** `bankraeuber-polysemie-v01`
* **Prompt:** *"Der Bankräuber sitzt auf einer Bank vor der Bank."*
* **Lernziel:**
1. **Polysemie-Auflösung:** Verstehen, wie ein Modell identische Wörter ("Bank") basierend auf ihrem unmittelbaren Kontext unterschiedlich einfärbt.
2. **Attention-Flow (Query & Key):** Erkennen, wie das letzte Token eines Satzes (Query: `.`) aktiv auf vergangene Schlüsselwörter (Keys: `Bank`) zurückschaut, um Informationen zu sammeln.
3. **Bias-Management:** Lernen, wie man starke "Default-Pfade" (Bankräuber  Verbrechen) durch gezielte Attention-Steuerung überschreiben kann.

## 2. Technische Logik: Die Kausalitäts-Brücke

### Phase 1 (Embedding)

* **Achsen:** X (Finanziell vs. Physisch) und Y (Dynamik vs. Statik).
* **Token-Trennung:** Die drei Instanzen von "Bank" (ID 1, 6, 9) besitzen identische Texte, werden aber durch ihre **Positional Vectors** an unterschiedlichen Orten im Raum platziert.

### Phase 2 (Attention)

Die Visualisierung folgt nun der **Self-Attention-Logik** (Rückschau):

* **Richtung:** Vom Beobachter (Query) zum Objekt (Key).
* **Kontextualisierung:** Lokale Wörter färben die Bedeutung ein (z.B. `auf`  `Bank`).
* **Readout:** Der Punkt am Satzende (`.`, ID 10) blickt zurück auf die relevanten Bank-Instanzen (ID 1, 6, 9).

### Phase 3 (FFN)

Die Aktivierung erfolgt nun rein über die **Head-Zugehörigkeit** (`linked_head`).

* Alle Regeln, die **Head 1** nutzen, füttern das Cluster **"Finanzdelikt"**.
* Alle Regeln, die **Head 2** nutzen, füttern das Cluster **"Parkmobiliar"**.
* Alle Regeln, die **Head 3** nutzen, füttern das Cluster **"Städtische Architektur"**.

### Phase 4 (Decoding)

Die Formel für den Logit-Bias lautet:

Um das Idyll-Szenario gegen den starken "Bankräuber"-Bias gewinnen zu lassen, muss der Nutzer Head 1 (Verbrechen) aktiv unterdrücken (Bias wird negativ) und Head 2 verstärken.

## 3. Szenario-JSON (`scenarios.json`)

```json
{
  "id": "bankraeuber-polysemie-v01",
  "name": "Die dreifache Bank: Kontext-Analyse",
  "input_prompt": "Der Bankräuber sitzt auf einer Bank vor der Bank.",
  "explanation": "Dieses Szenario demonstriert die Auflösung extremer Polysemie durch Attention-Steuerung und Positional Encoding.",
  "phase_0_tokenization": {
    "tokens": [
      { "id": "0", "text": "Der", "explanation": "Start-Token." },
      { "id": "1", "text": "Bank", "explanation": "Polysem 1 (Finanz). Morphologische Attraktion zum Räuber." },
      { "id": "2", "text": "räuber", "explanation": "Dominantes Subjekt (Kriminalität)." },
      { "id": "3", "text": "sitzt", "explanation": "Verb." },
      { "id": "4", "text": "auf", "explanation": "Präposition." },
      { "id": "5", "text": "einer", "explanation": "Artikel." },
      { "id": "6", "text": "Bank", "explanation": "Polysem 2 (Möbel)." },
      { "id": "7", "text": "vor", "explanation": "Präposition." },
      { "id": "8", "text": "der", "explanation": "Artikel." },
      { "id": "9", "text": "Bank", "explanation": "Polysem 3 (Gebäude)." },
      { "id": "10", "text": ".", "explanation": "Satzende / Query-Token." }
    ]
  },
  "phase_1_embedding": {
    "axis_map": {
      "x_axis": { "positive": "Abstrakt & Finanziell", "negative": "Physisch & Greifbar", "description": "..." },
      "y_axis": { "positive": "Aktion & Dynamik", "negative": "Statik & Ort", "description": "..." }
    },
    "token_vectors": [
        {"token_index": 0, "text": "Der", "base_vector": [-0.5, 0.0], "positional_vector": [0.0, 0.1]},
        {"token_index": 1, "text": "Bank (1)", "base_vector": [0.8, -0.4], "positional_vector": [0.05, 0.09]},
        {"token_index": 2, "text": "räuber", "base_vector": [0.3, 0.9], "positional_vector": [0.1, 0.08]},
        {"token_index": 3, "text": "sitzt", "base_vector": [-0.2, 0.6], "positional_vector": [0.15, 0.07]},
        {"token_index": 4, "text": "auf", "base_vector": [-0.7, -0.1], "positional_vector": [0.2, 0.06]},
        {"token_index": 5, "text": "einer", "base_vector": [-0.4, 0.0], "positional_vector": [0.25, 0.05]},
        {"token_index": 6, "text": "Bank (2)", "base_vector": [0.8, -0.4], "positional_vector": [0.3, 0.04]},
        {"token_index": 7, "text": "vor", "base_vector": [-0.6, -0.2], "positional_vector": [0.35, 0.03]},
        {"token_index": 8, "text": "der", "base_vector": [-0.5, 0.0], "positional_vector": [0.4, 0.02]},
        {"token_index": 9, "text": "Bank (3)", "base_vector": [0.8, -0.4], "positional_vector": [0.45, 0.01]},
        {"token_index": 10, "text": ".", "base_vector": [0.0, -1.0], "positional_vector": [0.5, 0.0]}
    ]
  },
  "phase_2_attention": {
    "attention_profiles": [
      {
        "id": "triple-context-resolver",
        "label": "Polysemie-Entwirrung",
        "rules": [
          { "head": 1, "label": "context_r_b", "source": 2, "target": 1, "strength": 2.0, "explanation": "Kontext: Räuber -> Bank" },
          { "head": 1, "label": "readout_crime", "source": 10, "target": 1, "strength": 2.0, "explanation": "Readout: Punkt blickt auf Bank (1)" },
          
          { "head": 2, "label": "context_a_b", "source": 4, "target": 6, "strength": 1.8, "explanation": "Kontext: auf -> Bank" },
          { "head": 2, "label": "readout_furniture", "source": 10, "target": 6, "strength": 1.8, "explanation": "Readout: Punkt blickt auf Bank (6)" },
          
          { "head": 3, "label": "context_v_b", "source": 7, "target": 9, "strength": 1.5, "explanation": "Kontext: vor -> Bank" },
          { "head": 3, "label": "readout_arch", "source": 10, "target": 9, "strength": 1.5, "explanation": "Readout: Punkt blickt auf Bank (9)" }
        ]
      }
    ]
  },
  "phase_3_ffn": {
    "activations": [
      { "id": "finance_crime", "label": "Finanzdelikt", "linked_head": 1, "color": "#dc2626", "icon": "💸", "explanation": "Wird aktiviert durch Head 1 (Räuber-Kontext)." },
      { "id": "outdoor_furniture", "label": "Parkmobiliar", "linked_head": 2, "color": "#16a34a", "icon": "🌳", "explanation": "Wird aktiviert durch Head 2 (Sitz-Kontext)." },
      { "id": "architecture", "label": "Städtische Architektur", "linked_head": 3, "color": "#2563eb", "icon": "🏛️", "explanation": "Wird aktiviert durch Head 3 (Orts-Kontext)." }
    ]
  },
  "phase_4_decoding": {
    "settings": {
      "default_temperature": 0.6,
      "default_noise": 0.0,
      "default_mlp_threshold": 0.5,
      "logit_bias_multiplier": 25
    },
    "top_k_tokens": [
      { "token": "und plant die Flucht.", "base_logit": 5.6, "category_link": "finance_crime" },
      { "token": "in der Mittagssonne.", "base_logit": 5.4, "category_link": "outdoor_furniture" },
      { "token": "am Hauptplatz.", "base_logit": 5.1, "category_link": "architecture" }
    ]
  }
}

```

## 4. Testplan: Szenarien & Experimente

**WICHTIG:** Klicke vor jedem Test auf das Token **[10] "."**. Du siehst nun Linien (Attention), die vom Punkt *zurück* zu den Bank-Tokens führen.

### Fall 1: Der Krimi (Default)

* **Experiment:**
* Head 1 (Crime): **Max (1.0)**
* Head 2 & 3: **Min (0.0)**


* **Beobachtung:**
* **Visuell:** Dicke Linie von `.` zu `Bank (1)`.
* **Phase 3:** Roter Balken ("Finanzdelikt") ist voll aktiv.


* **Ergebnis:** "und plant die Flucht." gewinnt (Base Logit 5.6 + Boost).

### Fall 2: Das Idyll (Interference Suppression)

* **Situation:** Das Wort "Bankräuber" ist ein starkes Störsignal.
* **Experiment (Strikte Reihenfolge):**
1. **Head 1 (Crime):** Stelle auf **Min (0.0)** (Wichtig! Bestraft den Krimi).
2. **Head 2 (Furniture):** Stelle auf **Max (1.0)**.
3. **Head 3:** Min (0.0).


* **Beobachtung:**
* **Visuell:** Grüne Linie von `.` zu `Bank (6)`.
* **Phase 3:** Grüner Balken ("Parkmobiliar") aktiv; Rot ist inaktiv.


* **Ergebnis:** "in der Mittagssonne." gewinnt.

### Fall 3: Der neutrale Ort

* **Experiment:**
* Head 1 & 2: **Min (0.0)**.
* Head 3 (Architecture): **Max (1.0)**.


* **Beobachtung:**
* **Visuell:** Blaue Linie von `.` zu `Bank (9)`.
* **Phase 3:** Blauer Balken ("Städtische Architektur") aktiv.


* **Ergebnis:** "am Hauptplatz." gewinnt.

### Fall 4: Struktur-Verlust (Patt)

* **Experiment:**
* Alle Heads auf **0.7**.
* **Position Weight:** Slider auf **0.0**.


* **Beobachtung:**
* **Visuell:** Linien werden chaotisch/unspezifisch.
* **Phase 3:** Diffuse Aktivierung.


* **Ergebnis:** Es gewinnt der Default (Krimi), da ohne klare Positionsdaten die semantische "Schwerkraft" des Wortes "Räuber" überwiegt.