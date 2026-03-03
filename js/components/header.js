class DndHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._menuOpen = false;
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
                    background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%);
                    border-bottom: 3px solid #8b4513;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                header {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                /* ─── Logo ─── */
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .logo-icon {
                    width: 50px;
                    height: 50px;
                    background: radial-gradient(circle, #ffd700 0%, #b8860b 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #2c1810;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                    flex-shrink: 0;
                }

                .logo h1 {
                    font-family: 'Cinzel', serif;
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #ffd700;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                    white-space: nowrap;
                }

                /* ─── Nav desktop ─── */
                nav ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: nowrap;
                }

                nav button {
                    background: none;
                    border: none;
                    color: #f4e4c1;
                    font-family: 'Crimson Text', serif;
                    font-size: 1.1rem;
                    cursor: pointer;
                    padding: 0.5rem 0.9rem;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    position: relative;
                    white-space: nowrap;
                }

                nav button:hover {
                    color: #ffd700;
                    background: rgba(255, 215, 0, 0.1);
                }

                nav button.active {
                    color: #ffd700;
                    background: rgba(255, 215, 0, 0.2);
                }

                nav button::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: #ffd700;
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }

                .nav-about {
                    margin-left: 0.5rem;
                    border-left: 1px solid rgba(244, 228, 193, 0.2);
                    padding-left: 1.1rem;
                    opacity: 0.75;
                }
                .nav-about:hover { opacity: 1; }

                nav button.active::after {
                    width: 80%;
                }

                /* ─── Hamburger ─── */
                .burger {
                    display: none;
                    flex-direction: column;
                    justify-content: center;
                    gap: 5px;
                    width: 40px;
                    height: 40px;
                    background: none;
                    border: 1px solid rgba(244, 228, 193, 0.3);
                    border-radius: 6px;
                    cursor: pointer;
                    padding: 8px;
                    flex-shrink: 0;
                    transition: border-color 0.2s;
                }

                .burger:hover {
                    border-color: #ffd700;
                }

                .burger span {
                    display: block;
                    height: 2px;
                    background: #f4e4c1;
                    border-radius: 2px;
                    transition: all 0.3s ease;
                    transform-origin: center;
                }

                /* Burger → croix quand ouvert */
                .burger.open span:nth-child(1) {
                    transform: translateY(7px) rotate(45deg);
                }
                .burger.open span:nth-child(2) {
                    opacity: 0;
                    transform: scaleX(0);
                }
                .burger.open span:nth-child(3) {
                    transform: translateY(-7px) rotate(-45deg);
                }

                /* ─── Mobile ─── */
                @media (max-width: 700px) {
                    header {
                        padding: 0.75rem 1rem;
                        flex-wrap: wrap;
                        gap: 0;
                    }

                    .logo h1 {
                        font-size: 1.3rem;
                    }

                    .logo-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 1.2rem;
                    }

                    .burger {
                        display: flex;
                    }

                    nav {
                        width: 100%;
                        overflow: hidden;
                        max-height: 0;
                        transition: max-height 0.35s ease, padding 0.35s ease;
                    }

                    nav.open {
                        max-height: 400px;
                        padding-bottom: 0.75rem;
                    }

                    nav ul {
                        flex-direction: column;
                        gap: 0;
                        padding-top: 0.5rem;
                    }

                    nav li {
                        width: 100%;
                    }

                    nav button {
                        width: 100%;
                        text-align: left;
                        font-size: 1.05rem;
                        padding: 0.65rem 0.75rem;
                        border-radius: 4px;
                    }

                    nav button::after {
                        display: none;
                    }

                    nav button.active {
                        border-left: 3px solid #ffd700;
                        padding-left: 0.6rem;
                    }
                }
            </style>

            <header>
                <div class="logo">
                    <div class="logo-icon">🎲</div>
                    <h1>Assistant D&D MJ</h1>
                </div>

                <button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="main-nav">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav id="main-nav" role="navigation" aria-label="Navigation principale">
                    <ul>
                        <li><button data-page="equipment" class="nav-btn active">Équipement</button></li>
                        <li><button data-page="spells" class="nav-btn">Sorts</button></li>
                        <li><button data-page="classes" class="nav-btn">Classes</button></li>
                        <li><button data-page="species" class="nav-btn">Espèces</button></li>
                        <li><button data-page="monsters" class="nav-btn">Monstres</button></li>
                        <li><button data-page="favorites" class="nav-btn">Favoris</button></li>
                        <li><button data-page="dice" class="nav-btn">Dés</button></li>
                        <li><button data-page="about" class="nav-btn nav-about">À propos</button></li>
                    </ul>
                </nav>
            </header>
        `;
    }

    setupEventListeners() {
        const burger = this.shadowRoot.querySelector('.burger');
        const nav = this.shadowRoot.querySelector('nav');

        burger.addEventListener('click', () => {
            this._menuOpen = !this._menuOpen;
            burger.classList.toggle('open', this._menuOpen);
            nav.classList.toggle('open', this._menuOpen);
            burger.setAttribute('aria-expanded', this._menuOpen);
        });

        const navButtons = this.shadowRoot.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const page = e.target.dataset.page;

                if (page === 'about') {
                    document.dispatchEvent(new CustomEvent('open-about'));
                } else {
                    this.navigate(page);
                }

                // Fermer le menu après navigation sur mobile
                this._menuOpen = false;
                burger.classList.remove('open');
                nav.classList.remove('open');
                burger.setAttribute('aria-expanded', false);
            });
        });
    }

    navigate(page) {
        const navButtons = this.shadowRoot.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === page) {
                btn.classList.add('active');
            }
        });

        window.location.hash = page;
        this.dispatchEvent(new CustomEvent('navigation', {
            detail: { page },
            bubbles: true
        }));
    }

    setActivePage(page) {
        const navButtons = this.shadowRoot.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === page) {
                btn.classList.add('active');
            }
        });
    }
}

customElements.define('dnd-header', DndHeader);
