import { useState, useEffect } from 'react'
import { MessageCircle, Send, Trash2, Star, X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function PlaceComments({ placeId, placeName, isOpen, onClose }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [rating, setRating] = useState(5)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [placeId, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEscKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen, onClose])

  const loadComments = () => {
    try {
      setLoading(true)
      const stored = localStorage.getItem(`place_comments:${placeId}`)
      if (stored) {
        const data = JSON.parse(stored)
        setComments(data.sort((a, b) => b.timestamp - a.timestamp))
      } else {
        setComments([])
      }
    } catch (err) {
      console.error('載入評論失敗:', err)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!newComment.trim() || !username.trim()) {
      setError('請填寫姓名和評論內容')
      return
    }

    const comment = {
      id: Date.now(),
      username: username.trim(),
      content: newComment.trim(),
      rating: rating,
      timestamp: Date.now(),
      date: new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const updatedComments = [comment, ...comments]

    try {
      setError(null)
      localStorage.setItem(
        `place_comments:${placeId}`, 
        JSON.stringify(updatedComments)
      )
      
      setComments(updatedComments)
      setNewComment('')
      setRating(5)
      setUsername('')
    } catch (err) {
      setError('發布評論失敗，請稍後再試')
      console.error('儲存失敗:', err)
    }
  }

  const handleDelete = (commentId) => {
    if (!confirm('確定要刪除這則評論嗎？')) return

    const updatedComments = comments.filter(c => c.id !== commentId)

    try {
      localStorage.setItem(
        `place_comments:${placeId}`, 
        JSON.stringify(updatedComments)
      )
      setComments(updatedComments)
    } catch (err) {
      setError('刪除失敗')
      console.error('刪除失敗:', err)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const averageRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : 0

  if (!isOpen || !mounted) return null

  const modalContent = (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[170] animate-fade-in"
        onClick={handleBackdropClick}
      />
      
      <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden animate-scale-in">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-[#cfc3b1]" />
                {placeName} 的評論
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                共 {comments.length} 則評論
                {comments.length > 0 && ` • 平均評分 ${averageRating} ★`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6 p-5 bg-gradient-to-br from-[#cfc3b1]/10 to-[#cfc3b1]/20 rounded-xl border border-[#cfc3b1]/30">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                發表評論
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    您的名稱
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="請輸入您的名稱"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cfc3b1] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    評分
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transform hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-gray-700 font-semibold">{rating} 星</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    評論內容
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="分享您的想法和體驗..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cfc3b1] focus:border-transparent resize-none transition-all"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-[#cfc3b1] hover:bg-[#bfb3a1] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  發布評論
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg mb-3">
                所有評論 ({comments.length})
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cfc3b1]"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg">還沒有評論</p>
                  <p className="text-sm mt-1">成為第一個評論的人吧！</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#cfc3b1] to-[#bfb3a1] rounded-full flex items-center justify-center text-white font-bold">
                            {comment.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {comment.username}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= comment.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">{comment.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除評論"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed pl-[52px]">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 text-center text-xs text-gray-500">
            評論資料儲存在您的瀏覽器本地
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  )

  return createPortal(modalContent, document.body)
}