chrome.storage.local.get(['typemood_sessions'], (result) => {
  const sessions = result.typemood_sessions || [];
  const status = document.getElementById('status');

  if (sessions.length === 0) {
    status.textContent = 'Start typing anywhere to build your baseline!';
    return;
  }

  const latest = sessions[sessions.length - 1];
  status.innerHTML = `
    <strong>Latest session</strong><br>
    Speed: ${latest.typingSpeed} WPM<br>
    Avg hold: ${Math.round(latest.avgHoldDuration)}ms<br>
    Backspace rate: ${(latest.backspaceRate * 100).toFixed(1)}%
  `;
});
