const express = require("express")
const cors = require("cors")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.static(path.join(__dirname, "../admin")))

// Настройки
const JWT_SECRET = process.env.JWT_SECRET || "vs_lab_secret_key_2024"
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "your_bot_token"
const ADMIN_IPS = ["127.0.0.1", "::1", "localhost"]

// Расширенная база данных товаров
const products = [
  {
    id: 1,
    name: "Архитектурный скетчбук VS_LAB",
    description: "Лимитированная серия блокнотов для архитектурных зарисовок с уникальной разметкой и системой модулей",
    price: 2500,
    image: "/placeholder.svg?height=300&width=300",
    category: "Инструменты",
    characteristics: {
      материал: "Бумага Fabriano 160г/м²",
      размер: "A4 (210×297 мм)",
      страниц: 120,
      переплет: "Твердый",
      особенности: "Модульная сетка VS_LAB",
    },
    stock: 50,
    userLimit: 2,
    limited: true,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Цифровой курс: Системное мышление",
    description:
      "Онлайн-курс по развитию системного подхода в проектировании от основателя VS_LAB. 8 модулей, 40 часов контента",
    price: 15000,
    image: "/placeholder.svg?height=300&width=300",
    category: "Знания",
    characteristics: {
      формат: "Онлайн-курс",
      продолжительность: "40 часов",
      модулей: 8,
      доступ: "Пожизненный",
      сертификат: "VS_LAB Certificate",
    },
    stock: 100,
    userLimit: 1,
    limited: false,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Модульная система хранения GRID",
    description:
      "Концептуальное решение для организации пространства на основе принципов VS_LAB. Адаптивная система модулей",
    price: 45000,
    image: "/placeholder.svg?height=300&width=300",
    category: "Решения",
    characteristics: {
      материал: "Алюминий + дерево",
      размеры: "Модульная система",
      цвет: "Белый/Черный",
      установка: "Включена",
      гарантия: "5 лет",
    },
    stock: 10,
    userLimit: 1,
    limited: false,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "VS_LAB Manifesto",
    description:
      "Книга о философии и методологии лаборатории. Ограниченный тираж 500 экземпляров с авторскими подписями",
    price: 3500,
    image: "/placeholder.svg?height=300&width=300",
    category: "Знания",
    characteristics: {
      страниц: 240,
      формат: "170×240 мм",
      переплет: "Твердый с суперобложкой",
      бумага: "Мелованная 150г/м²",
      тираж: "500 экземпляров",
    },
    stock: 25,
    userLimit: 1,
    limited: true,
    active: true,
    createdAt: new Date().toISOString(),
  },
]

const users = []
const orders = [
  {
    id: 1,
    userId: 12345,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    total: 18500,
    status: "completed",
    paymentMethod: "Telegram Payments",
    items: [
      { id: 1, name: "Архитектурный скетчбук VS_LAB", quantity: 1, price: 2500 },
      { id: 2, name: "Цифровой курс: Системное мышление", quantity: 1, price: 15000 },
    ],
  },
  {
    id: 2,
    userId: 12345,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    total: 3500,
    status: "processing",
    paymentMethod: "Telegram Payments",
    items: [{ id: 4, name: "VS_LAB Manifesto", quantity: 1, price: 3500 }],
  },
  {
    id: 3,
    userId: 12345,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    total: 5000,
    status: "pending",
    paymentMethod: "Банковская карта",
    items: [{ id: 1, name: "Архитектурный скетчбук VS_LAB", quantity: 2, price: 2500 }],
  },
]

// Утилиты
const validateTelegramData = (initData) => {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get("hash")
    urlParams.delete("hash")

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")

    const secretKey = crypto.createHmac("sha256", "WebAppData").update(TELEGRAM_BOT_TOKEN).digest()
    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

    return calculatedHash === hash
  } catch (error) {
    console.error("Telegram validation error:", error)
    return false
  }
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" })
    }
    req.user = user
    next()
  })
}

const authenticateAdmin = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"]

  // Проверка IP для админки
  const isAllowedIP = ADMIN_IPS.some((allowedIP) => clientIP === allowedIP || clientIP.includes(allowedIP))

  if (!isAllowedIP && process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Admin access denied from this IP" })
  }

  authenticateToken(req, res, next)
}

