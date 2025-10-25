// js/author.js
import { LS, genId } from './storage.js';

let capsuleId = null;

// add note row
function addNoteRow(text = '') {
  const list = document.getElementById('notes-list');
  const row = document.createElement('div');
  row.className = 'note-row d-flex gap-2 mb-2';
  row.innerHTML = `
    <textarea class="form-control note-text" placeholder="Write note...">${text}</textarea>
    <button class="btn btn-danger btn-sm">×</button>
  `;
  row.querySelector('button').onclick = () => row.remove();
  list.appendChild(row);
}

// add flashcard row
function addFlashcardRow(front = '', back = '') {
  const list = document.getElementById('flashcards-list');
  const row = document.createElement('div');
  row.className = 'flashcard-row d-flex gap-2 mb-2';
  row.innerHTML = `
    <input type="text" class="form-control flash-front" placeholder="Front" value="${front}">
    <input type="text" class="form-control flash-back" placeholder="Back" value="${back}">
    <button class="btn btn-danger btn-sm">×</button>
  `;
  row.querySelector('button').onclick = () => row.remove();
  list.appendChild(row);
}

// add quiz row
function addQuizRow(q = '', a = '', opts = '') {
  const list = document.getElementById('quiz-list');
  const row = document.createElement('div');
  row.className = 'quiz-row mb-2';
  row.innerHTML = `
    <input type="text" class="form-control mb-1 quiz-question" placeholder="Question" value="${q}">
    <input type="text" class="form-control mb-1 quiz-answer" placeholder="Correct Answer" value="${a}">
    <input type="text" class="form-control mb-1 quiz-options" placeholder="Options (comma separated)" value="${opts}">
    <button class="btn btn-danger btn-sm mt-1">Remove</button>
  `;
  row.querySelector('button').onclick = () => row.remove();
  list.appendChild(row);
}



// load capsule into author section
export function loadCapsuleToAuthor(id){
  if(!id) return; // Do nothing if no capsule ID (new capsule)
  
  const c = LS.getCapsule(id); 
  capsuleId = c?.id || null;
  document.getElementById('capsule-title').value = c?.meta?.title || '';
  document.getElementById('capsule-subject').value = c?.meta?.subject || '';
  document.getElementById('capsule-level').value = c?.meta?.level || '';
  
  document.getElementById('notes-list').innerHTML = '';
  document.getElementById('flashcards-list').innerHTML = '';
  document.getElementById('quiz-list').innerHTML = '';
  
  (c?.notes||[]).forEach(n => addNoteRow(n));
  (c?.flashcards||[]).forEach(f => addFlashcardRow(f.front, f.back));
  (c?.quiz||[]).forEach(q => addQuizRow(q.question, q.answer, (q.options||[]).join(', ')));
}



// gather data from form and save
export function saveAuthorData(isAuto=false){
  if(!capsuleId) capsuleId = genId();
  const capsule = {
    schema: 'pocket-classroom/v1',
    id: capsuleId,
    meta: {
      title: document.getElementById('capsule-title').value.trim() || 'Untitled',
      subject: document.getElementById('capsule-subject').value.trim() || 'General',
      level: document.getElementById('capsule-level').value.trim() || 'Basic',
      updatedAt: new Date().toISOString()
    },
    notes: Array.from(document.querySelectorAll('.note-text')).map(n=>n.value.trim()).filter(Boolean),
    flashcards: Array.from(document.querySelectorAll('.flashcard-row')).map(r=>({
      front: r.querySelector('.flash-front').value.trim(),
      back: r.querySelector('.flash-back').value.trim()
    })).filter(f=>f.front && f.back),
    quiz: Array.from(document.querySelectorAll('.quiz-row')).map(r=>{
      return {
        question: r.querySelector('.quiz-question').value.trim(),
        answer: r.querySelector('.quiz-answer').value.trim(),
        options: r.querySelector('.quiz-options').value.split(',').map(x=>x.trim()).filter(Boolean)
      };
    }).filter(q=>q.question && q.answer)
  };

  LS.saveCapsule(capsule.id, capsule);
  const idx = LS.getIndex().filter(i=>i.id!==capsule.id);
  idx.unshift({ id:capsule.id, title:capsule.meta.title, subject:capsule.meta.subject||'', level:capsule.meta.level||'General', updatedAt:capsule.meta.updatedAt });
  LS.saveIndex(idx);

  
  if(!isAuto) {
    alert('Saved!');
    document.dispatchEvent(new CustomEvent('capsule:saved', { detail: { id: capsule.id } }));
    document.getElementById('nav-library').click(); 
}

}

// setup author UI controls (call once from main)
export function initAuthorUI(){
  document.getElementById('btn-add-note').onclick = () => addNoteRow();
  document.getElementById('btn-add-flashcard').onclick = () => addFlashcardRow();
  document.getElementById('btn-add-quiz').onclick = () => addQuizRow();
  document.getElementById('btn-save-capsule').onclick = () => saveAuthorData(false);

  // autosave every 6s
  setInterval(()=> {
    // only autosave if author section visible
    const sec = document.getElementById('section-author');
    if(sec && !sec.classList.contains('d-none')) saveAuthorData(true);
  }, 6000);
}
