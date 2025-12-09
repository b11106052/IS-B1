// 建議 <script src="site.js" defer></script>

document.addEventListener('DOMContentLoaded', () => {

  // 1) 先把 header 載入，再做導覽列初始化
  ensureHeaderContainer()
    .then(loadHeader)
    .then(initNavigation)       // ← header 插入後才抓得到 #navigation
    .catch(console.error);

  // 2) 其他功能不依賴 header，直接初始化
  initPosterCarousel();
  enableHoverAfterReady();
  initFilterDropdown();

  // 初始顯示全部
  applyFilter('全部');
});

/* ---------- header 載入 ---------- */
function ensureHeaderContainer() {
  return new Promise(resolve => {
    let mount = document.getElementById('header-container');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'header-container';
      // 放在 <body> 最上面
      document.body.insertBefore(mount, document.body.firstChild);
    }
    resolve(mount);
  });
}
function loadHeader(mount) {
  return fetch('header.html')
    .then(res => res.text())
    .then(html => {
      mount.innerHTML = html;
      return mount; // 回傳給下一步用
    });
}

/* ---------- 導覽列（行動版開關 + 子選單） ---------- */
function initNavigation() {
  const getNavi = document.getElementById('navigation');
  if (!getNavi) return;

  // 行動版主開關
  const mobile = document.createElement('span');
  mobile.id = 'mobile-navigation';
  getNavi.parentNode.insertBefore(mobile, getNavi);

  mobile.addEventListener('click', () => {
    const opened = !!getNavi.getAttribute('style');
    if (opened) {
      getNavi.removeAttribute('style');
      mobile.style.backgroundImage = 'url(images/mobile/mobile-menu.png)';
    } else {
      getNavi.style.display = 'block';
      mobile.style.backgroundImage = 'url(images/mobile/mobile-close.png)';
    }
  });

  // 行動版子選單切換
  const items = getNavi.getElementsByTagName('LI');
  [...items].forEach((li) => {
    if (li.children.length > 1) {
      const btn = document.createElement('span');
      btn.className = 'mobile-submenu';
      li.appendChild(btn);
      btn.addEventListener('click', () => {
        const sub = li.children[1];
        const opened = !!sub.getAttribute('style');
        if (opened) {
          sub.removeAttribute('style');
          btn.style.backgroundImage = 'url(images/mobile/mobile-expand.png)';
          btn.style.backgroundColor = 'rgba(98, 0, 49, 0.91)';
        } else {
          sub.style.display = 'block';
          btn.style.backgroundImage = 'url(images/mobile/mobile-collapse.png)';
          btn.style.backgroundColor = 'rgba(0, 0, 0, 0.91)';
        }
      });
    }
  });
}

/* ---------- 首圖海報輪播 ---------- */
function initPosterCarousel(){
  const posters = [
    { img:'images/posters/haikyu.jpg',   tag:'排球', title:'Haikyuu!! 排球少年',           desc:'……', link:'projects.html' },
    { img:'images/posters/slamdunk.jpg', tag:'籃球', title:'灌籃高手 THE FIRST SLAM DUNK', desc:'……', link:'projects.html' },
    { img:'images/posters/free.jpg',     tag:'游泳', title:'Free!',                         desc:'……', link:'projects.html' },
  ];
  let idx = 0;
  const elImg  = document.getElementById('ph-image');
  const elTag  = document.getElementById('ph-tag');
  const elTtl  = document.getElementById('ph-title');
  const elDesc = document.getElementById('ph-desc');
  const elLink = document.getElementById('ph-link');
  function render(i){
    if (!(elImg && elTag && elTtl && elDesc && elLink)) return;
    const p = posters[i];
    elImg.src = p.img;
    elImg.alt = p.title + ' 海報';
    elTag.textContent = p.tag;
    elTtl.textContent = p.title;
    elDesc.textContent = p.desc;
    elLink.href = p.link;
  }
  const prevBtn = document.getElementById('ph-prev');
  const nextBtn = document.getElementById('ph-next');
  prevBtn && prevBtn.addEventListener('click', () => { idx=(idx-1+posters.length)%posters.length; render(idx); });
  nextBtn && nextBtn.addEventListener('click', () => { idx=(idx+1)%posters.length; render(idx); });
  render(idx);
}

/* ---------- 首次載入避免 hover 抖動 ---------- */
function enableHoverAfterReady(){
  // 先開啟頁面就緒狀態（如果你用的是這個 class）
  document.documentElement.classList.add('is-ready');
  // 圖片 hover 過渡延後到 window.onload 再啟用（可搭配 CSS 的 .hover-ready）
  window.addEventListener('load', () => {
    document.documentElement.classList.add('hover-ready');
  });
}

/* ---------- 篩選邏輯 ---------- */
const cards = [...document.querySelectorAll('.poster-card')];
function applyFilter(kind){
  const key = (kind || '全部').trim();
  cards.forEach(card => {
    const sports = (card.dataset.sport || '').split(',').map(s => s.trim());
    const show   = key === '全部' || sports.includes(key);
    card.classList.toggle('hidden', !show);
  });
}

/* ---------- 下拉選單開關 + 點選篩選 ---------- */
function initFilterDropdown(){
  const dd   = document.getElementById('sportDropdown');
  if (!dd) return;
  const btn   = dd.querySelector('.chip-dropdown__btn');
  const items = dd.querySelectorAll('.chip-dropdown__item');
  const label = btn.querySelector('.label b');

  function open(){  dd.classList.add('is-open');  btn.setAttribute('aria-expanded','true'); }
  function close(){ dd.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); }
  function toggle(){ dd.classList.contains('is-open') ? close() : open(); }

  btn.addEventListener('click', toggle);
  document.addEventListener('click', (e) => { if (!dd.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  items.forEach(li => {
    li.addEventListener('click', () => {
      const filter = li.dataset.filter;
      label.textContent = filter;
      applyFilter(filter);
      close();
    });
  });
}

function applyFilter(kind){
  const cards = document.querySelectorAll('.poster-card'); // ← moved inside
  const key = (kind || '全部').trim();
  cards.forEach(card => {
    const sports = (card.dataset.sport || '').split(',').map(s => s.trim());
    const show   = key === '全部' || sports.includes(key);
    card.classList.toggle('hidden', !show);
  });
}

