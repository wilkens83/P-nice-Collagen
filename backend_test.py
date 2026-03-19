#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

class PNiceAPITester:
    def __init__(self, base_url="https://polished-wellness.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.cart_id = None
        self.seo_tests_passed = 0
        self.seo_tests_total = 0

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        if details and success:
            print(f"   Details: {details}")

    def test_api_health(self):
        """Test basic API connectivity"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            self.log_test("API Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("API Health Check", False, str(e))
            return False

    def test_get_products(self):
        """Test products endpoint"""
        try:
            response = requests.get(f"{self.base_url}/products", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                products_count = len(data)
                product_names = [p.get('name', 'Unknown') for p in data[:3]]
                details = f"Found {products_count} products: {', '.join(product_names)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            
            self.log_test("Get Products", success, details)
            return success, data if success else []
        except Exception as e:
            self.log_test("Get Products", False, str(e))
            return False, []

    def test_get_product_by_slug(self, slug="unflavored-collagen"):
        """Test individual product endpoint"""
        try:
            response = requests.get(f"{self.base_url}/products/{slug}", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Product: {data.get('name')} - ${data.get('price')}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test(f"Get Product ({slug})", success, details)
            return success, data if success else {}
        except Exception as e:
            self.log_test(f"Get Product ({slug})", False, str(e))
            return False, {}

    def test_get_bundles(self):
        """Test bundles endpoint"""
        try:
            response = requests.get(f"{self.base_url}/bundles", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                bundles_count = len(data)
                bundle_names = [b.get('name', 'Unknown') for b in data[:3]]
                details = f"Found {bundles_count} bundles: {', '.join(bundle_names)}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Get Bundles", success, details)
            return success, data if success else []
        except Exception as e:
            self.log_test("Get Bundles", False, str(e))
            return False, []

    def test_create_cart(self):
        """Test cart creation"""
        try:
            response = requests.post(f"{self.base_url}/cart", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                self.cart_id = data.get('id')
                details = f"Cart ID: {self.cart_id}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Create Cart", success, details)
            return success
        except Exception as e:
            self.log_test("Create Cart", False, str(e))
            return False

    def test_add_to_cart(self, product_id="unflavored-collagen"):
        """Test adding item to cart"""
        if not self.cart_id:
            return False
        
        try:
            payload = {
                "product_id": product_id,
                "quantity": 2,
                "is_subscription": False
            }
            response = requests.post(
                f"{self.base_url}/cart/{self.cart_id}/items", 
                json=payload,
                timeout=10
            )
            success = response.status_code == 200
            if success:
                data = response.json()
                items_count = len(data.get('items', []))
                details = f"Added {product_id}, Cart has {items_count} items"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            
            self.log_test("Add to Cart", success, details)
            return success
        except Exception as e:
            self.log_test("Add to Cart", False, str(e))
            return False

    def test_cart_totals(self):
        """Test cart totals calculation"""
        if not self.cart_id:
            return False
        
        try:
            response = requests.get(f"{self.base_url}/cart/{self.cart_id}/totals", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                subtotal = data.get('subtotal', 0)
                shipping = data.get('shipping', 0)
                total = data.get('total', 0)
                details = f"Subtotal: ${subtotal}, Shipping: ${shipping}, Total: ${total}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Cart Totals", success, details)
            return success
        except Exception as e:
            self.log_test("Cart Totals", False, str(e))
            return False

    def test_newsletter_subscription(self):
        """Test newsletter subscription"""
        try:
            test_email = f"test_{datetime.now().strftime('%H%M%S')}@test.com"
            payload = {"email": test_email}
            response = requests.post(
                f"{self.base_url}/newsletter", 
                json=payload,
                timeout=10
            )
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Email: {test_email}, Message: {data.get('message')}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Newsletter Subscription", success, details)
            return success
        except Exception as e:
            self.log_test("Newsletter Subscription", False, str(e))
            return False

    def test_get_reviews(self):
        """Test product reviews endpoint"""
        try:
            response = requests.get(f"{self.base_url}/reviews/unflavored-collagen", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                reviews_count = len(data)
                details = f"Found {reviews_count} reviews for unflavored-collagen"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Get Product Reviews", success, details)
            return success
        except Exception as e:
            self.log_test("Get Product Reviews", False, str(e))
            return False

    def test_checkout_session_creation(self):
        """Test Stripe checkout session creation"""
        if not self.cart_id:
            return False
        
        try:
            payload = {
                "cart_id": self.cart_id,
                "origin_url": "https://polished-wellness.preview.emergentagent.com"
            }
            response = requests.post(
                f"{self.base_url}/checkout/session", 
                json=payload,
                timeout=15
            )
            success = response.status_code == 200
            if success:
                data = response.json()
                has_url = bool(data.get('url'))
                has_session_id = bool(data.get('session_id'))
                details = f"Session created: URL={has_url}, SessionID={has_session_id}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Checkout Session Creation", success, details)
            return success
        except Exception as e:
            self.log_test("Checkout Session Creation", False, str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🧪 Starting P-Nice API Tests...")
        print(f"🔗 Testing against: {self.base_url}")
        print("=" * 60)

        # Basic connectivity
        if not self.test_api_health():
            print("\n❌ API is not accessible. Stopping tests.")
            return False

        # Products
        self.test_get_products()
        self.test_get_product_by_slug("unflavored-collagen")
        self.test_get_product_by_slug("vanilla-creamer")

        # Bundles
        self.test_get_bundles()

        # Reviews
        self.test_get_reviews()

        # SEO Content Tests
        self.test_seo_content()

        # Cart operations
    def test_seo_content(self):
        """Test SEO-optimized content in products"""
        print("\n🔍 Testing SEO Content...")
        
        # Test unflavored collagen SEO content
        try:
            response = requests.get(f"{self.base_url}/products/unflavored-collagen", timeout=10)
            self.seo_tests_total += 1
            
            if response.status_code == 200:
                product = response.json()
                name = product.get('name', '')
                
                # Check for SEO-optimized name
                if "Grass-Fed Hydrolyzed Collagen Peptides" in name:
                    self.log_test("Unflavored Collagen SEO Name", True, f"Name: {name}")
                    self.seo_tests_passed += 1
                else:
                    self.log_test("Unflavored Collagen SEO Name", False, f"Expected 'Grass-Fed Hydrolyzed Collagen Peptides' in name, got: {name}")
                    
                # Check SEO-optimized benefits
                benefits = product.get('benefits', [])
                seo_keywords = ['skin', 'hair', 'joint', 'collagen', 'hydrolyzed']
                benefits_text = ' '.join(benefits).lower()
                
                self.seo_tests_total += 1
                found_keywords = [kw for kw in seo_keywords if kw in benefits_text]
                if len(found_keywords) >= 3:
                    self.log_test("Unflavored Collagen SEO Benefits", True, f"Found keywords: {found_keywords}")
                    self.seo_tests_passed += 1
                else:
                    self.log_test("Unflavored Collagen SEO Benefits", False, f"Only found {len(found_keywords)} SEO keywords in benefits")
                    
            else:
                self.log_test("Unflavored Collagen SEO Name", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Unflavored Collagen SEO Content", False, str(e))
        
        # Test that collagen products are featured first
        try:
            response = requests.get(f"{self.base_url}/products", timeout=10)
            self.seo_tests_total += 1
            
            if response.status_code == 200:
                products = response.json()
                collagen_products = [p for p in products if p.get('category') == 'Daily Collagen']
                
                if len(collagen_products) >= 3:
                    self.log_test("Collagen Products Featured", True, f"Found {len(collagen_products)} collagen products")
                    self.seo_tests_passed += 1
                else:
                    self.log_test("Collagen Products Featured", False, f"Only found {len(collagen_products)} collagen products")
                    
        except Exception as e:
            self.log_test("Collagen Products Featured", False, str(e))
        
        # Test rituals and collections
        try:
            response = requests.get(f"{self.base_url}/products/ritual/morning-glow", timeout=10)
            self.seo_tests_total += 1
            
            if response.status_code == 200:
                ritual_products = response.json()
                if len(ritual_products) > 0:
                    self.log_test("Morning Glow Ritual Products", True, f"Found {len(ritual_products)} ritual products")
                    self.seo_tests_passed += 1
                else:
                    self.log_test("Morning Glow Ritual Products", False, "No ritual products found")
        except Exception as e:
            self.log_test("Morning Glow Ritual Products", False, str(e))

        # Cart operations
        if self.test_create_cart():
            self.test_add_to_cart("unflavored-collagen")
            self.test_add_to_cart("vanilla-creamer")  # Add another item
            self.test_cart_totals()
            self.test_checkout_session_creation()

        # Newsletter
        self.test_newsletter_subscription()

        # Print SEO test results
        if self.seo_tests_total > 0:
            seo_success_rate = (self.seo_tests_passed / self.seo_tests_total) * 100
            print(f"\n🎯 SEO Tests: {self.seo_tests_passed}/{self.seo_tests_total} passed ({seo_success_rate:.1f}%)")

        print("\n" + "=" * 60)
        print(f"📊 Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        if success_rate < 80:
            print("⚠️  Low success rate - there may be backend issues")
            return False
        elif success_rate < 100:
            print("⚠️  Some tests failed - check logs for details")
            return False
        else:
            print("🎉 All tests passed!")
            return True

def main():
    """Main test runner"""
    tester = PNiceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())