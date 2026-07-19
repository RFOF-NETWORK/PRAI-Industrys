// START: Phys.org / Science X Logik-Skript

document.addEventListener("DOMContentLoaded", () => {
    // UI Elemente abgreifen
    const sidebarMenu = document.getElementById("sidebar-menu");
    const accountModal = document.getElementById("account-modal");
    const menuToggleBtn = document.getElementById("menu-toggle-btn");
    const menuCloseBtn = document.getElementById("menu-close-btn");
    const profileToggleBtn = document.getElementById("profile-toggle-btn");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    // 1. Sidebar Toggling (Auf/Zu)
    if(menuToggleBtn) {
        menuToggleBtn.addEventListener("click", () => sidebarMenu.classList.remove("hidden"));
    }
    if(menuCloseBtn) {
        menuCloseBtn.addEventListener("click", () => sidebarMenu.classList.add("hidden"));
    }

    // 2. Account Modal Toggling
    if(profileToggleBtn) {
        profileToggleBtn.addEventListener("click", () => accountModal.classList.remove("hidden"));
    }
    if(modalCloseBtn) {
        modalCloseBtn.addEventListener("click", () => accountModal.classList.add("hidden"));
    }

    // 3. Kaskadierendes Dropdown-Menü (Verschachtelung aus den Bildern 2-9)
    const submenus = document.querySelectorAll(".has-submenu");
    submenus.forEach(item => {
        item.addEventListener("click", () => {
            const targetId = item.getAttribute("data-target");
            const targetSubmenu = document.getElementById(targetId);
            const arrow = item.querySelector(".arrow");

            if (targetSubmenu.classList.contains("hidden")) {
                targetSubmenu.classList.remove("hidden");
                if(arrow) arrow.innerText = "⋁";
                item.classList.add("active-menu");
            } else {
                targetSubmenu.classList.add("hidden");
                if(arrow) arrow.innerText = "›";
                item.classList.remove("active-menu");
            }
        });
    });

    // 4. Dark Mode Switcher (Bild 2 & 6)
    const darkmodeToggle = document.getElementById("toggle-darkmode");
    if(darkmodeToggle) {
        darkmodeToggle.addEventListener("change", (e) => {
            if(e.target.checked) {
                document.body.classList.add("dark-theme");
                sidebarMenu.classList.add("dark-mode-bg");
            } else {
                document.body.classList.remove("dark-theme");
                sidebarMenu.classList.remove("dark-mode-bg");
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
                    // Verbindung via Frames an verbundene Services übermitteln
                    window.parent.postMessage({ type: 'CRYPTO_AUTH', wallet: 'EVM', address: accounts[0] }, '*');
                } catch (err) {
                    logSession(`EVM Fehler: ${err.message}`, true);
                }
            } else {
                alert("Keine EVM-Wallet (z.B. MetaMask) gefunden.");
            }
        });
    }

    if(btcBtn) {
        btcBtn.addEventListener("click", () => {
            logSession("BTC Taproot Telnet-Schnittstelle geöffnet.");
            // Hier wird das Telnet-Protokoll-Handling über deinen Nachrichtendienst getriggert
            if(window.BitcoinProvider) {
                logSession("Verbinde persistent mit BTC-Knoten-Schnittstelle...");
            } else {
                logSession("Simultan-Übertragung: Warte auf BTC Telnet Frame Handshake.");
            }
        });
    }

    // Persistent Logging-Schnittstelle
    function logSession(message, isError = false) {
        const timestamp = new Date().toISOString();
        const logStyle = isError ? "🔴 [ERROR]" : "🟢 [INFO]";
        console.log(`${logStyle} [${timestamp}] ${message}`);
        // Ermöglicht simultane Speicherung im LocalStorage für Persistenz
        let logs = JSON.parse(localStorage.getItem("sys_crypto_logs") || "[]");
        logs.push({ time: timestamp, msg: message, error: isError });
        localStorage.setItem("sys_crypto_logs", JSON.stringify(logs.slice(-100))); // Letzte 100 Einträge halten
    }
});

// END: Phys.org / Science X Logik-Skript
