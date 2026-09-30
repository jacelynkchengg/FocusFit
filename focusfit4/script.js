/* =========================================================
   FOCUSFIT SCRIPT
   Organized top to bottom:
   1. Data: profiles
   2. Data: questions (+ tiebreaker)
   3. State: variables that track where the user is
   4. DOM references (grabbing elements from the HTML)
   5. Screen navigation helpers
   6. Quiz logic (render question, handle answer, scoring)
   7. Result rendering
   8. Event listeners (start, retake)
   ========================================================= */

/* ---------- 1. Profiles ---------- */
/* Each key ("quiet", "cafe", etc.) matches the codes used in the
   questions below. This is the single source of truth for what
   the result screen shows for each profile. */
const PROFILES = {
  quiet: {
    title: "Quiet Deep Worker",
    emoji: "💤",
    description:
      "You do your best thinking in silence, with minimal stimulation and one task at a time.",
    environment: ["Library", "Clean desk", "Empty classroom", "Quiet corner"],
    methods: ["50/10 deep work", "Phone away", "One-task focus"],
    schedule: [
      { label: "Setup", minutes: 10 },
      { label: "Focus", minutes: 50 },
      { label: "Break", minutes: 10 },
      { label: "Focus", minutes: 50 },
      { label: "Review", minutes: 10 },
    ],
  },
  cafe: {
    title: "Cafe Momentum Worker",
    emoji: "☕️",
    description:
      "You focus better with a bit of background noise and other people working around you.",
    environment: ["Cafe", "Student center", "Study lounge", "Library common area"],
    methods: ["Pomodoro", "Body doubling", "Checklist"],
    schedule: [
      { label: "Choose task", minutes: 5 },
      { label: "Focus", minutes: 25 },
      { label: "Break", minutes: 5 },
      { label: "Focus", minutes: 25 },
      { label: "Reset", minutes: 10 },
      { label: "Final sprint", minutes: 25 },
    ],
  },
  sprint: {
    title: "Sprint Starter",
    emoji: "🏃‍♀️",
    description:
      "Starting is the hardest part for you. Small, low-pressure sprints get you moving.",
    environment: ["Low-friction space", "Desk already set up", "Cafe"],
    methods: ["2-minute start rule", "10-minute starter sprint", "Pomodoro"],
    schedule: [
      { label: "Pick one small task", minutes: 3 },
      { label: "Just start", minutes: 10 },
      { label: "Break", minutes: 5 },
      { label: "Continue", minutes: 25 },
      { label: "Check progress", minutes: 5 },
      { label: "Second sprint", minutes: 25 },
    ],
  },
  structured: {
    title: "Structured Planner",
    emoji: "📋",
    description:
      "You focus best once everything is organized, ranked, and mapped out ahead of time.",
    environment: ["Desk", "Planner/calendar open", "Low-clutter space", "Clear task list"],
    methods: ["Time blocking", "Task batching", "Priority ranking"],
    schedule: [
      { label: "Brain dump", minutes: 10 },
      { label: "Rank tasks", minutes: 5 },
      { label: "Hardest task", minutes: 45 },
      { label: "Break", minutes: 10 },
      { label: "Second task", minutes: 30 },
      { label: "Plan next steps", minutes: 10 },
    ],
  },
  creative: {
    title: "Creative Flow Worker",
    emoji: "🎨",
    description:
      "You thrive on inspiration, visuals, and flexible sessions built around creative energy.",
    environment: [
      "Visually inspiring desk",
      "Music/ambience",
      "Sketchbook or whiteboard nearby",
      "Flexible setup",
    ],
    methods: ["Flowtime", "Inspiration board", "Project-based sprint"],
    schedule: [
      { label: "Inspiration scan", minutes: 10 },
      { label: "Create", minutes: 40 },
      { label: "Break", minutes: 10 },
      { label: "Revise", minutes: 30 },
      { label: "Export/share", minutes: 10 },
    ],
  },
};

/* ---------- 2. Questions ---------- */
/* Each question has text + 5 options. Each option has display text
   and a "code" that matches a key in PROFILES above. */
