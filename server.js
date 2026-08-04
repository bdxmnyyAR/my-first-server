const http = require('http');
// 1. เรียกใชงาน Pool จากไลบรารี pg สําหรับจัดการการเชื่อมตอฐานขอมูล
const { Pool } = require('pg');
// 2. ตั้งคาการเชื่อมตอ โดยดึง URL มาจาก Environment Variable ของ Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const port = process.env.PORT || 3000;

// helper: escape HTML for server-side rendering (safety)
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // สไตล์หลักที่ใช้ร่วมกันทั้งหน้า (ปรับให้ responsive และโมเดิร์น)
  const styleBlock = `
    <style>
      :root{
        --bg1: #667eea;
        --bg2: #764ba2;
        --accent: #4c1d95;
        --muted: #6b7280;
        --card-bg: rgba(255,255,255,0.98);
        --glass: rgba(255,255,255,0.7);
      }
      * { box-sizing: border-box; }
      html,body { height: 100%; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: 'Segoe UI', 'Sarabun', Tahoma, sans-serif;
        background: linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 28px 16px;
        -webkit-font-smoothing:antialiased;
        -moz-osx-font-smoothing:grayscale;
      }
      .container {
        background: var(--card-bg);
        border-radius: 16px;
        padding: 28px;
        box-shadow: 0 18px 50px rgba(2,6,23,0.45);
        width: 100%;
        max-width: 980px;
        animation: fadeIn 0.5s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      header {
        display:flex;
        gap:12px;
        align-items:center;
        justify-content:space-between;
        margin-bottom: 18px;
      }
      .title-block {
        display:flex;
        gap:12px;
        align-items:center;
      }
      h1 {
        margin: 0;
        color: var(--accent);
        font-size: 1.4rem;
      }
      .subtitle {
        color: var(--muted);
        font-size: 0.9rem;
        margin-top: 4px;
      }
      .controls {
        display:flex;
        gap:8px;
        align-items:center;
      }
      .search {
        display:flex;
        gap:8px;
        align-items:center;
        background: #f3f4f6;
        padding:6px 8px;
        border-radius: 12px;
      }
      .search input {
        border: none;
        background: transparent;
        outline: none;
        width: 220px;
        font-size: 0.95rem;
      }
      .btn {
        background: linear-gradient(90deg,var(--bg1),var(--bg2));
        color: white;
        padding:8px 12px;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        font-weight:600;
        box-shadow: 0 6px 18px rgba(108,99,255,0.18);
      }
      .btn.ghost {
        background: transparent;
        color: var(--accent);
        border: 1px solid rgba(76,29,149,0.08);
        box-shadow: none;
        font-weight:600;
      }
      .info {
        font-size:0.9rem;
        color:var(--muted);
      }

      /* Table */
      .table-wrap {
        width:100%;
        overflow-x:auto;
        margin-top:16px;
      }
      table {
        width:100%;
        border-collapse: collapse;
        min-width: 520px;
        border-radius: 10px;
        overflow: hidden;
      }
      caption {
        text-align:left;
        padding-bottom:8px;
        color:var(--muted);
        font-size:0.95rem;
      }
      thead th {
        background: linear-gradient(90deg,var(--bg1),var(--bg2));
        color: white;
        padding: 12px 14px;
        text-align:left;
        font-size:0.92rem;
        position: sticky;
        top: 0;
      }
      tbody td {
        padding: 12px 14px;
        border-bottom: 1px solid #f1f1f6;
        color: #111827;
        vertical-align: middle;
      }
      tbody tr:hover td {
        background:#f8f7ff;
      }
      .badge {
        display:inline-block;
        padding:6px 10px;
        border-radius:999px;
        background:linear-gradient(90deg,#eef2ff,#ede9fe);
        color:var(--accent);
        font-weight:700;
        font-size:0.85rem;
      }

      /* Responsive: cards on small screens */
      @media (max-width:640px) {
        table, thead, tbody, th, td, tr { display:block; }
        thead { display:none; }
        tbody tr {
          display:block;
          margin-bottom:12px;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 6px 18px rgba(15,23,42,0.04);
          padding:12px;
        }
        tbody td {
          display:flex;
          justify-content:space-between;
          padding:8px 10px;
          border-bottom:none;
        }
        tbody td::before {
          content: attr(data-label);
          color: var(--muted);
          font-size:0.85rem;
        }
      }

      .empty {
        text-align: center;
        color: var(--muted);
        padding: 18px;
      }

      .error-box {
        text-align: center;
        color: #b91c1c;
      }
      .error-box h1 { color: #b91c1c; margin-bottom:8px; }
      .error-box p {
        background: #fff5f5;
        padding: 12px;
        border-radius: 8px;
        font-family: monospace;
        display:inline-block;
      }
      .small {
        font-size:0.85rem;
        color:var(--muted);
      }
      .sort-indicator {
        opacity: 0.85;
        margin-left:8px;
        font-size:0.85rem;
      }
    </style>
  `;

  try {
    // 3. ขอเชื่อมตอและสงคําสั่ง SQL ไปดึงขอมูลจากตาราง students
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM students');
    client.release(); // คนืการเชื่อมตอเมื่อใชงานเสร็จ

    // Prepare a safe JSON payload for client-side (prevent </script> injection)
    const safeRows = result.rows.map(r => ({
      student_id: r.student_id == null ? '' : String(r.student_id),
      student_name: r.student_name == null ? '' : String(r.student_name)
    }));
    const jsonData = JSON.stringify(safeRows).replace(/</g, '\\u003c');

    // 4. นําขอมูลที่ได(result.rows) มาประกอบเปนตาราง HTML (initial server-side render)
    let rowsHtml = '';
    if (result.rows.length === 0) {
      rowsHtml = `<tr><td colspan="2" class="empty">ยังไม่มีข้อมูลนักศึกษา</td></tr>`;
    } else {
      result.rows.forEach(row => {
        rowsHtml += `<tr>
          <td data-label="รหัสนักศึกษา"><span class="badge">${escapeHtml(row.student_id)}</span></td>
          <td data-label="ชื่อ-นามสกุล">${escapeHtml(row.student_name)}</td>
        </tr>`;
      });
    }

    const scriptBlock = `
      <script>
        // initial data from server (escaped)
        const STUDENTS = ${jsonData};

        // render function (will replace tbody contents)
        function renderTable(data) {
          const tbody = document.querySelector('#students-body');
          if (!tbody) return;
          if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="empty">ยังไม่มีข้อมูลนักศึกษา</td></tr>';
            return;
          }
          tbody.innerHTML = data.map(r => {
            // escape for safety on client render
            const id = String(r.student_id || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            const name = String(r.student_name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            return '<tr><td data-label=\"รหัสนักศึกษา\"><span class=\"badge\">'+id+'</span></td><td data-label=\"ชื่อ-นามสกุล\">'+name+'</td></tr>';
          }).join('');
        }

        document.addEventListener('DOMContentLoaded', () => {
          const searchInput = document.querySelector('#search');
          const countEl = document.querySelector('#count');
          let data = STUDENTS.slice();
          let sortDir = { column: null, asc: true };

          function updateCount() {
            if (countEl) countEl.textContent = data.length + ' รายการ';
          }

          function applySearch() {
            const q = searchInput.value.trim().toLowerCase();
            const filtered = STUDENTS.filter(r => {
              return String(r.student_id || '').toLowerCase().includes(q) ||
                     String(r.student_name || '').toLowerCase().includes(q);
            });
            data = filtered;
            // apply current sort if any
            if (sortDir.column) {
              sortData(sortDir.column, sortDir.asc);
            } else {
              renderTable(data);
            }
            updateCount();
          }

          function sortData(column, asc) {
            data.sort((a,b) => {
              const va = String(a[column] || '').toLowerCase();
              const vb = String(b[column] || '').toLowerCase();
              if (va < vb) return asc ? -1 : 1;
              if (va > vb) return asc ? 1 : -1;
              return 0;
            });
            renderTable(data);
            sortDir = { column, asc };
            // update indicator
            document.querySelectorAll('.sort-indicator').forEach(el => el.textContent = '');
            const ind = document.querySelector('#ind-'+column);
            if (ind) ind.textContent = asc ? '▲' : '▼';
          }

          // wire events
          searchInput.addEventListener('input', () => {
            applySearch();
          });

          document.querySelectorAll('.sortable').forEach(th => {
            th.style.cursor = 'pointer';
            th.addEventListener('click', () => {
              const col = th.getAttribute('data-col');
              const asc = !(sortDir.column === col && sortDir.asc);
              sortData(col, asc);
            });
          });

          document.querySelector('#refresh-btn').addEventListener('click', () => {
            // simple refresh (could be enhanced to call API)
            location.reload();
          });

          // initial render
          data = STUDENTS.slice();
          renderTable(data);
          updateCount();
        });
      </script>
    `;

    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>ฐานข้อมูลนักศึกษา</title>
        ${styleBlock}
      </head>
      <body>
        <div class="container" role="main" aria-labelledby="pageTitle">
          <header>
            <div class="title-block">
              <div>
                <h1 id="pageTitle">🎓 ฐานข้อมูลนักศึกษา (ทดสอบการเชื่อมต่อ)</h1>
                <div class="subtitle">แสดงข้อมูลจากตาราง students — สามารถค้นหาและจัดเรียงได้แบบ client-side</div>
              </div>
            </div>
            <div class="controls" aria-hidden="false">
              <div class="search" title="ค้นหารหัสหรือชื่อ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 21l-4.35-4.35" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <input id="search" type="search" placeholder="ค้นหา รหัส หรือ ชื่อ" aria-label="ค้นหารหัสหรือชื่อ" />
              </div>
              <button id="refresh-btn" class="btn ghost" title="รีเฟรชข้อมูล">🔄 รีเฟรช</button>
            </div>
          </header>

          <div class="table-wrap" role="region" aria-live="polite">
            <table role="table" aria-describedby="tableDesc">
              <caption id="tableDesc" class="small">รายการนักศึกษา <span id="count" class="small" style="margin-left:8px;"></span></caption>
              <thead>
                <tr>
                  <th class="sortable" data-col="student_id" scope="col">รหัสนักศึกษา <span id="ind-student_id" class="sort-indicator"></span></th>
                  <th class="sortable" data-col="student_name" scope="col">ชื่อ-นามสกุล <span id="ind-student_name" class="sort-indicator"></span></th>
                </tr>
              </thead>
              <tbody id="students-body">
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <footer style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
            <div class="info">เชื่อมต่อฐานข้อมูลผ่าน DATABASE_URL</div>
            <div class="small">ถ้ามีปัญหา: ตรวจสอบชื่อคอลัมน์/ตาราง และการตั้งค่า DATABASE_URL</div>
          </footer>
        </div>

        ${scriptBlock}
      </body>
      </html>
    `;
    res.end(html);
  } catch (err) {
    // กรณเีชื่อมตอไมไดหรือเขียนชื่อตารางผิด
    console.error(err);
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>เกิดข้อผิดพลาด</title>
        ${styleBlock}
      </head>
      <body>
        <div class="container error-box">
          <h1>⚠️ เกิดข้อผิดพลาด!</h1>
          <p>${escapeHtml(err.message)}</p>
        </div>
      </body>
      </html>
    `;
    res.end(errorHtml);
  }
});

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
