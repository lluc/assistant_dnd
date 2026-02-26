/**
 * Dice Modal Component
 *
 * Opens a visual dice-rolling overlay when a `roll-dice` event is dispatched
 * on the document. Any page can trigger it with:
 *
 *   document.dispatchEvent(new CustomEvent('roll-dice', {
 *     detail: { notation: '2d6+3', label: 'Dégâts de feu' }
 *   }));
 *
 * Supported notation: [N]dX[+/-M]  (e.g. "d20", "2d6+3", "1d8")
 */
class DiceModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._notation = '1d20';
        this._label = '';
        this._boundHandleRoll = (e) => this.open(e.detail.notation || '1d20', e.detail.label || '');
        this._boundHandleKey  = (e) => { if (e.key === 'Escape') this.close(); };
    }

    connectedCallback() {
        this._render();
        this._setupListeners();
        document.addEventListener('roll-dice', this._boundHandleRoll);
        document.addEventListener('keydown',   this._boundHandleKey);
    }

    disconnectedCallback() {
        document.removeEventListener('roll-dice', this._boundHandleRoll);
        document.removeEventListener('keydown',   this._boundHandleKey);
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }

                .overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.65);
                    z-index: 2000;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(3px);
                    -webkit-backdrop-filter: blur(3px);
                }
                .overlay.active {
                    display: flex;
                    animation: overlayIn 0.18s ease;
                }
                @keyframes overlayIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                .modal {
                    background: linear-gradient(160deg, #f4e4c1 0%, #e8d4a8 100%);
                    border: 3px solid #8b4513;
                    border-radius: 16px;
                    padding: 2rem 2rem 1.75rem;
                    width: 92%;
                    max-width: 440px;
                    position: relative;
                    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55),
                                inset 0 1px 0 rgba(255, 255, 255, 0.4);
                    animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    text-align: center;
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.78) translateY(28px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                .close-btn {
                    position: absolute;
                    top: 0.7rem;
                    right: 0.7rem;
                    background: none;
                    border: 1px solid transparent;
                    border-radius: 4px;
                    font-size: 1.25rem;
                    cursor: pointer;
                    color: #8b4513;
                    line-height: 1;
                    padding: 0.25rem 0.45rem;
                    opacity: 0.55;
                    transition: opacity 0.2s, border-color 0.2s;
                }
                .close-btn:hover { opacity: 1; border-color: #8b4513; }

                /* ─── Label ─── */
                .modal-label {
                    font-family: 'Cinzel', serif;
                    font-size: 1.05rem;
                    color: #654321;
                    margin-bottom: 1.5rem;
                    font-weight: 600;
                    min-height: 1.4em;
                }

                /* ─── Dice row ─── */
                .dice-row {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    min-height: 80px;
                    align-items: center;
                }

                .die-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width:  var(--die-size, 90px);
                    height: var(--die-size, 90px);
                    flex-shrink: 0;
                }

                /* Size variants */
                .dice-row.single .die-wrap { --die-size: 128px; }
                .dice-row.few    .die-wrap { --die-size: 90px;  }
                .dice-row.many   .die-wrap { --die-size: 66px;  }

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
                    font-size: 1.9rem;
                    pointer-events: none;
                }
                .dice-row.single .die-value { font-size: 2.8rem; }
                .dice-row.many   .die-value { font-size: 1.4rem; }

                /* Crit / fumble */
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

                /* ─── Total ─── */
                .total-area {
                    margin-bottom: 0.5rem;
                }

                .total-value {
                    font-family: 'Cinzel', serif;
                    font-size: 3.8rem;
                    font-weight: 700;
                    color: #2c1810;
                    line-height: 1;
                    text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.12);
                }
                .total-value.crit   { color: #b87000; }
                .total-value.fumble { color: #c0392b; }

                .total-label {
                    font-family: 'Crimson Text', serif;
                    font-size: 1rem;
                    color: #8b6045;
                    margin-top: 0.3rem;
                }

                .breakdown {
                    font-family: 'Crimson Text', serif;
                    font-size: 1rem;
                    color: #654321;
                    margin-bottom: 1.5rem;
                    min-height: 1.5em;
                    font-style: italic;
                }

                /* ─── Reroll button ─── */
                .reroll-btn {
                    padding: 0.7rem 2.2rem;
                    background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
                    color: #f4e4c1;
                    border: 2px solid #654321;
                    border-radius: 8px;
                    font-family: 'Cinzel', serif;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.22);
                }
                .reroll-btn:hover {
                    background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
                }
                .reroll-btn:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
            </style>

            <div class="overlay" id="overlay" role="dialog" aria-modal="true" aria-labelledby="modal-label">
                <div class="modal">
                    <button class="close-btn" id="close-btn" aria-label="Fermer">✕</button>
                    <div class="modal-label" id="modal-label"></div>
                    <div class="dice-row" id="dice-row"></div>
                    <div class="total-area">
                        <div class="total-value" id="total-value">—</div>
                        <div class="total-label"  id="total-label"></div>
                    </div>
                    <div class="breakdown" id="breakdown"></div>
                    <button class="reroll-btn" id="reroll-btn">🎲 Relancer</button>
                </div>
            </div>
        `;
    }

    _setupListeners() {
        const overlay   = this.shadowRoot.getElementById('overlay');
        const closeBtn  = this.shadowRoot.getElementById('close-btn');
        const rerollBtn = this.shadowRoot.getElementById('reroll-btn');

        closeBtn.addEventListener('click',  () => this.close());
        rerollBtn.addEventListener('click', () => this._roll());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(); });
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    open(notation, label = '') {
        this._notation = notation || '1d20';
        this._label    = label;
        this.shadowRoot.getElementById('modal-label').textContent = label || notation;
        this._roll();
        this.shadowRoot.getElementById('overlay').classList.add('active');
    }

    close() {
        this.shadowRoot.getElementById('overlay').classList.remove('active');
    }

    // ─── Internals ────────────────────────────────────────────────────────────

    _parse(notation) {
        const m = (notation || '1d20').trim().match(/^(\d*)d(\d+)([+-]\d+)?$/i);
        if (!m) return { count: 1, sides: 20, modifier: 0 };
        return {
            count:    Math.max(1, parseInt(m[1] || '1')),
            sides:    Math.max(2, parseInt(m[2])),
            modifier: parseInt(m[3] || '0'),
        };
    }

    _roll() {
        const { count, sides, modifier } = this._parse(this._notation);
        const rolls    = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
        const subtotal = rolls.reduce((s, r) => s + r, 0);
        const total    = subtotal + modifier;

        this._renderDice(rolls, sides);
        this._renderTotal(total, rolls, modifier, sides, count);
        this._saveRoll(this._notation, total, rolls, modifier);
    }

    _getDieSVGShape(sides) {
        const shapes = {
            4:   `<polygon points="50,8 93,87 7,87"
                      fill="currentColor" fill-opacity="0.13"
                      stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
            6:   `<rect x="8" y="8" width="84" height="84" rx="10"
                      fill="currentColor" fill-opacity="0.13"
                      stroke="currentColor" stroke-width="4"/>`,
            8:   `<polygon points="50,6 94,50 50,94 6,50"
                      fill="currentColor" fill-opacity="0.13"
                      stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
            10:  `<polygon points="50,6 90,36 75,88 25,88 10,36"
                      fill="currentColor" fill-opacity="0.13"
                      stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
            12:  `<polygon points="50,6 90,28 94,68 66,92 34,92 6,68 10,28"
                      fill="currentColor" fill-opacity="0.13"
                      stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
            20:  `<polygon points="50,4 92,28 92,72 50,96 8,72 8,28"
                      fill="currentColor" fill-opacity="0.13"
                      stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
            100: `<circle cx="50" cy="50" r="44"
                      fill="currentColor" fill-opacity="0.13"
                      stroke="currentColor" stroke-width="4"/>
                  <circle cx="50" cy="50" r="28"
                      fill="none"
                      stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/>`,
        };
        const standard = [4, 6, 8, 10, 12, 20, 100];
        const nearest  = standard.reduce((a, b) => Math.abs(b - sides) < Math.abs(a - sides) ? b : a);
        return shapes[nearest] || shapes[20];
    }

    _renderDice(rolls, sides) {
        const row      = this.shadowRoot.getElementById('dice-row');
        const count    = rolls.length;
        const svgShape = this._getDieSVGShape(sides);

        let sizeClass = 'single';
        if (count >= 2 && count <= 4) sizeClass = 'few';
        if (count >= 5)               sizeClass = 'many';

        row.className = `dice-row ${sizeClass}`;

        row.innerHTML = rolls.map((v, i) => {
            let colorClass = '';
            if (count === 1) {
                if (v === sides) colorClass = 'crit';
                else if (v === 1) colorClass = 'fumble';
            }
            return `
                <div class="die-wrap rolling ${colorClass}" style="animation-delay:${i * 70}ms">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        ${svgShape}
                    </svg>
                    <span class="die-value">${v}</span>
                </div>`;
        }).join('');
    }

    _renderTotal(total, rolls, modifier, sides, count) {
        const totalEl     = this.shadowRoot.getElementById('total-value');
        const labelEl     = this.shadowRoot.getElementById('total-label');
        const breakdownEl = this.shadowRoot.getElementById('breakdown');

        totalEl.className = 'total-value';
        totalEl.textContent = total;
        labelEl.textContent = this._notation;

        // Succès/échec critique sur un seul d20
        if (count === 1 && sides === 20) {
            if (rolls[0] === 20) {
                labelEl.textContent = '⭐ Succès critique !';
                totalEl.classList.add('crit');
            } else if (rolls[0] === 1) {
                labelEl.textContent = '💀 Échec critique !';
                totalEl.classList.add('fumble');
            }
        }

        // Détail pour multi-dés ou modificateur
        if (count > 1 || modifier !== 0) {
            let expr = rolls.join(' + ');
            if (modifier > 0) expr += ` + ${modifier}`;
            if (modifier < 0) expr += ` − ${Math.abs(modifier)}`;
            breakdownEl.textContent = `= ${expr}`;
        } else {
            breakdownEl.textContent = '';
        }
    }

    async _saveRoll(notation, total, rolls, modifier) {
        try {
            const { storageManager } = await import('../utils/storage.js');
            storageManager.addDiceRoll({
                rollType:  notation,
                result:    total,
                details:   rolls.length > 1 || modifier !== 0
                    ? `${rolls.join(' + ')}${modifier > 0 ? ` + ${modifier}` : modifier < 0 ? ` − ${Math.abs(modifier)}` : ''} = ${total}`
                    : null,
                timestamp: new Date().toISOString(),
            });
        } catch { /* storage unavailable */ }
    }
}

customElements.define('dice-modal', DiceModal);
