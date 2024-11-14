const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Inventory items
let inventoryItems = [
  { id: 1, name: 'Schwert', strength: 10, category: 'equipment' }
];

// Initial player state
let player = {
  hp: 50,
  roomCounter: 0,
  equipment: {
    weapon: {
      type: 'weapon',
      name: 'Basic Sword',
      strength: 10
    },
    armor: {
      type: 'armor',
      name: 'Leather Armor',
      defense: 6
    }
  },
  gold: 0,
  inventory: inventoryItems
};

// Difficulty multiplier
let difficultyMultiplier = 1.0;

// Inventory item ID counter
let inventoryItemId = inventoryItems.length + 1;

// Item pools
const itemPools = {
  equipment: ['Iron Sword', 'Steel Shield', 'Golden Armor'],
  consumable: ['Health Potion', 'Mega Health Potion', 'Revitalizing Brew'],
  misc: ['Iron Ore', 'Wooden Plank', 'Bone', 'Leather Strip']
};

// Monster list
const monsters = [
  'Goblin', 'Orc', 'Troll', 'Skeleton', 'Zombie', 'Vampire', 'Werewolf', 'Golem', 'Bandit', 'Dragon Whelp',
  'Dark Knight', 'Imp', 'Harpy', 'Minotaur', 'Shadow Fiend', 'Serpent', 'Ghoul', 'Wraith', 'Lich', 'Giant Spider'
];

// Trap descriptions
const trapDescriptions = [
  'You stepped on a hidden spike trap! Lost 1 HP.',
  'A poison dart shoots out from the wall! Lost 2 HP.',
  'The floor collapses beneath you! Lost 3 HP.',
  'You accidentally trigger a swinging blade! Lost 4 HP.',
  'A hidden flamethrower activates! Lost 5 HP.'
];

// Chest tracking to ensure each chest can only be opened once
let chestOpened = false;

// Possible events
const events = [
  { type: 'chest', description: 'You found a chest! Do you want to open it? (yes/no)' },
  { type: 'monster', description: 'A monster appears!' },
  { type: 'empty', description: 'The room is empty. Nothing happens.', hpChange: 0 },
  { type: 'trap', description: 'trap' }
];

// Handle game event
app.get('/event', (req, res) => {
  // Select a random event based on probabilities
  const randomNum = Math.random() * 100;
  let event;
  if (randomNum < 10 && !chestOpened) {
    event = events.find(e => e.type === 'chest');
  } else if (randomNum < 80) {
    event = events.find(e => e.type === 'monster');
  } else if (randomNum < 95) {
    event = events.find(e => e.type === 'empty');
  } else {
    event = events.find(e => e.type === 'trap');
  }

  if (event.type === 'monster') {
    // Monster battle
    const monsterName = monsters[Math.floor(Math.random() * monsters.length)];
    let monsterHp = Math.floor(Math.random() * 8) + 8; // Monster HP between 8-15
    const monsterDamage = Math.floor(Math.random() * 5) + 1; // Monster damage between 1-5

    while (monsterHp > 0 && player.hp > 0) {
      // Player attacks monster
      monsterHp -= player.equipment.weapon.strength * difficultyMultiplier;

      // Monster attacks player if still alive
      if (monsterHp > 0) {
        const effectiveDamage = Math.max(0, (monsterDamage * difficultyMultiplier) - player.equipment.armor.defense);
        player.hp -= effectiveDamage;
      }
    }

    if (player.hp <= 0) {
      player.hp = 50; // Reset HP
      player.roomCounter = 0; // Reset room counter
      res.json({
        message: `You were killed by the ${monsterName}. Your HP has been restored to 50 and you are back at the start.`,
        player
      });
      return;
    } else {
      // Player defeated the monster
      const goldLoot = Math.floor(Math.random() * 3) + 1 * difficultyMultiplier; // 1-3 gold, influenced by difficulty
      player.gold += goldLoot;

      // 30% chance to get an item
      if (Math.random() < 0.3) {
        const itemType = ['equipment', 'consumable', 'misc'][Math.floor(Math.random() * 3)];
        const itemName = itemPools[itemType][Math.floor(Math.random() * itemPools[itemType].length)];
        const itemWorth = Math.floor(Math.random() * 7) + 1 * difficultyMultiplier; // Worth between 1-7
        const itemStrength = itemType === 'equipment' ? Math.floor(Math.random() * 4) + 2 * difficultyMultiplier : 0;
        const itemDefense = itemType === 'equipment' ? Math.floor(Math.random() * 2) + 1 * difficultyMultiplier : 0;

        const newItem = {
          id: inventoryItemId++,
          name: itemName,
          strength: itemStrength,
          defense: itemDefense,
          type: itemType === 'equipment' ? (Math.random() < 0.5 ? 'weapon' : 'armor') : itemType,
          category: itemType,
          worth: itemWorth
        };

        inventoryItems.push(newItem);
      }

      res.json({
        message: `You defeated the ${monsterName} and gained ${goldLoot} gold!`,
        player
      });
      return;
    }
  } else if (event.type === 'chest') {
    // Chest event
    res.json({
      event: event.description,
      player
    });
  } else if (event.type === 'trap') {
    // Trap event
    const trapIndex = Math.floor(Math.random() * trapDescriptions.length);
    const trapDescription = trapDescriptions[trapIndex];
    const trapDamage = parseInt(trapDescription.match(/Lost (\d+) HP/)[1]);
    player.hp -= trapDamage * difficultyMultiplier;

    // Ensure HP does not drop below 0
    if (player.hp <= 0) {
      player.hp = 50; // Reset HP
      player.roomCounter = 0; // Reset room counter
      res.json({
        message: `You died in a trap. ${trapDescription} Your HP has been restored to 50 and you are back at the start.`,
        player
      });
      return;
    }

    // Increase room counter
    player.roomCounter++;

    // Respond with the trap event and player state
    res.json({
      event: trapDescription,
      player
    });
    return;
  } else if (event.hpChange !== undefined) {
    // Update player HP for non-monster events
    player.hp += event.hpChange * difficultyMultiplier;
  }

  // Ensure HP does not drop below 0
  if (player.hp <= 0) {
    player.hp = 50; // Reset HP
    player.roomCounter = 0; // Reset room counter
    res.json({
      message: `You died in the ${event.type} event. Your HP has been restored to 50 and you are back at the start.`,
      player
    });
    return;
  }

  // Increase room counter
  player.roomCounter++;

  // Respond with the event and player state
  res.json({
    event: event.description,
    player
  });
});

