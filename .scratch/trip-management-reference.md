# 行程管理功能 — 逐檔案技術參考文件

> 範圍：`app/site/custom/` 全部檔案 + `components/toggleBar.jsx`
> 目的：記錄目前「行程管理」相關每個檔案的用途、狀態、關鍵函式、API 呼叫，並標註已發現的問題（死碼、硬編碼、重複實作等）。

---

## 目錄

1. [整體資料流](#整體資料流)
2. [主要頁面](#主要頁面)
3. [加入行程 / 收藏清單元件](#加入行程--收藏清單元件)
4. [行程管理核心：ToggleBar](#行程管理核心toggleBar)
5. [景點詳情 / 留言 / 導航元件](#景點詳情--留言--導航元件)
6. [地圖整合元件](#地圖整合元件)
7. [Hooks](#hooks)
8. [API 層：tripApi.js](#api-層tripapijs)
9. [工具函式](#工具函式)
10. [已知問題總覽（跨檔案）](#已知問題總覽跨檔案)

---

## 整體資料流

```
使用者瀏覽景點 (page.jsx / mapPage)
        │
        ├─ 點卡片「＋」→ AddToTripDrawer (useAddToTrip) → tripApi.addPlaceToDay
        ├─ 點卡片「♥」→ SoloTravelWishlist (useWishlist) → /api/favorites/* (獨立於 tripApi)
        │
        └─ 開啟 ToggleBar（行程管理主面板）
                ├─ 列表模式：ScheduleCard 網格（我的行程 / 收藏行程）
                ├─ 新增/編輯 → travelSetting.jsx (ItinerarySettings) → tripApi.createTrip / updateTrip
                └─ 查看詳情 → tripdetail.jsx (TripDetail) → tripApi.getTripDetail / removePlaceFromTrip
                        └─ 新增景點 → placesearchmodal.jsx → toggleBar.handlePlaceSelect → tripApi.addPlaceToDay
```

**重要結論**：真正跑得通的主線是 `page.jsx → ToggleBar → travelSetting.jsx / tripdetail.jsx`，全部透過 `tripApi.js` 呼叫後端。`travelApp.jsx + travelList.jsx` 這條「導航到設定/列表頁」的路徑因為 prop 從未被呼叫而形同死碼（見下方問題清單）。

---

## 主要頁面

### `app/site/custom/page.jsx`
- 景點列表主頁面（`/site/custom`），是整個「加入行程」功能的入口容器。
- 匯出 `AppWrapper`（包 `NavigationProvider` 再渲染 `App`）。
- state：`isToggleBarOpen`、`targetTripId`；資料交給 `usePlaces`/`useFilters`/`usePagination`。
- 監聽 `sessionStorage.getItem('openTripId')`，若存在會自動開啟 ToggleBar 並跳到指定行程（用完即清除）。
- ⚠️ `userId={user?.id || 1}` 未登入時硬編碼 fallback 成 `1`；`USE_INFINITE_SCROLL` 寫死 `true`，分頁模式程式碼保留但不會執行。

### `app/site/custom/map-route/page.jsx`
- 獨立路線導航頁，用 URL query（`lat`/`lng`/`name`）顯示前往目的地的路線。
- 動態載入（`ssr:false`）`MapWithRoute`。
- 與行程（trip）資料無關聯，是獨立的地圖導航工具頁。

### `app/site/custom/mapPage/page.jsx`
- 全螢幕地圖頁，用原生 `fetch` 打 `/api/places`（**未使用 tripApi**）後傳給 `FullscreenMap`（即 `MapWithMenu`）。
- ⚠️ Loading 畫面整段被註解掉，`isLoading` 狀態存在但沒有對應 UI，屬死碼殘留。

---

## 加入行程 / 收藏清單元件

### `addtotripdrawer.jsx` — `AddToTripDrawer`
- 「加入行程」側邊彈窗，從景點卡片點擊觸發。
- 核心邏輯全部委派給 `useAddToTrip` hook；用 `createPortal` 掛到 `document.body` 並鎖定背景捲動。
- API（經 hook）：`getUserTrips` → `getTripDetail`（取天數）→ `addPlaceToDay`。

### `SelectListModal.jsx` / `CreateListModal.jsx`
- 純展示彈窗，分別負責「勾選收藏清單」與「新增收藏清單」，邏輯都在父層 `SoloTravelWishlist` 處理。
- ⚠️ `CreateListModal.jsx` 第 21 行 class 字串有多餘空格 `"p  -4"`（無害拼字瑕疵）。

### `mytripslist.jsx`（`MyTripsList`）/ `favoriteslist.jsx`（`FavoritesList`）
- 「我的行程」「收藏的行程」卡片網格元件。
- ❌ **全專案搜尋後沒有任何檔案 import 這兩個元件** — 已被 `ToggleBar` 自己的 `ScheduleCard` 取代，是**孤兒死碼**。

### `travelApp.jsx`（`TravelApp` + `NavigationProvider`）
- 依 `currentPage`（`null`/`'settings'`/`'list'`）切換顯示 `ItinerarySettings` 或 `ItineraryList`。
- ❌ **死碼路徑確認**：`page.jsx`／`MapWithMenu.jsx` 會把 `navigateToSettings` 當 `onNavigateToSettings` 傳給 `ToggleBar`，但 `toggleBar.jsx` 從未呼叫這個 prop。全專案也搜不到任何地方真正呼叫 `navigateToSettings()`。因此 `currentPage` 永遠是 `null`，這個 `fixed inset-0 z-[60]` 覆蓋層**永遠不會顯示**。

### `travelList.jsx`（`ItineraryList`）
- 行程列表側邊欄 UI，含「總覽/第1~9天」分頁。
- ❌ **整檔為 Mock**：`days` 陣列寫死固定 9 天、日期「10/24 週五」是硬編碼字串、空狀態按鈕沒有 `onClick`。沒有任何 props 傳入真實 trip 資料，也沒有串接 `tripApi`。配合上面 `travelApp.jsx` 的死碼路徑，使用者實際上**看不到**這個畫面。

### `travelSetting.jsx`（`ItinerarySettings`）✅ 真正在用
- 建立／編輯行程的表單，是「新增行程」「編輯行程」共用畫面。
- **這個元件被 `toggleBar.jsx` 直接 import 使用**（`currentView === 'settings'` 時渲染），是真正可觸發、串好 API 的版本（另一個經 `travelApp.jsx` 掛載的實例因死碼路徑不會被觸發）。
- API：`createTrip(tripData)` / `updateTrip(tripId, tripData)`。
- 邏輯：`calculateDays()` 算天數、`handleSubmit()` 驗證必填/日期後送出、`handleCancel()` 表單有內容時二次確認。
- ⚠️ 封面圖上傳只有 `imagePreview` 狀態，但畫面上找不到實際的 `<input type="file">` 或呼叫 `uploadTripCover()` 的程式碼 — 圖片上傳 UI **疑似未完整串接**。

### `tripdetail.jsx`（`TripDetail`）✅ 真正在用
- 行程詳細頁：列出各天景點、移除景點、切換收藏、跳轉新增景點。
- API：`getTripDetail(tripId)`、`removePlaceFromTrip(tripItemId)`。
- ⚠️ **Bug**：第 150 行用了 `<X className=... />` 圖示但檔案頂部**沒有 import `X`**，只 import 了 `ArrowLeft, Heart, Calendar, MapPin, Plus, Trash2, Clock, Star` — 只有進入 error 狀態時才會觸發 `ReferenceError`，平常不容易發現。
- ⚠️ `tripApi.updatePlaceOrder`（拖曳排序 API）後端已提供，但全站找不到任何呼叫它的程式碼，前端排序功能未實作。

### `PlaceInfoCard.jsx` / `placesearchmodal.jsx`
- `PlaceInfoCard`：純展示小卡片（景點縮圖+名稱+類別），用於 Drawer 頂部。
- `PlaceSearchModal`：新增景點搜尋彈窗，直接用原生 `fetch`（非 tripApi）打 `/api/locations`、`/api/places?keyword=...`。
- ⚠️ 類別篩選下拉選單寫死「景點/餐廳/住宿」三選項；程式碼註解「假設你有這個 API，如果沒有可以先註解掉」，顯示 `/api/locations` 端點可能未完全確認存在。

### `SoloTravelWishlist.jsx` + `ListItem.jsx` / `ModalHeader.jsx` / `Toast.jsx` / `ErrorState.jsx` / `emptystate.jsx`
- `SoloTravelWishlist`：收藏清單功能總控，整合 `SelectListModal` + `CreateListModal`，資料來自 `useWishlist` hook。
- ⚠️ `useWishlist.js` 內 `BACKEND_URL` **寫死 `http://localhost:5000`**（見下方跨檔案問題）。
- `ListItem`/`ModalHeader`/`Toast`：共用小元件，無 state、無 API。
- `ErrorState`/`emptystate`：通用錯誤/空狀態畫面。

---

## 行程管理核心：ToggleBar

### `components/toggleBar.jsx`（`ToggleBar`）✅ 整個行程管理 UI 實際運作的地方
掛載於 `page.jsx` 與 `MapWithMenu.jsx`。內含私有子元件 `ScheduleCard`（行程卡片）與 `ActionDropdown`（編輯/收藏/複製選單）。

**關鍵函式與對應 API：**
| 函式 | 動作 | API |
|---|---|---|
| `loadTrips()` | 合併我的行程＋收藏行程 | `getUserTrips` + `getUserFavorites` |
| `handleCopy()` | 複製行程 | `copyTrip` |
| `handleDelete()` | 刪除行程 | `deleteTrip` |
| `handleFavorite()` | 收藏/取消收藏 | `addFavorite` / `removeFavorite` |
| `handleView()` | 切到行程詳情 | — |
| `handleEdit()` / `handleCreateNew()` | 開啟編輯/新增表單 | 重用 `ItinerarySettings` |
| `handlePlaceSelect()` | 新增景點到行程 | `addPlaceToDay` |

**問題點：**
- ⚠️ `userId = 3`（寫死預設值）與 `page.jsx` 的 `user?.id || 1` fallback **不一致**（一個 fallback 到 1、一個到 3），若同時發生會造成資料歸屬混亂。
- ⚠️ `onUpdateOrder={() => {}}` 傳給 `TripDetail` 是空函式 — 拖曳排序完全未實作。
- ⚠️ `onNavigateToDetail`、`onNavigateToSettings` 兩個 props 被接收但完全未使用（呼應上面 `travelApp.jsx` 的死碼鏈）。
- ⚠️ `handleRemovePlace(tripItemId)` 只單純呼叫 `loadTrips()`，**沒有真正呼叫刪除 API**（真正刪除邏輯在 `tripdetail.jsx` 內部自行處理，這個函式形同占位、未被實際呼叫）。
- ⚠️「前往打包行李」按鈕用 `window.location.href = '/site/packing-lists'` 整頁跳轉，與其餘 SPA 內部切換方式不一致。

---

## 景點詳情 / 留言 / 導航元件

### `PlaceDetail.jsx` — 詳情彈窗協調層
- 整合 `usePlaceDetail`、`usePlaceImages`、`useFavoriteStatus` 三個 hook，並管理 5 個子彈窗（Wishlist、AddToTrip、Comments、Confirm、Navigation）的開關狀態。
- 用 `createPortal` 掛到 `document.body`；開啟時鎖 `body` 捲動、監聽 `Escape` 關閉。

### `PlaceDetailModal.jsx` / `PlaceInfo.jsx` / `PlaceActions.jsx` / `ImageGallery.jsx`
- 純展示層，各自負責版面組合、文字資訊、四個操作按鈕、圖片輪播。
- ❌ **`PlaceInfo.jsx`**：`openingHours` 是**寫死陣列**（週一到週日皆 `11:00-17:00`），與實際景點資料無關，所有景點顯示的營業時間完全相同；無 `rating` 時預設顯示 `4.4`（也是硬編碼假值）。
- ⚠️ `ImageGallery.jsx`：找不到圖片時 fallback 到 Unsplash 外部圖床（硬編碼 URL）。

### `PlacesList.js` vs `placegrid.jsx` — 重複實作
- 兩者功能高度重疊（一個用 CSS `columns`、一個手動分欄 `flex`），疑似重構過程中留下的兩套並存實作。
- ⚠️ `placegrid.jsx` CSS 中 `.card-animate-existing { transform: translateY(); }` — **`translateY()` 缺少參數，是無效 CSS**，瀏覽器會忽略（不報錯但不生效）。
- `loadingSpinner.jsx`：共用載入動畫，但 `PlacesList`/`placegrid` 都各自內嵌了同樣的 spinner，**未實際 import 使用**這個共用元件，屬重複程式碼。

### `card.jsx` — 景點卡片
- 含收藏、加入行程按鈕與 3D 滑鼠懸浮效果。
- ⚠️ `fetchFavoriteStatus`：先取得所有收藏清單，再對每個清單逐一查詢景點是否在其中 — **N+1 請求模式**，清單數量多時效能下降（此模式在 `useFavoriteStatus.js`、`useWishlist.js`、`MapWithMenu.jsx` 都重複出現）。

### `CommentSystem.jsx`（`PlaceComments`）— 純前端 Mock
- 評論完全存在 `localStorage['place_comments:{placeId}']`，**沒有任何後端 API**。
- 使用者名稱是手動輸入文字框（非登入身分），任何人都能冒名新增/刪除任一則留言，資料不跨裝置同步。
- UI 底部誠實標註「評論資料儲存在您的瀏覽器本地」。

### `NavigationModal.jsx`
- 選擇 Google Maps 或站內 Leaflet 路線的小型彈窗，實際導航邏輯在父層 `PlaceDetail.jsx`。

### `TripSelectionForm.jsx` / `tripToast.js`
- `TripSelectionForm`：加入行程流程中選行程/日期/備註的純受控表單。
- `tripToast.js`（匯出 `Toast`）：⚠️ **Bug** — 不論 `toast.type` 是 `success` 還是 `error`，圖示都寫死用 `<Check />`（勾勾），`XCircle` 雖已 import 但從未使用，錯誤提示視覺上仍顯示打勾，容易誤導使用者。

---

## 地圖整合元件

### `MapWithRoute.jsx` — 單點導航
- 用瀏覽器 Geolocation + Leaflet + `leaflet-routing-machine`（底層 OSRM）畫「使用者位置 → 單一景點」路線，附帶模擬車輛移動動畫。
- **不是**多站點行程路線優化，只是使用者到單一景點的導航展示。
- ⚠️ 持續定位邏輯（`watchPosition`）整段被註解掉；預設中心點寫死台南新營座標。

### `MapWithMenu.jsx`（`FullscreenMap`）— 地圖主頁面
- 整合側邊欄、搜尋篩選、收藏、詳情彈窗的核心容器，掛載 `TravelApp`（即上述死碼路徑的來源之一）。
- ⚠️ `BACKEND_URL` 寫死 `'http://localhost:5000'`；Leaflet 透過動態插入 `<script>`/`<link>` 從 unpkg CDN 載入，而非 npm 套件匯入。

### `Mapsidebarmenu.jsx` / `SearchFilterNavbar.jsx`
- 兩者都各自定義了幾乎相同的 `categories` 預設值與 `IconMap`，屬可抽出共用的重複程式碼。
- `Mapsidebarmenu.jsx`：桌面版「取得目前位置」會強制 `router.push('/site/custom/mapPage')`，與側邊欄在其他頁面共用時可能造成非預期跳轉。

### `LeafletAdvancedFeatures.jsx` — 教學/展示型元件
- 繪圖工具、測量工具、標記群集、位置追蹤四個分頁，**全部是模擬/假資料**（隨機座標、隨機移動），與正式業務邏輯無關聯。
- ⚠️ 大量使用 `window.currentMap`、`window.L` 全域變數，屬不良實踐，多次掛載/卸載有互相覆蓋風險。看起來是未整合進正式功能的原型碼。

### `pagination.jsx`
- 通用分頁元件，功能單純無明顯問題，搭配 `hook/use-pagination.jsx` 使用。

---

## Hooks

| Hook | 用途 | API / 備註 |
|---|---|---|
| `use-Places.js` | 核心景點資料管理（SWR + 分頁/無限捲動） | `GET /api/places`；⚠️ 網址寫死 `localhost:5000`，殘留多處 `console.log` |
| `use-filter.jsx` | 篩選條件 state 管理 | 純本地邏輯，委派 `filterutils.jsx`；⚠️ 與 `use-Places.js` 內建篩選邏輯有重疊，且並未被其實際使用 |
| `use-pagination.jsx` | 分頁邏輯 | ⚠️ 與 `use-Places.js` 內部分頁 `useEffect` 幾乎完全重複，疑為重構遺留的冗餘 hook |
| `useAddToTrip.js` | 加入行程彈窗業務邏輯 | `getUserTrips` → `getTripDetail` → `addPlaceToDay`；⚠️ `start_time`/`end_time` 固定寫死 `null`，尚未支援時間排程 |
| `useFavoriteStatus.js` | 查詢單一景點是否已收藏 | N+1 請求（見上）；與 `useWishlist.js`、`MapWithMenu.jsx` 邏輯重複三處 |
| `usePlaceDetail.js` | 載入單一景點詳情 | `GET /api/places/with-location/:placeId`，邏輯單純無問題 |
| `usePlaceImages.js` | 景點封面圖/相簿管理 | `GET/POST/DELETE /api/places/:id/gallery`，功能完整 |
| `useWishlist.js` | 收藏清單彈窗邏輯 | ⚠️ `BACKEND_URL` 寫死 `http://localhost:5000`（與 `tripApi.js` 統一用環境變數的模式不一致，正式環境會連不上後端） |

---

## API 層：tripApi.js

`app/site/custom/lib/custom/tripApi.js` 是行程管理**唯一的集中式 API 客戶端**，也是全案例中**唯一正確使用 `NEXT_PUBLIC_API_URL` 環境變數**（而非寫死 localhost）的檔案，建議以此檔案的模式作為統一標準。

**Base URL：**
- `BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'`
- 行程：`${BACKEND_URL}/api/trip-management`
- 收藏：`${BACKEND_URL}/api/trip-favorites`
- 上傳：`${BACKEND_URL}/api/trip-upload`

**行程管理 API：**
| 函式 | HTTP / 端點 |
|---|---|
| `createTrip(tripData)` | `POST /trips` |
| `getUserTrips(userId, sortBy)` | `GET /trips/user/:userId?sort=` |
| `getTripDetail(tripId)` | `GET /trips/:tripId` |
| `updateTrip(tripId, data)` | `PUT /trips/:tripId` |
| `deleteTrip(tripId)` | `DELETE /trips/:tripId` |
| `copyTrip(tripId, userId)` | `POST /trips/:tripId/copy` |
| `searchTrips(keyword, locationId, isPublic)` | `GET /trips/search?...` |
| `getPublicTrips(locationId, sortBy)` | `GET /trips/public?...` |

**景點管理 API：**
| 函式 | HTTP / 端點 |
|---|---|
| `addPlaceToDay(tripDayId, placeData)` | `POST /trips/days/:tripDayId/items` |
| `removePlaceFromTrip(tripItemId)` | `DELETE /trips/items/:tripItemId` |
| `updatePlaceOrder(tripItemId, sortOrder)` | `PUT /trips/items/:tripItemId/order`（⚠️ 已定義但前端無任何呼叫端） |

**收藏 API：** `addFavorite` / `removeFavorite` / `getUserFavorites`
**圖片上傳 API：** `uploadTripCover(file)` / `deleteImage(fileId)`

**已知問題：**
- `removeFavorite` 函式內留有大段**已註解、未使用的替代實作**（方案 2/3），是明顯的開發痕跡未清理。
- `addFavorite`/`removeFavorite` 有大量 `console.log` 除錯輸出，生產環境應清除。
- `handleResponse` 對「已收藏」訊息用字串 `.includes('已收藏')` 判斷是否為非錯誤 — 屬於前端對後端錯誤訊息文字的脆弱依賴，後端文字一改就會失效。

---

## 工具函式

- **`filterutils.jsx`**（`filterPlaces`）：純函式，依關鍵字/城市/分類 AND 疊加篩選，邏輯單純無問題。
- **`imageutils.jsx`**（`processPlaceImage`）：正規化圖片路徑，只補 `/uploads/` 前綴、**不會**加上後端網域。與 `Mapsidebarmenu.jsx`/`usePlaceImages.js` 各自的 `getImageUrl`（會組完整網域）行為不一致，使用時需注意呼叫端是否要再自行拼網域。

---

## 已知問題總覽（跨檔案）

### 🔴 死碼 / 孤兒元件（可安全清理或需決策）
1. `mytripslist.jsx`（`MyTripsList`）— 全站無引用
2. `favoriteslist.jsx`（`FavoritesList`）— 全站無引用
3. `travelApp.jsx` 的導航路徑 — `onNavigateToSettings` 從未被呼叫，`currentPage` 永遠是 `null`
4. `travelList.jsx`（`ItineraryList`）— 純靜態 Mock（寫死 9 天），因上述死碼路徑，使用者永遠看不到
5. `CommentSystem.jsx` — 純 localStorage，非死碼但非「已完成」功能

### 🟠 硬編碼 API 網址（正式環境會連不上後端）
- `useWishlist.js`、`MapWithMenu.jsx`、`use-Places.js` 都寫死 `http://localhost:5000`，未用 `NEXT_PUBLIC_API_URL`
- 建議統一改用 `tripApi.js` 的環境變數模式

### 🟡 明確 Bug
- `tripdetail.jsx` 第 150 行：使用未 import 的 `X` 圖示，error 狀態下會 `ReferenceError`
- `tripToast.js`：error 類型仍顯示打勾 `<Check />` 圖示（`XCircle` import 未使用）
- `placegrid.jsx`：CSS `translateY()` 缺參數，動畫無效
- `travelSetting.jsx`：封面圖上傳 UI 疑似未完整串接（無 `<input type="file">`，`uploadTripCover` 未被呼叫）

### 🟢 重複實作 / 待整併
- `PlacesList.js` vs `placegrid.jsx`（景點格狀排版兩套並存）
- `Mapsidebarmenu.jsx` vs `SearchFilterNavbar.jsx`（`categories`/`IconMap` 重複定義）
- `use-filter.jsx` / `use-pagination.jsx` vs `use-Places.js` 內建邏輯（分頁/篩選重複）
- 「收藏是否已加入清單」的 N+1 查詢邏輯在 `card.jsx`、`useFavoriteStatus.js`、`useWishlist.js`、`MapWithMenu.jsx` 出現四次

### ⚪ 未實作 / 待補功能
- 拖曳排序：`tripApi.updatePlaceOrder` 後端已提供，前端完全沒有呼叫端
- `ToggleBar.handleRemovePlace` 只是空殼（真正刪除邏輯在 `TripDetail` 內部）
- `PlaceSearchModal` 的 `/api/locations` 端點可能未確認存在（程式碼註解「假設你有這個 API」）
