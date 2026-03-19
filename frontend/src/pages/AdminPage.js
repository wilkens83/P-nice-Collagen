import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../App";
import axios from "axios";
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Image, 
  LogOut, Plus, Pencil, Trash2, Upload, X, Check, Eye,
  DollarSign, TrendingUp, Mail
} from "lucide-react";

// Admin Auth Context
const getAdminToken = () => localStorage.getItem("pnice_admin_token");
const setAdminToken = (token) => localStorage.setItem("pnice_admin_token", token);
const clearAdminToken = () => localStorage.removeItem("pnice_admin_token");

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    const token = getAdminToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      await axios.get(`${API}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsLoggedIn(true);
    } catch {
      clearAdminToken();
    }
    setLoading(false);
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex" data-testid="admin-dashboard">
      {/* Sidebar */}
      <aside className="w-64 bg-[#292524] text-white flex flex-col">
        <div className="p-6 border-b border-stone-700">
          <h1 className="text-xl font-serif">P-Nice Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "products", label: "Products", icon: Package },
            { id: "orders", label: "Orders", icon: ShoppingCart },
            { id: "customers", label: "Customers", icon: Users },
            { id: "media", label: "Media Library", icon: Image },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                activeTab === item.id ? "bg-stone-700" : "hover:bg-stone-800"
              }`}
              data-testid={`admin-nav-${item.id}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-700">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-2 text-stone-400 hover:text-white transition-colors mb-2"
          >
            <Eye size={20} />
            <span>View Store</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-stone-400 hover:text-white transition-colors"
            data-testid="admin-logout"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "customers" && <CustomersTab />}
        {activeTab === "media" && <MediaTab />}
      </main>
    </div>
  );
};

// Login Component
const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/admin/login`, { username, password });
      setAdminToken(response.data.token);
      onLogin();
    } catch (err) {
      setError("Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#292524] flex items-center justify-center" data-testid="admin-login">
      <div className="bg-white p-8 w-full max-w-md">
        <h1 className="text-2xl font-serif mb-6 text-center">P-Nice Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
              data-testid="admin-username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
              data-testid="admin-password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#292524] text-white py-3 uppercase tracking-wider text-sm hover:bg-stone-700 disabled:opacity-50"
            data-testid="admin-login-btn"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-xs text-stone-500 mt-4 text-center">
          Default: admin / pnice2024
        </p>
      </div>
    </div>
  );
};

