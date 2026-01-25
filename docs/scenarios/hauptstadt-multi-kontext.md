# Szenario-Dokumentation: Hauptstadt: Der Kontext-Mixer

## 1. Übersicht & Didaktik

* **ID:** `hauptstadt-multi-kontext-v02`
* **Prompt:** *"Die Hauptstadt von Deutschland ist..."*


**Lernziel:**
1. **Kontextuelle Polysemie:** Verstehen, wie ein und derselbe Satzanfang durch unterschiedliche Attention-Fokusse (Heads) völlig verschiedene semantische Pfade (Fakt vs. Wertung) einschlagen kann.
2. **Zeitliche Dimensionierung:** Lernen, wie das Modell durch spezifische Heads zwischen aktuellem "Weltwissen" (Berlin) und historischem "Archiv-Wissen" (Bonn) unterscheidet.
3. **Logit-Manipulation:** Nachvollziehen, wie die Aktivierung einer abstrakten Kategorie im Feed-Forward-Network (FFN) die Wahrscheinlichkeitsverteilung des nächsten Tokens mathematisch determiniert.



## 2. Technische Logik: Die Kausalitäts-Brücke

### Phase 1 (Embedding): Die Vektorraum-Kartierung

Die Tokens werden in einem 2D-Koordinatensystem verortet, um ihre semantische Natur zu definieren:

* **X-Achse (Inhalt vs. Funktion):** Trennt harte Fakten wie "Deutschland" und "Hauptstadt" (rechts, positiv) von funktionalen Syntax-Elementen wie "ist" und "von" (links, negativ).
* **Y-Achse (Autonomie vs. Abhängigkeit):** Unterscheidet zwischen Tokens, die Kontext suchen (z.B. der Artikel "Die", positiv), und solchen, die eine hohe semantische Dichte besitzen (z.B. "Deutschland", negativ).

### Phase 2 (Attention): Der Routing-Mechanismus

Hier entscheiden die Attention-Heads, welche Informationen verknüpft werden:

* **Head 3 (Geografie):** Verbindet "Deutschland" (Source) mit "Hauptstadt" (Target), um die aktuelle politische Definition abzurufen.
* **Head 4 (Geschichte):** Der Artikel "Die" (Source) blickt auf "Deutschland" (Target), um den historischen Kontext (Zeitachse) zu aktivieren.
* **Head 2 (Emotion):** Verknüpft das Konzept "Hauptstadt" (Source) mit dem Kopula-Verb "ist" (Target), um eine qualitative Bewertung vorzubereiten.
* **Head 1 (Sensorik & Distanz):** Scannt die Umgebung (von "ist" oder "von" ausgehend) nach physikalischen Attributen (Lärm) oder räumlicher Entfernung.

### Phase 3 (FFN): Die Kategorie-Aktivierung

Basierend auf dem stärksten Signal aus Phase 2 feuert das neuronale Netzwerk:

* Dominirt **Head 3**, aktiviert sich der **Fakten-Speicher** (Geografie).
* Dominirt **Head 4**, aktiviert sich das **Archiv-Wissen** (Geschichte).
* Dominirt **Head 2**, aktiviert sich die **Affektive Ebene** (Emotion).

### Phase 4 (Decoding): Der Logit-Shift

Die physische Wahrscheinlichkeit des nächsten Wortes wird durch den Bias berechnet. In diesem Szenario gilt der Multiplikator 16:

*  ist die Live-Aktivierung der Kategorie aus Phase 3 (0.0 bis 1.0).
* Ist eine Kategorie voll aktiv (), erhält das zugehörige Token (z.B. "Berlin") einen massiven Bonus von  auf den Logit.
* Ist sie inaktiv (), erhält das Token einen Malus von .

## 3. Szenario-JSON (`scenarios.json`)

