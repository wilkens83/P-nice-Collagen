import { useParams, Link } from "react-router-dom";
import { useCart } from "../App";
import ProductCard from "../components/ProductCard";

const CollectionPage = () => {
  const { collection } = useParams();
  const { products } = useCart();

  const collectionMap = {
    "all": { name: "All Products", description: "Explore our complete collection of premium collagen products." },
    "daily-collagen-rituals": { name: "Daily Collagen Rituals", description: "Support your beauty and wellness with daily collagen." },
    "night-repair-skin-ritual": { name: "Night Repair & Skin Ritual", description: "Restore and rejuvenate while you sleep." },
    "morning-glow": { name: "Morning Glow", description: "Start your day with radiance." },
    "daily-beauty": { name: "Daily Beauty", description: "Consistent collagen support for everyday beauty." },
    "night-repair": { name: "Night Repair", description: "Overnight restoration for your skin." },
  };

  const collectionInfo = collectionMap[collection] || { name: "Collection", description: "" };

  const filteredProducts = collection === "all" 
    ? products 
    : products.filter(p => {
        const collectionMatch = p.collection.toLowerCase().replace(/\s+/g, '-').replace('&', '').replace('--', '-') === collection;
        const ritualMatch = p.ritual.toLowerCase().replace(/\s+/g, '-') === collection;
        return collectionMatch || ritualMatch;
      });

  return (
    <div data-testid="collection-page">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#F5F0EB]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4" data-testid="collection-title">{collectionInfo.name}</h1>
          <p className="text-stone-600 max-w-xl mx-auto">{collectionInfo.description}</p>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          {filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-stone-500 mb-4">No products found in this collection.</p>
              <Link to="/collections/all" className="btn-primary">Shop All Products</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CollectionPage;
