const display = document.getElementById('display');
const historyEl = document.getElementById('history');
const keys = document.querySelector('.keys');

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;

const MAX_DIGITS = 12;

function updateDisplay() {
  display.textContent = formatForDisplay(current);
  historyEl.textContent = previous !== null && operator
    ? `${formatForDisplay(previous)} ${operatorSymbol(operator)}`
    : '\u00A0';
}

function formatForDisplay(numStr) {
  if (numStr.length > MAX_DIGITS) {
    const num = parseFloat(numStr);
    return num.toExponential(5);
  }
  return numStr;
}

function operatorSymbol(op) {
  return { add: '+', subtract: '−', multiply: '×', divide: '÷' }[op] || '';
}

function inputDigit(digit) {
  if (justEvaluated) {
    current = digit;
    justEvaluated = false;
  } else {
    current = current === '0' ? digit : current + digit;
  }
  if (current.replace('-', '').replace('.', '').length > MAX_DIGITS) {
    current = current.slice(0, -1);
  }
}

function inputDecimal() {
  if (justEvaluated) {
    current = '0.';
    justEvaluated = false;
    return;
  }
  if (!current.includes('.')) current += '.';
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  justEvaluated = false;
}

function toggleSign() {
  if (current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
}

function applyPercent() {
  current = String(parseFloat(current) / 100);
}

function chooseOperator(nextOp) {
  if (operator && !justEvaluated) {
    evaluate();
  }
  previous = current;
  operator = nextOp;
  justEvaluated = true; // next digit press starts a fresh number
}

function evaluate() {
  if (operator === null || previous === null) return;
  const a = parseFloat(previous);
  const b = parseFloat(current);
  let result;

  switch (operator) {
    case 'add': result = a + b; break;
    case 'subtract': result = a - b; break;
    case 'multiply': result = a * b; break;
    case 'divide': result = b === 0 ? NaN : a / b; break;
    default: return;
  }

  current = Number.isNaN(result) ? 'Error' : trimResult(result);
  previous = null;
  operator = null;
  justEvaluated = true;
}

function trimResult(num) {
  const rounded = Math.round((num + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

keys.addEventListener('click', (e) => {
  const btn = e.target.closest('.key');
  if (!btn) return;

  const { value, action } = btn.dataset;

  if (value !== undefined) {
    inputDigit(value);
  } else if (action === 'decimal') {
    inputDecimal();
  } else if (action === 'clear') {
    clearAll();
  } else if (action === 'sign') {
    toggleSign();
  } else if (action === 'percent') {
    applyPercent();
  } else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
    chooseOperator(action);
  } else if (action === 'equals') {
    evaluate();
  }

  updateDisplay();
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    inputDigit(e.key);
  } else if (e.key === '.') {
    inputDecimal();
  } else if (e.key === '+') {
    chooseOperator('add');
  } else if (e.key === '-') {
    chooseOperator('subtract');
  } else if (e.key === '*') {
    chooseOperator('multiply');
  } else if (e.key === '/') {
    e.preventDefault();
    chooseOperator('divide');
  } else if (e.key === 'Enter' || e.key === '=') {
    evaluate();
  } else if (e.key === 'Backspace') {
    current = current.length > 1 ? current.slice(0, -1) : '0';
  } else if (e.key === 'Escape') {
    clearAll();
  } else {
    return;
  }
  updateDisplay();
});

updateDisplay();
