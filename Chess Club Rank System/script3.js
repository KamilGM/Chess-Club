// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

const SUPABASE_URL = "https://yancliyxlacdvhuirxns.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XnTk76AkxkGQl8UYDgRlgA_YniM5cWq";

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
let adminSessionCode = "";


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
        console.error("SUPABASE ERROR:", error);
        setStatus(`Supabase error: ${error.message}`, true);
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
    const currentPlayerId = playerSelect.value;

    playerSelect.innerHTML = `
        <option value="">Select a player...</option>
    `;

    players.forEach(player => {
        const option = document.createElement("option");

        option.value = player.id;
        option.textContent = `${player.name} (${player.rank})`;

        playerSelect.appendChild(option);
    });

    if (
        currentPlayerId &&
        players.some(
            player => String(player.id) === String(currentPlayerId)
        )
    ) {
        playerSelect.value = currentPlayerId;
    }

    randomizeButton.disabled = !playerSelect.value;
}


// ============================================================
// PLAYER SELECTION
// ============================================================

playerSelect.addEventListener("change", () => {

    const selectedPlayer = getSelectedPlayer();

    opponentName.textContent = "Waiting...";
    opponentRank.textContent = "—";
    opponentRank.className = "rank-badge";

    opponentCard.classList.remove("selected");

    if (!selectedPlayer) {

        playerName.textContent = "Select a player";
        playerRank.textContent = "—";
        playerRank.className = "rank-badge";

        randomizeButton.disabled = true;
        playerCard.classList.remove("selected");

        return;
    }

    playerName.textContent = selectedPlayer.name;
    playerRank.textContent = selectedPlayer.rank;

    setRankBadge(
        playerRank,
        selectedPlayer.rank
    );

    playerCard.classList.add("selected");

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

    return players.find(
        player => String(player.id) === String(id)
    ) || null;
}


// ============================================================
// MATCHMAKING
//
// SAME RANK:
// 90% chance of same rank
// 10% chance of one rank higher or lower
//
// If an adjacent rank has nobody available,
// it falls back to the same rank.
//
// If nobody is in the same rank at all,
// it uses an adjacent rank.
// ============================================================

function getOpponentPool(selectedPlayer) {

    const availablePlayers = players.filter(
        player =>
            String(player.id) !==
            String(selectedPlayer.id)
    );

    if (availablePlayers.length === 0) {
        return [];
    }


    const rankIndex =
        RANKS.indexOf(selectedPlayer.rank);

    if (rankIndex === -1) {
        return [];
    }


    // ========================================================
    // SAME RANK PLAYERS
    // ========================================================

    const sameRankPlayers =
        availablePlayers.filter(
            player =>
                player.rank ===
                selectedPlayer.rank
        );


    // ========================================================
    // ONE RANK HIGHER
    // ========================================================

    const higherRankPlayers =
        rankIndex > 0
            ? availablePlayers.filter(
                player =>
                    player.rank ===
                    RANKS[rankIndex - 1]
            )
            : [];


    // ========================================================
    // ONE RANK LOWER
    // ========================================================

    const lowerRankPlayers =
        rankIndex < RANKS.length - 1
            ? availablePlayers.filter(
                player =>
                    player.rank ===
                    RANKS[rankIndex + 1]
            )
            : [];


    // ========================================================
    // IF SAME RANK EXISTS
    // ========================================================

    if (sameRankPlayers.length > 0) {

        // 90% SAME RANK
        if (Math.random() < 0.90) {
            return sameRankPlayers;
        }


        // 10% ADJACENT RANK
        const adjacentPlayers = [
            ...higherRankPlayers,
            ...lowerRankPlayers
        ];


        // If there is someone one rank higher
        // or lower, use them.
        if (adjacentPlayers.length > 0) {
            return adjacentPlayers;
        }


        // No adjacent player exists.
        // Stay at the same rank.
        return sameRankPlayers;
    }


    // ========================================================
    // NO SAME RANK PLAYERS
    // ========================================================

    const adjacentPlayers = [
        ...higherRankPlayers,
        ...lowerRankPlayers
    ];

    return adjacentPlayers;
}


// ============================================================
// RANDOM OPPONENT BUTTON
// ============================================================

randomizeButton.addEventListener("click", async () => {

    const selectedPlayer =
        getSelectedPlayer();


    if (!selectedPlayer) {
        return;
    }


    randomizeButton.disabled = true;

    setStatus("Finding an opponent...");


    opponentCard.classList.remove("selected");

    opponentName.textContent = "SPINNING...";
    opponentRank.textContent = "—";
    opponentRank.className = "rank-badge";


    // ========================================================
    // GET THE CORRECT POOL
    // ========================================================

    const opponentPool =
        getOpponentPool(selectedPlayer);


    // ========================================================
    // NO OPPONENT
    // ========================================================

    if (opponentPool.length === 0) {

        opponentName.textContent =
            "No opponent";

        opponentRank.textContent =
            "—";

        opponentRank.className =
            "rank-badge";


        setStatus(
            "No suitable opponent is currently available.",
            true
        );


        randomizeButton.disabled =
            false;

        return;
    }


    // ========================================================
    // PICK THE REAL OPPONENT FIRST
    // ========================================================

    const opponent =
        opponentPool[
            Math.floor(
                Math.random() *
                opponentPool.length
            )
        ];


    // ========================================================
    // RUN THE SPINNER
    // ========================================================

    await animateRandomSelection(
        opponentPool,
        opponent
    );


    // ========================================================
    // FINAL RESULT
    // ========================================================

    opponentName.textContent =
        opponent.name;

    opponentRank.textContent =
        opponent.rank;


    setRankBadge(
        opponentRank,
        opponent.rank
    );


    opponentCard.classList.add(
        "selected"
    );


    setStatus(
        `${selectedPlayer.name} has been matched!`,
        false,
        true
    );


    randomizeButton.disabled =
        false;
});


// ============================================================
// SPINNING ANIMATION
//
// The names cycle rapidly at first.
// The spinner gradually slows down.
// It finishes on the actual selected opponent.
// ============================================================

async function animateRandomSelection(
    pool,
    finalOpponent
) {

    const spinTime = 2200;

    const startTime =
        Date.now();


    let delay = 40;


    while (
        Date.now() - startTime <
        spinTime
    ) {

        const randomPlayer =
            pool[
                Math.floor(
                    Math.random() *
                    pool.length
                )
            ];


        opponentName.textContent =
            randomPlayer.name;


        opponentRank.textContent =
            randomPlayer.rank;


        setRankBadge(
            opponentRank,
            randomPlayer.rank
        );


        // ====================================================
        // SLOW DOWN OVER TIME
        // ====================================================

        const elapsed =
            Date.now() -
            startTime;


        const progress =
            Math.min(
                elapsed / spinTime,
                1
            );


        delay =
            40 +
            Math.pow(
                progress,
                3
            ) * 300;


        await wait(delay);
    }


    // ========================================================
    // LAND ON THE ACTUAL OPPONENT
    // ========================================================

    opponentName.textContent =
        finalOpponent.name;


    opponentRank.textContent =
        finalOpponent.rank;


    setRankBadge(
        opponentRank,
        finalOpponent.rank
    );
}


// ============================================================
// ADMIN AREA
// ============================================================

adminButton.addEventListener("click", () => {

    adminPanel.classList.remove(
        "hidden"
    );


    adminLoginArea.classList.remove(
        "hidden"
    );


    adminControls.classList.add(
        "hidden"
    );


    adminCode.value = "";

    adminLoginMessage.textContent = "";


    isAdmin = false;

    adminSessionCode = "";


    window.scrollTo({
        top:
            adminPanel.offsetTop - 30,
        behavior: "smooth"
    });
});


// ============================================================
// CLOSE ADMIN
// ============================================================

closeAdminButton.addEventListener("click", () => {

    adminPanel.classList.add(
        "hidden"
    );


    isAdmin = false;

    adminSessionCode = "";

    adminCode.value = "";
});


// ============================================================
// ADMIN LOGIN BUTTON
// ============================================================

adminLoginButton.addEventListener(
    "click",
    loginAsAdmin
);


adminCode.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            loginAsAdmin();
        }

    }
);