const QUESTIONS = [
  {
    text: "What usually stops you from focusing?",
    options: [
      { text: "I get distracted by noise or people.", code: "quiet" },
      { text: "I do not know where to start.", code: "sprint" },
      { text: "I feel overwhelmed by too many tasks.", code: "structured" },
      { text: "I get bored if the space feels too quiet.", code: "cafe" },
      { text: "I need inspiration before I can begin.", code: "creative" },
    ],
  },
  {
    text: "Which environment sounds most appealing?",
    options: [
      { text: "Silent library floor", code: "quiet" },
      { text: "Cafe or student center", code: "cafe" },
      { text: "Organized desk with planner", code: "structured" },
      { text: "Anywhere, as long as I can start quickly", code: "sprint" },
      { text: "Creative setup with music or visuals", code: "creative" },
    ],
  },
  {
    text: "What kind of session feels realistic?",
    options: [
      { text: "50 minutes of deep work", code: "quiet" },
      { text: "25-minute sprints", code: "cafe" },
      { text: "10-minute starter session", code: "sprint" },
      { text: "A planned block on my calendar", code: "structured" },
      { text: "Flexible creative work time", code: "creative" },
    ],
  },
  {
    text: "What distracts you most?",
    options: [
      { text: "Phone/social media", code: "structured" },
      { text: "Not knowing what to do first", code: "sprint" },
      { text: "Noise", code: "quiet" },
      { text: "Messy workspace", code: "structured" },
      { text: "Lack of motivation or inspiration", code: "creative" },
    ],
  },
  {
    text: "What kind of task do you usually struggle with?",
    options: [
      { text: "Reading/studying", code: "quiet" },
      { text: "Coding/problem solving", code: "quiet" },
      { text: "Writing essays", code: "structured" },
      { text: "Design/creative work", code: "creative" },
      { text: "Small admin tasks", code: "sprint" },
    ],
  },
  {
    text: "What helps you stay motivated?",
    options: [
      { text: "A clean plan", code: "structured" },
      { text: "Seeing other people work", code: "cafe" },
      { text: "A timer", code: "sprint" },
      { text: "Rewards", code: "cafe" },
      { text: "Making progress visually", code: "creative" },
    ],
  },
  {
    text: "What is your ideal break?",
    options: [
      { text: "Walk/stretch", code: "quiet" },
      { text: "Snack/water", code: "cafe" },
      { text: "Quick reset checklist", code: "sprint" },
      { text: "Mood board/music", code: "creative" },
      { text: "Planning next step", code: "structured" },
    ],
  },
  {
    text: "When do you focus best?",
    options: [
      { text: "Morning", code: "quiet" },
      { text: "Afternoon", code: "cafe" },
      { text: "Night", code: "creative" },
      { text: "After I plan everything", code: "structured" },
      { text: "It depends on the task", code: "sprint" },
    ],
  },
  {
    text: "What sounds most like you?",
    options: [
      { text: "I need quiet to think.", code: "quiet" },
      { text: "I need momentum to start.", code: "sprint" },
      { text: "I need structure to stay on track.", code: "structured" },
      { text: "I need people around me.", code: "cafe" },
      { text: "I need creative freedom.", code: "creative" },
    ],
  },
  {
    text: "What would help you most today?",
    options: [
      { text: "A quiet work block", code: "quiet" },
      { text: "A short starter plan", code: "sprint" },
      { text: "A detailed schedule", code: "structured" },
      { text: "A coworking/body-double setup", code: "cafe" },
      { text: "A creative flow session", code: "creative" },
    ],
  },
];

/* This 11th question only gets added if there's a tie after the 10 above. */
const TIEBREAKER_QUESTION = {
  text: "What do you need most right now?",
  options: [
    { text: "A quiet space and a long uninterrupted work block", code: "quiet" },
    { text: "Background energy or people around me", code: "cafe" },
    { text: "A short push to stop procrastinating", code: "sprint" },
    { text: "A structured plan so I know exactly what to do", code: "structured" },
    { text: "Creative freedom and an inspiring setup", code: "creative" },
  ],
};

/* ---------- 3. State ---------- */
/* activeQuestions starts as a copy of QUESTIONS. The tiebreaker
   question gets pushed onto it later only if needed. */
let activeQuestions = [];
let currentIndex = 0;
let scores = {};
let tiebreakerUsed = false;

