// Function to toggle between Dark Mode and Light Mode
function toggleMode () {
  if (document.body.classList.contains('dark-mode')) {
    document.body.classList.remove('dark-mode');
    localStorage.removeItem('dark-mode');
  } else {
    document.body.classList.add('dark-mode');
    localStorage.setItem('dark-mode', '1');
  }
}

function openPopup () {
  document.getElementById("examplesPopupOverlay").style.visibility = "visible";
  document.getElementById("examplesPopupOverlay").style.opacity = "1";
  document.getElementById("examplesPopup").style.top = "20%";
}

function closePopup () {
  document.getElementById("examplesPopupOverlay").style.opacity = "0";
  document.getElementById("examplesPopupOverlay").style.visibility = "hidden";
  document.getElementById("examplesPopup").style.top = "-100%";
}

document.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('currentYear')) {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
  }
});

/**
 * Sets active state for navigation links based on current page URL
 */
document.addEventListener('DOMContentLoaded', () => {
  const currentUrl = new URL(globalThis.location.href);
  const currentPath = currentUrl.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';

  document.querySelectorAll('nav ul.nav-links > li').forEach(li => {
    let hasActiveChild = false;

    li.querySelectorAll('a').forEach(a => {
      const linkUrl = new URL(a.href, globalThis.location.href);
      const linkPath = linkUrl.pathname;
      const linkPage = linkPath.split('/').pop();

      a.classList.remove('active');

      if (linkPage === currentPage) {
        a.classList.add('active');
        hasActiveChild = true;
      }
    });

    if (hasActiveChild) {
      li.querySelector('a:first-child').classList.add('active');
    }
  });
});