// ============================================================
// ADMIN LOGIN
// ============================================================

async function loginAsAdmin() {

    const code =
        adminCode.value.trim();


    if (!/^\d{6}$/.test(code)) {

        adminLoginMessage.textContent =
            "Enter the 6-digit administrator code.";

        return;
    }


    adminLoginButton.disabled =
        true;


    adminLoginMessage.textContent =
        "Checking code...";


    const { data, error } =
        await db.rpc(
            "verify_admin_code",
            {
                entered_code: code
            }
        );


    adminLoginButton.disabled =
        false;


    if (error) {

        console.error(error);


        adminLoginMessage.textContent =
            "Could not verify the administrator code.";

        return;
    }


    if (data !== true) {

        adminLoginMessage.textContent =
            "Incorrect administrator code.";

        return;
    }


    isAdmin = true;

    adminSessionCode = code;


    adminLoginArea.classList.add(
        "hidden"
    );


    adminControls.classList.remove(
        "hidden"
    );


    adminLoginMessage.textContent =
        "";


    renderPlayerManagement();
}


// ============================================================
// ADMIN PLAYER MANAGEMENT
// ============================================================

function renderPlayerManagement() {

    playerManagement.innerHTML =
        "";


    const sortedPlayers =
        [...players].sort(
            (a, b) => {

                const rankDifference =
                    RANKS.indexOf(a.rank) -
                    RANKS.indexOf(b.rank);


                if (rankDifference !== 0) {
                    return rankDifference;
                }


                return a.name.localeCompare(
                    b.name
                );
            }
        );


    sortedPlayers.forEach(
        player => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "management-row";


            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "management-name";


            name.textContent =
                player.name;


            const rank =
                document.createElement(
                    "div"
                );


            rank.className =
                "management-rank";


            rank.textContent =
                player.rank;


            rank.classList.add(
                getRankTextClass(
                    player.rank
                )
            );


            const upButton =
                document.createElement(
                    "button"
                );


            upButton.className =
                "rank-button";


            upButton.textContent =
                "↑";


            const downButton =
                document.createElement(
                    "button"
                );


            downButton.className =
                "rank-button";


            downButton.textContent =
                "↓";


            const rankIndex =
                RANKS.indexOf(
                    player.rank
                );


            upButton.disabled =
                rankIndex === 0;


            downButton.disabled =
                rankIndex ===
                RANKS.length - 1;


            upButton.addEventListener(
                "click",
                () => {
                    changePlayerRank(
                        player,
                        -1
                    );
                }
            );


            downButton.addEventListener(
                "click",
                () => {
                    changePlayerRank(
                        player,
                        1
                    );
                }
            );


            row.appendChild(name);

            row.appendChild(rank);

            row.appendChild(upButton);

            row.appendChild(downButton);


            playerManagement.appendChild(
                row
            );
        }
    );
}


