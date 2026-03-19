from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe setup
stripe_api_key = os.environ.get('STRIPE_API_KEY')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    slug: str
    tagline: str
    description: str
    price: float
    compare_at_price: Optional[float] = None
    subscription_price: Optional[float] = None
    category: str
    collection: str
    ritual: str
    images: List[str] = []
    benefits: List[str] = []
    ingredients: List[str] = []
    how_to_use: str = ""
    pairs_with: List[str] = []
    faqs: List[Dict[str, str]] = []
    reviews_count: int = 0
    rating: float = 5.0
    in_stock: bool = True

class Bundle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    slug: str
    tagline: str
    description: str
    price: float
    compare_at_price: float
    savings: float
    products: List[str]
    images: List[str] = []

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1
    is_subscription: bool = False

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[CartItem] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class NewsletterSubscription(BaseModel):
    email: EmailStr

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    name: str
    rating: int
    title: str
    content: str
    verified: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CheckoutRequest(BaseModel):
    cart_id: str
    origin_url: str

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    cart_id: str
    amount: float
    currency: str = "usd"
    status: str = "pending"
    payment_status: str = "initiated"
    metadata: Dict[str, str] = {}
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== PRODUCT DATA ====================

PRODUCTS = {
    "unflavored-collagen": Product(
        id="unflavored-collagen",
        name="Grass-Fed Collagen Peptides",
        slug="unflavored-collagen",
        tagline="The easiest daily collagen ritual — stir, sip, stay consistent.",
        description="Pure, unflavored collagen peptides sourced from grass-fed, pasture-raised bovine hide. Our hydrolyzed formula dissolves instantly in any beverage, hot or cold, making it effortless to add to your daily routine.",
        price=39.99,
        compare_at_price=49.99,
        subscription_price=31.99,
        category="Daily Collagen",
        collection="Daily Collagen Rituals",
        ritual="Morning Glow",
        images=[],
        benefits=[
            "Supports skin hydration & elasticity",
            "Promotes healthy hair & nails",
            "Supports joint & connective tissue health",
            "Easy to mix into any beverage",
            "Grass-fed, pasture-raised source"
        ],
        ingredients=["Hydrolyzed Bovine Collagen Peptides (Types I & III)"],
        how_to_use="Add one scoop (10g) to coffee, tea, smoothies, or water. Stir or blend until dissolved. Best taken daily for optimal results.",
        pairs_with=["vanilla-creamer", "chocolate-collagen"],
        faqs=[
            {"q": "Is this collagen flavorless?", "a": "Yes! Our unflavored formula has no taste or smell, making it perfect for any drink."},
            {"q": "How long until I see results?", "a": "Most customers notice improvements in skin hydration within 4-8 weeks of consistent daily use."},
            {"q": "Is it keto/paleo friendly?", "a": "Yes! Our collagen is sugar-free, carb-free, and fits most dietary lifestyles."}
        ],
        reviews_count=1247,
        rating=4.9
    ),
    "vanilla-creamer": Product(
        id="vanilla-creamer",
        name="Vanilla Collagen Creamer",
        slug="vanilla-creamer",
        tagline="Turn your morning cup into your beauty routine.",
        description="Upgrade your daily coffee ritual with our Vanilla Collagen Creamer. Infused with grass-fed collagen peptides, MCT oil, and smooth vanilla flavor for a creamy, satisfying addition to any hot beverage.",
        price=44.99,
        compare_at_price=54.99,
        subscription_price=35.99,
        category="Daily Collagen",
        collection="Daily Collagen Rituals",
        ritual="Morning Glow",
        images=[],
        benefits=[
            "Creamy vanilla flavor",
            "MCT oil for sustained energy",
            "Supports skin, hair, & nail health",
            "Perfect for coffee lovers",
            "No artificial sweeteners"
        ],
        ingredients=["Grass-Fed Collagen Peptides", "MCT Oil Powder", "Acacia Fiber", "Calcium Carbonate", "Pea Protein", "Natural Vanilla Flavor"],
        how_to_use="Add one scoop to hot coffee, tea, or warm milk. Stir vigorously or blend for best results. Enjoy daily.",
        pairs_with=["unflavored-collagen", "retinol-serum"],
        faqs=[
            {"q": "Does it dissolve well in cold drinks?", "a": "It's optimized for hot beverages. For cold drinks, we recommend blending."},
            {"q": "How sweet is it?", "a": "Lightly sweetened with natural stevia — not overly sweet, just perfectly balanced."},
            {"q": "Can I use it as a creamer replacement?", "a": "Absolutely! It's designed to replace your regular creamer while adding collagen benefits."}
        ],
        reviews_count=892,
        rating=4.8
    ),
    "chocolate-collagen": Product(
        id="chocolate-collagen",
        name="Chocolate Collagen Peptides",
        slug="chocolate-collagen",
        tagline="Your richer, more satisfying collagen ritual.",
        description="Indulge in your daily collagen with our decadent Chocolate Collagen Peptides. Rich cocoa flavor meets powerful collagen support for a treat you'll look forward to every day.",
        price=44.99,
        compare_at_price=54.99,
        subscription_price=35.99,
        category="Daily Collagen",
        collection="Daily Collagen Rituals",
        ritual="Daily Beauty",
        images=[],
        benefits=[
            "Rich, natural cocoa flavor",
            "Satisfies chocolate cravings",
            "Supports skin elasticity",
            "Perfect for smoothies & shakes",
            "Only 2g sugar per serving"
        ],
        ingredients=["Grass-Fed Collagen Peptides", "Cocoa Powder", "Acacia Fiber", "Natural Flavor", "Stevia Extract"],
        how_to_use="Mix one scoop with 8-10oz of water, milk, or your favorite smoothie base. Blend for a creamy treat.",
        pairs_with=["unflavored-collagen", "sleep-cream"],
        faqs=[
            {"q": "Is this good for hot chocolate?", "a": "Yes! Mix with warm milk for a beauty-boosting hot chocolate."},
            {"q": "How does it taste?", "a": "Rich, authentic chocolate flavor without the guilt — our customers love it!"},
            {"q": "Is it suitable for kids?", "a": "Consult your pediatrician, but our formula is made with clean ingredients."}
        ],
        reviews_count=634,
        rating=4.9
    ),
    "retinol-serum": Product(
        id="retinol-serum",
        name="Retinol + Peptide Night Serum",
        slug="retinol-serum",
        tagline="Refine texture, smooth the look of skin, support a polished complexion.",
        description="Our advanced night serum combines retinol with powerful peptides to target fine lines, uneven texture, and dullness while you sleep. Wake up to visibly refined, radiant skin.",
        price=54.99,
        compare_at_price=69.99,
        subscription_price=43.99,
        category="Skincare",
        collection="Night Repair & Skin Ritual",
        ritual="Night Repair",
        images=[],
        benefits=[
            "Smooths appearance of fine lines",
            "Refines skin texture",
            "Supports skin firmness",
            "Lightweight, fast-absorbing",
            "Suitable for most skin types"
        ],
        ingredients=["Retinol (Vitamin A)", "Hexapeptide-11", "Phospholipids", "Bisabolol", "Hyaluronic Acid"],
        how_to_use="Apply 2-3 drops to clean, dry skin at night. Follow with moisturizer. Use sunscreen the next morning. Start 2-3x weekly, increase as tolerated.",
        pairs_with=["sleep-cream", "vanilla-creamer"],
        faqs=[
            {"q": "Can I use this if I'm new to retinol?", "a": "Yes! Start slowly (2-3x/week) and increase as your skin adjusts."},
            {"q": "Should I use sunscreen?", "a": "Always use SPF 30+ the day after using retinol products."},
            {"q": "Can I use with vitamin C?", "a": "We recommend using vitamin C in the morning and retinol at night for best results."}
        ],
        reviews_count=456,
        rating=4.7
    ),
    "sleep-cream": Product(
        id="sleep-cream",
        name="Sleep Plus Collagen Cream",
        slug="sleep-cream",
        tagline="Wake up to skin that feels softer, calmer, and better hydrated.",
        description="Transform your nighttime routine with our luxurious Sleep Plus Collagen Cream. Infused with collagen, hyaluronic acid, and soothing lavender for overnight hydration and calm.",
        price=49.99,
        compare_at_price=64.99,
        subscription_price=39.99,
        category="Skincare",
        collection="Night Repair & Skin Ritual",
        ritual="Night Repair",
        images=[],
        benefits=[
            "Deep overnight hydration",
            "Soothing lavender aroma",
            "Supports skin plumpness",
            "Non-greasy formula",
            "Calming bedtime ritual"
        ],
        ingredients=["Collagen", "Hyaluronic Acid", "Avocado Oil", "Lavender Essential Oil", "Aloe Vera", "Melatonin (topical)"],
        how_to_use="Apply generously to face and neck after cleansing. Massage gently in upward motions. Use nightly for best results.",
        pairs_with=["retinol-serum", "chocolate-collagen"],
        faqs=[
            {"q": "Is this safe for sensitive skin?", "a": "Yes! Formulated with gentle, soothing ingredients suitable for sensitive skin."},
            {"q": "Will the lavender help me sleep?", "a": "Many customers find the calming aroma helps signal relaxation before bed."},
            {"q": "Can I use under eyes?", "a": "Yes, gently apply around the eye area avoiding direct contact with eyes."}
        ],
        reviews_count=378,
        rating=4.8
    )
}