// Маршруты авторизации
app.post("/api/auth", (req, res) => {
  try {
    const { initData } = req.body

    // В разработке пропускаем валидацию
    if (process.env.NODE_ENV !== "production") {
      const token = jwt.sign({ userId: 12345, username: "testuser" }, JWT_SECRET, { expiresIn: "7d" })
      return res.json({ success: true, token })
    }

    if (!validateTelegramData(initData)) {
      return res.status(400).json({ error: "Invalid Telegram data" })
    }

    const urlParams = new URLSearchParams(initData)
    const userParam = urlParams.get("user")

    if (!userParam) {
      return res.status(400).json({ error: "User data not found" })
    }

    const userData = JSON.parse(decodeURIComponent(userParam))

    // Найти или создать пользователя
    let user = users.find((u) => u.id === userData.id)
    if (!user) {
      user = {
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        createdAt: new Date().toISOString(),
      }
      users.push(user)
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" })

    res.json({ success: true, token, user })
  } catch (error) {
    console.error("Auth error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
})

// Маршруты товаров
app.get("/api/products", (req, res) => {
  const activeProducts = products.filter((p) => p.active)
  res.json(activeProducts)
})

app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === Number.parseInt(req.params.id))
  if (!product) {
    return res.status(404).json({ error: "Product not found" })
  }
  res.json(product)
})

// Маршруты заказов
app.get("/api/orders", authenticateToken, (req, res) => {
  try {
    const userOrders = orders.filter((order) => order.userId === req.user.userId)

    // Сортируем заказы по дате (новые сначала)
    const sortedOrders = userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    console.log(`📋 Orders requested for user ${req.user.userId}: ${sortedOrders.length} orders found`)

    res.json(sortedOrders)
  } catch (error) {
    console.error("Orders error:", error)
    res.status(500).json({ error: "Failed to load orders" })
  }
})

// Получение конкретного заказа
app.get("/api/orders/:id", authenticateToken, (req, res) => {
  try {
    const orderId = Number.parseInt(req.params.id)
    const order = orders.find((order) => order.id === orderId && order.userId === req.user.userId)

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    res.json(order)
  } catch (error) {
    console.error("Order fetch error:", error)
    res.status(500).json({ error: "Failed to load order" })
  }
})

// Маршруты оплаты
app.post("/api/payment", authenticateToken, (req, res) => {
  try {
    const { cartItems, total, paymentMethod } = req.body

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" })
    }

    // Проверка лимитов пользователя
    const userOrders = orders.filter((order) => order.userId === req.user.userId)
    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.id)
      if (!product) {
        return res.status(400).json({ error: `Product ${item.id} not found` })
      }

      // Проверка наличия
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` })
      }

      // Проверка лимита пользователя
      const userPurchased = userOrders.reduce((sum, order) => {
        const orderItem = order.items.find((oi) => oi.id === item.id)
        return sum + (orderItem ? orderItem.quantity : 0)
      }, 0)

      if (userPurchased + item.quantity > product.userLimit) {
        return res.status(400).json({
          error: `Превышен лимит покупки для ${product.name}. Максимум ${product.userLimit} шт. на пользователя`,
        })
      }
    }

    // Создание заказа
    const newOrder = {
      id: Math.max(...orders.map((o) => o.id), 0) + 1,
      userId: req.user.userId,
      date: new Date().toISOString(),
      total: total,
      status: "pending",
      paymentMethod: paymentMethod || "Telegram Payments",
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }

    orders.push(newOrder)

    // Обновление остатков
    cartItems.forEach((item) => {
      const productIndex = products.findIndex((p) => p.id === item.id)
      if (productIndex !== -1) {
        products[productIndex].stock -= item.quantity
      }
    })

    console.log(`💳 New order: #${newOrder.id} for user ${req.user.userId} - ${total}₽`)

    // Имитация обработки платежа
    setTimeout(() => {
      const orderIndex = orders.findIndex((o) => o.id === newOrder.id)
      if (orderIndex !== -1) {
        orders[orderIndex].status = "completed"
        console.log(`✅ Order #${newOrder.id} completed`)
      }
    }, 5000)

    res.json({ success: true, orderId: newOrder.id, order: newOrder })
  } catch (error) {
    console.error("Payment error:", error)
    res.status(500).json({ error: "Payment failed" })
  }
})

// Создание инвойса для Telegram Payments
app.post("/api/payment/create-invoice", authenticateToken, (req, res) => {
  try {
    const { cartItems, total } = req.body

    // В реальном приложении здесь будет интеграция с Telegram Bot API
    // для создания инвойса через createInvoiceLink

    // Заглушка для разработки
    const invoiceLink = `https://t.me/invoice/${Date.now()}`

    res.json({ success: true, invoiceLink })
  } catch (error) {
    console.error("Invoice creation error:", error)
    res.status(500).json({ error: "Failed to create invoice" })
  }
})

