import { Link } from "react-router-dom";
import { useCart } from "../App";
import { useState } from "react";
import { Check, Truck, Shield, Leaf, FlaskConical, Star, ChevronDown, ChevronUp, Mail, Sparkles } from "lucide-react";
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

  // Ritual-based merchandising from SEO files
  const rituals = [
    { 
      name: "Morning Ritual", 
      description: "Elevate your coffee with collagen", 
      product: "Vanilla Creamer",
      slug: "vanilla-creamer",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600" 
    },
    { 
      name: "Daily Foundation", 
      description: "Your essential building block", 
      product: "Unflavored Collagen",
      slug: "unflavored-collagen",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600" 
    },
    { 
      name: "Beauty Treat", 
      description: "Indulgent wellness chocolate", 
      product: "Chocolate Collagen",
      slug: "chocolate-collagen",
      image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=600" 
    },
    { 
      name: "Night Repair", 
      description: "Restore while you rest", 
      product: "Sleep+ & Retinol",
      slug: "sleep-cream",
      image: "https://images.unsplash.com/photo-1552650272-b8a34e21bc4b?w=600" 
    },
  ];

  // Benefits section from SEO analysis
  const benefits = [
    { title: "Skin Elasticity", desc: "Restore your skin's youthful bounce and hydration from the inside out" },
    { title: "Hair & Nail Support", desc: "Rebuild thinning hair and strengthen brittle nails with daily collagen" },
    { title: "Joint Flexibility", desc: "Support joint health and tendon strength for active lifestyles" },
    { title: "Daily Ritual", desc: "Effortlessly integrates into coffee, smoothies, or water" },
  ];

  const faqs = [
    { q: "What types of collagen are in your products?", a: "Our collagen contains Types 1 and 3, which are the most critical forms for maintaining the health and structure of your skin, muscles, and bones." },
    { q: "How long until I see results?", a: "Most customers notice improvements in skin hydration within 4-8 weeks of consistent daily use. Hair and nail benefits may take 2-3 months." },
    { q: "Is your collagen keto/paleo friendly?", a: "Yes! Our collagen is sugar-free, carb-free, and fits most dietary lifestyles including keto, paleo, and Whole30." },
    { q: "What's your return policy?", a: "We offer a 30-day satisfaction guarantee. If you're not happy with your purchase, contact us for a full refund." },
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

  // Get collagen products (featured first)
  const collagenProducts = products.filter(p => p.category === "Daily Collagen");
  const skincareProducts = products.filter(p => p.category === "Skincare");

  return (
    <div data-testid="home-page">
      <SEO 
        title="Premium Grass-Fed Collagen Peptides & Night Repair Skincare"
        description="Glow from within with P-Nice premium grass-fed collagen peptides. Support radiant skin, thicker hair, and flexible joints with our daily collagen rituals. Types 1 & 3 collagen, made in USA."
        keywords="grass-fed collagen, collagen peptides, type 1 collagen, type 3 collagen, skin elasticity, hair growth, joint support, collagen powder, collagen creamer"
      />

      {/* Hero Section - Collagen First */}
      <section className="bg-[#F5F0EB]" data-testid="hero-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[85vh] py-16">
            <div className="order-2 md:order-1">
              <p className="text-sm uppercase tracking-widest text-[#7A8B69] mb-4">Premium Collagen Rituals</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-tight mb-6">
                Glow From <em className="italic">Within</em>
              </h1>
              <p className="text-lg md:text-xl text-stone-600 mb-4 max-w-lg">
                Your skin produces less collagen every year after 20. Bridge that gap with premium grass-fed collagen peptides.
              </p>
              <p className="text-stone-500 mb-8 max-w-lg">
                Types 1 & 3 hydrolyzed collagen for radiant skin, thicker hair, stronger nails, and flexible joints.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/collections/daily-collagen-rituals" className="btn-primary" data-testid="shop-collagen-btn">
                  Shop Collagen
                </Link>
                <Link to="/science" className="btn-secondary" data-testid="explore-rituals-btn">
                  Explore Rituals
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/5] bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center relative">
                <span className="text-stone-500">Hero Image</span>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4">
                  <p className="text-xs uppercase tracking-widest text-stone-500 mb-1">Hero Product</p>
                  <p className="font-serif text-lg">Grass-Fed Collagen Peptides</p>
                  <p className="text-sm text-[#7A8B69]">From $31.99/month with Subscribe & Save</p>
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

      {/* Featured Collagen Products - Primary Focus */}
      <section className="py-20 md:py-28" data-testid="featured-collagen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-[#7A8B69] mb-2">Daily Collagen Rituals</p>
            <h2 className="text-3xl md:text-5xl font-serif mb-4">The Foundation of Radiant Skin</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              Premium grass-fed collagen peptides that dissolve instantly into your daily routine
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {collagenProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 bg-white" data-testid="benefits-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-[#7A8B69] mb-4">Why Collagen?</p>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Unlock Elasticity From the Inside Out
              </h2>
              <p className="text-stone-600 mb-8">
                Your body produces less collagen every year after 20. Our hydrolyzed peptides are broken down for maximum absorption, delivering Types 1 & 3 collagen directly to where your body needs it most.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex gap-3">
                    <Check size={20} className="text-[#7A8B69] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">{benefit.title}</h3>
                      <p className="text-sm text-stone-500">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
              <span className="text-stone-400">Benefits Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ritual-Based Merchandising */}
      <section className="py-20 md:py-28 bg-[#F5F0EB]" data-testid="rituals-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-[#7A8B69] mb-2">Find Your Ritual</p>
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Collagen for Every Moment</h2>
            <p className="text-stone-500">Build your personalized beauty routine</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {rituals.map((ritual) => (
              <Link
                key={ritual.slug}
                to={`/products/${ritual.slug}`}
                className="group bg-white border border-stone-100 hover:border-stone-300 transition-all hover:shadow-lg"
                data-testid={`ritual-${ritual.slug}`}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={ritual.image} 
                    alt={ritual.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-widest text-[#7A8B69] mb-1">{ritual.name}</p>
                  <h3 className="font-serif text-lg mb-1">{ritual.product}</h3>
                  <p className="text-sm text-stone-500">{ritual.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle Section */}
      <section className="py-20 md:py-28" data-testid="bundles-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-[#7A8B69] mb-2">Save More</p>
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Build Your Ritual</h2>
            <p className="text-stone-500">Curated bundles for your complete collagen journey</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bundles.map((bundle) => (
              <Link
                key={bundle.id}
                to={`/bundles`}
                className="group bg-white border border-stone-100 hover:border-stone-300 transition-colors"
                data-testid={`bundle-${bundle.slug}`}
              >
                <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center relative">
                  <span className="text-stone-400">Bundle Image</span>
                  <span className="absolute top-3 right-3 bg-[#D4AF37] text-white text-xs px-2 py-1 font-medium">
                    Save ${bundle.savings.toFixed(0)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg mb-1">{bundle.name}</h3>
                  <p className="text-sm text-stone-500 mb-3">{bundle.tagline}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">${bundle.price.toFixed(2)}</span>
                    <span className="text-sm text-stone-400 line-through">${bundle.compare_at_price.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Night Repair Cross-Sell */}
      <section className="py-20 md:py-28 bg-[#292524] text-white" data-testid="night-repair-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Night Repair Collection</p>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Complete Your Routine with Overnight Recovery
              </h2>
              <p className="text-stone-400 mb-6">
                While you sleep, your skin enters its peak repair phase. Our night repair skincare works with your body's natural circadian rhythm to accelerate cellular renewal.
              </p>
              <div className="space-y-4 mb-8">
                {skincareProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="flex items-center gap-4 p-4 border border-stone-700 hover:border-stone-500 transition-colors"
                  >
                    <div className="w-16 h-16 bg-stone-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-stone-500">Img</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-stone-400">{product.tagline}</p>
                    </div>
                    <span className="text-[#D4AF37]">${product.price}</span>
                  </Link>
                ))}
              </div>
              <Link to="/collections/night-repair-skin-ritual" className="btn-primary bg-white text-[#292524] hover:bg-stone-200">
                Shop Night Repair
              </Link>
            </div>
            <div className="aspect-square bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center">
              <span className="text-stone-600">Night Repair Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Reviews */}
      <section className="py-20 md:py-28 bg-[#F5F0EB]" data-testid="reviews-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={24} className="fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            <p className="text-lg text-stone-600 mb-2">4.9 out of 5 based on 3,500+ reviews</p>
            <h2 className="text-3xl md:text-5xl font-serif">Real Results, Real People</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah M.", rating: 5, text: "I've been using the Unflavored Collagen for 3 months and my skin has never looked better. It dissolves perfectly in my morning coffee with zero taste!", product: "Grass-Fed Collagen Peptides", verified: true },
              { name: "Jennifer L.", rating: 5, text: "The Vanilla Creamer transformed my morning routine. My nails are stronger and my hair feels thicker. Plus it tastes amazing!", product: "Vanilla Collagen Creamer", verified: true },
              { name: "Amanda R.", rating: 5, text: "Sleep+ is incredible. I wake up with plump, hydrated skin every morning. The lavender scent is so calming before bed.", product: "Sleep+ Night Recovery Cream", verified: true },
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
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Join the P-Nice Ritual</h2>
          <p className="text-stone-400 mb-8">
            Subscribe for exclusive offers, skincare tips, and 10% off your first order.
          </p>
          {subscribed ? (
            <p className="text-[#7A8B69]">Thanks for subscribing! Check your inbox for your discount code.</p>
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
