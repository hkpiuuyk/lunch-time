const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const cafeterias = [
  { id: 1, name: '본관 급식실', people: 48, perPerson: 0.35, status: '보통', menu: '제육볶음 · 김치찌개' },
  { id: 2, name: '별관 급식실', people: 21, perPerson: 0.30, status: '여유', menu: '치킨마요덮밥 · 미소국' },
  { id: 3, name: '학생회관', people: 77, perPerson: 0.38, status: '혼잡', menu: '돈까스 · 우동' }
];

function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/cafeterias') {
    return sendJson(res, cafeterias.map(c => ({ ...c, minutes: Math.max(1, Math.ceil(c.people * c.perPerson)) })));
  }
  const match = req.url.match(/^\/api\/cafeterias\/(\d+)\/people\/(-?\d+)$/);
  if (req.method === 'POST' && match) {
    const cafe = cafeterias.find(c => c.id === Number(match[1]));
    if (!cafe) return sendJson(res, { message: '급식실을 찾을 수 없습니다.' }, 404);
    cafe.people = Math.max(0, cafe.people + Number(match[2]));
    cafe.status = cafe.people < 30 ? '여유' : cafe.people < 65 ? '보통' : '혼잡';
    return sendJson(res, { ...cafe, minutes: Math.max(1, Math.ceil(cafe.people * cafe.perPerson)) });
  }
  const requested = req.url === '/' ? 'index.html' : req.url.slice(1);
  const filePath = path.join(__dirname, 'public', requested);
  if (!filePath.startsWith(path.join(__dirname, 'public'))) return sendJson(res, { message: '잘못된 요청입니다.' }, 400);
  fs.readFile(filePath, (err, data) => {
    if (err) return sendJson(res, { message: '페이지를 찾을 수 없습니다.' }, 404);
    const type = filePath.endsWith('.css') ? 'text/css' : filePath.endsWith('.js') ? 'application/javascript' : 'text/html';
    res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`Lunch Time 실행 중: http://localhost:${PORT}`));
