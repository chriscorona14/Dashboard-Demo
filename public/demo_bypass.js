/**
 * demo_bypass.js — MODO DEMO
 * 1. Stub completo de MSAL (evita errores de auth)
 * 2. Auto-carga modo demo al iniciar
 * 3. Inyecta badge "MODO DEMO" visible en la UI
 */

// ─── 1. Stub MSAL antes de que main.js lo use ─────────────────────────────────
window.msal = {
  PublicClientApplication: class MSALStub {
    constructor(config) { this._config = config; }
    initialize()               { return Promise.resolve(); }
    handleRedirectPromise()    { return Promise.resolve(null); }
    getAllAccounts()            { return []; }
    setActiveAccount()         {}
    getActiveAccount()         { return null; }
    acquireTokenSilent()       { return Promise.reject(new Error('DEMO_MODE_NO_AUTH')); }
    acquireTokenPopup()        { return Promise.reject(new Error('DEMO_MODE_NO_AUTH')); }
    loginRedirect()            { return Promise.resolve(); }
    loginPopup()               { return Promise.resolve({ account: null, accessToken: '' }); }
    logoutPopup()              { return Promise.resolve(); }
    logoutRedirect()           { return Promise.resolve(); }
  }
};

// ─── 2. Auto-trigger demo al cargar ──────────────────────────────────────────
(function autoDemo() {
  // Espera a que el DOM y main.js terminen de registrar sus listeners
  function tryTrigger(attempts) {
    const btn = document.getElementById('demoModeBtn');
    if (btn) {
      setTimeout(() => btn.click(), 150);
    } else if (attempts > 0) {
      setTimeout(() => tryTrigger(attempts - 1), 200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryTrigger(20));
  } else {
    tryTrigger(20);
  }
})();

// ─── 3. Badge MODO DEMO ───────────────────────────────────────────────────────
(function injectDemoBadge() {
  function addBadge() {
    if (document.getElementById('demoBadge')) return;
    const badge = document.createElement('div');
    badge.id = 'demoBadge';
    badge.innerHTML = `
      <span style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
        MODO DEMO
      </span>`;
    Object.assign(badge.style, {
      position: 'fixed', bottom: '16px', right: '16px', zIndex: '99999',
      background: 'linear-gradient(135deg, #0096c7, #0077b6)',
      color: 'white', padding: '6px 14px', borderRadius: '20px',
      boxShadow: '0 4px 12px rgba(0,150,199,0.40)',
      pointerEvents: 'none',
    });
    document.body.appendChild(badge);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addBadge);
  } else {
    addBadge();
  }
})();
