// Calculator Application
class CalculatorApp {
    constructor() {
        this.calculator = new Calculator();
        this.history = [];
        this.currentTheme = 'dark';
        
        this.init();
    }
    
    init() {
        this.createCalculator();
        this.setupEventListeners();
        this.loadHistory();
        this.setupTheme();
        
        console.log('Calculator app initialized');
    }
    
    createCalculator() {
        const calculatorContainer = document.getElementById('calculator-app');
        
        if (!calculatorContainer) {
            console.error('Calculator container not found');
            return;
        }
        
        calculatorContainer.innerHTML = `
            <div class="calculator-wrapper">
                <div class="calculator-display">0</div>
                
                <div class="calculator-buttons">
                    <!-- First Row -->
                    <button class="calc-btn clear" data-action="clear">C</button>
                    <button class="calc-btn clear-entry" data-action="clear-entry">CE</button>
                    <button class="calc-btn delete" data-action="delete">⌫</button>
                    <button class="calc-btn operator" data-action="divide">÷</button>
                    
                    <!-- Second Row -->
                    <button class="calc-btn" data-number="7">7</button>
                    <button class="calc-btn" data-number="8">8</button>
                    <button class="calc-btn" data-number="9">9</button>
                    <button class="calc-btn operator" data-action="multiply">×</button>
                    
                    <!-- Third Row -->
                    <button class="calc-btn" data-number="4">4</button>
                    <button class="calc-btn" data-number="5">5</button>
                    <button class="calc-btn" data-number="6">6</button>
                    <button class="calc-btn operator" data-action="subtract">-</button>
                    
                    <!-- Fourth Row -->
                    <button class="calc-btn" data-number="1">1</button>
                    <button class="calc-btn" data-number="2">2</button>
                    <button class="calc-btn" data-number="3">3</button>
                    <button class="calc-btn operator" data-action="add">+</button>
                    
                    <!-- Fifth Row -->
                    <button class="calc-btn zero" data-number="0">0</button>
                    <button class="calc-btn" data-action="decimal">.</button>
                    <button class="calc-btn percentage" data-action="percentage">%</button>
                    <button class="calc-btn equals" data-action="equals">=</button>
                </div>
                
                <!-- Theme Toggle -->
                <div class="calculator-theme">
                    <button class="theme-btn active" data-theme="dark">Dark</button>
                    <button class="theme-btn" data-theme="light">Light</button>
                </div>
                
                <!-- History -->
                <div class="calculator-history">
                    <h3><i class="fas fa-history"></i> Calculation History</h3>
                    <div class="history-list" id="historyList">
                        <!-- History items will be added here -->
                    </div>
                </div>
            </div>
        `;
        
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                const number = button.getAttribute('data-number');
                this.calculator.appendNumber(number);
                this.addButtonAnimation(button);
            });
        });
        
        // Operation buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                this.handleAction(action);
                this.addButtonAnimation(button);
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
        
        // Theme buttons
        document.querySelectorAll('[data-theme]').forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.getAttribute('data-theme');
                this.setTheme(theme);
            });
        });
    }
    
    handleAction(action) {
        switch(action) {
            case 'add':
                this.calculator.chooseOperation('+');
                break;
            case 'subtract':
                this.calculator.chooseOperation('-');
                break;
            case 'multiply':
                this.calculator.chooseOperation('×');
                break;
            case 'divide':
                this.calculator.chooseOperation('÷');
                break;
            case 'percentage':
                this.calculator.chooseOperation('%');
                break;
            case 'equals':
                const previous = this.calculator.previousInput;
                const current = this.calculator.currentInput;
                const operation = this.calculator.operation;
                
                if (previous && current && operation) {
                    const calculation = `${previous} ${operation} ${current}`;
                    this.calculator.calculate();
                    this.addToHistory(calculation, this.calculator.currentInput);
                }
                break;
            case 'clear':
                this.calculator.clear();
                break;
            case 'clear-entry':
                this.calculator.clearEntry();
                break;
            case 'delete':
                this.calculator.deleteLast();
                break;
            case 'decimal':
                this.calculator.appendNumber('.');
                break;
        }
        
        this.updateDisplay();
    }
    
    handleKeyboardInput(e) {
        e.preventDefault();
        
        // Numbers
        if (e.key >= '0' && e.key <= '9') {
            this.calculator.appendNumber(e.key);
            this.updateDisplay();
        }
        
        // Decimal point
        if (e.key === '.') {
            this.calculator.appendNumber('.');
            this.updateDisplay();
        }
        
        // Operators
        if (['+', '-', '*', '/', '%'].includes(e.key)) {
            let operation = e.key;
            if (operation === '*') operation = '×';
            if (operation === '/') operation = '÷';
            this.calculator.chooseOperation(operation);
            this.updateDisplay();
        }
        
        // Equals or Enter
        if (e.key === '=' || e.key === 'Enter') {
            const previous = this.calculator.previousInput;
            const current = this.calculator.currentInput;
            const operation = this.calculator.operation;
            
            if (previous && current && operation) {
                const calculation = `${previous} ${operation} ${current}`;
                this.calculator.calculate();
                this.addToHistory(calculation, this.calculator.currentInput);
                this.updateDisplay();
            }
        }
        
        // Clear
        if (e.key === 'Escape' || e.key === 'Delete') {
            this.calculator.clear();
            this.updateDisplay();
        }
        
        // Backspace
        if (e.key === 'Backspace') {
            this.calculator.deleteLast();
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        const display = document.querySelector('.calculator-display');
        if (display) {
            let value = this.calculator.currentInput || '0';
            
            // Format large numbers
            if (value.length > 12) {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                    value = num.toExponential(6);
                }
            }
            
            // Add thousand separators
            if (!value.includes('e') && !value.includes('E')) {
                const parts = value.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                value = parts.join('.');
            }
            
            display.textContent = value;
            
            // Show operation in display if there's a previous input
            if (this.calculator.previousInput && this.calculator.operation) {
                let prevValue = this.calculator.previousInput;
                if (prevValue.length > 8) {
                    prevValue = parseFloat(prevValue).toExponential(3);
                }
                display.setAttribute('data-operation', `${prevValue} ${this.calculator.operation}`);
            } else {
                display.removeAttribute('data-operation');
            }
        }
    }
    
    addToHistory(calculation, result) {
        const historyItem = {
            id: Date.now(),
            calculation: calculation,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.history.unshift(historyItem); // Add to beginning
        
        // Keep only last 10 calculations
        if (this.history.length > 10) {
            this.history.pop();
        }
        
        this.updateHistoryDisplay();
        this.saveHistory();
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        this.history.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            historyElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #f97316;">${item.calculation}</span>
                    <span style="font-size: 0.8rem; color: #94a3b8;">${item.timestamp}</span>
                </div>
                <div style="text-align: right; font-weight: bold;">= ${item.result}</div>
            `;
            
            historyElement.addEventListener('click', () => {
                this.calculator.currentInput = item.result;
                this.calculator.previousInput = '';
                this.calculator.operation = null;
                this.updateDisplay();
            });
            
            historyList.appendChild(historyElement);
        });
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="history-item" style="text-align: center; color: #94a3b8;">No calculations yet</div>';
        }
    }
    
    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (e) {
            console.log('Could not save history:', e);
        }
    }
    
    loadHistory() {
        try {
            const savedHistory = localStorage.getItem('calculatorHistory');
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
                this.updateHistoryDisplay();
            }
        } catch (e) {
            console.log('Could not load history:', e);
        }
    }
    
    addButtonAnimation(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('calculatorTheme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme('dark');
        }
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        const calculatorApp = document.getElementById('calculator-app');
        const themeButtons = document.querySelectorAll('.theme-btn');
        
        // Update calculator class
        calculatorApp.className = `calculator-${theme}`;
        
        // Update active button
        themeButtons.forEach(button => {
            if (button.getAttribute('data-theme') === theme) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Save theme preference
        localStorage.setItem('calculatorTheme', theme);
    }
}

// Calculator Class
class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetScreen = false;
    }
    
    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentInput = '';
            this.shouldResetScreen = false;
        }
        
        if (number === '.' && this.currentInput.includes('.')) return;
        
        if (this.currentInput === '0' && number !== '.') {
            this.currentInput = number;
        } else {
            this.currentInput += number;
        }
    }
    
    chooseOperation(op) {
        if (this.currentInput === '') return;
        
        if (this.previousInput !== '') {
            this.calculate();
        }
        
        this.operation = op;
        this.previousInput = this.currentInput;
        this.currentInput = '';
    }
    
    calculate() {
        let computation;
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError("Cannot divide by zero!");
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }
        
        // Round to avoid floating point precision issues
        computation = Math.round(computation * 100000000) / 100000000;
        
        this.currentInput = computation.toString();
        this.operation = null;
        this.previousInput = '';
        this.shouldResetScreen = true;
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetScreen = false;
    }
    
    clearEntry() {
        this.currentInput = '0';
        this.shouldResetScreen = false;
    }
    
    deleteLast() {
        if (this.currentInput.length > 1 && this.currentInput !== '0') {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
    }
    
    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
        
        // Add CSS for animation
        if (!document.querySelector('#error-styles')) {
            const style = document.createElement('style');
            style.id = 'error-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.calculatorApp = new CalculatorApp();
    
    console.log(`
    🧮 CALCULATOR APP LOADED
    ========================
    Features:
    - Basic arithmetic operations
    - Keyboard support
    - Calculation history
    - Dark/Light themes
    - Responsive design
    ========================
    Use the buttons or your keyboard to calculate!
    `);
});

// Utility functions
const CalculatorUtils = {
    formatNumber(num) {
        return parseFloat(num).toLocaleString('en-US', {
            maximumFractionDigits: 8
        });
    },
    
    isScientificNotation(num) {
        return num.toString().includes('e') || num.toString().includes('E');
    },
    
    toScientificNotation(num, decimals = 6) {
        return parseFloat(num).toExponential(decimals);
    }
};