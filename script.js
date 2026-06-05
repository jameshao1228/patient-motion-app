
const data = window.APP_DATA.categories;
let currentCategory = null;
let currentStep = 0;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function init(){
  renderCards(data);
  $('#searchInput').addEventListener('input', handleSearch);
  $('#fontBtn').addEventListener('click', () => document.body.classList.toggle('large-text'));
  $('#backBtn').addEventListener('click', showHome);
  $('#prevBtn').addEventListener('click', () => changeStep(-1));
  $('#nextBtn').addEventListener('click', () => changeStep(1));
  $('#homeFooterBtn').addEventListener('click', showHome);
  $('#topFooterBtn').addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  $('#closeModal').addEventListener('click', closeModal);
  $('#imageModal').addEventListener('click', (e) => { if(e.target.id === 'imageModal') closeModal(); });
  document.addEventListener('keydown', (e)=>{
    if($('#detailView').classList.contains('active')){
      if(e.key==='ArrowLeft') changeStep(-1);
      if(e.key==='ArrowRight') changeStep(1);
    }
    if(e.key==='Escape') closeModal();
  });
}

function renderCards(list){
  const grid = $('#categoryGrid');
  grid.innerHTML = '';
  list.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.setAttribute('aria-label', `${cat.title}，共${cat.steps.length}張步驟圖`);
    btn.innerHTML = `
      <div><span class="num">${cat.id}</span><h2>${cat.title}</h2></div>
      <div class="count">${cat.steps.length} 張步驟圖 ›</div>
    `;
    btn.addEventListener('click', () => openCategory(cat.id));
    grid.appendChild(btn);
  });
  $('#emptyState').style.display = list.length ? 'none' : 'block';
}

function handleSearch(e){
  const q = e.target.value.trim();
  const filtered = data.filter(cat => cat.title.includes(q) || cat.id.includes(q));
  renderCards(filtered);
}

function openCategory(id){
  currentCategory = data.find(c => c.id === id);
  currentStep = 0;
  $('#homeView').classList.remove('active');
  $('#detailView').classList.add('active');
  renderDetail();
  window.scrollTo({top:0, behavior:'smooth'});
}

function showHome(){
  $('#detailView').classList.remove('active');
  $('#homeView').classList.add('active');
  currentCategory = null;
  window.scrollTo({top:0, behavior:'smooth'});
}

function renderDetail(){
  const cat = currentCategory;
  const step = cat.steps[currentStep];
  $('#detailName').textContent = cat.title;
  $('#detailMeta').textContent = `第 ${currentStep + 1} / ${cat.steps.length} 張`;
  $('#stepBadge').textContent = `步驟 ${currentStep + 1}`;
  $('#mainImage').src = step.src;
  $('#mainImage').alt = `${cat.title} 步驟 ${currentStep + 1}`;
  $('#progressBar').style.width = `${((currentStep + 1) / cat.steps.length) * 100}%`;
  $('#prevBtn').disabled = currentStep === 0;
  $('#nextBtn').disabled = currentStep === cat.steps.length - 1;
  $('#notesList').innerHTML = cat.notes.map(n => `<li>${n}</li>`).join('');
  renderThumbs();
  renderAllSteps();
}

function renderThumbs(){
  const row = $('#thumbRow');
  row.innerHTML = '';
  currentCategory.steps.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'thumb' + (i === currentStep ? ' active' : '');
    b.setAttribute('aria-label', `跳到步驟 ${i+1}`);
    b.innerHTML = `<img src="${s.src}" alt="縮圖 ${i+1}">`;
    b.addEventListener('click', () => { currentStep = i; renderDetail(); window.scrollTo({top:0, behavior:'smooth'}); });
    row.appendChild(b);
  });
}

function renderAllSteps(){
  const list = $('#stepList');
  list.innerHTML = '';
  currentCategory.steps.forEach((s, i)=>{
    const item = document.createElement('div');
    item.className = 'step-mini';
    item.innerHTML = `<h4>步驟 ${i+1}</h4><img src="${s.src}" alt="${currentCategory.title} 步驟 ${i+1}" data-src="${s.src}">`;
    item.querySelector('img').addEventListener('click', () => openModal(s.src));
    list.appendChild(item);
  });
  $('#mainImage').onclick = () => openModal(currentCategory.steps[currentStep].src);
}

function changeStep(delta){
  const next = currentStep + delta;
  if(!currentCategory || next < 0 || next >= currentCategory.steps.length) return;
  currentStep = next;
  renderDetail();
  window.scrollTo({top:0, behavior:'smooth'});
}

function openModal(src){
  $('#modalImage').src = src;
  $('#imageModal').classList.add('active');
}
function closeModal(){
  $('#imageModal').classList.remove('active');
  $('#modalImage').src = '';
}

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}

document.addEventListener('DOMContentLoaded', init);
