const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// CORS-Middleware verwenden
app.use(cors());
app.use(express.json());

// Spieleranfangsgesundheit
let spielerGesundheit = 50;
let raumZaehler = 0;

// Event-Listen
const schatzKategorien = {
  waffen: ['Schwert', 'Axt', 'Bogen'],
  tränke: ['Heiltrank', 'Manatrank', 'Ausdauertrank'],
  artefakte: ['Amulett', 'Ring', 'Talisman'],
  rüstungen: ['Helm', 'Brustpanzer', 'Schild']
};

const gegner = ['Goblin', 'Ork', 'Troll', 'Skelett', 'Bandit'];
const fallenBeschreibungen = [
  'Du trittst auf eine Druckplatte und Pfeile werden ausgelöst, die dir {schaden} Schaden zufügen.',
  'Ein Netz fällt von oben herab und fängt dich ein, was dir {schaden} Schaden zufügt.',
  'Du trittst auf eine lose Bodenplatte und eine Giftwolke wird freigesetzt, die dir {schaden} Schaden zufügt.',
  'Eine Fallgrube öffnet sich unter dir und du fällst hinein, was dir {schaden} Schaden zufügt.'
];

// Funktion, um ein zufälliges Element aus einem Array zu erhalten
const zufälligesElement = (array) => array[Math.floor(Math.random() * array.length)];

// Funktion, um eine zufällige Zahl zwischen min und max (einschließlich) zu erhalten
const zufälligeZahl = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Funktion, um die Spieler-Gesundheit zurückzusetzen
const resetSpieler = () => {
  spielerGesundheit = 50;
  raumZaehler = 0;
};