/* ---------- 4. DOM references ---------- */
const landingScreen = document.getElementById("landing-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const retakeBtn = document.getElementById("retake-btn");

const questionCountEl = document.getElementById("question-count");
const progressFillEl = document.getElementById("progress-fill");
const questionTextEl = document.getElementById("question-text");
const optionsListEl = document.getElementById("options-list");

const resultTitleEl = document.getElementById("result-title");
const resultDescriptionEl = document.getElementById("result-description");
const resultEnvironmentEl = document.getElementById("result-environment");
const resultMethodsEl = document.getElementById("result-methods");
const resultScheduleEl = document.getElementById("result-schedule");

/* ---------- 5. Screen navigation helpers ---------- */
function showScreen(screenToShow) {
  // Remove "active" from every screen, then add it only to the one we want.
  [landingScreen, quizScreen, resultScreen].forEach((screen) => {
    screen.classList.remove("active");
  });
  screenToShow.classList.add("active");
}

/* ---------- 6. Quiz logic ---------- */
function startQuiz() {
  // Reset everything in case this is a retake.
  activeQuestions = [...QUESTIONS];
  currentIndex = 0;
  tiebreakerUsed = false;
  scores = { quiet: 0, cafe: 0, sprint: 0, structured: 0, creative: 0 };

  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  const question = activeQuestions[currentIndex];

  // Update progress bar + "Question X of Y" text.
  questionCountEl.textContent = `Question ${currentIndex + 1} of ${activeQuestions.length}`;
  const progressPercent = (currentIndex / activeQuestions.length) * 100;
  progressFillEl.style.width = `${progressPercent}%`;

  // Fill in the question text.
  questionTextEl.textContent = question.text;

  // Rebuild the 5 answer buttons from scratch each time.
  optionsListEl.innerHTML = "";
  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.textContent = option.text;
    button.addEventListener("click", () => handleAnswer(option.code));
    optionsListEl.appendChild(button);
  });
}

function handleAnswer(code) {
  scores[code] += 1;
  currentIndex += 1;

  if (currentIndex < activeQuestions.length) {
    renderQuestion();
    return;
  }

  // We've answered every question currently in the list.
  // Check whether the top score is tied between two or more profiles.
  const tied = getTiedProfiles();

  if (tied.length > 1 && !tiebreakerUsed) {
    tiebreakerUsed = true;
    activeQuestions.push(TIEBREAKER_QUESTION);
    renderQuestion();
    return;
  }

  finishQuiz();
}

function getTiedProfiles() {
  const highestScore = Math.max(...Object.values(scores));
  return Object.keys(scores).filter((code) => scores[code] === highestScore);
}

function finishQuiz() {
  // Fill the progress bar completely before switching screens.
  progressFillEl.style.width = "100%";

  // If it's still tied after the tiebreaker (rare), just take the first one.
  const winningCode = getTiedProfiles()[0];
  renderResult(winningCode);
  showScreen(resultScreen);
}

/* ---------- 7. Result rendering ---------- */
function renderResult(code) {
  const profile = PROFILES[code];

  resultTitleEl.textContent = `${profile.emoji} ${profile.title}`;
  resultDescriptionEl.textContent = profile.description;

  // Environment list
  resultEnvironmentEl.innerHTML = "";
  profile.environment.forEach((place) => {
    const li = document.createElement("li");
    li.textContent = place;
    resultEnvironmentEl.appendChild(li);
  });

  // Methods list
  resultMethodsEl.innerHTML = "";
  profile.methods.forEach((method) => {
    const li = document.createElement("li");
    li.textContent = method;
    resultMethodsEl.appendChild(li);
  });

  // Schedule checklist
  resultScheduleEl.innerHTML = "";
  profile.schedule.forEach((step, index) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `step-${index}`;

    const label = document.createElement("label");
    label.setAttribute("for", `step-${index}`);
    label.innerHTML = `<span class="step-time">${step.minutes} min</span> ${step.label}`;

    li.appendChild(checkbox);
    li.appendChild(label);
    resultScheduleEl.appendChild(li);
  });
}

/* ---------- 8. Event listeners ---------- */
startBtn.addEventListener("click", startQuiz);
retakeBtn.addEventListener("click", startQuiz);
