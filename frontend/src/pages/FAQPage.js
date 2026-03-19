import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqCategories = [
    {
      name: "Products & Ingredients",
      questions: [
        { q: "What is collagen and why should I take it?", a: "Collagen is the most abundant protein in your body, making up about 30% of your total protein. It provides structure to skin, bones, tendons, and ligaments. As we age, our natural collagen production decreases by about 1% per year after age 20. Supplementing with collagen peptides can help support skin hydration, joint health, and overall wellness." },
        { q: "Where does your collagen come from?", a: "All our collagen comes from grass-fed, pasture-raised bovine (cattle) from Brazil and Argentina. We use only the hides, which are a byproduct of the meat industry, making our collagen a sustainable choice." },
        { q: "What types of collagen are in your products?", a: "Our collagen peptides contain Types I and III collagen, which are the most abundant types in the human body. Type I is primarily found in skin, bones, and tendons, while Type III is found in skin and blood vessels." },
        { q: "Are your products third-party tested?", a: "Yes! Every batch of our products is tested by independent labs for purity, potency, and contaminants. We test for heavy metals, pesticides, and microbiological contaminants to ensure you're getting the purest product possible." },
        { q: "Are your products keto/paleo/Whole30 friendly?", a: "Yes! Our unflavored collagen peptides are sugar-free, carb-free, and fit most dietary lifestyles including keto, paleo, and Whole30. Our flavored products contain minimal ingredients and are also suitable for most diets." },
      ]
    },
    {
      name: "Usage & Results",
      questions: [
        { q: "How much collagen should I take daily?", a: "We recommend one scoop (10g) daily for best results. This provides a clinically-studied dose of collagen peptides. You can take more if desired, but consistency with a daily serving is more important than taking larger occasional doses." },
        { q: "When will I see results?", a: "Most customers notice improvements in skin hydration within 4-8 weeks of consistent daily use. Hair and nail benefits may take 2-3 months. Joint comfort improvements are typically noticed within 8-12 weeks. Remember, consistency is key!" },
        { q: "Can I take collagen while pregnant or nursing?", a: "While collagen is generally considered safe, we always recommend consulting with your healthcare provider before starting any new supplement during pregnancy or while nursing." },
        { q: "Does collagen break a fast?", a: "Technically, yes. Collagen contains protein and calories, so it would break a strict fast. However, some intermittent fasting protocols allow for small amounts of protein. Consult with your healthcare provider for guidance specific to your fasting goals." },
        { q: "Can I mix collagen with hot beverages?", a: "Absolutely! Our collagen peptides are hydrolyzed, meaning they dissolve easily in both hot and cold liquids. Adding to coffee, tea, or warm smoothies is a great way to incorporate collagen into your routine." },
      ]
    },
    {
      name: "Orders & Shipping",
      questions: [
        { q: "How long does shipping take?", a: "Standard shipping typically takes 3-5 business days within the continental US. We also offer expedited shipping options at checkout. International shipping is available to select countries." },
        { q: "Do you offer free shipping?", a: "Yes! We offer free standard shipping on all orders over $50 within the continental United States." },
        { q: "Can I modify or cancel my order?", a: "We process orders quickly to get them to you as fast as possible. If you need to modify or cancel, please contact us within 2 hours of placing your order at support@pnice.com." },
        { q: "Do you ship internationally?", a: "Yes, we ship to select international destinations. Shipping rates and delivery times vary by location. International customers may be responsible for customs duties and taxes." },
      ]
    },
    {
      name: "Subscriptions & Returns",
      questions: [
        { q: "How does Subscribe & Save work?", a: "Subscribe & Save gives you 20% off every order, free shipping, and automatic delivery on your schedule. You can modify, pause, or cancel anytime from your account dashboard. No commitments, no hassle." },
        { q: "Can I skip or reschedule a subscription delivery?", a: "Yes! You have full control over your subscription. Log into your account to skip a delivery, change your delivery date, or swap products. You can also email us at support@pnice.com for help." },
        { q: "What is your return policy?", a: "We offer a 30-day satisfaction guarantee. If you're not completely happy with your purchase, contact us within 30 days for a full refund. We just ask that you've tried the product — we want you to love it!" },
        { q: "How do I cancel my subscription?", a: "You can cancel anytime from your account dashboard or by emailing support@pnice.com. There are no cancellation fees or penalties. We'll send you a confirmation email once your subscription is cancelled." },
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div data-testid="faq-page">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#F5F0EB]">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Frequently Asked Questions</h1>
          <p className="text-stone-600">
            Everything you need to know about P-Nice collagen products.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex} className="mb-12">
              <h2 className="text-2xl font-serif mb-6">{category.name}</h2>
              <div className="space-y-3">
                {category.questions.map((faq, qIndex) => {
                  const isOpen = openIndex === `${catIndex}-${qIndex}`;
                  return (
                    <div key={qIndex} className="border border-stone-200">
                      <button
                        className="w-full flex justify-between items-center p-5 text-left hover:bg-stone-50 transition-colors"
                        onClick={() => toggleQuestion(catIndex, qIndex)}
                        data-testid={`faq-item-${catIndex}-${qIndex}`}
                      >
                        <span className="font-medium pr-4">{faq.q}</span>
                        {isOpen ? <ChevronUp size={20} className="flex-shrink-0" /> : <ChevronDown size={20} className="flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-stone-600 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-[#292524] text-white">
        <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-2xl md:text-3xl font-serif mb-4">Still Have Questions?</h2>
          <p className="text-stone-400 mb-6">
            Our customer support team is here to help. Reach out anytime.
          </p>
          <a href="mailto:support@pnice.com" className="btn-primary bg-white text-[#292524] hover:bg-stone-200">
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
