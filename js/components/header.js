class DndHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
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
                }

                .logo h1 {
                    font-family: 'Cinzel', serif;
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #ffd700;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                }

                nav ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    gap: 2rem;
                }

                nav button {
                    background: none;
                    border: none;
                    color: #f4e4c1;
                    font-family: 'Crimson Text', serif;
                    font-size: 1.1rem;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    position: relative;
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

                nav button.active::after {
                    width: 80%;
                }

                @media (max-width: 768px) {
                    header {
                        flex-direction: column;
                        gap: 1rem;
                        padding: 1rem;
                    }

                    .logo h1 {
                        font-size: 1.5rem;
                    }

                    nav ul {
                        gap: 1rem;
                    }

                    nav button {
                        font-size: 1rem;
                        padding: 0.4rem 0.8rem;
                    }
                }
            </style>

            <header>
                <div class="logo">
                    <div class="logo-icon">🎲</div>
                    <h1>Assistant D&D MJ</h1>
                </div>
                <nav>
                    <ul>
                        <li><button data-page="equipment" class="nav-btn active">Équipement</button></li>
                        <li><button data-page="favorites" class="nav-btn">Favoris</button></li>
                        <li><button data-page="dice" class="nav-btn">Dés</button></li>
                    </ul>
                </nav>
            </header>
        `;
    }

    setupEventListeners() {
        const navButtons = this.shadowRoot.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.navigate(page);
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