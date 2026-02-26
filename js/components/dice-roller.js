class DiceRoller extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // Pool de dés : { sides: count }  ex: { 6: 2, 20: 1 }
        this.pool = {};
        this.modifier = 0;
        this.lastPool = null;     // pour le bouton Relancer
        this.lastModifier = 0;
        this.rollingHistory = [];
        this.maxHistory = 10;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    // ─── Rendu principal ───────────────────────────────────────────────────────

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }

                /* ─── Conteneur global ─── */
                .dice-container {
                    background: linear-gradient(135deg, #f4e4c1 0%, #e8d4a8 100%);
                    border: 3px solid #8b4513;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    gap: 1.75rem;
                }

                /* ─── En-tête ─── */
                .dice-header {
                    text-align: center;
                }
                .dice-title {
                    font-family: 'Cinzel', serif;
                    font-size: 2rem;
                    color: #2c1810;
                    margin-bottom: 0.3rem;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                }
                .dice-subtitle {
                    font-family: 'Crimson Text', serif;
                    color: #654321;
                    font-size: 1.1rem;
                    font-style: italic;
                }

                /* ─── Zone de résultat ─── */
                .result-area {
                    background: linear-gradient(135deg, #fdf4d7 0%, #f8ead0 100%);
                    border: 2px solid rgba(139, 69, 19, 0.4);
                    border-radius: 10px;
                    padding: 1.5rem 1rem;
                    min-height: 140px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.6rem;
                    text-align: center;
                    transition: background 0.3s ease;
                }
                .result-area.has-result {
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                    border-color: #8b4513;
                    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
                }

                .result-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.6rem;
                    color: rgba(101, 67, 33, 0.45);
                }
                .result-placeholder svg {
                    width: 3rem;
                    height: 3rem;
                }
                .result-placeholder-text {
                    font-family: 'Crimson Text', serif;
                    font-size: 1.05rem;
                    font-style: italic;
                }

                /* ─── Dés inline (style dice-modal) ─── */
                .dice-row {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 0.6rem;
                    width: 100%;
                }

                .die-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width:  var(--die-size, 80px);
                    height: var(--die-size, 80px);
                    flex-shrink: 0;
                }
                .dice-row.single .die-wrap { --die-size: 110px; }
                .dice-row.few    .die-wrap { --die-size: 80px;  }
                .dice-row.many   .die-wrap { --die-size: 60px;  }

                .die-wrap svg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    color: #8b4513;
                }
                .die-value {
                    position: relative;
                    z-index: 1;
                    font-family: 'Cinzel', serif;
                    font-weight: 700;
                    color: #2c1810;
                    line-height: 1;
                    font-size: 1.7rem;
                    pointer-events: none;
                }
                .dice-row.single .die-value { font-size: 2.4rem; }
                .dice-row.many   .die-value { font-size: 1.2rem; }

                .die-wrap.crit   svg { color: #b87000; }
                .die-wrap.crit   .die-value { color: #b87000; }
                .die-wrap.fumble svg { color: #c0392b; }
                .die-wrap.fumble .die-value { color: #c0392b; }

                @keyframes diceShake {
                    0%   { transform: rotate(0deg)   scale(1);    }
                    15%  { transform: rotate(-16deg) scale(1.22); }
                    32%  { transform: rotate(13deg)  scale(1.16); }
                    50%  { transform: rotate(-9deg)  scale(1.08); }
                    68%  { transform: rotate(5deg)   scale(1.04); }
                    84%  { transform: rotate(-2deg)  scale(1.01); }
                    100% { transform: rotate(0deg)   scale(1);    }
                }
                .die-wrap.rolling {
                    animation: diceShake 0.5s ease;
                }

                .total-value {
                    font-family: 'Cinzel', serif;
                    font-size: 3rem;
                    font-weight: 700;
                    color: #2c1810;
                    line-height: 1;
                    text-shadow: 2px 2px 6px rgba(0,0,0,0.1);
                }
                .total-value.crit   { color: #b87000; }
                .total-value.fumble { color: #c0392b; }

                .total-label {
                    font-family: 'Crimson Text', serif;
                    font-size: 1rem;
                    color: #654321;
                }

                .breakdown {
                    font-family: 'Crimson Text', serif;
                    font-size: 0.95rem;
                    color: #7a5230;
                    font-style: italic;
                }

                #result-content {
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .reroll-btn {
                    margin-top: 0.25rem;
                    padding: 0.5rem 1.4rem;
                    background: rgba(44, 24, 16, 0.12);
                    color: #3d1c00;
                    border: 1px solid rgba(139, 69, 19, 0.5);
                    border-radius: 6px;
                    font-family: 'Cinzel', serif;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .reroll-btn:hover {
                    background: rgba(44, 24, 16, 0.2);
                    border-color: #8b4513;
                }

                /* ─── Grille de dés ─── */
                .dice-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
                    gap: 0.8rem;
                }

                .dice-button {
                    background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
                    border: 2px solid #654321;
                    border-radius: 8px;
                    padding: 1.1rem 0.75rem 0.9rem;
                    color: #f4e4c1;
                    font-family: 'Cinzel', serif;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.4rem;
                    position: relative;
                    user-select: none;
                }
                .dice-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
                    background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
                }
                .dice-button:active {
                    transform: translateY(0);
                }
                .dice-button.in-pool {
                    background: linear-gradient(135deg, #5c2a00 0%, #7a3a10 100%);
                    border-color: #ffd700;
                    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                }

                .die-svg {
                    width: 2.6rem;
                    height: 2.6rem;
                    flex-shrink: 0;
                }

                .dice-label {
                    font-size: 0.85rem;
                    opacity: 0.9;
                }

                /* Badge compteur sur le bouton */
                .count-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #ffd700;
                    color: #2c1810;
                    border-radius: 50%;
                    width: 22px;
                    height: 22px;
                    font-family: 'Cinzel', serif;
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    opacity: 0;
                    transform: scale(0);
                    transition: opacity 0.2s, transform 0.2s;
                    pointer-events: none;
                }
                .count-badge.visible {
                    opacity: 1;
                    transform: scale(1);
                }

                /* ─── Zone plateau ─── */
                .pool-section {
                    background: rgba(139, 69, 19, 0.06);
                    border: 2px solid rgba(139, 69, 19, 0.25);
                    border-radius: 8px;
                    padding: 1rem 1.25rem;
                }

                .pool-label {
                    font-family: 'Cinzel', serif;
                    font-size: 0.85rem;
                    color: #8b4513;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.6rem;
                }

                .pool-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    min-height: 36px;
                    align-items: center;
                    margin-bottom: 0.85rem;
                }

                .pool-empty {
                    font-family: 'Crimson Text', serif;
                    font-size: 0.95rem;
                    color: rgba(101, 67, 33, 0.4);
                    font-style: italic;
                }

                .pool-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.25rem 0.6rem;
                    background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
                    color: #f4e4c1;
                    border: 1px solid #654321;
                    border-radius: 20px;
                    font-family: 'Cinzel', serif;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
                }
                .pool-chip:hover {
                    background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
                    border-color: #ffd700;
                }
                .pool-chip .chip-remove {
                    font-size: 0.75rem;
                    opacity: 0.65;
                    margin-left: 0.1rem;
                    transition: opacity 0.15s;
                }
                .pool-chip:hover .chip-remove {
                    opacity: 1;
                }

                .pool-chip svg {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                }

                /* Modificateur */
                .modifier-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .modifier-label {
                    font-family: 'Cinzel', serif;
                    font-size: 0.85rem;
                    color: #654321;
                    white-space: nowrap;
                }
                .modifier-controls {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    border: 1px solid rgba(139, 69, 19, 0.5);
                    border-radius: 6px;
                    overflow: hidden;
                }
                .mod-btn {
                    background: rgba(139, 69, 19, 0.12);
                    border: none;
                    padding: 0.35rem 0.65rem;
                    font-family: 'Cinzel', serif;
                    font-size: 1rem;
                    color: #654321;
                    cursor: pointer;
                    transition: background 0.15s;
                    line-height: 1;
                }
                .mod-btn:hover {
                    background: rgba(139, 69, 19, 0.25);
                    color: #2c1810;
                }
                .mod-value {
                    min-width: 2.5rem;
                    text-align: center;
                    font-family: 'Cinzel', serif;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #2c1810;
                    padding: 0.35rem 0.2rem;
                    background: rgba(255,255,255,0.5);
                    border-left: 1px solid rgba(139,69,19,0.3);
                    border-right: 1px solid rgba(139,69,19,0.3);
                }

                /* Boutons d'action */
                .pool-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: space-between;
                    align-items: center;
                }

                .clear-btn {
                    padding: 0.65rem 1.2rem;
                    background: none;
                    color: #8b4513;
                    border: 1px solid rgba(139, 69, 19, 0.5);
                    border-radius: 6px;
                    font-family: 'Crimson Text', serif;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    opacity: 0.7;
                }
                .clear-btn:hover:not(:disabled) {
                    background: rgba(139, 69, 19, 0.1);
                    opacity: 1;
                    border-color: #8b4513;
                }
                .clear-btn:disabled {
                    opacity: 0.3;
                    cursor: default;
                }

                .roll-btn {
                    flex: 1;
                    padding: 0.8rem 1.5rem;
                    background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
                    color: #f4e4c1;
                    border: 2px solid #654321;
                    border-radius: 8px;
                    font-family: 'Cinzel', serif;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
                }
                .roll-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
                }
                .roll-btn:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .roll-btn:disabled {
                    opacity: 0.45;
                    cursor: default;
                    box-shadow: none;
                }

                /* ─── Historique ─── */
                .history-section {
                    background: rgba(139, 69, 19, 0.04);
                    border: 1px solid rgba(139, 69, 19, 0.25);
                    border-radius: 8px;
                    padding: 1.25rem;
                }
                .history-title {
                    font-family: 'Cinzel', serif;
                    font-size: 1.1rem;
                    color: #2c1810;
                    margin-bottom: 0.8rem;
                    text-align: center;
                }
                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .history-item {
                    background: rgba(255, 255, 255, 0.65);
                    border: 1px solid rgba(139, 69, 19, 0.2);
                    border-radius: 4px;
                    padding: 0.45rem 0.85rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-family: 'Crimson Text', serif;
                    color: #654321;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s;
                }
                .history-item:hover {
                    background: rgba(255, 215, 0, 0.15);
                    border-color: #8b4513;
                    color: #2c1810;
                }
                .history-roll {
                    font-weight: 600;
                    color: #2c1810;
                    font-family: 'Cinzel', serif;
                    font-size: 1rem;
                }
                .history-empty {
                    font-family: 'Crimson Text', serif;
                    color: rgba(101, 67, 33, 0.45);
                    font-style: italic;
                    text-align: center;
                    padding: 0.5rem;
                }
                .history-footer {
                    margin-top: 0.75rem;
                    text-align: center;
                }
                .clear-history {
                    padding: 0.4rem 1rem;
                    background: none;
                    color: #c0392b;
                    border: 1px solid rgba(192, 57, 43, 0.4);
                    border-radius: 4px;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    opacity: 0.7;
                }
                .clear-history:hover { opacity: 1; background: rgba(192,57,43,0.08); }

                /* ─── Responsive ─── */
                @media (max-width: 600px) {
                    .dice-container { padding: 1.25rem; gap: 1.25rem; }
                    .dice-grid { grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
                    .dice-button { padding: 0.8rem 0.4rem 0.65rem; }
                    .die-svg { width: 2rem; height: 2rem; }
                    .dice-title { font-size: 1.5rem; }
                    .total-value { font-size: 2.4rem; }
                }
                @media (max-width: 380px) {
                    .dice-grid { grid-template-columns: repeat(4, 1fr); }
                }
            </style>

            <div class="dice-container">

                <!-- En-tête -->
                <div class="dice-header">
                    <h2 class="dice-title">🎲 Lanceur de Dés</h2>
                    <p class="dice-subtitle">Composez votre jet et lancez !</p>
                </div>

                <!-- Zone de résultat -->
                <div class="result-area" id="result-area">
                    <div class="result-placeholder" id="result-placeholder">
                        <svg viewBox="0 0 100 100" aria-hidden="true">
                            <polygon points="50,4 92,28 92,72 50,96 8,72 8,28"
                                fill="currentColor" fill-opacity="0.18"
                                stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
                        </svg>
                        <span class="result-placeholder-text">Composez votre lancer ci-dessous</span>
                    </div>
                    <div id="result-content" style="display:none; width:100%;">
                        <div class="dice-row" id="dice-result-row"></div>
                        <div class="total-value" id="total-value"></div>
                        <div class="total-label"  id="total-label"></div>
                        <div class="breakdown"    id="breakdown"></div>
                        <button class="reroll-btn" id="reroll-btn">🎲 Relancer</button>
                    </div>
                </div>

                <!-- Grille de sélection des dés -->
                <div class="dice-grid" id="dice-grid">
                    ${this._renderDiceButtons()}
                </div>

                <!-- Zone plateau -->
                <div class="pool-section">
                    <div class="pool-label">Plateau de dés</div>

                    <div class="pool-chips" id="pool-chips">
                        <span class="pool-empty">Cliquez sur un dé pour l'ajouter…</span>
                    </div>

                    <div class="modifier-row">
                        <span class="modifier-label">Modificateur :</span>
                        <div class="modifier-controls">
                            <button class="mod-btn" id="mod-minus" aria-label="Diminuer le modificateur">−</button>
                            <span class="mod-value" id="mod-value">0</span>
                            <button class="mod-btn" id="mod-plus"  aria-label="Augmenter le modificateur">+</button>
                        </div>
                    </div>

                    <div class="pool-actions">
                        <button class="clear-btn" id="clear-btn" disabled>🗑 Vider</button>
                        <button class="roll-btn"  id="roll-btn"  disabled>🎲 Lancer !</button>
                    </div>
                </div>

                <!-- Historique -->
                <div class="history-section">
                    <h3 class="history-title">Historique</h3>
                    <div class="history-list" id="history-list">
                        <div class="history-empty">Aucun lancer effectué</div>
                    </div>
                    <div class="history-footer">
                        <button class="clear-history" id="clear-history">Effacer l'historique</button>
                    </div>
                </div>

            </div>
        `;
    }

    _renderDiceButtons() {
        const dice = [4, 6, 8, 10, 12, 20, 100];
        return dice.map(sides => `
            <button class="dice-button" data-dice="${sides}" aria-label="Ajouter un d${sides}">
                <svg class="die-svg" viewBox="0 0 100 100" aria-hidden="true">
                    ${this._getDieSVGShape(sides)}
                </svg>
                <span class="dice-label">d${sides}</span>
                <span class="count-badge" id="badge-${sides}">0</span>
            </button>
        `).join('');
    }

    _getDieSVGShape(sides) {
        const shapes = {
            4:   `<polygon points="50,8 93,87 7,87"
                      fill="currentColor" fill-opacity="0.15"
                      stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
            6:   `<rect x="8" y="8" width="84" height="84" rx="10"
                      fill="currentColor" fill-opacity="0.15"
                      stroke="currentColor" stroke-width="4"/>`,
            8:   `<polygon points="50,6 94,50 50,94 6,50"
                      fill="currentColor" fill-opacity="0.15"
                      stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
            10:  `<polygon points="50,6 90,36 75,88 25,88 10,36"
                      fill="currentColor" fill-opacity="0.15"
                      stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
            12:  `<polygon points="50,6 90,28 94,68 66,92 34,92 6,68 10,28"
                      fill="currentColor" fill-opacity="0.15"
                      stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
            20:  `<polygon points="50,4 92,28 92,72 50,96 8,72 8,28"
                      fill="currentColor" fill-opacity="0.15"
                      stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
            100: `<circle cx="50" cy="50" r="44"
                      fill="currentColor" fill-opacity="0.15"
                      stroke="currentColor" stroke-width="4"/>
                  <circle cx="50" cy="50" r="28"
                      fill="none"
                      stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/>`,
        };
        return shapes[sides] || shapes[20];
    }

    // ─── Listeners ─────────────────────────────────────────────────────────────

    setupEventListeners() {
        // Boutons de dés
        this.shadowRoot.querySelectorAll('.dice-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const sides = parseInt(btn.dataset.dice);
                this.addToPool(sides);
            });
        });

        // Modificateur
        this.shadowRoot.getElementById('mod-minus').addEventListener('click', () => this.adjustModifier(-1));
        this.shadowRoot.getElementById('mod-plus').addEventListener('click',  () => this.adjustModifier(+1));

        // Actions
        this.shadowRoot.getElementById('roll-btn').addEventListener('click',  () => this.roll());
        this.shadowRoot.getElementById('clear-btn').addEventListener('click', () => this.clearPool());
        this.shadowRoot.getElementById('reroll-btn').addEventListener('click', () => this.reroll());
        this.shadowRoot.getElementById('clear-history').addEventListener('click', () => this.clearHistory());
    }

    // ─── Gestion du pool ───────────────────────────────────────────────────────

    addToPool(sides) {
        this.pool[sides] = (this.pool[sides] || 0) + 1;
        this._updatePoolUI();
    }

    removeOneFromPool(sides) {
        if (!this.pool[sides]) return;
        this.pool[sides]--;
        if (this.pool[sides] === 0) delete this.pool[sides];
        this._updatePoolUI();
    }

    clearPool() {
        this.pool = {};
        this.modifier = 0;
        this._updatePoolUI();
        this._updateModifierUI();
    }

    adjustModifier(delta) {
        this.modifier = Math.max(-99, Math.min(99, this.modifier + delta));
        this._updateModifierUI();
    }

    _isPoolEmpty() {
        return Object.keys(this.pool).length === 0;
    }

    // ─── Mise à jour de l'UI pool ──────────────────────────────────────────────

    _updatePoolUI() {
        const chipsEl  = this.shadowRoot.getElementById('pool-chips');
        const rollBtn  = this.shadowRoot.getElementById('roll-btn');
        const clearBtn = this.shadowRoot.getElementById('clear-btn');
        const empty    = this._isPoolEmpty();

        rollBtn.disabled  = empty;
        clearBtn.disabled = empty;

        if (empty) {
            chipsEl.innerHTML = '<span class="pool-empty">Cliquez sur un dé pour l\'ajouter…</span>';
        } else {
            chipsEl.innerHTML = '';
            const sides = [4, 6, 8, 10, 12, 20, 100];
            sides.forEach(s => {
                const count = this.pool[s] || 0;
                for (let i = 0; i < count; i++) {
                    const chip = document.createElement('span');
                    chip.className = 'pool-chip';
                    chip.title = `Retirer un d${s}`;
                    chip.innerHTML = `
                        <svg viewBox="0 0 100 100" aria-hidden="true" style="color:#f4e4c1">
                            ${this._getDieSVGShape(s)}
                        </svg>
                        d${s}
                        <span class="chip-remove">✕</span>
                    `;
                    chip.addEventListener('click', () => this.removeOneFromPool(s));
                    chipsEl.appendChild(chip);
                }
            });
        }

        // Mise à jour des badges sur les boutons
        [4, 6, 8, 10, 12, 20, 100].forEach(s => {
            const badge = this.shadowRoot.getElementById(`badge-${s}`);
            const btn   = this.shadowRoot.querySelector(`.dice-button[data-dice="${s}"]`);
            const count = this.pool[s] || 0;
            if (badge) {
                badge.textContent = count;
                badge.classList.toggle('visible', count > 0);
            }
            if (btn) {
                btn.classList.toggle('in-pool', count > 0);
            }
        });
    }

    _updateModifierUI() {
        const mod = this.modifier;
        this.shadowRoot.getElementById('mod-value').textContent =
            mod >= 0 ? `+${mod}` : `${mod}`;
    }

    // ─── Lancer ────────────────────────────────────────────────────────────────

    roll() {
        if (this._isPoolEmpty()) return;

        // Mémoriser pour Relancer
        this.lastPool     = { ...this.pool };
        this.lastModifier = this.modifier;

        // Construire le lancer : grouper par type de dé
        const groups = [];
        const sides = [4, 6, 8, 10, 12, 20, 100];
        sides.forEach(s => {
            const count = this.pool[s] || 0;
            if (count > 0) {
                const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * s) + 1);
                groups.push({ sides: s, rolls });
            }
        });

        const allRolls  = groups.flatMap(g => g.rolls);
        const subtotal  = allRolls.reduce((a, b) => a + b, 0);
        const total     = subtotal + this.modifier;
        const notation  = this._buildNotation(this.pool, this.modifier);

        this._renderResult(groups, total, notation);
        this._saveToHistory(notation, total, allRolls, this.modifier);

        // Vider le pool après le lancer
        this.pool = {};
        this.modifier = 0;
        this._updatePoolUI();
        this._updateModifierUI();
    }

    reroll() {
        if (!this.lastPool) return;
        this.pool     = { ...this.lastPool };
        this.modifier = this.lastModifier;
        this._updatePoolUI();
        this._updateModifierUI();
        this.roll();
    }

    _buildNotation(pool, modifier) {
        const sides = [4, 6, 8, 10, 12, 20, 100];
        const parts = sides
            .filter(s => pool[s] > 0)
            .map(s => pool[s] === 1 ? `1d${s}` : `${pool[s]}d${s}`);
        let result = parts.join('+');
        if (modifier > 0) result += `+${modifier}`;
        if (modifier < 0) result += `${modifier}`;
        return result;
    }

    // ─── Rendu du résultat ─────────────────────────────────────────────────────

    _renderResult(groups, total, notation) {
        const resultArea    = this.shadowRoot.getElementById('result-area');
        const placeholder   = this.shadowRoot.getElementById('result-placeholder');
        const resultContent = this.shadowRoot.getElementById('result-content');
        const diceRow       = this.shadowRoot.getElementById('dice-result-row');
        const totalEl       = this.shadowRoot.getElementById('total-value');
        const totalLabelEl  = this.shadowRoot.getElementById('total-label');
        const breakdownEl   = this.shadowRoot.getElementById('breakdown');

        placeholder.style.display   = 'none';
        resultContent.style.display = 'flex';
        resultArea.classList.add('has-result');

        // Dés individuels
        const allDice = groups.flatMap(g => g.rolls.map(v => ({ v, sides: g.sides })));
        const count   = allDice.length;
        let sizeClass = 'single';
        if (count >= 2 && count <= 4) sizeClass = 'few';
        if (count >= 5)               sizeClass = 'many';

        diceRow.className = `dice-row ${sizeClass}`;
        diceRow.innerHTML = allDice.map(({ v, sides }, i) => {
            let colorClass = '';
            if (count === 1 && sides === 20) {
                if (v === 20) colorClass = 'crit';
                else if (v === 1) colorClass = 'fumble';
            }
            return `
                <div class="die-wrap rolling ${colorClass}" style="animation-delay:${i * 65}ms">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        ${this._getDieSVGShape(sides)}
                    </svg>
                    <span class="die-value">${v}</span>
                </div>`;
        }).join('');

        // Total
        totalEl.className = 'total-value';
        totalEl.textContent = total;
        totalLabelEl.textContent = notation;

        // Crit/fumble sur 1d20 seul
        if (count === 1 && groups[0].sides === 20) {
            const v = groups[0].rolls[0];
            if (v === 20) {
                totalLabelEl.textContent = '⭐ Succès critique !';
                totalEl.classList.add('crit');
            } else if (v === 1) {
                totalLabelEl.textContent = '💀 Échec critique !';
                totalEl.classList.add('fumble');
            }
        }

        // Détail du calcul
        const allValues = groups.flatMap(g => g.rolls);
        const modifier  = this.lastModifier;
        if (count > 1 || modifier !== 0) {
            let expr = allValues.join(' + ');
            if (modifier > 0) expr += ` + ${modifier}`;
            if (modifier < 0) expr += ` − ${Math.abs(modifier)}`;
            breakdownEl.textContent = `= ${expr}`;
        } else {
            breakdownEl.textContent = '';
        }
    }

    // ─── Historique ────────────────────────────────────────────────────────────

    async _saveToHistory(notation, total, rolls, modifier) {
        const details = rolls.length > 1 || modifier !== 0
            ? `${rolls.join(' + ')}${modifier > 0 ? ` + ${modifier}` : modifier < 0 ? ` − ${Math.abs(modifier)}` : ''} = ${total}`
            : null;

        const timestamp = new Date().toLocaleTimeString();
        this.rollingHistory.unshift({ notation, total, details, timestamp });
        if (this.rollingHistory.length > this.maxHistory) {
            this.rollingHistory = this.rollingHistory.slice(0, this.maxHistory);
        }

        this._updateHistoryDisplay();

        try {
            const { storageManager } = await import('../utils/storage.js');
            storageManager.addDiceRoll({
                rollType:  notation,
                result:    total,
                details,
                timestamp: new Date().toISOString(),
            });
        } catch { /* storage unavailable */ }
    }

    _updateHistoryDisplay() {
        const listEl = this.shadowRoot.getElementById('history-list');
        if (this.rollingHistory.length === 0) {
            listEl.innerHTML = '<div class="history-empty">Aucun lancer effectué</div>';
            return;
        }

        listEl.innerHTML = this.rollingHistory.map((item, idx) => `
            <div class="history-item" data-idx="${idx}" title="Recharger ce lancer">
                <span>${item.notation}${item.details ? ' → ' + item.details : ''}</span>
                <span class="history-roll">${item.total}</span>
            </div>
        `).join('');

        listEl.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', () => {
                const item = this.rollingHistory[parseInt(el.dataset.idx)];
                if (item) this._loadNotationIntoPool(item.notation);
            });
        });
    }

    _loadNotationIntoPool(notation) {
        // Parse une notation comme "2d6+1d20+3"
        this.pool = {};
        this.modifier = 0;

        const dieParts = notation.match(/\d*d\d+/gi) || [];
        dieParts.forEach(part => {
            const m = part.match(/^(\d*)d(\d+)$/i);
            if (!m) return;
            const count = parseInt(m[1] || '1');
            const sides = parseInt(m[2]);
            this.pool[sides] = (this.pool[sides] || 0) + count;
        });

        const modMatch = notation.match(/([+-]\d+)$/);
        if (modMatch) {
            const val = parseInt(modMatch[1]);
            if (!isNaN(val)) this.modifier = val;
        }

        this._updatePoolUI();
        this._updateModifierUI();
    }

    clearHistory() {
        this.rollingHistory = [];
        this._updateHistoryDisplay();
    }
}

customElements.define('dice-roller', DiceRoller);