BUNDLES = {
    "morning-glow-stack": Bundle(
        id="morning-glow-stack",
        name="Morning Glow Stack",
        slug="morning-glow-stack",
        tagline="Start every day with beauty from within.",
        description="The perfect morning duo: our Vanilla Collagen Creamer for your coffee plus Unflavored Collagen Peptides for versatile daily use.",
        price=74.99,
        compare_at_price=94.98,
        savings=19.99,
        products=["vanilla-creamer", "unflavored-collagen"],
        images=[]
    ),
    "beauty-sleep-duo": Bundle(
        id="beauty-sleep-duo",
        name="Beauty Sleep Duo",
        slug="beauty-sleep-duo",
        tagline="Your complete overnight skin transformation.",
        description="Pair our Retinol + Peptide Night Serum with Sleep Plus Collagen Cream for the ultimate nighttime beauty routine.",
        price=89.99,
        compare_at_price=134.98,
        savings=44.99,
        products=["retinol-serum", "sleep-cream"],
        images=[]
    ),
    "daily-starter-kit": Bundle(
        id="daily-starter-kit",
        name="Daily Collagen Starter Kit",
        slug="daily-starter-kit",
        tagline="Everything you need to begin your collagen journey.",
        description="Try both our Unflavored and Chocolate Collagen Peptides to discover your perfect daily ritual.",
        price=69.99,
        compare_at_price=99.98,
        savings=29.99,
        products=["unflavored-collagen", "chocolate-collagen"],
        images=[]
    ),
    "glow-within-bundle": Bundle(
        id="glow-within-bundle",
        name="Glow From Within Bundle",
        slug="glow-within-bundle",
        tagline="Inside-out beauty support.",
        description="Combine internal collagen support with topical refinement: Unflavored Collagen Peptides plus our Retinol + Peptide Serum.",
        price=79.99,
        compare_at_price=109.98,
        savings=29.99,
        products=["unflavored-collagen", "retinol-serum"],
        images=[]
    )
}

