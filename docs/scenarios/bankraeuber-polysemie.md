# Szenario-Dokumentation: Die dreifache Bank: Kontext-Analyse

## 1. Übersicht & Didaktik

* **ID:** `bankraeuber-polysemie-v01`
* **Prompt:** *"Der Bankräuber sitzt auf einer Bank vor der Bank."*

**Lernziele:**
1. **Polysemie-Auflösung:** Verstehen, wie ein Modell identische Wörter ("Bank") basierend auf ihrem unmittelbaren Kontext (Räuber, auf, vor) unterschiedlichen semantischen Feldern zuordnet.
2. **Positional Encoding:** Erkennen, wie identische Tokens durch Positionsvektoren unterscheidbar gemacht werden, um spezifische Attention-Verbindungen zu ermöglichen.
3. **Attention-Steuerung:** Lernen, wie die Gewichtung spezifischer Attention-Heads den Ausgang der Generierung (Kriminalgeschichte vs. Idyll vs. Stadtbeschreibung) determiniert.



## 2. Technische Logik: Die Kausalitäts-Brücke

### Phase 1 (Embedding)

In dieser Phase werden die Tokens in einem 2D-Vektorraum verortet. Das Szenario nutzt ein spezifisches Koordinatensystem:

* **X-Achse (Semantik):** Unterscheidet zwischen "Abstrakt & Finanziell" (positiver Bereich) und "Physisch & Greifbar" (negativer Bereich).
* **Y-Achse (Dynamik):** Unterscheidet zwischen "Aktion & Dynamik" (positiv) und "Statik & Ort" (negativ).
* **Besonderheit:** Die drei Instanzen des Tokens "Bank" (ID 1, 6, 9) haben identische Basis-Vektoren, werden aber durch ihre `positional_vector` Werte leicht versetzt, was sie für die Attention-Heads in Phase 2 adressierbar macht.

### Phase 2 (Attention)

Die `rules` definieren, wie der Kontext die Bedeutung selektiert:

* **Head 1 (finance_crime):** Zieht Informationen vom Source-Token **"räuber" (2)** zum Target-Token **"Bank" (1)**. Dies aktiviert die finanzielle Lesart.
* **Head 2 (outdoor_furniture):** Verbindet die Präposition **"auf" (4)** mit **"Bank" (6)**. Dies erzwingt die Interpretation als Sitzmöbel.
* **Head 3 (architecture):** Verknüpft die Präposition **"vor" (7)** mit **"Bank" (9)**. Dies deutet das Wort als Gebäude/Ort.

### Phase 3 (FFN)

Das Feed-Forward Network reagiert auf die Attention-Gewichte. Durch die `linked_head`-Logik wird das Weltwissen aktiviert:

* Dominiert Head 1, feuert das Neuron **"Finanzdelikt"**.
* Dominiert Head 2, feuert das Neuron **"Parkmobiliar"**.
* Dominiert Head 3, feuert das Neuron **"Städtische Architektur"**.

### Phase 4 (Decoding)

Im Decoder wird die Wahrscheinlichkeit der nächsten Tokens (Logits) basierend auf der aktiven FFN-Kategorie verschoben.
Die Verstärkung erfolgt nach der Formel:



Wobei  die Aktivierung der Kategorie (0.0 bis 1.0) ist. Eine hohe Aktivierung (z.B. 1.0) führt zu einem positiven Bias (), der das assoziierte Token (z.B. "und plant die Flucht") massiv begünstigt. Eine niedrige Aktivierung (< 0.5) führt zu einer Bestrafung (negativer Bias), die das Token unterdrückt.

## 3. Szenario-JSON (`scenarios.json`)

