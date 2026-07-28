const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const number = entry.target;
    const target = Number(number.dataset.count);
    const suffix = number.textContent.includes('+') ? '+' : number.textContent.includes('%') ? '%' : '';
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      number.textContent = `${Math.round(target * (1 - (1 - progress) ** 3))}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(number);
  });
}, { threshold: 0.7 });

document.querySelectorAll('[data-count]').forEach((number) => countObserver.observe(number));
