import { APP_VERSION } from '../version.js';
import { CHANGELOG }   from '../changelog.js';

/**
 * About Modal Component
 *
 * Opens a modal overlay when an `open-about` event is dispatched on the document.
 * Triggered by the "À propos" nav item in the header.
 *
 *   document.dispatchEvent(new CustomEvent('open-about'));
 */
class AboutModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._boundOpen = () => this.open();
        this._boundKey  = (e) => { if (e.key === 'Escape') this.close(); };
    }

    connectedCallback() {
        this._render();
        this._setupListeners();
        document.addEventListener('open-about', this._boundOpen);
        document.addEventListener('keydown',    this._boundKey);
    }

    disconnectedCallback() {
        document.removeEventListener('open-about', this._boundOpen);
        document.removeEventListener('keydown',    this._boundKey);
    }

    open() {
        this.shadowRoot.getElementById('overlay').classList.add('active');
    }

    close() {
        this.shadowRoot.getElementById('overlay').classList.remove('active');
    }

    _setupListeners() {
        this.shadowRoot.getElementById('close-btn')
            .addEventListener('click', () => this.close());
        this.shadowRoot.getElementById('overlay')
            .addEventListener('click', e => { if (e.target.id === 'overlay') this.close(); });
    }

    _renderChangelog() {
        return CHANGELOG.map(({ version, date, entries }) => {
            const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
            const items = entries.map(({ type, text }) =>
                `<div class="cl-entry ${type}">${text}</div>`
            ).join('');
            return `
                <div class="cl-version">v${version} — ${formattedDate}</div>
                ${items}
            `;
        }).join('');
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
                    max-width: 420px;
                    position: relative;
                    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55),
                                inset 0 1px 0 rgba(255, 255, 255, 0.4);
                    animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    text-align: center;
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.78) translateY(28px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);    }
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

                .modal-logo {
                    font-size: 3.2rem;
                    line-height: 1;
                    margin-bottom: 0.6rem;
                }

                h2 {
                    font-family: 'Cinzel', serif;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #2c1810;
                    margin: 0 0 0.4rem;
                }

                .version {
                    display: inline-block;
                    font-family: 'Cinzel', serif;
                    font-size: 0.8rem;
                    color: #8b4513;
                    background: rgba(139, 69, 19, 0.1);
                    border: 1px solid rgba(139, 69, 19, 0.25);
                    padding: 0.2rem 0.7rem;
                    border-radius: 20px;
                    margin-bottom: 1.25rem;
                }

                .desc {
                    font-family: 'Crimson Text', serif;
                    font-size: 1.05rem;
                    color: #4a2c1a;
                    line-height: 1.55;
                    margin-bottom: 1.25rem;
                }

                .credits {
                    border-top: 1px solid rgba(139, 69, 19, 0.25);
                    padding-top: 1rem;
                    font-family: 'Crimson Text', serif;
                    font-size: 0.9rem;
                    color: #654321;
                    line-height: 1.6;
                    margin-bottom: 0;
                }

                .credits a {
                    color: #8b4513;
                    text-decoration: none;
                    font-weight: 600;
                }
                .credits a:hover { text-decoration: underline; }

                /* ─── Changelog ─── */
                .changelog {
                    border-top: 1px solid rgba(139, 69, 19, 0.25);
                    padding-top: 1rem;
                    margin-top: 0.75rem;
                    text-align: left;
                    max-height: 200px;
                    overflow-y: auto;
                }
                .changelog::-webkit-scrollbar {
                    width: 4px;
                }
                .changelog::-webkit-scrollbar-track {
                    background: rgba(139, 69, 19, 0.08);
                    border-radius: 2px;
                }
                .changelog::-webkit-scrollbar-thumb {
                    background: rgba(139, 69, 19, 0.35);
                    border-radius: 2px;
                }

                .changelog-title {
                    font-family: 'Cinzel', serif;
                    font-size: 0.8rem;
                    color: #8b4513;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 0.6rem;
                    text-align: center;
                }

                .cl-version {
                    font-family: 'Cinzel', serif;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #654321;
                    margin: 0.65rem 0 0.25rem;
                }
                .cl-version:first-of-type { margin-top: 0; }

                .cl-entry {
                    font-family: 'Crimson Text', serif;
                    font-size: 0.88rem;
                    color: #4a2c1a;
                    padding: 0.08rem 0 0.08rem 1.1rem;
                    position: relative;
                    line-height: 1.4;
                }
                .cl-entry::before {
                    position: absolute;
                    left: 0.1rem;
                    font-size: 0.7rem;
                }
                .cl-entry.feat::before { content: '✦'; color: #b87000; }
                .cl-entry.fix::before  { content: '⬦'; color: #8b4513; }
                .cl-entry.chore::before { content: '·'; color: #999; font-size: 1rem; }
            </style>

            <div class="overlay" id="overlay" role="dialog" aria-modal="true" aria-labelledby="about-title">
                <div class="modal">
                    <button class="close-btn" id="close-btn" aria-label="Fermer">✕</button>

                    <div class="modal-logo">🎲</div>
                    <h2 id="about-title">Assistant D&amp;D MJ</h2>
                    <span class="version">v${APP_VERSION}</span>

                    <p class="desc">
                        Application pour Maîtres de Jeu de Donjons &amp; Dragons 5E.
                        Recherche d'équipement, grimoire des sorts, fiches de classes
                        et espèces, lanceur de dés — tout ce qu'il faut pour mener
                        votre campagne.
                    </p>

                    <div class="credits">
                        <div>📖 Données : <a href="https://www.dnd5eapi.co" target="_blank" rel="noopener">API D&amp;D5E 2024</a></div>
                        <div>⚙️ PWA vanilla JS — aucune dépendance</div>
                        <div>🐙 <a href="https://github.com/lluc/assistant_dnd" target="_blank" rel="noopener">GitHub — lluc/assistant_dnd</a></div>
                    </div>

                    <div class="changelog">
                        <div class="changelog-title">Historique des versions</div>
                        ${this._renderChangelog()}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('about-modal', AboutModal);
