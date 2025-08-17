/* THEME: auto + toggle */
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
if (!savedTheme) {
  root.setAttribute("data-theme", matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
} else root.setAttribute("data-theme", savedTheme);
document.getElementById("themeToggle")?.addEventListener("click", () => {
  const t = root.getAttribute("data-theme");
  const next = t === "light" ? "dark" : "light";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

/* BRAND PACK SWITCHER ON LOADER */
document.querySelectorAll('.chip').forEach(ch => {
  ch.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.removeAttribute('aria-pressed'));
    ch.setAttribute('aria-pressed','true');
    root.setAttribute('data-pack', ch.dataset.pack);
  });
});

/* NAV: mobile toggle */
const navToggle = document.querySelector('.nav-toggle');
const navList   = document.getElementById('navMenu');
navToggle?.addEventListener('click', () => {
  const open = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

/* YEAR */
document.getElementById('year').textContent = new Date().getFullYear();

/* PAGE LOADER */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 1000);
});

/* SCROLL REVEAL */
const revealables = document.querySelectorAll('.sr, .sr-up, .sr-left, .sr-right');
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      io.unobserve(e.target);
    }
  }
}, {threshold: 0.12, rootMargin: "0px 0px -10% 0px"});
revealables.forEach(el => io.observe(el));

/* MAGNETIC BUTTONS */
document.querySelectorAll('.magnet').forEach(btn => {
  const s = 18;
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width/2), y = e.clientY - (r.top + r.height/2);
    btn.style.transform = `translate(${x/s}px, ${y/s}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

/* TILT CARDS */
document.querySelectorAll('.tilt').forEach(card => {
  let raf;
  function onMove(e){
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.transform = `perspective(800px) rotateX(${(-py*7).toFixed(2)}deg) rotateY(${(px*7).toFixed(2)}deg) translateY(-2px)`;
      card.style.boxShadow = `0 14px 40px rgba(0,0,0,.28)`;
    });
  }
  function reset(){ card.style.transform=''; card.style.boxShadow=''; }
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseleave', reset);
  card.addEventListener('touchmove', (e)=>{ if(e.touches[0]) onMove(e.touches[0]); }, {passive:true});
  card.addEventListener('touchend', reset);
});

/* COUNTERS */
function animateCount(el){
  const end = Number(el.dataset.count || 0);
  const dur = 900; const start = performance.now();
  function tick(t){
    const p = Math.min(1, (t - start)/dur);
    el.textContent = Math.floor(end * (0.2 + 0.8 * p)).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
document.querySelectorAll('[data-count]').forEach(animateCount);

/* GALLERY: lazy load with skeleton shimmer */
const lazyImgs = document.querySelectorAll('.gallery-grid img[data-src]');
const lazyIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    const wrapper = img.closest('.skeleton');
    img.src = img.getAttribute('data-src');
    img.onload = () => {
      img.classList.add('loaded');
      wrapper?.classList.remove('skeleton');
    };
    lazyIO.unobserve(img);
  });
}, { rootMargin: "200px 0px" });
lazyImgs.forEach(img => lazyIO.observe(img));

/* CONTACT FORM */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = (data.get('name') || '').toString().trim();
  const email = (data.get('email') || '').toString().trim();
  const message = (data.get('message') || '').toString().trim();

  if (!name || !email || !message) {
    status.textContent = 'Please fill all fields.'; status.style.color = '#ffb4b4'; return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.textContent = 'Please enter a valid email.'; status.style.color = '#ffb4b4'; return;
  }
  status.textContent = 'Thanks! Your message has been recorded.'; status.style.color = '#a5f3b8';
  form.reset();
  confetti(); // celebratory
});

/* CONFETTI (tiny) */
function confetti(){
  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight; c.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none';
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  const pieces = Array.from({length: 120}, () => ({
    x: Math.random()*c.width, y: -20 - Math.random()*100,
    r: 4 + Math.random()*4, vx: -1 + Math.random()*2, vy: 2 + Math.random()*3,
    a: Math.random()*Math.PI
  }));
  let t0 = performance.now();
  (function loop(t){
    const dt = (t - t0)/16; t0 = t;
    ctx.clearRect(0,0,c.width,c.height);
    pieces.forEach(p => {
      p.vy += 0.02*dt; p.x += p.vx*dt; p.y += p.vy*dt; p.a += 0.1*dt;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      const g = ctx.createLinearGradient(-p.r,-p.r,p.r,p.r);
      g.addColorStop(0, getCSS('--g1')); g.addColorStop(1, getCSS('--g2'));
      ctx.fillStyle = g;
      ctx.fillRect(-p.r,-p.r, p.r*2, p.r*2);
      ctx.restore();
    });
    if (pieces.some(p => p.y < c.height+40)) requestAnimationFrame(loop);
    else c.remove();
  })(t0);
}
function getCSS(varName){ return getComputedStyle(document.documentElement).getPropertyValue(varName).trim(); }

/* BACKGROUND PARTICLES — themed icons */
const canvas = document.getElementById('bgParticles');
const ctx = canvas.getContext('2d');
let W=canvas.width=innerWidth, H=canvas.height=innerHeight;
window.addEventListener('resize', () => { W=canvas.width=innerWidth; H=canvas.height=innerHeight; });
const icons = ['⚙','⚛','💜','♀️','🌸','✨','🦋','🩷']; 
const parts = Array.from({length: 30}, () => seedParticle());
function seedParticle(){
  return {
    x: Math.random()*W, y: Math.random()*H, s: 18+Math.random()*10,
    a: Math.random()*Math.PI*2, v: .1 + Math.random()*.25,
    char: icons[(Math.random()*icons.length)|0], o: .2 + Math.random()*.35
  };
}
(function animate(){
  ctx.clearRect(0,0,W,H);
  parts.forEach(p => {
    p.a += 0.002; p.x += Math.cos(p.a)*p.v; p.y += Math.sin(p.a)*p.v;
    wrap(p);
    ctx.globalAlpha = p.o;
    ctx.font = `${p.s}px "Sora", sans-serif`;
    const g = ctx.createLinearGradient(p.x, p.y, p.x+p.s, p.y+p.s);
    g.addColorStop(0, getCSS('--g1')); g.addColorStop(1, getCSS('--g2'));
    ctx.fillStyle = g;
    ctx.fillText(p.char, p.x, p.y);
    ctx.globalAlpha = 1;
  });
  requestAnimationFrame(animate);
})();
function wrap(p){ if(p.x<-20)p.x=W+20; if(p.x>W+20)p.x=-20; if(p.y<-20)p.y=H+20; if(p.y>H+20)p.y=-20; }
