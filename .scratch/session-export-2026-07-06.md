# Sailo 前端專案 — 對話與更動完整紀錄

- **日期**：2026-07-06
- **專案**：`sailo_fronte_end`（Next.js 15 + React 19），另涉及 `sailo_backend`、`Sailo_DB`
- **Git 分支**：`lxy1`
- **範圍**：從本次對話第一句話開始，到目前為止的所有問答、調查結果與程式碼異動

> ℹ️ **關於 git commit 的說明**：本次對話中我（Claude）自己從未執行過 `git commit` 或 `git push`，過程中出現的以下三個提交都是**使用者自己在 GitHub／本機手動 commit 並推送**的，不是自動化機制：
> - `79aaa3b 更新檔案`（對應：刪除死路由 trip/page.jsx、[tid]/page.jsx）
> - `04a9a70 更新檔案2026/7/6`（對應：刪除死碼元件、修 API 網址硬編碼）
> - `bcc72d3 檔案更新 新增行程景點的拖曳排序功能2026/7/6`（對應：bug 修復、重複實作整併、拖曳排序功能）
>
> （先前調查階段一度懷疑是自動提交機制，經使用者確認後排除，特此更正。）

---

## 目錄

1. [第一階段：專案功能總覽](#第一階段專案功能總覽)
2. [第二階段：前後端架構說明](#第二階段前後端架構說明)
3. [第三階段：後台管理頁面現況](#第三階段後台管理頁面現況)
4. [第四階段：行程管理功能深度分析](#第四階段行程管理功能深度分析)
5. [第五階段：刪除死路由](#第五階段刪除死路由)
6. [第六階段：行程管理逐檔案技術文件](#第六階段行程管理逐檔案技術文件)
7. [第七階段：清理死碼／孤兒元件](#第七階段清理死碼孤兒元件)
8. [第八階段：修正硬編碼 API 網址](#第八階段修正硬編碼-api-網址)
9. [第九階段：建立 .env.local](#第九階段建立-envlocal)
10. [第十階段：修復四個明確 Bug](#第十階段修復四個明確-bug)
11. [第十一階段：整併四處重複實作](#第十一階段整併四處重複實作)
12. [第十二階段：分頁功能現況確認](#第十二階段分頁功能現況確認)
13. [第十三階段：剩餘三項（locations API、空殼函式、拖曳排序新功能）](#第十三階段剩餘三項)
14. [完整檔案異動總表](#完整檔案異動總表)
15. [目前已知、刻意保留不動的項目](#目前已知刻意保留不動的項目)

---

## 第一階段：專案功能總覽

**問**：「幫我檢查這個專案現在有哪些功能」

**做法**：派出 Explore 子代理，掃描 `package.json`、`app/` 路由結構、主要功能模組、API 整合方式。

**結果（功能盤點）**：
- **框架**：Next.js 15（App Router + Turbopack）、React 19、Tailwind CSS 4、Context API 狀態管理（無 Redux）、Socket.IO 即時通訊
- **帳號系統**：登入/註冊、忘記密碼＋OTP、2FA、Session 管理、會員中心
- **行程規劃（Custom Trip）**：`app/site/custom/`，含加入行程、地圖路線、景點搜尋、願望清單
- **打包清單（Packing Lists）**：分類/項目管理，結合天氣建議
- **電商商城**：商品列表/詳情、評論、購物車、結帳、訂單追蹤
- **部落格/社群**：貼文、留言、追蹤系統
- **即時客服聊天**：顧客端（含 AI 聊天）+ 後台管理
- **後台管理**：`app/admin/`，儀表板 + 客服管理
- **架構**：純前端，無 `app/api`，透過 `services/api.js` 呼叫獨立的 `sailo_backend`

---

## 第二階段：前後端架構說明

**問**：「純前端架構,無 app/api,透過 services/api.js 呼叫獨立的後端(sailo_backend) 這是什麼意思」

**說明重點**：
- 兩種常見 Next.js 架構：全端（`app/api/`）vs 純前端呼叫外部後端
- 這個專案採用後者：`services/api.js` 第 18-19 行 `API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'`、`API_VERSION = '/api/v2'`
- 第 38 行 `credentials: 'include'`：用 httpOnly cookie 做身份驗證，不使用 localStorage
- 401 時自動嘗試 refresh token 並重打請求
- 結論：前端只管畫面，所有實際邏輯（資料庫、驗證、訂單等）都在獨立的 `sailo_backend` 專案

---

## 第三階段：後台管理頁面現況

**問**：「那我需要做一個可以看到資料畫面的後端網站嗎」→「我要怎麼看到後端資料的畫面」→「所以這個 http://localhost:3000/admin 只是畫面呈現而已沒有實際資料嗎」

**調查結果**：
- `app/admin/` 已有雛形：`page.jsx`（儀表板）、`layout.jsx`（權限守衛）、`components/AdminSidebar.jsx`、`customer-service/page.jsx`
- **統計卡片**（會員數 128、訂單數 45、商品數 32）：**寫死假資料**，只有「待處理客服」是真的打 API
- **快速功能卡片**現況：

| 功能 | 路由 | 狀態 |
|---|---|---|
| 客服系統 | `/admin/customer-service` | ✅ 真實可用 |
| 商品管理 | `/admin/products` | ❌ `coming-soon`，資料夾不存在 |
| 訂單管理 | `/admin/orders` | ⚠️ 標 active 但資料夾不存在 → 404 |
| 會員管理 | `/admin/users` | ⚠️ 同上 → 404 |
| 數據分析 | `/admin/analytics` | ❌ `coming-soon`，不存在 |
| 系統設定 | `/admin/settings` | ⚠️ 同上 → 404 |

- **如何實際看到畫面**：啟動前後端伺服器 → 登入帳號需在資料庫把 `access` 欄位設為 `'admin'`（`app/admin/layout.jsx:48` 有權限檢查，非 admin 會被踢回首頁）→ 瀏覽 `http://localhost:3000/admin`
- **結論**：目前唯一「有畫面又有真資料」的只有客服系統，其餘是設計稿等級的介面。（此部分**未進行任何程式碼修改**，純調查說明）

---

## 第四階段：行程管理功能深度分析

**問**：「先幫我把行程管理功能的詳細功能介紹清楚」

**做法**：派 Explore 子代理深入 `app/site/custom/` 全部檔案。

**主要發現**：

1. **主入口頁 `page.jsx`**：景點瀏覽/發現頁（搜尋、篩選、無限捲動卡片牆），非行程頁本身
2. **「加入行程」有 3 套並存、互不相通的收藏機制**：
   - 加入行程（真正的行程規劃）：`AddToTripDrawer` → `useAddToTrip` → `tripApi.addPlaceToDay`
   - 收藏清單（Wishlist）：`SoloTravelWishlist` → `useWishlist` → 走 `/api/favorites/*`（獨立於 tripApi）
   - 行程收藏：收藏別人公開的「整個行程」，又是第三套資料
3. **行程資料模型**（`tripApi.js`）：`Trip` → 多個 `Day` → 每個 Day 多個 `Item`，CRUD 齊全
4. **「我的行程」入口有兩套，完整度差很多**：
   - ✅ `components/toggleBar.jsx`（`ToggleBar`）：真正可用、串好後端的主線
   - ❌ `app/site/custom/trip/page.jsx`：匯入**不存在的檔案**（`addtotripdrawer copy`），且用了未宣告變數 `userId`，是死路由
   - ❌ `app/site/custom/[tid]/page.jsx`：資料夾叫 `[tid]`，程式碼卻讀 `params.id`，永遠拿不到值，渲染的還是景點詳情而非行程詳情，是孤兒路由
5. **地圖整合**：`map-route` 是「使用者位置 → 單一景點」導航（Leaflet + OSRM），**不是**多站點行程路線優化
6. **`CommentSystem.jsx`（景點留言）**：完全是前端 Mock，資料存在瀏覽器 `localStorage`，沒有任何後端 API，任何人可冒名新增/刪除留言

（此階段為純調查，尚未修改程式碼）

---

## 第五階段：刪除死路由

**問**：「先幫我把死路由跟半成品刪掉」

**驗證**：用 Grep 確認 `app/site/custom/trip/page.jsx` 與 `app/site/custom/[tid]/page.jsx` 全站零引用、零連結指向。

**動作**：
- ❌ **刪除** `app/site/custom/trip/page.jsx`
- ❌ **刪除** `app/site/custom/[tid]/page.jsx`

**保留（更正說明）**：
- `travelList.jsx`（ItineraryList）：當時發現其實被 `travelApp.jsx` 引用，而 `TravelApp` 真的掛在主頁上，屬於「活的但沒做完」，非死碼，先保留
- `CommentSystem.jsx`：留言功能是活的（使用者看得到、用得到），只是資料庫用 localStorage，非死碼

（此階段對應 git commit **`79aaa3b 更新檔案`**）

之後應要求把整理好的分析發布成 Artifact，網址：`https://claude.ai/code/artifact/9ea55d26-838e-4485-9a1c-08ac970f2fac`

---

## 第六階段：行程管理逐檔案技術文件

**問**：「我要怎麼了解這個行程管理功能的每個功能」→ 選擇「逐檔案程式碼解說」

**做法**：派 3 個平行 Explore 子代理，分別涵蓋：
1. `addtotrip/*` 元件 + 主頁面 + ToggleBar（約 20 檔）
2. `location/*` 景點/留言/導航元件（約 13 檔）
3. `map/*` 地圖元件 + hooks + `tripApi.js` API 層（約 16 檔）

**產出**：整合成一份完整技術參考文件，存於 `.scratch/trip-management-reference.md`，並發布為 Artifact 供瀏覽。內容涵蓋每個檔案的：用途、匯出、內部 state、關鍵函式、API 呼叫、已知問題（bug/死碼/硬編碼/重複實作）。

**彙整出的問題分類**：
- 🔴 死碼/孤兒元件：`mytripslist.jsx`、`favoriteslist.jsx`、`travelApp.jsx` 死路徑、`travelList.jsx`
- 🟠 硬編碼 API 網址：`useWishlist.js`、`MapWithMenu.jsx`、`use-Places.js`
- 🟡 明確 Bug：`tripdetail.jsx` 缺 `X` import、`tripToast.js` 圖示錯誤、`placegrid.jsx` CSS 錯誤、`travelSetting.jsx` 封面上傳未完整串接
- 🟢 重複實作：`PlacesList.js` vs `placegrid.jsx`、`Mapsidebarmenu.jsx` vs `SearchFilterNavbar.jsx`、`use-filter.jsx`/`use-pagination.jsx` vs `use-Places.js`、收藏 N+1 查詢重複 4 次
- ⚪ 未實作功能：拖曳排序 API 無呼叫端、`ToggleBar.handleRemovePlace` 空殼、`/api/locations` 端點未確認

（此階段純產出文件，尚未修改程式碼；後續第七到十三階段就是依序處理上述問題清單）

---

## 第七階段：清理死碼／孤兒元件

**問**：「先幫我把死碼 / 孤兒元件（可安全清理或需決策）清理掉」

**驗證**（用 Grep 重新確認引用狀況）：
- `mytripslist.jsx`（`MyTripsList`）：零引用 → 確認安全刪除
- `favoriteslist.jsx`（`FavoritesList`）：零引用 → 確認安全刪除
- `travelApp.jsx`/`travelList.jsx`：確認 `onNavigateToSettings` 在 `toggleBar.jsx` 裡只有解構參數、從未被呼叫（`grep onNavigateToSettings\( ` 在 `toggleBar.jsx` 中無結果），`currentPage` 永遠是 `null`，但**牽動 3 個檔案的掛載**：`app/site/custom/page.jsx`、`app/site/custom/components/map/MapWithMenu.jsx`、`app/site/product/page.jsx`（這裡 `ToggleBar`/`TravelApp` 早被註解掉，只剩沒用到的 import）

**詢問使用者**：travelApp/travelList 死路徑要「完整清除」還是「只刪明確孤兒檔案」→ 使用者選擇**完整清除**

**動作**：
1. 刪除 `app/site/custom/components/addtotrip/mytripslist.jsx`
2. 刪除 `app/site/custom/components/addtotrip/favoriteslist.jsx`
3. 刪除 `app/site/custom/components/addtotrip/travelApp.jsx`
4. 刪除 `app/site/custom/components/addtotrip/travelList.jsx`
5. 修改 `app/site/custom/page.jsx`：移除 `TravelApp`/`NavigationProvider`/`useNavigation` import、`<TravelApp />`、傳給 `ToggleBar` 的 `onNavigateToSettings` prop；`AppWrapper` 簡化為直接 `export default App`
6. 修改 `app/site/custom/components/map/MapWithMenu.jsx`：同上處理，`FullscreenMap` 也簡化掉不必要的 Provider 包裹
7. 重寫 `app/site/product/page.jsx`：清掉早被註解掉的 `ToggleBar`/`TravelApp` 殘留 import 與 `NavigationProvider` 包裹
8. 修改 `components/toggleBar.jsx`：移除沒人再傳入的 `onNavigateToSettings`、`onNavigateToDetail` 這兩個 props

**驗證**：Grep 全站確認 `travelApp|travelList|TravelApp|ItineraryList|NavigationProvider|useNavigation|AppWrapper` 只剩文件裡的紀錄，程式碼中無殘留引用。

（此階段對應 git commit **`04a9a70 更新檔案2026/7/6`** 的一部分）

---

## 第八階段：修正硬編碼 API 網址

**問**：「幫我修正這個 東西 useWishlist.js、MapWithMenu.jsx、use-Places.js 都寫死 http://localhost:5000，未用 NEXT_PUBLIC_API_URL，建議統一改用 tripApi.js 的環境變數模式」

**動作**：
1. `app/site/custom/hook/useWishlist.js`：`BACKEND_URL = 'http://localhost:5000'` → `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'`
2. `app/site/custom/components/map/MapWithMenu.jsx`：同樣改法
3. `app/site/custom/hook/use-Places.js`：新增 `const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'`，SWR 的 fetch key 從寫死字串 `'http://localhost:5000/api/places'` 改成 `` `${API_URL}/api/places` ``

**確認**：專案當時沒有任何 `.env`/`.env.local`，三處都會 fallback 回 `localhost:5000`，開發環境行為完全不變。

（此階段對應 git commit **`04a9a70 更新檔案2026/7/6`** 的另一部分）

---

## 第九階段：建立 .env.local

**問**：「我的.env放在後端檔案裡」

**說明**：後端 `.env`（`sailo_backend/.env`，確認 `PORT=5000`）跟前端需要的 `.env.local` 是兩回事 —— 前端讀不到後端資料夾裡的檔案，因為是兩個獨立專案。

**使用者提問「會有什麼影響嗎」，說明**：
- 不改變任何行為（新值跟現在 fallback 值一樣）
- 不會被 git 提交（`.gitignore` 第 38 行已有 `.env*`，有用 `git status` 確認過）
- 需要重啟 `npm run dev` 才生效
- `NEXT_PUBLIC_` 開頭的變數會進瀏覽器端 bundle，但這本來就是公開的 API 網址，無風險
- 好處：以後換後端網址只需改一行

**使用者確認「好」後動作**：建立 `c:\Users\linxi\Documents\sailo_fronte_end\.env.local`，內容：
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
用 `git status --porcelain -uall .env.local` 確認完全沒有出現（被 gitignore 擋掉）。

（此檔案不會出現在 git log 裡，屬於本機專屬設定）

---

## 第十階段：修復四個明確 Bug

**問**：使用者貼出前面文件中列出的 4 個 bug，要求逐一修正：

### 1. `tripdetail.jsx` 第 150 行缺少 `X` icon import
- **問題**：`<X className="w-12 h-12 mx-auto mb-2" />` 用了 `X`，但檔案頂部 import 清單沒有 `X`，error 狀態下會 `ReferenceError`
- **修法**：在 `import { ArrowLeft, Heart, Calendar, MapPin, Plus, Trash2, Clock, Star } from 'lucide-react'` 中補上 `X`

### 2. `tripToast.js` 圖示錯誤
- **問題**：不論 `toast.type` 是 `success` 或 `error`，圖示都寫死 `<Check size={18} />`，`XCircle` 雖已 import 但從未使用
- **修法**：改成 `{toast.type === 'error' ? <XCircle size={18} /> : <Check size={18} />}`

### 3. `placegrid.jsx` CSS `translateY()` 缺參數
- **問題**：`.card-animate-existing { transform: translateY(); }` 是無效 CSS，瀏覽器會忽略整條宣告
- **修法**：改成 `transform: translateY(0);`
- **後續追問「這個生效是什麼生效」**：說明無效 CSS 被瀏覽器忽略時，效果等同於 `transform: none`，而 `translateY(0)` 視覺上也是「不位移」——**兩者視覺結果幾乎一樣，這個修正主要是程式碼正確性/避免建置工具警告，不是使用者能感受到的明顯畫面變化**（比前兩個 bug 嚴重程度低很多，屬於誠實更正說明）

### 4. `travelSetting.jsx` 封面圖上傳 UI 未完整串接
- **問題**：`Upload`/`Edit2`/`X` 圖示都已 import 卻完全沒用到，`handleRemovePreview` 函式定義了但沒接 UI，`uploadTripCover` 從未被呼叫
- **調查**：去 `sailo_backend` 確認了實際規則——`tripuploadroutes.js`（`POST /api/trip-upload/cover`）、`tripuploadcontroller.js`（回應格式 `{success, data: {url, fileId, thumbnailUrl, fileName, size, width, height}}`）、`tripupload.js` middleware（限制 jpg/jpeg/png/webp，最大 10MB）
- **修法**：
  - import 改為 `ChevronLeft, Upload, X`（移除沒用到的 `Edit2`），新增 `uploadTripCover` from tripApi
  - 新增 `uploadingImage` state、`fileInputRef`（`useRef`）
  - 新增 `handleFileSelect`：驗證檔案類型（jpg/png/webp）與大小（10MB），呼叫 `uploadTripCover(file)`，成功後 `setImagePreview(response.data.url)`，失敗走既有 `showError()`
  - 封面圖區塊新增：隱藏的 `<input type="file">`、右下角「更換封面」按鈕（觸發選檔＋上傳中 loading 遮罩）、右上角 X 按鈕（有自訂圖時顯示，接上原本沒被呼叫的 `handleRemovePreview`）

（此階段對應 git commit **`bcc72d3`** 的一部分）

---

## 第十一階段：整併四處重複實作

**問**：使用者貼出前面文件列出的 4 個重複實作項目，要求逐一處理。用 TodoWrite 追蹤進度。

### 1. `PlacesList.js` vs `placegrid.jsx`
- **驗證**：Grep 全站確認 `app/site/custom/components/location/PlacesList.js` 零引用（唯一同名的是完全無關的 `services/place-api.js`）
- **動作**：直接**刪除** `PlacesList.js`，`placegrid.jsx` 保留（實際在用的版本）

### 2. `Mapsidebarmenu.jsx` vs `SearchFilterNavbar.jsx`（`categories`/`IconMap` 重複定義）
- **動作**：
  - 新增 `app/site/custom/lib/placeCategories.js`，匯出 `DEFAULT_CATEGORIES`（景點/餐廳/住宿三類）與 `CATEGORY_ICON_MAP`（`Landmark`/`Utensils`/`Hotel`）
  - `Mapsidebarmenu.jsx`：改 import 共用常數，移除本地重複定義的 `categories` 預設值與 `IconMap`
  - `SearchFilterNavbar.jsx`：同樣處理，順便清掉一個原本就沒用到的 `Map` icon import

### 3. `use-filter.jsx` / `use-pagination.jsx` vs `use-Places.js` 內建邏輯
- **調查發現**（讀完 `use-filter.jsx`、`use-pagination.jsx`、`use-Places.js`、`page.jsx` 四份檔案後釐清實際串接關係）：
  - `usePagination` 的分頁切片 `useEffect` 跟 `use-Places.js` 內建的完全重複（兩者都在算同一份 `places`）
  - `useFilters` 裡的 `setCurrentPage(1)` 跟 `page.jsx` 另一個監聽相同依賴陣列（`searchTerm, selectedCity, selectedCategory`）的 `resetPage()` 重複觸發
- **動作**：
  - 簡化 `usePagination`：移除切片 `useEffect`，只保留 `handlePageChange`（邊界檢查 + 捲動），參數簡化為 `{ setCurrentPage, totalPages }`
  - 簡化 `useFilters`：移除 `setCurrentPage` 參數與呼叫，只留 `setFilteredPlaces`
  - `page.jsx`：同步更新兩個 hook 的呼叫方式，並移除變成沒用到的解構變數 `setPlaces`、`itemsPerPage`

### 4. 收藏狀態 N+1 查詢重複 4 處（`card.jsx`、`useFavoriteStatus.js`、`useWishlist.js`、`MapWithMenu.jsx`）
- **動作**：新增 `app/site/custom/lib/favoritesApi.js`，內部 `fetchFavoriteListsWithPlaces` 用 `Promise.all` 平行查詢（原本 2 處是 `for...of` + 依序 `await`，改平行後總等待時間會縮短，但 request 數量不變）。對外提供三個語意化函式：
  - `isPlaceFavorited(userId, placeId)` → 給 `card.jsx`、`useFavoriteStatus.js`
  - `getFavoritedPlaceIds(userId)` → 給 `MapWithMenu.jsx`
  - `getFavoriteListsWithStatus(userId, placeId)` → 給 `useWishlist.js`
- 四個檔案都改成呼叫這個共用模組，並用 Grep 確認全部正確接上

（此階段對應 git commit **`bcc72d3`** 的一部分）

---

## 第十二階段：分頁功能現況確認

**問**：「分頁功能好像沒有實際放在網站上面」

**確認**：`app/site/custom/page.jsx` 第 113 行 `const USE_INFINITE_SCROLL = true` 是寫死的開關，導致分頁模式（`Pagination` 元件、`usePagination.handlePageChange`、`use-Places.js` 的 `places`/`currentPage`/`totalPages`）完全是活著但使用者看不到的程式碼。

**詢問使用者**如何處理（徹底刪除 / 保留備用 / 曝露開關給使用者選）→ 使用者選擇**保留作為備用，不動**。

（此階段無程式碼異動，純確認說明）

---

## 第十三階段：剩餘三項

**問**：使用者貼出最後三項，要求處理：

### 1. `PlaceSearchModal` 的 `/api/locations` 端點確認
- **調查**：去 `sailo_backend` 確認 `src/routes/location.js` 有 `GET /`（取得所有地區，回傳 `{success, data: [{location_id, name}]}`）與 `GET /:id`，並在 `server.js` 第 180 行掛載為 `app.use('/api/locations', locationRoutes)`；同時確認 `/api/places` 的 `keyword`/`category`/`location_id` 查詢參數在 `placesController.js` 都有支援
- **結論**：端點確實存在且格式吻合，原本的疑慮不成立
- **動作**：移除 `placesearchmodal.jsx` 裡 `loadLocations` 函式中不確定的註解「假設你有這個 API，如果沒有可以先註解掉」

### 2. `ToggleBar.handleRemovePlace` 空殼
- **調查**：確認 `TripDetail` 的 props 簽名中沒有 `onRemovePlace`/`onUpdateOrder`，兩者都是傳了但完全沒被接收/使用的死 props
- **決策**：沒有直接刪除，而是**接上**——因為刪掉景點後 ToggleBar 卡片列表的天數/景點數統計不會同步更新
- **動作**：
  - `tripdetail.jsx`：新增 `onRemovePlace` prop，在 `confirmRemovePlace` 成功刪除後呼叫 `onRemovePlace?.(tripItemId)`
  - `toggleBar.jsx`：`handleRemovePlace`（原本就會呼叫 `loadTrips()`）現在真的會被觸發；同時移除另一個真正無法運作的 `onUpdateOrder={() => {}}`（因為當時沒有拖曳 UI，且被下面的新功能取代）

### 3. 拖曳排序功能（全新功能，非 bug 修復）
- **釐清範圍**：使用者一開始誤會為既有功能，經說明後確認是「目前完全不存在、需要新做」的功能
- **決策過程**（AskUserQuestion 兩輪）：先問要做到什麼程度（先不做/簡化版上下移動按鈕/完整拖曳需新套件）→ 使用者反問確認意思 → 再次詢問後選擇**「真正拖曳（需要新套件）」**
- **調查**：確認後端 `PUT /trips/items/:tripItemId/order`（`sailo_backend/src/routes/custom/tripRoutes.js:260`）就是簡單的 `UPDATE trip_item SET sort_order = ? WHERE trip_item_id = ?`
- **動作**：
  1. `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`（新增 4 個套件）
  2. 在 `tripdetail.jsx` 實作：
     - 新增 `SortablePlaceItem` 子元件，用 `useSortable({id: item.trip_item_id})`，左側加拖曳把手（`GripVertical` icon），把手與卡片本體的點擊分開（避免跟「開啟詳情」「刪除」互相干擾）
     - 主元件新增 `sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))`
     - 新增 `handleDragEnd(event, day)`：用 `arrayMove` 計算新順序 → 樂觀更新 `days` state → `Promise.all` 呼叫 `tripApi.updatePlaceOrder(tripItemId, idx+1)` 逐一儲存新的 `sort_order` → 失敗則重新 `getTripDetail` 拉回正確順序
     - 景點列表 JSX 包上 `<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={...}><SortableContext items={...} strategy={verticalListSortingStrategy}>...</SortableContext></DndContext>`，僅支援**同一天內**拖曳排序（跨天不支援，符合資料結構設計）

（此階段對應 git commit **`bcc72d3`**）

---

## 完整檔案異動總表

### 新增檔案
| 檔案 | 說明 |
|---|---|
| `app/site/custom/lib/placeCategories.js` | 共用的景點分類清單與圖示映射 |
| `app/site/custom/lib/favoritesApi.js` | 共用的收藏狀態查詢邏輯（取代 4 處 N+1 重複） |
| `.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:5000`（已 gitignore，不會出現在 git 歷史中）|
| `.scratch/trip-management-reference.md` | 行程管理功能逐檔案技術參考文件 |
| `.scratch/session-export-2026-07-06.md` | 本文件 |

### 刪除檔案
| 檔案 | 原因 |
|---|---|
| `app/site/custom/trip/page.jsx` | 死路由，匯入不存在的檔案，零引用 |
| `app/site/custom/[tid]/page.jsx` | 孤兒路由，參數命名與邏輯不符，零引用 |
| `app/site/custom/components/addtotrip/mytripslist.jsx` | 零引用孤兒元件 |
| `app/site/custom/components/addtotrip/favoriteslist.jsx` | 零引用孤兒元件 |
| `app/site/custom/components/addtotrip/travelApp.jsx` | 死路徑（導航從未觸發），已確認完整清除 |
| `app/site/custom/components/addtotrip/travelList.jsx` | 靜態 Mock，因死路徑使用者永遠看不到 |
| `app/site/custom/components/location/PlacesList.js` | 零引用，與 `placegrid.jsx` 重複 |

### 修改檔案
| 檔案 | 修改摘要 |
|---|---|
| `app/site/custom/page.jsx` | 移除 TravelApp 相關 import/掛載；`useFilters`/`usePagination` 呼叫簡化；移除沒用到的解構變數 |
| `app/site/custom/components/map/MapWithMenu.jsx` | 移除 TravelApp 相關 import/掛載；`BACKEND_URL` 改用環境變數；收藏邏輯改呼叫 `favoritesApi.js` |
| `app/site/product/page.jsx` | 整個重寫，清掉早被註解的 TravelApp/ToggleBar 殘留 import 與 Provider 包裹 |
| `components/toggleBar.jsx` | 移除沒用到的 `onNavigateToSettings`/`onNavigateToDetail` props；移除死的 `onUpdateOrder={() => {}}` |
| `app/site/custom/hook/useWishlist.js` | `BACKEND_URL` 改用環境變數；收藏清單查詢改呼叫 `favoritesApi.js` |
| `app/site/custom/hook/use-Places.js` | 新增 `API_URL` 常數取代寫死網址 |
| `app/site/custom/hook/useFavoriteStatus.js` | 改呼叫 `favoritesApi.js` 的 `isPlaceFavorited` |
| `app/site/custom/hook/use-filter.jsx` | 移除 `setCurrentPage` 參數與重複的頁碼重置邏輯 |
| `app/site/custom/hook/use-pagination.jsx` | 移除重複的分頁切片邏輯，只留 `handlePageChange` |
| `app/site/custom/components/location/card.jsx` | 收藏狀態查詢改呼叫 `favoritesApi.js` 的 `isPlaceFavorited` |
| `app/site/custom/components/location/placegrid.jsx` | 修正 `transform: translateY()` → `translateY(0)` |
| `app/site/custom/components/map/Mapsidebarmenu.jsx` | `categories`/`IconMap` 改 import 共用常數 |
| `app/site/custom/components/map/SearchFilterNavbar.jsx` | 同上，並清掉未使用的 `Map` icon import |
| `app/site/custom/components/ui/tripToast.js` | 依 `toast.type` 切換 `Check`/`XCircle` 圖示 |
| `app/site/custom/components/addtotrip/tripdetail.jsx` | 補 `X` icon import；新增 `onRemovePlace` prop 並呼叫；實作拖曳排序（`SortablePlaceItem`、`DndContext`/`SortableContext`、`handleDragEnd`）|
| `app/site/custom/components/addtotrip/travelSetting.jsx` | 實作封面圖上傳 UI（file input、`handleFileSelect`、上傳中狀態、移除預覽按鈕）|
| `app/site/custom/components/addtotrip/placesearchmodal.jsx` | 移除不確定的 API 存在性註解 |
| `package.json` | 新增 `@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/utilities` 依賴 |

### 對應 Git 提交（使用者手動 commit 並推送到 `origin/lxy1`）
| Commit | 訊息 | 對應階段 |
|---|---|---|
| `79aaa3b` | 更新檔案 | 第五階段：刪除死路由 |
| `04a9a70` | 更新檔案2026/7/6 | 第七、八階段：清理死碼、修正硬編碼網址 |
| `bcc72d3` | 檔案更新 新增行程景點的拖曳排序功能2026/7/6 | 第十、十一、十三階段：bug 修復、整併重複實作、拖曳排序 |

---

## 目前已知、刻意保留不動的項目

這些是討論過但**決定不處理**或**留待未來**的項目，未來接手時應該知道：

1. **分頁模式（Pagination）**：`page.jsx` 第 113 行 `USE_INFINITE_SCROLL = true` 寫死，分頁相關程式碼保留但不可見。要切換只需把這個值改成 `false`。
2. **`CommentSystem.jsx`（景點留言系統）**：純 `localStorage` 實作，沒有後端 API，任何人可冒名新增/刪除留言。屬於「活的但簡陋」的功能，非死碼，未處理。
3. **三套收藏/最愛語意重疊**：「加入行程」、「收藏清單（Wishlist）」、「收藏他人的整個行程」三者共用「愛心」意象但資料模型互不相干，尚未整併，只是有留意到。
4. **`travelSetting.jsx` 封面圖上傳**：已補上傳 UI 並實測程式邏輯正確，但**建議實際在瀏覽器測試一次**上傳流程確認前後端串接無誤（本次對話未做瀏覽器實測）。
5. **拖曳排序功能**：同樣建議實際測試多景點行程的拖曳、儲存、失敗回滾等情境。
6. **`app/admin/` 後台管理頁面**：多數為假資料/`coming-soon`/404 路由，本次對話僅止於調查說明，未做任何修改。

---

*本文件由 Claude Code 於對話當下彙整產生，涵蓋範圍為本次會話（session）從第一句話到匯出當下的全部內容。*
