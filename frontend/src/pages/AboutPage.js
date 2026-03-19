import { Link } from "react-router-dom";
import { Leaf, Shield, FlaskConical, Heart } from "lucide-react";

const AboutPage = () => {
  return (
    <div data-testid="about-page">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#F5F0EB]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif mb-6">Our Story</h1>
              <p className="text-lg text-stone-600 leading-relaxed">
                P-Nice was born from a simple belief: that everyone deserves access to premium wellness products that actually fit into their daily lives.
              </p>
            </div>
            <div className="aspect-[4/3] bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
              <span className="text-stone-500">Founder Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Our Mission</h2>
          <p className="text-lg text-stone-600 leading-relaxed mb-8">
            We're on a mission to make premium collagen accessible and enjoyable. We believe that consistency is key to real results, so we've created products that seamlessly integrate into the rituals you already love — your morning coffee, your evening skincare routine, your daily smoothie.
          </p>
          <p className="text-lg text-stone-600 leading-relaxed">
            No complicated regimens. No intimidating supplement routines. Just pure, effective collagen that works as hard as you do.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-[#292524] text-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">What We Stand For</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Leaf, title: "Clean Sourcing", desc: "All our collagen comes from grass-fed, pasture-raised bovine. No shortcuts, no compromises." },
              { icon: Shield, title: "Third-Party Tested", desc: "Every batch is tested for purity and potency. We believe in complete transparency." },
              { icon: FlaskConical, title: "Science-Backed", desc: "We formulate based on research, not trends. Every ingredient serves a purpose." },
              { icon: Heart, title: "Customer First", desc: "Your satisfaction is our priority. 30-day guarantee, no questions asked." },
            ].map((value, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-700 flex items-center justify-center">
                  <value.icon size={28} />
                </div>
                <h3 className="font-serif text-xl mb-2">{value.title}</h3>
                <p className="text-stone-400 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
              <span className="text-stone-400">Quality Image</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">Quality Standard</h2>
              <p className="text-stone-600 mb-6 leading-relaxed">
                We're obsessed with quality. From sourcing to packaging, every step of our process is designed to deliver the purest, most effective collagen products possible.
              </p>
              <ul className="space-y-4">
                {[
                  "Grass-fed, pasture-raised bovine collagen",
                  "Hydrolyzed for maximum bioavailability",
                  "No artificial colors, flavors, or sweeteners",
                  "Manufactured in FDA-registered facilities",
                  "Third-party tested for purity and potency",
                  "Sustainably sourced and packaged",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7A8B69] mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#F5F0EB]">
        <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Ready to Start Your Ritual?</h2>
          <p className="text-stone-600 mb-8">
            Join thousands of customers who've made P-Nice part of their daily routine.
          </p>
          <Link to="/collections/all" className="btn-primary" data-testid="about-shop-btn">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
