// ========== Theme ==========
(function initTheme(){
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();

document.getElementById("themeToggle")?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);

  // Redraw radar with correct colors
  drawRadar();
});

// ========== Mobile Nav ==========
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-link").forEach(a => {
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

// ========== Active section highlight ==========
const observedSections = document.querySelectorAll("[data-observe]");
const navItems = document.querySelectorAll(".nav-link");

const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.getAttribute("data-observe");
    navItems.forEach(n => n.classList.toggle("active", n.dataset.section === id));
  });
}, { rootMargin: "-35% 0px -55% 0px", threshold: 0.05 });

observedSections.forEach(s => obs.observe(s));

// ========== Scroll progress ==========
const progress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? (scrolled / max) * 100 : 0;
  if (progress) progress.style.width = `${pct}%`;
});

// ========== Footer year ==========
document.getElementById("year").textContent = new Date().getFullYear();

// ========== Project Modals ==========
function openModal(id){
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Focus close button for accessibility
  const closeBtn = modal.querySelector("[data-close]");
  if (closeBtn) closeBtn.focus();

  // ESC to close
  const onKey = (e) => {
    if (e.key === "Escape") closeModal(modal, onKey);
  };
  window.addEventListener("keydown", onKey);
  modal._onKey = onKey;
}

function closeModal(modal, onKey){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  window.removeEventListener("keydown", onKey || modal._onKey);
}

document.querySelectorAll("[data-modal]").forEach(card => {
  const open = () => openModal(card.getAttribute("data-modal"));
  card.addEventListener("click", open);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });
});

document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.hasAttribute("data-close")) {
      closeModal(modal);
    }
  });

  // Single-open accordion: when one details opens, close others
  const details = modal.querySelectorAll(".accordion details");
  details.forEach(detail => {
    detail.addEventListener("toggle", (e) => {
      if (detail.open) {
        details.forEach(other => {
          if (other !== detail) other.open = false;
        });
      }
    });
  });
});

// ========== Experience toggle ==========
const tabEdu = document.getElementById("tabEdu");
const tabWork = document.getElementById("tabWork");
const panelEdu = document.getElementById("panelEdu");
const panelWork = document.getElementById("panelWork");

function setTab(which){
  const edu = which === "edu";
  tabEdu.classList.toggle("active", edu);
  tabWork.classList.toggle("active", !edu);
  tabEdu.setAttribute("aria-selected", String(edu));
  tabWork.setAttribute("aria-selected", String(!edu));
  panelEdu.classList.toggle("hidden", !edu);
  panelWork.classList.toggle("hidden", edu);
}

tabEdu?.addEventListener("click", () => setTab("edu"));
tabWork?.addEventListener("click", () => setTab("work"));

