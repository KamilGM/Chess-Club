// ============================================================
// SUPABASE CONFIGURATION
// Replace these two values with your matchmaking Supabase project
// ============================================================

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ============================================================
// MATCHMAKING RANKS
// Strongest -> weakest
// ============================================================

const RANKS = [
    "Great",
    "Good",
    "Mid",
    "Alright",
    "Eh"
];


// ============================================================
// PAGE ELEMENTS
// ============================================================

const playerSelect = document.getElementById("playerSelect");

const playerCard = document.getElementById("playerCard");
const opponentCard = document.getElementById("opponentCard");

const playerName = document.getElementById("playerName");
const playerRank = document.getElementById("playerRank");

const opponentName = document.getElementById("opponentName");
const opponentRank = document.getElementById("opponentRank");

const randomizeButton = document.getElementById("randomizeButton");
const statusMessage = document.getElementById("statusMessage");

const adminButton = document.getElementById("adminButton");
const adminPanel = document.getElementById("adminPanel");
const closeAdminButton = document.getElementById("closeAdminButton");

const adminCode = document.getElementById("adminCode");
const adminLoginButton = document.getElementById("adminLoginButton");
const adminLoginMessage = document.getElementById("adminLoginMessage");

const adminLoginArea = document.getElementById("adminLoginArea");
const adminControls = document.getElementById("adminControls");
const playerManagement = document.getElementById("playerManagement");


// ============================================================
// DATA
// ============================================================

let players = [];
let isAdmin = false;


// ============================================================
// STARTUP
// ============================================================

document.addEventListener("DOMContentLoaded", loadPlayers);


// ============================================================
// LOAD PLAYERS FROM SUPABASE
// ============================================================

async function loadPlayers() {
    setStatus("Loading players...");

    const { data, error } = await db
        .from("players")
        .select("id, name, rank")
        .order("name", { ascending: true });

    if (error) {
        console.error(error);
        setStatus("Could not load players from Supabase.", true);
        return;
    }

    players = data || [];

    populatePlayerSelector();

    if (players.length === 0) {
        setStatus("No players are currently available.");
        randomizeButton.disabled = true;
        return;
    }

    setStatus("");
}


// ============================================================
// PLAYER SELECTOR
// ============================================================

function populatePlayerSelector() {
    playerSelect.innerHTML = `
        <option value="">Select a player...</option>
    `;

    players.forEach(player => {
        const option = document.createElement("option");

        option.value = player.id;
        option.textContent = `${player.name} (${player.rank})`;

        playerSelect.appendChild(option);
    });

    randomizeButton.disabled = true;
}


// ============================================================
// PLAYER SELECTION
// ============================================================

playerSelect.addEventListener("change", () => {
    const selectedPlayer = getSelectedPlayer();

    opponentName.textContent = "Waiting...";
    opponentRank.textContent = "—";
    opponentRank.className = "rank-badge";

    if (!selectedPlayer) {
        playerName.textContent = "Select a player";
        playerRank.textContent = "—";
        playerRank.className = "rank-badge";

        randomizeButton.disabled = true;
        playerCard.classList.remove("selected");
        opponentCard.classList.remove("selected");

        return;
    }

    playerName.textContent = selectedPlayer.name;
    playerRank.textContent = selectedPlayer.rank;

    setRankBadge(playerRank, selectedPlayer.rank);

    playerCard.classList.add("selected");
    opponentCard.classList.remove("selected");

    randomizeButton.disabled = false;

    setStatus("");
});


// ============================================================
// GET SELECTED PLAYER
// ============================================================

function getSelectedPlayer() {
    const id = playerSelect.value;

    if (!id) {
        return null;
    }

    return players.find(player => String(player.id) === String(id)) || null;
}


// ============================================================
// MATCHMAKING
// ============================================================

function getOpponentPool(selectedPlayer) {
    const availablePlayers = players.filter(
        player => String(player.id) !== String(selectedPlayer.id)
    );

    if (availablePlayers.length === 0) {
        return [];
    }

    const rank = selectedPlayer.rank;

    let preferredRanks = [];

    switch (rank) {
        case "Great":
            preferredRanks = getGreatPreferences(availablePlayers);
            break;

        case "Good":
            preferredRanks = getGoodPreferences(availablePlayers);
            break;

        case "Mid":
            preferredRanks = getMidPreferences(availablePlayers);
            break;

        case "Alright":
            preferredRanks = getAlrightPreferences(availablePlayers);
            break;

        case "Eh":
            preferredRanks = getEhPreferences(availablePlayers);
            break;

        default:
            return [];
    }

    for (const rankChoice of preferredRanks) {
        const pool = availablePlayers.filter(
            player => player.rank === rankChoice
        );

        if (pool.length > 0) {
            return pool;
        }
    }

    return [];
}


// ============================================================
// GREAT
// Great -> Great
// If no other Great -> Good
// ============================================================

