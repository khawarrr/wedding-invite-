/* -----------------------------------------------
   Password gate
----------------------------------------------- */
(function() {
  const gate  = document.getElementById('gate');
  const input = document.getElementById('gateInput');
  const btn   = document.getElementById('gateBtn');
  const error = document.getElementById('gateError');
  const PASSWORD = '0822';

  if (sessionStorage.getItem('fk_unlocked') === '1') {
    gate.classList.add('unlocked');
    return;
  }

  function attempt() {
    if (input.value.trim() === PASSWORD) {
      sessionStorage.setItem('fk_unlocked', '1');
      gate.classList.add('unlocked');
    } else {
      error.textContent = 'Incorrect code. Please try again.';
      input.value = '';
      input.focus();
    }
  }

  btn.addEventListener('click', attempt);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
})();

/* -----------------------------------------------
   Loader
----------------------------------------------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('out');
  }, 1600);
});

/* -----------------------------------------------
   Nav scroll
----------------------------------------------- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* -----------------------------------------------
   Countdown
----------------------------------------------- */
const WEDDING = new Date('2026-08-22T15:00:00');

function pad(n, len = 2) { return String(n).padStart(len, '0'); }

function tick() {
  const diff = WEDDING - new Date();
  if (diff <= 0) {
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => {
      document.getElementById(id).textContent = '00';
    });
    return;
  }
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  document.getElementById('cd-days').textContent  = pad(d);
  document.getElementById('cd-hours').textContent = pad(h);
  document.getElementById('cd-mins').textContent  = pad(m);
  document.getElementById('cd-secs').textContent  = pad(s);
}
tick();
setInterval(tick, 1000);

/* -----------------------------------------------
   Floating petals
----------------------------------------------- */
(function spawnPetals() {
  const container = document.getElementById('petals');
  const palette = ['#F2C0C8','#8B2035','#C47585','#FAE8EA','#D4A0A8'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const sz = 4 + Math.random() * 9;
    p.style.cssText = `
      left:${Math.random()*100}%;
      width:${sz}px; height:${sz}px;
      background:${palette[Math.floor(Math.random()*palette.length)]};
      border-radius:${Math.random()>.5?'50% 0':'50%'};
      animation-duration:${9+Math.random()*14}s;
      animation-delay:${Math.random()*10}s;
    `;
    container.appendChild(p);
  }
})();

/* -----------------------------------------------
   Scroll reveal — IntersectionObserver
----------------------------------------------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => {
  revealObs.observe(el);
});

/* -----------------------------------------------
   Gallery lightbox
----------------------------------------------- */
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbClose  = document.getElementById('lbClose');

document.querySelectorAll('.gi').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* -----------------------------------------------
   RSVP — Google Sheets backend
----------------------------------------------- */

// Paste your Google Apps Script web app URL here after deploying
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbweEZgujMKA1Vn2dM_0jcFQ3nUJd-zO6G6AknghuXFXK4MCW4PrqAR1GQ2n-fPGgxVU5g/exec';

document.querySelectorAll('input[name="attendance"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const attending = radio.value === 'yes';
    document.getElementById('guestsField').style.display = attending ? '' : 'none';
  });
});

document.getElementById('rsvpForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('.btn-send');

  btn.textContent = 'Sending…';
  btn.disabled    = true;

  const attending = form.attendance.value === 'yes';

  const payload = {
    fname:      form.fname.value.trim(),
    lname:      form.lname.value.trim(),
    attendance: form.attendance.value,
    guests:     attending ? form.guests.value : '0',
    message:    form.message.value.trim()
  };

  try {
    await fetch(SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify(payload)
    });

    form.style.display = 'none';
    document.getElementById('rsvpSuccess').classList.add('show');

    // Wire up Apple Calendar ICS download
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fatima & Khawar Wedding//EN',
      'BEGIN:VEVENT',
      'DTSTART:20260822T180000',
      'DTEND:20260822T234500',
      'SUMMARY:Fatima & Khawar Wedding',
      'LOCATION:Montrose Wedding Venue\\, 305 E Phifer St\\, Monroe\\, NC 28110',
      'DESCRIPTION:You are cordially invited to the wedding of Fatima Ali & Khawar Khan.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    document.getElementById('calApple').href = URL.createObjectURL(blob);

  } catch (err) {
    btn.textContent = 'Try Again';
    btn.disabled    = false;
    showFormError('Something went wrong. Please try again.');
  }
});

function showFormError(msg) {
  let el = document.getElementById('formError');
  if (!el) {
    el = document.createElement('p');
    el.id = 'formError';
    el.style.cssText = 'color:#b05a5a;font-size:13px;margin-top:12px;text-align:center;';
    document.getElementById('rsvpForm').appendChild(el);
  }
  el.textContent = msg;
}

/* -----------------------------------------------
   Map picker modal
----------------------------------------------- */
const mapBtn         = document.getElementById('mapBtn');
const mapModal       = document.getElementById('mapModal');
const mapModalCancel = document.getElementById('mapModalCancel');

mapBtn.addEventListener('click', () => {
  mapModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});

function closeMapModal() {
  mapModal.classList.remove('open');
  document.body.style.overflow = '';
}
mapModalCancel.addEventListener('click', closeMapModal);
mapModal.addEventListener('click', e => { if (e.target === mapModal) closeMapModal(); });

/* -----------------------------------------------
   Smooth parallax on hero botanical SVGs (desktop only)
----------------------------------------------- */
const botanicals = document.querySelectorAll('.botanical');
const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (!isTouch) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    botanicals.forEach(b => {
      b.style.transform = b.classList.contains('botanical-br')
        ? `rotate(180deg) translateY(${y * .06}px)`
        : `translateY(${y * .06}px)`;
    });
  }, { passive: true });
}
