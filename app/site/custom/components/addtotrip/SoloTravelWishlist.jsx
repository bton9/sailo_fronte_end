// ==================== SoloTravelWishlist.jsx (主組件) ====================
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useWishlist } from '../../hook/useWishlist'
import { Toast } from './Toast'
import { SelectListModal } from './SelectListModal'
import { CreateListModal } from './CreateListModal'

export default function SoloTravelWishlist({
  isOpen,
  onClose,
  userId,
  placeId,
}) {
  const [showSelectList, setShowSelectList] = useState(true)
  const [showCreateList, setShowCreateList] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })

  const { lists, loading, toggleList, createList, deleteList } = useWishlist(
    userId,
    placeId,
    isOpen
  )

  useEffect(() => {
    if (isOpen && !userId) {
      console.warn('⚠️ SoloTravelWishlist: userId 未提供')
      onClose()
      alert('請先登入才能使用收藏功能')
    }
  }, [isOpen, userId, onClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'auto'

    const handleKeyDown = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500)
  }

  const handleToggle = async (listId) => {
    const result = await toggleList(listId)
    if (!result.success) {
      showToast('操作失敗,請稍後再試', 'error')
    } else {
      showToast(
        result.action === 'added' ? '已加入收藏清單!' : '已從清單中移除',
        result.action === 'added' ? 'success' : 'info'
      )
    }
  }

  const handleCreate = async (name, description) => {
    const result = await createList(name, description)
    if (result.success) {
      showToast('🎉 清單建立成功!', 'success')
      setShowCreateList(false)
      setShowSelectList(true)
    } else {
      showToast('新增清單失敗,請稍後再試', 'error')
    }
  }

  const handleDelete = async (listId) => {
    if (!confirm('確定要刪除此收藏清單嗎?')) return
    const result = await deleteList(listId)
    if (result.success) {
      showToast('已刪除收藏清單', 'info')
    } else {
      showToast(`刪除失敗:${result.message}`, 'error')
    }
  }

  if (!isOpen) return null

  const selectedCount = lists.filter((l) => l.checked).length

  return createPortal(
    <>
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
        onClick={onClose}
      />

      {showSelectList && (
        <SelectListModal
          lists={lists}
          loading={loading}
          selectedCount={selectedCount}
          onCreateNew={() => {
            setShowSelectList(false)
            setShowCreateList(true)
          }}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onClose={onClose}
        />
      )}

      {showCreateList && (
        <CreateListModal
          onSubmit={handleCreate}
          onClose={() => {
            setShowCreateList(false)
            setShowSelectList(true)
          }}
        />
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>,
    document.body
  )
}
