使用方法
下載使用之前確保已經有下載並安裝node.js 以及 react next.js 和資料庫workbench 完整的資料 

都確定有下載之後還需要一份.env檔案 

接著在下再好的檔案裡的終端機裡輸入npm i (這會需要一段時間)

下載完成之後 輸入npm run dev 

按住ctrl 點擊 localhost 3000 瀏覽器就會跳轉到我們的，專案首頁，接著開始登入 
帳號是:sailo@sailo.com
密碼是:123456

接下來是我負責的專案功能介紹

Sailo — 旅遊行程規劃平台

使用 Next.js + React 與 Node.js Backend 打造的整合式旅遊平台

專案簡介（Overview）及功能介紹

Sailo 是一個整合了 景點探索、互動式地圖導航、旅遊行程規劃 的完整旅遊平台。
使用者能在平台內完成以下所有旅遊需求：

瀏覽各地景點資訊

使用互動式地圖查看地標

直接開啟 Google Maps 導航
 
建立多天行程、加入景點、撰寫備註

分享行程或複製其他使用者公開行程

上傳景點照片、收藏喜歡的內容

所有使用者上傳的圖片、景點精準座標、行程資料都會被妥善儲存並提供快速載入與操作。

🛠 技術架構（Tech Stack）
Frontend — Sailo

Next.js 14（App Router）

React 18

Tailwind CSS

Axios（與後端 API 溝通）

Leaflet API（實作地圖）

Google Maps Navigation / Google Reviews

ImageKit（雲端圖片儲存）

Backend — Sailo Backend

Node.js + Express

MySQL（景點、行程、評論、收藏資料）

RESTful API 設計

主要功能（Features）
景點探索

依 地區、類別 進行景點篩選

景點卡片採 瀑布流布局

點擊進入後可查看景點完整資訊、圖片、導航按鈕、評論入口

收藏系統

新增 / 刪除自訂收藏清單

收藏景點

在詳細頁面管理收藏

行程管理系統

建立行程（可設定公開 / 私人）

每個行程可規劃多天

每天可加入任意景點

為行程中的景點撰寫個人化備註

行程卡片功能包含：

編輯

收藏 / 取消收藏

複製行程

刪除

互動式地圖 & 導航

使用 Leaflet 顯示所有景點的 marker

點擊景點卡片 → 地標自動高亮

彈出地標資訊視窗（Popup）

串接 Google Maps：

即時導航

景點評論查看

所有景點都保存 精準經緯度，確保搜尋準確度

圖片上傳

使用者可上傳到訪照片與自拍

透過 ImageKit 儲存與 CDN 快取

有效提升圖片讀取速度與穩定度

行程分享社群機制

公開行程 → 所有人可查看

使用者可一鍵複製別人的行程到自己的帳號

支援收藏公開行程
