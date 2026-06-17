const express = require('express');
const path = require('path');
const open = require('open');

const app = express();
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Send main index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`[AuraStride] 本地開發伺服器啟動成功！`);
  console.log(`[AuraStride] 正在伺服： ${__dirname}`);
  console.log(`[AuraStride] 預覽網址： http://localhost:${PORT}`);
  console.log(`====================================================`);
  
  try {
    // 自動開啟預設瀏覽器
    await open(`http://localhost:${PORT}`);
    console.log('[AuraStride] 已自動開啟瀏覽器進行預覽。');
  } catch (err) {
    console.error('[AuraStride] 無法自動開啟瀏覽器，請手動輸入網址預覽:', err.message);
  }
});
