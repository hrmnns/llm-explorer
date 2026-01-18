# Szenario-Dokumentation: Mehrdeutigkeit (Das Schloss)

## 1. Übersicht & Didaktik

**ID:** `polysemie-schloss-labor`

**Prompt:** *"Das Schloss war für den Einbrecher kein Hindernis."*

### Lernziel

Dieses Szenario ist das Herzstück der Demo für **vertikale Kausalität**. Nutzer lernen:

1. Wie die Aufmerksamkeit (Phase 2) zwischen einem Akteur ("Einbrecher") und einem Objekt ("Schloss") die Bedeutung des Objekts selektiert.
2. Wie diese Auswahl in Phase 3 das entsprechende Weltwissen (Funktional vs. Akademisch) aktiviert.
3. Wie die **Positions-Vektoren** den Satzbau stabilisieren, damit das Modell weiß, *wer* das Hindernis überwindet.

## 2. Technische Logik: Die Kausalitäts-Brücke

1. **Phase 1 (Embedding):** Die Tokens werden räumlich getrennt. Ohne **Position Weight** (Slider auf 0.0) verschwimmt die Relation zwischen Subjekt und Objekt.
2. **Phase 2 (Attention):** * **Head 3 (Logik):** Verknüpft "Schloss" (ID 1) mit "Einbrecher" (ID 5).

  * **Head 1 (Semantik):** Verknüpft "Schloss" mit sich selbst oder dem abstrakten Begriff "Hindernis" (Architektur-Fokus).

3. **Phase 3 (FFN):** Die Aktivierung nutzt die generische Verknüpfung:
  * `Funktional`  **Head 3** (Mechanik/Sicherheit).
  * `Akademisch`  **Head 1** (Architektur/Bauwerk).


4. **Phase 4 (Decoding):** Die physikalische Wahrscheinlichkeit wird verschoben. Ist "Funktional" aktiv, dominiert "Türschloss". Ist nur "Akademisch" aktiv, gewinnt "Prachtbau".

## 3. Vollständiges Szenario-JSON (`scenarios.json`)

```json
{
  "id": "polysemie-schloss-labor",
  "name": "Mehrdeutigkeit: Das Schloss",
  "input_prompt": "Das Schloss war für den Einbrecher kein Hindernis.",
  "explanation": "Steuerung: Head 3 (Logik/Mechanik) vs. Head 1 (Semantik/Bauwerk).",
  "phase_0_tokenization": {
    "tokens": [
      { "id": "0", "text": "Das" }, { "id": "1", "text": "Schloss" }, { "id": "2", "text": "war" },
      { "id": "3", "text": "für" }, { "id": "4", "text": "den" }, { "id": "5", "text": "Einbrecher" },
      { "id": "6", "text": "kein" }, { "id": "7", "text": "Hindernis" }
    ]
  },
  "phase_1_embedding": {
    "token_vectors": [
      { "token_index": 0, "base_vector": [0.1, 0.1], "positional_vector": [-0.5, 0.0] },
      { "token_index": 1, "base_vector": [0.5, 0.5], "positional_vector": [-0.3, 0.0] },
      { "token_index": 5, "base_vector": [0.8, 0.7], "positional_vector": [0.3, 0.0] },
      { "token_index": 7, "base_vector": [0.1, 0.1], "positional_vector": [0.6, 0.0] }
    ]
  },
  "phase_2_attention": {
    "attention_profiles": [
      {
        "id": "context-check",
        "label": "Kontext-Analyse",
        "rules": [
          { "head": 1, "source": "1", "target": "7", "strength": 1.2 },
          { "head": 3, "source": "1", "target": "5", "strength": 1.4 }
        ]
      }
    ]
  },
"phase_3_ffn": {
    "activation_profiles": [
      {
        "id": "context-profile",
        "ref_profile_id": "context-check",
        "activations": [
          { 
            "label": "Funktional", 
            "activation": 0.50, 
            "linked_head": 3, 
            "color": "#10b981",
            "icon": "⚙️",
            "target_tokens": ["Türschloss", "Sperrvorrichtung", "Schlüssel"] 
          },
          { 
            "label": "Akademisch", 
            "activation": 0.50, 
            "linked_head": 1, 
            "color": "#3b82f6",
            "icon": "🏛️",
            "target_tokens": ["Prachtbau", "Residenz", "Burg"] 
          }
        ]
      }
    ]
  },
  "phase_4_decoding": {
    "outputs": [
      { "label": "Türschloss", "logit": 5.0, "type": "Funktional" },
      { "label": "Prachtbau", "logit": 5.0, "type": "Akademisch" }
    ]
  }
}

```

## 4. Testplan & Erwartete Ergebnisse

### **Testfall SCHLOSS-01: Fokus Mechanik**

