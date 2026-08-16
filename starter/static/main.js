// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let currentSolution = [];

function getMessageElement() {
  return document.getElementById('message');
}

function setMessage(text, isSuccess = false) {
  const msg = getMessageElement();
  msg.innerText = text;
  msg.style.color = isSuccess ? '#388e3c' : '#d32f2f';
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (event) => {
        const value = event.target.value.replace(/[^1-9]/g, '').slice(0, 1);
        event.target.value = value;
        updateBoardFeedback();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz, solution = []) {
  puzzle = puz;
  currentSolution = solution;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      inp.className = 'sudoku-cell';
      if (val !== 0) {
        inp.value = String(val);
        inp.disabled = true;
        inp.readOnly = true;
        inp.classList.add('prefilled');
      } else {
        inp.value = '';
        inp.disabled = false;
        inp.readOnly = false;
      }
    }
  }
  updateBoardFeedback();
}

function getBoardFromInputs() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  return board;
}

function boardIsSolved(board) {
  if (!currentSolution || !currentSolution.length) {
    return false;
  }
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] !== currentSolution[i][j]) {
        return false;
      }
    }
  }
  return true;
}

function updateBoardFeedback() {
  const inputs = document.getElementById('sudoku-board').getElementsByTagName('input');
  const board = getBoardFromInputs();
  let hasIncorrectEntry = false;

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) {
      inp.classList.remove('incorrect');
      continue;
    }

    const row = Number(inp.dataset.row);
    const col = Number(inp.dataset.col);
    const value = board[row][col];
    const isIncorrect = value !== 0 && currentSolution[row]?.[col] !== undefined && value !== currentSolution[row][col];
    inp.classList.toggle('incorrect', isIncorrect);
    if (isIncorrect) {
      hasIncorrectEntry = true;
    }
  }

  if (boardIsSolved(board)) {
    setMessage('Congratulations! Puzzle complete!', true);
    return;
  }

  if (hasIncorrectEntry) {
    setMessage('Some entries are incorrect.');
    return;
  }

  const msg = getMessageElement();
  msg.innerText = '';
  msg.style.color = '#333';
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unable to load puzzle' }));
    setMessage(data.error || 'Unable to load puzzle');
    return;
  }
  const data = await res.json();
  renderPuzzle(data.puzzle, data.solution || []);
  setMessage('', false);
}

window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('difficulty').addEventListener('change', newGame);
  newGame();
});