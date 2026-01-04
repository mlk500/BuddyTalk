// ---------- Helpers ----------
function setStatus(el, msg) {
  el.textContent = msg;
}

function getResponsePlaceholder(childText) {
  if (!childText || childText.trim().length === 0) {
    return "I didn’t hear anything. Can you tell me again?";
  }
  return `Oh wow! You said: "${childText}". Tell me more!`;
}

// ---------- STT (Web Speech API) ----------
const sttStatus = document.getElementById("sttStatus");
const transcriptEl = document.getElementById("transcript");
const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

function initStt() {
  if (!SpeechRecognition) {
    setStatus(sttStatus, "STT not supported. Use Chrome.");
    btnStart.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    setStatus(sttStatus, "Listening...");
    btnStart.disabled = true;
    btnStop.disabled = false;
  };

  recognition.onresult = (event) => {
    let finalText = "";
    let interimText = "";

    for (let i = 0; i < event.results.length; i++) {
      const chunk = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += chunk;
      else interimText += chunk;
    }

    transcriptEl.value = (finalText + " " + interimText).trim();
  };

  recognition.onerror = (e) => {
    setStatus(sttStatus, `Error: ${e.error}`);
    btnStart.disabled = false;
    btnStop.disabled = true;
  };

  recognition.onend = () => {
    setStatus(sttStatus, "Stopped.");
    btnStart.disabled = false;
    btnStop.disabled = true;
  };
}

btnStart.addEventListener("click", async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    setStatus(sttStatus, "Microphone permission denied.");
    return;
  }

  try {
    recognition.start();
  } catch (e) {
    setStatus(sttStatus, "Could not start recognition.");
  }
});

btnStop.addEventListener("click", () => {
  if (recognition) recognition.stop();
});

// ---------- TTS (SpeechSynthesis) ----------
const ttsStatus = document.getElementById("ttsStatus");
const responseEl = document.getElementById("response");
const btnSpeak = document.getElementById("btnSpeak");
const btnStopSpeak = document.getElementById("btnStopSpeak");
const voiceSelect = document.getElementById("voiceSelect");

let voices = [];

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";

  const preferred = voices
    .filter(v => (v.lang || "").toLowerCase().startsWith("en"))
    .concat(voices);

  const used = new Set();
  for (const v of preferred) {
    const key = `${v.name}__${v.lang}`;
    if (used.has(key)) continue;
    used.add(key);

    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  }
}

function findSelectedVoice() {
  const val = voiceSelect.value;
  if (!val) return null;
  const [name, lang] = val.split("__");
  return voices.find(v => v.name === name && v.lang === lang) || null;
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    setStatus(ttsStatus, "TTS not supported.");
    return;
  }
  if (!text || text.trim().length === 0) {
    setStatus(ttsStatus, "Nothing to speak.");
    return;
  }

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";

  const chosen = findSelectedVoice();
  if (chosen) utter.voice = chosen;

  utter.onstart = () => setStatus(ttsStatus, "Speaking...");
  utter.onend = () => setStatus(ttsStatus, "Done.");
  utter.onerror = () => setStatus(ttsStatus, "TTS error.");

  window.speechSynthesis.speak(utter);
}

btnSpeak.addEventListener("click", () => speak(responseEl.value));

btnStopSpeak.addEventListener("click", () => {
  window.speechSynthesis.cancel();
  setStatus(ttsStatus, "Stopped speaking.");
});

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
}
loadVoices();

// ---------- Mini Loop ----------
const btnGenerate = document.getElementById("btnGenerate");
btnGenerate.addEventListener("click", () => {
  const childText = transcriptEl.value;
  responseEl.value = getResponsePlaceholder(childText);
});

// init
initStt();
setStatus(sttStatus, "Idle (Chrome recommended).");
setStatus(ttsStatus, "Ready.");
