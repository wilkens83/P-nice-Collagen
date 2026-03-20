import { Link } from "react-router-dom";
import { useCart, API } from "../App";
import { useState, useEffect } from "react";
import { Plus, Minus, Trash2, ShoppingBag, Truck, Shield, Check, Tag, X } from "lucide-react";
import axios from "axios";

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, getProductById } = useCart();
  const [totals, setTotals] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [shippingForm, setShippingForm] = useState({
    first_name: "", last_name: "", address_line1: "", address_line2: "",
    city: "", state: "", zip_code: "", country: "US", phone: ""
  });

  // Load saved address from customer account if logged in
  useEffect(() => {
    const loadSavedAddress = async () => {
      const token = localStorage.getItem("pnice_customer_token");
      if (!token) return;
      try {
        const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.shipping_address) {
          setShippingForm(res.data.shipping_address);
        } else if (res.data.first_name) {
          setShippingForm(f => ({ ...f, first_name: res.data.first_name, last_name: res.data.last_name, phone: res.data.phone || "" }));
        }
      } catch { /* not logged in or error */ }
    };
    loadSavedAddress();
  }, []);

  useEffect(() => {
    const fetchTotals = async () => {
      if (cart.id && cart.items.length > 0) {
        try {
          let url = `${API}/cart/${cart.id}/totals`;
          if (appliedDiscount) {
            url += `?discount_code=${appliedDiscount.code}`;
          }
          const response = await axios.get(url);
          setTotals(response.data);
        } catch (e) {
          console.error("Error fetching totals:", e);
        }
      } else {
        setTotals({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
      }
    };
    fetchTotals();
  }, [cart, appliedDiscount]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setApplyingDiscount(true);
    setDiscountError("");
    
    try {
      const response = await axios.post(`${API}/discount/validate`, {
        cart_id: cart.id,
        discount_code: discountCode
      });
      setAppliedDiscount(response.data);
      setDiscountCode("");
    } catch (e) {
      setDiscountError(e.response?.data?.detail || "Invalid discount code");
    }
    setApplyingDiscount(false);
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
  };

  const handleCheckout = async () => {
    // Validate shipping fields
    setShippingError("");
    const required = ["first_name", "last_name", "address_line1", "city", "state", "zip_code", "phone"];
    const missing = required.filter(f => !shippingForm[f]?.trim());
    if (missing.length > 0) {
      setShippingError("Please fill in all required shipping fields including phone number.");
      return;
    }

    setCheckoutLoading(true);
    try {
      const payload = {
        cart_id: cart.id,
        origin_url: window.location.origin,
        shipping_address: shippingForm
      };
      if (appliedDiscount) {
        payload.discount_code = appliedDiscount.code;
      }
      const token = localStorage.getItem("pnice_customer_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      
      const response = await axios.post(`${API}/checkout/session`, payload, { headers });
      window.location.href = response.data.url;
    } catch (e) {
      console.error("Checkout error:", e);
      alert(e.response?.data?.detail || "Error starting checkout. Please try again.");
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
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-stone-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-stone-400">Image</span>
                      )}
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

              {/* Shipping Information */}
              <div className="mt-8 bg-white p-6 border border-stone-200" data-testid="shipping-form">
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={20} />
                  <h2 className="text-lg font-serif">Shipping Information</h2>
                </div>
                <p className="text-xs text-stone-500 mb-4">Address and phone number are mandatory for shipping.</p>
                
                {shippingError && <p className="text-red-500 text-sm mb-4" data-testid="shipping-error">{shippingError}</p>}

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="First Name *" value={shippingForm.first_name}
                      onChange={(e) => setShippingForm(f => ({ ...f, first_name: e.target.value }))}
                      className="px-3 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#292524]" data-testid="ship-first-name" />
                    <input type="text" placeholder="Last Name *" value={shippingForm.last_name}
                      onChange={(e) => setShippingForm(f => ({ ...f, last_name: e.target.value }))}
                      className="px-3 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#292524]" data-testid="ship-last-name" />
                  </div>
                  <input type="text" placeholder="Address Line 1 *" value={shippingForm.address_line1}
                    onChange={(e) => setShippingForm(f => ({ ...f, address_line1: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#292524]" data-testid="ship-address1" />
                  <input type="text" placeholder="Apt, suite, unit (optional)" value={shippingForm.address_line2}
                    onChange={(e) => setShippingForm(f => ({ ...f, address_line2: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#292524]" data-testid="ship-address2" />
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" placeholder="City *" value={shippingForm.city}
                      onChange={(e) => setShippingForm(f => ({ ...f, city: e.target.value }))}
                      className="px-3 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#292524]" data-testid="ship-city" />
                    <input type="text" placeholder="State *" value={shippingForm.state}
                      onChange={(e) => setShippingForm(f => ({ ...f, state: e.target.value }))}
                      className="px-3 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#292524]" data-testid="ship-state" />
                    <input type="text" placeholder="ZIP Code *" value={shippingForm.zip_code}
                      onChange={(e) => setShippingForm(f => ({ ...f, zip_code: e.target.value }))}
                      className="px-3 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#292524]" data-testid="ship-zip" />
                  </div>
                  <input type="tel" placeholder="Phone Number * (required for shipping)" value={shippingForm.phone}
                    onChange={(e) => setShippingForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#292524]" data-testid="ship-phone" />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#F5F0EB] p-6 sticky top-24">
                <h2 className="text-xl font-serif mb-6">Order Summary</h2>

                {/* Discount Code Input */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Discount Code</label>
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between p-3 bg-[#7A8B69]/10 border border-[#7A8B69] text-sm">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-[#7A8B69]" />
                        <span className="font-medium">{appliedDiscount.code}</span>
                        <span className="text-[#7A8B69]">-${appliedDiscount.discount_amount.toFixed(2)}</span>
                      </div>
                      <button onClick={removeDiscount} className="text-stone-500 hover:text-stone-700">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-stone-500"
                        data-testid="discount-code-input"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={applyingDiscount || !discountCode.trim()}
                        className="px-4 py-2 bg-[#292524] text-white text-sm uppercase tracking-wider hover:bg-stone-700 disabled:opacity-50"
                        data-testid="apply-discount-btn"
                      >
                        {applyingDiscount ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {discountError && (
                    <p className="text-red-500 text-xs mt-1">{discountError}</p>
                  )}
                  <p className="text-xs text-stone-500 mt-2">Try: WELCOME10, SAVE15, FIRST20</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal</span>
                    <span>${(totals.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {totals.discount_amount > 0 && (
                    <div className="flex justify-between text-[#7A8B69]">
                      <span>Discount ({totals.discount?.code})</span>
                      <span>-${(totals.discount_amount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-600">Shipping</span>
                    <span>{totals.shipping === 0 ? "FREE" : `$${(totals.shipping || 0).toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Tax ({totals.tax_rate || 8}%)</span>
                    <span>${(totals.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-stone-300 text-lg font-medium">
                    <span>Total</span>
                    <span>${(totals.total || 0).toFixed(2)}</span>
                  </div>
                </div>

                {(totals.subtotal_after_discount || totals.subtotal) < 50 && (
                  <div className="mt-4 p-3 bg-white border border-stone-200 text-sm">
                    <p className="text-[#7A8B69]">
                      Add ${(50 - (totals.subtotal_after_discount || totals.subtotal || 0)).toFixed(2)} more for FREE shipping!
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
