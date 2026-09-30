/* =========================================================
   TIMER.JS
   A Pomodoro-style countdown for the landing page, plus an
   optional full-screen "Focus Mode" with a wallpaper background.

   Kept separate from script.js on purpose — same reason as
   nav.js — so the quiz logic never has to know this exists.

   Design note: the inline timer card and the full-screen Focus
   Mode overlay share ONE countdown. There are two sets of
   display/button elements (inline + overlay), and every function
   below updates both sets together so they always agree.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const displays = [
    document.getElementById("timer-display"),
    document.getElementById("focus-timer-display"),
  ].filter(Boolean);

  const statuses = [
    document.getElementById("timer-status"),
    document.getElementById("focus-status"),
  ].filter(Boolean);

  const startButtons = [
    document.getElementById("timer-start"),
    document.getElementById("focus-start"),
  ].filter(Boolean);

  const pauseButtons = [
    document.getElementById("timer-pause"),
    document.getElementById("focus-pause"),
  ].filter(Boolean);

  const resetButtons = [
    document.getElementById("timer-reset"),
    document.getElementById("focus-reset"),
  ].filter(Boolean);

  // Every mode button in either location shares the class "timer-mode-btn".
  const modeButtons = document.querySelectorAll(".timer-mode-btn");

  // If this page has no timer at all, stop here.
  if (displays.length === 0 || startButtons.length === 0) {
    return;
  }

  let remainingSeconds = 25 * 60; // default: 25-minute focus session
  let intervalId = null; // holds the running setInterval, or null when stopped

  /* ---------- Countdown display ---------- */
  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function updateDisplays() {
    const text = formatTime(remainingSeconds);
    displays.forEach((el) => (el.textContent = text));
  }

  function setStatus(message) {
    statuses.forEach((el) => (el.textContent = message));
  }

  function setButtonsRunning(isRunning) {
    startButtons.forEach((btn) => (btn.disabled = isRunning));
    pauseButtons.forEach((btn) => (btn.disabled = !isRunning));
  }

  function stopTimer() {
    clearInterval(intervalId);
    intervalId = null;
    setButtonsRunning(false);
  }

  // Switches to a new session length (Focus / Short break / Long break).
  // Keeps BOTH sets of mode buttons in sync by matching on data-minutes,
  // not just the one button that was clicked.
  function setMode(minutes) {
    stopTimer();
    remainingSeconds = minutes * 60;
    updateDisplays();
    setStatus("Ready when you are.");

    modeButtons.forEach((button) => {
      const isMatch = Number(button.dataset.minutes) === minutes;
      button.classList.toggle("active", isMatch);
    });
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMode(Number(button.dataset.minutes));
    });
  });

  startButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (intervalId) {
        return; // already running
      }

      setButtonsRunning(true);
      setStatus("Timer running — stay with it.");

      intervalId = setInterval(() => {
        remainingSeconds -= 1;
        updateDisplays();

        if (remainingSeconds <= 0) {
          stopTimer();
          setStatus("Time's up! Nice work.");
        }
      }, 1000);
    });
  });

  pauseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      stopTimer();
      setStatus("Paused.");
    });
  });

  resetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const activeButton = document.querySelector(".timer-mode-btn.active");
      setMode(Number(activeButton.dataset.minutes));
    });
  });

  updateDisplays(); // draw the initial "25:00" on page load

  /* ---------- Focus Mode (full-screen overlay) ---------- */
  const focusMode = document.getElementById("focus-mode");
  const openFocusModeBtn = document.getElementById("enter-focus-mode");
  const closeFocusModeBtn = document.getElementById("focus-mode-close");
  const focusModeBg = document.getElementById("focus-mode-bg");
  const wallpaperButtons = document.querySelectorAll(".wallpaper-swatch");

  // Only wire this up if the overlay actually exists on this page.
  if (focusMode && openFocusModeBtn && closeFocusModeBtn && focusModeBg) {
    function openFocusMode() {
      focusMode.classList.add("open");
      focusMode.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    }

    function closeFocusMode() {
      focusMode.classList.remove("open");
      focusMode.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
    }

    openFocusModeBtn.addEventListener("click", openFocusMode);
    closeFocusModeBtn.addEventListener("click", closeFocusMode);

    // Let people press Escape to get back out, too.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && focusMode.classList.contains("open")) {
        closeFocusMode();
      }
    });

    // Swapping wallpapers just swaps a CSS class on the background layer —
    // all the actual visuals (gradients + illustrations) live in styles.css.
    wallpaperButtons.forEach((button) => {
      button.addEventListener("click", () => {
        focusModeBg.className = `focus-mode-bg ${button.dataset.wallpaper}`;
        wallpaperButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }
});