* **Ziel:** Validierung der funktionalen Interpretation (Türschloss).
* **Eingriff:** * Position Weight: `1.0`
* **Head 3 (Logik):** auf `Max` schieben
* **Head 1 (Semantik):** auf `Min (0.1)` reduzieren

* **Beobachtung Phase 3:** Die Kategorie **Funktional** leuchtet grün auf (~36-40%), während *Akademisch* ausgegraut bleibt.
* **Ergebnis Phase 4:** Das Wort **"Türschloss"** gewinnt die Vorhersage (🎯-Icon).

### **Testfall SCHLOSS-02: Fokus Architektur**

* **Ziel:** Validierung der baulichen Interpretation (Prachtbau).
* **Eingriff:** * Position Weight: `1.0`
* **Head 1 (Semantik):** auf `Max` schieben
* **Head 3 (Logik):** auf `Min (0.1)` reduzieren

* **Beobachtung Phase 3:** Die Kategorie **Akademisch** leuchtet blau auf (~36-40%), während *Funktional* ausgegraut bleibt.
* **Ergebnis Phase 4:** Das Wort **"Prachtbau"** übernimmt die Führung im Decoder.

### **Testfall SCHLOSS-03: Das Dilemma (Patt)**
* **Ziel:** Demonstration von Unentschiedenheit und der Sensitivität des Decoders.
* **Eingriff:** 
  * Position Weight: 1.0
  * Heads: Versuche, Head 1 (Semantik) und Head 3 (Logik) so zu balancieren, dass in Phase 3 beide Kategorien (Funktional & Akademisch) exakt die gleiche Aktivierung (z. B. beide 0.85) anzeigen.
  * Decoder-Einstellung: Erhöhe die Temperature auf 1.5 - 2.0.
* Beobachtung Phase 3: Beide Kategorien leuchten hell und gleichmäßig. Im Simulator-State sind die activation-Werte nahezu identisch.
* Ergebnis Phase 4: Durch die erhöhte Temperatur wird die exponentielle Dominanz gebrochen. Die Wahrscheinlichkeiten verteilen sich nun flacher (z. B. 55% zu 45%).
* Interaktion: Nutze nun den 🎲 Re-Sample Button. Da kein Token eine absolute Dominanz hat, wird das Modell nun sichtbar zwischen "Türschloss" und "Prachtbau" hin- und herwürfeln.

### **Testfall SCHLOSS-04: Semantische Resilienz vs. Strukturverlust**

* **Ziel:** Demonstration der Robustheit semantischer Verknüpfungen gegenüber strukturellem Chaos.
* **Eingriff:**
  1. **Position Weight:** `0.0` (Grammatik/Reihenfolge wird gelöscht).
  2. **Noise (Phase 1):** auf `1.0`.
  3. **Temperature (Phase 4):** auf `1.5`.


* **Beobachtung:** Obwohl die räumliche Ordnung zerstört ist und die Token-Vektoren durch das Rauschen "tanzen", bleibt die Verbindung zwischen "Schloss" und "Einbrecher" über Head 3 stabil.
* **Ergebnis:** Das Modell zeigt eine beeindruckende **Resilienz**. "Türschloss" gewinnt weiterhin deutlich (ca. 90%), da die semantische Attraktion stärker wiegt als die strukturelle Ordnung.
* **Didaktischer Hinweis:** Dies zeigt, dass moderne LLMs oft "begreifen", worum es geht, selbst wenn der Satzbau fehlerhaft oder das Signal gestört ist. Um einen echten Kollaps zu erzwingen, müssten die Logik-Heads in Phase 2 manuell reduziert werden.


### **Durchführungshinweise**

1. **Voraussetzung:** Laden des Szenarios `polysemie-schloss-labor` aus der `scenarios.json`.
2. **Selektion:** Klicke in Phase 2 auf das Token **"Schloss" (ID 1)**, um die Aufmerksamkeit dieses Wortes zu steuern.
3. **Inspektor:** Nutze den Inspektor in Phase 4, um den `Logit-Shift` zu kontrollieren. Er muss dem Gewicht der gewählten FFN-Kategorie folgen.

## 5. UI/UX Dokumentation

* **Kausalitäts-Trace:** Beim Auswählen von "Türschloss" in Phase 4 zeigt der Inspektor die Kette: `Einbrecher (ID 5) -> Head 3 (Logik) -> Funktional -> Boost`.
* **Visualisierung:** In Phase 2 sieht man beim Klick auf "Schloss" (ID 1) zwei distinkte Attention-Linien: Eine grüne (Head 3) zum "Einbrecher" und eine blaue (Head 1) zum "Hindernis".
* **Interaktives MLP-Gate:** Nutzer können beobachten, wie eine Kategorie erst farbig wird, wenn der Slider-Einfluss die Aktivierung über die 20%-Hürde hebt.



