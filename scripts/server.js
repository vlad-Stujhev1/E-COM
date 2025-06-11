const express = require("express")
const cors = require("cors")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))

// Настройки
const JWT_SECRET = process.env.JWT_SECRET || "vs_lab_secret_key_2024"
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "your_bot_token"
const ADMIN_IPS = ["127.0.0.1", "::1"] // Разрешенные IP для админки

// Временная база данных (в продакшене использовать PostgreSQL/MongoDB)
const products = [
  {
    id: 1,
    name: "Архитектурный скетчбук",
    description: "Лимитированная серия блокнотов для архитектурных зарисовок с уникальной разметкой",
    price: 2500,
    image: "/placeholder.svg?height=200&width=200",
    category: "Инструменты",
    limited: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Цифровой курс: Системное мышление",
    description: "Онлайн-курс по развитию системного подхода в проектировании от основателя VS_LAB",
    price: 15000,
    image: "/placeholder.svg?height=200&width=200",
    category: "Знания",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Модульная система хранения",
    description: "Концептуальное решение для организации пространства на основе принципов VS_LAB",
    price: 45000,
    image: "/placeholder.svg?height=200&width=200",
    category: "Решения",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "VS_LAB Manifesto",
    description: "Книга о философии и методологии лаборатории. Ограниченный тираж 500 экземпляров",
    price: 3500,
    image: "/placeholder.svg?height=200&width=200",
    category: "Знания",
    limited: true,
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
    items: [
      { name: "Архитектурный скетчбук", quantity: 1, price: 2500 },
      { name: "Цифровой курс: Системное мышление", quantity: 1, price: 15000 },
    ],
  },
  {
    id: 2,
    userId: 12345,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    total: 3500,
    status: "pending",
    items: [{ name: "VS_LAB Manifesto", quantity: 1, price: 3500 }],
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
  const clientIP = req.ip || req.connection.remoteAddress

  // Проверка IP (в продакшене использовать более надежную авторизацию)
  if (!ADMIN_IPS.includes(clientIP) && !ADMIN_IPS.includes("127.0.0.1")) {
    return res.status(403).json({ error: "Admin access denied" })
  }

  authenticateToken(req, res, next)
}

// Маршруты авторизации
app.post("/api/auth", (req, res) => {
  try {
    const { initData } = req.body

    // В разработке пропускаем валидацию
    if (process.env.NODE_ENV !== "production") {
      const token = jwt.sign({ userId: 12345, username: "testuser" }, JWT_SECRET)
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

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET)

    res.json({ success: true, token, user })
  } catch (error) {
    console.error("Auth error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
})

// Маршруты товаров
app.get("/api/products", (req, res) => {
  res.json(products)
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
  const userOrders = orders.filter((order) => order.userId === req.user.userId)
  res.json(userOrders)
})

// Админские маршруты
app.get("/api/admin/products", authenticateAdmin, (req, res) => {
  res.json(products)
})

app.post("/api/admin/product", authenticateAdmin, (req, res) => {
  try {
    const { name, description, price, image, category, limited } = req.body

    if (!name || !description || !price) {
      return res.status(400).json({ error: "Required fields missing" })
    }

    const newProduct = {
      id: Math.max(...products.map((p) => p.id), 0) + 1,
      name: name.trim(),
      description: description.trim(),
      price: Number.parseFloat(price),
      image: image || "/placeholder.svg?height=200&width=200",
      category: category || "Инструменты",
      limited: Boolean(limited),
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

    const { name, description, price, image, category, limited } = req.body

    products[productIndex] = {
      ...products[productIndex],
      name: name?.trim() || products[productIndex].name,
      description: description?.trim() || products[productIndex].description,
      price: price ? Number.parseFloat(price) : products[productIndex].price,
      image: image || products[productIndex].image,
      category: category || products[productIndex].category,
      limited: limited !== undefined ? Boolean(limited) : products[productIndex].limited,
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

// Маршруты корзины и оплаты
app.post("/api/cart", authenticateToken, (req, res) => {
  // Логика добавления в корзину (можно расширить)
  res.json({ success: true, message: "Added to cart" })
})

app.post("/api/payment", authenticateToken, (req, res) => {
  try {
    const { cartItems, total } = req.body

    // Создание заказа
    const newOrder = {
      id: Math.max(...orders.map((o) => o.id), 0) + 1,
      userId: req.user.userId,
      date: new Date().toISOString(),
      total: total,
      status: "pending",
      items: cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }

    orders.push(newOrder)

    console.log(`💳 New order: #${newOrder.id} for user ${req.user.userId} - ${total}₽`)

    // Имитация обработки платежа
    setTimeout(() => {
      const orderIndex = orders.findIndex((o) => o.id === newOrder.id)
      if (orderIndex !== -1) {
        orders[orderIndex].status = "completed"
        console.log(`✅ Order #${newOrder.id} completed`)
      }
    }, 5000)

    res.json({ success: true, orderId: newOrder.id })
  } catch (error) {
    console.error("Payment error:", error)
    res.status(500).json({ error: "Payment failed" })
  }
})

// Статус сервера
app.get("/api/status", (req, res) => {
  res.json({
    status: "VS_LAB Store API Running",
    timestamp: new Date().toISOString(),
    products: products.length,
    users: users.length,
    orders: orders.length,
  })
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`
🚀 VS_LAB Store API запущен на порту ${PORT}

📊 Статистика:
   • Товаров: ${products.length}
   • Пользователей: ${users.length}  
   • Заказов: ${orders.length}

🔗 Эндпоинты:
   • GET  /api/status
   • POST /api/auth
   • GET  /api/products
   • GET  /api/orders
   • POST /api/admin/product
   • PUT  /api/admin/product/:id
   • DELETE /api/admin/product/:id

🎨 VS_LAB - Лаборатория Архитектурных Решений
  `)
})

module.exports = app