// ========== Timeline: allow only one open details ==========
(function singleOpenTimeline(){
  const items = Array.from(document.querySelectorAll('.timeline-item'));
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('toggle', (e) => {
      // If this item was just opened, close all others
      if (item.open) {
        items.forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();

// ========== Testimonials slider ==========
const track = document.getElementById("testiTrack");
const dotsWrap = document.getElementById("testiDots");
const testiPrev = document.getElementById("testiPrev");
const testiNext = document.getElementById("testiNext");

let testiIndex = 0;

function setupDots(){
  if (!track || !dotsWrap) return;
  const slides = Array.from(track.children);
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot-btn" + (i === 0 ? " active" : "");
    b.setAttribute("aria-label", `Go to testimonial ${i+1}`);
    b.addEventListener("click", () => goTesti(i));
    dotsWrap.appendChild(b);
  });
}

function goTesti(i){
  if (!track) return;
  const slides = Array.from(track.children);
  testiIndex = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${testiIndex * 100}%)`;
  Array.from(dotsWrap?.children || []).forEach((d, idx) => {
    d.classList.toggle("active", idx === testiIndex);
  });
}

testiPrev?.addEventListener("click", () => goTesti(testiIndex - 1));
testiNext?.addEventListener("click", () => goTesti(testiIndex + 1));
setupDots();

// ========== Skills Radar (category-based, not proficiency) ==========
const radarCanvas = document.getElementById("skillsRadar");
const radarCtx = radarCanvas ? radarCanvas.getContext("2d") : null;

// You can change these freely.
// Values are "coverage emphasis" (not skill level). Keep them modest and consistent.
const radarData = [
  { label: "Domain Knowledge", value: 0.77 },
  { label: "Design/CAD", value: 0.68 },
  { label: "Data/Automation", value: 0.72 },
  { label: "Web Skills", value: 0.71 },
  { label: "Communication/Teamwork", value: 0.84 },
  { label: "Leadership/Delivery",  value: 0.87 },
];

function cssVarToHsl(varName, fallback){
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val ? `hsl(${val})` : fallback;
}

function drawRadar(){
  if (!radarCanvas || !radarCtx) return;

  // Handle high DPI
  const size = Math.min(700, radarCanvas.parentElement?.clientWidth || 700);
  const dpr = window.devicePixelRatio || 1;
  radarCanvas.width = Math.floor(size * dpr);
  radarCanvas.height = Math.floor(size * dpr);
  radarCanvas.style.width = `${size}px`;
  radarCanvas.style.height = `${size}px`;

  radarCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = size, h = size;
  const cx = w / 2, cy = h / 2;
  const r = (Math.min(w, h) / 2) - 110;

  const text = cssVarToHsl("--text", "#111");
  const muted = cssVarToHsl("--muted", "#666");
  const border = cssVarToHsl("--border", "#ddd");
  const accent = cssVarToHsl("--accent", "hsl(332 64% 72%)");

  radarCtx.clearRect(0, 0, w, h);

  // Grid rings
  const rings = 5;
  for (let i = 1; i <= rings; i++){
    const rr = (r / rings) * i;
    radarCtx.beginPath();
    radarCtx.strokeStyle = border;
    radarCtx.lineWidth = 1;
    radarCtx.globalAlpha = 0.9;
    radarCtx.arc(cx, cy, rr, 0, Math.PI * 2);
    radarCtx.stroke();
  }
  radarCtx.globalAlpha = 1;

  const n = radarData.length;
  const angleStep = (Math.PI * 2) / n;
  const startAngle = -Math.PI / 2;

  // Axes + labels
  radarCtx.font = "600 12px Inter, system-ui, sans-serif";
  radarCtx.fillStyle = muted;

  for (let i = 0; i < n; i++){
    const a = startAngle + i * angleStep;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;

    // axis line
    radarCtx.beginPath();
    radarCtx.strokeStyle = border;
    radarCtx.moveTo(cx, cy);
    radarCtx.lineTo(x, y);
    radarCtx.stroke();

    // label position - increased offset to prevent cutoff
    const lx = cx + Math.cos(a) * (r + 35);
    const ly = cy + Math.sin(a) * (r + 35);

    const label = radarData[i].label;

    // Basic alignment
    const align = (Math.cos(a) > 0.2) ? "left" : (Math.cos(a) < -0.2 ? "right" : "center");
    radarCtx.textAlign = align;
    radarCtx.textBaseline = (Math.sin(a) > 0.2) ? "top" : (Math.sin(a) < -0.2 ? "bottom" : "middle");
    
    // Wrap text on slash or if too wide
    const maxWidth = 60;
    const slashWords = label.split('/');
    if (slashWords.length > 1) {
      // Draw on two lines split by slash
      radarCtx.fillText(slashWords[0], lx, ly - 8);
      radarCtx.fillText(slashWords[1], lx, ly + 8);
    } else if (radarCtx.measureText(label).width > maxWidth) {
      // For labels with spaces, wrap at word boundaries
      const spaceWords = label.split(' ');
      if (spaceWords.length > 1) {
        let line1 = '', line2 = '';
        for (let i = 0; i < spaceWords.length; i++) {
          const word = spaceWords[i];
          const testLine = line1 ? line1 + ' ' + word : word;
          if (radarCtx.measureText(testLine).width <= maxWidth) {
            line1 = testLine;
          } else {
            line2 = line2 ? line2 + ' ' + word : word;
          }
        }
        radarCtx.fillText(line1, lx, ly - 8);
        if (line2) radarCtx.fillText(line2, lx, ly + 8);
      } else {
        // Fallback to character-by-character split for single long words
        const chars = label.split('');
        let line1 = '', line2 = '';
        for (let c of chars) {
          if (radarCtx.measureText(line1 + c).width <= maxWidth) {
            line1 += c;
          } else {
            line2 += c;
          }
        }
        radarCtx.fillText(line1, lx, ly - 8);
        if (line2) radarCtx.fillText(line2, lx, ly + 8);
      }
    } else {
      radarCtx.fillText(label, lx, ly);
    }
  }

  // Polygon
  const points = radarData.map((d, i) => {
    const a = startAngle + i * angleStep;
    const rr = r * d.value;
    return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
  });

  radarCtx.beginPath();
  points.forEach((p, idx) => {
    if (idx === 0) radarCtx.moveTo(p.x, p.y);
    else radarCtx.lineTo(p.x, p.y);
  });
  radarCtx.closePath();

  // Fill (soft)
  radarCtx.fillStyle = accent;
  radarCtx.globalAlpha = 0.18;
  radarCtx.fill();

  // Stroke
  radarCtx.strokeStyle = accent;
  radarCtx.lineWidth = 2;
  radarCtx.globalAlpha = 0.9;
  radarCtx.stroke();

  // Dots
  radarCtx.globalAlpha = 1;
  radarCtx.fillStyle = text;
  points.forEach(p => {
    radarCtx.beginPath();
    radarCtx.arc(p.x, p.y, 3.3, 0, Math.PI * 2);
    radarCtx.fill();
  });
}

window.addEventListener("resize", () => drawRadar());
drawRadar();

// ========== Contact form (mailto) ==========
(function initContactForm(){
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (form.elements["name"]?.value || '').trim();
    const email = (form.elements["email"]?.value || '').trim();
    const subject = (form.elements["subject"]?.value || '').trim() || 'Website contact';
    const message = (form.elements["message"]?.value || '').trim();

    if (!name || !email || !message) {
      alert('Please fill in Name, Email and Message.');
      return;
    }

    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:thaddeuscjh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open user's mail client to send the message
    window.location.href = mailto;
  });
})();