function getGreatPreferences(availablePlayers) {
    const greatPlayers = availablePlayers.filter(
        player => player.rank === "Great"
    );

    if (greatPlayers.length > 0) {
        return ["Great", "Good"];
    }

    return ["Good"];
}


// ============================================================
// GOOD
// 50% Great
// 50% Mid
//
// If the selected side is unavailable, use the other side.
// ============================================================

function getGoodPreferences(availablePlayers) {
    const greatAvailable = availablePlayers.some(
        player => player.rank === "Great"
    );

    const midAvailable = availablePlayers.some(
        player => player.rank === "Mid"
    );

    const randomChoice = Math.random() < 0.5;

    if (randomChoice) {
        if (greatAvailable) {
            return ["Great", "Mid"];
        }

        if (midAvailable) {
            return ["Mid", "Great"];
        }
    } else {
        if (midAvailable) {
            return ["Mid", "Great"];
        }

        if (greatAvailable) {
            return ["Great", "Mid"];
        }
    }

    return [];
}


// ============================================================
// MID
// 50% Good
// 50% Alright
//
// If the selected side is unavailable, use the other side.
// ============================================================

function getMidPreferences(availablePlayers) {
    const goodAvailable = availablePlayers.some(
        player => player.rank === "Good"
    );

    const alrightAvailable = availablePlayers.some(
        player => player.rank === "Alright"
    );

    const randomChoice = Math.random() < 0.5;

    if (randomChoice) {
        if (goodAvailable) {
            return ["Good", "Alright"];
        }

        if (alrightAvailable) {
            return ["Alright", "Good"];
        }
    } else {
        if (alrightAvailable) {
            return ["Alright", "Good"];
        }

        if (goodAvailable) {
            return ["Good", "Alright"];
        }
    }

    return [];
}


// ============================================================
// ALRIGHT
// 50% Mid
// 50% Eh
//
// If the selected side is unavailable, use the other side.
// ============================================================

function getAlrightPreferences(availablePlayers) {
    const midAvailable = availablePlayers.some(
        player => player.rank === "Mid"
    );

    const ehAvailable = availablePlayers.some(
        player => player.rank === "Eh"
    );

    const randomChoice = Math.random() < 0.5;

    if (randomChoice) {
        if (midAvailable) {
            return ["Mid", "Eh"];
        }

        if (ehAvailable) {
            return ["Eh", "Mid"];
        }
    } else {
        if (ehAvailable) {
            return ["Eh", "Mid"];
        }

        if (midAvailable) {
            return ["Mid", "Eh"];
        }
    }

    return [];
}


// ============================================================
// EH
// Eh -> Eh
// If no other Eh -> Alright
// ============================================================

function getEhPreferences(availablePlayers) {
    const ehPlayers = availablePlayers.filter(
        player => player.rank === "Eh"
    );

    if (ehPlayers.length > 0) {
        return ["Eh", "Alright"];
    }

    return ["Alright"];
}


// ============================================================
// RANDOM OPPONENT BUTTON
// ============================================================

randomizeButton.addEventListener("click", async () => {
    const selectedPlayer = getSelectedPlayer();

    if (!selectedPlayer) {
        return;
    }

    randomizeButton.disabled = true;
    setStatus("Finding an opponent...");

    opponentCard.classList.remove("selected");

    const opponentPool = getOpponentPool(selectedPlayer);

    if (opponentPool.length === 0) {
        opponentName.textContent = "No opponent";
        opponentRank.textContent = "—";
        opponentRank.className = "rank-badge";

        setStatus("No suitable opponent is currently available.", true);

        randomizeButton.disabled = false;
        return;
    }

    await animateRandomSelection(opponentPool);

    const opponent =
        opponentPool[Math.floor(Math.random() * opponentPool.length)];

    opponentName.textContent = opponent.name;
    opponentRank.textContent = opponent.rank;

    setRankBadge(opponentRank, opponent.rank);

    opponentCard.classList.add("selected");

    setStatus(`${selectedPlayer.name} has been matched!`, false, true);

    randomizeButton.disabled = false;
});


// ============================================================
// RANDOM ANIMATION
// ============================================================

async function animateRandomSelection(pool) {
    const animationTime = 850;
    const intervalTime = 75;

    const startTime = Date.now();

    while (Date.now() - startTime < animationTime) {
        const randomPlayer =
            pool[Math.floor(Math.random() * pool.length)];

        opponentName.textContent = randomPlayer.name;
        opponentRank.textContent = randomPlayer.rank;

        setRankBadge(opponentRank, randomPlayer.rank);

        await wait(intervalTime);
    }
}


// ============================================================
// ADMIN AREA
// ============================================================

adminButton.addEventListener("click", () => {
    adminPanel.classList.remove("hidden");

    adminLoginArea.classList.remove("hidden");
    adminControls.classList.add("hidden");

    adminCode.value = "";
    adminLoginMessage.textContent = "";

    window.scrollTo({
        top: adminPanel.offsetTop - 30,
        behavior: "smooth"
    });
});