# Sample reviews
SAMPLE_REVIEWS = [
    Review(id="r1", product_id="unflavored-collagen", name="Sarah M.", rating=5, title="Game changer for my skin!", content="I've been using this for 3 months and my skin has never looked better. Dissolves perfectly in my morning coffee.", verified=True),
    Review(id="r2", product_id="unflavored-collagen", name="Jennifer L.", rating=5, title="Finally, a collagen that works", content="After trying many brands, this is the only one I've stuck with. Great quality, no taste.", verified=True),
    Review(id="r3", product_id="vanilla-creamer", name="Amanda R.", rating=5, title="Best morning upgrade ever", content="I look forward to my coffee every morning now. Tastes amazing and my nails are so much stronger!", verified=True),
    Review(id="r4", product_id="vanilla-creamer", name="Michelle K.", rating=4, title="Love the taste!", content="Really creamy and the vanilla is perfect. Wish it came in a bigger size!", verified=True),
    Review(id="r5", product_id="retinol-serum", name="Lisa T.", rating=5, title="Visible results in weeks", content="My fine lines are noticeably smoother. This serum is now a non-negotiable part of my routine.", verified=True),
    Review(id="r6", product_id="sleep-cream", name="Rachel H.", rating=5, title="Luxurious nighttime treat", content="The lavender scent is so calming. I wake up with plump, hydrated skin every morning.", verified=True),
    Review(id="r7", product_id="chocolate-collagen", name="Emily W.", rating=5, title="Dessert that's good for you!", content="This satisfies my chocolate cravings while supporting my skin. Win-win!", verified=True),
]

# ==================== API ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "P-Nice Collagen API"}

# Products
@api_router.get("/products", response_model=List[Product])
async def get_products():
    return list(PRODUCTS.values())

@api_router.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    if slug not in PRODUCTS:
        raise HTTPException(status_code=404, detail="Product not found")
    return PRODUCTS[slug]

@api_router.get("/products/collection/{collection}")
async def get_products_by_collection(collection: str):
    return [p for p in PRODUCTS.values() if p.collection.lower().replace(" ", "-") == collection.lower()]

@api_router.get("/products/ritual/{ritual}")
async def get_products_by_ritual(ritual: str):
    return [p for p in PRODUCTS.values() if p.ritual.lower().replace(" ", "-") == ritual.lower()]

