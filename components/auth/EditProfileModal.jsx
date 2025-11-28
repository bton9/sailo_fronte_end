/**
 * EditProfileModal - 編輯個人資料彈窗元件
 * 路徑: sailo/components/auth/EditProfileModal.jsx
 *
 * 功能：
 * 1. 半透明背景遮罩 (與 LoginModal 相同風格)
 * 2. 置中白色卡片彈窗
 * 3. 暱稱編輯功能
 * 4. 修改個人資料功能
 * 5. 關閉按鈕與動畫效果
 * 6. 點擊外部關閉
 *
 * 使用方式：
 * <EditProfileModal
 *   isOpen={showModal}
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 * />
 *
 * 設計特點：
 * - 與 LoginModal 使用相同的視覺風格
 * - 背景透明度 30%，輕微模糊效果
 * - 卡片使用白色背景，確保內容清晰易讀
 * - 平滑的開啟/關閉動畫效果
 */

'use client'

import { useState, useEffect } from 'react'
import { User, FileEdit, Camera, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { getFullAvatarUrl, getAvatarUrl } from '@/utils/avatar' // 頭像 URL 工具函數
import { useAuth } from '@/contexts/AuthContext'
import { userAPI, twoFactorAPI } from '@/services/api'
import AvatarUploadModal from './AvatarUploadModal'

export default function EditProfileModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'menu',
}) {
  // ============ 狀態管理 ============
  const [isAnimating, setIsAnimating] = useState(false) // 動畫狀態
  const [mode, setMode] = useState(initialMode) // 'menu' | 'nickname' | 'profile' | 'password' | '2fa'
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false) // 頭像上傳彈窗狀態
  const { user, updateUser } = useAuth() // 取得使用者資料與更新方法

  // 表單資料狀態
  const [nicknameForm, setNicknameForm] = useState({
    nickname: '',
  })

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    birthday: '',
    gender: '',
  })

  // 密碼表單狀態
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // 2FA 狀態
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [twoFactorToken, setTwoFactorToken] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  // 載入與錯誤狀態
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hasInitialized, setHasInitialized] = useState(false) // 追蹤是否已初始化

  // 密碼顯示/隱藏狀態
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 密碼強度狀態 (0: 無, 1: 弱, 2: 中等, 3: 強, 4: 非常強)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // 🆕 監聽 initialMode 變化，自動切換模式
  useEffect(() => {
    if (isOpen && initialMode !== 'menu') {
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  // ============ 初始化表單資料 ============
  /**
   * 當彈窗開啟或使用者資料變更時，載入使用者資料到表單
   */
  useEffect(() => {
    if (isOpen && user) {
      // 載入暱稱
      setNicknameForm({
        nickname: user.nickname || '',
      })

      // 載入個人資料
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        birthday: user.birthday || '',
        gender: user.gender || '',
      })

      // 檢查 2FA 狀態
      check2FAStatus()

      // 只在第一次開啟時清除訊息，避免清除成功訊息
      if (!hasInitialized) {
        setError('')
        setSuccess('')
        setHasInitialized(true)
      }
    }

    // 當 modal 關閉時重置初始化狀態
    if (!isOpen) {
      setHasInitialized(false)
      // 🆕 關閉時重置模式為 menu
      setMode('menu')
    }
  }, [isOpen, user, hasInitialized])

  /**
   * 檢查 2FA 狀態
   */
  const check2FAStatus = async () => {
    try {
      const data = await twoFactorAPI.getStatus()
      if (data.success) {
        setTwoFactorEnabled(data.enabled)
      }
    } catch (error) {
      console.error(' 檢查 2FA 狀態失敗:', error)
    }
  }

  // ============ 動畫處理 ============
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // 防止背景滾動 (彈窗開啟時鎖定頁面捲動)
      document.body.style.overflow = 'hidden'
    } else {
      // 恢復背景滾動 (彈窗關閉時解除鎖定)
      document.body.style.overflow = 'unset'
      // 重置模式為選單
      setMode('menu')
    }

    // 清理函數：確保元件卸載時恢復滾動
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // ============ 事件處理 ============

  /**
   * 處理暱稱輸入變更
   */
  const handleNicknameChange = (e) => {
    setNicknameForm({ nickname: e.target.value })
    setError('') // 只清除錯誤訊息
    // 不清除成功訊息，讓使用者看到完整的成功提示
  }

  /**
   * 處理個人資料輸入變更
   */
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
    setError('') // 只清除錯誤訊息
    // 不清除成功訊息，讓使用者看到完整的成功提示
  }

  /**
   * 計算密碼強度
   * @param {string} password - 要計算強度的密碼
   * @returns {number} 強度等級 (0-4)
   *
   * 計算規則:
   * - 基礎分數 0 分
   * - 長度 >= 8: +1 分
   * - 長度 >= 12: +1 分
   * - 包含小寫字母: +1 分
   * - 包含大寫字母: +1 分
   * - 包含數字: +1 分
   * - 包含特殊符號: +1 分
   *
   * 強度等級:
   * - 0 分: 無 (空白)
   * - 1-2 分: 弱
   * - 3-4 分: 中等
   * - 5 分: 強
   * - 6 分: 非常強
   */
  const calculatePasswordStrength = (password) => {
    if (!password) return 0

    let strength = 0

    // 長度檢查
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++

    // 字元類型檢查
    if (/[a-z]/.test(password)) strength++ // 小寫字母
    if (/[A-Z]/.test(password)) strength++ // 大寫字母
    if (/\d/.test(password)) strength++ // 數字
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++ // 特殊符號

    // 根據總分數返回強度等級 (0-4)
    if (strength === 0) return 0
    if (strength <= 2) return 1 // 弱
    if (strength <= 4) return 2 // 中等
    if (strength === 5) return 3 // 強
    return 4 // 非常強
  }

  /**
   * 取得密碼強度的顏色和文字
   * @param {number} strength - 強度等級 (0-4)
   * @returns {Object} { color, text, bgColor, borderColor }
   */
  const getPasswordStrengthInfo = (strength) => {
    switch (strength) {
      case 0:
        return {
          color: 'text-[#989898]',
          text: '',
          bgColor: 'bg-[#f6f6f6]',
          borderColor: 'border-[#f6f6f6]',
        }
      case 1:
        return {
          color: 'text-[#989898]',
          text: '弱',
          bgColor: 'bg-[#989898]',
          borderColor: 'border-[#989898]',
        }
      case 2:
        return {
          color: 'text-[#3e3e3e]',
          text: '中等',
          bgColor: 'bg-[#3e3e3e]',
          borderColor: 'border-[#3e3e3e]',
        }
      case 3:
        return {
          color: 'text-[#1e1e1e]',
          text: '強',
          bgColor: 'bg-[#1e1e1e]',
          borderColor: 'border-[#1e1e1e]',
        }
      case 4:
        return {
          color: 'text-[#1e1e1e]',
          text: '非常強',
          bgColor: 'bg-[#1e1e1e]',
          borderColor: 'border-[#1e1e1e]',
        }
      default:
        return {
          color: 'text-[#989898]',
          text: '',
          bgColor: 'bg-[#f6f6f6]',
          borderColor: 'border-[#f6f6f6]',
        }
    }
  }
  /**
   * 處理密碼輸入變更
   * 當新密碼變更時，同時計算密碼強度
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
    setError('') // 只清除錯誤訊息

    // 如果是新密碼欄位，計算密碼強度
    if (name === 'newPassword') {
      const strength = calculatePasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  /**
   * 儲存暱稱
   * 向後端 API 發送更新請求
   */
  const handleSaveNickname = async (e) => {
    e.preventDefault()
    setError('') // 清除舊的錯誤訊息
    // 不在這裡清除成功訊息，因為如果成功訊息存在，表示上次操作成功
    setIsLoading(true)

    try {
      // 驗證輸入
      if (!nicknameForm.nickname.trim()) {
        setError('暱稱不能為空')
        setIsLoading(false)
        return
      }

      // 呼叫後端 API 更新暱稱
      const data = await userAPI.updateNickname(nicknameForm.nickname)

      console.log(' API 回應:', data) // 除錯用

      if (data.success) {
        // 更新本地使用者資料
        updateUser({ nickname: nicknameForm.nickname })
        setSuccess('暱稱更新成功！')
        console.log(' 成功訊息已設定:', '暱稱更新成功！') // 除錯用

        // 2秒後返回選單（不清除成功訊息，讓使用者看到）
        setTimeout(() => {
          setSuccess('') // 清除成功訊息
          handleBackToMenu()
          onSuccess && onSuccess()
        }, 2000)
      } else {
        setError(data.message || '更新失敗，請稍後再試')
      }
    } catch (error) {
      console.error(' 更新暱稱失敗:', error)
      setError('網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 儲存個人資料
   * 向後端 API 發送更新請求
   */
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setError('') // 清除舊的錯誤訊息
    // 不在這裡清除成功訊息，因為如果成功訊息存在，表示上次操作成功
    setIsLoading(true)

    try {
      // 驗證輸入
      if (!profileForm.name.trim()) {
        setError('姓名不能為空')
        setIsLoading(false)
        return
      }

      // 驗證生日格式 (如果有填寫)
      if (profileForm.birthday) {
        const birthDate = new Date(profileForm.birthday)
        const today = new Date()
        if (birthDate > today) {
          setError('生日不能是未來日期')
          setIsLoading(false)
          return
        }
      }

      // 呼叫後端 API 更新個人資料
      const data = await userAPI.updateProfile(profileForm)

      console.log(' API 回應:', data) // 除錯用

      if (data.success) {
        // 更新本地使用者資料
        updateUser(profileForm)
        setSuccess('個人資料更新成功！')
        console.log(' 成功訊息已設定:', '個人資料更新成功！') // 除錯用

        // 2秒後返回選單（不清除成功訊息，讓使用者看到）
        setTimeout(() => {
          setSuccess('') // 清除成功訊息
          handleBackToMenu()
          onSuccess && onSuccess()
        }, 2000)
      } else {
        setError(data.message || '更新失敗，請稍後再試')
      }
    } catch (error) {
      console.error(' 更新個人資料失敗:', error)
      setError('網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 儲存密碼
   * 向後端 API 發送密碼更新請求
   */
  const handleSavePassword = async (e) => {
    e.preventDefault()
    setError('') // 清除舊的錯誤訊息
    setIsLoading(true)

    try {
      // 驗證輸入
      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setError('請填寫所有欄位')
        setIsLoading(false)
        return
      }

      // 檢查新密碼與確認密碼是否一致
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('新密碼與確認密碼不一致')
        setIsLoading(false)
        return
      }

      // 檢查新密碼長度
      if (passwordForm.newPassword.length < 8) {
        setError('新密碼至少需要 8 個字元')
        setIsLoading(false)
        return
      }

      // 檢查新密碼複雜度
      const hasLetter = /[a-zA-Z]/.test(passwordForm.newPassword)
      const hasNumber = /\d/.test(passwordForm.newPassword)

      if (!hasLetter || !hasNumber) {
        setError('密碼必須包含至少一個字母和一個數字')
        setIsLoading(false)
        return
      }

      // 呼叫後端 API 更新密碼
      const data = await userAPI.updatePassword(passwordForm)

      console.log(' API 回應:', data) // 除錯用

      if (data.success) {
        setSuccess('密碼更新成功！')
        console.log(' 成功訊息已設定:', '密碼更新成功！') // 除錯用

        // 清空密碼表單
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })

        // 2秒後返回選單
        setTimeout(() => {
          setSuccess('') // 清除成功訊息
          handleBackToMenu()
          onSuccess && onSuccess()
        }, 2000)
      } else {
        setError(data.message || '更新失敗，請稍後再試')
      }
    } catch (error) {
      console.error(' 更新密碼失敗:', error)
      setError(error.message || '網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 處理關閉彈窗
   * 執行關閉動畫後調用關閉回調
   */
  const handleClose = () => {
    // 開始關閉動畫
    setIsAnimating(false)
    // 等待動畫結束後執行關閉回調
    setTimeout(() => {
      onClose && onClose()
    }, 300) // 300ms 配合 CSS transition 時間
  }

  /**
   * 處理背景點擊事件
   * 只有點擊背景遮罩本身 (非卡片內容) 才關閉彈窗
   */
  const handleBackdropClick = (e) => {
    // e.target === e.currentTarget 表示點擊的是遮罩本身，而非子元素
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  /**
   * 處理返回選單
   * 從子頁面返回主選單
   */
  const handleBackToMenu = () => {
    setMode('menu')
    // 清空 2FA 相關狀態
    setQrCode('')
    setSecret('')
    setBackupCodes([])
    setTwoFactorToken('')
    setDisablePassword('')
  }

  // ============ 2FA 相關處理函數 ============

  /**
   * 啟用 Google Authenticator
   */
  const handleEnable2FA = async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await twoFactorAPI.enable()

      if (data.success) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setBackupCodes(data.backupCodes)
        setMode('2fa')
      } else {
        setError(data.message || '啟用失敗')
      }
    } catch (error) {
      console.error(' 啟用 2FA 失敗:', error)
      setError(error.message || '網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 驗證並確認啟用 2FA
   */
  const handleVerify2FA = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!twoFactorToken || twoFactorToken.length !== 6) {
        setError('請輸入 6 位數驗證碼')
        setIsLoading(false)
        return
      }

      const data = await twoFactorAPI.verify(twoFactorToken)

      if (data.success) {
        setSuccess('Google Authenticator 已成功啟用！')
        setTwoFactorEnabled(true)

        // 2秒後返回選單
        setTimeout(() => {
          setSuccess('')
          handleBackToMenu()
        }, 2000)
      } else {
        setError(data.message || '驗證失敗')
      }
    } catch (error) {
      console.error(' 驗證 2FA 失敗:', error)
      setError(error.message || '網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 停用 Google Authenticator
   */
  const handleDisable2FA = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!disablePassword) {
        setError('請輸入密碼以確認身分')
        setIsLoading(false)
        return
      }

      const data = await twoFactorAPI.disable(disablePassword)

      if (data.success) {
        setSuccess('Google Authenticator 已停用')
        setTwoFactorEnabled(false)
        setDisablePassword('')

        // 2秒後返回選單
        setTimeout(() => {
          setSuccess('')
          handleBackToMenu()
        }, 2000)
      } else {
        setError(data.message || '停用失敗')
      }
    } catch (error) {
      console.error(' 停用 2FA 失敗:', error)
      setError(error.message || '網路錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // ============ 如果未開啟，不渲染任何內容 ============
  if (!isOpen) return null

  // ============ 渲染 UI ============
  return (
    <>
      {/* 🎉 成功訊息 Toast - 固定在畫面最上層 */}
      {success && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pt-6 px-4 pointer-events-none">
          <div className="animate-[slideDown_0.3s_ease-out] pointer-events-auto">
            <div className="bg-white text-secondary-600 px-6 py-4 shadow-sm flex items-center gap-3 min-w-[320px] transform hover:scale-105 transition-transform">
              <svg
                className="w-6 h-6 flex-shrink-0 animate-[checkmark_0.3s_ease-in-out]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-semibold text-lg">{success}</span>
            </div>
          </div>
        </div>
      )}

      {/* 🔴 錯誤訊息 Toast - 固定在畫面最上層 */}
      {error && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pt-6 px-4 pointer-events-none">
          <div className="animate-[slideDown_0.3s_ease-out] pointer-events-auto">
            <div className="bg-[#e6684a] text-white px-6 py-4 shadow-2xl flex items-center gap-3 min-w-[320px] transform hover:scale-105 transition-transform">
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="font-semibold text-lg">{error}</span>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      >
        {/* 
          半透明背景遮罩
        */}
        <div className="absolute inset-0 bg-[#1e1e1e]/70"></div>

        {/* 
        編輯卡片
      */}
        <div
          className={`relative bg-white shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300 ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* 關閉按鈕 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#989898] hover:text-[#3e3e3e] transition-colors z-10"
            aria-label="關閉"
          >
            {/* X 圖示 */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* 內容區域 - 可滾動 */}
          <div className="p-8 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {/* 主選單模式 */}
            {mode === 'menu' && (
              <>
                {/* 標題 */}
                <h2 className="text-2xl font-medium text-[#1e1e1e] mb-2">
                  個人資料
                </h2>
                <p className="text-[#3e3e3e] mb-6">選擇要編輯的項目</p>

                {/* 頭像顯示區域 */}
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    {/* 
                      頭像圓形容器
                      
                      使用 getAvatarUrl() 函數處理頭像顯示:
                      - 如果使用者已登入且有上傳頭像，顯示自訂頭像
                      - 如果使用者已登入但沒有頭像，顯示 ImageKit 預設頭像
                      - 如果使用者未登入，顯示表情符號
                      
                      預設頭像來源:
                      https://ik.imagekit.io/crjen7iza/avatars/avatarxxx01.png
                    */}
                    <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center">
                      {user && getAvatarUrl(user.avatar, true) ? (
                        <img
                          src={getAvatarUrl(user.avatar, true)}
                          alt="使用者頭像"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // 如果圖片載入失敗，顯示表情符號作為最終後備
                            console.error(' 頭像載入失敗:', e.target.src)
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      {/* 未登入或圖片載入失敗時的後備表情符號 */}
                      <span
                        className="text-white text-4xl"
                        style={{
                          display:
                            user && getAvatarUrl(user.avatar, true)
                              ? 'none'
                              : 'flex',
                        }}
                      >
                        😊
                      </span>
                    </div>

                    {/* 相機按鈕 - 右下角 */}
                    <button
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="absolute rounded-full bottom-0 right-0 w-8 h-8 bg-[#1e1e1e] hover:bg-[#a48c62]  flex items-center justify-center shadow-lg transition-colors group-hover:scale-110 transform"
                      title="上傳頭像"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* 按鈕組 */}
                <div className="space-y-3 pt-5">
                  {/* 編輯暱稱按鈕 - 顯示當前暱稱或未設定 */}
                  <button
                    onClick={() => setMode('nickname')}
                    className="w-full flex items-center gap-4 p-4 border-b-2 border-[#f6f6f6] hover:bg-[#a48c62]/10 transition-all group"
                  >
                    <div className="w-12 h-12 bg-[#cfc3b1]  flex items-center justify-center group-hover:bg-[#f6f6f6]0 transition-colors">
                      <User className="w-6 h-6 text-[#a48c62] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-[#1e1e1e]">
                        {user?.nickname || '未設定'}
                      </h3>
                      <p className="text-sm text-[#989898]">
                        {user?.nickname ? '點擊修改暱稱' : '點擊設定暱稱'}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-[#989898] group-hover:text-[#a48c62] transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* 修改個人資料按鈕 */}
                  <button
                    onClick={() => setMode('profile')}
                    className="w-full flex items-center gap-4 p-4 hover:border-[#a48c62] hover:bg-[#f6f6f6] transition-all group"
                  >
                    <div className="w-12 h-12 bg-[#cfc3b1]  flex items-center justify-center group-hover:bg-[#f6f6f6]0 transition-colors">
                      <FileEdit className="w-6 h-6 text-[#a48c62] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-[#1e1e1e]">
                        修改個人資料
                      </h3>
                      <p className="text-sm text-[#989898]">更新您的基本資訊</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-[#989898] group-hover:text-[#a48c62] transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* 修改密碼按鈕 - 只有本地帳號才顯示 */}
                  {user?.password !== null && !user?.google_id && (
                    <button
                      onClick={() => setMode('password')}
                      className="w-full flex items-center gap-4 p-4 hover:border-[#a48c62] hover:bg-[#f6f6f6] transition-all group"
                    >
                      <div className="w-12 h-12 bg-[#cfc3b1]  flex items-center justify-center group-hover:bg-[#f6f6f6]0 transition-colors">
                        <Lock className="w-6 h-6 text-[#a48c62] group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-[#1e1e1e]">
                          修改密碼
                        </h3>
                        <p className="text-sm text-[#989898]">
                          更新您的登入密碼
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-[#989898] group-hover:text-[#a48c62] transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Google Authenticator (兩步驟驗證) 按鈕 */}
                  <button
                    onClick={() =>
                      twoFactorEnabled ? setMode('2fa') : handleEnable2FA()
                    }
                    className="w-full flex items-center gap-4 p-4 hover:border-[#a48c62] hover:bg-orange-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-orange-100  flex items-center justify-center group-hover:bg-[#cfc3b1] transition-colors">
                      <Shield className="w-6 h-6 text-[#a48c62] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-[#1e1e1e]">
                        兩步驟驗證 (2FA)
                      </h3>
                      <p className="text-sm text-[#989898]">
                        {twoFactorEnabled
                          ? '已啟用 - 點擊管理'
                          : '提升帳戶安全性'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {twoFactorEnabled && (
                        <span className="px-2 py-1 bg-[#cfc3b1] text-[#3e3e3e] text-xs font-semibold ">
                          已啟用
                        </span>
                      )}
                      <svg
                        className="w-5 h-5 text-[#989898] group-hover:text-[#a48c62] transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* 編輯暱稱模式 */}
            {mode === 'nickname' && (
              <div>
                {/* 返回按鈕 */}
                <button
                  onClick={handleBackToMenu}
                  className="flex items-center gap-2 text-[#3e3e3e] hover:text-[#1e1e1e] mb-4 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>返回</span>
                </button>

                {/* 標題 */}
                <h2 className="text-2xl font-bold text-[#1e1e1e] mb-6">
                  編輯暱稱
                </h2>

                {/* 暱稱輸入表單 */}
                <form onSubmit={handleSaveNickname} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                      暱稱
                    </label>
                    <input
                      type="text"
                      value={nicknameForm.nickname}
                      onChange={handleNicknameChange}
                      placeholder="輸入您的暱稱"
                      className="w-full px-4 py-3 border border-[#989898]  focus:ring-1 focus:ring-[#a48c62] focus:border-[#a48c62] transition-all"
                      disabled={isLoading}
                    />
                    <p className="mt-2 text-sm text-[#989898]">
                      暱稱將顯示在您的個人頁面
                    </p>
                  </div>

                  {/* 儲存按鈕 */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-secondary-900 text-white font-semibold  hover:bg-[#8a7451] disabled:bg-[#989898] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        儲存中...
                      </span>
                    ) : (
                      '儲存變更'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* 修改個人資料模式 */}
            {mode === 'profile' && (
              <div>
                {/* 返回按鈕 */}
                <button
                  onClick={handleBackToMenu}
                  className="flex items-center gap-2 text-[#3e3e3e] hover:text-[#1e1e1e] mb-4 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>返回</span>
                </button>

                {/* 標題 */}
                <h2 className="text-2xl font-bold text-[#1e1e1e] mb-6">
                  修改個人資料
                </h2>

                {/* 個人資料表單 */}
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* 真實姓名 */}
                  <div>
                    <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                      真實姓名 <span className="text-[#e6684a]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="輸入您的姓名"
                      className="w-full px-4 py-3 border border-[#989898]  focus:ring-1 focus:ring-[#a48c62] focus:border-[#a48c62] transition-all"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {/* 手機號碼 */}
                  <div>
                    <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                      手機號碼
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="09XX-XXX-XXX"
                      className="w-full px-4 py-3 border border-[#989898]  focus:ring-1 focus:ring-[#a48c62] focus:border-[#a48c62] transition-all"
                      disabled={isLoading}
                    />
                  </div>

                  {/* 生日 */}
                  <div>
                    <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                      生日
                    </label>
                    <input
                      type="date"
                      name="birthday"
                      value={profileForm.birthday}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-[#989898]  focus:ring-1 focus:ring-[#a48c62] focus:border-[#a48c62] transition-all"
                      disabled={isLoading}
                    />
                    <p className="mt-2 text-sm text-[#989898]">
                      選填，用於個人化服務
                    </p>
                  </div>

                  {/* 性別 */}
                  <div>
                    <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                      性別
                    </label>
                    <select
                      name="gender"
                      value={profileForm.gender}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-[#989898]  focus:ring-1 focus:ring-[#a48c62] focus:border-[#a48c62] transition-all"
                      disabled={isLoading}
                    >
                      <option value="">請選擇</option>
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  {/* Email (唯讀) */}
                  <div>
                    <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-[#989898]  bg-[#f6f6f6] text-[#989898] cursor-not-allowed"
                    />
                    <p className="mt-2 text-sm text-[#989898]">
                      Email 無法變更
                    </p>
                  </div>

                  {/* 儲存按鈕 */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-secondary-900 text-white font-semibold  hover:bg-[#8a7451] disabled:bg-[#989898] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        儲存中...
                      </span>
                    ) : (
                      '儲存變更'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* 修改密碼模式 */}
            {mode === 'password' && (
              <div>
                {/* 返回按鈕 */}
                <button
                  onClick={handleBackToMenu}
                  className="flex items-center gap-2 text-[#3e3e3e] hover:text-[#1e1e1e] mb-4 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>返回</span>
                </button>

                {/* 標題 */}
                <h2 className="text-2xl font-bold text-[#1e1e1e] mb-6">
                  修改密碼
                </h2>

                {/* 密碼表單 */}
                <form onSubmit={handleSavePassword} className="space-y-4">
                  {/* 目前密碼 */}
                  <div>
                    <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                      目前密碼 <span className="text-[#e6684a]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="輸入目前密碼"
                        className="w-full px-4 py-3 pr-12 border border-[#989898]  focus:ring-1 focus:ring-[#a48c62] focus:border-[#a48c62] transition-all"
                        disabled={isLoading}
                        required
                      />
                      {/* 顯示/隱藏密碼按鈕 */}
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#989898] hover:text-[#3e3e3e] transition-colors"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 新密碼 */}
                  <div>
                    <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                      新密碼 <span className="text-[#e6684a]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="輸入新密碼 (至少8字元)"
                        className="w-full px-4 py-3 pr-12 border border-[#989898]  focus:ring-1 focus:ring-[#a48c62] focus:border-[#a48c62] transition-all"
                        disabled={isLoading}
                        required
                      />
                      {/* 顯示/隱藏密碼按鈕 */}
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#989898] hover:text-[#3e3e3e] transition-colors"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* 密碼強度驗證條 */}
                    {passwordForm.newPassword && (
                      <div className="mt-3 space-y-2">
                        {/* 強度條容器 */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#3e3e3e] font-medium">
                            密碼強度:
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              getPasswordStrengthInfo(passwordStrength).color
                            }`}
                          >
                            {getPasswordStrengthInfo(passwordStrength).text}
                          </span>
                        </div>
                        {/* 強度條 - 4 個區塊 */}
                        <div className="flex gap-1.5">
                          {/* 第 1 格 - 弱 */}
                          <div
                            className={`h-2 flex-1  transition-all duration-300 ${
                              passwordStrength >= 1
                                ? getPasswordStrengthInfo(passwordStrength)
                                    .bgColor
                                : 'bg-[#f6f6f6]'
                            }`}
                          ></div>

                          {/* 第 2 格 - 中等 */}
                          <div
                            className={`h-2 flex-1  transition-all duration-300 ${
                              passwordStrength >= 2
                                ? getPasswordStrengthInfo(passwordStrength)
                                    .bgColor
                                : 'bg-[#f6f6f6]'
                            }`}
                          ></div>

                          {/* 第 3 格 - 強 */}
                          <div
                            className={`h-2 flex-1  transition-all duration-300 ${
                              passwordStrength >= 3
                                ? getPasswordStrengthInfo(passwordStrength)
                                    .bgColor
                                : 'bg-[#f6f6f6]'
                            }`}
                          ></div>

                          {/* 第 4 格 - 非常強 */}
                          <div
                            className={`h-2 flex-1  transition-all duration-300 ${
                              passwordStrength >= 4
                                ? getPasswordStrengthInfo(passwordStrength)
                                    .bgColor
                                : 'bg-[#f6f6f6]'
                            }`}
                          ></div>
                        </div>
                        {/* 強度提示訊息 */}
                        <div className="text-xs text-[#989898] space-y-1">
                          <p>建議:</p>
                          <ul className="list-disc list-inside space-y-0.5 pl-1">
                            <li
                              className={
                                passwordForm.newPassword.length >= 8
                                  ? 'text-[#a48c62]'
                                  : ''
                              }
                            >
                              至少 8 個字元
                              {passwordForm.newPassword.length >= 8 && ' ✓'}
                            </li>
                            <li
                              className={
                                /[a-z]/.test(passwordForm.newPassword) &&
                                /[A-Z]/.test(passwordForm.newPassword)
                                  ? 'text-[#a48c62]'
                                  : ''
                              }
                            >
                              包含大小寫字母
                              {/[a-z]/.test(passwordForm.newPassword) &&
                                /[A-Z]/.test(passwordForm.newPassword) &&
                                ' ✓'}
                            </li>
                            <li
                              className={
                                /\d/.test(passwordForm.newPassword)
                                  ? 'text-[#a48c62]'
                                  : ''
                              }
                            >
                              包含數字
                              {/\d/.test(passwordForm.newPassword) && ' ✓'}
                            </li>
                            <li
                              className={
                                /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                                  passwordForm.newPassword
                                )
                                  ? 'text-[#a48c62]'
                                  : ''
                              }
                            >
                              包含特殊符號 (選填，提升強度)
                              {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                                passwordForm.newPassword
                              ) && ' ✓'}
                            </li>
                          </ul>
                        </div>{' '}
                      </div>
                    )}
                  </div>

                  {/* 確認新密碼 */}
                  <div>
                    <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                      確認新密碼 <span className="text-[#e6684a]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="再次輸入新密碼"
                        className="w-full px-4 py-3 pr-12 border border-[#989898]  focus:ring-1 focus:ring-[#a48c62] focus:border-[#a48c62] transition-all"
                        disabled={isLoading}
                        required
                      />
                      {/* 顯示/隱藏密碼按鈕 */}
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#989898] hover:text-[#3e3e3e] transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 儲存按鈕 */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-secondary-900 text-white font-semibold  hover:bg-[#8a7451] disabled:bg-[#989898] disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        更新中...
                      </span>
                    ) : (
                      '更新密碼'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Google Authenticator (2FA) 管理模式 */}
            {mode === '2fa' && (
              <div>
                {/* 返回按鈕 */}
                <button
                  onClick={handleBackToMenu}
                  className="flex items-center gap-2 text-[#3e3e3e] hover:text-[#1e1e1e] mb-4 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>返回</span>
                </button>

                {/* 標題 */}
                <h2 className="text-2xl font-bold text-[#1e1e1e] mb-2">
                  兩步驟驗證 (2FA)
                </h2>
                <p className="text-[#3e3e3e] mb-6">
                  使用 Google Authenticator 提升帳戶安全性
                </p>

                {/* 如果尚未啟用,顯示 QR Code */}
                {!twoFactorEnabled && qrCode && (
                  <div className="space-y-4">
                    {/* 步驟說明 */}
                    <div className="bg-[#f6f6f6] border border-blue-200  p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        📱 設定步驟
                      </h3>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>下載 Google Authenticator App</li>
                        <li>掃描下方 QR Code</li>
                        <li>輸入 App 顯示的 6 位數驗證碼</li>
                      </ol>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center p-4 bg-white border-2 border-[#f6f6f6] ">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>

                    {/* 手動輸入密鑰 */}
                    <div className="bg-[#f6f6f6] border border-[#f6f6f6]  p-4">
                      <p className="text-xs text-[#3e3e3e] mb-1">
                        無法掃描? 手動輸入密鑰:
                      </p>
                      <code className="block text-sm font-mono bg-white px-3 py-2  border border-[#989898] break-all">
                        {secret}
                      </code>
                    </div>

                    {/* 備用碼顯示 */}
                    {backupCodes.length > 0 && (
                      <div className="bg-[#f6f6f6] border border-[#cfc3b1]  p-4">
                        <h4 className="font-semibold text-[#1e1e1e] mb-2">
                          🔑 備用碼 (請妥善保存)
                        </h4>
                        <p className="text-xs text-[#3e3e3e] mb-3">
                          當您無法使用 Authenticator 時,可使用備用碼登入
                          (每組僅限使用一次)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {backupCodes.map((code, index) => (
                            <code
                              key={index}
                              className="text-xs font-mono bg-white px-2 py-1  border border-[#cfc3b1]"
                            >
                              {code}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 驗證表單 */}
                    <form onSubmit={handleVerify2FA} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                          驗證碼 <span className="text-[#e6684a]">*</span>
                        </label>
                        <input
                          type="text"
                          value={twoFactorToken}
                          onChange={(e) => {
                            // 只允許輸入數字,最多 6 位
                            const value = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 6)
                            setTwoFactorToken(value)
                            setError('')
                          }}
                          placeholder="輸入 6 位數驗證碼"
                          className="w-full px-4 py-3 border border-[#989898]  focus:ring-1 focus:ring-[#a48c62] focus:border-[#a48c62] transition-all text-center text-2xl font-mono tracking-widest"
                          maxLength={6}
                          disabled={isLoading}
                          required
                        />
                        <p className="mt-2 text-sm text-[#989898] text-center">
                          請輸入 Google Authenticator 顯示的驗證碼
                        </p>
                      </div>

                      {/* 確認啟用按鈕 */}
                      <button
                        type="submit"
                        disabled={isLoading || twoFactorToken.length !== 6}
                        className="w-full py-3 bg-[#a48c62] text-white font-semibold  hover:bg-[#8a7451] disabled:bg-[#989898] disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            驗證中...
                          </span>
                        ) : (
                          '確認啟用'
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* 如果已啟用,顯示停用選項 */}
                {twoFactorEnabled && !qrCode && (
                  <div className="space-y-4">
                    {/* 狀態顯示 */}
                    <div className="bg-[#f6f6f6] border border-[#cfc3b1]  p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#f6f6f6]0  flex items-center justify-center">
                          <Shield className="w-6 h-6 text-green-900" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-900">
                            兩步驟驗證已啟用
                          </h3>
                          <p className="text-sm text-[#3e3e3e]">
                            您的帳戶已受到額外保護
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 停用說明 */}
                    <div className="bg-[#f6f6f6] border border-[#f6f6f6]  p-4">
                      <p className="text-sm text-[#3e3e3e]">
                        停用兩步驟驗證後,您的帳戶安全性會降低。如需停用,請輸入您的密碼確認身分。
                      </p>
                    </div>

                    {/* 停用表單 */}
                    <form onSubmit={handleDisable2FA} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3e3e3e] mb-2">
                          密碼 <span className="text-[#e6684a]">*</span>
                        </label>
                        <input
                          type="password"
                          value={disablePassword}
                          onChange={(e) => {
                            setDisablePassword(e.target.value)
                            setError('')
                          }}
                          placeholder="輸入您的密碼"
                          className="w-full px-4 py-3 border border-[#989898]  focus:ring-1 focus:ring-[#e6684a] focus:border-[#a48c62] transition-all"
                          disabled={isLoading}
                          required
                        />
                        <p className="mt-2 text-sm text-[#989898]">
                          請輸入密碼以確認停用操作
                        </p>
                      </div>

                      {/* 停用按鈕 */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-[#e6684a] text-white font-semibold  hover:bg-[#c44d32] disabled:bg-[#989898] disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            處理中...
                          </span>
                        ) : (
                          '停用兩步驟驗證'
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 頭像上傳彈窗 */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSuccess={(newAvatarUrl) => {
          console.log(' 頭像更新成功:', newAvatarUrl)
        }}
        currentAvatar={user?.avatar}
      />

      {/* 自訂動畫樣式 */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes checkmark {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
