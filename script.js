const board = document.getElementById('board');
const width = 8;
const height = 8;

const tileCycle = ['', 'res', 'com', 'ind', 'pow', 'wat'];
const symbols = {
  res: '🏠',
  com: '🏬',
  ind: '🏭',
  pow: '🔌',
  wat: '💧'
};

const buildingCosts = {
  res: 100,
  com: 200,
  ind: 300,
  pow: 400,
  wat: 150
};

const buildingIncome = {
  res: 0,
  com: 50,
  ind: 100,
  pow: -30,
  wat: -20
};

let money = 1000;
const cells = [];

function updateMoneyDisplay() {
  document.getElementById('money-display').textContent = `💰 Money: $${money}`;
}

function createBoard() {
  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.id = i;
    cell.dataset.type = '';
    board.appendChild(cell);
    cell.addEventListener('click', () => handleClick(cell));
    cells.push(cell);
  }
  updateMoneyDisplay();
}

function handleClick(cell) {
  let currentType = cell.dataset.type;
  let nextIndex = (tileCycle.indexOf(currentType) + 1) % tileCycle.length;
  let newType = tileCycle[nextIndex];

  if (newType && money < buildingCosts[newType]) {
    alert(`Not enough money to build ${symbols[newType]}!`);
    return;
  }

  // Refund old cost if any
  if (currentType && buildingCosts[currentType]) {
    money += buildingCosts[currentType];
  }

  // Deduct new cost
  if (newType && buildingCosts[newType]) {
    money -= buildingCosts[newType];
  }

  cell.dataset.type = newType;
  cell.textContent = symbols[newType] || '';
  updateAllInfluence();
  updateMoneyDisplay();
}

function updateAllInfluence() {
  for (let i = 0; i < cells.length; i++) {
    let cell = cells[i];
    if (cell.dataset.type === 'res') {
      let influences = countInfluences(i);
      cell.classList.remove('level-1', 'level-2', 'level-3', 'level-4');
      if (influences >= 4) cell.classList.add('level-4');
      else if (influences === 3) cell.classList.add('level-3');
      else if (influences === 2) cell.classList.add('level-2');
      else if (influences === 1) cell.classList.add('level-1');
    } else {
      cell.classList.remove('level-1', 'level-2', 'level-3', 'level-4');
    }
  }
}

function countInfluences(id) {
  const neighbors = getNeighbors(id);
  const influenceWeight = {
    pow: 2,
    wat: 1,
    com: 2,
    ind: -1
  };

  return neighbors
    .map(i => cells[i].dataset.type)
    .reduce((total, type) => total + (influenceWeight[type] || 0), 0);
}

function getNeighbors(id, radius = 1) {
  const x = id % width;
  const y = Math.floor(id / width);
  const coords = [];

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        coords.push(ny * width + nx);
      }
    }
  }
  return coords;
}

function getPoweredBuildings() {
  const powered = new Set();
  const powerPlants = cells
    .map((cell, i) => ({ type: cell.dataset.type, index: i }))
    .filter(obj => obj.type === 'pow');

  for (const plant of powerPlants) {
    const neighbors = getNeighbors(plant.index, 2);
    let poweredCount = 0;
    for (const n of neighbors) {
      if (poweredCount >= 12) break;
      const cell = cells[n];
      const t = cell.dataset.type;
      if (t && t !== 'pow' && !powered.has(n)) {
        powered.add(n);
        poweredCount++;
      }
    }
  }
  return powered;
}

function runEconomyTick() {
  let delta = 0;
  const poweredSet = getPoweredBuildings();

  cells.forEach((cell, i) => {
    const type = cell.dataset.type;
    if (type && buildingIncome[type] !== undefined) {
      if (type === 'pow' || poweredSet.has(i)) {
        delta += buildingIncome[type];
        cell.textContent = symbols[type];
      } else {
        // Unpowered: disable income/expense
        cell.textContent = '⚠️';
      }
    }
  });

  money += delta;
  updateMoneyDisplay();
}

setInterval(runEconomyTick, 5000);
createBoard();
