* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    --background: #07140f;
    --background-light: #0d2118;
    --panel: #10291d;
    --panel-light: #173824;
    --border: #28543a;
    --text: #f1f7f2;
    --muted: #a8b9ae;
    --accent: #4caf68;
    --accent-dark: #286b3b;
    --danger: #d94a4a;
}

body {
    min-height: 100vh;
    background:
        radial-gradient(circle at top, #173d28 0%, #0b1d14 38%, #050d09 100%);
    color: var(--text);
    font-family: Arial, Helvetica, sans-serif;
}

.topbar {
    width: 100%;
    padding: 24px 6%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border);
    background: rgba(5, 15, 10, 0.8);
}

.topbar h1 {
    font-size: 30px;
}

.topbar p {
    margin-top: 4px;
    color: var(--muted);
}

.admin-button,
.close-admin-button {
    border: 1px solid var(--border);
    background: #10271b;
    color: var(--text);
    padding: 10px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: 0.2s;
}

.admin-button:hover,
.close-admin-button:hover {
    background: #1a3d29;
}

main {
    width: min(1100px, 92%);
    margin: 0 auto;
    padding: 50px 0;
}

.matchmaking-section {
    text-align: center;
}

.section-heading h2 {
    font-size: 38px;
    margin-bottom: 8px;
}

.section-heading p {
    color: var(--muted);
    font-size: 16px;
}

.player-selector {
    margin: 35px auto 30px;
    width: min(420px, 100%);
    text-align: left;
}

.player-selector label,
.admin-panel label {
    display: block;
    margin-bottom: 8px;
    color: var(--muted);
    font-size: 14px;
}

.player-selector select,
.admin-login-row input {
    width: 100%;
    border: 1px solid var(--border);
    background: #0b1c13;
    color: var(--text);
    border-radius: 9px;
    padding: 14px;
    font-size: 16px;
    outline: none;
}

.player-selector select:focus,
.admin-login-row input:focus {
    border-color: var(--accent);
}

.match-area {
    display: grid;
    grid-template-columns: 1fr 120px 1fr;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
}

.player-card {
    min-height: 245px;
    border: 2px solid var(--border);
    border-radius: 18px;
    background:
        linear-gradient(145deg, #153523, #0b1b12);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
    transition: transform 0.2s, border-color 0.2s;
}

.player-card.selected {
    transform: scale(1.02);
    border-color: var(--accent);
}

.card-label {
    font-size: 13px;
    letter-spacing: 3px;
    color: var(--muted);
    margin-bottom: 20px;
}

.player-name {
    font-size: clamp(25px, 4vw, 40px);
    font-weight: bold;
    word-break: break-word;
}

.rank-badge {
    margin-top: 18px;
    padding: 8px 18px;
    border-radius: 999px;
    font-size: 15px;
    font-weight: bold;
    background: #203027;
}

.vs {
    font-size: 42px;
    font-weight: 900;
    color: #d9e9dc;
    text-shadow: 0 0 18px rgba(76, 175, 104, 0.25);
}

.randomize-button {
    margin-top: 35px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #347d48, #4caf68);
    color: white;
    padding: 16px 28px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(38, 111, 58, 0.3);
    transition: 0.2s;
}

.randomize-button:hover:not(:disabled) {
    transform: translateY(-2px);
}

.randomize-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.status-message {
    min-height: 25px;
    margin-top: 18px;
    color: var(--muted);
}

.status-message.error {
    color: #ff7777;
}

.status-message.success {
    color: #75d98e;
}

.rank-guide {
    margin-top: 65px;
    text-align: center;
}

.rank-guide h2 {
    margin-bottom: 22px;
    font-size: 25px;
}

.rank-list {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}

.rank-item {
    min-width: 135px;
    padding: 14px 18px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--panel);
}

.rank-item span {
    margin-right: 7px;
}

.rank-item.great {
    border-color: #239447;
}

.rank-item.good {
    border-color: #51a85d;
}

.rank-item.mid {
    border-color: #c3b83b;
}

.rank-item.alright {
    border-color: #d98732;
}

.rank-item.eh {
    border-color: #c84242;
}

.admin-panel {
    margin-top: 65px;
    padding: 30px;
    background: rgba(13, 33, 24, 0.95);
    border: 1px solid var(--border);
    border-radius: 16px;
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
}

.admin-header h2 {
    font-size: 27px;
}

.admin-header p {
    color: var(--muted);
    margin-top: 5px;
}

.admin-login-row {
    display: flex;
    gap: 10px;
}

.admin-login-row input {
    max-width: 220px;
}

.admin-login-row button {
    border: none;
    background: var(--accent-dark);
    color: white;
    border-radius: 8px;
    padding: 0 22px;
    cursor: pointer;
    font-weight: bold;
}

.admin-message {
    min-height: 24px;
    margin-top: 10px;
    color: #ff7777;
}

.admin-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    color: var(--muted);
}

.admin-info strong {
    color: var(--text);
}

.player-management {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.management-row {
    display: grid;
    grid-template-columns: 1fr 150px 90px 90px;
    align-items: center;
    gap: 12px;
    padding: 13px 15px;
    background: #0a1b12;
    border: 1px solid #1e3c2b;
    border-radius: 9px;
}

.management-name {
    font-weight: bold;
}

.management-rank {
    font-weight: bold;
}

.rank-button {
    width: 100%;
    border: 1px solid var(--border);
    background: #132b1d;
    color: white;
    border-radius: 7px;
    padding: 9px;
    font-size: 18px;
    cursor: pointer;
}

.rank-button:hover:not(:disabled) {
    background: #214a30;
}

.rank-button:disabled {
    opacity: 0.25;
    cursor: not-allowed;
}

.great-text {
    color: #49c968;
}

.good-text {
    color: #75c77d;
}

.mid-text {
    color: #e2d64f;
}

.alright-text {
    color: #e49a4a;
}

.eh-text {
    color: #ef5a5a;
}

.hidden {
    display: none !important;
}

footer {
    text-align: center;
    padding: 25px;
    color: #718279;
    font-size: 13px;
}

@media (max-width: 750px) {
    .topbar {
        padding: 20px;
    }

    main {
        width: 94%;
        padding-top: 35px;
    }

    .section-heading h2 {
        font-size: 30px;
    }

    .match-area {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .player-card {
        min-height: 190px;
    }

    .vs {
        font-size: 28px;
    }

    .management-row {
        grid-template-columns: 1fr 100px 55px 55px;
    }

    .admin-panel {
        padding: 20px;
    }

    .admin-info {
        flex-direction: column;
        align-items: flex-start;
    }
}
