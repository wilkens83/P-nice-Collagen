from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
import base64
from datetime import datetime, timezone
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import hashlib
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

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
    discount_code: Optional[str] = None

class DiscountCode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    code: str
    discount_type: str  # "percentage" or "fixed"
    discount_value: float
    min_order: float = 0.0
    max_uses: Optional[int] = None
    uses: int = 0
    active: bool = True
    expires_at: Optional[str] = None

class ApplyDiscountRequest(BaseModel):
    cart_id: str
    discount_code: str

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

# ==================== ADMIN MODELS ====================

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminSession(BaseModel):
    token: str
    created_at: str

class ProductCreate(BaseModel):
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

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    subscription_price: Optional[float] = None
    category: Optional[str] = None
    collection: Optional[str] = None
    ritual: Optional[str] = None
    images: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    ingredients: Optional[List[str]] = None
    how_to_use: Optional[str] = None
    pairs_with: Optional[List[str]] = None
    in_stock: Optional[bool] = None

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: Optional[str] = None
    total_orders: int = 0
    total_spent: float = 0.0
    last_order_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    notes: str = ""
    tags: List[str] = []

# Admin credentials (in production, use proper auth)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD_HASH = hashlib.sha256("pnice2024".encode()).hexdigest()
admin_sessions = {}  # In-memory session store

# ==================== PRODUCT DATA ====================

# Tax rate (configurable - US average)
TAX_RATE = 0.08  # 8% tax

# Discount codes
DISCOUNT_CODES = {
    "WELCOME10": DiscountCode(code="WELCOME10", discount_type="percentage", discount_value=10, min_order=0),
    "SAVE15": DiscountCode(code="SAVE15", discount_type="percentage", discount_value=15, min_order=50),
    "FIRST20": DiscountCode(code="FIRST20", discount_type="percentage", discount_value=20, min_order=75),
    "FLAT10": DiscountCode(code="FLAT10", discount_type="fixed", discount_value=10, min_order=40),
}

