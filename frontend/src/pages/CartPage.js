import { Link } from "react-router-dom";
import { useCart, API } from "../App";
import { useState, useEffect } from "react";
import { Plus, Minus, Trash2, ShoppingBag, Truck, Shield, Check } from "lucide-react";
import axios from "axios";

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, getProductById } = useCart();
  const [totals, setTotals] = useState({ subtotal: 0, shipping: 0, total: 0 });
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchTotals = async () => {
      if (cart.id && cart.items.length > 0) {
        try {
          const response = await axios.get(`${API}/cart/${cart.id}/totals`);
          setTotals(response.data);
        } catch (e) {
          console.error("Error fetching totals:", e);
        }
      } else {
        setTotals({ subtotal: 0, shipping: 0, total: 0 });
      }
    };
    fetchTotals();
  }, [cart]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const response = await axios.post(`${API}/checkout/session`, {
        cart_id: cart.id,
        origin_url: window.location.origin
      });
      window.location.href = response.data.url;
    } catch (e) {
      console.error("Checkout error:", e);
      alert("Error starting checkout. Please try again.");
    }
    setCheckoutLoading(false);
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" data-testid="empty-cart">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-stone-300 mb-6" />
          <h1 className="text-2xl font-serif mb-2">Your Cart is Empty</h1>
          <p className="text-stone-500 mb-6">Looks like you haven't added any products yet.</p>
          <Link to="/collections/all" className="btn-primary" data-testid="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="cart-page">
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <h1 className="text-3xl md:text-4xl font-serif mb-8">Your Cart</h1>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.items.map((item) => {
                const product = getProductById(item.product_id);
                if (!product) return null;

                const price = item.is_subscription && product.subscription_price 
                  ? product.subscription_price 
                  : product.price;

                return (
                  <div key={`${item.product_id}-${item.is_subscription}`} className="flex gap-6 pb-6 border-b border-stone-100" data-testid={`cart-page-item-${item.product_id}`}>
                    {/* Image */}
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-stone-100 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs text-stone-400">Image</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link to={`/products/${product.slug}`} className="font-serif text-lg hover:underline">
                            {product.name}
                          </Link>
                          {item.is_subscription && (
                            <p className="text-sm text-[#7A8B69]">Subscribe & Save 20%</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-stone-400 hover:text-stone-600"
                          data-testid={`remove-cart-item-${item.product_id}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <p className="text-lg font-medium mt-2">${price.toFixed(2)}</p>

                      {/* Quantity */}
                      <div className="flex items-center mt-4">
                        <div className="flex items-center border border-stone-200">
                          <button
                            onClick={() => updateCartItem(item.product_id, item.quantity - 1)}
                            className="p-2 hover:bg-stone-50"
                            data-testid={`cart-decrease-${item.product_id}`}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 min-w-[40px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItem(item.product_id, item.quantity + 1)}
                            className="p-2 hover:bg-stone-50"
                            data-testid={`cart-increase-${item.product_id}`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="ml-4 text-stone-500">
                          Subtotal: ${(price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link to="/collections/all" className="inline-block text-sm underline hover:no-underline">
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#F5F0EB] p-6 sticky top-24">
                <h2 className="text-xl font-serif mb-6">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Shipping</span>
                    <span>{totals.shipping === 0 ? "FREE" : `$${totals.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-stone-300 text-lg font-medium">
                    <span>Total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {totals.subtotal < 50 && (
                  <div className="mt-4 p-3 bg-white border border-stone-200 text-sm">
                    <p className="text-[#7A8B69]">
                      Add ${(50 - totals.subtotal).toFixed(2)} more for FREE shipping!
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full btn-primary mt-6"
                  data-testid="cart-checkout-btn"
                >
                  {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
                </button>

                {/* Trust Badges */}
                <div className="mt-6 space-y-2 text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <Shield size={14} />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={14} />
                    <span>Free shipping on orders $50+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} />
                    <span>Secure checkout powered by Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CartPage;