# Bundles
@api_router.get("/bundles", response_model=List[Bundle])
async def get_bundles():
    return list(BUNDLES.values())

@api_router.get("/bundles/{slug}", response_model=Bundle)
async def get_bundle(slug: str):
    if slug not in BUNDLES:
        raise HTTPException(status_code=404, detail="Bundle not found")
    return BUNDLES[slug]

# Reviews
@api_router.get("/reviews/{product_id}")
async def get_product_reviews(product_id: str):
    return [r for r in SAMPLE_REVIEWS if r.product_id == product_id]

@api_router.get("/reviews")
async def get_all_reviews():
    return SAMPLE_REVIEWS

# Cart
@api_router.post("/cart", response_model=Cart)
async def create_cart():
    cart = Cart()
    cart_dict = cart.model_dump()
    await db.carts.insert_one(cart_dict)
    return cart

@api_router.get("/cart/{cart_id}", response_model=Cart)
async def get_cart(cart_id: str):
    cart = await db.carts.find_one({"id": cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return Cart(**cart)

@api_router.post("/cart/{cart_id}/items")
async def add_to_cart(cart_id: str, item: CartItem):
    cart = await db.carts.find_one({"id": cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    # Check if item already exists
    existing = next((i for i in items if i["product_id"] == item.product_id and i["is_subscription"] == item.is_subscription), None)
    if existing:
        existing["quantity"] += item.quantity
    else:
        items.append(item.model_dump())
    
    await db.carts.update_one(
        {"id": cart_id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "items": items}

@api_router.put("/cart/{cart_id}/items/{product_id}")
async def update_cart_item(cart_id: str, product_id: str, quantity: int):
    cart = await db.carts.find_one({"id": cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    for item in items:
        if item["product_id"] == product_id:
            if quantity <= 0:
                items.remove(item)
            else:
                item["quantity"] = quantity
            break
    
    await db.carts.update_one(
        {"id": cart_id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "items": items}

@api_router.delete("/cart/{cart_id}/items/{product_id}")
async def remove_from_cart(cart_id: str, product_id: str):
    cart = await db.carts.find_one({"id": cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [i for i in cart.get("items", []) if i["product_id"] != product_id]
    await db.carts.update_one(
        {"id": cart_id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "items": items}

# Cart calculation helper
def calculate_cart_total(items: List[dict]) -> dict:
    subtotal = 0.0
    for item in items:
        product_id = item["product_id"]
        if product_id in PRODUCTS:
            product = PRODUCTS[product_id]
            price = product.subscription_price if item.get("is_subscription") else product.price
            subtotal += price * item["quantity"]
        elif product_id in BUNDLES:
            bundle = BUNDLES[product_id]
            subtotal += bundle.price * item["quantity"]
    
    return {
        "subtotal": round(subtotal, 2),
        "shipping": 0.0 if subtotal >= 50 else 5.99,
        "total": round(subtotal + (0.0 if subtotal >= 50 else 5.99), 2)
    }

@api_router.get("/cart/{cart_id}/totals")
async def get_cart_totals(cart_id: str):
    cart = await db.carts.find_one({"id": cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return calculate_cart_total(cart.get("items", []))

# Newsletter
@api_router.post("/newsletter")
async def subscribe_newsletter(subscription: NewsletterSubscription):
    existing = await db.newsletter.find_one({"email": subscription.email})
    if existing:
        return {"success": True, "message": "Already subscribed"}
    
    await db.newsletter.insert_one({
        "email": subscription.email,
        "subscribed_at": datetime.now(timezone.utc).isoformat()
    })
    return {"success": True, "message": "Successfully subscribed"}

# Stripe Checkout
@api_router.post("/checkout/session")
async def create_checkout_session(request: Request, checkout_req: CheckoutRequest):
    cart = await db.carts.find_one({"id": checkout_req.cart_id}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    totals = calculate_cart_total(cart.get("items", []))
    
    # Build URLs from origin
    success_url = f"{checkout_req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/cart"
    
    # Initialize Stripe
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=float(totals["total"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "cart_id": checkout_req.cart_id,
            "source": "pnice_checkout"
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = PaymentTransaction(
        session_id=session.session_id,
        cart_id=checkout_req.cart_id,
        amount=float(totals["total"]),
        currency="usd",
        status="pending",
        payment_status="initiated",
        metadata={"cart_id": checkout_req.cart_id}
    )
    await db.payment_transactions.insert_one(transaction.model_dump())
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(request: Request, session_id: str):
    # Initialize Stripe
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction record
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "status": status.status,
            "payment_status": status.payment_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "status": "complete",
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        return {"received": True}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"received": True}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
