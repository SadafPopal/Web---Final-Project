// js/library.js
import { LS } from './storage.js';

const esc = s => String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

export function renderLibrary(containerSelector = '#library-list'){
  const el = document.querySelector(containerSelector);
  const idx = LS.getIndex();
  if(!idx || idx.length === 0){
    el.innerHTML = `<div class="pc-empty col-12"><h4>No Capsules</h4><p>Create one using <b>New</b> or import the sample JSON.</p></div>`;
    return;
  }
  el.innerHTML = '';
  idx.forEach(item => {
    const d = document.createElement('div');
    d.className = 'col-12 col-md-6 col-lg-4';
    d.innerHTML = `
      <div class="card-pocket mb-3">
        <div class="capsule-title">${esc(item.title)}</div>
        <div class="capsule-meta">${esc(item.subject||'')} • ${esc(item.level||'General')}</div>
        <div class="capsule-actions">
          <button class="pc-btn pc-btn-outline" data-action="learn" data-id="${item.id}">Learn</button>
          <button class="pc-btn pc-btn-outline" data-action="edit" data-id="${item.id}">Edit</button>
          <button class="pc-btn pc-btn-outline" data-action="export" data-id="${item.id}">Export</button>
          <button class="pc-btn pc-btn-accent" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </div>
    `;
    el.appendChild(d);
  });

  el.addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if(!btn) return;
    const action = btn.dataset.action; const id = btn.dataset.id;
    if(!action || !id) return;
    document.dispatchEvent(new CustomEvent('library:action', { detail: { action, id } }));
  });
}

export function exportCapsule(id){
  const c = LS.getCapsule(id);
  if(!c){ alert('Capsule not found'); return; }
  const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(c.meta.title||'capsule').replaceAll(' ','-')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
