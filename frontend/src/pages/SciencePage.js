import { Link } from "react-router-dom";
import { FlaskConical, Sparkles, Activity, Clock, CheckCircle } from "lucide-react";

const SciencePage = () => {
  return (
    <div data-testid="science-page">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#F5F0EB]">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-6">The Science of Collagen</h1>
          <p className="text-lg text-stone-600">
            Understanding how collagen supports your body — and why supplementation matters.
          </p>
        </div>
      </section>

      {/* What is Collagen */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">What is Collagen?</h2>
              <p className="text-stone-600 mb-4 leading-relaxed">
                Collagen is the most abundant protein in your body, making up about 30% of your total protein content. Think of it as the "glue" that holds everything together — it provides structure and support to your skin, bones, muscles, tendons, and ligaments.
              </p>
              <p className="text-stone-600 mb-4 leading-relaxed">
                There are at least 28 different types of collagen, but Types I, II, and III make up 80-90% of the collagen in your body. Type I (found in skin, bones, and tendons) and Type III (found in skin and blood vessels) are the most relevant for beauty and wellness supplementation.
              </p>
              <p className="text-stone-600 leading-relaxed">
                As we age, our body's natural collagen production decreases by approximately 1% per year after age 20. This decline contributes to visible signs of aging like wrinkles, sagging skin, and joint stiffness.
              </p>
            </div>
            <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
              <span className="text-stone-400">Collagen Structure Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-[#292524] text-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">Research-Backed Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Skin Hydration & Elasticity",
                description: "Multiple studies suggest that oral collagen supplementation can improve skin hydration and elasticity. A systematic review found that collagen peptides may help reduce wrinkle depth and improve skin firmness when taken consistently.",
                note: "Results typically seen in 4-8 weeks of daily use"
              },
              {
                icon: Activity,
                title: "Joint & Connective Tissue",
                description: "Research indicates collagen supplementation may help support joint health and comfort, particularly in active individuals. Collagen provides essential amino acids that serve as building blocks for cartilage and connective tissue.",
                note: "Studies show benefits after 8-12 weeks"
              },
              {
                icon: Clock,
                title: "Hair & Nail Support",
                description: "Collagen contains amino acids that support keratin production, the protein that makes up hair and nails. Many users report stronger, faster-growing nails and improved hair texture with consistent collagen intake.",
                note: "Typically noticed in 2-3 months"
              }
            ].map((benefit, i) => (
              <div key={i} className="p-8 border border-stone-700">
                <div className="w-14 h-14 mb-6 rounded-full bg-stone-700 flex items-center justify-center">
                  <benefit.icon size={24} />
                </div>
                <h3 className="text-xl font-serif mb-3">{benefit.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-4">{benefit.description}</p>
                <p className="text-xs text-[#D4AF37]">{benefit.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hydrolyzed Collagen */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-serif mb-6 text-center">Why Hydrolyzed Collagen?</h2>
          <p className="text-stone-600 mb-8 text-center leading-relaxed">
            Not all collagen supplements are created equal. Here's why hydrolyzed collagen peptides are the gold standard.
          </p>
          
          <div className="space-y-6">
            {[
              {
                title: "Superior Absorption",
                description: "Hydrolyzed collagen has been broken down into smaller peptides (2-5 kDa molecular weight), making it significantly easier for your body to absorb compared to gelatin or whole collagen proteins."
              },
              {
                title: "Bioavailability",
                description: "Studies show that hydrolyzed collagen peptides are absorbed into the bloodstream and can be detected in the skin within hours of ingestion, with peak levels reached at around 4-12 hours."
              },
              {
                title: "Easy to Use",
                description: "Unlike gelatin, hydrolyzed collagen dissolves completely in both hot and cold liquids without clumping or gelling. This makes it effortless to add to your daily routine."
              },
              {
                title: "Tasteless & Odorless",
                description: "High-quality hydrolyzed collagen has no taste or smell, so you can add it to any beverage or food without altering the flavor."
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-[#F5F0EB]">
                <CheckCircle className="text-[#7A8B69] flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-stone-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="py-16 bg-[#F5F0EB]">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="p-8 border border-stone-300 bg-white">
            <h3 className="font-serif text-xl mb-4">A Note on Expectations</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              While research on collagen supplementation is promising, it's important to maintain realistic expectations. Collagen is not a miracle cure — it's a supportive supplement that works best as part of a healthy lifestyle that includes proper nutrition, hydration, sleep, and sun protection.
            </p>
            <p className="text-stone-600 text-sm leading-relaxed">
              Results vary by individual, and the best outcomes come from consistent, long-term use. These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
          <FlaskConical size={48} className="mx-auto text-stone-400 mb-6" />
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Ready to Try Premium Collagen?</h2>
          <p className="text-stone-600 mb-8">
            Experience the difference of grass-fed, hydrolyzed collagen peptides designed for your daily ritual.
          </p>
          <Link to="/collections/all" className="btn-primary" data-testid="science-shop-btn">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SciencePage;
