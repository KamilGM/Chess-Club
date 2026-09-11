const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_PUBLIC_ANON_KEY_HERE";

const { createClient } = window.supabase;

const supabase = createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

const leaderboardElement = document.getElementById("leaderboard");
const playerCountElement = document.getElementById("playerCount");
const statusMessageElement = document.getElementById("statusMessage");

const changeLeaderboardButton = document.getElementById("changeLeaderboardButton");
const backButton = document.getElementById("backButton");

const loginPanel = document.getElementById("loginPanel");
const loginForm = document.getElementById("loginForm");
const adminEmailInput = document.getElementById("adminEmail");
const adminPinInput = document.getElementById("adminPin");
const cancelLoginButton = document.getElementById("cancelLoginButton");
const loginMessage = document.getElementById("loginMessage");

const editingPanel = document.getElementById("editingPanel");
const editingPlayersElement = document.getElementById("editingPlayers");
const exitEditingButton = document.getElementById("exitEditingButton");

const addPlayerForm = document.getElementById("addPlayerForm");
const newPlayerNameInput = document.getElementById("newPlayerName");

const saveChangesButton = document.getElementById("saveChangesButton");
const saveMessage = document.getElementById("saveMessage");

let players = [];
let editingPlayers = [];

function showStatus(message, isError = false) {
statusMessageElement.textContent = message;
statusMessageElement.classList.remove("hidden");

if (isError) {
statusMessageElement.classList.add("error");
} else {
statusMessageElement.classList.remove("error");
}
}

function hideStatus() {
statusMessageElement.classList.add("hidden");
}

function escapeHtml(value) {
const div = document.createElement("div");
div.textContent = value;
return div.innerHTML;
}

function sortPlayers(playerList) {
return [...playerList].sort((a, b) => Number(a.rank) - Number(b.rank));
}

async function loadPlayers() {
hideStatus();

leaderboardElement.innerHTML = `
<div class="loading">
<div class="spinner"></div>
<span>Loading leaderboard...</span>
</div>
`;

const { data, error } = await supabase
.from("players")
.select("id, name, rank")
.order("rank", { ascending: true });

if (error) {
console.error(error);

leaderboardElement.innerHTML = `
<div class="empty-state">
Unable to load the leaderboard.
</div>
`;

playerCountElement.textContent = "Database connection error";

showStatus(
"Could not connect to the Supabase leaderboard. Check your Supabase URL, public key, table name, and permissions.",
true
);

return;
}

players = sortPlayers(data || []);

displayLeaderboard();
}

function displayLeaderboard() {
playerCountElement.textContent =
`${players.length} ${players.length === 1 ? "player" : "players"}`;

if (players.length === 0) {
leaderboardElement.innerHTML = `
<div class="empty-state">
No players are currently in the leaderboard.
</div>
`;

return;
}

leaderboardElement.innerHTML = "";

players.forEach((player, index) => {
const row = document.createElement("div");

row.className = "player-row";
row.style.animationDelay = `${index * 35}ms`;

row.innerHTML = `
<div class="rank-number">
${Number(player.rank)}
</div>
<div class="player-name">
${escapeHtml(player.name)}
</div>
`;

leaderboardElement.appendChild(row);
});
}

async function checkExistingSession() {
const { data } = await supabase.auth.getSession();

return Boolean(data && data.session);
}

async function showLogin() {
const alreadyLoggedIn = await checkExistingSession();

if (alreadyLoggedIn) {
enterEditingMode();
return;
}

loginMessage.textContent = "";
adminEmailInput.value = "";
adminPinInput.value = "";

loginPanel.classList.remove("hidden");

setTimeout(() => {
adminEmailInput.focus();
}, 50);
}

function hideLogin() {
loginPanel.classList.add("hidden");
loginMessage.textContent = "";
adminEmailInput.value = "";
adminPinInput.value = "";
}

loginForm.addEventListener("submit", async (event) => {
event.preventDefault();

const email = adminEmailInput.value.trim();
const password = adminPinInput.value;

if (!email || !password) {
loginMessage.textContent = "Enter the admin email and PIN.";
return;
}

loginMessage.textContent = "Checking access...";

const { error } = await supabase.auth.signInWithPassword({
email,
password
});

if (error) {
console.error(error);
loginMessage.textContent = "Access denied. Check the login details and try again.";
adminPinInput.select();
return;
}

loginMessage.textContent = "";
hideLogin();
enterEditingMode();
});

function enterEditingMode() {
editingPlayers = sortPlayers(
players.map(player => ({
id: player.id,
name: player.name,
rank: Number(player.rank)
}))
);

editingPanel.classList.remove("hidden");

renderEditingPlayers();

editingPanel.scrollIntoView({
behavior: "smooth",
block: "start"
});
}

async function exitEditingMode() {
editingPanel.classList.add("hidden");
editingPlayers = [];
saveMessage.textContent = "";

await supabase.auth.signOut();
}

