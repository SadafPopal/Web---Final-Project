// js/main.js
import { initUI } from './ui.js';
import { renderLibrary, exportCapsule } from './library.js';
import { initAuthorUI, loadCapsuleToAuthor, saveAuthorData } from './author.js';
import { openLearnView } from './learn.js';
import { LS, isValidCapsuleJSON, genId } from './storage.js';

// Initialize author UI
initUI();
initAuthorUI();

// Shortcut to select DOM
const $ = sel => document.querySelector(sel);

// Sections
const sections = {
  library: document.getElementById('section-library'),
  author: document.getElementById('section-author'),
  learn: document.getElementById('section-learn')
};

// Show one section at a time
function showSection(name){
  Object.values(sections).forEach(s=>s.classList.add('d-none'));
  sections[name].classList.remove('d-none');
}

// Initial display
renderLibrary();
showSection('library');

// Navigation buttons
document.getElementById('nav-library').onclick = () => { renderLibrary(); showSection('library'); };
document.getElementById('nav-author').onclick = () => { showSection('author'); };
document.getElementById('nav-learn').onclick = () => { showSection('learn'); };

// New capsule button
document.getElementById('btn-new').onclick = () => {
  loadCapsuleToAuthor(null); // new capsule
  showSection('author');
};

// Library actions: learn, edit, export, delete
document.addEventListener('library:action', (e)=>{
  const { action, id } = e.detail || {};
  if(action === 'learn'){ 
    openLearnView(id); 
    showSection('learn'); 
  }
  else if(action === 'edit'){ 
    loadCapsuleToAuthor(id); 
    showSection('author'); 
  }
  else if(action === 'export'){ 
    exportCapsule(id); 
  }
  else if(action === 'delete'){ 
    if(confirm('Delete capsule?')){ 
      LS.deleteCapsule(id); 
      renderLibrary(); 
    } 
  }
});

// Refresh library after save
document.addEventListener('capsule:saved', ()=> { renderLibrary(); });

// Import JSON
document.getElementById('import-file').addEventListener('change', e=>{
  const f = e.target.files[0]; if(!f) return;
  const fr = new FileReader();
  fr.onload = ()=>{
    try {
      const obj = JSON.parse(fr.result);
      if(!isValidCapsuleJSON(obj)) return alert('Invalid capsule JSON.');
      obj.id = genId();
      LS.saveCapsule(obj.id, obj);
      const idx = LS.getIndex(); 
      idx.unshift({ id: obj.id, title: obj.meta.title, subject: obj.meta.subject||'', level: obj.meta.level||'General', updatedAt: new Date().toISOString() });
      LS.saveIndex(idx);
      renderLibrary(); 
      alert('Imported!');
    } catch(err){ alert('Import error: '+err.message); }
  };
  fr.readAsText(f);
});

// Search input
document.getElementById('search-input').addEventListener('input', (ev)=>{
  const q = ev.target.value.trim().toLowerCase();
  const idx = LS.getIndex();
  if(!q){ renderLibrary(); return; }
  const filtered = idx.filter(i => (i.title||'').toLowerCase().includes(q) || (i.subject||'').toLowerCase().includes(q));
  const lib = document.getElementById('library-list'); lib.innerHTML = '';
  filtered.forEach(item=>{
    const d = document.createElement('div');
    d.className='col-12 col-md-6 col-lg-4';
    d.innerHTML = `
      <div class="card-pocket mb-3">
        <div class="capsule-title">${item.title}</div>
        <div class="capsule-meta">${item.subject||''}</div>
        <div class="capsule-actions d-flex gap-2 mt-2">
          <button class="pc-btn pc-btn-outline" data-action="learn" data-id="${item.id}">Learn</button>
          <button class="pc-btn pc-btn-outline" data-action="edit" data-id="${item.id}">Edit</button>
          <button class="pc-btn pc-btn-outline" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </div>`;
    lib.appendChild(d);
  });

  lib.addEventListener('click', (e)=>{
    const btn = e.target.closest('button'); 
    if(!btn) return;
    const action = btn.dataset.action; 
    const id = btn.dataset.id; 
    document.dispatchEvent(new CustomEvent('library:action', { detail: { action, id } }));
  });
});

// Keyboard shortcuts
window.addEventListener('keydown', (e)=>{
  if(e.key === '['){ renderLibrary(); showSection('library'); document.getElementById('nav-library').click(); }
  if(e.key === ']'){ showSection('learn'); document.getElementById('nav-learn').click(); }
  if(e.key.toLowerCase() === 'n'){ loadCapsuleToAuthor(null); showSection('author'); document.getElementById('nav-author').click(); }
  if(e.key === '/'){ e.preventDefault(); document.getElementById('search-input').focus(); }
});
