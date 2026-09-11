const SUPABASE_URL = "https://oksehzkaaakonzvmnhym.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_MXcFLyLyj4MtTb_z7RKLYg_W4_lr3X3";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const leaderboardBody = document.getElementById("leaderboardBody");
const statusMessage = document.getElementById("statusMessage");
const changeLeaderboardButton =
    document.getElementById("changeLeaderboardButton");
const actionsHeader = document.getElementById("actionsHeader");

let editingMode = false;
let adminCode = "";

async function loadLeaderboard() {
    statusMessage.style.display = "block";
    statusMessage.textContent = "Loading leaderboard...";
    leaderboardBody.innerHTML = "";

    const { data, error } = await supabaseClient
        .from("players")
        .select("id, name, elo");

    if (error) {
        console.error(error);

        statusMessage.textContent =
            "Could not load the leaderboard.";

        return;
    }

    const players = [...data].sort((a, b) => {
        if (b.elo !== a.elo) {
            return b.elo - a.elo;
        }

        return a.name.localeCompare(b.name);
    });

    statusMessage.style.display = "none";

    if (players.length === 0) {
        statusMessage.style.display = "block";
        statusMessage.textContent =
            "No players are currently on the leaderboard.";
        return;
    }

    players.forEach((player, index) => {
        const row = document.createElement("tr");

        const rankCell = document.createElement("td");
        rankCell.className = "rank";
        rankCell.textContent = index + 1;

        const nameCell = document.createElement("td");
        nameCell.className = "player-name";
        nameCell.textContent = player.name;

        const eloCell = document.createElement("td");
        eloCell.className = "elo";
        eloCell.textContent = player.elo;

        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(eloCell);

        if (editingMode) {
            const actionsCell = document.createElement("td");
            actionsCell.className = "actions";

            const plusButton = document.createElement("button");
            plusButton.className = "elo-button";
            plusButton.textContent = "+";
            plusButton.title = "Increase Elo by 10";

            plusButton.addEventListener("click", () => {
                changeElo(player.id, 10);
            });

            const minusButton = document.createElement("button");
            minusButton.className = "elo-button minus";
            minusButton.textContent = "−";
            minusButton.title = "Decrease Elo by 10";

            minusButton.addEventListener("click", () => {
                changeElo(player.id, -10);
            });

            actionsCell.appendChild(plusButton);
            actionsCell.appendChild(minusButton);

            row.appendChild(actionsCell);
        }

        leaderboardBody.appendChild(row);
    });
}

changeLeaderboardButton.addEventListener("click", () => {
    if (editingMode) {
        editingMode = false;
        adminCode = "";

        actionsHeader.classList.add("hidden");

        loadLeaderboard();

        return;
    }

    const enteredCode = prompt("Enter the 6 digit admin code:");

    if (enteredCode === null) {
        return;
    }

    if (!/^\d{6}$/.test(enteredCode)) {
        alert("The admin code must be exactly 6 digits.");
        return;
    }

    adminCode = enteredCode;

    editingMode = true;

    actionsHeader.classList.remove("hidden");

    loadLeaderboard();
});

async function changeElo(playerId, amount) {
    if (!editingMode || !adminCode) {
        return;
    }

    const buttons = document.querySelectorAll(".elo-button");

    buttons.forEach((button) => {
        button.disabled = true;
    });

    statusMessage.style.display = "block";
    statusMessage.textContent = "Updating Elo...";

    try {
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/change-leaderboard`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_PUBLISHABLE_KEY,
                    "Authorization":
                        `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
                },

                body: JSON.stringify({
                    code: adminCode,
                    playerId: playerId,
                    change: amount
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "The leaderboard could not be updated."
            );
        }

        await loadLeaderboard();

    } catch (error) {
        console.error(error);

        statusMessage.style.display = "block";
        statusMessage.textContent =
            error.message ||
            "Something went wrong.";

        setTimeout(() => {
            loadLeaderboard();
        }, 2000);
    }
}

loadLeaderboard();
