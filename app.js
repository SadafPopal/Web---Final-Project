// app.js
import { LS, genId, isValidCapsuleJSON } from './storage.js';

const sections = {
  lib: document.getElementById('section-library'),
  author: document.getElementById('section-author'),
  learn: document.getElementById('section-learn')
};

function show(name){
  Object.values(sections).forEach(s=>s.classList.add('d-none'));
  sections[name].classList.remove('d-none');
}

// --- Library View ---
function renderLibrary(){
  const index = LS.getIndex();
  const el = sections.lib;
  if(index.length===0){
    el.innerHTML = `<div class="pc-empty"><h4>No Capsules</h4><p>Create one using <b>New</b> or <b>Import</b>.</p></div>`;
    return;
  }
  el.innerHTML = '<div class="row" id="capsGrid"></div>';
  const grid=document.getElementById('capsGrid');
  index.forEach(i=>{
    const div=document.createElement('div');
    div.className='col-12 col-md-6 col-lg-4';
    div.innerHTML=`
      <div class="card-pocket mb-3">
        <div class="capsule-title">${i.title}</div>
        <div class="capsule-meta">${i.subject||''} • ${i.level||'General'}</div>
        <div class="capsule-actions">
          <button class="pc-btn pc-btn-outline btn-learn" data-id="${i.id}">Learn</button>
          <button class="pc-btn pc-btn-outline btn-edit" data-id="${i.id}">Edit</button>
          <button class="pc-btn pc-btn-outline btn-export" data-id="${i.id}">Export</button>
          <button class="pc-btn pc-btn-accent btn-del" data-id="${i.id}">×</button>
        </div>
      </div>`;
    grid.appendChild(div);
  });
  grid.onclick=e=>{
    const id=e.target.dataset.id;if(!id)return;
    if(e.target.classList.contains('btn-edit')) openAuthor(id);
    if(e.target.classList.contains('btn-learn')) openLearn(id);
    if(e.target.classList.contains('btn-export')) exportCap(id);
    if(e.target.classList.contains('btn-del')){if(confirm('Delete?')){LS.deleteCapsule(id);renderLibrary();}}
  };
}

// --- Author Modal ---
function openAuthor(id){
  const modalEl=document.getElementById('authorModal');
  const body=document.getElementById('author-modal-body');
  let cap=id?LS.getCapsule(id):null;
  if(!cap){
    cap={
      schema:'pocket-classroom/v1',
      id:genId(),
      meta:{title:'',subject:'',level:'Beginner'},
      notes:[]
    };
  }
  body.innerHTML=`
    <input id="a-title" class="form-control mb-2" placeholder="Title" value="${cap.meta.title||''}">
    <input id="a-subject" class="form-control mb-2" placeholder="Subject" value="${cap.meta.subject||''}">
    <textarea id="a-notes" class="form-control mb-3" rows="6" placeholder="Notes (one per line)">${(cap.notes||[]).join('\n')}</textarea>
    <button id="saveCap" class="pc-btn pc-btn-accent">Save Capsule</button>
  `;
  body.querySelector('#saveCap').onclick=()=>{
    cap.meta.title=document.getElementById('a-title').value.trim();
    cap.meta.subject=document.getElementById('a-subject').value.trim();
    cap.notes=document.getElementById('a-notes').value.split('\n').filter(x=>x.trim());
    if(!cap.meta.title){alert('Title required');return;}
    LS.saveCapsule(cap.id,cap);
    const index=LS.getIndex().filter(i=>i.id!==cap.id);
    index.unshift({id:cap.id,title:cap.meta.title,subject:cap.meta.subject,level:cap.meta.level});
    LS.saveIndex(index);
    renderLibrary();
    bootstrap.Modal.getInstance(modalEl).hide();
  };
  new bootstrap.Modal(modalEl).show();
}

// --- Learn ---
function openLearn(id){
  show('learn');
  const cap=LS.getCapsule(id);
  if(!cap){sections.learn.innerHTML='<div class="pc-empty">Capsule not found.</div>';return;}
  sections.learn.innerHTML=`
    <h4>${cap.meta.title}</h4>
    <div id="learnArea"></div>
    <div class="mt-3">
      <button id="btnNotes" class="pc-btn pc-btn-outline">Notes</button>
      <button id="btnFlash" class="pc-btn pc-btn-outline">Flashcards</button>
    </div>
  `;
  document.getElementById('btnNotes').onclick=()=>renderNotes(cap);
  document.getElementById('btnFlash').onclick=()=>renderFlash(cap);
  renderNotes(cap);
}

function renderNotes(c){
  const area=document.getElementById('learnArea');
  if(!c.notes||!c.notes.length){area.innerHTML='<div class="pc-empty">No notes.</div>';return;}
  area.innerHTML=c.notes.map(n=>`<div class="card-pocket mb-2">${n}</div>`).join('');
}

function renderFlash(c){
  const cards=c.flashcards||[
    {front:'No flashcards created',back:''}
  ];
  let i=0;
  const area=document.getElementById('learnArea');
  area.innerHTML=`
    <div class="flashcard mb-3" id="flash">
      <div class="flashcard-inner">
        <div class="flashcard-face flashcard-front">${cards[i].front}</div>
        <div class="flashcard-face flashcard-back">${cards[i].back}</div>
      </div>
    </div>
    <div class="d-flex justify-content-between">
      <button id="prev" class="pc-btn pc-btn-outline">Prev</button>
      <button id="flip" class="pc-btn pc-btn-accent">Flip</button>
      <button id="next" class="pc-btn pc-btn-outline">Next</button>
    </div>
  `;
  const flash=document.getElementById('flash');
  document.getElementById('flip').onclick=()=>flash.classList.toggle('flipped');
  document.getElementById('next').onclick=()=>{i=(i+1)%cards.length;update();}
  document.getElementById('prev').onclick=()=>{i=(i-1+cards.length)%cards.length;update();}
  function update(){
    flash.classList.remove('flipped');
    flash.querySelector('.flashcard-front').textContent=cards[i].front;
    flash.querySelector('.flashcard-back').textContent=cards[i].back;
  }
}

// --- Import / Export ---
function exportCap(id){
  const c=LS.getCapsule(id);
  const blob=new Blob([JSON.stringify(c,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`${c.meta.title||'capsule'}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById('import-file').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const o=JSON.parse(r.result);
      if(!isValidCapsuleJSON(o))return alert('Invalid file');
      o.id=genId();LS.saveCapsule(o.id,o);
      const idx=LS.getIndex();idx.unshift({id:o.id,title:o.meta.title,subject:o.meta.subject||'',level:o.meta.level||'General'});
      LS.saveIndex(idx);renderLibrary();alert('Imported!');
    }catch(err){alert('Import error: '+err);}
  };
  r.readAsText(f);
});

document.getElementById('btn-new').onclick=()=>openAuthor();
document.getElementById('nav-library').onclick=()=>{renderLibrary();show('lib');};
document.getElementById('nav-author').onclick=()=>openAuthor();
document.getElementById('nav-learn').onclick=()=>show('learn');

renderLibrary();
