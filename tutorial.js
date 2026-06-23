document.addEventListener('DOMContentLoaded', () => {
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.location.href = 'options.html';
      }
    });
  }
});
