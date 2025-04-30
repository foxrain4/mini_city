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
const cells = [];

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
}

function handleClick(cell) {
  let currentType = cell.dataset.type;
  let nextIndex = (tileCycle.indexOf(currentType) + 1) % tileCycle.length;
  let newType = tileCycle[nextIndex];
  cell.dataset.type = newType;
  cell.textContent = symbols[newType] || '';
  updateAllInfluence();
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
  let influenceTypes = ['pow', 'wat', 'com', 'ind'];
  return neighbors
    .map(i => cells[i].dataset.type)
    .filter(type => influenceTypes.includes(type))
    .length;
}

function getNeighbors(id) {
  const x = id % width;
  const y = Math.floor(id / width);
  const coords = [
    [x-1, y-1], [x, y-1], [x+1, y-1],
    [x-1, y],             [x+1, y],
    [x-1, y+1], [x, y+1], [x+1, y+1]
  ];
  return coords
    .filter(([cx, cy]) => cx >= 0 && cx < width && cy >= 0 && cy < height)
    .map(([cx, cy]) => cy * width + cx);
}

createBoard();