// ============================================================
// CHANGE RANK
// direction -1 = promote
// direction +1 = demote
// ============================================================

async function changePlayerRank(
    player,
    direction
) {

    if (
        !isAdmin ||
        !adminSessionCode
    ) {
        return;
    }


    const currentIndex =
        RANKS.indexOf(
            player.rank
        );


    if (currentIndex === -1) {
        return;
    }


    const newIndex =
        currentIndex + direction;


    if (
        newIndex < 0 ||
        newIndex >= RANKS.length
    ) {
        return;
    }


    const newRank =
        RANKS[newIndex];


    const { data, error } =
        await db.rpc(
            "change_player_rank",
            {
                player_id: player.id,
                new_rank: newRank,
                entered_code:
                    adminSessionCode
            }
        );


    if (error) {

        console.error(error);


        alert(
            "The rank could not be saved to Supabase."
        );


        return;
    }


    if (data !== true) {

        alert(
            "The rank could not be saved to Supabase."
        );


        return;
    }


    player.rank =
        newRank;


    const selectedId =
        playerSelect.value;


    populatePlayerSelector();


    if (
        selectedId &&
        players.some(
            p =>
                String(p.id) ===
                String(selectedId)
        )
    ) {
        playerSelect.value =
            selectedId;
    }


    if (
        String(selectedId) ===
        String(player.id)
    ) {

        playerName.textContent =
            player.name;


        playerRank.textContent =
            player.rank;


        setRankBadge(
            playerRank,
            player.rank
        );


        randomizeButton.disabled =
            false;
    }


    renderPlayerManagement();


    setStatus(
        `${player.name} is now ${newRank}.`,
        false,
        true
    );
}


// ============================================================
// RANK DISPLAY
// ============================================================

function setRankBadge(
    element,
    rank
) {

    element.textContent =
        rank;


    element.className =
        "rank-badge";


    switch (rank) {

        case "Great":

            element.classList.add(
                "great-text"
            );

            break;


        case "Good":

            element.classList.add(
                "good-text"
            );

            break;


        case "Mid":

            element.classList.add(
                "mid-text"
            );

            break;


        case "Alright":

            element.classList.add(
                "alright-text"
            );

            break;


        case "Eh":

            element.classList.add(
                "eh-text"
            );

            break;
    }
}


// ============================================================
// RANK TEXT CLASS
// ============================================================

function getRankTextClass(
    rank
) {

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

function setStatus(
    message,
    error = false,
    success = false
) {

    statusMessage.textContent =
        message;


    statusMessage.className =
        "status-message";


    if (error) {

        statusMessage.classList.add(
            "error"
        );
    }


    if (success) {

        statusMessage.classList.add(
            "success"
        );
    }
}


// ============================================================
// UTILITY
// ============================================================

function wait(milliseconds) {

    return new Promise(
        resolve => {
            setTimeout(
                resolve,
                milliseconds
            );
        }
    );
}
