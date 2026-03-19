import { Link } from "react-router-dom";
import { useCart } from "../App";
import { useState } from "react";
import { Check, Truck, Shield, Leaf, FlaskConical, Star, ChevronDown, ChevronUp, Mail } from "lucide-react";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { API } from "../App";

const HomePage = () => {
  const { products, bundles, addToCart } = useCart();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const trustItems = [
    { icon: Leaf, text: "Grass-Fed & Pasture-Raised" },
    { icon: Shield, text: "Third-Party Tested" },
    { icon: FlaskConical, text: "Premium Quality" },
    { icon: Truck, text: "Free Shipping $50+" },
    { icon: Check, text: "USA Made" },
    { icon: Check, text: "Subscribe & Save 20%" },
  ];

  const rituals = [
    { name: "Morning Glow", description: "Start your day radiant", slug: "morning-glow", image: "https://images.unsplash.com/photo-1713201744207-3afbef9f723c?w=600" },
    { name: "Daily Beauty", description: "Consistent collagen support", slug: "daily-beauty", image: "https://images.unsplash.com/photo-1669998761789-cc7ebf86e15f?w=600" },
    { name: "Night Repair", description: "Restore while you rest", slug: "night-repair", image: "https://images.unsplash.com/photo-1552650272-b8a34e21bc4b?w=600" },
  ];

  const faqs = [
    { q: "What is collagen and why do I need it?", a: "Collagen is the most abundant protein in your body, supporting skin, hair, nails, and joints. As we age, our natural collagen production decreases. Supplementing can help support these areas." },
    { q: "When will I see results?", a: "Most customers notice improvements in skin hydration within 4-8 weeks of consistent daily use. Hair and nail benefits may take 2-3 months." },
    { q: "Is P-Nice collagen keto/paleo friendly?", a: "Yes! Our collagen peptides are sugar-free, carb-free, and fit most dietary lifestyles including keto, paleo, and Whole30." },
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

  const bestSellers = products.slice(0, 4);

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="bg-[#F5F0EB]" data-testid="hero-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[80vh] py-16">
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-tight mb-6">
                Collagen for the way you <em className="italic">live, glow,</em> and recover.
              </h1>
              <p className="text-lg text-stone-600 mb-8 max-w-lg">
                Premium daily collagen rituals for skin, hair, nails, joints, and beauty-focused wellness.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/collections/all" className="btn-primary" data-testid="shop-best-sellers-btn">
                  Shop Best Sellers
                </Link>
                <Link to="/science" className="btn-secondary" data-testid="learn-more-btn">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/5] bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                <span className="text-stone-500">Hero Image</span>
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

      {/* Shop by Ritual */}
      <section className="py-20 md:py-28" data-testid="shop-by-ritual">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Shop by Ritual</h2>
            <p className="text-stone-500">Find your perfect collagen routine</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {rituals.map((ritual) => (
              <Link
                key={ritual.slug}
                to={`/collections/${ritual.slug}`}
                className="group relative aspect-[3/4] overflow-hidden"
                data-testid={`ritual-${ritual.slug}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-stone-300 to-stone-400">
                  <img 
                    src={ritual.image} 
                    alt={ritual.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-serif mb-1">{ritual.name}</h3>
                  <p className="text-sm text-white/80">{ritual.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 md:py-28 bg-[#F5F0EB]" data-testid="best-sellers">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-2">Best Sellers</h2>
              <p className="text-stone-500">Customer favorites loved by thousands</p>
            </div>
            <Link to="/collections/all" className="hidden md:block text-sm uppercase tracking-widest underline hover:no-underline" data-testid="view-all-products">
              View All
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/collections/all" className="btn-secondary">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 md:py-28" data-testid="brand-story">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
              <span className="text-stone-500">Brand Image</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-6">
                Made for the customer who wants to look <em className="italic">polished</em>, feel restored, and stay consistent.
              </h2>
              <p className="text-stone-600 mb-6 leading-relaxed">
                At P-Nice, we believe true beauty comes from consistent, intentional rituals. Our premium collagen products are designed to seamlessly fit into your daily routine — whether you're upgrading your morning coffee or winding down with a luxurious night cream.
              </p>
              <p className="text-stone-600 mb-8 leading-relaxed">
                Every product is grass-fed, third-party tested, and crafted with the highest quality ingredients. Because you deserve better than basic.
              </p>
              <Link to="/about" className="btn-secondary" data-testid="our-story-btn">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Collagen */}
      <section className="py-20 md:py-28 bg-[#292524] text-white" data-testid="why-collagen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Why Collagen?</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">
              Understanding the science behind your daily ritual
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Skin Hydration & Elasticity", desc: "Collagen supports skin hydration and may help maintain skin elasticity over time with consistent use." },
              { title: "Joint & Connective Tissue", desc: "Support your joints and connective tissues with daily collagen peptides — ideal for active lifestyles." },
              { title: "Routine Consistency Matters", desc: "The best results come from daily use. Our products make it easy to stay consistent." },
            ].map((item, i) => (
              <div key={i} className="text-center p-8 border border-stone-700">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-stone-700 flex items-center justify-center">
                  <FlaskConical size={28} />
                </div>
                <h3 className="text-xl font-serif mb-3">{item.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/science" className="text-sm uppercase tracking-widest underline hover:no-underline" data-testid="learn-science-btn">
              Explore the Science
            </Link>
          </div>
        </div>
      </section>

      {/* Bundles */}
      <section className="py-20 md:py-28" data-testid="bundles-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Build Your Ritual</h2>
            <p className="text-stone-500">Save more when you bundle your favorites</p>
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

      {/* Reviews / Social Proof */}
      <section className="py-20 md:py-28 bg-[#F5F0EB]" data-testid="reviews-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={24} className="fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            <p className="text-lg text-stone-600 mb-2">4.9 out of 5 based on 3,500+ reviews</p>
            <h2 className="text-3xl md:text-5xl font-serif">Loved by Thousands</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah M.", rating: 5, text: "I've been using the Unflavored Collagen for 3 months and my skin has never looked better. It dissolves perfectly in my morning coffee!", product: "Unflavored Collagen" },
              { name: "Jennifer L.", rating: 5, text: "The Vanilla Creamer has become my morning must-have. Great taste and my nails are so much stronger!", product: "Vanilla Creamer" },
              { name: "Amanda R.", rating: 5, text: "The Sleep Plus Cream is incredible. I wake up with such hydrated, soft skin. The lavender scent is so calming.", product: "Sleep Plus Cream" },
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
                  <span className="text-stone-400">Verified Buyer</span>
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
