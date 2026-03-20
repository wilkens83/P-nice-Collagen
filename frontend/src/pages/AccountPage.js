import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../App";
import axios from "axios";
import { User, MapPin, ShoppingBag, LogOut, Pencil, Check, Package } from "lucide-react";

const getToken = () => localStorage.getItem("pnice_customer_token");
const setToken = (t) => localStorage.setItem("pnice_customer_token", t);
const clearToken = () => localStorage.removeItem("pnice_customer_token");

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
    } catch {
      clearToken();
    }
    setLoading(false);
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    navigate("/");
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><p>Loading...</p></div>;
  if (!user) return <AuthForms onSuccess={(u) => setUser(u)} />;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "address", label: "Shipping Address", icon: MapPin },
    { id: "orders", label: "Order History", icon: ShoppingBag },
  ];

  return (
    <div data-testid="account-page" className="py-12">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif">My Account</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
            data-testid="account-logout-btn"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <aside className="space-y-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  activeTab === t.id ? "bg-[#292524] text-white" : "hover:bg-stone-100 text-stone-700"
                }`}
                data-testid={`account-tab-${t.id}`}
              >
                <t.icon size={18} /> {t.label}
              </button>
            ))}
          </aside>

          <div className="md:col-span-3">
            {activeTab === "profile" && <ProfileSection user={user} onUpdate={checkAuth} />}
            {activeTab === "address" && <AddressSection user={user} onUpdate={checkAuth} />}
            {activeTab === "orders" && <OrdersSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Auth Forms (Login / Register)
const AuthForms = ({ onSuccess }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : form;

      const res = await axios.post(`${API}${endpoint}`, payload);
      setToken(res.data.token);
      onSuccess(res.data.customer);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12" data-testid="auth-forms">
      <div className="w-full max-w-md px-6">
        <h1 className="text-3xl font-serif text-center mb-2">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-stone-500 text-center mb-8">
          {mode === "login" ? "Sign in to manage your orders and profile" : "Join P-Nice for a personalized experience"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]"
                  data-testid="register-first-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]"
                  data-testid="register-last-name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]"
              data-testid="auth-email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]"
              data-testid="auth-password"
            />
          </div>

          {error && <p className="text-red-500 text-sm" data-testid="auth-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
            data-testid="auth-submit-btn"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="underline text-[#292524] font-medium hover:no-underline"
            data-testid="auth-toggle-mode"
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

// Profile Section
const ProfileSection = ({ user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/auth/profile`, form, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setEditing(false);
      onUpdate();
    } catch (err) {
      alert("Error updating profile");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 border border-stone-100" data-testid="profile-section">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif">Personal Information</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800" data-testid="edit-profile-btn">
            <Pencil size={14} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input type="text" value={form.first_name} onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))}
                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="profile-first-name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" value={form.last_name} onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))}
                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="profile-last-name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="profile-phone" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#292524] text-white hover:bg-stone-700 disabled:opacity-50" data-testid="save-profile-btn">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={() => setEditing(false)} className="px-6 py-2 border border-stone-300 hover:bg-stone-50">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">First Name</p>
              <p className="font-medium">{user.first_name}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Last Name</p>
              <p className="font-medium">{user.last_name}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Phone</p>
            <p className="font-medium">{user.phone || "Not set"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Address Section
const AddressSection = ({ user, onUpdate }) => {
  const addr = user.shipping_address;
  const [editing, setEditing] = useState(!addr);
  const [form, setForm] = useState({
    first_name: addr?.first_name || user.first_name || "",
    last_name: addr?.last_name || user.last_name || "",
    address_line1: addr?.address_line1 || "",
    address_line2: addr?.address_line2 || "",
    city: addr?.city || "",
    state: addr?.state || "",
    zip_code: addr?.zip_code || "",
    country: addr?.country || "US",
    phone: addr?.phone || user.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.address_line1 || !form.city || !form.state || !form.zip_code || !form.phone) {
      alert("Please fill in all required fields (address, city, state, zip, phone)");
      return;
    }
    setSaving(true);
    try {
      await axios.put(`${API}/auth/address`, form, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setEditing(false);
      onUpdate();
    } catch (err) {
      alert("Error saving address");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 border border-stone-100" data-testid="address-section">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif">Shipping Address</h2>
        {!editing && addr && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800" data-testid="edit-address-btn">
            <Pencil size={14} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input type="text" value={form.first_name} onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))} required
                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="addr-first-name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input type="text" value={form.last_name} onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))} required
                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="addr-last-name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
            <input type="text" value={form.address_line1} onChange={(e) => setForm(f => ({ ...f, address_line1: e.target.value }))} required
              placeholder="Street address" className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="addr-line1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address Line 2</label>
            <input type="text" value={form.address_line2} onChange={(e) => setForm(f => ({ ...f, address_line2: e.target.value }))}
              placeholder="Apt, suite, unit (optional)" className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="addr-line2" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input type="text" value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} required
                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="addr-city" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State *</label>
              <input type="text" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} required
                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="addr-state" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP Code *</label>
              <input type="text" value={form.zip_code} onChange={(e) => setForm(f => ({ ...f, zip_code: e.target.value }))} required
                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="addr-zip" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number * (required for shipping)</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} required
              placeholder="555-123-4567" className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-[#292524]" data-testid="addr-phone" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#292524] text-white hover:bg-stone-700 disabled:opacity-50" data-testid="save-address-btn">
              {saving ? "Saving..." : "Save Address"}
            </button>
            {addr && <button onClick={() => setEditing(false)} className="px-6 py-2 border border-stone-300 hover:bg-stone-50">Cancel</button>}
          </div>
        </div>
      ) : addr ? (
        <div className="space-y-1 text-sm" data-testid="saved-address">
          <p className="font-medium">{addr.first_name} {addr.last_name}</p>
          <p>{addr.address_line1}</p>
          {addr.address_line2 && <p>{addr.address_line2}</p>}
          <p>{addr.city}, {addr.state} {addr.zip_code}</p>
          <p>{addr.country}</p>
          <p className="text-stone-500 mt-2">Phone: {addr.phone}</p>
        </div>
      ) : (
        <p className="text-stone-500">No address saved yet.</p>
      )}
    </div>
  );
};

// Orders Section
const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/auth/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 border border-stone-100" data-testid="orders-section">
      <h2 className="text-xl font-serif mb-6">Order History</h2>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/collections/all" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-stone-100 p-4" data-testid={`order-${order.id}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-xs text-stone-400">Order #{order.session_id?.slice(0, 16)}</p>
                  <p className="font-medium text-lg mt-1">${order.amount?.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.payment_status}
                  </span>
                  <p className="text-xs text-stone-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {order.shipping_address && (
                <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
                  <p>Shipped to: {order.shipping_address.first_name} {order.shipping_address.last_name},
                  {" "}{order.shipping_address.city}, {order.shipping_address.state}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountPage;
