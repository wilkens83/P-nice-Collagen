import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart, API } from "../App";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const CartDrawer = () => {
  const { cart, cartOpen, setCartOpen, updateCartItem, removeFromCart, getProductById } = useCart();
  const [totals, setTotals] = useState({ subtotal: 0, shipping: 0, total: 0 });
  const navigate = useNavigate();

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

  const handleCheckout = () => {
    setCartOpen(false);
    navigate("/cart");
  };

  if (!cartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setCartOpen(false)}
        data-testid="cart-overlay"
      />

      {/* Drawer */}
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl animate-slide-in"
        data-testid="cart-drawer"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-100">
            <h2 className="text-lg font-serif">Your Cart ({cart.items.length})</h2>
            <button onClick={() => setCartOpen(false)} data-testid="close-cart-btn">
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4" />
                <p className="text-stone-500 mb-6">Your cart is empty</p>
                <Link
                  to="/collections/all"
                  onClick={() => setCartOpen(false)}
                  className="btn-primary inline-block"
                  data-testid="shop-now-btn"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.items.map((item) => {
                  const product = getProductById(item.product_id);
                  if (!product) return null;

                  const price = item.is_subscription && product.subscription_price 
                    ? product.subscription_price 
                    : product.price;

                  return (
                    <div key={`${item.product_id}-${item.is_subscription}`} className="flex gap-4" data-testid={`cart-item-${item.product_id}`}>
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-stone-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-stone-400">Image</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{product.name}</h3>
                        {item.is_subscription && (
                          <span className="text-xs text-[#7A8B69]">Subscribe & Save</span>
                        )}
                        <p className="text-sm text-stone-500 mt-1">${price.toFixed(2)}</p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-stone-200">
                            <button
                              onClick={() => updateCartItem(item.product_id, item.quantity - 1)}
                              className="p-2 hover:bg-stone-50"
                              data-testid={`decrease-${item.product_id}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItem(item.product_id, item.quantity + 1)}
                              className="p-2 hover:bg-stone-50"
                              data-testid={`increase-${item.product_id}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-xs text-stone-400 hover:text-stone-600 underline"
                            data-testid={`remove-${item.product_id}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t border-stone-100 p-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span>${(totals.subtotal || 0).toFixed(2)}</span>
                </div>
                {totals.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Tax ({totals.tax_rate || 8}%)</span>
                    <span>${(totals.tax || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Shipping</span>
                  <span>{totals.shipping === 0 ? "FREE" : `$${(totals.shipping || 0).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span>${(totals.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-center text-[#7A8B69]">
                Use code WELCOME10 for 10% off!
              </p>

              {totals.subtotal < 50 && (
                <p className="text-xs text-center text-stone-500">
                  Add ${(50 - (totals.subtotal || 0)).toFixed(2)} more for FREE shipping!
                </p>
              )}

              <button
                onClick={handleCheckout}
                className="w-full btn-primary"
                data-testid="checkout-btn"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="block text-center text-xs text-stone-500 hover:text-stone-700 underline"
                data-testid="view-cart-link"
              >
                View Full Cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
