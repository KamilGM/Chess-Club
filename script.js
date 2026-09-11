/* =========================================================
   CHESS CLUB CLOCK — script.js
   Handles landing/info screens, welcome, time selection,
   and the countdown chess clock
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */
  const state = {
    player1Time: 0,
    player2Time: 0,
    increment: 0,
    initialP1: 0,
    initialP2: 0,
    activePlayer: null,
    gameState: 'idle',
    timerId: null
  };

  /* ---------------------------------------------------------
     DOM REFERENCES
  --------------------------------------------------------- */
  const screens = {
    landing: document.getElementById('landing-screen'),
    info: document.getElementById('info-screen'),
    welcome: document.getElementById('welcome-screen'),
    menu: document.getElementById('menu-screen'),
    custom: document.getElementById('custom-screen'),
    clock: document.getElementById('clock-screen')
  };

  const landingClockBtn = document.getElementById('landing-clock-btn');
  const landingInfoBtn = document.getElementById('landing-info-btn');

  const infoBackBtn = document.getElementById('info-back-btn');

  const timeButtons = document.querySelectorAll('.time-btn');
  const customTimeBtn = document.getElementById('custom-time-btn');
  const menuHomeBtn = document.getElementById('menu-home-btn');

  const customBackBtn = document.getElementById('custom-back-btn');
  const customStartBtn = document.getElementById('custom-start-btn');
  const customP1Min = document.getElementById('custom-p1-min');
  const customP1Sec = document.getElementById('custom-p1-sec');
  const customP2Min = document.getElementById('custom-p2-min');
  const customP2Sec = document.getElementById('custom-p2-sec');
  const customIncrement = document.getElementById('custom-increment');

  const player1El = document.getElementById('player-bottom');
  const player2El = document.getElementById('player-top');
  const time1El = document.getElementById('time-1');
  const time2El = document.getElementById('time-2');
  const status1El = document.getElementById('status-1');
  const status2El = document.getElementById('status-2');

  const startBtn = document.getElementById('start-btn');
  const centerControls = document.getElementById('center-controls');
  const miniControls = document.getElementById('mini-controls');
  const pauseBtn = document.getElementById('pause-btn');
  const resetBtn = document.getElementById('reset-btn');

  const gameoverOverlay = document.getElementById('gameover-overlay');
  const gameoverTitle = document.getElementById('gameover-title');
  const gameoverMessage = document.getElementById('gameover-message');
  const gameoverMenuBtn = document.getElementById('gameover-menu-btn');

  /* ---------------------------------------------------------
     UTILITIES
  --------------------------------------------------------- */

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function formatTime(totalSeconds) {
    totalSeconds = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');

    if (h > 0) {
      return `${h}:${mm}:${ss}`;
    }
    return `${m}:${ss}`;
  }

  function clearTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  /* ---------------------------------------------------------
     LANDING SCREEN
  --------------------------------------------------------- */

  landingClockBtn.addEventListener('click', () => {
    showScreen('welcome');
    setTimeout(() => {
      showScreen('menu');
    }, 1500);
  });

  landingInfoBtn.addEventListener('click', () => {
    showScreen('info');
  });

  infoBackBtn.addEventListener('click', () => {
    showScreen('landing');
  });

  /* ---------------------------------------------------------
     MENU SCREEN — PRESET TIMES
  --------------------------------------------------------- */

  timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.dataset.minutes, 10);
      const seconds = minutes * 60;
      prepareClock(seconds, seconds, 0);
    });
  });

  customTimeBtn.addEventListener('click', () => {
    showScreen('custom');
  });

  menuHomeBtn.addEventListener('click', () => {
    showScreen('landing');
  });

  /* ---------------------------------------------------------
     CUSTOM TIME SCREEN
  --------------------------------------------------------- */

  customBackBtn.addEventListener('click', () => {
    showScreen('menu');
  });

  customStartBtn.addEventListener('click', () => {
    const p1Min = parseInt(customP1Min.value, 10) || 0;
    const p1Sec = parseInt(customP1Sec.value, 10) || 0;
    const p2Min = parseInt(customP2Min.value, 10) || 0;
    const p2Sec = parseInt(customP2Sec.value, 10) || 0;
    const inc = parseInt(customIncrement.value, 10) || 0;

    const p1Total = (p1Min * 60) + p1Sec;
    const p2Total = (p2Min * 60) + p2Sec;

    if (p1Total <= 0 || p2Total <= 0) {
      alert('Please set a starting time greater than 0 for both opponents.');
      return;
    }

    prepareClock(p1Total, p2Total, Math.max(0, inc));
  });

  /* ---------------------------------------------------------
     PREPARE & ENTER CLOCK SCREEN
  --------------------------------------------------------- */

  function prepareClock(p1Seconds, p2Seconds, incrementSeconds) {
    clearTimer();

    state.player1Time = p1Seconds;
    state.player2Time = p2Seconds;
    state.initialP1 = p1Seconds;
    state.initialP2 = p2Seconds;
    state.increment = incrementSeconds;
    state.activePlayer = null;
    state.gameState = 'idle';

    updateDisplay();
    resetPlayerStyles();
    status1El.textContent = '';
    status2El.textContent = '';

    centerControls.classList.remove('hidden');
    miniControls.classList.add('hidden');
    pauseBtn.textContent = 'Pause';
    gameoverOverlay.classList.remove('active');

    showScreen('clock');
  }

  function resetPlayerStyles() {
    player1El.classList.remove('active', 'inactive', 'timeout');
    player2El.classList.remove('active', 'inactive', 'timeout');
    player1El.classList.add('inactive');
    player2El.classList.add('inactive');
  }

  function updateDisplay() {
    time1El.textContent = formatTime(state.player1Time);
    time2El.textContent = formatTime(state.player2Time);
  }

  /* ---------------------------------------------------------
     GAME CONTROL — START
  --------------------------------------------------------- */

  startBtn.addEventListener('click', () => {
    if (state.gameState !== 'idle') return;

    state.gameState = 'running';
    state.activePlayer = 1;

    centerControls.classList.add('hidden');
    miniControls.classList.remove('hidden');
    pauseBtn.textContent = 'Pause';

    setActiveStyles();
    runTimer();
  });

  function setActiveStyles() {
    if (state.activePlayer === 1) {
      player1El.classList.remove('inactive');
      player1El.classList.add('active');
      player2El.classList.remove('active');
      player2El.classList.add('inactive');
      status1El.textContent = 'Your move';
      status2El.textContent = '';
    } else {
      player2El.classList.remove('inactive');
      player2El.classList.add('active');
      player1El.classList.remove('active');
      player1El.classList.add('inactive');
      status2El.textContent = 'Your move';
      status1El.textContent = '';
    }
  }

  function runTimer() {
    clearTimer();
    state.timerId = setInterval(() => {
      if (state.gameState !== 'running') return;

      if (state.activePlayer === 1) {
        state.player1Time -= 1;
        if (state.player1Time <= 0) {
          state.player1Time = 0;
          updateDisplay();
          endGame(1);
          return;
        }
      } else {
        state.player2Time -= 1;
        if (state.player2Time <= 0) {
          state.player2Time = 0;
          updateDisplay();
          endGame(2);
          return;
        }
      }

      updateDisplay();
    }, 1000);
  }

  /* ---------------------------------------------------------
     PLAYER TAP HANDLERS
  --------------------------------------------------------- */

  function handlePlayerTap(playerNum) {
    if (state.gameState !== 'running') return;
    if (state.activePlayer !== playerNum) return;

    if (playerNum === 1) {
      state.player1Time += state.increment;
      state.activePlayer = 2;
    } else {
      state.player2Time += state.increment;
      state.activePlayer = 1;
    }

    updateDisplay();
    setActiveStyles();
    runTimer();
  }

  player1El.addEventListener('click', () => handlePlayerTap(1));
  player2El.addEventListener('click', () => handlePlayerTap(2));

  /* ---------------------------------------------------------
     PAUSE / RESUME
  --------------------------------------------------------- */

  pauseBtn.addEventListener('click', () => {
    if (state.gameState === 'running') {
      state.gameState = 'paused';
      clearTimer();
      pauseBtn.textContent = 'Resume';

      if (state.activePlayer === 1) {
        status1El.textContent = 'Paused';
      } else {
        status2El.textContent = 'Paused';
      }

    } else if (state.gameState === 'paused') {
      state.gameState = 'running';
      pauseBtn.textContent = 'Pause';

      if (state.activePlayer === 1) {
        status1El.textContent = 'Your move';
      } else {
        status2El.textContent = 'Your move';
      }

      runTimer();
    }
  });

  /* ---------------------------------------------------------
     RESET
  --------------------------------------------------------- */

  resetBtn.addEventListener('click', () => {
    const confirmReset = confirm('Reset the clock and return to the menu?');

    if (!confirmReset) return;

    clearTimer();
    state.gameState = 'idle';
    state.activePlayer = null;
    gameoverOverlay.classList.remove('active');

    showScreen('menu');
  });

  /* ---------------------------------------------------------
     GAME OVER
  --------------------------------------------------------- */

  function endGame(loserPlayer) {
    state.gameState = 'gameover';
    clearTimer();

    if (loserPlayer === 1) {
      player1El.classList.add('timeout');
      status1El.textContent = 'Time out!';
      status2El.textContent = '';
      gameoverMessage.textContent =
        'Opponent 1 ran out of time. Opponent 2 wins!';
    } else {
      player2El.classList.add('timeout');
      status2El.textContent = 'Time out!';
      status1El.textContent = '';
      gameoverMessage.textContent =
        'Opponent 2 ran out of time. Opponent 1 wins!';
    }

    gameoverTitle.textContent = 'Game Over';
    gameoverOverlay.classList.add('active');

    miniControls.classList.add('hidden');
    centerControls.classList.add('hidden');
  }

  gameoverMenuBtn.addEventListener('click', () => {
    gameoverOverlay.classList.remove('active');

    clearTimer();
    state.gameState = 'idle';
    state.activePlayer = null;

    showScreen('menu');
  });

  /* ---------------------------------------------------------
     PREVENT ACCIDENTAL SCROLL / ZOOM WHILE PLAYING
  --------------------------------------------------------- */

  document.addEventListener('touchmove', (e) => {
    if (screens.clock.classList.contains('active')) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('contextmenu', (e) => {
    if (screens.clock.classList.contains('active')) {
      e.preventDefault();
    }
  });

  document.addEventListener('gesturestart', (e) => e.preventDefault());

  /* ---------------------------------------------------------
     BOOTSTRAP
  --------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    showScreen('landing');
  });

})();
