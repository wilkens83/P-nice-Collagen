import { useParams } from "react-router-dom";
import { useCart, API } from "../App";
import { useState, useEffect } from "react";
import { Star, Check, Truck, Shield, ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";

const ProductPage = () => {
  const { slug } = useParams();
  const { products, addToCart, getProductById } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedTab, setSelectedTab] = useState("benefits");
  const [quantity, setQuantity] = useState(1);
  const [isSubscription, setIsSubscription] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [faqOpen, setFaqOpen] = useState(null);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const p = products.find(p => p.slug === slug);
    setProduct(p);
    setSelectedImage(0); // Reset image selection when product changes
    
    if (p) {
      axios.get(`${API}/reviews/${p.id}`).then(res => setReviews(res.data)).catch(() => {});
    }
  }, [slug, products]);

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product.id, quantity, isSubscription);
    setAdding(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-stone-200"}
      />
    ));
  };

  const pairsWithProducts = product?.pairs_with?.map(id => getProductById(id)).filter(Boolean) || [];

  // SEO meta data based on product
  const getSEOData = () => {
    if (!product) return {};
    
    const seoMap = {
      "unflavored-collagen": {
        title: "Grass-Fed Hydrolyzed Collagen Peptides (Unflavored)",
        description: "100% pure, unflavored Grass-Fed Bovine Collagen Peptides (Types 1 & 3). Support radiant skin, thicker hair, and flexible joints. Dissolves instantly in any beverage.",
        keywords: "grass-fed collagen, collagen peptides, type 1 collagen, type 3 collagen, unflavored collagen, hydrolyzed collagen, skin elasticity"
      },
      "vanilla-creamer": {
        title: "Grass-Fed Collagen Creamer (Vanilla) - Dairy-Free",
        description: "Elevate your morning coffee with pure Grass-Fed Collagen Peptides. Dairy-free vanilla creamer for visibly plumper skin and stronger hair with every sip.",
        keywords: "collagen creamer, vanilla collagen, coffee creamer collagen, dairy-free creamer, collagen coffee, grass-fed collagen"
      },
      "chocolate-collagen": {
        title: "Grass-Fed Collagen Peptides Powder (Chocolate)",
        description: "Support your skin's youthful bounce with Types 1 and 3 Grass-Fed Collagen. Premium cocoa flavor, sweetened with Stevia. Keto-friendly collagen chocolate.",
        keywords: "chocolate collagen, collagen powder, keto collagen, collagen peptides, grass-fed collagen, chocolate protein"
      },
      "retinol-serum": {
        title: "Retinol & Peptide Face Serum - Night Repair",
        description: "Refine your skin texture overnight with smoothing Retinol and firming Hexapeptide-11. Visibly polished, even complexion by morning. Gentle formula.",
        keywords: "retinol serum, peptide serum, night serum, anti-aging serum, face serum, fine lines, skin texture"
      },
      "sleep-cream": {
        title: "Sleep+ Night Recovery Cream with Melatonin & Collagen",
        description: "Wake up radiant with Bio-Identical Melatonin, Hyaluronic Acid, and Collagen. Accelerates overnight skin repair while you sleep. Lavender-infused.",
        keywords: "night cream, recovery cream, melatonin cream, collagen cream, hyaluronic acid, sleep skincare, overnight repair"
      }
    };
    
    return seoMap[product.slug] || {
      title: product.name,
      description: product.description,
      keywords: ""
    };
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  const currentPrice = isSubscription && product.subscription_price 
    ? product.subscription_price 
    : product.price;

  const tabs = [
    { id: "benefits", label: "Benefits" },
    { id: "ingredients", label: "Ingredients" },
    { id: "how-to-use", label: "How to Use" },
    { id: "reviews", label: `Reviews (${product.reviews_count})` },
  ];

  const seoData = getSEOData();

  return (
    <div data-testid="product-page">
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        type="product"
        product={product}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: product.collection, url: `/collections/${product.collection.toLowerCase().replace(/\s+/g, '-').replace('&', '')}` },
          { name: product.name, url: `/products/${product.slug}` }
        ]}
      />
      
      {/* Main Product Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-stone-50 flex items-center justify-center sticky top-24 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[selectedImage]} 
                    alt={`${product.name} - Image ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                    <span className="text-stone-400">Main Product Image</span>
                  </div>
                )}
              </div>
              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-2">
                {product.images && product.images.length > 0 ? (
                  product.images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square overflow-hidden cursor-pointer transition-all ${selectedImage === i ? 'ring-2 ring-[#292524]' : 'hover:ring-2 ring-stone-300'}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))
                ) : (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-stone-100 flex items-center justify-center">
                      <span className="text-xs text-stone-400">Img {i}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="md:sticky md:top-24 md:self-start">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">{renderStars(product.rating)}</div>
                <span className="text-sm text-stone-500">{product.rating} ({product.reviews_count} reviews)</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-serif mb-2" data-testid="product-title">{product.name}</h1>
              <p className="text-lg text-stone-600 mb-6">{product.tagline}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-medium">${currentPrice.toFixed(2)}</span>
                  {product.compare_at_price && !isSubscription && (
                    <span className="text-lg text-stone-400 line-through">${product.compare_at_price.toFixed(2)}</span>
                  )}
                </div>
                {product.subscription_price && (
                  <p className="text-sm text-stone-500 mt-1">
                    ${(product.price / 30).toFixed(2)} per serving
                  </p>
                )}
              </div>

              {/* Purchase Type */}
              {product.subscription_price && (
                <div className="mb-6 space-y-3">
                  <div 
                    className={`border p-4 cursor-pointer transition-colors ${!isSubscription ? 'border-[#292524] bg-stone-50' : 'border-stone-200'}`}
                    onClick={() => setIsSubscription(false)}
                    data-testid="one-time-option"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!isSubscription ? 'border-[#292524]' : 'border-stone-300'}`}>
                          {!isSubscription && <div className="w-2.5 h-2.5 rounded-full bg-[#292524]" />}
                        </div>
                        <span className="font-medium">One-time purchase</span>
                      </div>
                      <span>${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div 
                    className={`border p-4 cursor-pointer transition-colors ${isSubscription ? 'border-[#292524] bg-stone-50' : 'border-stone-200'}`}
                    onClick={() => setIsSubscription(true)}
                    data-testid="subscription-option"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSubscription ? 'border-[#292524]' : 'border-stone-300'}`}>
                          {isSubscription && <div className="w-2.5 h-2.5 rounded-full bg-[#292524]" />}
                        </div>
                        <div>
                          <span className="font-medium">Subscribe & Save 20%</span>
                          <p className="text-xs text-[#7A8B69]">Free shipping • Cancel anytime</p>
                        </div>
                      </div>
                      <span>${product.subscription_price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center border border-stone-200">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-stone-50"
                    data-testid="decrease-qty"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 min-w-[40px] text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-stone-50"
                    data-testid="increase-qty"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full btn-primary mb-4"
                data-testid="add-to-cart-btn"
              >
                {adding ? "Adding..." : `Add to Cart — $${(currentPrice * quantity).toFixed(2)}`}
              </button>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 py-4 border-t border-b border-stone-100 text-xs text-stone-500">
                <div className="flex items-center gap-1">
                  <Truck size={14} />
                  <span>Free shipping $50+</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield size={14} />
                  <span>30-day guarantee</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check size={14} />
                  <span>Secure checkout</span>
                </div>
              </div>

              {/* Key Benefits Icons */}
              <div className="mt-6 space-y-2">
                {product.benefits.slice(0, 3).map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-[#7A8B69]" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 border-t border-stone-100">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          {/* Tab Headers */}
          <div className="flex gap-8 border-b border-stone-200 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`pb-4 text-sm uppercase tracking-widest whitespace-nowrap transition-colors ${
                  selectedTab === tab.id ? 'border-b-2 border-[#292524] font-medium' : 'text-stone-500 hover:text-stone-700'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-3xl">
            {selectedTab === "benefits" && (
              <div className="space-y-4" data-testid="benefits-content">
                <h3 className="text-xl font-serif mb-4">Why You'll Love It</h3>
                <p className="text-stone-600 mb-6">{product.description}</p>
                <ul className="space-y-3">
                  {product.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check size={18} className="text-[#7A8B69] mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedTab === "ingredients" && (
              <div data-testid="ingredients-content">
                <h3 className="text-xl font-serif mb-4">Ingredients</h3>
                <div className="space-y-3">
                  {product.ingredients.map((ingredient, i) => (
                    <div key={i} className="p-4 bg-stone-50 border border-stone-100">
                      <span className="font-medium">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === "how-to-use" && (
              <div data-testid="how-to-use-content">
                <h3 className="text-xl font-serif mb-4">How to Use</h3>
                <p className="text-stone-600">{product.how_to_use}</p>
              </div>
            )}

            {selectedTab === "reviews" && (
              <div data-testid="reviews-content">
                <h3 className="text-xl font-serif mb-4">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-stone-100 pb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          {review.verified && (
                            <span className="text-xs text-[#7A8B69] flex items-center gap-1">
                              <Check size={12} /> Verified
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium mb-1">{review.title}</h4>
                        <p className="text-stone-600 text-sm mb-2">{review.content}</p>
                        <p className="text-xs text-stone-400">{review.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {product.faqs.length > 0 && (
        <section className="py-12 bg-[#F5F0EB]">
          <div className="max-w-3xl mx-auto px-6 md:px-12">
            <h3 className="text-2xl font-serif mb-6">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {product.faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-stone-100">
                  <button
                    className="w-full flex justify-between items-center p-4 text-left"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    data-testid={`product-faq-${i}`}
                  >
                    <span className="font-medium text-sm pr-4">{faq.q}</span>
                    {faqOpen === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {faqOpen === i && (
                    <div className="px-4 pb-4 text-sm text-stone-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pairs With */}
      {pairsWithProducts.length > 0 && (
        <section className="py-12">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12">
            <h3 className="text-2xl font-serif mb-6">Complete Your Ritual</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pairsWithProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
