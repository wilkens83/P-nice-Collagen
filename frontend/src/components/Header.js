import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X, ChevronDown, User } from "lucide-react";
import { useCart } from "../App";

const Header = () => {
  const { setCartOpen, cartItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("pnice_customer_token");

  const shopLinks = [
    { name: "All Products", href: "/collections/all" },
    { name: "Daily Collagen", href: "/collections/daily-collagen-rituals" },
    { name: "Night Repair", href: "/collections/night-repair-skin-ritual" },
    { name: "Bundles", href: "/bundles" },
  ];

  const learnLinks = [
    { name: "Why Collagen", href: "/science" },
    { name: "FAQ", href: "/faq" },
    { name: "Our Story", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-stone-100" data-testid="header">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0" data-testid="logo-link">
            <img 
              src="https://customer-assets.emergentagent.com/job_polished-wellness/artifacts/cs2qfijw_Gemini_Generated_Image_5r0re05r0re05r0r.png" 
              alt="P-nice" 
              style={{ width: 200, height: 200 }}
              className="object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {/* Shop Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShopDropdownOpen(true)}
              onMouseLeave={() => setShopDropdownOpen(false)}
            >
              <button 
                className="flex items-center gap-1 text-sm uppercase tracking-widest font-medium hover:text-stone-500 transition-colors"
                data-testid="shop-dropdown-btn"
              >
                Shop <ChevronDown size={14} />
              </button>
              {shopDropdownOpen && (
                <div className="absolute top-full left-0 bg-white border border-stone-100 shadow-lg py-2 min-w-[180px]">
                  {shopLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="block px-4 py-2 text-sm hover:bg-stone-50 transition-colors"
                      data-testid={`shop-link-${link.name.toLowerCase().replace(' ', '-')}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Learn Links */}
            {learnLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm uppercase tracking-widest font-medium hover:text-stone-500 transition-colors"
                data-testid={`nav-link-${link.name.toLowerCase().replace(' ', '-')}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Account & Cart */}
          <div className="flex items-center gap-2">
            <Link
              to="/account"
              className="relative p-2 hover:text-stone-500 transition-colors"
              data-testid="account-link"
              title={isLoggedIn ? "My Account" : "Sign In"}
            >
              <User size={22} />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2"
              data-testid="cart-btn"
            >
              <ShoppingBag size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#292524] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 py-4" data-testid="mobile-menu">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Shop</p>
                {shopLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block py-2 text-sm hover:text-stone-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Learn</p>
                {learnLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block py-2 text-sm hover:text-stone-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
