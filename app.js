// START: @RFOF-NETWORK - Vollständige Dual-Explorer & Sharding-Engine (app.js)

window.system = {
    auth: async () => {
        const email = document.getElementById('email').value || "anonymous@phoenix.net";
        const pass = document.getElementById('password').value || "no_pass_vault";
        
        const sessionHash = await cryptoEngine.generateFractalHash(email + pass);
        localStorage.setItem("user_session_hash", sessionHash);
        window.sessionStorage.setItem("active_vault_key", pass);

        // Mine den LOGIN-Statusblock
        await cryptoEngine.mineDualBlock("STATUS_LOGGEDIN", {
            user: email,
            authProof: sessionHash.substring(0, 16)
        });

        document.getElementById('account-modal').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        window.system.renderTopics();
    },

    renderTopics: () => {
        const topics = ["Nanotechnology", "Physics", "Astronomy & Space", "Earth", "Chemistry", "Biology"];
        const container = document.getElementById('topic-list');
        if(container) {
            container.innerHTML = topics.map(t => `<div class="flex items-center gap-2"><input type="checkbox" checked class="accent-orange-500"> <span>${t}</span></div>`).join('');
        }
    },

    toggleMenu: (open) => {
        const menu = document.getElementById('sidebar-menu');
        const backdrop = document.getElementById('menu-backdrop');
        if (!menu) return;
        
        if (open) {
            menu.classList.remove('hidden');
            if(backdrop) backdrop.classList.remove('hidden');
            setTimeout(() => menu.classList.remove('-translate-x-full'), 10);
        } else {
            menu.classList.add('-translate-x-full');
            if(backdrop) backdrop.classList.add('hidden');
            setTimeout(() => menu.classList.add('hidden'), 300);
        }
    },

    saveTopics: async () => {
        await cryptoEngine.mineDualBlock("STATUS_TOPICS_LOCKED", { timestamp: Date.now() });
        window.system.log("Zustand persistent auf der Blockchain verankert.");
        alert("Zustand im Ledger gesichert!");
    },

    log: (msg, type = "INF", localHash = "N/A", globalHash = "N/A") => {
        const out = document.getElementById('chain-output');
        if (out) {
            const time = new Date().toLocaleTimeString();
            const color = type === "ERR" ? "text-red-500" : type === "BLOCK" ? "text-amber-400" : "text-green-500";
            out.innerHTML += `
                <div class="${color} p-1 border-b border-slate-800/40 font-mono text-[10px]">
                    [${time}] [${type}] ${msg}<br>
                    <span class="text-slate-500 block text-[9px] pl-2">➔ L_HASH: ${localHash.substring(0,20)}... | G_HASH: ${globalHash.substring(0,20)}...</span>
                </div>`;
            out.scrollTop = out.scrollHeight;
        }
    }
};