// Админские маршруты
app.get("/api/admin/products", authenticateAdmin, (req, res) => {
  res.json(products)
})

app.post("/api/admin/product", authenticateAdmin, (req, res) => {
  try {
    const { name, description, price, image, category, characteristics, stock, userLimit, limited, active } = req.body

    if (!name || !description || !price) {
      return res.status(400).json({ error: "Required fields missing" })
    }

    const newProduct = {
      id: Math.max(...products.map((p) => p.id), 0) + 1,
      name: name.trim(),
      description: description.trim(),
      price: Number.parseFloat(price),
      image: image || "/placeholder.svg?height=300&width=300",
      category: category || "Инструменты",
      characteristics: characteristics || {},
      stock: Number.parseInt(stock) || 0,
      userLimit: Math.min(Number.parseInt(userLimit) || 5, 5),
      limited: Boolean(limited),
      active: active !== false,
      createdAt: new Date().toISOString(),
    }

    products.push(newProduct)

    console.log(`✅ Product added: ${newProduct.name} (ID: ${newProduct.id})`)
    res.status(201).json(newProduct)
  } catch (error) {
    console.error("Error adding product:", error)
    res.status(500).json({ error: "Failed to add product" })
  }
})

app.put("/api/admin/product/:id", authenticateAdmin, (req, res) => {
  try {
    const productId = Number.parseInt(req.params.id)
    const productIndex = products.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" })
    }

    const { name, description, price, image, category, characteristics, stock, userLimit, limited, active } = req.body

    products[productIndex] = {
      ...products[productIndex],
      name: name?.trim() || products[productIndex].name,
      description: description?.trim() || products[productIndex].description,
      price: price ? Number.parseFloat(price) : products[productIndex].price,
      image: image || products[productIndex].image,
      category: category || products[productIndex].category,
      characteristics: characteristics || products[productIndex].characteristics,
      stock: stock !== undefined ? Number.parseInt(stock) : products[productIndex].stock,
      userLimit: userLimit !== undefined ? Math.min(Number.parseInt(userLimit), 5) : products[productIndex].userLimit,
      limited: limited !== undefined ? Boolean(limited) : products[productIndex].limited,
      active: active !== undefined ? Boolean(active) : products[productIndex].active,
      updatedAt: new Date().toISOString(),
    }

    console.log(`✅ Product updated: ${products[productIndex].name} (ID: ${productId})`)
    res.json(products[productIndex])
  } catch (error) {
    console.error("Error updating product:", error)
    res.status(500).json({ error: "Failed to update product" })
  }
})

app.delete("/api/admin/product/:id", authenticateAdmin, (req, res) => {
  try {
    const productId = Number.parseInt(req.params.id)
    const productIndex = products.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" })
    }

    const deletedProduct = products.splice(productIndex, 1)[0]

    console.log(`🗑️ Product deleted: ${deletedProduct.name} (ID: ${productId})`)
    res.json({ success: true, message: "Product deleted" })
  } catch (error) {
    console.error("Error deleting product:", error)
    res.status(500).json({ error: "Failed to delete product" })
  }
})

// Статус сервера
app.get("/api/status", (req, res) => {
  res.json({
    status: "VS_LAB Store API Running",
    timestamp: new Date().toISOString(),
    products: products.length,
    activeProducts: products.filter((p) => p.active).length,
    users: users.length,
    orders: orders.length,
    version: "2.0.0",
  })
})

// Админ-панель (статические файлы)
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../admin/index.html"))
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`
🚀 VS_LAB Store Enhanced API запущен на порту ${PORT}

📊 Статистика:
   • Товаров: ${products.length} (активных: ${products.filter((p) => p.active).length})
   • Пользователей: ${users.length}  
   • Заказов: ${orders.length}

🔗 Эндпоинты:
   • GET  /api/status - статус API
   • POST /api/auth - авторизация
   • GET  /api/products - список товаров
   • GET  /api/orders - заказы пользователя
   • POST /api/payment - обработка платежей
   • GET  /admin - админ-панель

🛡️ Безопасность:
   • JWT токены с истечением 7 дней
   • Лимиты покупок (макс. 5 шт. на пользователя)
   • IP-фильтрация для админки
   • Валидация Telegram WebApp данных

🎨 VS_LAB - Лаборатория Архитектурных Решений
   Системное мышление • Радикальная эстетика • Простота без упрощения
  `)
})

module.exports = app
