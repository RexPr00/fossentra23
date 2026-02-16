const body = document.body;

const trapFocus = (container, event) => {
  const nodes = container.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
  const focusable = [...nodes].filter(el => !el.disabled && el.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const lockScroll = (lock) => body.classList.toggle('lock-scroll', lock);

const langSwitchers = document.querySelectorAll('.lang-switch');
langSwitchers.forEach(sw => {
  const trigger = sw.querySelector('.lang-trigger');
  const menu = sw.querySelector('.lang-menu');
  if (!trigger || !menu) return;
  trigger.addEventListener('click', () => menu.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!sw.contains(e.target)) menu.classList.remove('open');
  });
});

const drawer = document.querySelector('.drawer');
const drawerBackdrop = document.querySelector('.drawer-backdrop');
const openDrawerBtn = document.querySelector('[data-open-drawer]');
const closeDrawerBtn = document.querySelector('[data-close-drawer]');

const closeDrawer = () => {
  if (!drawer) return;
  drawer.classList.remove('open');
  drawerBackdrop?.classList.remove('open');
  lockScroll(false);
};

openDrawerBtn?.addEventListener('click', () => {
  drawer?.classList.add('open');
  drawerBackdrop?.classList.add('open');
  lockScroll(true);
  drawer?.querySelector('button, a')?.focus();
});
closeDrawerBtn?.addEventListener('click', closeDrawer);
drawerBackdrop?.addEventListener('click', closeDrawer);

const modalBackdrop = document.querySelector('.modal-backdrop');
const modal = document.querySelector('.modal');
const modalOpeners = document.querySelectorAll('[data-open-modal]');
const modalClosers = document.querySelectorAll('[data-close-modal]');

const closeModal = () => {
  modalBackdrop?.classList.remove('open');
  lockScroll(false);
};

modalOpeners.forEach(btn => btn.addEventListener('click', () => {
  modalBackdrop?.classList.add('open');
  lockScroll(true);
  modal?.querySelector('button, a')?.focus();
}));
modalClosers.forEach(btn => btn.addEventListener('click', closeModal));
modalBackdrop?.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDrawer();
    closeModal();
  }
  if (e.key === 'Tab') {
    if (modalBackdrop?.classList.contains('open') && modal) trapFocus(modal, e);
    if (drawer?.classList.contains('open')) trapFocus(drawer, e);
  }
});

const reveal = document.querySelectorAll('[data-reveal]');
const counters = document.querySelectorAll('[data-counter]');
const bars = document.querySelectorAll('.bar-fill');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('show');
    if (entry.target.hasAttribute('data-counter')) {
      const target = Number(entry.target.dataset.counter);
      let value = 0;
      const step = Math.max(1, Math.round(target / 45));
      const timer = setInterval(() => {
        value += step;
        if (value >= target) {
          value = target;
          clearInterval(timer);
        }
        entry.target.textContent = target > 99 ? `${value}+` : `${value}%`;
      }, 24);
    }
    if (entry.target.classList.contains('bar-fill')) {
      entry.target.style.width = `${entry.target.dataset.value}%`;
    }
    observer.unobserve(entry.target);
  });
}, { threshold: 0.2 });

[...reveal, ...counters, ...bars].forEach(el => observer.observe(el));

const items = document.querySelectorAll('.acc-item');
items.forEach(item => {
  const btn = item.querySelector('.acc-btn');
  const panel = item.querySelector('.acc-panel');
  btn?.addEventListener('click', () => {
    items.forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.acc-btn')?.setAttribute('aria-expanded', 'false');
        other.querySelector('.acc-panel').style.maxHeight = null;
      }
    });
    const open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    panel.style.maxHeight = open ? `${panel.scrollHeight + 20}px` : null;
  });
});

const form = document.querySelector('.lead-form');
const toast = document.querySelector('.toast');
form?.addEventListener('submit', e => {
  e.preventDefault();
  const fullName = form.querySelector('[name="fullname"]');
  const email = form.querySelector('[name="email"]');
  const phone = form.querySelector('[name="phone"]');
  const valid = fullName.value.trim().length > 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) && phone.value.trim().length > 5;
  if (!valid) {
    form.reportValidity();
    return;
  }
  form.reset();
  toast?.classList.add('show');
  setTimeout(() => toast?.classList.remove('show'), 2600);
});
