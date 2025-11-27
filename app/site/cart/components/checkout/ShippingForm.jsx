/**
 * ShippingForm - 收件資訊表單
 * 路徑: app/site/shop/components/checkout/ShippingForm.jsx
 */

'use client'

export default function ShippingForm({
  shippingInfo,
  setShippingInfo,
  errors,
}) {
  const handleChange = (field, value) => {
    setShippingInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 台灣城市列表
  const cities = [
    '台北市',
    '新北市',
    '桃園市',
    '台中市',
    '台南市',
    '高雄市',
    '基隆市',
    '新竹市',
    '嘉義市',
    '新竹縣',
    '苗栗縣',
    '彰化縣',
    '南投縣',
    '雲林縣',
    '嘉義縣',
    '屏東縣',
    '宜蘭縣',
    '花蓮縣',
    '台東縣',
    '澎湖縣',
    '金門縣',
    '連江縣',
  ]

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-medium text-gray-800">收件資訊</h2>

      <div className="space-y-4">
        {/* 收件人姓名 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            收件人姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={shippingInfo.recipientName}
            onChange={(e) => handleChange('recipientName', e.target.value)}
            className={`w-full rounded-lg border ${
              errors.recipientName ? 'border-red-500' : 'border-[#d4d1cc]'
            } px-4 py-3 transition-colors focus:border-primary-500 focus:outline-none`}
            placeholder="請輸入收件人姓名"
          />
          {errors.recipientName && (
            <p className="mt-1 text-sm text-red-500">{errors.recipientName}</p>
          )}
        </div>

        {/* 聯絡電話 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            聯絡電話 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={shippingInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full rounded-lg border ${
              errors.phone ? 'border-red-500' : 'border-[#d4d1cc]'
            } px-4 py-3 transition-colors focus:border-primary-500 focus:outline-none`}
            placeholder="0912345678"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* 電子郵件 (選填) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            電子郵件 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={shippingInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-[#d4d1cc]'
            } px-4 py-3 transition-colors focus:border-primary-500 focus:outline-none`}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* 郵遞區號 + 城市 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              郵遞區號
            </label>
            <input
              type="text"
              value={shippingInfo.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              className="w-full rounded-lg border border-[#d4d1cc] px-4 py-3 transition-colors focus:border-primary-500 focus:outline-none"
              placeholder="100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              城市 <span className="text-red-500">*</span>
            </label>
            <select
              value={shippingInfo.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={`w-full rounded-lg border ${
                errors.city ? 'border-red-500' : 'border-[#d4d1cc]'
              } px-4 py-3 transition-colors focus:border-primary-500 focus:outline-none`}
            >
              <option value="">請選擇城市</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>
        </div>

        {/* 區域 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            區域 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={shippingInfo.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className={`w-full rounded-lg border ${
              errors.district ? 'border-red-500' : 'border-[#d4d1cc]'
            } px-4 py-3 transition-colors focus:border-primary-500 focus:outline-none`}
            placeholder="中正區"
          />
          {errors.district && (
            <p className="mt-1 text-sm text-red-500">{errors.district}</p>
          )}
        </div>

        {/* 詳細地址 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            詳細地址 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={shippingInfo.detailAddress}
            onChange={(e) => handleChange('detailAddress', e.target.value)}
            className={`w-full rounded-lg border ${
              errors.detailAddress ? 'border-red-500' : 'border-[#d4d1cc]'
            } px-4 py-3 transition-colors focus:border-primary-500 focus:outline-none`}
            placeholder="重慶南路一段122號"
          />
          {errors.detailAddress && (
            <p className="mt-1 text-sm text-red-500">{errors.detailAddress}</p>
          )}
        </div>
      </div>
    </div>
  )
}