// Dashboard Tab
const DashboardTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div data-testid="dashboard-tab">
      <h2 className="text-2xl font-serif mb-6">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500">Products</p>
              <p className="text-2xl font-bold">{stats?.total_products || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500">Revenue</p>
              <p className="text-2xl font-bold">${stats?.total_revenue || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <ShoppingCart className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500">Orders</p>
              <p className="text-2xl font-bold">{stats?.total_orders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Mail className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500">Subscribers</p>
              <p className="text-2xl font-bold">{stats?.total_subscribers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded shadow-sm">
        <h3 className="font-medium mb-4">Recent Orders</h3>
        {stats?.recent_orders?.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Order ID</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders.map((order) => (
                <tr key={order.session_id} className="border-b">
                  <td className="py-2 font-mono text-xs">{order.session_id?.slice(0, 20)}...</td>
                  <td className="py-2">${order.amount?.toFixed(2)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-2 text-stone-500">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-stone-500">No orders yet</p>
        )}
      </div>
    </div>
  );
};

// Products Tab
const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      });
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
    setLoading(false);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      });
      fetchProducts();
    } catch (err) {
      alert("Error deleting product");
    }
  };

  return (
    <div data-testid="products-tab">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">Products</h2>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-[#292524] text-white px-4 py-2 hover:bg-stone-700"
          data-testid="add-product-btn"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSave={() => { setShowForm(false); setEditingProduct(null); fetchProducts(); }}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left p-4">Image</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="p-4">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-12 h-12 object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-stone-200 flex items-center justify-center text-xs text-stone-400">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">${product.price?.toFixed(2)}</td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.in_stock !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {product.in_stock !== false ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingProduct(product); setShowForm(true); }}
                        className="p-2 hover:bg-stone-100 rounded"
                        data-testid={`edit-${product.id}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded"
                        data-testid={`delete-${product.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Product Form
const ProductForm = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    tagline: product?.tagline || "",
    description: product?.description || "",
    price: product?.price || "",
    compare_at_price: product?.compare_at_price || "",
    subscription_price: product?.subscription_price || "",
    category: product?.category || "Daily Collagen",
    collection: product?.collection || "Daily Collagen Rituals",
    ritual: product?.ritual || "Morning Glow",
    images: product?.images || [],
    benefits: product?.benefits?.join("\n") || "",
    ingredients: product?.ingredients?.join("\n") || "",
    how_to_use: product?.how_to_use || "",
    pairs_with: product?.pairs_with?.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === "name" && !product) {
      setFormData((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    const newImages = [...formData.images];

    for (const file of files) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      try {
        const response = await axios.post(`${API}/admin/upload`, formDataUpload, {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "multipart/form-data"
          }
        });
        newImages.push(response.data.url);
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setFormData((prev) => ({ ...prev, images: newImages }));
    setUploading(false);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      subscription_price: formData.subscription_price ? parseFloat(formData.subscription_price) : null,
      benefits: formData.benefits.split("\n").filter(Boolean),
      ingredients: formData.ingredients.split("\n").filter(Boolean),
      pairs_with: formData.pairs_with.split(",").map(s => s.trim()).filter(Boolean),
    };

    try {
      if (product) {
        await axios.put(`${API}/admin/products/${product.id}`, payload, {
          headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
      } else {
        await axios.post(`${API}/admin/products`, payload, {
          headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
      }
      onSave();
    } catch (err) {
      alert(err.response?.data?.detail || "Error saving product");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h3 className="text-xl font-serif">{product ? "Edit Product" : "Add New Product"}</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Images</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {formData.images.map((img, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={img.startsWith("/") ? `${process.env.REACT_APP_BACKEND_URL}${img}` : img} alt="" className="w-full h-full object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-stone-300 flex items-center justify-center cursor-pointer hover:border-stone-400">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploading ? "..." : <Upload size={24} className="text-stone-400" />}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                disabled={!!product}
                className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500 disabled:bg-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                required
                className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare At Price</label>
              <input
                type="number"
                name="compare_at_price"
                value={formData.compare_at_price}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subscription Price</label>
              <input
                type="number"
                name="subscription_price"
                value={formData.subscription_price}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
              >
                <option>Daily Collagen</option>
                <option>Skincare</option>
                <option>Bundles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Collection</label>
              <select
                name="collection"
                value={formData.collection}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
              >
                <option>Daily Collagen Rituals</option>
                <option>Night Repair & Skin Ritual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ritual</label>
              <select
                name="ritual"
                value={formData.ritual}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
              >
                <option>Morning Glow</option>
                <option>Daily Beauty</option>
                <option>Night Repair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Benefits (one per line)</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              rows={3}
              placeholder="Supports skin hydration&#10;Promotes healthy hair"
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ingredients (one per line)</label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">How to Use</label>
            <textarea
              name="how_to_use"
              value={formData.how_to_use}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:border-stone-500"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-stone-300 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#292524] text-white hover:bg-stone-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : product ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Orders Tab
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      });
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
    setLoading(false);
  };

  return (
    <div data-testid="orders-tab">
      <h2 className="text-2xl font-serif mb-6">Orders</h2>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 text-center rounded shadow-sm">
          <ShoppingCart size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500">No orders yet</p>
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left p-4">Order ID</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Discount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-4 font-mono text-xs">{order.session_id?.slice(0, 25)}...</td>
                  <td className="p-4 font-medium">${order.amount?.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.payment_status === "paid" ? "bg-green-100 text-green-700" :
                      order.payment_status === "initiated" ? "bg-yellow-100 text-yellow-700" :
                      "bg-stone-100 text-stone-700"
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-stone-500">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="p-4">{order.metadata?.discount_code || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Customers Tab
const CustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/admin/customers`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      });
      setCustomers(response.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
    setLoading(false);
  };

  return (
    <div data-testid="customers-tab">
      <h2 className="text-2xl font-serif mb-6">Customers</h2>

      {loading ? (
        <p>Loading...</p>
      ) : customers.length === 0 ? (
        <div className="bg-white p-8 text-center rounded shadow-sm">
          <Users size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500">No customers yet</p>
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Source</th>
                <th className="text-left p-4">Orders</th>
                <th className="text-left p-4">Total Spent</th>
                <th className="text-left p-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, i) => (
                <tr key={i} className="border-t">
                  <td className="p-4 font-medium">{customer.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      customer.source === "newsletter" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {customer.source}
                    </span>
                  </td>
                  <td className="p-4">{customer.total_orders}</td>
                  <td className="p-4">${customer.total_spent?.toFixed(2) || "0.00"}</td>
                  <td className="p-4 text-stone-500">
                    {customer.subscribed_at ? new Date(customer.subscribed_at).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Media Tab
const MediaTab = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await axios.get(`${API}/admin/uploads`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      });
      setUploads(response.data);
    } catch (err) {
      console.error("Error fetching uploads:", err);
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        await axios.post(`${API}/admin/upload`, formData, {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
            "Content-Type": "multipart/form-data"
          }
        });
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setUploading(false);
    fetchUploads();
  };

  const handleDelete = async (filename) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      await axios.delete(`${API}/admin/uploads/${filename}`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      });
      fetchUploads();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const copyUrl = (url) => {
    const fullUrl = `${process.env.REACT_APP_BACKEND_URL}${url}`;
    navigator.clipboard.writeText(fullUrl);
    alert("URL copied to clipboard!");
  };

  return (
    <div data-testid="media-tab">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">Media Library</h2>
        <label className="flex items-center gap-2 bg-[#292524] text-white px-4 py-2 cursor-pointer hover:bg-stone-700">
          <Upload size={20} />
          {uploading ? "Uploading..." : "Upload Images"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : uploads.length === 0 ? (
        <div className="bg-white p-8 text-center rounded shadow-sm">
          <Image size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500">No images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {uploads.map((upload) => (
            <div key={upload.filename} className="bg-white rounded shadow-sm overflow-hidden group">
              <div className="aspect-square relative">
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}${upload.url}`}
                  alt={upload.original_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(upload.url)}
                    className="p-2 bg-white rounded hover:bg-stone-100"
                    title="Copy URL"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(upload.filename)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-stone-500 truncate">{upload.original_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