```json
{
  "id": "hauptstadt-multi-kontext-v02",
  "name": "Hauptstadt: Der Kontext-Mixer",
  "input_prompt": "Die Hauptstadt von Deutschland ist...",
  "explanation": "Dieses Szenario demonstriert, wie ein Transformer-Modell zwischen faktischem Wissen, historischem Archiv-Wissen und subjektiven Bewertungen (Emotion/Sensorik) wechselt, je nachdem, welcher Attention-Pfad durch den Nutzer oder den Kontext verstärkt wird.",
  "phase_0_tokenization": {
    "tokens": [
      {
        "id": "0",
        "text": "Die",
        "explanation": "Bestimmter Artikel, Feminin. In diesem Kontext fungiert er als struktureller Anker. Linguistisch leitet er das Subjekt ein und dient im Modell oft als Träger für den übergeordneten Satz-Modus (z.B. historisch vs. aktuell)."
      },
      {
        "id": "1",
        "text": "Hauptstadt",
        "explanation": "Ein relationales Nomen, das zwingend eine Ergänzung (von X) erfordert. Es aktiviert im FFN-Layer komplexe Wissensstrukturen über Geografie, Verwaltung und nationale Identität."
      },
      {
        "id": "2",
        "text": "von",
        "explanation": "Präposition zur Einleitung des Genitiv-Attributs. Sie stellt die logische Verbindung zwischen dem Konzept 'Hauptstadt' und der spezifischen Entität 'Deutschland' her."
      },
      {
        "id": "3",
        "text": "Deutschland",
        "explanation": "Eigennamen-Entität. Dies ist der primäre Fakten-Anker im Vektorraum. Er liefert die notwendigen Koordinaten, um aus der allgemeinen Kategorie 'Hauptstadt' einen spezifischen geografischen Punkt zu extrahieren."
      },
      {
        "id": "4",
        "text": "ist",
        "explanation": "Kopula-Verb (Sein). Es dient als Prädikat und stellt die Äquivalenz zwischen dem Subjekt und dem kommenden Prädikatsnomen her. Im Decoding-Prozess ist dies der Moment der höchsten Entropie vor der Entscheidung."
      }
    ]
  },
  "phase_1_embedding": {
    "axis_map": {
      "x_axis": {
        "positive": "Fakten & Entitäten",
        "negative": "Syntax & Funktion",
        "description": "Die X-Achse trennt inhaltliche Ankerpunkte (Berlin, Deutschland) von rein funktionalen Sprachelementen (ist, von)."
      },
      "y_axis": {
        "positive": "Kontext-Abhängigkeit",
        "negative": "Semantische Dichte",
        "description": "Die Y-Achse zeigt, ob ein Token aktiv nach Informationen in der Umgebung sucht oder selbst eine abgeschlossene Bedeutung trägt."
      }
    },
    "token_vectors": [
      {
        "token_index": 0,
        "text": "Die",
        "base_vector": [
          -0.9,
          0.8
        ],
        "positional_vector": [
          -0.1,
          0.1
        ],
        "explanation": "Struktureller Artikel: Dient hier als primäre Quelle für den historischen Pfad (Head 4), um Zustände wie 'ehemalig' zu adressieren."
      },
      {
        "token_index": 1,
        "text": "Hauptstadt",
        "base_vector": [
          0.2,
          0.6
        ],
        "positional_vector": [
          0.1,
          -0.1
        ],
        "explanation": "Relationales Nomen: Besetzt eine zentrale Position im Vektorraum und wartet auf die Spezifizierung durch die 'Deutschland'-Entität."
      },
      {
        "token_index": 2,
        "text": "von",
        "base_vector": [
          -0.7,
          0.9
        ],
        "positional_vector": [
          -0.2,
          0.2
        ],
        "explanation": "Connector: Erzeugt ein starkes Signal für geografische Relationen und Distanzberechnungen (Head 1)."
      },
      {
        "token_index": 3,
        "text": "Deutschland",
        "base_vector": [
          0.95,
          -0.8
        ],
        "positional_vector": [
          0.3,
          -0.2
        ],
        "explanation": "Massive Entität: Liefert die höchste semantische Dichte und fungiert als Zielpunkt für fast alle Attention-Heads."
      },
      {
        "token_index": 4,
        "text": "ist",
        "base_vector": [
          -0.85,
          0.7
        ],
        "positional_vector": [
          -0.15,
          0.3
        ],
        "explanation": "Verb-Knoten: Erzeugt die Spannung für das nachfolgende Token und steuert via Head 1 sensorische Assoziationen (laut/schön)."
      }
    ]
  },
  "phase_2_attention": {
    "attention_profiles": [
      {
        "id": "mindset-selector",
        "label": "KI-Aufmerksamkeits-Fokus",
        "rules": [
          {
            "head": 3,
            "label": "geografie",
            "source": "3",
            "target": "1",
            "strength": 1.5,
            "explanation": "Fokussiert die geografische Identität. Die Entität 'Deutschland' sucht nach ihrer funktionalen Entsprechung 'Hauptstadt'."
          },
          {
            "head": 4,
            "label": "geschichte",
            "source": "0",
            "target": "3",
            "strength": 1.5,
            "explanation": "Aktiviert den Archiv-Modus. Der Artikel 'Die' blickt zurück auf die Geschichte der deutschen Entität."
          },
          {
            "head": 2,
            "label": "emotion",
            "source": "1",
            "target": "4",
            "strength": 1.5,
            "explanation": "Verschiebt den Fokus auf die ästhetische Bewertung des Konzepts 'Hauptstadt' durch das Kopula-Verb."
          },
          {
            "head": 1,
            "label": "sensorik",
            "source": "4",
            "target": "2",
            "strength": 1.5,
            "explanation": "Sucht nach unmittelbaren Umgebungseindrücken (Lärm, Licht) im Kontext der räumlichen Verbindung."
          },
          {
            "head": 1,
            "label": "distanz",
            "source": "2",
            "target": "3",
            "strength": 1.5,
            "explanation": "Berechnet die räumliche Entfernung zwischen dem Sprecherstandpunkt und der Entität Deutschland."
          }
        ]
      }
    ]
  },
  "phase_3_ffn": {
    "activations": [
      {
        "id": "geografie",
        "label": "Fakten-Speicher",
        "linked_head": 3,
        "color": "#10b981",
        "icon": "📚",
        "explanation": "Diese Wissens-Aktivierung greift auf den aktuellen geopolitischen Datensatz zu. Die Analyse ergibt eine Übereinstimmung zwischen der Entität Deutschland und dem Status von Berlin als Regierungssitz. Es handelt sich um ein rein faktisches Signal ohne subjektive Wertung."
      },
      {
        "id": "geschichte",
        "label": "Archiv-Wissen",
        "linked_head": 4,
        "color": "#8b5cf6",
        "icon": "⏳",
        "explanation": "Hier wird das historische Gedächtnis des Modells angesprochen. Der Kontext-Mixer erkennt, dass Deutschland eine geteilte Geschichte hat. Dies verschiebt die Wahrscheinlichkeit in Phase 4 zugunsten von Bonn, da der historische Head die zeitliche Dimension priorisiert."
      },
      {
        "id": "emotion",
        "label": "Affektive Ebene",
        "linked_head": 2,
        "color": "#ec4899",
        "icon": "💖",
        "explanation": "Die KI-Analyse wechselt hier von Fakten zu Empfindungen. Durch die Verknüpfung von 'Hauptstadt' und 'ist' werden ästhetische Prädikate aktiviert. Das Modell greift auf gängige menschliche Bewertungen über die Lebensqualität und Schönheit von Metropolen zu."
      },
      {
        "id": "sensorik",
        "label": "Umgebung/Lärm",
        "linked_head": 1,
        "color": "#f59e0b",
        "icon": "🚗",
        "explanation": "Dieses Cluster simuliert sensorisches Feedback. Die neuronale Interpretation konzentriert sich auf die physischen Eigenschaften einer Großstadt: Lärmbelastung, Verkehrsdichte und urbane Hektik. Es unterdrückt faktisches Wissen zugunsten von Adjektiven der Wahrnehmung."
      },
      {
        "id": "distanz",
        "label": "Geografische Distanz",
        "linked_head": 1,
        "color": "#6366f1",
        "icon": "📏",
        "explanation": "Berechnung der räumlichen Tiefe. Das Modell analysiert die Relation 'von Deutschland' als Indikator für eine geografische Entfernung zum implizierten Beobachter. Dies aktiviert Begriffe, die die Lage im Raum beschreiben."
      }
    ]
  },
  "phase_4_decoding": {
    "settings": {
      "default_temperature": 0.7,
      "default_noise": 0.0,
      "default_mlp_threshold": 0.5,
      "logit_bias_multiplier": 16
    },
    "top_k_tokens": [
      {
        "token": "Berlin",
        "base_logit": 5.2,
        "category_link": "geografie"
      },
      {
        "token": "Bonn",
        "base_logit": 5.0,
        "category_link": "geschichte"
      },
      {
        "token": "schön",
        "base_logit": 4.8,
        "category_link": "emotion"
      },
      {
        "token": "laut",
        "base_logit": 4.6,
        "category_link": "sensorik"
      },
      {
        "token": "weit weg",
        "base_logit": 4.7,
        "category_link": "distanz"
      }
    ]
  }
}

```

