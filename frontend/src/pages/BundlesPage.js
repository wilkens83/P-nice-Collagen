import { Link } from "react-router-dom";
import { useCart } from "../App";
import { Check } from "lucide-react";

const BundlesPage = () => {
  const { bundles, products, addToCart } = useCart();

  const getProductsByIds = (ids) => {
    return ids.map(id => products.find(p => p.id === id)).filter(Boolean);
  };

  return (
    <div data-testid="bundles-page">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#F5F0EB]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Build Your Ritual</h1>
          <p className="text-stone-600 max-w-xl mx-auto">
            Save more when you bundle your favorites. Each set is curated for the perfect routine.
          </p>
        </div>
      </section>

      {/* Bundles */}
      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="space-y-16">
            {bundles.map((bundle) => {
              const bundleProducts = getProductsByIds(bundle.products);
              
              return (
                <div key={bundle.id} className="grid md:grid-cols-2 gap-8 items-center" data-testid={`bundle-detail-${bundle.slug}`}>
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center relative">
                    <span className="text-stone-400">Bundle Image</span>
                    <span className="absolute top-4 right-4 bg-[#D4AF37] text-white px-3 py-1 text-sm font-medium">
                      Save ${bundle.savings.toFixed(0)}
                    </span>
                  </div>

                  {/* Details */}
                  <div>
                    <h2 className="text-3xl font-serif mb-2">{bundle.name}</h2>
                    <p className="text-lg text-stone-500 mb-4">{bundle.tagline}</p>
                    <p className="text-stone-600 mb-6">{bundle.description}</p>

                    {/* Included Products */}
                    <div className="mb-6">
                      <h3 className="text-sm uppercase tracking-widest text-stone-500 mb-3">What's Included</h3>
                      <div className="space-y-2">
                        {bundleProducts.map((product) => (
                          <div key={product.id} className="flex items-center gap-2">
                            <Check size={16} className="text-[#7A8B69]" />
                            <Link to={`/products/${product.slug}`} className="hover:underline">
                              {product.name}
                            </Link>
                            <span className="text-sm text-stone-400">(${product.price.toFixed(2)} value)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-3xl font-medium">${bundle.price.toFixed(2)}</span>
                      <span className="text-xl text-stone-400 line-through">${bundle.compare_at_price.toFixed(2)}</span>
                      <span className="text-sm text-[#7A8B69] font-medium">Save ${bundle.savings.toFixed(2)}</span>
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={() => addToCart(bundle.id, 1, false)}
                      className="btn-primary"
                      data-testid={`add-bundle-${bundle.slug}`}
                    >
                      Add Bundle to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BundlesPage;
