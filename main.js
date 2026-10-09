/* ================================================
   WORKPRO — 랜딩 페이지 스크립트
   ================================================ */

const STORES = {
  iljaleo: {
    ios: 'https://apps.apple.com/kr/app/id6761646076',
    android: 'https://play.google.com/store/apps/details?id=com.workgood.mobile',
  },
  ilmeori: {
    ios: 'https://apps.apple.com/kr/app/id6760900594',
    android: 'https://play.google.com/store/apps/details?id=com.ilmeori.app',
  },
};

const os = document.documentElement.dataset.os || ''; // <head>에서 감지: 'ios' | 'android' | ''

// ---- 광고 성과 측정: GA4 / Meta 픽셀이 설치돼 있으면 이벤트 전송 ----
function track(name, params = {}) {
  try {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    if (typeof window.fbq === 'function') window.fbq('trackCustom', name, params);
  } catch (_) { /* 측정 실패가 페이지 동작을 막지 않도록 */ }
}

// ---- 스토어 링크: 광고 UTM을 Google Play로 전달 (Play Console 유입 분석용) ----
const utm = new URLSearchParams(
  [...new URLSearchParams(location.search)].filter(([k]) => k.startsWith('utm_'))
).toString();

function storeUrl(app, platform) {
  const url = STORES[app][platform];
  return platform === 'android' && utm ? `${url}&referrer=${encodeURIComponent(utm)}` : url;
}

document.querySelectorAll('[data-store]').forEach((a) => {
  const app = a.dataset.store;
  const platform = a.dataset.os === 'auto' ? (os === 'android' ? 'android' : 'ios') : a.dataset.os;
  a.href = storeUrl(app, platform);
  a.addEventListener('click', () => {
    track('store_click', { app, store: platform, location: a.dataset.trackLoc || '' });
  });
});

document.querySelectorAll('[data-track]').forEach((a) => {
  a.addEventListener('click', () => track(a.dataset.track, { location: a.dataset.trackLoc || '' }));
});

// ---- 네비게이션 그림자 ----
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---- 스크롤 등장 효과 ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ---- 데모 영상: 화면에 보일 때만 로드·재생 (데이터 절약) ----
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target: video, isIntersecting }) => {
    if (isIntersecting) {
      if (!video.src) video.src = video.dataset.src;
      if (!reduceMotion) video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, { threshold: 0.25 });
document.querySelectorAll('video[data-src]').forEach((video) => {
  if (reduceMotion) video.controls = true;
  videoObserver.observe(video);
});

// ---- 화면 미리보기 캐러셀 (좌우 버튼) ----
document.querySelectorAll('.shots-wrap').forEach((wrap) => {
  const track = wrap.querySelector('.shots');
  const [prev, next] = wrap.querySelectorAll('.shots-btn');
  const step = () => {
    const img = track.querySelector('img');
    return img ? img.getBoundingClientRect().width + 12 : 240;
  };
  const update = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step() * 2, behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step() * 2, behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

// ---- 요금제 탭 ----
const tabs = [...document.querySelectorAll('.tab')];
function selectTab(tab) {
  tabs.forEach((t) => {
    const active = t === tab;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', String(active));
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    panel.hidden = !active;
    if (active) panel.classList.add('is-in');
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const nextTab = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    nextTab.focus();
    selectTab(nextTab);
  });
});
// 일머리 섹션을 보고 내려온 사람에게는 일머리 요금제를 먼저 보여주기
document.querySelectorAll('a[href="#pricing"]').forEach((a) => {
  a.addEventListener('click', () => {
    const ilmeori = document.getElementById('ilmeori');
    if (ilmeori.getBoundingClientRect().top < 0) selectTab(document.getElementById('tab-ilmeori'));
  });
});

// ---- 모바일 하단 다운로드 바: 첫 화면의 앱 선택을 지나면 표시, 마지막 CTA에서는 숨김 ----
const dock = document.getElementById('dock');
const picker = document.querySelector('.picker');
const finalSection = document.querySelector('.final');
let pickerPassed = false;
let finalVisible = false;
const updateDock = () => dock.classList.toggle('is-shown', pickerPassed && !finalVisible);

new IntersectionObserver(([entry]) => {
  pickerPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
  updateDock();
}).observe(picker);

new IntersectionObserver(([entry]) => {
  finalVisible = entry.isIntersecting;
  updateDock();
}).observe(finalSection);
