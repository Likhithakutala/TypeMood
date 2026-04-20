// TypeMood — content.js
// Captures keystroke timing data and builds your personal baseline

const session = {
  keydowns: {},
  events: [],
  sessionStart: Date.now()
};

// Listen for every key press
document.addEventListener('keydown', (e) => {
  session.keydowns[e.code] = Date.now();
});

document.addEventListener('keyup', (e) => {
  const downTime = session.keydowns[e.code];
  if (!downTime) return;

  const holdDuration = Date.now() - downTime;
  const lastEvent = session.events[session.events.length - 1];
  const flightTime = lastEvent ? (downTime - lastEvent.timestamp) : 0;

  session.events.push({
    key: e.code,
    holdDuration,
    flightTime,
    timestamp: Date.now(),
    isBackspace: e.code === 'Backspace'
  });

  // Keep only last 100 keystrokes in memory
  if (session.events.length > 100) {
    session.events.shift();
  }

  // Analyze every 20 keystrokes
  if (session.events.length % 20 === 0) {
    analyzeTyping();
  }
});

function analyzeTyping() {
  const events = session.events;
  if (events.length < 10) return;

  // Calculate current typing features
  const holdDurations = events.map(e => e.holdDuration);
  const flightTimes = events.filter(e => e.flightTime > 0).map(e => e.flightTime);
  const backspaceCount = events.filter(e => e.isBackspace).length;

  const features = {
    avgHoldDuration: average(holdDurations),
    avgFlightTime: average(flightTimes),
    backspaceRate: backspaceCount / events.length,
    typingSpeed: calculateWPM(events),
    timestamp: Date.now()
  };

  console.log('TypeMood features:', features);

  // Save to chrome storage for baseline building
  saveFeatures(features);
}

function average(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateWPM(events) {
  if (events.length < 2) return 0;
  const timeSpan = (events[events.length - 1].timestamp - events[0].timestamp) / 1000 / 60;
  if (timeSpan === 0) return 0;
  return Math.round((events.length / 5) / timeSpan);
}

function saveFeatures(features) {
  chrome.storage.local.get(['typemood_sessions'], (result) => {
    const sessions = result.typemood_sessions || [];
    sessions.push(features);
    // Keep last 500 sessions
    if (sessions.length > 500) sessions.shift();
    chrome.storage.local.set({ typemood_sessions: sessions });
  });
    }