const cryptoEngine = {
    // HIER EINFACH DEINE 2048 WORTE WIEDER EINFÜGEN
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

    sha256: async (text) => {
        const msgBuffer = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    generateFractalHash: async (input, iterations = 5) => {
        let current = input;
        for(let i = 0; i < iterations; i++) { current = await cryptoEngine.sha256(current + i); }
        return current;
    },

    generateSecureMnemonic: () => {
        let phrase = [];
        const randomValues = new Uint32Array(12);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < 12; i++) { phrase.push(cryptoEngine.bip39WordList[randomValues[i] % cryptoEngine.bip39WordList.length]); }
        return phrase.join(" ");
    },

    deriveEncryptionKey: async (password, salt) => {
        const encoder = new TextEncoder();
        const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
        return await crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    },

    encryptData: async (plaintext, password) => {
        const encoder = new TextEncoder();
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const cryptoKey = await cryptoEngine.deriveEncryptionKey(password, salt);
        const encryptedBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, cryptoKey, encoder.encode(plaintext));
        const exportArray = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
        exportArray.set(salt, 0); exportArray.set(iv, salt.length); exportArray.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
        return Array.from(exportArray).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    initDualChains: async () => {
        let localChain = JSON.parse(localStorage.getItem("rfof_local_chain") || "[]");
        let globalChain = JSON.parse(localStorage.getItem("rfof_global_chain") || "[]");

        if (localChain.length === 0) {
            const localGenesis = { index: 0, timestamp: new Date().toISOString(), status: "STATUS_REGISTERED", data: "LOCAL_GENESIS_ROOT", prevHash: "0".repeat(64), hash: "" };
            localGenesis.hash = await cryptoEngine.sha256(localGenesis.index + localGenesis.status + localGenesis.prevHash);
            localChain.push(localGenesis);
            localStorage.setItem("rfof_local_chain", JSON.stringify(localChain));
        }

        if (globalChain.length === 0) {
            const globalGenesis = { index: 0, timestamp: new Date().toISOString(), status: "GLOBAL_NETWORK_BOOT", linkedLocalHash: "GENESIS_LINK", prevHash: "0".repeat(64), hash: "" };
            globalGenesis.hash = await cryptoEngine.sha256(globalGenesis.index + globalGenesis.status + globalGenesis.linkedLocalHash + globalGenesis.prevHash);
            globalChain.push(globalGenesis);
            localStorage.setItem("rfof_global_chain", JSON.stringify(globalChain));
        }
        
        window.system.log("Dual Ledger Explorers synchronisiert.", "INF", localChain[0].hash, globalChain[0].hash);
    },

    mineDualBlock: async (statusMode, dataPayload) => {
        let localChain = JSON.parse(localStorage.getItem("rfof_local_chain") || "[]");
        let globalChain = JSON.parse(localStorage.getItem("rfof_global_chain") || "[]");

        const lastLocal = localChain[localChain.length - 1];
        const lastGlobal = globalChain[globalChain.length - 1];

        const newLocalBlock = { index: lastLocal.index + 1, timestamp: new Date().toISOString(), status: statusMode, data: dataPayload, prevHash: lastLocal.hash, hash: "" };
        newLocalBlock.hash = await cryptoEngine.sha256(newLocalBlock.index + newLocalBlock.status + JSON.stringify(dataPayload) + newLocalBlock.prevHash);
        localChain.push(newLocalBlock);

        const newGlobalBlock = { index: lastGlobal.index + 1, timestamp: newLocalBlock.timestamp, status: statusMode + "_GLOBAL_CONFIRMED", linkedLocalHash: newLocalBlock.hash, prevHash: lastGlobal.hash, hash: "" };
        newGlobalBlock.hash = await cryptoEngine.sha256(newGlobalBlock.index + newGlobalBlock.status + newGlobalBlock.linkedLocalHash + newGlobalBlock.prevHash);
        globalChain.push(newGlobalBlock);

        localStorage.setItem("rfof_local_chain", JSON.stringify(localChain));
        localStorage.setItem("rfof_global_chain", JSON.stringify(globalChain));

        window.system.log(`Block #${newLocalBlock.index} gemined! Mode: ${statusMode}`, "BLOCK", newLocalBlock.hash, newGlobalBlock.hash);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    cryptoEngine.initDualChains();

    // --- NEUE INTEGRIERTE AUTH MODAL SWITCH LOGIK ---
    const toggleAuthBtn = document.getElementById('toggle-auth-mode');
    if (toggleAuthBtn) {
        toggleAuthBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Verhindert ungewolltes Neuladen der Seite
            const title = document.getElementById('modal-title');
            const btn = document.getElementById('submit-btn');
            const helperText = document.getElementById('login-helper-text');
            
            // Sicherheitscheck: Sind die Elemente im HTML vorhanden?
            if (title && btn && helperText) {
                if (title.innerText === "Science X Login") {
                    title.innerText = "Science X Sign up";
                    btn.innerText = "Sign up";
                    helperText.innerText = "Already a member?";
                    this.innerText = "Sign in";
                } else {
                    title.innerText = "Science X Login";
                    btn.innerText = "Sign in";
                    helperText.innerText = "Not a member?";
                    this.innerText = "Sign up";
                }
            } else {
                console.warn("Einige Elemente für den Auth-Switch (modal-title, submit-btn, login-helper-text) fehlen im HTML!");
            }
        });
    }
    // --- ENDE AUTH MODAL SWITCH LOGIK ---

    const menuToggleBtn = document.getElementById("menu-toggle-btn");
    const menuCloseBtn = document.getElementById("menu-close-btn");
    const profileToggleBtn = document.getElementById("profile-toggle-btn");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const backdrop = document.getElementById("menu-backdrop");
    const accountModal = document.getElementById("account-modal");

    if(menuToggleBtn) menuToggleBtn.addEventListener("click", () => window.system.toggleMenu(true));
    if(menuCloseBtn) menuCloseBtn.addEventListener("click", () => window.system.toggleMenu(false));
    if(backdrop) backdrop.addEventListener("click", () => window.system.toggleMenu(false));

    if(profileToggleBtn) profileToggleBtn.addEventListener("click", () => accountModal?.classList.remove("hidden"));
    if(modalCloseBtn) modalCloseBtn.addEventListener("click", () => accountModal?.classList.add("hidden"));

    document.querySelectorAll(".has-submenu").forEach(item => {
        item.addEventListener("click", () => {
            const targetId = item.getAttribute("data-target");
            const sub = document.getElementById(targetId);
            const arrow = item.querySelector(".arrow");
            if (sub) {
                const isHidden = sub.classList.toggle("hidden");
                if(arrow) arrow.innerText = isHidden ? "›" : "⋁";
            }
        });
    });

    const darkmodeToggle = document.getElementById("toggle-darkmode");
    if(darkmodeToggle) {
        darkmodeToggle.addEventListener("change", (e) => {
            document.body.style.backgroundColor = e.target.checked ? "#0f172a" : "#1e293b";
            window.system.log(`Dark Mode: ${e.target.checked ? 'Active' : 'Inactive'}`);
        });
    }

    const loginForm = document.getElementById("login-form");
    if(loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            window.system.auth();
        });
    }

    const evmBtn = document.getElementById("btn-wallet-evm");
    const btcBtn = document.getElementById("btn-wallet-btc");

    if(evmBtn) {
        evmBtn.addEventListener("click", async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                await cryptoEngine.mineDualBlock("STATUS_WALLET_DEPLOYED", { type: "EVM", address: accounts });
            } else {
                const vaultKey = window.sessionStorage.getItem("active_vault_key");
                if(!vaultKey) { alert("Bitte logge dich zuerst ein!"); return; }
                const seed = cryptoEngine.generateSecureMnemonic();
                const encrypted = await cryptoEngine.encryptData(seed, vaultKey);
                localStorage.setItem("local_hot_wallet_enc", encrypted);
                await cryptoEngine.mineDualBlock("STATUS_WALLET_DEPLOYED", { type: "LOCAL_HOT_VAULT" });
                alert(`Wallet erzeugt! Mnemonic:\n\n${seed}`);
            }
        });
    }

    if(btcBtn) {
        btcBtn.addEventListener("click", async () => {
            await cryptoEngine.mineDualBlock("STATUS_WALLET_DEPLOYED", { type: "BTC_TAPROOT_TELNET" });
        });
    }
});
