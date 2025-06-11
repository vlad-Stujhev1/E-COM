"use client"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  limited?: boolean
}

interface VSProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function VSProductCard({ product, onAddToCart }: VSProductCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Инструменты":
        return "🔧"
      case "Знания":
        return "📚"
      case "Решения":
        return "💡"
      case "Коллекции":
        return "📦"
      default:
        return "📄"
    }
  }

  return (
    <div className="vs-product-card vs-fade-in">
      {/* Limited Badge */}
      {product.limited && <div className="vs-product-limited">LIMITED</div>}

      {/* Product Image */}
      <div className="vs-product-image">
        <span className="text-4xl">{getCategoryIcon(product.category)}</span>
      </div>

      {/* Product Content */}
      <div className="vs-product-content">
        {/* Category */}
        <div className="vs-product-category">{product.category}</div>

        {/* Title */}
        <h3 className="vs-product-title">{product.name}</h3>

        {/* Description */}
        <p className="vs-product-description">{product.description}</p>

        {/* Footer */}
        <div className="vs-product-footer">
          <div className="vs-product-price">{product.price.toLocaleString()} ₽</div>
          <button onClick={() => onAddToCart(product)} className="vs-button text-xs px-4 py-2 min-h-[36px]">
            В корзину
          </button>
        </div>
      </div>
    </div>
  )
}
