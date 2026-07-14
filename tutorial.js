document.addEventListener('DOMContentLoaded', () => {
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'sidepanel.html';
    });
  }
});
