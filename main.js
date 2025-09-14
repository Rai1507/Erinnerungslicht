
// Smooth scroll is handled by CSS; this is a small helper for the hero button
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('#mehr-erfahren');
  if(btn){
    btn.addEventListener('click', (e) => {
      const target = document.querySelector(btn.getAttribute('href'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});