// Endpoint für zufälliges Ereignis
app.get('/ereignis', (req, res) => {
  const schwierigkeit = parseInt(req.query.schwierigkeit);
  if (isNaN(schwierigkeit) || schwierigkeit < 1) {
    return res.status(400).send('Bitte geben Sie eine gültige Schwierigkeitsstufe an (1 oder höher).');
  }

  const multiplikator = 1 + schwierigkeit * 0.2;
  const ereignisTyp = zufälligesElement(['truhe', 'kampf', 'nichts', 'falle']);
  let ereignis;

  raumZaehler++;

  switch (ereignisTyp) {
    case 'truhe':
      const isMimic = Math.random() < 0.1; // 10% Chance, dass die Truhe eine Mimic ist
      if (isMimic) {
        // Kampf gegen Mimic
        const feind = 'Mimic';
        let feindGesundheit = zufälligeZahl(15, 20);
        const feindSchaden = zufälligeZahl(3, 5);
        let kampfLog = [];

        while (spielerGesundheit > 0 && feindGesundheit > 0) {
          // Spieler greift an
          const spielerSchaden = zufälligeZahl(3, 6);
          feindGesundheit -= Math.round(spielerSchaden);
          kampfLog.push(`Du greifst den ${feind} an und fügst ihm ${Math.round(spielerSchaden)} Schaden zu. (Feind Gesundheit: ${feindGesundheit > 0 ? feindGesundheit : 0})`);

          // Prüfen, ob der Gegner besiegt wurde
          if (feindGesundheit <= 0) {
            kampfLog.push(`Du hast den ${feind} besiegt!`);
            break;
          }

          // Mimic greift an
          spielerGesundheit -= Math.round(feindSchaden);
          spielerGesundheit = Math.max(spielerGesundheit, 0);
          kampfLog.push(`Der ${feind} greift dich an und fügt dir ${Math.round(feindSchaden)} Schaden zu. (Spieler Gesundheit: ${spielerGesundheit})`);

          // Prüfen, ob der Spieler besiegt wurde
          if (spielerGesundheit <= 0) {
            kampfLog.push('Du wurdest im Kampf besiegt!');
            resetSpieler();
            break;
          }
        }

        ereignis = {
          typ: 'kampf',
          feind: feind,
          feindGesundheit: feindGesundheit > 0 ? feindGesundheit : 0,
          spielerGesundheit: spielerGesundheit,
          kampfLog: kampfLog,
          raumZaehler: raumZaehler
        };
      } else {
        // Spieler findet einen Schatz in der Truhe
        const kategorie = zufälligesElement(Object.keys(schatzKategorien));
        const gegenstand = zufälligesElement(schatzKategorien[kategorie]);
        ereignis = {
          typ: 'schatz',
          kategorie: kategorie,
          gegenstand: gegenstand,
          beschreibung: `Du hast die Truhe geöffnet und einen ${gegenstand} gefunden.`,
          raumZaehler: raumZaehler
        };
      }
      break;
    case 'kampf':
      const feind = zufälligesElement(gegner);
      let feindGesundheit = Math.round(zufälligeZahl(10, 15) * multiplikator);
      const feindSchaden = zufälligeZahl(2, 4) * multiplikator;
      let kampfLog = [];

      while (spielerGesundheit > 0 && feindGesundheit > 0) {
        // Spieler greift an
        const spielerSchaden = zufälligeZahl(3, 6) * multiplikator;
        feindGesundheit -= Math.round(spielerSchaden);
        kampfLog.push(`Du greifst den ${feind} an und fügst ihm ${Math.round(spielerSchaden)} Schaden zu. (Feind Gesundheit: ${feindGesundheit > 0 ? feindGesundheit : 0})`);

        // Prüfen, ob der Gegner besiegt wurde
        if (feindGesundheit <= 0) {
          kampfLog.push(`Du hast den ${feind} besiegt!`);
          break;
        }

        // Gegner greift an
        spielerGesundheit -= Math.round(feindSchaden);
        spielerGesundheit = Math.max(spielerGesundheit, 0);
        kampfLog.push(`Der ${feind} greift dich an und fügt dir ${Math.round(feindSchaden)} Schaden zu. (Spieler Gesundheit: ${spielerGesundheit})`);

        // Prüfen, ob der Spieler besiegt wurde
        if (spielerGesundheit <= 0) {
          kampfLog.push('Du wurdest im Kampf besiegt!');
          resetSpieler();
          break;
        }
      }

      ereignis = {
        typ: 'kampf',
        feind: feind,
        feindGesundheit: feindGesundheit > 0 ? feindGesundheit : 0,
        spielerGesundheit: spielerGesundheit,
        kampfLog: kampfLog,
        raumZaehler: raumZaehler
      };
      break;
    case 'nichts':
      ereignis = {
        typ: 'nichts',
        beschreibung: 'Du hast nichts Interessantes gefunden.',
        raumZaehler: raumZaehler
      };
      break;
    case 'falle':
      const fallenSchaden = zufälligeZahl(1, 6) * multiplikator;
      spielerGesundheit -= Math.round(fallenSchaden);
      spielerGesundheit = Math.max(spielerGesundheit, 0);
      const fallenBeschreibung = zufälligesElement(fallenBeschreibungen).replace('{schaden}', Math.round(fallenSchaden));
      if (spielerGesundheit <= 0) {
        fallenBeschreibung += ' Du wurdest besiegt und deine Gesundheit wurde zurückgesetzt!';
        resetSpieler();
      }
      ereignis = {
        typ: 'falle',
        schaden: Math.round(fallenSchaden),
        beschreibung: fallenBeschreibung,
        spielerGesundheit: spielerGesundheit,
        raumZaehler: raumZaehler
      };
      break;
    default:
      ereignis = {
        typ: 'unbekannt',
        beschreibung: 'Ein unbekanntes Ereignis ist aufgetreten.',
        raumZaehler: raumZaehler
      };
  }

  res.json(ereignis);
});

// Server starten
app.listen(port, () => {
  console.log(`Text Adventure Server läuft unter http://localhost:${port}`);
});
