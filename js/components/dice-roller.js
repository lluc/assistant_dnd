class DiceRoller extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.rollingHistory = [];
        this.maxHistory = 10;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .dice-container {
                    background: linear-gradient(135deg, #f4e4c1 0%, #e8d4a8 100%);
                    border: 3px solid #8b4513;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
                    position: relative;
                }

                .dice-container::before {
                    content: '';
                    position: absolute;
                    top: -3px;
                    left: -3px;
                    right: -3px;
                    bottom: -3px;
                    background: linear-gradient(45deg, #8b4513, #cd853f, #8b4513);
                    border-radius: 12px;
                    z-index: -1;
                }

                .dice-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .dice-title {
                    font-family: 'Cinzel', serif;
                    font-size: 2rem;
                    color: #2c1810;
                    margin-bottom: 0.5rem;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                }

                .dice-subtitle {
                    font-family: 'Crimson Text', serif;
                    color: #654321;
                    font-size: 1.1rem;
                    font-style: italic;
                }

                .dice-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .dice-button {
                    background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
                    border: 2px solid #654321;
                    border-radius: 8px;
                    padding: 1.5rem 1rem;
                    color: #f4e4c1;
                    font-family: 'Cinzel', serif;
                    font-size: 1.2rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    position: relative;
                    overflow: hidden;
                }

                .dice-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
                    background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
                }

                .dice-button:active {
                    transform: translateY(0);
                }

                .dice-button.rolling {
                    animation: diceRoll 0.5s ease-in-out;
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                    color: #2c1810;
                }

                @keyframes diceRoll {
                    0% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(90deg) scale(1.1); }
                    50% { transform: rotate(180deg) scale(1.2); }
                    75% { transform: rotate(270deg) scale(1.1); }
                    100% { transform: rotate(360deg) scale(1); }
                }

                .dice-icon {
                    font-size: 2rem;
                }

                .dice-label {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }

                .custom-roll {
                    background: rgba(139, 69, 19, 0.1);
                    border: 2px solid #8b4513;
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }

                .custom-roll-title {
                    font-family: 'Cinzel', serif;
                    font-size: 1.3rem;
                    color: #2c1810;
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .custom-roll-form {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .custom-input {
                    flex: 1;
                    min-width: 80px;
                    padding: 0.8rem;
                    border: 2px solid #8b4513;
                    border-radius: 4px;
                    background: #fff;
                    font-family: 'Crimson Text', serif;
                    font-size: 1.1rem;
                    color: #2c1810;
                    text-align: center;
                }

                .custom-input:focus {
                    outline: none;
                    border-color: #ffd700;
                    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                }

                .roll-button {
                    padding: 0.8rem 1.5rem;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    border: 2px solid #1e7e34;
                    border-radius: 4px;
                    font-family: 'Cinzel', serif;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .roll-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }

                .result-display {
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                    border: 3px solid #8b4513;
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    text-align: center;
                    min-height: 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                }

                .result-value {
                    font-family: 'Cinzel', serif;
                    font-size: 3rem;
                    font-weight: bold;
                    color: #2c1810;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                }

                .result-details {
                    font-family: 'Crimson Text', serif;
                    color: #654321;
                    font-size: 1.1rem;
                    margin-top: 0.5rem;
                }

                .history-section {
                    background: rgba(139, 69, 19, 0.05);
                    border: 2px solid rgba(139, 69, 19, 0.3);
                    border-radius: 8px;
                    padding: 1.5rem;
                }

                .history-title {
                    font-family: 'Cinzel', serif;
                    font-size: 1.2rem;
                    color: #2c1810;
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .history-item {
                    background: rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(139, 69, 19, 0.3);
                    border-radius: 4px;
                    padding: 0.5rem 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-family: 'Crimson Text', serif;
                    color: #654321;
                }

                .history-roll {
                    font-weight: bold;
                    color: #2c1810;
                }

                .clear-history {
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: #dc3545;
                    color: white;
                    border: 1px solid #c82333;
                    border-radius: 4px;
                    font-family: 'Crimson Text', serif;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .clear-history:hover {
                    background: #c82333;
                }

                @media (max-width: 768px) {
                    .dice-grid {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 0.8rem;
                    }

                    .dice-button {
                        padding: 1rem 0.5rem;
                        font-size: 1rem;
                    }

                    .dice-icon {
                        font-size: 1.5rem;
                    }

                    .custom-roll-form {
                        flex-direction: column;
                    }

                    .custom-input {
                        min-width: 100%;
                    }

                    .result-value {
                        font-size: 2.5rem;
                    }
                }
            </style>

            <div class="dice-container">
                <div class="dice-header">
                    <h2 class="dice-title">🎲 Lanceur de Dés</h2>
                    <p class="dice-subtitle">Pour tous vos jets de dés D&D</p>
                </div>

                <div class="result-display" id="result-display">
                    <div class="result-value">?</div>
                    <div class="result-details">Choisissez un dé à lancer</div>
                </div>

                <div class="dice-grid">
                    <button class="dice-button" data-dice="4">
                        <span class="dice-icon">⚀</span>
                        <span class="dice-label">d4</span>
                    </button>
                    <button class="dice-button" data-dice="6">
                        <span class="dice-icon">⚁</span>
                        <span class="dice-label">d6</span>
                    </button>
                    <button class="dice-button" data-dice="8">
                        <span class="dice-icon">⚂</span>
                        <span class="dice-label">d8</span>
                    </button>
                    <button class="dice-button" data-dice="10">
                        <span class="dice-icon">⚃</span>
                        <span class="dice-label">d10</span>
                    </button>
                    <button class="dice-button" data-dice="12">
                        <span class="dice-icon">⚄</span>
                        <span class="dice-label">d12</span>
                    </button>
                    <button class="dice-button" data-dice="20">
                        <span class="dice-icon">⚅</span>
                        <span class="dice-label">d20</span>
                    </button>
                    <button class="dice-button" data-dice="100">
                        <span class="dice-icon">🎯</span>
                        <span class="dice-label">d100</span>
                    </button>
                </div>

                <div class="custom-roll">
                    <h3 class="custom-roll-title">Lancer Personnalisé</h3>
                    <div class="custom-roll-form">
                        <input type="number" class="custom-input" id="custom-number" placeholder="Nombre" min="1" value="1">
                        <span style="font-family: 'Crimson Text', serif; color: #654321;">d</span>
                        <input type="number" class="custom-input" id="custom-sides" placeholder="Faces" min="2" value="20">
                        <span style="font-family: 'Crimson Text', serif; color: #654321;">+</span>
                        <input type="number" class="custom-input" id="custom-modifier" placeholder="Modificateur" value="0">
                        <button class="roll-button" id="custom-roll-button">Lancer</button>
                    </div>
                </div>

                <div class="history-section">
                    <h3 class="history-title">Historique des Lancers</h3>
                    <div class="history-list" id="history-list">
                        <div class="history-item">
                            <span>Aucun lancer effectué</span>
                        </div>
                    </div>
                    <button class="clear-history" id="clear-history">Effacer l'historique</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const diceButtons = this.shadowRoot.querySelectorAll('.dice-button');
        const customRollButton = this.shadowRoot.getElementById('custom-roll-button');
        const clearHistoryButton = this.shadowRoot.getElementById('clear-history');

        diceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const dice = parseInt(button.dataset.dice);
                this.rollDice(dice);
                this.animateButton(button);
            });
        });

        customRollButton.addEventListener('click', () => {
            this.rollCustomDice();
        });

        clearHistoryButton.addEventListener('click', () => {
            this.clearHistory();
        });

        const customInputs = this.shadowRoot.querySelectorAll('.custom-input');
        customInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.rollCustomDice();
                }
            });
        });
    }

    rollDice(sides) {
        const result = Math.floor(Math.random() * sides) + 1;
        this.displayResult(result, `1d${sides}`);
        this.addToHistory(`1d${sides}`, result);
        return result;
    }

    rollCustomDice() {
        const numberInput = this.shadowRoot.getElementById('custom-number');
        const sidesInput = this.shadowRoot.getElementById('custom-sides');
        const modifierInput = this.shadowRoot.getElementById('custom-modifier');

        const number = parseInt(numberInput.value) || 1;
        const sides = parseInt(sidesInput.value) || 20;
        const modifier = parseInt(modifierInput.value) || 0;

        let total = 0;
        const rolls = [];

        for (let i = 0; i < number; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(roll);
            total += roll;
        }

        total += modifier;

        const rollString = `${number}d${sides}${modifier >= 0 ? '+' : ''}${modifier}`;
        const details = `${rolls.join(' + ')}${modifier >= 0 ? '+' : ''}${modifier} = ${total}`;
        
        this.displayResult(total, rollString, details);
        this.addToHistory(rollString, total, details);
    }

    displayResult(result, rollType, details = null) {
        const resultDisplay = this.shadowRoot.getElementById('result-display');
        const resultValue = resultDisplay.querySelector('.result-value');
        const resultDetails = resultDisplay.querySelector('.result-details');

        resultValue.textContent = result;
        resultDetails.textContent = details || `Lancer: ${rollType}`;

        resultDisplay.classList.add('scale-in');
        setTimeout(() => resultDisplay.classList.remove('scale-in'), 300);
    }

    animateButton(button) {
        button.classList.add('rolling');
        setTimeout(() => button.classList.remove('rolling'), 500);
    }

    async addToHistory(rollType, result, details = null) {
        const timestamp = new Date().toLocaleTimeString();
        
        this.rollingHistory.unshift({
            rollType,
            result,
            details,
            timestamp
        });

        if (this.rollingHistory.length > this.maxHistory) {
            this.rollingHistory = this.rollingHistory.slice(0, this.maxHistory);
        }

        try {
            const { storageManager } = await import('../utils/storage.js');
            storageManager.addDiceRoll({
                rollType,
                result,
                details,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to save dice roll to storage:', error);
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = this.shadowRoot.getElementById('history-list');
        
        if (this.rollingHistory.length === 0) {
            historyList.innerHTML = `
                <div class="history-item">
                    <span>Aucun lancer effectué</span>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.rollingHistory.map(item => `
            <div class="history-item">
                <span>${item.rollType}: ${item.details || item.result}</span>
                <span class="history-roll">${item.result}</span>
            </div>
        `).join('');
    }

    clearHistory() {
        this.rollingHistory = [];
        this.updateHistoryDisplay();
    }
}

customElements.define('dice-roller', DiceRoller);