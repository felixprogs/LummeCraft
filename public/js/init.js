/* ══════════════════════════════════════
   LUMMECRAFT — Init
══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── INITIAL RENDER ── */
  renderProducts();
  renderCatalog();
  updateCartBadge();

  /* Restore favs badge */
  const favBadge = document.getElementById('favBadge');
  if (favBadge && favs.size > 0) {
    favBadge.style.display = 'flex';
    favBadge.textContent = favs.size;
  }

  /* ── HEADER SCROLL ── */
  const header   = document.getElementById('mainHeader');
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    if (header)       header.classList.toggle('scrolled', window.scrollY > 20);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  /* ── REVEAL ON SCROLL ── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ── KEYBOARD ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('searchOverlay')?.classList.remove('open');
      document.getElementById('checkoutModal')?.classList.remove('open');
      document.getElementById('cartBackdrop')?.classList.remove('open');
      document.getElementById('cartDrawer')?.classList.remove('open');
    }
  });

  /* ── CHECKOUT MODAL CLICK-OUTSIDE ── */
  document.getElementById('checkoutModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeCheckout();
  });

  /* ── DEFAULT PAYMENT SELECTION ── */
  document.querySelector('.payment-opt')?.classList.add('selected');

});