```json
{
  "id": "bankraeuber-polysemie-v01",
  "name": "Die dreifache Bank: Kontext-Analyse",
  "input_prompt": "Der Bankräuber sitzt auf einer Bank vor der Bank.",
  "explanation": "Dieses Szenario demonstriert die Auflösung extremer Polysemie. Drei identische Token 'Bank' werden durch Positional Encoding unterscheidbar gemacht und durch Attention in völlig unterschiedliche semantische Bereiche verschoben.",
  "phase_0_tokenization": {
    "tokens": [
      {
        "id": "0",
        "text": "Der",
        "explanation": "Der bestimmte Artikel im Nominativ Maskulin. Er fungiert hier als Determiner für das komplexe Subjekt. In der Tokenisierung wird er oft als Startpunkt für die syntaktische Abhängigkeitsanalyse genutzt."
      },
      {
        "id": "1",
        "text": "Bank",
        "explanation": "Die erste Instanz des Polysems 'Bank'. Ohne Kontext ist sie semantisch unterbestimmt. Da sie jedoch direkt mit 'räuber' verknüpft wird, findet eine morphologische Attraktion zum Finanzwesen statt."
      },
      {
        "id": "2",
        "text": "räuber",
        "explanation": "Das semantisch dominante Token des Subjekts. Es aktiviert im neuronalen Netzwerk sofort Cluster, die mit Kriminalität, Agitator-Rollen und dem Entzug von Werten assoziiert sind."
      },
      {
        "id": "3",
        "text": "sitzt",
        "explanation": "Ein statisches Verb, das eine räumliche Relation zwischen dem Agens (Räuber) und einem Lokativ (auf einer Bank) fordert. Es erzeugt eine Erwartungshaltung für ein physisches Objekt im Vektorraum."
      },
      {
        "id": "4",
        "text": "auf",
        "explanation": "Eine lokale Präposition, die einen Kontakt zu einer Oberfläche impliziert. Linguistisch gesehen ist dies der 'Trigger', der das nachfolgende Token 'Bank' in den Bereich des Mobiliars zwingt."
      },
      {
        "id": "5",
        "text": "einer",
        "explanation": "Ein unbestimmter Artikel im Dativ. Er signalisiert dem Modell, dass ein neues, bisher nicht erwähntes physisches Objekt in den Kontext eingeführt wird."
      },
      {
        "id": "6",
        "text": "Bank",
        "explanation": "Die zweite Instanz. Durch die unmittelbare Nähe zur Präposition 'auf' wird der Vektor in Phase 2 stark in Richtung der physischen, greifbaren Objekte verschoben."
      },
      {
        "id": "7",
        "text": "vor",
        "explanation": "Eine relationale Präposition, die eine räumliche Nähe beschreibt. Sie dient hier als Brücke, um die Szenerie von einem punktuellen Objekt (Parkbank) zu einem größeren architektonischen Kontext (Gebäude) zu erweitern."
      },
      {
        "id": "8",
        "text": "der",
        "explanation": "Bestimmter Artikel im Dativ. Im Gegensatz zu 'einer' (Token 5) impliziert 'der' hier eine Bekanntheit oder Einzigartigkeit des Objekts im weiteren Kontext der Erzählung."
      },
      {
        "id": "9",
        "text": "Bank",
        "explanation": "Die dritte Instanz. Sie steht am Ende der Kausalkette. Da der Räuber 'vor' ihr sitzt, wird dieses Token als massives, ortsfestes Gebäude interpretiert, das den institutionellen Rahmen der Szene bildet."
      },
      {
        "id": "10",
        "text": ".",
        "explanation": "Satzende-Marker. Er signalisiert dem Decoder, dass die semantische Integration der vorangegangenen Tokens abgeschlossen ist und die Wahrscheinlichkeitsverteilung für den nächsten Satz berechnet werden kann."
      }
    ]
  },
  "phase_1_embedding": {
    "axis_map": {
      "x_axis": {
        "positive": "Abstrakt & Finanziell",
        "negative": "Physisch & Greifbar",
        "description": "Die X-Achse trennt die funktionale Welt des Geldes (Kreditinstitute) von der materiellen Welt der Objekte (Möbel)."
      },
      "y_axis": {
        "positive": "Aktion & Dynamik",
        "negative": "Statik & Ort",
        "description": "Die Y-Achse unterscheidet zwischen handelnden Subjekten/Prozessen und festen, unbeweglichen Verortungen im Raum."
      }
    },
    "token_vectors": [
      {
        "token_index": 0,
        "text": "Der",
        "base_vector": [
          -0.5,
          0.0
        ],
        "positional_vector": [
          0.0,
          0.1
        ],
        "explanation": "Grammatischer Wegweiser. Das Positional Encoding markiert die Startposition der Sequenz."
      },
      {
        "token_index": 1,
        "text": "Bank (1)",
        "base_vector": [
          0.8,
          -0.4
        ],
        "positional_vector": [
          0.05,
          0.09
        ],
        "explanation": "Finanz-Kontext. Das Modell platziert dieses Token initial im abstrakten Quadranten."
      },
      {
        "token_index": 2,
        "text": "räuber",
        "base_vector": [
          0.3,
          0.9
        ],
        "positional_vector": [
          0.1,
          0.08
        ],
        "explanation": "Akteur-Token. Besetzt den dynamischen Quadranten durch die implizierte Handlungskraft (Y+)."
      },
      {
        "token_index": 3,
        "text": "sitzt",
        "base_vector": [
          -0.2,
          0.6
        ],
        "positional_vector": [
          0.15,
          0.07
        ],
        "explanation": "Zustandsverb. Es sucht im Vektorraum nach einer Unterlage für die physische Positionierung."
      },
      {
        "token_index": 4,
        "text": "auf",
        "base_vector": [
          -0.7,
          -0.1
        ],
        "positional_vector": [
          0.2,
          0.06
        ],
        "explanation": "Räumlicher Connector. Zieht nachfolgende Tokens in den Bereich der physischen Interaktion."
      },
      {
        "token_index": 5,
        "text": "einer",
        "base_vector": [
          -0.4,
          0.0
        ],
        "positional_vector": [
          0.25,
          0.05
        ],
        "explanation": "Artikel zur Objekt-Einleitung im physischen Raum."
      },
      {
        "token_index": 6,
        "text": "Bank (2)",
        "base_vector": [
          0.8,
          -0.4
        ],
        "positional_vector": [
          0.3,
          0.04
        ],
        "explanation": "Identische Basis wie [1], aber das PE signalisiert eine räumlich getrennte, neue Entität."
      },
      {
        "token_index": 7,
        "text": "vor",
        "base_vector": [
          -0.6,
          -0.2
        ],
        "positional_vector": [
          0.35,
          0.03
        ],
        "explanation": "Relations-Token für die Umgebung. Es bereitet den Raum für eine architektonische Einordnung vor."
      },
      {
        "token_index": 8,
        "text": "der",
        "base_vector": [
          -0.5,
          0.0
        ],
        "positional_vector": [
          0.4,
          0.02
        ],
        "explanation": "Bestimmter Artikel, der eine spezifische Referenz im Weltwissen des Modells anspricht."
      },
      {
        "token_index": 9,
        "text": "Bank (3)",
        "base_vector": [
          0.8,
          -0.4
        ],
        "positional_vector": [
          0.45,
          0.01
        ],
        "explanation": "Dritte Instanz. Durch die Satzposition und die Präposition 'vor' wird ein massives Objekt erwartet."
      },
      {
        "token_index": 10,
        "text": ".",
        "base_vector": [
          0.0,
          -1.0
        ],
        "positional_vector": [
          0.5,
          0.0
        ],
        "explanation": "Stopp-Signal. Es schließt die semantische Energie des aktuellen Satzes ab."
      }
    ]
  },
  "phase_2_attention": {
    "attention_profiles": [
      {
        "id": "triple-context-resolver",
        "label": "Polysemie-Entwirrung",
        "rules": [
          {
            "head": 1,
            "label": "finance_crime",
            "source": "2",
            "target": "1",
            "strength": 2.0
          },
          {
            "head": 2,
            "label": "outdoor_furniture",
            "source": "4",
            "target": "6",
            "strength": 1.8
          },
          {
            "head": 3,
            "label": "architecture",
            "source": "7",
            "target": "9",
            "strength": 1.5
          }
        ]
      }
    ]
  },
  "phase_3_ffn": {
    "activations": [
      {
        "id": "finance_crime",
        "label": "Finanzdelikt",
        "linked_head": 1,
        "color": "#dc2626",
        "icon": "💸",
        "explanation": "Diese Wissens-Kategorie wird aktiviert, wenn das Token 'Bank' semantisch mit einem Täter-Token wie 'Räuber' verschmilzt. Die neuronale Analyse erkennt hier keine Sitzgelegenheit, sondern ein Zielobjekt für eine kriminelle Handlung innerhalb des Wirtschaftssystems."
      },
      {
        "id": "outdoor_furniture",
        "label": "Parkmobiliar",
        "linked_head": 2,
        "color": "#16a34a",
        "icon": "🌳",
        "explanation": "Die Kombination aus der Präposition 'auf' und dem Verb 'sitzen' triggert dieses Wissens-Cluster. Es repräsentiert das Konzept von hölzernen oder metallischen Sitzgelegenheiten im öffentlichen Raum. Die abstrakte Bank-Bedeutung wird hier fast vollständig unterdrückt."
      },
      {
        "id": "architecture",
        "label": "Städtische Architektur",
        "linked_head": 3,
        "color": "#2563eb",
        "icon": "🏛️",
        "explanation": "Dieses Cluster reagiert auf räumliche Lagebeschreibungen von großen Objekten. Wenn etwas 'vor' einer Bank geschieht, identifiziert das MLP-Layer das Gebäude als architektonischen Fixpunkt. Es aktiviert Wissen über Fassaden, Institutionen und Stadtplanung."
      }
    ]
  },
  "phase_4_decoding": {
    "settings": {
      "default_temperature": 0.6,
      "default_noise": 0.0,
      "default_mlp_threshold": 0.5,
      "logit_bias_multiplier": 20
    },
    "top_k_tokens": [
      {
        "token": "und plant die Flucht.",
        "base_logit": 5.9,
        "category_link": "finance_crime"
      },
      {
        "token": "in der Mittagssonne.",
        "base_logit": 5.4,
        "category_link": "outdoor_furniture"
      },
      {
        "token": "am Hauptplatz.",
        "base_logit": 5.1,
        "category_link": "architecture"
      }
    ]
  }
}

```

