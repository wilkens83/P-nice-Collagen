import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#292524] text-white" data-testid="footer">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h2 className="text-3xl font-serif mb-4">P-Nice</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Premium collagen rituals for the way you live, glow, and recover.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-stone-400 hover:text-white transition-colors" data-testid="social-instagram">
                <Instagram size={20} />
              </a>
              <a href="mailto:hello@pnice.com" className="text-stone-400 hover:text-white transition-colors" data-testid="social-email">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold mb-4">Shop</h3>
            <ul className="space-y-3">
              <li><Link to="/collections/all" className="text-stone-400 hover:text-white text-sm transition-colors">All Products</Link></li>
              <li><Link to="/collections/daily-collagen-rituals" className="text-stone-400 hover:text-white text-sm transition-colors">Daily Collagen</Link></li>
              <li><Link to="/collections/night-repair-skin-ritual" className="text-stone-400 hover:text-white text-sm transition-colors">Night Repair</Link></li>
              <li><Link to="/bundles" className="text-stone-400 hover:text-white text-sm transition-colors">Bundles</Link></li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold mb-4">Learn</h3>
            <ul className="space-y-3">
              <li><Link to="/science" className="text-stone-400 hover:text-white text-sm transition-colors">Why Collagen</Link></li>
              <li><Link to="/about" className="text-stone-400 hover:text-white text-sm transition-colors">Our Story</Link></li>
              <li><Link to="/faq" className="text-stone-400 hover:text-white text-sm transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="mailto:support@pnice.com" className="text-stone-400 hover:text-white text-sm transition-colors">Contact Us</a></li>
              <li><span className="text-stone-400 text-sm">Shipping & Returns</span></li>
              <li><span className="text-stone-400 text-sm">Privacy Policy</span></li>
              <li><span className="text-stone-400 text-sm">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-xs">
            &copy; {new Date().getFullYear()} P-Nice. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-stone-500 text-xs">
            <span>Grass-Fed</span>
            <span>USA Made</span>
            <span>Third-Party Tested</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