closeAdminButton.addEventListener("click", () => {
    adminPanel.classList.add("hidden");
});


adminLoginButton.addEventListener("click", loginAsAdmin);

adminCode.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        loginAsAdmin();
    }
});


// ============================================================
// ADMIN LOGIN
// ============================================================

async function loginAsAdmin() {
    const code = adminCode.value.trim();

    if (!/^\d{6}$/.test(code)) {
        adminLoginMessage.textContent = "Enter the 6-digit administrator code.";
        return;
    }

    adminLoginButton.disabled = true;
    adminLoginMessage.textContent = "Checking code...";

    const { data, error } = await db.rpc(
        "verify_admin_code",
        {
            entered_code: code
        }
    );

    adminLoginButton.disabled = false;

    if (error) {
        console.error(error);
        adminLoginMessage.textContent =
            "Could not verify the administrator code.";
        return;
    }

    if (data !== true) {
        adminLoginMessage.textContent = "Incorrect administrator code.";
        return;
    }

    isAdmin = true;

    adminLoginArea.classList.add("hidden");
    adminControls.classList.remove("hidden");

    adminLoginMessage.textContent = "";

    renderPlayerManagement();
}


// ============================================================
// ADMIN PLAYER MANAGEMENT
// ============================================================

function renderPlayerManagement() {
    playerManagement.innerHTML = "";

    const sortedPlayers = [...players].sort((a, b) => {
        const rankDifference =
            RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);

        if (rankDifference !== 0) {
            return rankDifference;
        }

        return a.name.localeCompare(b.name);
    });

    sortedPlayers.forEach(player => {
        const row = document.createElement("div");
        row.className = "management-row";

        const name = document.createElement("div");
        name.className = "management-name";
        name.textContent = player.name;

        const rank = document.createElement("div");
        rank.className = "management-rank";
        rank.textContent = player.rank;
        rank.classList.add(getRankTextClass(player.rank));

        const upButton = document.createElement("button");
        upButton.className = "rank-button";
        upButton.textContent = "↑";

        const downButton = document.createElement("button");
        downButton.className = "rank-button";
        downButton.textContent = "↓";

        const rankIndex = RANKS.indexOf(player.rank);

        upButton.disabled = rankIndex === 0;
        downButton.disabled = rankIndex === RANKS.length - 1;

        upButton.addEventListener("click", () => {
            changePlayerRank(player, -1);
        });

        downButton.addEventListener("click", () => {
            changePlayerRank(player, 1);
        });

        row.appendChild(name);
        row.appendChild(rank);
        row.appendChild(upButton);
        row.appendChild(downButton);

        playerManagement.appendChild(row);
    });
}


// ============================================================
// CHANGE RANK
//
// direction -1 = promote
// direction +1 = demote
// ============================================================

async function changePlayerRank(player, direction) {
    if (!isAdmin) {
        return;
    }

    const currentIndex = RANKS.indexOf(player.rank);

    if (currentIndex === -1) {
        return;
    }

    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= RANKS.length) {
        return;
    }

    const newRank = RANKS[newIndex];

    const { data, error } = await db.rpc(
        "change_player_rank",
        {
            player_id: player.id,
            new_rank: newRank
        }
    );

    if (error) {
        console.error(error);
        alert("The rank could not be saved to Supabase.");
        return;
    }

    if (data !== true) {
        alert("The rank could not be saved to Supabase.");
        return;
    }

    player.rank = newRank;

    populatePlayerSelector();

    playerSelect.value = String(player.id);

    playerName.textContent = player.name;
    playerRank.textContent = player.rank;
    setRankBadge(playerRank, player.rank);

    randomizeButton.disabled = false;

    renderPlayerManagement();

    setStatus(`${player.name} is now ${newRank}.`, false, true);
}


// ============================================================
// RANK DISPLAY
// ============================================================

function setRankBadge(element, rank) {
    element.textContent = rank;
    element.className = "rank-badge";

    switch (rank) {
        case "Great":
            element.classList.add("great-text");
            break;

        case "Good":
            element.classList.add("good-text");
            break;

        case "Mid":
            element.classList.add("mid-text");
            break;

        case "Alright":
            element.classList.add("alright-text");
            break;

        case "Eh":
            element.classList.add("eh-text");
            break;
    }
}


function getRankTextClass(rank) {
    switch (rank) {
        case "Great":
            return "great-text";

        case "Good":
            return "good-text";

        case "Mid":
            return "mid-text";

        case "Alright":
            return "alright-text";

        case "Eh":
            return "eh-text";

        default:
            return "";
    }
}


// ============================================================
// STATUS MESSAGE
// ============================================================

function setStatus(message, error = false, success = false) {
    statusMessage.textContent = message;

    statusMessage.className = "status-message";

    if (error) {
        statusMessage.classList.add("error");
    }

    if (success) {
        statusMessage.classList.add("success");
    }
}


// ============================================================
// UTILITY
// ============================================================

function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