## 4. Testplan: Szenarien & Experimente

### ### Fall 1: Der aktuelle Fakten-Check

* **Situation:** Simulation einer Standard-Suchanfrage ("Was ist die Hauptstadt?"). Das Modell soll rein faktisch antworten.
* **Experiment (UI-Eingriff):**
* Setze **Head 3 (Geografie)** auf `1.0` (Max).
* Setze Head 1, 2 und 4 auf `0.0`.
* `Position Weight` auf Standard (`1.0`).


* **Beobachtung (Phase 3):** Die Kategorie **"Fakten-Speicher"** leuchtet in **Grün (#10b981)** auf. Das Icon 📚 erscheint.
* **Ergebnis (Phase 4):** Das Token **"Berlin"** gewinnt. Durch die volle Aktivierung erhält es einen Logit-Boost von  (da ). Andere Tokens fallen stark zurück.

### ### Fall 2: Der historische Rückblick

* **Situation:** Der Kontext impliziert eine historische Betrachtung ("Früher war...").
* **Experiment (UI-Eingriff):**
* Setze **Head 4 (Geschichte)** auf `1.0` (Max).
* Reduziere Head 3 (Geografie) auf `0.0`.


* **Beobachtung (Phase 3):** Die Kategorie **"Archiv-Wissen"** aktiviert sich in **Violett (#8b5cf6)**. Das Icon ⏳ wird sichtbar.
* **Ergebnis (Phase 4):** Das Token **"Bonn"** übernimmt die Führung. Obwohl "Berlin" ein höheres Base-Logit hat (5.2 vs 5.0), sorgt der massive Shift durch den Kategorie-Link "geschichte" dafür, dass Bonn gewählt wird.

### ### Fall 3: Die subjektive Wahrnehmung

* **Situation:** Der Satz wird nicht als Fakt, sondern als Meinung oder Beschreibung verstanden.
* **Experiment (UI-Eingriff):**
* Setze **Head 2 (Emotion)** auf `1.0`.
* Alle anderen Heads auf `0.0`.


* **Beobachtung (Phase 3):** Die **"Affektive Ebene"** (Pink, 💖) leuchtet auf.
* **Ergebnis (Phase 4):** Das Adjektiv **"schön"** gewinnt. Das Modell vervollständigt den Satz zu "Die Hauptstadt von Deutschland ist schön". Fakten werden irrelevant.

### ### Fall 4: Sensorischer Overload (Konflikt)

* **Situation:** Das Modell achtet auf physische Attribute und Distanz.
* **Experiment (UI-Eingriff):**
* Setze **Head 1 (Sensorik/Distanz)** auf `1.0`.


* **Beobachtung (Phase 3):** Hier leuchten **zwei** Kategorien gleichzeitig auf: **"Umgebung/Lärm"** (Orange 🚗) und **"Geografische Distanz"** (Indigo 📏), da beide an Head 1 gekoppelt sind.
* **Ergebnis (Phase 4):** Es entsteht ein enges Rennen zwischen **"weit weg"** (Base Logit 4.7) und **"laut"** (Base Logit 4.6). Da beide den Boost erhalten, gewinnt knapp **"weit weg"**, gefolgt von "laut". "Berlin" fällt weit zurück.

## 5. UI/UX & Besonderheiten

* **Visuelles Feedback (Phase 3):**
* 📚 **Grün (#10b981):** Fakten/Geografie
* ⏳ **Violett (#8b5cf6):** Geschichte/Zeit
* 💖 **Pink (#ec4899):** Emotion/Wertung
* 🚗 **Orange (#f59e0b):** Sensorik/Lärm
* 📏 **Indigo (#6366f1):** Distanz


* **Besonderheiten der Achsen (Phase 1):**
* Die **X-Achse** dient hier primär der Trennung von *Weltwissen* (Berlin, Deutschland) und *Grammatik* (ist, von).
* Die Tokens "Die" und "Deutschland" liegen auf der **Y-Achse** weit auseinander (-0.9 vs +0.95 auf X, aber auch strukturell getrennt), was die unterschiedlichen Zugriffspfade (Head 4 vs Head 3) im Vektorraum plausibilisiert.


* **Logit-Bias-Faktor:**
* In diesem Szenario ist der Multiplikator auf **16** eingestellt (höher als der Standard von 12). Dies sorgt für extrem scharfe Entscheidungen ("Winner-takes-all"), sobald ein Head eine Schwelle überschreitet.
