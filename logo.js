
  window.addEventListener('DOMContentLoaded', () => {
    const name = localStorage.getItem('portalName');
    const logo = localStorage.getItem('portalLogo');

    const portalNameEl = document.getElementById('portalName');
    const portalLogoEl = document.getElementById('portalLogo');

    if (name) {
      portalNameEl.textContent = name;
    }

    if (logo) {
      portalLogoEl.src = logo;
      portalLogoEl.style.display = 'inline-block';
    }
  });
