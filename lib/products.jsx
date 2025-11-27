import pool from "./db"

/**
 * 搜尋產品總數
 * @param {string} search - 搜尋關鍵詞
 * @returns {Promise<number>} 總項目數
 */
export async function searchProductsCount(search = '') {
  try {
    let countQuery, countParams

    if (search) {
      // 有搜尋條件的情況
      countQuery = `
        SELECT COUNT(*) as count 
        FROM products 
        WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
      `
      countParams = [`%${search}%`, `%${search}%`, `%${search}%`]
    } else {
      // 沒有搜尋條件的情況
      countQuery = `
        SELECT COUNT(*) as count 
        FROM products
      `
      countParams = []
    }

    // 執行查詢
    const [countResult] = await pool.execute(countQuery, countParams)
    // 回傳總項目數
    return countResult[0].count
  } catch (error) {
    console.error('搜尋產品總數時出錯:', error)
    throw new Error('搜尋產品總數失敗')
  }
}

/**
 * 搜尋產品項目（不分頁）
 * @param {string} search - 搜尋關鍵詞
 * @param {number} offset - 偏移量（用於分頁）
 * @param {number} limit - 每頁數量
 * @returns {Promise<Array>} 產品項目陣列
 */
export async function searchProductsItems(search = '', offset = 0, limit = 10) {
  try {
    let productsQuery, productsParams

    if (search) {
      // 有搜尋條件的情況
      productsQuery = `
        SELECT 
          id,
          name,
          description,
          price,
          category,
          stock,
          image_url,
          created_at,
          updated_at
        FROM products 
        WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      productsParams = [`%${search}%`, `%${search}%`, `%${search}%`]
    } else {
      // 沒有搜尋條件的情況
      productsQuery = `
        SELECT 
          id,
          name,
          description,
          price,
          category,
          stock,
          image_url,
          created_at,
          updated_at
        FROM products 
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      productsParams = []
    }

    // 執行查詢
    const [productsResult] = await pool.execute(productsQuery, productsParams)
    return productsResult
  } catch (error) {
    console.error('搜尋產品項目時出錯:', error)
    throw new Error('搜尋產品項目失敗')
  }
}

/**
 * 搜尋產品函式
 * @param {string} search - 搜尋關鍵詞
 * @param {number} offset - 偏移量（用於分頁）
 * @param {number} limit - 每頁數量
 * @returns {Promise<{items: Array, total: number}>}
 */
export async function searchProducts(search = '', offset = 0, limit = 10) {
  try {
    let countQuery, productsQuery, countParams, productsParams

    if (search) {
      // 有搜尋條件的情況
      countQuery = `
        SELECT COUNT(*) as total 
        FROM products 
        WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
      `
      countParams = [`%${search}%`, `%${search}%`, `%${search}%`]

      productsQuery = `
        SELECT 
          id,
          name,
          description,
          price,
          category,
          stock,
          image_url,
          created_at,
          updated_at
        FROM products 
        WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      productsParams = [`%${search}%`, `%${search}%`, `%${search}%`]
    } else {
      // 沒有搜尋條件的情況
      countQuery = `
        SELECT COUNT(*) as total 
        FROM products
      `
      countParams = []

      productsQuery = `
        SELECT 
          id,
          name,
          description,
          price,
          category,
          stock,
          image_url,
          created_at,
          updated_at
        FROM products 
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      productsParams = []
    }

    // 執行查詢
    const [countResult] = await pool.execute(countQuery, countParams)
    const [productsResult] = await pool.execute(productsQuery, productsParams)

    return {
      items: productsResult,
      total: countResult[0].total,
    }
  } catch (error) {
    console.error('搜尋產品時出錯:', error)
    throw new Error('搜尋產品失敗')
  }
}

/**
 * 取得產品詳情
 * @param {number} id - 產品ID
 * @returns {Promise<Object|null>}
 */
export async function getProductById(id) {
  try {
    const query = `
      SELECT 
        id,
        name,
        description,
        price,
        category,
        stock,
        image_url,
        created_at,
        updated_at
      FROM products 
      WHERE id = ?
    `

    const [rows] = await pool.execute(query, [id])
    return rows[0] || null
  } catch (error) {
    console.error('取得產品詳情時出錯:', error)
    throw new Error('取得產品詳情失敗')
  }
}

/**
 * 取得所有產品分類
 * @returns {Promise<Array>}
 */
export async function getCategories() {
  try {
    const query = `
      SELECT DISTINCT category 
      FROM products 
      WHERE category IS NOT NULL 
      ORDER BY category
    `

    const [rows] = await pool.execute(query)
    return rows.map((row) => row.category)
  } catch (error) {
    console.error('取得產品分類時出錯:', error)
    throw new Error('取得產品分類失敗')
  }
}

/**
 * 搜尋產品函式（用於載入更多）
 * @param {string} search - 搜尋關鍵詞
 * @param {number} offset - 偏移量（用於載入更多）
 * @param {number} limit - 每批數量
 * @param {number} chunkSize - 分塊大小（可選，預設不分塊）
 * @returns {Promise<{items: Array, hasMore: boolean}>}
 */
export async function searchProductsLoadmore(
  search = '',
  offset = 0,
  limit = 10,
  chunkSize = 0
) {
  try {
    let productsQuery, productsParams, hasMoreQuery, hasMoreParams

    if (search) {
      // 有搜尋條件的情況
      productsQuery = `
        SELECT 
          id,
          name,
          description,
          price,
          category,
          stock,
          created_at,
          updated_at
        FROM products 
        WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET 0
      `
      productsParams = [`%${search}%`, `%${search}%`, `%${search}%`]

      // 檢查是否還有更多數據 - 使用子查詢來檢查下一批數據是否存在
      hasMoreQuery = `
        SELECT EXISTS(
          SELECT 1
          FROM products 
          WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
          ORDER BY created_at DESC
          LIMIT 1 OFFSET ${offset + limit}
        ) as hasMore
      `
      hasMoreParams = [`%${search}%`, `%${search}%`, `%${search}%`]
    } else {
      // 沒有搜尋條件的情況
      productsQuery = `
        SELECT 
          id,
          name,
          description,
          price,
          category,
          stock,
          created_at,
          updated_at
        FROM products 
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET 0
      `
      productsParams = []

      // 檢查是否還有更多數據 - 使用子查詢來檢查下一批數據是否存在
      hasMoreQuery = `
        SELECT EXISTS(
          SELECT 1
          FROM products 
          ORDER BY created_at DESC
          LIMIT 1 OFFSET ${offset + limit}
        ) as hasMore
      `
      hasMoreParams = []
    }

    // 執行查詢
    const [productsResult] = await pool.execute(productsQuery, productsParams)
    const [hasMoreResult] = await pool.execute(hasMoreQuery, hasMoreParams)

    console.log(productsResult, productsQuery)
    console.log(hasMoreResult, hasMoreQuery)

    // 如果需要分塊，則進行分塊處理
    let items = productsResult
    if (chunkSize > 0 && productsResult.length > 0) {
      items = []
      for (let i = 0; i < productsResult.length; i += chunkSize) {
        items.push(productsResult.slice(i, i + chunkSize))
      }
    }

    return {
      items: items,
      hasMore: hasMoreResult[0].hasMore === 1,
    }
  } catch (error) {
    console.error('載入更多產品時出錯:', error)
    throw new Error('載入更多產品失敗')
  }
}
