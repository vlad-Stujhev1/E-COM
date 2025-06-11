"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  limited?: boolean
  createdAt?: string
}

interface ProductForm {
  name: string
  description: string
  price: string
  image: string
  category: string
  limited: boolean
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "Инструменты",
    limited: false,
  })
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
    loadProducts()
  }, [])

  const checkAdminAccess = () => {
    const token = localStorage.getItem("vs_lab_token")
    if (!token) {
      router.push("/")
      return
    }
    // Дополнительная проверка админских прав
  }

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/admin/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vs_lab_token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
      }

      const url = editingId ? `/api/admin/product/${editingId}` : "/api/admin/product"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vs_lab_token")}`,
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        await loadProducts()
        resetForm()
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert(editingId ? "Товар обновлен!" : "Товар добавлен!")
        }
      }
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      limited: product.limited || false,
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm("Удалить товар?", async (confirmed) => {
        if (confirmed) {
          await deleteProduct(id)
        }
      })
    } else {
      if (confirm("Удалить товар?")) {
        await deleteProduct(id)
      }
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/product/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vs_lab_token")}`,
        },
      })

      if (response.ok) {
        await loadProducts()
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert("Товар удален!")
        }
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "Инструменты",
      limited: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-[#0d6efd] rounded-full mx-auto mb-4"></div>
          <div className="text-[#666666]">Загрузка админ-панели...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Header */}
      <div className="bg-[#111111] text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-3 p-1 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">VS_LAB Admin</h1>
              <p className="text-xs text-gray-300">Управление товарами</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Добавить товар
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Add/Edit Form */}
        {showForm && (
          <Card className="bg-white border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-[#111111] flex items-center justify-between">
                {editingId ? "Редактировать товар" : "Добавить новый товар"}
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Название товара</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Введите название"
                      required
                      className="border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Цена (₽)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      required
                      className="border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">Описание</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание товара"
                    required
                    className="border-gray-200 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">URL изображения</label>
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Категория</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d6efd]"
                    >
                      <option value="Инструменты">Инструменты</option>
                      <option value="Знания">Знания</option>
                      <option value="Решения">Решения</option>
                      <option value="Коллекции">Коллекции</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="limited"
                    checked={formData.limited}
                    onChange={(e) => setFormData({ ...formData, limited: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="limited" className="text-sm text-[#111111]">
                    Лимитированная серия
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Сохранение..." : "Сохранить"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#111111]">Все товары ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#666666]">Товары не найдены</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-[#111111]">Товар</th>
                      <th className="text-left py-3 px-2 font-semibold text-[#111111]">Категория</th>
                      <th className="text-left py-3 px-2 font-semibold text-[#111111]">Цена</th>
                      <th className="text-left py-3 px-2 font-semibold text-[#111111]">Статус</th>
                      <th className="text-right py-3 px-2 font-semibold text-[#111111]">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-2">
                          <div className="flex items-center">
                            <img
                              src={product.image || "/placeholder.svg?height=40&width=40"}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3 bg-gray-100"
                            />
                            <div>
                              <p className="font-medium text-[#111111] text-sm">{product.name}</p>
                              <p className="text-xs text-[#666666] truncate max-w-[200px]">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-sm text-[#666666] bg-gray-100 px-2 py-1 rounded">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="font-semibold text-[#0d6efd]">{product.price.toLocaleString()} ₽</span>
                        </td>
                        <td className="py-4 px-2">
                          {product.limited && (
                            <span className="text-xs bg-[#0d6efd] text-white px-2 py-1 rounded">LIMITED</span>
                          )}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="text-[#0d6efd] hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
