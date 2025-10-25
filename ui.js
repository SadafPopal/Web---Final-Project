// js/ui.js - small UI helpers and animations
export function initUI(){
  document.querySelectorAll('.pc-nav-btn').forEach(b=>{
    b.addEventListener('click', ()=> {
      document.querySelectorAll('.pc-nav-btn').forEach(x=>{
        x.classList.remove('active');
        x.setAttribute('aria-pressed','false');
      });
      b.classList.add('active');
      b.setAttribute('aria-pressed','true');
    });
  });

  document.querySelectorAll('.app-section').forEach(s=>{
    s.style.transition = 'opacity .32s ease, transform .32s ease';
    s.style.opacity = 0;
    s.style.transform = 'translateY(8px)';
  });

  const obs = new MutationObserver(()=>{
    document.querySelectorAll('.app-section').forEach(s=>{
      if(!s.classList.contains('d-none')){ s.style.opacity = 1; s.style.transform = 'translateY(0)'; }
      else { s.style.opacity = 0; s.style.transform = 'translateY(8px)'; }
    });
  });

  // valid options: observe childList and subtree (and attributes)
  obs.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('focusin', e => {
    if(e.target.matches('.form-control, .pc-search')) {
      e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
      e.target.style.transition = 'box-shadow 0.18s ease';
    }
  });
  document.addEventListener('focusout', e => {
    if(e.target.matches('.form-control, .pc-search')) e.target.style.boxShadow = '';
  });
}
