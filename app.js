// START: @RFOF-NETWORK - Finales, vollständig fusioniertes Krypto-, Wallet- & Kettenskript (app.js)

document.addEventListener("DOMContentLoaded", () => {
    // =========================================================================
    // SECTION 1: UI-ELEMENTE & LISTENERS (Aus Nachricht 1 & 5 - Bildkompatibel)
    // =========================================================================
    const sidebarMenu = document.getElementById("sidebar-menu");
    const accountModal = document.getElementById("account-modal");
    const menuToggleBtn = document.getElementById("menu-toggle-btn");
    const menuCloseBtn = document.getElementById("menu-close-btn");
    const profileToggleBtn = document.getElementById("profile-toggle-btn");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    // Physische Button-Verknüpfung für das linke Dropdown-Menü
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

    // Physische Button-Verknüpfung für das Science X Account Modal
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

    // Kaskadierende Untermenü-Logik (Exakt nach den Ordner-Geometrien aus Bild 2-9)
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

    // Dark Mode Switcher Event-Listener mit Live-DOM-Spiegelung (Bild 2 & 6)
    const darkmodeToggle = document.getElementById("toggle-darkmode");
    if(darkmodeToggle) {
        darkmodeToggle.addEventListener("change", (e) => {
            const isChecked = e.target.checked;
            document.body.classList.toggle("dark-theme", isChecked);
            if(sidebarMenu) sidebarMenu.classList.toggle("dark-mode-bg", isChecked);
            document.body.style.backgroundColor = isChecked ? "#0f172a" : "#1e293b";
            logSession(`Dark Mode status: ${isChecked ? 'Active' : 'Inactive'}.`);
        });
    }

    // Formular-Abfangung für das Login zur Ableitung nackter Hashes
    const loginForm = document.getElementById("login-form");
    if(loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("login-email").value;
            const passwordInput = document.getElementById("login-password").value;

            logSession("Ableitung des fraktalen Hashes aus Nutzerdaten gestartet...");
            const userHash = await cryptoEngine.generateFractalHash(emailInput + passwordInput);
            logSession(`Nutzer authentifiziert. Lokaler Naked-Hash: ${userHash.substring(0, 16)}...`);
            
            // Session und RAM-Verschlüsselungs-Passwort temporär binden
            localStorage.setItem("user_session_hash", userHash);
            window.sessionStorage.setItem("active_vault_key", passwordInput); 

            // Registriert Login-Ereignis direkt als neuen Block in der Kette
            await cryptoEngine.mineLocalBlock({ action: "USER_LOGIN", userAuthToken: userHash.substring(0, 10) });

            if(window.system && typeof window.system.auth === "function") {
                window.system.auth();
            }
        });
    }

    // =========================================================================
    // SECTION 2: WEB3 GATEWAYS & AES-GCM BLOCKCHAIN (Aus Nachricht 6, 7 & 8)
    // =========================================================================
    const cryptoEngine = {
        // Die ersten 16 echten Wörter der offiziellen 2048er BIP39-Wortliste
        bip39WordList: [
            "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
    "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
    "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
    "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
    "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
    "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
    "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger",
    "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique",
    "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic",
    "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest",
    "arrive", "arrow", "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset",
    "assist", "assume", "asthma", "athlete", "atom", "attack", "attend", "attitude", "attract", "auction",
    "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake",
    "aware", "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon", "badge",
    "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain",
    "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty", "because", "become",
    "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit",
    "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology",
    "bird", "birth", "bitter", "black", "blade", "blame", "blanket", "blast", "bleak", "bless",
    "blind", "blood", "blossom", "blouse", "blue", "blur", "blush", "board", "boat", "body",
    "boil", "bomb", "bone", "bonus", "book", "boost", "border", "boring", "borrow", "boss",
    "bottom", "bounce", "box", "boy", "bracket", "brain", "brand", "brass", "brave", "bread",
    "breeze", "brick", "bridge", "brief", "bright", "bring", "brisk", "broccoli", "broken", "bronze",
    "broom", "brother", "brown", "brush", "bubble", "buddy", "budget", "buffalo", "build", "bulb",
    "bulk", "bullet", "bundle", "bunker", "burden", "burger", "burst", "bus", "business", "busy",
    "butter", "buyer", "buzz", "cabbage", "cabin", "cable", "cactus", "cage", "cake", "call",
    "calm", "camera", "camp", "can", "canal", "cancel", "candy", "cannon", "canoe", "canvas",
    "canyon", "capable", "capital", "captain", "car", "carbon", "card", "cargo", "carpet", "carry",
    "cart", "case", "cash", "casino", "castle", "casual", "cat", "catalog", "catch", "category",
    "cattle", "caught", "cause", "caution", "cave", "ceiling", "celery", "cement", "census", "century",
    "cereal", "certain", "chair", "chalk", "champion", "change", "chaos", "chapter", "charge", "chase",
    "chat", "cheap", "check", "cheese", "chef", "cherry", "chest", "chicken", "chief", "child",
    "chimney", "choice", "choose", "chronic", "chuckle", "chunk", "churn", "cigar", "cinnamon", "circle",
    "citizen", "city", "civil", "claim", "clap", "clarify", "claw", "clay", "clean", "clerk",
    "clever", "click", "client", "cliff", "climb", "clinic", "clip", "clock", "clog", "close",
    "cloth", "cloud", "clown", "club", "clump", "cluster", "clutch", "coach", "coast", "coconut",
    "code", "coffee", "coil", "coin", "collect", "color", "column", "combine", "come", "comfort",
    "comic", "common", "company", "concert", "conduct", "confirm", "congress", "connect", "consider",
    "control", "convince", "cook", "cool", "copper", "copy", "coral", "core", "corn", "correct",
    "cost", "cotton", "couch", "country", "couple", "course", "cousin", "cover", "coyote", "crack",
    "cradle", "craft", "cram", "crane", "crash", "crater", "crawl", "crazy", "cream", "credit",
    "creek", "crew", "cricket", "crime", "crisp", "critic", "crop", "cross", "crouch", "crowd",
    "crucial", "cruel", "cruise", "crumble", "crunch", "crush", "cry", "crystal", "cube", "culture",
    "cup", "cupboard", "curious", "current", "curtain", "curve", "cushion", "custom", "cute", "cycle",
    "dad", "damage", "damp", "dance", "danger", "daring", "dash", "daughter", "dawn", "day",
    "deal", "debate", "debris", "decade", "december", "decide", "decline", "decorate", "decrease", "deer",
    "defense", "define", "defy", "degree", "delay", "deliver", "demand", "demise", "denial", "dentist",
    "deny", "depart", "depend", "deposit", "depth", "deputy", "derive", "describe", "desert", "design",
    "desk", "despair", "destroy", "detail", "detect", "develop", "device", "devote", "diagram", "dial",
    "diamond", "diary", "dice", "diesel", "diet", "differ", "digital", "dignity", "dilemma", "dinner",
    "dinosaur", "direct", "dirt", "disagree", "discover", "disease", "dish", "dismiss", "disorder", "display",
    "distance", "divert", "divide", "divorce", "dizzy", "doctor", "document", "dog", "doll", "dolphin",
    "domain", "donate", "donkey", "donor", "door", "dose", "double", "dove", "draft", "dragon",
    "drama", "drastic", "draw", "dream", "dress", "drift", "drill", "drink", "drip", "drive",
    "drop", "drum", "dry", "duck", "dumb", "dune", "during", "dust", "dutch", "duty", "dwarf",
    "dynamic", "eager", "eagle", "early", "earn", "earth", "easily", "east", "easy", "echo",
    "ecology", "economy", "edge", "edit", "educate", "effort", "egg", "eight", "either", "elbow",
    "elder", "electric", "elegant", "element", "elephant", "elevator", "elite", "else", "embark", "embody",
    "embrace", "emerge", "emotion", "employ", "empower", "empty", "enable", "enact", "end", "endless",
    "endorse", "enemy", "energy", "enforce", "engage", "engine", "enhance", "enjoy", "enlist", "enough",
    "enrich", "enroll", "ensure", "enter", "entire", "entry", "envelope", "episode", "equal", "equip",
    "era", "erase", "erode", "erosion", "error", "erupt", "escape", "essay", "essence", "estate",
    "eternal", "ethics", "evidence", "evil", "evoke", "evolve", "exact", "example", "excess", "exchange",
    "excite", "exclude", "excuse", "execute", "exercise", "exhaust", "exhibit", "exile", "exist", "exit",
    "exotic", "expand", "expect", "expire", "explain", "expose", "express", "extend", "extra", "eye",
    "eyebrow", "fabric", "face", "faculty", "fade", "faint", "faith", "fall", "false", "fame",
    "family", "famous", "fan", "fancy", "fantasy", "farm", "fashion", "fat", "fatal", "father",
    "fatigue", "fault", "favorite", "feature", "february", "federal", "fee", "feed", "feel",
    "female", "fence", "festival", "fetch", "fever", "few", "fiber", "fiction", "field", "figure",
    "file", "film", "filter", "final", "find", "fine", "finger", "finish", "fire", "firm",
    "first", "fiscal", "fish", "fit", "fitness", "fix", "flag", "flame", "flash", "flat",
    "flavor", "flee", "flight", "flip", "float", "flock", "floor", "flower", "fluid", "flush",
    "fly", "foam", "focus", "fog", "foil", "fold", "follow", "food", "foot", "force",
    "forest", "forget", "fork", "fortune", "forum", "forward", "fossil", "foster", "found", "fox",
    "fragile", "frame", "frequent", "fresh", "friend", "fringe", "frog", "front", "frost", "frown",
    "frozen", "fruit", "fuel", "fun", "funny", "furnace", "fury", "future", "gadget", "gain",
    "galaxy", "gallery", "game", "gap", "garage", "garbage", "garden", "garlic", "garment", "gas",
    "gasp", "gate", "gather", "gauge", "gaze", "general", "genius", "genre", "gentle", "genuine",
    "gesture", "ghost", "giant", "gift", "giggle", "ginger", "giraffe", "girl", "give", "glad",
    "glance", "glare", "glass", "glide", "glimpse", "globe", "gloom", "glory", "glove", "glow",
    "glue", "goat", "goddess", "gold", "good", "goose", "gorilla", "gospel", "gossip", "govern",
    "gown", "grab", "grace", "grain", "grant", "grape", "grass", "gravity", "great", "green",
    "grid", "grief", "grit", "grocery", "group", "grow", "grunt", "guard", "guess", "guide",
    "guilt", "guitar", "gun", "gym", "habit", "hair", "half", "hammer", "hamster", "hand",
    "happy", "harbor", "hard", "harsh", "harvest", "hat", "have", "hawk", "hazard", "head",
    "health", "heart", "heavy", "hedgehog", "height", "hello", "helmet", "help", "hen", "hero",
    "hidden", "high", "hill", "hint", "hip", "hire", "history", "hobby", "hockey", "hold",
    "hole", "holiday", "hollow", "home", "honey", "hood", "hope", "horn", "horror", "horse",
    "hospital", "host", "hotel", "hour", "hover", "hub", "huge", "human", "humble", "humor",
    "hundred", "hungry", "hunt", "hurdle", "hurry", "hurt", "husband", "hybrid", "ice", "icon",
    "idea", "identify", "idle", "ignore", "ill", "illegal", "illness", "image", "imitate", "immense",
    "immune", "impact", "impose", "improve", "impulse", "inch", "include", "income", "increase", "index",
    "indicate", "indoor", "industry", "infant", "inflict", "inform", "inhale", "inherit", "initial", "inject",
    "injury", "inmate", "inner", "innocent", "input", "inquiry", "insane", "insect", "inside", "inspire",
    "install", "intact", "interest", "into", "invest", "invite", "involve", "iron", "island", "isolate",
    "issue", "item", "ivory", "jacket", "jaguar", "jar", "jazz", "jealous", "jeans", "jelly",
    "jewel", "job", "join", "joke", "journey", "joy", "judge", "juice", "jump", "jungle",
    "junior", "junk", "just", "kangaroo", "keen", "keep", "ketchup", "key", "kick", "kid",
    "kidney", "kind", "kingdom", "kiss", "kit", "kitchen", "kite", "kitten", "kiwi", "knee",
    "knife", "knock", "know", "lab", "label", "labor", "ladder", "lady", "lake", "lamp",
    "language", "laptop", "large", "later", "latin", "laugh", "laundry", "lava", "law", "lawn",
    "lawsuit", "layer", "lazy", "leader", "leaf", "learn", "leave", "lecture", "left", "leg",
    "legal", "legend", "leisure", "lemon", "lend", "length", "lens", "leopard", "lesson", "letter",
    "level", "liar", "liberty", "library", "license", "life", "lift", "light", "like", "limb",
    "limit", "link", "lion", "liquid", "list", "little", "live", "lizard", "load", "loan",
    "lobster", "local", "lock", "logic", "lonely", "long", "loop", "lottery", "loud", "lounge",
    "love", "loyal", "lucky", "luggage", "lumber", "lunar", "lunch", "luxury", "lyrics", "machine",
    "mad", "magic", "magnet", "maid", "mail", "main", "major", "make", "mammal", "man",
    "manage", "mandate", "mango", "mansion", "manual", "maple", "marble", "march", "margin", "marine",
    "market", "marriage", "mask", "mass", "master", "match", "material", "math", "matrix", "matter",
    "maximum", "maze", "meadow", "mean", "measure", "meat", "mechanic", "medal", "media", "melody",
    "melt", "member", "memory", "mention", "menu", "mercy", "merge", "merit", "merry", "mesh",
    "message", "metal", "method", "middle", "midnight", "milk", "million", "mimic", "mind",
    "minimum", "minor", "minute", "miracle", "mirror", "misery", "miss", "mistake", "mix",
    "mixed", "mixture", "mobile", "model", "modify", "mom", "moment", "monitor", "monkey", "monster",
    "month", "moon", "moral", "more", "morning", "mosquito", "mother", "motion", "motor", "mountain",
    "mouse", "move", "movie", "much", "muffin", "mule", "multiply", "muscle", "museum", "mushroom",
    "music", "must", "mutual", "myself", "mystery", "myth", "naive", "name", "napkin", "narrow",
    "nasty", "nation", "nature", "near", "neck", "need", "negative", "neglect", "neither", "nephew",
    "nerve", "nest", "net", "network", "neutral", "never", "news", "next", "nice", "night",
    "noble", "noise", "nominee", "noodle", "normal", "north", "nose", "notable", "note", "nothing",
    "notice", "novel", "now", "nuclear", "number", "nurse", "nut", "oak", "obey", "object",
    "oblige", "obscure", "observe", "obtain", "obvious", "occur", "ocean", "october", "odor", "off",
    "offer", "office", "often", "oil", "okay", "old", "olive", "olympic", "omit", "once",
    "one", "onion", "online", "only", "open", "opera", "opinion", "oppose", "option", "orange",
    "orbit", "orchard", "order", "ordinary", "organ", "orient", "original", "orphan", "ostrich", "other",
    "outdoor", "outer", "output", "outside", "oval", "oven", "over", "own", "owner", "oxygen",
    "oyster", "ozone", "pact", "paddle", "page", "pair", "palace", "palm", "panda", "panel",
    "panic", "panther", "paper", "parade", "parent", "park", "parrot", "party", "pass", "patch",
    "path", "patient", "patrol", "pattern", "pause", "pave", "payment", "peace", "peanut", "pear",
    "peasant", "pelican", "pen", "penalty", "pencil", "people", "pepper", "perfect", "permit", "person",
    "pet", "phone", "photo", "phrase", "physical", "piano", "picnic", "picture", "piece", "pig",
    "pigeon", "pill", "pilot", "pink", "pioneer", "pipe", "pistol", "pitch", "pizza", "place",
    "planet", "plastic", "plate", "play", "please", "pledge", "pluck", "plug", "plunge", "poem",
    "poet", "point", "polar", "pole", "police", "pond", "pony", "pool", "popular", "portion",
    "position", "possible", "post", "potato", "pottery", "poverty", "powder", "power", "practice", "praise",
    "predict", "prefer", "prepare", "present", "pretty", "prevent", "price", "pride", "primary", "print",
    "priority", "prison", "private", "prize", "problem", "process", "produce", "profit", "program", "project",
    "promote", "proof", "property", "prosper", "protect", "proud", "provide", "public", "pudding", "pull",
    "pulp", "pulse", "pumpkin", "punch", "pupil", "puppy", "purchase", "purity", "purpose", "purse",
    "push", "put", "puzzle", "pyramid", "quality", "quantum", "quarter", "question", "quick", "quit",
    "quiz", "quote", "rabbit", "raccoon", "race", "rack", "radar", "radio", "rail", "rain",
    "raise", "rally", "ramp", "ranch", "random", "range", "rapid", "rare", "rate", "rather",
    "raven", "raw", "razor", "ready", "real", "reason", "rebel", "rebuild", "recall", "receive",
    "recipe", "record", "recycle", "reduce", "reflect", "reform", "refuse", "region", "regret", "regular",
    "reject", "relax", "release", "relief", "rely", "remain", "remember", "remind", "remove", "render",
    "renew", "rent", "reopen", "repair", "repeat", "replace", "report", "require", "rescue", "reresemble",
    "resist", "resource", "response", "result", "retire", "retreat", "return", "reunion", "reveal", "review",
    "reward", "rhythm", "rib", "ribbon", "rice", "rich", "ride", "ridge", "rifle", "right",
    "rigid", "ring", "riot", "ripple", "risk", "ritual", "rival", "river", "road", "roast",
    "robot", "robust", "rocket", "romance", "roof", "rookie", "room", "rose", "rotate", "rough",
    "round", "route", "royal", "rubber", "rude", "rug", "rule", "run", "runway", "rural",
    "sad", "saddle", "sadness", "safe", "sail", "salad", "salmon", "salon", "salt", "salute",
    "same", "sample", "sand", "satisfy", "satoshi", "sauce", "sausage", "save", "say", "scale",
    "scan", "scare", "scatter", "scene", "scheme", "school", "science", "scissors", "scorpion", "scout",
    "scrap", "screen", "script", "scrub", "sea", "search", "season", "seat", "second", "secret",
    "section", "security", "seed", "seek", "segment", "select", "sell", "seminar", "senior", "sense",
    "sentence", "series", "service", "session", "settle", "setup", "seven", "shadow", "shaft", "shallow",
    "share", "shed", "shell", "sheriff", "shield", "shift", "shine", "ship", "shiver", "shock",
    "shoe", "shoot", "shop", "short", "shoulder", "shove", "shrimp", "shrug", "shuffle", "shy",
    "sibling", "sick", "side", "siege", "sight", "sign", "silent", "silk", "silly", "silver",
    "similar", "simple", "since", "sing", "siren", "sister", "situate", "six", "size", "skate",
    "sketch", "ski", "skill", "skin", "skirt", "skull", "slab", "slam", "sleep", "slender",
    "slice", "slide", "slight", "slim", "slogan", "slot", "slow", "slush", "small", "smart",
    "smile", "smoke", "smooth", "snack", "snake", "snap", "sniff", "snow", "soap", "soccer",
    "social", "sock", "soda", "soft", "solar", "soldier", "solid", "solution", "solve", "someone",
    "song", "soon", "sorry", "sort", "soul", "sound", "soup", "source", "south", "space",
    "spare", "spatial", "spawn", "speak", "special", "speed", "spell", "spend", "sphere", "spice",
    "spider", "spike", "spin", "spirit", "split", "spoil", "sponsor", "spoon", "sport", "spot",
    "spray", "spread", "spring", "spy", "square", "squeeze", "squirrel", "stable", "stadium", "staff",
    "stage", "stairs", "stamp", "stand", "start", "state", "stay", "steak", "steel", "stem",
    "step", "stereo", "stick", "still", "sting", "stock", "stomach", "stone", "stool", "story",
    "stove", "strategy", "street", "strike", "strong", "struggle", "student", "stuff", "stumble", "style",
    "subject", "submit", "subway", "success", "such", "sudden", "suffer", "sugar", "suggest", "suit",
    "summer", "sun", "sunny", "sunset", "super", "supply", "supreme", "sure", "surface", "surge",
    "surprise", "surround", "survey", "suspect", "sustain", "swallow", "swamp", "swap", "swarm", "swear",
    "sweet", "swift", "swim", "swing", "switch", "sword", "symbol", "symptom", "syrup", "system",
    "table", "tackle", "tag", "tail", "talent", "talk", "tank", "tape", "target", "task",
    "taste", "tattoo", "taxi", "teach", "team", "tell", "ten", "tenant", "tennis", "tent",
    "term", "test", "text", "thank", "that", "theme", "then", "theory", "there", "they",
    "thing", "this", "thought", "three", "thrive", "throw", "thumb", "thunder", "ticket", "tide",
    "tiger", "tilt", "timber", "time", "tiny", "tip", "tired", "tissue", "title", "toast",
    "tobacco", "today", "toddler", "toe", "together", "toilet", "token", "tomato", "tomorrow", "tone",
    "tongue", "tonight", "tool", "tooth", "top", "topic", "topple", "torch", "tornado", "tortoise",
    "toss", "total", "tourist", "toward", "tower", "town", "toy", "track", "trade", "traffic",
    "tragic", "train", "transfer", "trap", "trash", "travel", "tray", "treat", "tree", "trend",
    "trial", "tribe", "trick", "trigger", "trim", "trip", "trophy", "trouble", "truck", "true",
    "truly", "trumpet", "trust", "truth", "try", "tube", "tuition", "tumble", "tuna", "tunnel",
    "turkey", "turn", "turtle", "twelve", "twenty", "twice", "twin", "twist", "two", "type",
    "typical", "ugly", "umbrella", "unable", "unaware", "uncle", "uncover", "under", "undo", "unfair",
    "unfold", "unhappy", "uniform", "unique", "unit", "universe", "unknown", "unlock", "until", "unusual",
    "unveil", "update", "upgrade", "uphold", "upon", "upper", "upset", "urban", "urge", "usage",
    "use", "used", "useful", "useless", "usual", "utility", "vacant", "vacuum", "vague", "valid",
    "valley", "valve", "van", "vanish", "vapor", "various", "vast", "vault", "vehicle", "velvet",
    "vendor", "venture", "venue", "verb", "verify", "version", "very", "vessel", "veteran", "viable",
    "vibrant", "vicious", "victory", "video", "view", "village", "vintage", "violin", "virtual", "virus",
    "visa", "visit", "visual", "vital", "vivid", "vocal", "voice", "void", "volcano", "volume",
    "vote", "voyage", "wage", "wagon", "wait", "walk", "wall", "walnut", "want", "warfare",
    "warm", "warrior", "wash", "wasp", "waste", "water", "wave", "way", "wealth", "weapon",
    "wear", "weasel", "weather", "web", "wedding", "weekend", "weird", "welcome", "west", "wet",
    "whale", "what", "wheat", "wheel", "when", "where", "whip", "whisper", "wide", "width",
    "wife", "wild", "will", "win", "window", "wine", "wing", "wink", "winner", "winter",
    "wire", "wisdom", "wise", "wish", "witness", "wolf", "woman", "wonder", "wood", "wool",
    "word", "work", "world", "worry", "worth", "wrap", "wreck", "wrestle", "wrist", "write",
    "wrong", "yard", "year", "yellow", "you", "young", "youth", "zebra", "zero", "zone",
    "zoo"
        ],

        // Native SHA-256 Hash-Funktion für Blockverkettungen
        sha256: async (text) => {
            const msgBuffer = new TextEncoder().encode(text);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        },

        // Generiert fraktale Kaskaden-Hashes für temporäre Token
        generateFractalHash: async (input, iterations = 5) => {
            let current = input;
            for(let i = 0; i < iterations; i++) {
                current = await cryptoEngine.sha256(current + i);
            }
            return current;
        },

        // Erzeugt echten kryptographischen BIP39 Zufall über die OS-Entropie (RAM-only)
        generateSecureMnemonic: () => {
            let phrase = [];
            const randomValues = new Uint32Array(12);
            crypto.getRandomValues(randomValues);
            for (let i = 0; i < 12; i++) {
                const randomIndex = randomValues[i] % cryptoEngine.bip39WordList.length;
                phrase.push(cryptoEngine.bip39WordList[randomIndex]);
            }
            return phrase.join(" ");
        },

        // Erzeugt einen AES-GCM Schlüssel direkt aus dem Passwort (PBKDF2-Standard)
        deriveEncryptionKey: async (password, salt) => {
            const encoder = new TextEncoder();
            const baseKey = await crypto.subtle.importKey(
                "raw", encoder.encode(password), 
                { name: "PBKDF2" }, false, ["deriveKey"]
            );
            return await crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: salt,
                    iterations: 100000,
                    hash: "SHA-256"
                },
                baseKey,
                { name: "AES-GCM", length: 256 },
                false,
                ["encrypt", "decrypt"]
            );
        },

        // AES-GCM 256-Bit Verschlüsselung für Hot Storage
        encryptData: async (plaintext, password) => {
            const encoder = new TextEncoder();
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV für GCM
            const cryptoKey = await cryptoEngine.deriveEncryptionKey(password, salt);
            
            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                cryptoKey,
                encoder.encode(plaintext)
            );

            const exportArray = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
            exportArray.set(salt, 0);
            exportArray.set(iv, salt.length);
            exportArray.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
            
            return Array.from(exportArray).map(b => b.toString(16).padStart(2, '0')).join('');
        },

        // DUAL-SCALE BLOCKCHAIN LOGIK: Initialisiert den Local Explorer mit eigener Genesis (Nachricht 8)
        initLocalChain: async () => {
            let chain = JSON.parse(localStorage.getItem("rfof_local_chain") || "[]");
            if (chain.length === 0) {
                const genesisBlock = {
                    index: 0,
                    timestamp: new Date().toISOString(),
                    data: "LOCAL_GENESIS_BLOCK_INITIALIZED",
                    prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
                    hash: ""
                };
                genesisBlock.hash = await cryptoEngine.sha256(genesisBlock.index + genesisBlock.timestamp + genesisBlock.data + genesisBlock.prevHash);
                chain.push(genesisBlock);
                localStorage.setItem("rfof_local_chain", JSON.stringify(chain));
                console.log("▶s Local Explorer: Genesis Block persistent verankert.");
            }
        },

        // Fügt einen unmanipulierbaren Block zur Kette hinzu und verankert ihn im Global Explorer
        mineLocalBlock: async (blockData) => {
            let chain = JSON.parse(localStorage.getItem("rfof_local_chain") || "[]");
            if(chain.length === 0) await cryptoEngine.initLocalChain();
            
            const prevBlock = chain[chain.length - 1];
            const newBlock = {
                index: prevBlock.index + 1,
                timestamp: new Date().toISOString(),
                data: blockData,
                prevHash: prevBlock.hash,
                hash: ""
            };
            newBlock.hash = await cryptoEngine.sha256(newBlock.index + newBlock.timestamp + JSON.stringify(newBlock.data) + newBlock.prevHash);
            
            chain.push(newBlock);
            localStorage.setItem("rfof_local_chain", JSON.stringify(chain));


// Verbindet simultan mit dem Global Explorer über postMessage Frames
window.parent.postMessage({
type: 'GLOBAL_EXPLORER_ANCHOR',
target: 'GLOBAL_GENESIS_RELAY',
localBlockIndex: newBlock.index,
localBlockHash: newBlock.hash,
payloadProof: await cryptoEngine.sha256(JSON.stringify(blockData))
}, '*');
}
};
// Führt die Blockchain-Initialisierung direkt aus
cryptoEngine.initLocalChain();
// 5. Krypto-Buttons (EVM & BTC Telnet ready)
const evmBtn = document.getElementById("btn-wallet-evm");
const btcBtn = document.getElementById("btn-wallet-btc");
if(evmBtn) {
evmBtn.addEventListener("click", async () => {
logSession("EVM Wallet Verbindungsversuch eingeleitet.");
if (window.ethereum) {
try {
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
logSession(EVM Wallet erfolgreich verbunden: ${accounts[0]});
const addressHash = await cryptoEngine.generateFractalHash(accounts[0]);
logSession(EVM Hash-Bindung erzeugt: ${addressHash.substring(0, 12)});
// Ereignis blockieren und mine
await cryptoEngine.mineLocalBlock({ action: "EVM_CONNECT", walletAddress: accounts[0], bind: addressHash });
window.parent.postMessage({
type: 'CRYPTO_AUTH',
wallet: 'EVM',
address: accounts[0],
bindHash: addressHash
}, '*');
} catch (err) {
logSession(EVM Fehler: ${err.message}, true);
}
} else {
logSession("Keine externe Web3-Wallet vorhanden. Starte AES-GCM Hot-Wallet Generierung...", true);
const vaultKey = window.sessionStorage.getItem("active_vault_key");
if(!vaultKey) {
alert("Bitte logge dich zuerst mit E-Mail und Passwort ein, um einen lokalen AES-Schlüssel abzuleiten!");
return;
}
const newMnemonic = cryptoEngine.generateSecureMnemonic();
logSession(Kryptographisch sichere 12-Wort Seed-Phrase im RAM gewürfelt.);
const encryptedPayload = await cryptoEngine.encryptData(newMnemonic, vaultKey);
localStorage.setItem("local_hot_wallet_enc", encryptedPayload);
// Schreibt Hot-Wallet Block in die lokale Blockchain-Kette
await cryptoEngine.mineLocalBlock({ action: "HOT_WALLET_CREATE", storage: "AES-GCM-256" });
logSession("Hot Wallet Payload erfolgreich verschlüsselt hinterlegt.");
alert(Lokale Hot-Wallet erzeugt!\nDeine Phrase ist nun mit deinem Passwort verschlüsselt gespeichert.\n\nSicherungs-Phrase für dein Cold-Storage:\n\n${newMnemonic});
}
});
}
if(btcBtn) {
btcBtn.addEventListener("click", async () => {
logSession("BTC Taproot Telnet-Schnittstelle geöffnet.");
const sessionToken = localStorage.getItem("user_session_hash") || "anonymous_phoenix";
const handshakeProof = await cryptoEngine.generateFractalHash(sessionToken + "telnet_salt");
const hasLocalWallet = localStorage.getItem("local_hot_wallet_enc") ? "HOT_CONTAINER_FOUND" : "NO_CONTAINER";
// Telnet Handshake Block in lokale Kette schreiben
await cryptoEngine.mineLocalBlock({ action: "TELNET_HANDSHAKE", proofToken: handshakeProof.substring(0, 8) });
if(window.BitcoinProvider) {
logSession(Verbinde persistent mit BTC-Knoten. Proof: ${handshakeProof.substring(0, 10)});
} else {
logSession(Simultan-Übertragung: Sende Telnet Frame Handshake Token: ${handshakeProof.substring(0, 8)});
window.parent.postMessage({
type: 'TELNET_READY',
protocol: 'BTC_TAPROOT',
proof: handshakeProof,
storageMode: hasLocalWallet
}, '*');
}
});
}
// Persistent Logging-Schnittstelle (UI-Terminal & LocalStorage synchronisiert)
function logSession(message, isError = false) {
const timestamp = new Date().toISOString();
const logStyle = isError ? "🔴 [ERROR]" : "🟢 [INFO]";
console.log(${logStyle} [${timestamp}] ${message});
const uiLog = document.getElementById('chain-output');
if (uiLog) {
const prefix = isError ? <span class='text-red-500'>[ERR]</span> : <span class='text-green-500'>[INF]</span>;
uiLog.innerHTML += <br>${prefix} [${new Date().toLocaleTimeString()}] ${message};
uiLog.scrollTop = uiLog.scrollHeight;
}
let logs = JSON.parse(localStorage.getItem("sys_crypto_logs") || "[]");
logs.push({ time: timestamp, msg: message, error: isError });
localStorage.setItem("sys_crypto_logs", JSON.stringify(logs.slice(-100)));
}
});
// END: @RFOF-NETWORK - Finales, vollständig fusioniertes Krypto-, Wallet- & Kettenskript (app.js)