PRODUCTS = {
    "unflavored-collagen": Product(
        id="unflavored-collagen",
        name="Grass-Fed Hydrolyzed Collagen Peptides",
        slug="unflavored-collagen",
        tagline="Unlock Elasticity From the Inside Out",
        description="100% pure, unflavored Grass-Fed Bovine Collagen Peptides (Types 1 & 3). Your essential daily building block to restore radiant skin, thicker hair, and flexible joints. Because your body produces less collagen every year after 20, daily supplementation bridges that gap with highly absorbable peptides that integrate into your existing routine.",
        price=39.99,
        compare_at_price=49.99,
        subscription_price=31.99,
        category="Daily Collagen",
        collection="Daily Collagen Rituals",
        ritual="Morning Glow",
        images=[],
        benefits=[
            "Restores skin's youthful bounce and hydration",
            "Rebuilds thinning hair and strengthens brittle nails",
            "Supports joint flexibility and tendon strength",
            "Dissolves instantly in hot or cold beverages",
            "100% grass-fed, pasture-raised bovine source",
            "Types 1 & 3 collagen for maximum skin benefits"
        ],
        ingredients=["Pure Bovine Hide Collagen Peptides (Types 1 & 3)"],
        how_to_use="Add one scoop (10g) to coffee, tea, smoothies, or water. Stir or blend until dissolved. Best taken daily for optimal results.",
        pairs_with=["vanilla-creamer", "chocolate-collagen"],
        faqs=[
            {"q": "What types of collagen are in this powder?", "a": "It contains Type 1 and Type 3 collagen, which are the most critical forms for maintaining the health and structure of your skin, muscles, and bones."},
            {"q": "Can I mix this into hot coffee?", "a": "Absolutely. Because it is fully hydrolyzed, our collagen dissolves effortlessly in both hot and cold liquids without altering the texture or taste."},
            {"q": "How long until I see results?", "a": "Most customers notice improvements in skin hydration within 4-8 weeks of consistent daily use. Hair and nail benefits may take 2-3 months."},
            {"q": "Is it keto/paleo friendly?", "a": "Yes! Our collagen is sugar-free, carb-free, and fits most dietary lifestyles including keto, paleo, and Whole30."}
        ],
        reviews_count=1247,
        rating=4.9
    ),
    "vanilla-creamer": Product(
        id="vanilla-creamer",
        name="Grass-Fed Collagen Creamer (Vanilla)",
        slug="vanilla-creamer",
        tagline="Elevate Your Morning Routine",
        description="A luscious, dairy-free Vanilla Collagen Creamer. Instantly upgrade your daily coffee with pure Grass-Fed Collagen Peptides for visibly plumper skin and stronger hair with every sip. Transforms your standard morning coffee into a luxurious café-style latte while supporting skin hydration and elasticity from the very first sip.",
        price=44.99,
        compare_at_price=54.99,
        subscription_price=35.99,
        category="Daily Collagen",
        collection="Daily Collagen Rituals",
        ritual="Morning Glow",
        images=[],
        benefits=[
            "Support skin hydration and elasticity daily",
            "Visibly plumper skin with consistent use",
            "Fortifies nails against breakage",
            "Restores hair's natural shine and thickness",
            "Rich, authentic vanilla sweetness without artificial flavors",
            "Dairy-free and gut-friendly formula"
        ],
        ingredients=["Hydrolyzed Bovine Collagen Peptides", "Natural Vanilla Extract", "MCT Oil Powder", "Acacia Fiber"],
        how_to_use="Add one scoop to hot coffee, tea, or warm milk. Stir vigorously or use a frother for an exceptional latte-like foam. Enjoy daily.",
        pairs_with=["unflavored-collagen", "retinol-serum"],
        faqs=[
            {"q": "Will it change the taste of my coffee?", "a": "It adds a subtle, smooth vanilla profile and a creamy texture, enhancing your coffee rather than overpowering it."},
            {"q": "Does it blend without a frother?", "a": "Yes, our fine powder formula is designed to dissolve easily in hot liquids with just a spoon, though a frother creates an exceptional latte-like foam."},
            {"q": "Is it dairy-free?", "a": "Yes! Our creamer is completely dairy-free and bends perfectly into any gut-healing protocol without bloating."}
        ],
        reviews_count=892,
        rating=4.8
    ),
    "chocolate-collagen": Product(
        id="chocolate-collagen",
        name="Grass-Fed Collagen Peptides Powder (Chocolate)",
        slug="chocolate-collagen",
        tagline="Your Daily Collagen Boost, Now in Rich Chocolate",
        description="Support your skin's youthful bounce and protect your joints with Types 1 and 3 Grass-Fed Collagen. Naturally flavored with premium cocoa and sweetened with Stevia for a guilt-free wellness treat. Satisfies your chocolate cravings without spiking your blood sugar or breaking your diet.",
        price=44.99,
        compare_at_price=54.99,
        subscription_price=35.99,
        category="Daily Collagen",
        collection="Daily Collagen Rituals",
        ritual="Daily Beauty",
        images=[],
        benefits=[
            "Supports skin's youthful bounce and hydration",
            "Smooths fine lines from the inside out",
            "Protects and supports joint health",
            "Satisfies chocolate cravings guilt-free",
            "Keto-friendly and sugar-free with Stevia",
            "Transforms water or milk into decadent hot cocoa"
        ],
        ingredients=["Hydrolyzed Collagen Peptides (Bovine Hide)", "Cocoa Powder", "Acacia Powder", "Natural Flavor", "Sodium Chloride", "Xanthan Gum", "Stevia Extract Powder (Reb A)", "Silica"],
        how_to_use="Mix two scoops with 8-10oz of water, milk, or your favorite smoothie base. Blend for a creamy, indulgent treat. Best enjoyed daily.",
        pairs_with=["unflavored-collagen", "sleep-cream"],
        faqs=[
            {"q": "Is this product keto-friendly?", "a": "Yes. It is sweetened entirely with Stevia (Reb A), making it sugar-free and perfectly suited for low-carb and ketogenic lifestyles."},
            {"q": "How much should I take?", "a": "We recommend two scoops daily, mixed into water, milk, or a smoothie, to ensure you get the optimal clinical dose for skin and joint repair."},
            {"q": "Does it taste like real chocolate?", "a": "Absolutely! We use premium cocoa powder for a rich, authentic chocolate experience."}
        ],
        reviews_count=634,
        rating=4.9
    ),
    "retinol-serum": Product(
        id="retinol-serum",
        name="Retinol & Peptide Face Serum",
        slug="retinol-serum",
        tagline="Refine Your Texture While You Rest",
        description="A masterful blend of smoothing Retinol and firming Hexapeptide-11. Refresh your skin's appearance overnight for a visibly polished, even complexion by morning. Suspended in nourishing phospholipids and soothing bisabolol, it delivers high-performance anti-aging benefits—reducing fine lines and improving firmness—without the harshness of traditional retinoids.",
        price=54.99,
        compare_at_price=69.99,
        subscription_price=43.99,
        category="Skincare",
        collection="Night Repair & Skin Ritual",
        ritual="Night Repair",
        images=[],
        benefits=[
            "Visibly firms and tightens facial contours",
            "Smooths fine lines overnight",
            "Refines skin texture for polished complexion",
            "Calms skin instantly—zero flaking or redness",
            "Lightweight formula absorbs in seconds",
            "Suitable for sensitive skin with soothing bisabolol"
        ],
        ingredients=["Phospholipids", "Retinol", "Hexapeptide-11", "Bisabolol", "Hyaluronic Acid"],
        how_to_use="Apply 2-3 drops to clean, dry skin at night. Follow with moisturizer. Use sunscreen the next morning. If new to retinol, start every other night to allow skin to acclimate.",
        pairs_with=["sleep-cream", "vanilla-creamer"],
        faqs=[
            {"q": "Is this serum safe for sensitive skin?", "a": "Yes, it contains soothing bisabolol and hydrating phospholipids to buffer the retinol, making it highly tolerable even for sensitive skin seeking texture refinement."},
            {"q": "How often should I apply the Retinol serum?", "a": "For best results, use it nightly. If you are new to retinol, start by applying it every other night to allow your skin to acclimate."},
            {"q": "Will it rub off on my pillow?", "a": "No, the lightweight formula sinks beautifully into skin in seconds, so it won't transfer to your pillowcase."}
        ],
        reviews_count=456,
        rating=4.7
    ),
    "sleep-cream": Product(
        id="sleep-cream",
        name="Sleep+ Night Recovery Cream",
        slug="sleep-cream",
        tagline="Wake Up Radiant, Even on Short Rest",
        description="A luxurious night cream infused with Bio-Identical Melatonin, Hyaluronic Acid, and Collagen to accelerate overnight skin repair. Clinically designed to work with your body's circadian rhythm to reduce trans-epidermal water loss, soothe inflammation, and improve skin elasticity while you sleep.",
        price=49.99,
        compare_at_price=64.99,
        subscription_price=39.99,
        category="Skincare",
        collection="Night Repair & Skin Ritual",
        ritual="Night Repair",
        images=[],
        benefits=[
            "Wake up with plump, deeply hydrated skin",
            "Locks in 1000x its weight in moisture",
            "Accelerates cellular renewal overnight",
            "Fights free radical damage during sleep",
            "Soothing lavender and avocado oil blend",
            "Achieve glass-like luminous complexion in 14 days"
        ],
        ingredients=["Purified Water", "Melatonin", "Aloe Vera Extract", "Collagen", "Hyaluronic Acid", "Avocado Oil", "Lavender Oil"],
        how_to_use="Apply generously to face and neck after cleansing. Massage gently in upward motions. Use nightly for best results. Safe for all skin types.",
        pairs_with=["retinol-serum", "chocolate-collagen"],
        faqs=[
            {"q": "Can I use Sleep+ every night?", "a": "Yes. Sleep+ is formulated with gentle, soothing oils and is perfectly safe for nightly use across all skin types."},
            {"q": "Will topical melatonin make me groggy?", "a": "No. Topical application supports your skin's local circadian repair cycle without causing morning grogginess."},
            {"q": "Will the lavender help me sleep?", "a": "Many customers find the calming aroma helps signal relaxation before bed and creates a soothing prelude to sleep."}
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
def calculate_cart_total(items: List[dict], discount_code: str = None) -> dict:
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
    
    # Apply discount
    discount_amount = 0.0
    discount_info = None
    if discount_code and discount_code.upper() in DISCOUNT_CODES:
        code = DISCOUNT_CODES[discount_code.upper()]
        if code.active and subtotal >= code.min_order:
            if code.discount_type == "percentage":
                discount_amount = subtotal * (code.discount_value / 100)
            else:  # fixed
                discount_amount = min(code.discount_value, subtotal)
            discount_info = {
                "code": code.code,
                "type": code.discount_type,
                "value": code.discount_value,
                "amount": round(discount_amount, 2)
            }
    
    subtotal_after_discount = subtotal - discount_amount
    
    # Calculate shipping (free over $50 after discount)
    shipping = 0.0 if subtotal_after_discount >= 50 else 5.99
    
    # Calculate tax
    tax = round(subtotal_after_discount * TAX_RATE, 2)
    
    # Total
    total = subtotal_after_discount + shipping + tax
    
    return {
        "subtotal": round(subtotal, 2),
        "discount": discount_info,
        "discount_amount": round(discount_amount, 2),
        "subtotal_after_discount": round(subtotal_after_discount, 2),
        "shipping": shipping,
        "tax": tax,
        "tax_rate": TAX_RATE * 100,
        "total": round(total, 2)
    }

@api_router.get("/cart/{cart_id}/totals")
async def get_cart_totals(cart_id: str, discount_code: str = None):
    cart = await db.carts.find_one({"id": cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return calculate_cart_total(cart.get("items", []), discount_code)

# Discount codes
@api_router.post("/discount/validate")
async def validate_discount(req: ApplyDiscountRequest):
    cart = await db.carts.find_one({"id": req.cart_id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    code_upper = req.discount_code.upper()
    if code_upper not in DISCOUNT_CODES:
        raise HTTPException(status_code=400, detail="Invalid discount code")
    
    code = DISCOUNT_CODES[code_upper]
    if not code.active:
        raise HTTPException(status_code=400, detail="This code is no longer active")
    
    # Calculate subtotal
    subtotal = 0.0
    for item in cart.get("items", []):
        product_id = item["product_id"]
        if product_id in PRODUCTS:
            product = PRODUCTS[product_id]
            price = product.subscription_price if item.get("is_subscription") else product.price
            subtotal += price * item["quantity"]
        elif product_id in BUNDLES:
            bundle = BUNDLES[product_id]
            subtotal += bundle.price * item["quantity"]
    
    if subtotal < code.min_order:
        raise HTTPException(status_code=400, detail=f"Minimum order of ${code.min_order:.2f} required for this code")
    
    # Calculate discount
    if code.discount_type == "percentage":
        discount_amount = subtotal * (code.discount_value / 100)
        message = f"{code.discount_value}% off applied!"
    else:
        discount_amount = min(code.discount_value, subtotal)
        message = f"${code.discount_value:.2f} off applied!"
    
    return {
        "valid": True,
        "code": code.code,
        "discount_type": code.discount_type,
        "discount_value": code.discount_value,
        "discount_amount": round(discount_amount, 2),
        "message": message
    }

@api_router.get("/discount/codes")
async def get_available_codes():
    """Return public discount codes for marketing"""
    return [
        {"code": "WELCOME10", "description": "10% off your first order", "min_order": 0},
        {"code": "SAVE15", "description": "15% off orders $50+", "min_order": 50},
    ]

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
    
    totals = calculate_cart_total(cart.get("items", []), checkout_req.discount_code)
    
    # Build URLs from origin
    success_url = f"{checkout_req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/cart"
    
    # Initialize Stripe
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    # Build metadata
    metadata = {
        "cart_id": checkout_req.cart_id,
        "source": "pnice_checkout",
        "subtotal": str(totals["subtotal"]),
        "tax": str(totals["tax"]),
        "shipping": str(totals["shipping"])
    }
    if checkout_req.discount_code:
        metadata["discount_code"] = checkout_req.discount_code.upper()
        metadata["discount_amount"] = str(totals["discount_amount"])
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=float(totals["total"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
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
        metadata=metadata
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

# ==================== ADMIN ROUTES ====================

def verify_admin_token(token: str) -> bool:
    """Verify admin session token"""
    if token in admin_sessions:
        return True
    return False

@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    password_hash = hashlib.sha256(login.password.encode()).hexdigest()
    if login.username == ADMIN_USERNAME and password_hash == ADMIN_PASSWORD_HASH:
        token = secrets.token_urlsafe(32)
        admin_sessions[token] = {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "username": login.username
        }
        return {"success": True, "token": token}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.post("/admin/logout")
async def admin_logout(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token in admin_sessions:
        del admin_sessions[token]
    return {"success": True}

@api_router.get("/admin/verify")
async def admin_verify(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if verify_admin_token(token):
        return {"valid": True}
    raise HTTPException(status_code=401, detail="Invalid or expired token")

# Admin Products
@api_router.get("/admin/products")
async def admin_get_products(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Get products from DB, fallback to static
    db_products = await db.products.find({}, {"_id": 0}).to_list(1000)
    if db_products:
        return db_products
    return list(PRODUCTS.values())

@api_router.post("/admin/products")
async def admin_create_product(request: Request, product: ProductCreate):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Check if slug exists
    existing = await db.products.find_one({"slug": product.slug})
    if existing or product.slug in PRODUCTS:
        raise HTTPException(status_code=400, detail="Product with this slug already exists")
    
    product_dict = product.model_dump()
    product_dict["id"] = product.slug
    product_dict["reviews_count"] = 0
    product_dict["rating"] = 5.0
    product_dict["in_stock"] = True
    product_dict["faqs"] = []
    product_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.insert_one(product_dict)
    
    # Also add to in-memory PRODUCTS dict
    PRODUCTS[product.slug] = Product(**product_dict)
    
    return {"success": True, "product": product_dict}

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(request: Request, product_id: str, update: ProductUpdate):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Update in DB
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    # Update in-memory if exists
    if product_id in PRODUCTS:
        for key, value in update_data.items():
            if hasattr(PRODUCTS[product_id], key):
                setattr(PRODUCTS[product_id], key, value)
    
    return {"success": True, "updated": result.modified_count > 0}

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(request: Request, product_id: str):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    await db.products.delete_one({"id": product_id})
    if product_id in PRODUCTS:
        del PRODUCTS[product_id]
    
    return {"success": True}

# Image Upload
@api_router.post("/admin/upload")
async def admin_upload_image(request: Request, file: UploadFile = File(...)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, WebP, GIF")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOADS_DIR / filename
    
    # Save file
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    
    # Return URL (relative path)
    image_url = f"/api/uploads/{filename}"
    
    # Save to DB for tracking
    await db.uploads.insert_one({
        "filename": filename,
        "original_name": file.filename,
        "content_type": file.content_type,
        "size": len(content),
        "url": image_url,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "url": image_url, "filename": filename}

@api_router.get("/admin/uploads")
async def admin_get_uploads(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    uploads = await db.uploads.find({}, {"_id": 0}).sort("uploaded_at", -1).to_list(100)
    return uploads

@api_router.delete("/admin/uploads/{filename}")
async def admin_delete_upload(request: Request, filename: str):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    filepath = UPLOADS_DIR / filename
    if filepath.exists():
        filepath.unlink()
    
    await db.uploads.delete_one({"filename": filename})
    return {"success": True}

# Customers
@api_router.get("/admin/customers")
async def admin_get_customers(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Get from newsletter + orders
    customers = []
    
    # Newsletter subscribers
    subscribers = await db.newsletter.find({}, {"_id": 0}).to_list(1000)
    for sub in subscribers:
        customers.append({
            "id": sub.get("email"),
            "email": sub.get("email"),
            "name": None,
            "source": "newsletter",
            "subscribed_at": sub.get("subscribed_at"),
            "total_orders": 0,
            "total_spent": 0
        })
    
    # Payment transactions (completed)
    transactions = await db.payment_transactions.find(
        {"payment_status": "paid"}, {"_id": 0}
    ).to_list(1000)
    
    # Aggregate by cart (email from metadata if available)
    for tx in transactions:
        email = tx.get("metadata", {}).get("email", f"order_{tx.get('cart_id', 'unknown')[:8]}")
        existing = next((c for c in customers if c["email"] == email), None)
        if existing:
            existing["total_orders"] += 1
            existing["total_spent"] += tx.get("amount", 0)
        else:
            customers.append({
                "id": tx.get("cart_id"),
                "email": email,
                "name": None,
                "source": "order",
                "total_orders": 1,
                "total_spent": tx.get("amount", 0),
                "last_order_date": tx.get("created_at")
            })
    
    return customers

@api_router.get("/admin/orders")
async def admin_get_orders(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    orders = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

# Dashboard Stats
@api_router.get("/admin/stats")
async def admin_get_stats(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Count products
    db_products_count = await db.products.count_documents({})
    total_products = db_products_count + len(PRODUCTS)
    
    # Count subscribers
    total_subscribers = await db.newsletter.count_documents({})
    
    # Count orders and revenue
    orders = await db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0}).to_list(1000)
    total_orders = len(orders)
    total_revenue = sum(o.get("amount", 0) for o in orders)
    
    # Recent orders
    recent_orders = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)
    
    return {
        "total_products": total_products,
        "total_subscribers": total_subscribers,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "recent_orders": recent_orders
    }

# Include router
app.include_router(api_router)

# Serve uploaded files
from fastapi.responses import FileResponse

@app.get("/api/uploads/{filename}")
async def serve_upload(filename: str):
    filepath = UPLOADS_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)

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
