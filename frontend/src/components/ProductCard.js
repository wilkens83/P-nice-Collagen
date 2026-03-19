import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const ProductCard = ({ product, showQuickAdd = true }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < Math.floor(rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-stone-200"}
      />
    ));
  };

  return (
    <Link 
      to={`/products/${product.slug}`}
      className="product-card group block bg-white border border-stone-100 hover:border-stone-300 transition-colors"
      data-testid={`product-card-${product.slug}`}
    >
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden bg-stone-50 relative">
        <div className="product-image w-full h-full transition-transform duration-700 ease-out bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
          <span className="text-stone-400 text-sm">Product Image</span>
        </div>
        {product.compare_at_price && (
          <span className="absolute top-3 left-3 bg-[#7A8B69] text-white text-xs px-2 py-1 uppercase tracking-wider">
            Save ${(product.compare_at_price - product.price).toFixed(0)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {renderStars(product.rating)}
          <span className="text-xs text-stone-400 ml-1">({product.reviews_count})</span>
        </div>
        
        <h3 className="font-serif text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-stone-500 mb-3 line-clamp-2">{product.tagline}</p>
        
        <div className="flex items-baseline gap-2">
          <span className="font-medium">${product.price.toFixed(2)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-stone-400 line-through">
              ${product.compare_at_price.toFixed(2)}
            </span>
          )}
        </div>
        
        {product.subscription_price && (
          <p className="text-xs text-[#7A8B69] mt-1">
            Subscribe & Save: ${product.subscription_price.toFixed(2)}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
