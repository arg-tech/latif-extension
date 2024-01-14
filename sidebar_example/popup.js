// sidebar.js
const sidebar = document.querySelector('.sidebar');

document.getElementById('toggleSidebar').addEventListener('click', () => {
  sidebar.classList.toggle('active');
});
