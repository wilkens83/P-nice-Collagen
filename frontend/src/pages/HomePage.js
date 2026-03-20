import { Link } from "react-router-dom";
import { useCart } from "../App";
import { useState } from "react";
import { Check, Truck, Shield, Leaf, FlaskConical, Star, ChevronDown, ChevronUp, Mail, Sparkles, Sun, Moon, Coffee } from "lucide-react";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import axios from "axios";
import { API } from "../App";

const HomePage = () => {
  const { products, bundles, addToCart } = useCart();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const trustItems = [
    { icon: Leaf, text: "100% Grass-Fed" },
    { icon: Shield, text: "Types 1 & 3 Collagen" },
    { icon: FlaskConical, text: "Hydrolyzed Peptides" },
    { icon: Truck, text: "Free Shipping $50+" },
    { icon: Check, text: "Made in USA" },
    { icon: Sparkles, text: "Subscribe & Save 20%" },
  ];

  const faqs = [
    { q: "What is The Polished Glow System?", a: "It's a complete collagen-powered beauty ritual designed to transform your skin from the inside out. From your morning coffee to your nighttime routine, each step works together to rebuild, nourish, and restore your natural glow." },
    { q: "How long until I see results?", a: "Most customers notice visibly smoother, more hydrated skin within 4-8 weeks of daily use. Hair and nail benefits typically appear within 2-3 months. The full system accelerates results." },
    { q: "Is your collagen keto/paleo friendly?", a: "Yes! Our collagen is sugar-free, carb-free, and fits most dietary lifestyles including keto, paleo, and Whole30." },
    { q: "Can I use the products individually?", a: "Absolutely. Each product delivers results on its own. But together as a system, they work synergistically for the most transformative results." },
    { q: "What's your return policy?", a: "We offer a 30-day satisfaction guarantee. If you're not happy with your results, contact us for a full refund." },
  ];

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/newsletter`, { email });
      setSubscribed(true);
      setEmail("");
    } catch (err) {
      console.error("Newsletter error:", err);
    }
  };

  const collagenProducts = products.filter(p => p.category === "Daily Collagen");
  const skincareProducts = products.filter(p => p.category === "Skincare");
  const heroProduct = products.find(p => p.id === "sleep-cream");

  return (
    <div data-testid="home-page">
      <SEO 
        title="The Polished Glow System | Rebuild Your Skin & Confidence"
        description="A complete collagen-powered beauty ritual. Rebuild radiant skin, stronger hair, and lasting confidence from within in 30 days. Premium grass-fed collagen peptides, Types 1 & 3."
        keywords="collagen system, beauty ritual, grass-fed collagen, skin transformation, collagen peptides, glow from within, polished wellness"
      />

      {/* Hero Section */}
      <section className="bg-[#F5F0EB]" data-testid="hero-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[85vh] py-16">
            <div className="order-2 md:order-1">
              <p className="text-sm uppercase tracking-widest text-[#7A8B69] mb-4">The Polished Glow System</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-tight mb-6">
                Rebuild Your Skin & Glow <em className="italic">From Within</em> in 30 Days
              </h1>
              <p className="text-lg md:text-xl text-stone-600 mb-4 max-w-lg">
                A complete collagen-powered ritual for stronger skin, healthier hair, and lasting confidence.
              </p>
              <p className="text-stone-500 mb-8 max-w-lg">
                Wake up feeling radiant. Look in the mirror and see smoother, firmer skin. Feel confident without makeup.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/bundles" className="btn-primary" data-testid="shop-system-btn">
                  Shop The Glow System
                </Link>
                <Link to="/collections/all" className="btn-secondary" data-testid="start-routine-btn">
                  Start Your Routine
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/5] bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center relative overflow-hidden">
                {heroProduct?.images?.[0] ? (
                  <img src={heroProduct.images[0]} alt="Deep Sleep Recovery Cream" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-stone-500">Hero Image</span>
                )}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4">
                  <p className="text-xs uppercase tracking-widest text-stone-500 mb-1">Hero Product</p>
                  <p className="font-serif text-lg">Deep Sleep Recovery Cream&trade;</p>
                  <p className="text-sm text-[#7A8B69]">From $39.99/month with Subscribe & Save</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-[#292524] text-white py-4 overflow-hidden" data-testid="trust-bar">
        <div className="flex gap-12 animate-pulse-none">
          <div className="flex gap-12 shrink-0 trust-bar-scroll">
            {[...trustItems, ...trustItems].map((item, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                <item.icon size={16} />
                <span className="text-xs uppercase tracking-widest">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Story Section */}
      <section className="py-20 md:py-28 bg-white" data-testid="story-section">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <p className="text-sm uppercase tracking-widest text-[#7A8B69] mb-6">Not Supplements. Not Skincare.</p>
          <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
            A Daily Transformation Ritual
          </h2>
          <p className="text-lg text-stone-600 mb-4 leading-relaxed">
            Wake up feeling radiant. Look in the mirror and see stronger, smoother skin. Feel confident without makeup.
          </p>
          <p className="text-stone-500 leading-relaxed">
            Your body produces less collagen every year after 20. The Polished Glow System rebuilds what time takes away &mdash; from your morning coffee to your nighttime routine, every step is designed to restore your skin, hair, and confidence.
          </p>
        </div>
      </section>

      {/* MORNING RITUAL Section */}
      <section className="py-20 md:py-28 bg-[#F5F0EB]" data-testid="morning-ritual">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Coffee size={20} className="text-[#D4AF37]" />
                <p className="text-sm uppercase tracking-widest text-[#D4AF37]">Morning Ritual</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Start Your Day Glowing From Within
              </h2>
              <p className="text-stone-600 mb-8">
                Transform your morning coffee into a beauty ritual. The foundation of radiant skin starts with your first sip.
              </p>
              <div className="space-y-4 mb-8">
                {collagenProducts.filter(p => p.id === "vanilla-creamer" || p.id === "unflavored-collagen").map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="flex items-center gap-4 p-4 bg-white border border-stone-200 hover:border-stone-400 transition-colors"
                  >
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-stone-100">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-stone-400 flex items-center justify-center h-full">Img</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-[#7A8B69] mb-0.5">{product.ritual}</p>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-stone-500">{product.tagline}</p>
                    </div>
                    <span className="font-medium">${product.price}</span>
                  </Link>
                ))}
              </div>
              <Link to="/bundles" className="btn-primary">
                Shop Morning Ritual
              </Link>
            </div>
            <div className="aspect-square overflow-hidden bg-stone-200">
              {collagenProducts.find(p => p.id === "vanilla-creamer")?.images?.[0] ? (
                <img src={collagenProducts.find(p => p.id === "vanilla-creamer").images[0]} alt="Morning Glow Creamer" className="w-full h-full object-cover" />
              ) : (
                <span className="text-stone-400 flex items-center justify-center h-full">Morning Ritual</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DAILY BEAUTY BOOST Section */}
      <section className="py-20 md:py-28 bg-white" data-testid="beauty-boost">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 aspect-square overflow-hidden bg-stone-200">
              {collagenProducts.find(p => p.id === "chocolate-collagen")?.images?.[0] ? (
                <img src={collagenProducts.find(p => p.id === "chocolate-collagen").images[0]} alt="Glow Treat Collagen" className="w-full h-full object-cover" />
              ) : (
                <span className="text-stone-400 flex items-center justify-center h-full">Beauty Indulgence</span>
              )}
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <Sun size={20} className="text-[#D4AF37]" />
                <p className="text-sm uppercase tracking-widest text-[#D4AF37]">Daily Beauty Boost</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Turn Beauty Into Pleasure
              </h2>
              <p className="text-stone-600 mb-6">
                Satisfy your chocolate cravings while rebuilding your skin. The most delicious beauty habit you'll ever have.
              </p>
              {collagenProducts.filter(p => p.id === "chocolate-collagen").map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="flex items-center gap-4 p-4 bg-[#F5F0EB] border border-stone-200 hover:border-stone-400 transition-colors mb-8"
                >
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-stone-100">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-stone-400 flex items-center justify-center h-full">Img</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-[#7A8B69] mb-0.5">{product.ritual}</p>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-stone-500">{product.tagline}</p>
                  </div>
                  <span className="font-medium">${product.price}</span>
                </Link>
              ))}
              <Link to="/products/chocolate-collagen" className="btn-primary">
                Shop Glow Treat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NIGHT RECOVERY Section */}
      <section className="py-20 md:py-28 bg-[#292524] text-white" data-testid="night-repair-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Moon size={20} className="text-[#D4AF37]" />
                <p className="text-xs uppercase tracking-widest text-[#D4AF37]">Night Recovery</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Repair While You Sleep
              </h2>
              <p className="text-stone-400 mb-6">
                Your skin enters its peak repair phase while you rest. Our night recovery duo works with your body's natural rhythm to accelerate cellular renewal &mdash; so you wake up looking radiant.
              </p>
              <div className="space-y-4 mb-8">
                {skincareProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="flex items-center gap-4 p-4 border border-stone-700 hover:border-stone-500 transition-colors"
                  >
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-stone-700">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-stone-500 flex items-center justify-center h-full">Img</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-[#D4AF37] mb-0.5">{product.ritual}</p>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-stone-400">{product.tagline}</p>
                    </div>
                    <span className="text-[#D4AF37]">${product.price}</span>
                  </Link>
                ))}
              </div>
              <Link to="/collections/all" className="btn-primary bg-white text-[#292524] hover:bg-stone-200">
                Shop Night Recovery
              </Link>
            </div>
            <div className="aspect-square overflow-hidden bg-gradient-to-br from-stone-700 to-stone-800">
              {skincareProducts[0]?.images?.[0] ? (
                <img src={skincareProducts[0].images[0]} alt="Night Recovery Collection" className="w-full h-full object-cover" />
              ) : (
                <span className="text-stone-600 flex items-center justify-center h-full">Night Repair</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section className="py-20 md:py-28" data-testid="bundles-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-[#7A8B69] mb-2">Save More, Glow More</p>
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Build Your Glow System</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Curated bundles designed for maximum transformation. The more steps you add, the faster the results.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundles.map((bundle) => (
              <Link
                key={bundle.id}
                to="/bundles"
                className="group bg-white border border-stone-100 hover:border-stone-300 transition-all hover:shadow-lg"
                data-testid={`bundle-${bundle.slug}`}
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#F5F0EB] to-stone-200 flex items-center justify-center relative p-6">
                  <div className="text-center">
                    <p className="font-serif text-xl mb-1">{bundle.name}</p>
                    <p className="text-xs text-stone-500">{bundle.products?.length || 0} products</p>
                  </div>
                  <span className="absolute top-3 right-3 bg-[#D4AF37] text-white text-xs px-2 py-1 font-medium">
                    Save ${bundle.savings?.toFixed(0)}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg mb-1">{bundle.name}</h3>
                  <p className="text-sm text-stone-500 mb-4">{bundle.tagline}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-medium">${bundle.price?.toFixed(2)}</span>
                    <span className="text-sm text-stone-400 line-through">${bundle.compare_at_price?.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 md:py-28 bg-[#F5F0EB]" data-testid="reviews-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={24} className="fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            <p className="text-lg text-stone-600 mb-2">4.9 out of 5 based on 3,500+ reviews</p>
            <h2 className="text-3xl md:text-5xl font-serif">Real Transformations</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah M.", rating: 5, text: "Three months into the Polished Collagen Base and I literally glow. My morning coffee ritual changed everything. I feel confident without makeup for the first time in years.", product: "Polished Collagen Base\u2122", verified: true },
              { name: "Jennifer L.", rating: 5, text: "The Morning Glow Creamer turned my coffee into something magical. My skin is smoother, my nails are stronger, and I actually look forward to mornings now.", product: "Morning Glow Creamer\u2122", verified: true },
              { name: "Rachel H.", rating: 5, text: "Deep Sleep Recovery Cream is pure luxury. I wake up with plump, radiant skin every morning. The lavender scent makes bedtime feel like a spa ritual.", product: "Deep Sleep Recovery Cream\u2122", verified: true },
            ].map((review, i) => (
              <div key={i} className="bg-white p-6 border border-stone-100">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14} className={s <= review.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-stone-200"} />
                  ))}
                </div>
                <p className="text-stone-600 mb-4 italic">"{review.text}"</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{review.name}</span>
                  {review.verified && <span className="text-[#7A8B69] flex items-center gap-1"><Check size={14} /> Verified</span>}
                </div>
                <p className="text-xs text-stone-400 mt-2">{review.product}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28" data-testid="faq-section">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-stone-200">
                <button
                  className="w-full flex justify-between items-center p-6 text-left"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  data-testid={`faq-${i}`}
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  {faqOpen === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-6 text-stone-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="text-sm uppercase tracking-widest underline hover:no-underline" data-testid="view-all-faq">
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 md:py-28 bg-[#292524] text-white" data-testid="newsletter-section">
        <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
          <Mail size={48} className="mx-auto mb-6 text-[#D4AF37]" />
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Join The Glow Ritual</h2>
          <p className="text-stone-400 mb-8">
            Subscribe for exclusive offers, beauty ritual tips, and 10% off your first order.
          </p>
          {subscribed ? (
            <p className="text-[#7A8B69]">Welcome to the ritual! Check your inbox for your discount code.</p>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 bg-white/10 border border-stone-600 text-white placeholder:text-stone-500 focus:outline-none focus:border-white"
                data-testid="newsletter-email"
              />
              <button type="submit" className="btn-primary bg-white text-[#292524] hover:bg-stone-200" data-testid="newsletter-submit">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Guarantee Bar */}
      <section className="py-8 border-t border-stone-200" data-testid="guarantee-bar">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div>
              <Shield size={24} className="mx-auto mb-2 text-stone-400" />
              <p className="text-xs uppercase tracking-widest">30-Day Guarantee</p>
            </div>
            <div>
              <Truck size={24} className="mx-auto mb-2 text-stone-400" />
              <p className="text-xs uppercase tracking-widest">Free Shipping $50+</p>
            </div>
            <div>
              <Check size={24} className="mx-auto mb-2 text-stone-400" />
              <p className="text-xs uppercase tracking-widest">Secure Checkout</p>
            </div>
            <div>
              <Leaf size={24} className="mx-auto mb-2 text-stone-400" />
              <p className="text-xs uppercase tracking-widest">100% Grass-Fed</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
