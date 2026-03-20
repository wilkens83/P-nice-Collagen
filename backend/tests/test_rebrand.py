"""
Test suite for P-Nice rebrand to 'The Polished Glow System'
Tests product names, bundles, ritual associations, and homepage content
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestProductsRebrand:
    """Tests for rebranded product names and ritual associations"""
    
    def test_products_endpoint_returns_5_products(self):
        """GET /api/products returns 5 products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        assert len(products) == 5, f"Expected 5 products, got {len(products)}"
        print("SUCCESS: 5 products returned")
    
    def test_polished_collagen_base_product(self):
        """Verify Polished Collagen Base product exists with correct data"""
        response = requests.get(f"{BASE_URL}/api/products/unflavored-collagen")
        assert response.status_code == 200
        product = response.json()
        
        assert product['name'] == "Polished Collagen Base™"
        assert product['ritual'] == "Step 1: Foundation"
        assert product['collection'] == "The Polished Glow System"
        assert product['price'] == 39.99
        print(f"SUCCESS: Polished Collagen Base - {product['name']}, {product['ritual']}")
    
    def test_morning_glow_creamer_product(self):
        """Verify Morning Glow Creamer product exists with correct data"""
        response = requests.get(f"{BASE_URL}/api/products/vanilla-creamer")
        assert response.status_code == 200
        product = response.json()
        
        assert product['name'] == "Morning Glow Creamer™"
        assert product['ritual'] == "Step 2: Morning Ritual"
        assert product['collection'] == "The Polished Glow System"
        assert product['price'] == 44.99
        print(f"SUCCESS: Morning Glow Creamer - {product['name']}, {product['ritual']}")
    
    def test_glow_treat_collagen_product(self):
        """Verify Glow Treat Collagen product exists with correct data"""
        response = requests.get(f"{BASE_URL}/api/products/chocolate-collagen")
        assert response.status_code == 200
        product = response.json()
        
        assert product['name'] == "Glow Treat Collagen™"
        assert product['ritual'] == "Step 3: Beauty Indulgence"
        assert product['collection'] == "The Polished Glow System"
        assert product['price'] == 44.99
        print(f"SUCCESS: Glow Treat Collagen - {product['name']}, {product['ritual']}")
    
    def test_night_renewal_serum_product(self):
        """Verify Night Renewal Serum product exists with correct data"""
        response = requests.get(f"{BASE_URL}/api/products/retinol-serum")
        assert response.status_code == 200
        product = response.json()
        
        assert product['name'] == "Night Renewal Serum™"
        assert product['ritual'] == "Step 4: Night Repair"
        assert product['collection'] == "Night Recovery Ritual"
        assert product['price'] == 54.99
        print(f"SUCCESS: Night Renewal Serum - {product['name']}, {product['ritual']}")
    
    def test_deep_sleep_recovery_cream_product(self):
        """Verify Deep Sleep Recovery Cream product exists with correct data"""
        response = requests.get(f"{BASE_URL}/api/products/sleep-cream")
        assert response.status_code == 200
        product = response.json()
        
        assert product['name'] == "Deep Sleep Recovery Cream™"
        assert product['ritual'] == "Step 4: Night Repair"
        assert product['collection'] == "Night Recovery Ritual"
        assert product['price'] == 49.99
        print(f"SUCCESS: Deep Sleep Recovery Cream - {product['name']}, {product['ritual']}")


class TestBundlesRebrand:
    """Tests for rebranded bundles"""
    
    def test_bundles_endpoint_returns_3_bundles(self):
        """GET /api/bundles returns 3 bundles"""
        response = requests.get(f"{BASE_URL}/api/bundles")
        assert response.status_code == 200
        bundles = response.json()
        assert len(bundles) == 3, f"Expected 3 bundles, got {len(bundles)}"
        print("SUCCESS: 3 bundles returned")
    
    def test_30_day_glow_system_bundle(self):
        """Verify 30-Day Glow System bundle with correct products"""
        response = requests.get(f"{BASE_URL}/api/bundles/30-day-glow-system")
        assert response.status_code == 200
        bundle = response.json()
        
        assert bundle['name'] == "The 30-Day Glow System™"
        assert bundle['price'] == 124.99
        assert bundle['compare_at_price'] == 164.97
        assert set(bundle['products']) == {"unflavored-collagen", "retinol-serum", "sleep-cream"}
        print(f"SUCCESS: 30-Day Glow System - {bundle['name']}, products: {bundle['products']}")
    
    def test_morning_beauty_ritual_kit_bundle(self):
        """Verify Morning Beauty Ritual Kit bundle with correct products"""
        response = requests.get(f"{BASE_URL}/api/bundles/morning-beauty-ritual")
        assert response.status_code == 200
        bundle = response.json()
        
        assert bundle['name'] == "Morning Beauty Ritual Kit"
        assert bundle['price'] == 74.99
        assert bundle['compare_at_price'] == 84.98
        assert set(bundle['products']) == {"vanilla-creamer", "unflavored-collagen"}
        print(f"SUCCESS: Morning Beauty Ritual Kit - {bundle['name']}, products: {bundle['products']}")
    
    def test_glow_indulgence_kit_bundle(self):
        """Verify Glow Indulgence Kit bundle with correct products"""
        response = requests.get(f"{BASE_URL}/api/bundles/glow-indulgence-kit")
        assert response.status_code == 200
        bundle = response.json()
        
        assert bundle['name'] == "Glow Indulgence Kit"
        assert bundle['price'] == 84.99
        assert bundle['compare_at_price'] == 99.98
        assert set(bundle['products']) == {"chocolate-collagen", "retinol-serum"}
        print(f"SUCCESS: Glow Indulgence Kit - {bundle['name']}, products: {bundle['products']}")


