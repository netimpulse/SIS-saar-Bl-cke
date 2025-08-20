document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.leistungen-button-handyopt').forEach(root => {
    const viewport   = root.querySelector('.carousel-viewport');
    const track      = root.querySelector('.carousel-track');
    const slides     = Array.from(track.children);
    const dotsWrap   = root.querySelector('.carousel-dots');
    const prevBtn    = root.querySelector('.carousel-arrow--prev');
    const nextBtn    = root.querySelector('.carousel-arrow--next');
    const mq         = window.matchMedia('(max-width: 749px)');

    let index = 0;
    let isMobileInit = false;

    // Dots erzeugen
    if (dotsWrap) {
      dotsWrap.innerHTML = slides.map((_, i) =>
        `<button class="dot${i === 0 ? ' is-active' : ''}" aria-label="Slide ${i+1}" type="button"></button>`
      ).join('');
    }

    function setActiveDot() {
      if (!dotsWrap) return;
      const dots = dotsWrap.querySelectorAll('.dot');
      const len = slides.length;
      const safe = ((index % len) + len) % len;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === safe));
    }

    function slideWidth() {
      return track.querySelector('.carousel-slide').getBoundingClientRect().width;
    }

    function jumpInstant(i) {
      const w = slideWidth();
      track.style.transition = 'none';
      track.style.transform = `translateX(-${w * (i + 1)}px)`;
      void track.offsetHeight; // reflow
    }

    function go(delta) {
      index += delta;
      const len = slides.length;
      const w = slideWidth();
      track.style.transition = 'transform .35s ease';
      track.style.transform = `translateX(-${w * (index + 1)}px)`;

      track.addEventListener('transitionend', function handler() {
        track.removeEventListener('transitionend', handler);
        if (index >= len) { index = 0; jumpInstant(index); }
        if (index < 0)    { index = len - 1; jumpInstant(index); }
        setActiveDot();
      }, { once: true });
    }

    function initMobile() {
      if (isMobileInit || !mq.matches) return;
      isMobileInit = true;

      // Clones für Endlosigkeit
      const first = slides[0].cloneNode(true);
      const last  = slides[slides.length - 1].cloneNode(true);
      track.insertBefore(last, track.firstChild);
      track.appendChild(first);
      if (slides[1]) track.appendChild(slides[1].cloneNode(true));

      jumpInstant(0);
      setActiveDot();

      nextBtn?.addEventListener('click', () => go(1));
      prevBtn?.addEventListener('click', () => go(-1));

      // Swipe
      let startX = 0, dx = 0, active = false;
      viewport.addEventListener('touchstart', e => {
        active = true; startX = e.touches[0].clientX; dx = 0;
      }, { passive: true });
      viewport.addEventListener('touchmove', e => {
        if (!active) return; dx = e.touches[0].clientX - startX;
      }, { passive: true });
      viewport.addEventListener('touchend', () => {
        if (!active) return; active = false;
        if (Math.abs(dx) > 30) go(dx < 0 ? 1 : -1);
      });

      // Dots Navigation
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.dot').forEach((dot, i) => {
          dot.addEventListener('click', () => {
            const jump = i - index;
            if (jump) go(jump);
          });
        });
      }

      window.addEventListener('resize', () => {
        if (mq.matches) { jumpInstant(index); }
        else { track.style.transition = ''; track.style.transform = ''; }
      });
    }

    initMobile();
    mq.addEventListener
      ? mq.addEventListener('change', initMobile)
      : window.addEventListener('resize', initMobile);
  });
});
