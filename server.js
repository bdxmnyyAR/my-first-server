// 1. เรียกใช้งาน Module ที่ชื่อว่า 'http' ซึ่งเป็นระบบพื้นฐานของ Node.js สําหรับทําเซิรฟ์ เวอร์
const http = require('http');

// 2. กําหนดช่องทาง (Port) ที่เซิร์ฟเวอร์จะใช้สื่อสาร โดยให้ใช้ของที่ Cloud กําหนดมา
// (process.env.PORT) ถ้าไม่มีให้ใช้ 3000
const port = process.env.PORT || 3000;

// 3. สร้างเครื่องแม่ข่าย (Server) ที่คอยรับคําขอ (req) และตอบกลับ (res)
const server = http.createServer((req, res) => {

  // 3.1 ตั้งรหัสสถานะ 200 หมายถึง "ทํางานสําเร็จ (OK)"
  res.statusCode = 200;

  // 3.2 บอกเบราว์เซอร์ของผู้ใช้ว่า สิ่งที่ส่งกลับไปคือไฟล์ข้อความแบบ HTML และรองรับ
  // ภาษาไทย (utf-8)
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // 3.3 ส่งข้อมูลหน้าเว็บกลับไปหาผู้ใช้ (*** นายอาทิตย์ วงศ์ใหญ่ ***)
  // ตกแต่งหน้าเว็บด้วย CSS ให้สวยงาม
  res.end(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <title>สวัสดีครับ!</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-image: url('https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'); /* เปลี่ยน URL รูปภาพท้องฟ้าได้ */
          background-size: cover;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .container {
          background-color: rgba(255, 255, 255, 0.8);
          padding: 50px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        }

        h1 {
          color: #333;
          margin-bottom: 20px;
        }

        p {
          color: #555;
          font-size: 18px;
        }

        /* ตกแต่งใบไม้ปลิว */
        .leaf {
          position: absolute;
          width: 50px;
          height: 50px;
          background-image: url('https://w7.pngwing.com/pngs/303/491/png-transparent-leaf-maple-leaf-orange-leaf-orange-maple-leaf-photography-leaf-autumn.png'); /* เปลี่ยน URL รูปภาพใบไม้ได้ */
          background-size: cover;
          animation: leaf-fall 10s linear infinite;
        }

        @keyframes leaf-fall {
          0% {
            top: -100px;
            transform: translateX(0) rotate(0deg);
          }
          100% {
            top: 100vh;
            transform: translateX(100px) rotate(360deg);
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>สวัสดีครับ! นี่คือ Web Server ของ [นายอาทิตย์ วงศ์ใหญ่ และ 69319010418]</h1>
        <p>เครื่องแม่ข่ายทํางานปกติบนระบบ Railway แล้วครับผม!</p>
      </div>

      <!-- เพิ่มใบไม้ปลิว -->
      <div class="leaf" style="left: 10%; animation-delay: 1s;"></div>
      <div class="leaf" style="left: 30%; animation-delay: 3s;"></div>
      <div class="leaf" style="left: 50%; animation-delay: 5s;"></div>
      <div class="leaf" style="left: 70%; animation-delay: 7s;"></div>
      <div class="leaf" style="left: 90%; animation-delay: 9s;"></div>
    </body>
    </html>
  `);
});

// 4. สั่งให้เซิร์ฟเวอร์เริ่มต้นเปิดรับฟังการเชื่อมต่อตาม Port ที่กําหนดไว้
server.listen(port, () => {
  console.log(`Server is running! เคร่อืงแม่ข่ายเปิดทํางานแล้วที่ช่องทาง: ${port}`);
});