## 4. Testplan: Szenarien & Experimente

### Fall 1: Der kriminelle Fokus (Finanz-Narrativ)

* **Situation:** Der Fokus liegt vollständig auf der Handlung des Räubers und der Bank als Finanzinstitut. Die physische Umgebung wird ignoriert.
* **Experiment (UI-Eingriff):**
* Setze **Head 1 (finance_crime)** auf **Max (1.0)**.
* Setze **Head 2** und **Head 3** auf **Min (0.0)**.
* Stelle den `Position Weight` Slider auf Standard (1.0), um die semantische Bindung an "räuber" zu gewährleisten.


* **Beobachtung (Phase 3):**
* Die Kategorie **"Finanzdelikt"** leuchtet in **Rot (#dc2626)** auf.
* Das Icon 💸 wird angezeigt.


* **Ergebnis (Phase 4):**
* Das Token **"und plant die Flucht."** gewinnt.
* Durch die hohe Aktivierung von Head 1 erhält dieses Token einen massiven Logit-Boost, während idyllische oder architektonische Fortsetzungen unterdrückt werden.

### Fall 2: Die Idylle (Möbel-Fokus)

* **Situation:** Das Modell ignoriert die kriminelle Absicht und fokussiert sich rein auf den physischen Akt des Sitzens im Freien.
* **Experiment (UI-Eingriff):**
* Setze **Head 2 (outdoor_furniture)** auf **Max (1.0)**.
* Setze **Head 1** und **Head 3** auf **Min (0.0)**.


* **Beobachtung (Phase 3):**
* Die Kategorie **"Parkmobiliar"** leuchtet in **Grün (#16a34a)** auf.
* Das Icon 🌳 dominiert.


* **Ergebnis (Phase 4):**
* Das Token **"in der Mittagssonne."** übernimmt die Führung.
* Der Kontext "auf einer Bank" überschreibt die Bedeutung "Bankräuber", da die Aufmerksamkeit nur auf dem Sitzen liegt.



### Fall 3: Der Stadtplaner (Architektur-Fokus)

* **Situation:** Die Szene wird als rein räumliches Arrangement interpretiert; der Räuber wird zur bloßen Figur vor einer Kulisse.
* **Experiment (UI-Eingriff):**
* Setze **Head 3 (architecture)** auf **Max (1.0)**.
* Setze **Head 1** und **Head 2** auf **Min (0.0)**.


* **Beobachtung (Phase 3):**
* Die Kategorie **"Städtische Architektur"** leuchtet in **Blau (#2563eb)** auf.
* Das Icon 🏛️ erscheint.


* **Ergebnis (Phase 4):**
* Das Token **"am Hauptplatz."** gewinnt.
* Die Erzählung zoomt heraus und beschreibt den Ort ("vor der Bank") anstelle der Handlung.



### Fall 4: Kontext-Kollaps (Struktur-Verlust)

* **Situation:** Wir entfernen die Positionsinformation. Das Modell kann nicht mehr unterscheiden, welches "Bank"-Token mit welchem Kontextwort ("räuber", "auf", "vor") verbunden ist.
* **Experiment (UI-Eingriff):**
* Setze alle Heads (1, 2, 3) auf **Medium (0.5)**.
* Setze den `Position Weight` Slider auf **0.0**.


* **Beobachtung (Phase 3):**
* Alle Kategorien flackern oder zeigen eine niedrige, diffuse Aktivierung, da die Attention-Heads ihre Ziele (Target 1, 6, 9) nicht mehr sauber lokalisieren können.


* **Ergebnis (Phase 4):**
* Es entsteht ein **Patt** oder eine Dominanz des Tokens mit dem höchsten `base_logit` (**"und plant die Flucht."**), jedoch mit deutlich geringerer Wahrscheinlichkeit (hohe Entropie), da der selektive Boost fehlt. Das Modell "halluziniert" möglicherweise eine Mischung der Kontexte.



## 5. UI/UX & Besonderheiten

* **Farbcodes (Phase 3):**
* 🔴 Rot (#dc2626) für Finanz/Verbrechen
* 🟢 Grün (#16a34a) für Möbel/Natur
* 🔵 Blau (#2563eb) für Architektur/Ort


* **Icons:** 💸 (Finanz), 🌳 (Park), 🏛️ (Gebäude).
* **Achsenbeschriftungen (Phase 1):**
* X: Abstrakt/Finanz ()  Physisch/Greifbar ()
* Y: Aktion/Dynamik ()  Statik/Ort ()


* **Besonderheit:** Beachte die **Token 1, 6 und 9**. Sie haben denselben Text ("Bank") und denselben `base_vector`, aber unterschiedliche Positionen im Satz. Nur durch die `positional_vector`-Werte in Phase 1 können die Attention-Heads in Phase 2 spezifisch auf "die Bank, auf der man sitzt" vs. "die Bank, die ausgeraubt wird" zugreifen.
