const express = require('express');
const { inventoryItems } = require('./Inventar_Inhalt'); // Zentrales Inventar
const router = express.Router();

// Spielerzustand
let player = {
  hp: 50,
  maxHp: 50,
  difficultyMultiplier: 1,
  roomCounter: 0,
  gold: 0,
};

// Ausrüstung
let equipment = {
  weapon: null,
  armor: null,
};

// Aktuelles Ereignis
let currentEvent = null;

// Hilfsfunktionen
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItemFromArray = (arr) => arr[getRandomInt(0, arr.length - 1)];

// Event-Pools
const monsters = ['Goblin', 'Orc', 'Troll', 'Skeleton', 'Zombie', 'Vampire', 'Werewolf'];
const trapTexts = [
  'You fell into a spike pit!',
  'A poison dart hits you!',
  'You triggered a flame trap!',
  'The ceiling collapses partially!',
  'An arrow trap shoots you!',
];
const equipmentNames = ['Sword', 'Shield', 'Armor'];
const consumableNames = ['Health Potion'];
const miscNames = ['Iron', 'Wood', 'Leather', 'Bone'];

// Ereignisse
const events = [
  { type: 'chest', chance: 10 },
  { type: 'monster', chance: 70 },
  { type: 'empty', chance: 15 },
  { type: 'trap', chance: 5 },
];

// Spielerstatus abrufen
router.get('/player', (req, res) => {
  res.json({ player, inventoryItems });
});

// Schwierigkeitsgrad ändern
router.post('/difficulty', (req, res) => {
  const { level } = req.body;

  if (!level || level < 1) {
    return res.status(400).json({ error: 'Invalid difficulty level' });
  }

  player.difficultyMultiplier = 1 + level * 0.2;

  // Waffen und Rüstungen neu berechnen
  if (equipment.weapon) {
    equipment.weapon.strength = Math.ceil(equipment.weapon.strength / player.difficultyMultiplier);
  }

  if (equipment.armor) {
    equipment.armor.defense = Math.ceil(equipment.armor.defense / player.difficultyMultiplier);
  }

  res.json({ message: `Difficulty set to level ${level}`, player });
});

// Gegenstand ausrüsten
router.post('/equip', (req, res) => {
  const { itemId } = req.body;

  if (!itemId || itemId === 'Bitte auswählen') {
    return res.status(400).json({ error: 'Please select a valid item to equip.' });
  }

  const item = inventoryItems.find((i) => i.id === itemId);

  if (!item) {
    return res.status(400).json({ error: 'Item not found in inventory.' });
  }

  if (item.type === 'weapon') {
    equipment.weapon = item;
  } else if (item.type === 'armor') {
    equipment.armor = item;
  } else {
    return res.status(400).json({ error: 'Item is not equippable.' });
  }

  res.json({ message: `${item.name} equipped!`, equipment });
});

// Dungeon-Ereignis auslösen
router.post('/event', (req, res) => {
  if (!equipment.weapon) {
    return res.status(400).json({ error: 'You must equip a weapon to trigger an event!' });
  }

  player.roomCounter++;

  let selectedEvent;

  // Das erste Event ist immer ein Kampf
  if (player.roomCounter === 1) {
    selectedEvent = { type: 'monster' };
  } else {
    // Danach zufällige Ereignisse
    const random = getRandomInt(1, 100);
    let cumulativeChance = 0;
    selectedEvent = events.find((event) => {
      cumulativeChance += event.chance;
      return random <= cumulativeChance;
    }) || { type: 'empty' }; // Fallback auf 'empty', falls nichts passt
  }

  switch (selectedEvent.type) {
    case 'monster': {
      const monster = {
        name: randomItemFromArray(monsters),
        hp: Math.ceil(getRandomInt(5, 12) * player.difficultyMultiplier),
        damage: Math.ceil(getRandomInt(2, 5) * player.difficultyMultiplier),
      };

      currentEvent = { type: 'monster', monster };
      res.json({ event: 'Monster encounter', monster });
      break;
    }
    case 'chest': {
      currentEvent = { type: 'chest', opened: false };
      res.json({ event: 'You found a chest! Do you want to open it? (yes or no)' });
      break;
    }
    case 'trap': {
      const damage = Math.max(0, getRandomInt(1, 5) - (equipment.armor?.defense || 0));
      player.hp -= damage;

      if (player.hp <= 0) {
        resetPlayer();
        return res.json({ event: 'You died from a trap!', player });
      }

      res.json({ event: randomItemFromArray(trapTexts), damage, player });
      break;
    }
    case 'empty': {
      currentEvent = null; // Kein spezielles Ereignis zu speichern
      res.json({ event: 'The room is empty.' });
      break;
    }
    default: {
      res.status(500).json({ error: 'Unknown event type' });
    }
  }
});

