import { useEffect, useState, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CollectionPage from "./pages/CollectionPage";
import BundlesPage from "./pages/BundlesPage";
import CartPage from "./pages/CartPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import SciencePage from "./pages/SciencePage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Cart Context
export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

function App() {
  const [cart, setCart] = useState({ id: null, items: [] });
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize cart
  useEffect(() => {
    const initCart = async () => {
      let cartId = localStorage.getItem("pnice_cart_id");
      
      if (cartId) {
        try {
          const response = await axios.get(`${API}/cart/${cartId}`);
          setCart(response.data);
        } catch (e) {
          // Cart not found, create new
          const newCart = await axios.post(`${API}/cart`);
          setCart(newCart.data);
          localStorage.setItem("pnice_cart_id", newCart.data.id);
        }
      } else {
        const newCart = await axios.post(`${API}/cart`);
        setCart(newCart.data);
        localStorage.setItem("pnice_cart_id", newCart.data.id);
      }
    };

    const fetchData = async () => {
      try {
        const [productsRes, bundlesRes] = await Promise.all([
          axios.get(`${API}/products`),
          axios.get(`${API}/bundles`)
        ]);
        setProducts(productsRes.data);
        setBundles(bundlesRes.data);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
      setLoading(false);
    };

    initCart();
    fetchData();
  }, []);

  const addToCart = async (productId, quantity = 1, isSubscription = false) => {
    try {
      const response = await axios.post(`${API}/cart/${cart.id}/items`, {
        product_id: productId,
        quantity,
        is_subscription: isSubscription
      });
      setCart(prev => ({ ...prev, items: response.data.items }));
      setCartOpen(true);
    } catch (e) {
      console.error("Error adding to cart:", e);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await axios.put(`${API}/cart/${cart.id}/items/${productId}?quantity=${quantity}`);
      setCart(prev => ({ ...prev, items: response.data.items }));
    } catch (e) {
      console.error("Error updating cart:", e);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`${API}/cart/${cart.id}/items/${productId}`);
      setCart(prev => ({ ...prev, items: response.data.items }));
    } catch (e) {
      console.error("Error removing from cart:", e);
    }
  };

  const getCartTotals = async () => {
    try {
      const response = await axios.get(`${API}/cart/${cart.id}/totals`);
      return response.data;
    } catch (e) {
      console.error("Error getting totals:", e);
      return { subtotal: 0, shipping: 0, total: 0 };
    }
  };

  const getProductById = (id) => {
    return products.find(p => p.id === id) || bundles.find(b => b.id === id);
  };

  const cartItemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  const cartValue = {
    cart,
    cartOpen,
    setCartOpen,
    addToCart,
    updateCartItem,
    removeFromCart,
    getCartTotals,
    getProductById,
    cartItemCount,
    products,
    bundles
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-[#292524]">P-Nice</h1>
          <p className="text-[#78716c] mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <CartContext.Provider value={cartValue}>
      <div className="App min-h-screen bg-[#FFFCF8]">
        <BrowserRouter>
          <Header />
          <CartDrawer />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:slug" element={<ProductPage />} />
              <Route path="/collections/:collection" element={<CollectionPage />} />
              <Route path="/bundles" element={<BundlesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/science" element={<SciencePage />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </div>
    </CartContext.Provider>
  );
}

export default App;
