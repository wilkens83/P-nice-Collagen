import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords,
  image,
  url,
  type = 'website',
  product = null,
  breadcrumbs = null
}) => {
  const siteTitle = "P-Nice | Premium Collagen & Skincare";
  const defaultDescription = "Premium grass-fed collagen peptides and night repair skincare. Support radiant skin, thicker hair, and flexible joints with our daily collagen rituals.";
  const baseUrl = window.location.origin;
  
  const fullTitle = title ? `${title} | P-Nice` : siteTitle;
  const metaDescription = description || defaultDescription;
  const metaUrl = url || window.location.href;
  const metaImage = image || `${baseUrl}/og-image.jpg`;

  // Generate Product Schema
  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images?.[0] || metaImage,
    "brand": {
      "@type": "Brand",
      "name": "P-Nice"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": product.in_stock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": metaUrl
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviews_count
    }
  } : null;

  // Generate FAQ Schema
  const faqSchema = product?.faqs?.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": product.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  } : null;

  // Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${baseUrl}${crumb.url}`
    }))
  } : null;

  // Organization Schema (for homepage)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "P-Nice",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Premium collagen supplements and skincare for radiant skin, thicker hair, and flexible joints.",
    "sameAs": []
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content="P-Nice" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Product-specific OG tags */}
      {product && (
        <>
          <meta property="og:type" content="product" />
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="USD" />
        </>
      )}

      {/* Schema.org Structured Data */}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}

      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {type === 'website' && (
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