class TestReviewsRebrand:
    """Tests for reviews with new product names"""
    
    def test_reviews_endpoint_works(self):
        """GET /api/reviews returns reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        reviews = response.json()
        assert len(reviews) >= 1, "Expected at least 1 review"
        print(f"SUCCESS: {len(reviews)} reviews returned")
    
    def test_reviews_have_new_product_names(self):
        """Verify reviews reference new product names"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        reviews = response.json()
        
        # Check reviews content mentions new product names
        all_content = " ".join([r.get('content', '') + r.get('title', '') for r in reviews])
        
        # Reviews should mention new product names in context
        assert any("Polished Collagen Base" in r.get('content', '') or "glow" in r.get('content', '').lower() for r in reviews), \
            "Reviews should reference new branding/products"
        print("SUCCESS: Reviews contain relevant content for rebranded products")


class TestCartCheckout:
    """Tests for cart and checkout functionality"""
    
    def test_create_cart(self):
        """POST /api/cart creates a new cart"""
        response = requests.post(f"{BASE_URL}/api/cart")
        assert response.status_code == 200
        cart = response.json()
        assert 'id' in cart
        print(f"SUCCESS: Cart created with ID: {cart['id']}")
        return cart['id']
    
    def test_add_item_to_cart(self):
        """POST /api/cart/{id}/items adds item to cart"""
        # Create cart
        cart_response = requests.post(f"{BASE_URL}/api/cart")
        cart_id = cart_response.json()['id']
        
        # Add item
        response = requests.post(
            f"{BASE_URL}/api/cart/{cart_id}/items",
            json={"product_id": "unflavored-collagen", "quantity": 1}
        )
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        assert len(data['items']) == 1
        print(f"SUCCESS: Item added to cart {cart_id}")
    
    def test_get_cart_totals(self):
        """GET /api/cart/{id}/totals returns correct totals"""
        # Create cart and add item
        cart_response = requests.post(f"{BASE_URL}/api/cart")
        cart_id = cart_response.json()['id']
        requests.post(
            f"{BASE_URL}/api/cart/{cart_id}/items",
            json={"product_id": "unflavored-collagen", "quantity": 1}
        )
        
        # Get totals
        response = requests.get(f"{BASE_URL}/api/cart/{cart_id}/totals")
        assert response.status_code == 200
        totals = response.json()
        assert totals['subtotal'] == 39.99
        assert 'shipping' in totals
        assert 'tax' in totals
        assert 'total' in totals
        print(f"SUCCESS: Cart totals - subtotal: ${totals['subtotal']}, total: ${totals['total']}")


class TestAdminProducts:
    """Tests for admin product management"""
    
    def get_admin_token(self):
        """Helper to get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "pnice2024"}
        )
        if response.status_code == 200:
            return response.json().get('token')
        return None
    
    def test_admin_login(self):
        """POST /api/admin/login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "pnice2024"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        assert 'token' in data
        print("SUCCESS: Admin login successful")
    
    def test_admin_get_products(self):
        """GET /api/admin/products returns products with new names"""
        token = self.get_admin_token()
        assert token, "Failed to get admin token"
        
        response = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        products = response.json()
        
        product_names = [p['name'] for p in products]
        assert "Polished Collagen Base™" in product_names
        assert "Morning Glow Creamer™" in product_names
        assert "Glow Treat Collagen™" in product_names
        assert "Night Renewal Serum™" in product_names
        assert "Deep Sleep Recovery Cream™" in product_names
        print(f"SUCCESS: Admin products show all 5 rebranded names: {product_names}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
