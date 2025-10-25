// js/storage.js
export const LS = {
  getIndex() {
    try { return JSON.parse(localStorage.getItem('pc_capsules_index') || '[]'); }
    catch { return []; }
  },
  saveIndex(i){ localStorage.setItem('pc_capsules_index', JSON.stringify(i)); },
  getCapsule(id){ try { return JSON.parse(localStorage.getItem(`pc_capsule_${id}`) || 'null'); } catch { return null; } },
  saveCapsule(id,obj){ localStorage.setItem(`pc_capsule_${id}`, JSON.stringify(obj)); },
  deleteCapsule(id){
    localStorage.removeItem(`pc_capsule_${id}`);
    localStorage.removeItem(`pc_progress_${id}`);
    const idx = LS.getIndex().filter(x=>x.id!==id);
    LS.saveIndex(idx);
  },
  getProgress(id){
    try { return JSON.parse(localStorage.getItem(`pc_progress_${id}`) || 'null') || { bestScore:0, knownFlashcards:[] }; }
    catch { return { bestScore:0, knownFlashcards:[] }; }
  },
  saveProgress(id, obj){ localStorage.setItem(`pc_progress_${id}`, JSON.stringify(obj)); }
};

export function genId(){ return 'pc_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

export function isValidCapsuleJSON(o){
  return o && o.schema==='pocket-classroom/v1' && o.meta && typeof o.meta.title === 'string' && ( (o.notes && o.notes.length) || (o.flashcards && o.flashcards.length) || (o.quiz && o.quiz.length) );
}
