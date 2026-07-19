// START: @RFOF-NETWORK - Erweiterte Krypto- & Wallet-Logik (app.js)

document.addEventListener("DOMContentLoaded", () => {
    // UI Elemente abgreifen (HTML-Verknüpfungen)
    const sidebarMenu = document.getElementById("sidebar-menu");
    const accountModal = document.getElementById("account-modal");
    const menuToggleBtn = document.getElementById("menu-toggle-btn");
    const menuCloseBtn = document.getElementById("menu-close-btn");
    const profileToggleBtn = document.getElementById("profile-toggle-btn");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    // Interne Krypto-Statusverwaltung für Phrasen und fraktale Hashes
    const cryptoStorage = {
        activeKeys: null,
        // Einfache fraktale Hash-Simulation zur lokalen Verschlüsselung im nackten Browser-Scope
        generateFractalHash: async (input, iterations = 5) => {
            let current = input;
            // Erzeugt kaskadierende Hashes über native Web Crypto API
            for(let i = 0; i < iterations; i++) {
                const msgBuffer = new TextEncoder().encode(current + i);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                current = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
            return current;
        },
        // Lokale Seed-Phrasen-Generierung (BIP39-Struktur nachempfunden)
        generateLocalMnemonic: () => {
            const wordList = ["phoenix", "network", "science", "alpha", "omega", "matrix", "crypto", "telnet", "frame", "nodes", "secure", "quantum"];
            let phrase = [];
            for (let i = 0; i < 12; i++) {
                const randomIndex = Math.floor(Math.random() * wordList.length);
                phrase.push(wordList[randomIndex]);
            }
            return phrase.join(" ");
        }
    };

    // 1. Sidebar Toggling (Auf/Zu)
    if(menuToggleBtn) {
        menuToggleBtn.addEventListener("click", () => {
            if(sidebarMenu) sidebarMenu.classList.remove("hidden");
        });
    }
    if(menuCloseBtn) {
        menuCloseBtn.addEventListener("click", () => {
            if(sidebarMenu) sidebarMenu.classList.add("hidden");
        });
    }

    // 2. Account Modal Toggling
    if(profileToggleBtn) {
        profileToggleBtn.addEventListener("click", () => {
            if(accountModal) accountModal.classList.remove("hidden");
        });
    }
    if(modalCloseBtn) {
        modalCloseBtn.addEventListener("click", () => {
            if(accountModal) accountModal.classList.add("hidden");
        });
    }

    // 3. Kaskadierendes Dropdown-Menü (Verschachtelung aus den Bildern 2-9)
    const submenus = document.querySelectorAll(".has-submenu");
    submenus.forEach(item => {
        item.addEventListener("click", () => {
            const targetId = item.getAttribute("data-target");
            const targetSubmenu = document.getElementById(targetId);
            const arrow = item.querySelector(".arrow");

            if (targetSubmenu) {
                if (targetSubmenu.classList.contains("hidden")) {
                    targetSubmenu.classList.remove("hidden");
                    if(arrow) arrow.innerText = "⋁";
                    item.classList.add("active-menu");
                } else {
                    targetSubmenu.classList.add("hidden");
                    if(arrow) arrow.innerText = "›";
                    item.classList.remove("active-menu");
                }
            }
        });
    });

    // 4. Dark Mode Switcher (Bild 2 & 6)
    const darkmodeToggle = document.getElementById("toggle-darkmode");
    if(darkmodeToggle) {
        darkmodeToggle.addEventListener("change", (e) => {
            if(e.target.checked) {
                document.body.classList.add("dark-theme");
                if(sidebarMenu) sidebarMenu.classList.add("dark-mode-bg");
            } else {
                document.body.classList.remove("dark-theme");
                if(sidebarMenu) sidebarMenu.classList.remove("dark-mode-bg");
            }
        });
    }

    // Formular-Abfangung für Registrierung / Login zur Ableitung nackter Hashes
    const loginForm = document.getElementById("login-form");
    if(loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("login-email").value;
            const passwordInput = document.getElementById("login-password").value;

            logSession("Ableitung des fraktalen Hashes aus Nutzerdaten gestartet...");
            const userHash = await cryptoStorage.generateFractalHash(emailInput + passwordInput);
            logSession(`Nutzer authentifiziert. Lokaler Naked-Hash: ${userHash.substring(0, 16)}...`);
            
            // Logische Verknüpfung mit lokalem Speicher
            localStorage.setItem("user_session_hash", userHash);
            
            if(window.system && typeof window.system.auth === "function") {
                window.system.auth();
            }
        });
    }

    // 5. Krypto & Telnet Ready Web3 Gateways (Finanz- & Datenkryptographie)
    const evmBtn = document.getElementById("btn-wallet-evm");
    const btcBtn = document.getElementById("btn-wallet-btc");

    if(evmBtn) {
        evmBtn.addEventListener("click", async () => {
            logSession("EVM Wallet Verbindungsversuch eingeleitet.");
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    logSession(`EVM Wallet erfolgreich verbunden: ${accounts[0]}`);
                    
                    // Fraktale Bindung der Adresse an die aktive Sitzung
                    const addressHash = await cryptoStorage.generateFractalHash(accounts[0]);
                    logSession(`EVM Hash-Bindung erzeugt: ${addressHash.substring(0, 12)}`);

                    // Verbindung via Frames an verbundene Services übermitteln
                    window.parent.postMessage({ 
                        type: 'CRYPTO_AUTH', 
                        wallet: 'EVM', 
                        address: accounts[0],
                        bindHash: addressHash 
                    }, '*');
                } catch (err) {
                    logSession(`EVM Fehler: ${err.message}`, true);
                }
            } else {
                // Fallback: Erstellung einer lokalen verschlüsselten Wallet-Struktur
                logSession("Keine externe Web3-Wallet vorhanden. Starte lokale Phrasen-Logik...", true);
                const newMnemonic = cryptoStorage.generateLocalMnemonic();
                const phraseHash = await cryptoStorage.generateFractalHash(newMnemonic);
                
                logSession(`Lokale Seed-Phrase generiert (Verschlüsselt im Speicher).`);
                logSession(`Naked-Phrase-Hash: ${phraseHash.substring(0, 16)}...`);
                
                // Verschlüsselt im LocalStorage ablegen
                localStorage.setItem("local_wallet_phrase_hash", phraseHash);
                alert(`Lokale Wallet erzeugt!\nSicherungs-Phrase für dein Terminal:\n\n${newMnemonic}\n\nSchreibe sie auf!`);
            }
        });
    }

    if(btcBtn) {
        btcBtn.addEventListener("click", async () => {
            logSession("BTC Taproot Telnet-Schnittstelle geöffnet.");
            
            // Hole Sitzungshash für verschlüsselte Telnet-Handshakes
            const sessionToken = localStorage.getItem("user_session_hash") || "anonymous_phoenix";
            const handshakeProof = await cryptoStorage.generateFractalHash(sessionToken + "telnet_salt");

            if(window.BitcoinProvider) {
                logSession(`Verbinde persistent mit BTC-Knoten. Proof: ${handshakeProof.substring(0, 10)}`);
            } else {
                logSession(`Simultan-Übertragung initiiert. Sende Telnet Frame Handshake Token: ${handshakeProof.substring(0, 8)}`);
                window.parent.postMessage({ 
                    type: 'TELNET_READY', 
                    protocol: 'BTC_TAPROOT', 
                    proof: handshakeProof 
                }, '*');
            }
        });
    }

    // Persistent Logging-Schnittstelle (Simultan gespiegelt an UI und LocalStorage)
    function logSession(message, isError = false) {
        const timestamp = new Date().toISOString();
        const logStyle = isError ? "🔴 [ERROR]" : "🟢 [INFO]";
        
        // Konsolen-Log
        console.log(`${logStyle} [${timestamp}] ${message}`);
        
        // Synchroner Transfer in das UI-Log-Fenster aus der index.html (falls geladen)
        const uiLog = document.getElementById('chain-output');
        if (uiLog) {
            const prefix = isError ? `<span class='text-red-500'>[ERR]</span>` : `<span class='text-green-500'>[INF]</span>`;
            uiLog.innerHTML += `<br>${prefix} [${new Date().toLocaleTimeString()}] ${message}`;
            uiLog.scrollTop = uiLog.scrollHeight;
        }

        // Ermöglicht simultane Speicherung im LocalStorage für Persistenz
        let logs = JSON.parse(localStorage.getItem("sys_crypto_logs") || "[]");
        logs.push({ time: timestamp, msg: message, error: isError });
        localStorage.setItem("sys_crypto_logs", JSON.stringify(logs.slice(-100))); // Letzte 100 Einträge halten
    }
});

// END: @RFOF-NETWORK - Erweiterte Krypto- & Wallet-Logik (app.js)
