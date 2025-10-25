// js/learn.js
import { LS } from './storage.js';

const esc = s => String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

export function openLearnView(id){
  const cap = LS.getCapsule(id);
  const section = document.getElementById('section-learn');
  if(!cap){ section.innerHTML = '<div class="pc-empty">Capsule not found</div>'; return; }
  section.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <div><h4>${esc(cap.meta.title)}</h4><div class="small-muted">${esc(cap.meta.subject||'')}</div></div>
      <div>
        <button id="learn-notes" class="pc-btn pc-btn-outline">Notes</button>
        <button id="learn-flash" class="pc-btn pc-btn-outline">Flashcards</button>
        <button id="learn-quiz" class="pc-btn pc-btn-outline">Quiz</button>
        <button id="learn-back" class="pc-btn pc-btn-outline">Back</button>
      </div>
    </div>
    <div id="learn-area" class="mt-3"></div>
  `;
  document.getElementById('learn-back').onclick = ()=> document.getElementById('nav-library').click();
  document.getElementById('learn-notes').onclick = ()=> renderNotes(cap);
  document.getElementById('learn-flash').onclick = ()=> renderFlashcards(cap);
  document.getElementById('learn-quiz').onclick = ()=> renderQuiz(cap);
  renderNotes(cap);
}

function renderNotes(cap){
  const area = document.getElementById('learn-area');
  const notes = cap.notes || [];
  if(notes.length === 0){ area.innerHTML = '<div class="pc-empty">No notes in this capsule.</div>'; return; }
  area.innerHTML = notes.map(n=>`<div class="card-pocket mb-2 p-3">${esc(n)}</div>`).join('');
}

function renderFlashcards(cap){
  const area = document.getElementById('learn-area');
  const cards = (cap.flashcards && cap.flashcards.length) ? cap.flashcards : [{front:'No flashcards', back:''}];
  let i = 0;
  area.innerHTML = `
    <div id="flash-wrap">
      <div class="flashcard mb-3" id="pc-flash" tabindex="0" aria-live="polite">
        <div class="flashcard-inner">
          <div class="flashcard-face flashcard-front">${esc(cards[0].front||'')}</div>
          <div class="flashcard-face flashcard-back">${esc(cards[0].back||'')}</div>
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <button id="prev-f" class="pc-btn pc-btn-outline">Prev</button>
          <button id="flip-f" class="pc-btn pc-btn-accent">Flip</button>
          <button id="next-f" class="pc-btn pc-btn-outline">Next</button>
        </div>
        <div>
          <button id="mark-known" class="pc-btn pc-btn-outline">Mark Known</button>
        </div>
      </div>
      <div class="mt-2 small-muted" id="flash-progress">Card 1 / ${cards.length}</div>
    </div>
  `;
  const flashRoot = document.getElementById('pc-flash');
  function show(j){
    i = (j + cards.length) % cards.length;
    flashRoot.classList.remove('flipped');
    flashRoot.querySelector('.flashcard-front').textContent = cards[i].front || '';
    flashRoot.querySelector('.flashcard-back').textContent = cards[i].back || '';
    document.getElementById('flash-progress').textContent = `Card ${i+1} / ${cards.length}`;
    const pr = LS.getProgress(cap.id);
    document.getElementById('mark-known').textContent = (pr.knownFlashcards||[]).includes(i) ? 'Known ✓' : 'Mark Known';
  }
  document.getElementById('flip-f').onclick = ()=> flashRoot.classList.toggle('flipped');
  document.getElementById('next-f').onclick = ()=> show(i+1);
  document.getElementById('prev-f').onclick = ()=> show(i-1);
  document.getElementById('mark-known').onclick = ()=> {
    const pr = LS.getProgress(cap.id);
    pr.knownFlashcards = pr.knownFlashcards || [];
    if(!pr.knownFlashcards.includes(i)) pr.knownFlashcards.push(i);
    LS.saveProgress(cap.id, pr); show(i);
  };

  // space flips when learn visible
  const keyHandler = (e) => {
    const learnSec = document.getElementById('section-learn');
    if(!learnSec || learnSec.classList.contains('d-none')) return;
    if(e.code === 'Space'){ e.preventDefault(); flashRoot.classList.toggle('flipped'); }
  };
  window.addEventListener('keydown', keyHandler);

  show(0);
}

function renderQuiz(cap){
  const area = document.getElementById('learn-area');
  const qarr = cap.quiz || [];
  if(qarr.length === 0){ area.innerHTML = '<div class="pc-empty">No quiz questions.</div>'; return; }
  let qi = 0, score = 0;
  function showQ(){
    const q = qarr[qi];
    area.innerHTML = `
      <div class="card-pocket p-3">
        <div><strong>Q${qi+1}:</strong> ${esc(q.question)}</div>
        <div id="choices" class="list-group mt-3">${(q.options||[]).map((c, idx) => `<button class="list-group-item list-group-item-action choice" data-idx="${idx}">${esc(c)}</button>`).join('')}</div>
        <div class="mt-3 small-muted">Question ${qi+1} / ${qarr.length}</div>
      </div>
    `;
    document.querySelectorAll('.choice').forEach(btn=>{
      btn.onclick = () => {
        const chosen = Number(btn.dataset.idx);
        if(chosen === Number((q.options||[]).indexOf(q.answer))) { score++; alert('Correct!'); }
        else alert('Wrong. ' + (q.explanation || ''));
        qi++;
        if(qi >= qarr.length) finish(); else showQ();
      };
    });
  }
  function finish(){
    const pct = Math.round((score / qarr.length) * 100);
    area.innerHTML = `<div class="card-pocket p-3"><h5>Quiz finished</h5><p>Score: ${score} / ${qarr.length} (${pct}%)</p></div>`;
    const prog = LS.getProgress(cap.id);
    if(pct > (prog.bestScore || 0)){ prog.bestScore = pct; LS.saveProgress(cap.id, prog); area.innerHTML += `<div class="mt-2 small-muted">New best score! ${pct}%</div>`; }
    else area.innerHTML += `<div class="mt-2 small-muted">Best score: ${prog.bestScore || 0}%</div>`;
  }
  showQ();
}
