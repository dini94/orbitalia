(() => {
  const btn = document.getElementById('langToggle');
  if (btn) btn.addEventListener('click', () => {
    const current = document.documentElement.lang || 'en';
    document.documentElement.lang = current === 'en' ? 'id' : 'en';
    btn.textContent = document.documentElement.lang === 'en' ? 'ID / EN' : 'ID / EN · ID selected';
    const msg = document.getElementById('languageNotice');
    if (msg) msg.textContent = document.documentElement.lang === 'id' ? 'Bahasa Indonesia dipilih; sebagian konten masih tersedia dalam bahasa Inggris.' : 'English selected.';
  });
  document.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
})();