// Kämpfen
router.post('/fight', (req, res) => {
  if (!currentEvent || currentEvent.type !== 'monster') {
    return res.status(400).json({ error: 'No active monster to fight.' });
  }

  const { monster } = currentEvent;

  while (player.hp > 0 && monster.hp > 0) {
    const playerDamage = equipment.weapon?.strength || 1;
    monster.hp -= playerDamage;

    if (monster.hp <= 0) {
      const gold = getRandomInt(1, 3) * player.difficultyMultiplier;
      player.gold += gold;

      if (Math.random() <= 0.3) {
        const loot = generateLoot();
        inventoryItems.push(loot);
        res.json({ event: 'You defeated the monster!', loot, gold, player });
      } else {
        res.json({ event: 'You defeated the monster!', gold, player });
      }

      currentEvent = null;
      return;
    }

    const monsterDamage = Math.max(0, monster.damage - Math.ceil((equipment.armor?.defense || 0) * player.difficultyMultiplier));
    player.hp -= monsterDamage;

    if (player.hp <= 0) {
      resetPlayer();
      res.json({ event: 'You lost the fight and died!', player });
      return;
    }
  }
});

// Truhe öffnen
router.post('/chest', (req, res) => {
  const { choice } = req.body;

  if (!currentEvent || currentEvent.type !== 'chest') {
    return res.status(400).json({ error: 'No chest to interact with.' });
  }

  if (!choice || choice === 'Bitte auswählen') {
    return res.status(400).json({ error: 'Please select a valid option for the chest.' });
  }

  if (choice === 'yes') {
    const isMimic = getRandomInt(1, 100) <= 10;

    if (isMimic) {
      const mimic = { name: 'Mimic', hp: getRandomInt(8, 15), damage: getRandomInt(1, 5) };
      currentEvent = { type: 'monster', monster: mimic };
      res.json({ event: 'It was a Mimic!', mimic });
    } else {
      const loot = generateLoot();
      inventoryItems.push(loot);
      res.json({ event: 'You found loot!', loot, player });
    }
  } else if (choice === 'no') {
    currentEvent = null;
    res.json({ event: 'You ignored the chest.' });
  } else {
    res.status(400).json({ error: 'Invalid choice.' });
  }
});

// Loot generieren
const generateLoot = () => {
  const type = randomItemFromArray(['equipment', 'consumable', 'misc']);
  const name =
    type === 'equipment'
      ? randomItemFromArray(equipmentNames)
      : type === 'consumable'
      ? randomItemFromArray(consumableNames)
      : randomItemFromArray(miscNames);

  const baseStrength = getRandomInt(2, 5); // Basisstärke
  const baseDefense = getRandomInt(1, 2); // Basisverteidigung

  return {
    id: inventoryItems.length + 1,
    name,
    strength: type === 'equipment' ? Math.ceil(baseStrength * player.difficultyMultiplier) : 0,
    defense: type === 'equipment' ? Math.ceil(baseDefense * player.difficultyMultiplier) : 0,
    type: type === 'equipment' ? (name === 'Armor' ? 'armor' : 'weapon') : type,
    category: type,
    worth: Math.floor(getRandomInt(1, 7) * player.difficultyMultiplier),
  };
};

// Spieler zurücksetzen
const resetPlayer = () => {
  player.hp = player.maxHp;
  player.roomCounter = 0;
};

module.exports = router;