// Handle chest opening
app.post('/open-chest', (req, res) => {
  const { decision } = req.body;
  if (chestOpened) {
    res.json({
      message: 'This chest has already been opened.',
      player
    });
    return;
  }
  if (decision && decision.toLowerCase() === 'yes') {
    chestOpened = true;
    // Determine if chest is a mimic
    if (Math.random() < 0.1) {
      // Mimic battle
      const monsterName = 'Mimic';
      let monsterHp = Math.floor(Math.random() * 8) + 8; // Monster HP between 8-15
      const monsterDamage = Math.floor(Math.random() * 5) + 1; // Monster damage between 1-5

      while (monsterHp > 0 && player.hp > 0) {
        // Player attacks mimic
        monsterHp -= player.equipment.weapon.strength * difficultyMultiplier;

        // Mimic attacks player if still alive
        if (monsterHp > 0) {
          const effectiveDamage = Math.max(0, (monsterDamage * difficultyMultiplier) - player.equipment.armor.defense);
          player.hp -= effectiveDamage;
        }
      }

      if (player.hp <= 0) {
        player.hp = 50; // Reset HP
        player.roomCounter = 0; // Reset room counter
        res.json({
          message: `You were killed by the ${monsterName}. Your HP has been restored to 50 and you are back at the start.`,
          player
        });
        return;
      } else {
        // Player defeated the mimic
        const goldLoot = Math.floor(Math.random() * 3) + 1 * difficultyMultiplier; // 1-3 gold, influenced by difficulty
        player.gold += goldLoot;
        res.json({
                   message: `You defeated the ${monsterName} and gained ${goldLoot} gold!`,
          player
        });
        return;
      }
    } else {
      // Normal chest loot
      const goldLoot = Math.floor(Math.random() * 5) + 1 * difficultyMultiplier; // 1-5 gold, influenced by difficulty
      player.gold += goldLoot;

      // 30% chance to get an item
      if (Math.random() < 0.3) {
        const itemType = ['equipment', 'consumable', 'misc'][Math.floor(Math.random() * 3)];
        const itemName = itemPools[itemType][Math.floor(Math.random() * itemPools[itemType].length)];
        const itemWorth = Math.floor(Math.random() * 7) + 1 * difficultyMultiplier; // Worth between 1-7
        const itemStrength = itemType === 'equipment' ? Math.floor(Math.random() * 4) + 2 * difficultyMultiplier : 0;
        const itemDefense = itemType === 'equipment' ? Math.floor(Math.random() * 2) + 1 * difficultyMultiplier : 0;

        const newItem = {
          id: inventoryItemId++,
          name: itemName,
          strength: itemStrength,
          defense: itemDefense,
          type: itemType === 'equipment' ? (Math.random() < 0.5 ? 'weapon' : 'armor') : itemType,
          category: itemType,
          worth: itemWorth
        };

        inventoryItems.push(newItem);
      }

      res.json({
        message: `You opened the chest and found ${goldLoot} gold!`,
        player
      });
      return;
    }
  } else {
    res.json({
      message: 'You chose not to open the chest.',
      player
    });
    return;
  }
});

// Set difficulty level
app.post('/difficulty', (req, res) => {
  const { level } = req.body;
  if (level && level > 0) {
    difficultyMultiplier = 1 + (level * 0.2);
    res.json({ message: `Difficulty level set to ${level}. Multiplier is now ${difficultyMultiplier}.` });
  } else {
    res.status(400).json({ message: 'Invalid difficulty level. Please provide a positive number.' });
  }
});




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


// Fehlerbehandlungsmiddleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

