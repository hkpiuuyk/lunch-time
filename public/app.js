let selectedId = 2;
const list = document.querySelector('#cafeteriaList');
const toast = document.querySelector('#toast');

function statusClass(status) { return status === '여유' ? 'easy' : status === '보통' ? 'normal' : 'busy'; }
function render(cafeterias) {
  list.innerHTML = cafeterias.map(c => {
    const percent = Math.min(100, Math.round(c.people / 90 * 100));
    return `<article class="card ${c.id === selectedId ? 'selected' : ''} ${c.status === '혼잡' ? 'busy-card' : ''}" data-id="${c.id}">
      <div class="card-top"><h3>${c.name}</h3><span class="badge ${statusClass(c.status)}">${c.status}</span></div>
      <div class="detail"><span class="people">👥 약 ${c.people}명 대기 중</span><span class="wait">${c.minutes}분</span></div>
      <div class="bar"><div class="fill" style="width:${percent}%"></div></div><p class="menu">오늘의 메뉴 · ${c.menu}</p>
      <div class="admin"><button data-change="-1">− 1명</button><button data-change="1">+ 1명</button></div></article>`;
  }).join('');
  const selected = cafeterias.find(c => c.id === selectedId);
  document.querySelector('#selectedName').textContent = selected.name;
  document.querySelector('#selectedTime').textContent = `${selected.minutes}분`;
}
async function load() { const r = await fetch('/api/cafeterias'); render(await r.json()); }
list.addEventListener('click', async e => {
  const card = e.target.closest('.card'); if (!card) return;
  const id = Number(card.dataset.id);
  if (e.target.dataset.change) { await fetch(`/api/cafeterias/${id}/people/${e.target.dataset.change}`, { method:'POST' }); await load(); return; }
  selectedId = id; await load();
});
document.querySelector('#noticeBtn').addEventListener('click', e => { e.currentTarget.textContent = '✅ 알림 설정됨'; toast.textContent = '줄이 짧아지면 알려드릴게요!'; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2500); });
const homePage = document.querySelector('#homePage');
const profilePage = document.querySelector('#profilePage');
const recordPage = document.querySelector('#recordPage');
function showPage(page) {
  homePage.classList.toggle('page-hidden', page !== 'home');
  profilePage.classList.toggle('page-hidden', page !== 'profile');
  recordPage.classList.toggle('page-hidden', page !== 'record');
  document.querySelectorAll('nav button').forEach(button => button.classList.toggle('active', button.dataset.page === page));
}
document.querySelectorAll('nav button').forEach(button => button.addEventListener('click', () => showPage(button.dataset.page)));
document.querySelector('#backBtn').addEventListener('click', () => showPage('home'));
document.querySelector('#toggleBtn').addEventListener('click', e => { e.currentTarget.classList.toggle('on'); e.currentTarget.setAttribute('aria-label', e.currentTarget.classList.contains('on') ? '알림 끄기' : '알림 켜기'); });
const defaultRecords = [
  { month:10, day:'23', week:'금', cafe:'별관 급식실', time:'12:21', menu:'치킨마요덮밥', wait:5, icon:'🍱' },
  { month:10, day:'22', week:'목', cafe:'본관 급식실', time:'12:32', menu:'제육볶음', wait:9, icon:'🍲' },
  { month:10, day:'21', week:'수', cafe:'별관 급식실', time:'12:18', menu:'카레라이스', wait:4, icon:'🍛' },
  { month:9, day:'29', week:'월', cafe:'학생회관', time:'12:35', menu:'돈까스우동', wait:7, icon:'🍜' },
  { month:9, day:'26', week:'금', cafe:'별관 급식실', time:'12:17', menu:'비빔밥', wait:3, icon:'🍚' },
  { month:11, day:'3', week:'화', cafe:'본관 급식실', time:'12:28', menu:'불고기덮밥', wait:6, icon:'🥘' }
];
let records = JSON.parse(localStorage.getItem('lunchTimeRecords') || 'null') || defaultRecords;
records = records.map(record => ({ ...record, month: record.month || 10 }));
let selectedMonth = 10;
function saveRecords() { localStorage.setItem('lunchTimeRecords', JSON.stringify(records)); }
function renderRecords() {
  const recordList = document.querySelector('#recordList');
  const monthlyRecords = records.filter(record => record.month === selectedMonth);
  document.querySelector('#recordTitle').textContent = `${selectedMonth}월 이용 기록`;
  if (!monthlyRecords.length) { recordList.innerHTML = `<div class="empty-record">${selectedMonth}월 기록이 없어요.<br>위의 기록 추가 버튼을 눌러 보세요!</div>`; document.querySelector('#recordSummary').innerHTML = ''; return; }
  recordList.innerHTML = monthlyRecords.map(r => `<article class="record-item"><div class="record-date"><b>${r.day}</b><span>${r.week}</span></div><div class="record-icon">${r.icon}</div><div class="record-info"><b>${r.cafe}</b><small>${r.time} 입장 · ${r.menu}</small></div><div class="record-wait"><b>${r.wait}분</b><span>대기</span></div><button class="remove-record" data-id="${records.indexOf(r)}">삭제</button></article>`).join('');
  const fastest = monthlyRecords.reduce((a, b) => a.wait < b.wait ? a : b);
  document.querySelector('#recordSummary').innerHTML = `<span>🏆</span><p><b>가장 빠른 선택</b><br>${fastest.week}요일 ${fastest.time}, ${fastest.cafe}에서 ${fastest.wait}분만 기다렸어요!</p>`;
}
document.querySelector('#addRecordBtn').addEventListener('click', () => {
  const cafe = prompt('급식실 이름을 입력하세요.', '별관 급식실'); if (!cafe) return;
  const wait = Number(prompt('기다린 시간을 분 단위로 입력하세요.', '5')); if (!Number.isFinite(wait) || wait < 0) return alert('0 이상의 숫자를 입력해 주세요.');
  const menu = prompt('먹은 메뉴를 입력하세요.', '오늘의 급식') || '오늘의 급식';
  const now = new Date(); const weeks = ['일','월','화','수','목','금','토'];
  records.unshift({ month:selectedMonth, day:String(now.getDate()), week:weeks[now.getDay()], cafe, time:now.toTimeString().slice(0,5), menu, wait, icon:'🍽️' }); saveRecords(); renderRecords();
});
document.querySelector('#recordList').addEventListener('click', e => { if (e.target.dataset.id === undefined) return; records.splice(Number(e.target.dataset.id), 1); saveRecords(); renderRecords(); });
document.querySelector('#editProfileBtn').addEventListener('click', () => {
  const name = prompt('이름을 입력하세요.', document.querySelector('#profileName').textContent); if (!name) return;
  const grade = prompt('학년·반을 입력하세요.', document.querySelector('#profileClass').textContent); if (!grade) return;
  document.querySelector('#profileName').textContent = name; document.querySelector('#profileClass').textContent = grade;
  localStorage.setItem('lunchTimeProfile', JSON.stringify({name, grade}));
});
const savedProfile = JSON.parse(localStorage.getItem('lunchTimeProfile') || 'null');
if (savedProfile) { document.querySelector('#profileName').textContent = savedProfile.name; document.querySelector('#profileClass').textContent = savedProfile.grade; }
document.querySelector('#calendarBtn').addEventListener('click', () => document.querySelector('#monthPicker').classList.toggle('page-hidden'));
document.querySelector('#monthPicker').addEventListener('click', e => {
  if (!e.target.dataset.month) return;
  selectedMonth = Number(e.target.dataset.month);
  document.querySelector('#calendarBtn').textContent = `📅 ${selectedMonth}월`;
  document.querySelectorAll('#monthPicker button').forEach(button => button.classList.toggle('selected-month', Number(button.dataset.month) === selectedMonth));
  document.querySelector('#monthPicker').classList.add('page-hidden'); renderRecords();
});
renderRecords();
load();