function renderEditingPlayers() {
editingPlayers = sortPlayers(editingPlayers);

editingPlayersElement.innerHTML = "";

if (editingPlayers.length === 0) {
editingPlayersElement.innerHTML = `
<div class="empty-state">
No players are currently in the leaderboard.
</div>
`;
return;
}

editingPlayers.forEach((player, index) => {
const row = document.createElement("div");

row.className = "editing-player";

const isFirst = index === 0;
const isLast = index === editingPlayers.length - 1;

row.innerHTML = `
<div class="editing-rank">
${Number(player.rank)}
</div>

<input
class="editing-name-input"
type="text"
maxlength="50"
value="${escapeHtml(player.name)}"
data-id="${player.id}"
aria-label="Player name"
>

<div class="editing-actions">

<button
type="button"
class="rank-button"
data-action="up"
data-id="${player.id}"
${isFirst ? "disabled" : ""}
title="Move player up one position"
>
↑ Up
</button>

<button
type="button"
class="rank-button"
data-action="down"
data-id="${player.id}"
${isLast ? "disabled" : ""}
title="Move player down one position"
>
↓ Down
</button>

<button
type="button"
class="danger-button"
data-action="remove"
data-id="${player.id}"
>
Remove
</button>

</div>
`;

editingPlayersElement.appendChild(row);
});
}

editingPlayersElement.addEventListener("click", (event) => {
const button = event.target.closest("button");

if (!button) {
return;
}

const playerId = button.dataset.id;
const action = button.dataset.action;

if (action === "up") {
movePlayer(playerId, -1);
}

if (action === "down") {
movePlayer(playerId, 1);
}

if (action === "remove") {
removePlayer(playerId);
}
});

function movePlayer(playerId, direction) {
editingPlayers = sortPlayers(editingPlayers);

const currentIndex = editingPlayers.findIndex(
player => String(player.id) === String(playerId)
);

if (currentIndex === -1) {
return;
}

const newIndex = currentIndex + direction;

if (newIndex < 0 || newIndex >= editingPlayers.length) {
return;
}

const currentPlayer = editingPlayers[currentIndex];
const otherPlayer = editingPlayers[newIndex];

const currentRank = Number(currentPlayer.rank);
const otherRank = Number(otherPlayer.rank);

currentPlayer.rank = otherRank;
otherPlayer.rank = currentRank;

editingPlayers = sortPlayers(editingPlayers);

renderEditingPlayers();

saveMessage.textContent = "Rank changes are ready to be saved.";
}

editingPlayersElement.addEventListener("input", (event) => {
if (!event.target.classList.contains("editing-name-input")) {
return;
}

const playerId = event.target.dataset.id;

const player = editingPlayers.find(
item => String(item.id) === String(playerId)
);

if (!player) {
return;
}

player.name = event.target.value;
});

addPlayerForm.addEventListener("submit", (event) => {
event.preventDefault();

const name = newPlayerNameInput.value.trim();

if (!name) {
return;
}

const nextRank = editingPlayers.length + 1;

const temporaryId =
`new-${Date.now()}-${Math.random().toString(36).slice(2)}`;

editingPlayers.push({
id: temporaryId,
name,
rank: nextRank,
isNew: true
});

newPlayerNameInput.value = "";

renderEditingPlayers();

saveMessage.textContent =
"New player added. Save changes to store the player in Supabase.";
});

function removePlayer(playerId) {
const player = editingPlayers.find(
item => String(item.id) === String(playerId)
);

if (!player) {
return;
}

const confirmed = confirm(
`Remove ${player.name} from the leaderboard?`
);

if (!confirmed) {
return;
}

editingPlayers = editingPlayers.filter(
item => String(item.id) !== String(playerId)
);

editingPlayers = sortPlayers(editingPlayers);

editingPlayers.forEach((item, index) => {
item.rank = index + 1;
});

renderEditingPlayers();

saveMessage.textContent =
"Player removed. Save changes to update Supabase.";
}

async function saveChanges() {
saveChangesButton.disabled = true;
saveMessage.textContent = "Saving changes...";

try {
const { data: sessionData } = await supabase.auth.getSession();

if (!sessionData.session) {
throw new Error("You are no longer authenticated.");
}

editingPlayers = sortPlayers(editingPlayers);

editingPlayers.forEach((player, index) => {
player.rank = index + 1;
});

const existingPlayers = editingPlayers.filter(
player => !String(player.id).startsWith("new-")
);

for (const player of existingPlayers) {
const { error } = await supabase
.from("players")
.update({
rank: -Math.abs(Number(player.rank))
})
.eq("id", player.id);

if (error) {
throw error;
}
}

for (const player of existingPlayers) {
const { error } = await supabase
.from("players")
.update({
name: player.name.trim(),
rank: Number(player.rank)
})
.eq("id", player.id);

if (error) {
throw error;
}
}

const newPlayers = editingPlayers.filter(
player => String(player.id).startsWith("new-")
);

if (newPlayers.length > 0) {
const rowsToInsert = newPlayers.map(player => ({
name: player.name.trim(),
rank: Number(player.rank)
}));

const { error } = await supabase
.from("players")
.insert(rowsToInsert);

if (error) {
throw error;
}
}

await loadPlayers();

editingPlayers = sortPlayers(
players.map(player => ({
id: player.id,
name: player.name,
rank: Number(player.rank)
}))
);

renderEditingPlayers();

saveMessage.textContent = "Changes saved successfully.";

} catch (error) {
console.error(error);

saveMessage.textContent =
`Could not save changes: ${error.message}`;

} finally {
saveChangesButton.disabled = false;
}
}

changeLeaderboardButton.addEventListener(
"click",
showLogin
);

cancelLoginButton.addEventListener(
"click",
hideLogin
);

exitEditingButton.addEventListener(
"click",
exitEditingMode
);

saveChangesButton.addEventListener(
"click",
saveChanges
);

backButton.addEventListener("click", () => {
window.location.href = "../index.html";
});

supabase.auth.onAuthStateChange((event) => {
if (event === "SIGNED_OUT") {
editingPanel.classList.add("hidden");
}
});

loadPlayers();
