const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// CORS-Middleware verwenden
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// Spieleranfangsgesundheit
let spielerGesundheit = 50;
let raumZaehler = 0;

//########################################################################
                                //Dungeon
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


//#################################################################################
                              //Inventory

// Beispielhafte Inventar-Items

let inventoryItems = [
  { id: 1, name: 'Schwert', strength: 10, category: 'equipment', type: 'weapon' },
  { id: 2, name: 'Schild', strength: 8, category: 'equipment', type: 'armor' },
  { id: 3, name: 'Heiltrank', strength: 15, category: 'consumable' },
  { id: 4, name: 'Bogen', strength: 7, category: 'equipment', type: 'weapon' },
  { id: 5, name: 'Kopfschutz', strength: 3, category: 'equipment', type: 'armor' },
  { id: 6, name: 'Rüstung', strength: 12, category: 'equipment', type: 'armor' },
  { id: 7, name: 'Gold', strength: 1, category: 'misc' },
  { id: 8, name: 'Schmuck', strength: 2, category: 'misc' },
  { id: 9, name: 'Schaufel', strength: 4, category: 'equipment' },
  { id: 10, name: 'Draht', strength: 2, category: 'misc' },
  { id: 11, name: 'Feder', strength: 1, category: 'misc' },
  { id: 12, name: 'Großer Heiltrank', strength: 30, category: 'consumable' },
  { id: 13, name: 'Flammenschwert', strength: 15, category: 'equipment', type: 'weapon' },
  { id: 14, name: 'Kokosnuss', strength: 1, category: 'misc' },
  { id: 15, name: 'Eisenschwert', strength: 12, category: 'equipment', type: 'weapon' },
  { id: 16, name: 'Mithrilschild', strength: 14, category: 'equipment', type: 'armor' },
  { id: 17, name: 'Manatrank', strength: 20, category: 'consumable' },
  { id: 18, name: 'Langbogen', strength: 9, category: 'equipment', type: 'weapon' },
  { id: 19, name: 'Stahlhelm', strength: 5, category: 'equipment', type: 'armor' },
  { id: 20, name: 'Plattenrüstung', strength: 18, category: 'equipment', type: 'armor' },
  { id: 21, name: 'Silbermünze', strength: 1, category: 'misc' },
  { id: 22, name: 'Goldene Brosche', strength: 3, category: 'misc' },
  { id: 23, name: 'Kräuterbeutel', strength: 5, category: 'misc' },
  { id: 24, name: 'Edelstein', strength: 6, category: 'misc' },
  { id: 25, name: 'Alchemistenflasche', strength: 4, category: 'misc' },
  { id: 26, name: 'Energieelixier', strength: 25, category: 'consumable' },
  { id: 27, name: 'Drachenschwert', strength: 20, category: 'equipment', type: 'weapon' },
  { id: 28, name: 'Verzauberter Schild', strength: 16, category: 'equipment', type: 'armor' },
  { id: 29, name: 'Feuerpfeil', strength: 8, category: 'equipment', type: 'weapon' },
  { id: 30, name: 'Zauberstab', strength: 14, category: 'equipment', type: 'weapon' },
  { id: 31, name: 'Dunkler Umhang', strength: 7, category: 'equipment', type: 'armor' },
  { id: 32, name: 'Magierrobe', strength: 10, category: 'equipment', type: 'armor' },
  { id: 33, name: 'Elixier der Unverwundbarkeit', strength: 50, category: 'consumable' },
  { id: 34, name: 'Kampfstab', strength: 11, category: 'equipment', type: 'weapon' },
  { id: 35, name: 'Wolfsfell', strength: 3, category: 'misc' },
  { id: 36, name: 'Bärenklauen', strength: 6, category: 'misc' },
  { id: 37, name: 'Lederhandschuhe', strength: 2, category: 'equipment', type: 'armor' },
  { id: 38, name: 'Rubinring', strength: 4, category: 'misc' },
  { id: 39, name: 'Dunkelkristall', strength: 8, category: 'misc' },
  { id: 40, name: 'Erdtrank', strength: 18, category: 'consumable' },
  { id: 41, name: 'Silberbogen', strength: 13, category: 'equipment', type: 'weapon' },
  { id: 42, name: 'Titanenschild', strength: 25, category: 'equipment', type: 'armor' },
  { id: 43, name: 'Einhandschwert', strength: 10, category: 'equipment', type: 'weapon' },
  { id: 44, name: 'Magischer Ring', strength: 5, category: 'misc' },
  { id: 45, name: 'Dämonenhelm', strength: 17, category: 'equipment', type: 'armor' },
  { id: 46, name: 'Stab der Blitze', strength: 20, category: 'equipment', type: 'weapon' },
  { id: 47, name: 'Leichter Heiltrank', strength: 10, category: 'consumable' },
  { id: 48, name: 'Frostbogen', strength: 12, category: 'equipment', type: 'weapon' },
  { id: 49, name: 'Orkschild', strength: 9, category: 'equipment', type: 'armor' },
  { id: 50, name: 'Schwarze Perle', strength: 4, category: 'misc' },
  { id: 51, name: 'Bluttrank', strength: 22, category: 'consumable' },
  { id: 52, name: 'Echsenrüstung', strength: 15, category: 'equipment', type: 'armor' },
  { id: 53, name: 'Schwert der Rache', strength: 28, category: 'equipment', type: 'weapon' },
  { id: 54, name: 'Magische Laterne', strength: 8, category: 'misc' },
  { id: 55, name: 'Wächterstab', strength: 18, category: 'equipment', type: 'weapon' },
  { id: 56, name: 'Dunkelstab', strength: 16, category: 'equipment', type: 'weapon' },
  { id: 57, name: 'Sonnenkrone', strength: 9, category: 'equipment', type: 'armor' },
  { id: 58, name: 'Heiliges Amulett', strength: 7, category: 'misc' },
  { id: 59, name: 'Giftiger Dolch', strength: 13, category: 'equipment', type: 'weapon' },
  { id: 60, name: 'Kristallrute', strength: 19, category: 'equipment', type: 'weapon' },
  { id: 61, name: 'Sturmschild', strength: 21, category: 'equipment', type: 'armor' },
  { id: 62, name: 'Schattenschwert', strength: 17, category: 'equipment', type: 'weapon' },
  { id: 63, name: 'Lebenselixier', strength: 25, category: 'consumable' },
  { id: 64, name: 'Drachenrüstung', strength: 24, category: 'equipment', type: 'armor' },
  { id: 65, name: 'Energiekristall', strength: 5, category: 'misc' },
  { id: 66, name: 'Stählerner Stab', strength: 14, category: 'equipment', type: 'weapon' },
  { id: 67, name: 'Feuerring', strength: 6, category: 'misc' },
  { id: 68, name: 'Frostschild', strength: 19, category: 'equipment', type: 'armor' },
  { id: 69, name: 'Windbogen', strength: 11, category: 'equipment', type: 'weapon' },
  { id: 70, name: 'Erzrute', strength: 23, category: 'equipment', type: 'weapon' },
  { id: 71, name: 'Mystischer Ring', strength: 4, category: 'misc' },
  { id: 72, name: 'Blitzschwert', strength: 20, category: 'equipment', type: 'weapon' },
  { id: 73, name: 'Phönixfeder', strength: 7, category: 'misc' },
  { id: 74, name: 'Steinschild', strength: 12, category: 'equipment', type: 'armor' },
  { id: 75, name: 'Lebensstab', strength: 18, category: 'equipment', type: 'weapon' },
  { id: 76, name: 'Runenamulett', strength: 9, category: 'misc' },
  { id: 77, name: 'Schattenrüstung', strength: 22, category: 'equipment', type: 'armor' },
  { id: 78, name: 'Donnerkeule', strength: 25, category: 'equipment', type: 'weapon' },
  { id: 79, name: 'Elfenbogen', strength: 16, category: 'equipment', type: 'weapon' },
  { id: 80, name: 'Silberring', strength: 3, category: 'misc' },
  { id: 81, name: 'Sonnenumhang', strength: 10, category: 'equipment', type: 'armor' },
  { id: 82, name: 'Nebelstab', strength: 17, category: 'equipment', type: 'weapon' },
  { id: 83, name: 'Kristallschild', strength: 19, category: 'equipment', type: 'armor' },
  { id: 84, name: 'Geisterdolch', strength: 14, category: 'equipment', type: 'weapon' },
  { id: 85, name: 'Wasserelixier', strength: 20, category: 'consumable' },
  { id: 86, name: 'Eisenspeer', strength: 13, category: 'equipment', type: 'weapon' },
  { id: 87, name: 'Lichtbringer', strength: 24, category: 'equipment', type: 'weapon' },
  { id: 88, name: 'Dunkelamulett', strength: 8, category: 'misc' },
  { id: 89, name: 'Windstoß', strength: 15, category: 'equipment', type: 'weapon' },
  { id: 90, name: 'Feuerrüstung', strength: 21, category: 'equipment', type: 'armor' },
  { id: 91, name: 'Blutklinge', strength: 19, category: 'equipment', type: 'weapon' },
  { id: 92, name: 'Saphiring', strength: 5, category: 'misc' },
  { id: 93, name: 'Ewigkeitsstab', strength: 26, category: 'equipment', type: 'weapon' },
  { id: 94, name: 'Schattenschleier', strength: 7, category: 'equipment', type: 'armor' },
  { id: 95, name: 'Kristallkette', strength: 4, category: 'misc' },
  { id: 96, name: 'Donnerstab', strength: 22, category: 'equipment', type: 'weapon' },
  { id: 97, name: 'Lederhose', strength: 3, category: 'equipment', type: 'armor' },
  { id: 98, name: 'Heiligenamulett', strength: 9, category: 'misc' },
  { id: 99, name: 'Schattenschwert', strength: 18, category: 'equipment', type: 'weapon' },
  { id: 100, name: 'Sturmhelm', strength: 16, category: 'equipment', type: 'armor' },
  { id: 101, name: 'Lebensring', strength: 12, category: 'misc' },
  { id: 102, name: 'Flammenstab', strength: 20, category: 'equipment', type: 'weapon' },
  { id: 103, name: 'Edelstein-Amulett', strength: 6, category: 'misc' },
  { id: 104, name: 'Geisterrüstung', strength: 23, category: 'equipment', type: 'armor' },
  { id: 105, name: 'Blitzbogen', strength: 17, category: 'equipment', type: 'weapon' },
  { id: 106, name: 'Runenring', strength: 5, category: 'misc' },
  { id: 107, name: 'Schattenumhang', strength: 14, category: 'equipment', type: 'armor' },
  { id: 108, name: 'Lichtstab', strength: 19, category: 'equipment', type: 'weapon' },
  { id: 109, name: 'Eisenschild', strength: 11, category: 'equipment', type: 'armor' },
  { id: 110, name: 'Mystisches Amulett', strength: 7, category: 'misc' },
  { id: 111, name: 'Feuerklinge', strength: 21, category: 'equipment', type: 'weapon' },
  { id: 112, name: 'Windrüstung', strength: 18, category: 'equipment', type: 'armor' },
  { id: 113, name: 'Lebenselixier', strength: 25, category: 'consumable' },
  { id: 114, name: 'Dunkler Ring', strength: 4, category: 'misc' },
  { id: 115, name: 'Sturmstab', strength: 20, category: 'equipment', type: 'weapon' },
  { id: 116, name: 'Saphiramulet', strength: 8, category: 'misc' },
  { id: 117, name: 'Eisenrüstung', strength: 15, category: 'equipment', type: 'armor' },
  { id: 118, name: 'Geisterring', strength: 6, category: 'misc' },
  { id: 119, name: 'Blitzklinge', strength: 19, category: 'equipment', type: 'weapon' },
  { id: 120, name: 'Schattenring', strength: 5, category: 'misc' },
  { id: 121, name: 'Lichtumhang', strength: 13, category: 'equipment', type: 'armor' },
  { id: 122, name: 'Feueramulett', strength: 22, category: 'misc' },
  { id: 123, name: 'Windklinge', strength: 17, category: 'equipment', type: 'weapon' },
  { id: 124, name: 'Eisenschulterstücke', strength: 12, category: 'equipment', type: 'armor' },
  { id: 125, name: 'Lebensamulett', strength: 10, category: 'misc' },
  { id: 126, name: 'Donnerklinge', strength: 23, category: 'equipment', type: 'weapon' },
  { id: 127, name: 'Sonnenamulett', strength: 9, category: 'misc' },
  { id: 128, name: 'Sturmklinge', strength: 18, category: 'equipment', type: 'weapon' },
  { id: 129, name: 'Runenhelm', strength: 7, category: 'equipment', type: 'armor' },
  { id: 130, name: 'Mystischer Stab', strength: 20, category: 'equipment', type: 'weapon' },
  { id: 131, name: 'Geisterumhang', strength: 14, category: 'equipment', type: 'armor' },
  { id: 132, name: 'Flammenamulett', strength: 16, category: 'misc' },
  { id: 133, name: 'Eisenspeer', strength: 15, category: 'equipment', type: 'weapon' },
  { id: 134, name: 'Blitzumhang', strength: 19, category: 'equipment', type: 'armor' },
  { id: 135, name: 'Lichtamulett', strength: 11, category: 'misc' },
  { id: 136, name: 'Sturmklinge', strength: 21, category: 'equipment', type: 'weapon' },
  { id: 137, name: 'Schattenstab', strength: 13, category: 'equipment', type: 'weapon' },
  { id: 138, name: 'Runenumhang', strength: 10, category: 'equipment', type: 'armor' },
  { id: 139, name: 'Geisteramulett', strength: 8, category: 'misc' },
  { id: 140, name: 'Feuerumhang', strength: 20, category: 'equipment', type: 'armor' },
  { id: 141, name: 'Windamulett', strength: 17, category: 'misc' },
  { id: 142, name: 'Donnerhelm', strength: 18, category: 'equipment', type: 'armor' },
  { id: 143, name: 'Lichtklinge', strength: 19, category: 'equipment', type: 'weapon' },
  { id: 144, name: 'Eisenschleier', strength: 12, category: 'equipment', type: 'armor' },
  { id: 145, name: 'Mystikering', strength: 6, category: 'misc' },
  { id: 146, name: 'Blitzamulett', strength: 22, category: 'misc' },
  { id: 147, name: 'Sturmhelm', strength: 16, category: 'equipment', type: 'armor' },
  { id: 148, name: 'Sonnenstab', strength: 14, category: 'equipment', type: 'weapon' },
  { id: 149, name: 'Runenschleier', strength: 9, category: 'equipment', type: 'armor' },
  { id: 150, name: 'Geisterklinge', strength: 25, category: 'equipment', type: 'weapon' },
];

// Route, um alle Items abzurufen
app.get('/items', (req, res) => {
  res.json({ items: inventoryItems });
});

// Route, um Items nach Namen zu sortieren
app.post('/items/sort', (req, res) => {
  inventoryItems.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ items: inventoryItems });
});

// Route, um Items nach Stärke zu sortieren
app.post('/items/sort-by-strength', (req, res) => {
  inventoryItems.sort((a, b) => b.strength - a.strength);
  res.json({ items: inventoryItems });
});

// Route, um ausgewählte Items zu löschen
app.post('/items/delete', (req, res) => {
  const itemsToDelete = req.body.items;
  if (itemsToDelete) {
    inventoryItems = inventoryItems.filter(
      (item) => !itemsToDelete.includes(item.id)
    );
  }
  res.json({ items: inventoryItems });
});

// Server starten
app.listen(port, () => {
  console.log(`Text Adventure Server läuft unter http://localhost:${port}`);
});
