"""
Backend API Tests for Admin Features: Price Editing and Promotions CRUD
Tests the following endpoints:
- POST /api/admin/login - Admin authentication
- PATCH /api/admin/products/{id}/price - Quick price update
- GET /api/admin/promotions - Get all promotions
- POST /api/admin/promotions - Create new promotion
- PUT /api/admin/promotions/{code} - Update promotion
- DELETE /api/admin/promotions/{code} - Delete promotion
- PATCH /api/admin/promotions/{code}/toggle - Toggle promotion active status
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://pnice-skincare.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "pnice2024"


class TestAdminAuth:
    """Tests for admin login and authentication"""
    
    def test_admin_login_success(self):
        """Test successful admin login"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "success" in data
        assert data["success"] == True
        assert "token" in data
        assert len(data["token"]) > 0
        print(f"✅ Admin login successful, token received")
    
    def test_admin_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "wronguser",
            "password": "wrongpass"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✅ Invalid credentials correctly rejected with 401")
    
    def test_admin_verify_valid_token(self):
        """Test token verification"""
        # First login
        login_resp = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        token = login_resp.json()["token"]
        
        # Verify token
        verify_resp = requests.get(f"{BASE_URL}/api/admin/verify", headers={
            "Authorization": f"Bearer {token}"
        })
        assert verify_resp.status_code == 200
        data = verify_resp.json()
        assert data.get("valid") == True
        print(f"✅ Token verification successful")
    
    def test_admin_verify_invalid_token(self):
        """Test with invalid token"""
        verify_resp = requests.get(f"{BASE_URL}/api/admin/verify", headers={
            "Authorization": "Bearer invalid_token_here"
        })
        assert verify_resp.status_code == 401
        print(f"✅ Invalid token correctly rejected")


@pytest.fixture
def admin_token():
    """Get a valid admin token for authenticated tests"""
    response = requests.post(f"{BASE_URL}/api/admin/login", json={
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip("Could not authenticate as admin")
    return response.json()["token"]


class TestQuickPriceUpdate:
    """Tests for the quick price update PATCH endpoint"""
    
    def test_quick_price_update_success(self, admin_token):
        """Test updating product price via PATCH"""
        product_id = "unflavored-collagen"
        new_price = 42.99
        
        response = requests.patch(
            f"{BASE_URL}/api/admin/products/{product_id}/price",
            json={"price": new_price},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Price update failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert data.get("product_id") == product_id
        assert "updated" in data
        print(f"✅ Quick price update successful: {data['updated']}")
        
        # Reset price back
        requests.patch(
            f"{BASE_URL}/api/admin/products/{product_id}/price",
            json={"price": 39.99},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_quick_price_update_multiple_fields(self, admin_token):
        """Test updating price, compare_at_price, and subscription_price"""
        product_id = "vanilla-creamer"
        
        response = requests.patch(
            f"{BASE_URL}/api/admin/products/{product_id}/price",
            json={
                "price": 47.99,
                "compare_at_price": 59.99,
                "subscription_price": 38.99
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        updated = data.get("updated", {})
        assert "price" in updated or updated.get("price") == 47.99
        print(f"✅ Multiple price fields updated: {updated}")
        
        # Reset prices back
        requests.patch(
            f"{BASE_URL}/api/admin/products/{product_id}/price",
            json={"price": 44.99, "compare_at_price": 54.99, "subscription_price": 35.99},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_quick_price_update_no_fields(self, admin_token):
        """Test update with empty payload should fail"""
        response = requests.patch(
            f"{BASE_URL}/api/admin/products/unflavored-collagen/price",
            json={},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400 for empty payload, got {response.status_code}"
        print(f"✅ Empty payload correctly rejected with 400")
    
    def test_quick_price_update_unauthorized(self):
        """Test price update without auth token"""
        response = requests.patch(
            f"{BASE_URL}/api/admin/products/unflavored-collagen/price",
            json={"price": 50.00}
        )
        
        assert response.status_code == 401
        print(f"✅ Unauthorized request correctly rejected")


class TestPromotionsGet:
    """Tests for GET /api/admin/promotions"""
    
    def test_get_all_promotions(self, admin_token):
        """Test fetching all promotions"""
        response = requests.get(
            f"{BASE_URL}/api/admin/promotions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Retrieved {len(data)} promotions")
        
        # Check pre-existing promotions
        codes = [p["code"] for p in data]
        assert "WELCOME10" in codes, "WELCOME10 should exist"
        assert "SAVE15" in codes, "SAVE15 should exist"
        assert "FIRST20" in codes, "FIRST20 should exist"
        assert "FLAT10" in codes, "FLAT10 should exist"
        print(f"✅ All 4 default promotions exist: WELCOME10, SAVE15, FIRST20, FLAT10")
    
    def test_promotion_structure(self, admin_token):
        """Test that promotions have correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/admin/promotions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        data = response.json()
        promo = data[0]  # Check first promotion
        
        required_fields = ["code", "discount_type", "discount_value", "active"]
        for field in required_fields:
            assert field in promo, f"Missing required field: {field}"
        
        print(f"✅ Promotion structure is valid with all required fields")
    
    def test_get_promotions_unauthorized(self):
        """Test get promotions without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/promotions")
        assert response.status_code == 401
        print(f"✅ Unauthorized request correctly rejected")


class TestPromotionsCreate:
    """Tests for POST /api/admin/promotions"""
    
    def test_create_promotion_percentage(self, admin_token):
        """Test creating a percentage discount promotion"""
        test_code = f"TEST_{uuid.uuid4().hex[:6].upper()}"
        
        response = requests.post(
            f"{BASE_URL}/api/admin/promotions",
            json={
                "code": test_code,
                "name": "Test Percentage Promo",
                "description": "Test promotion",
                "discount_type": "percentage",
                "discount_value": 25.0,
                "min_order": 30.0,
                "active": True
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert data.get("code") == test_code
        print(f"✅ Created percentage promotion: {test_code}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/promotions/{test_code}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_create_promotion_fixed(self, admin_token):
        """Test creating a fixed amount discount promotion"""
        test_code = f"FIXED_{uuid.uuid4().hex[:6].upper()}"
        
        response = requests.post(
            f"{BASE_URL}/api/admin/promotions",
            json={
                "code": test_code,
                "discount_type": "fixed",
                "discount_value": 15.0,
                "min_order": 50.0,
                "max_uses": 100,
                "active": True
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Created fixed amount promotion: {test_code}")
        
        # Verify it's in the list
        list_resp = requests.get(
            f"{BASE_URL}/api/admin/promotions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        codes = [p["code"] for p in list_resp.json()]
        assert test_code in codes, f"New promotion {test_code} should be in list"
        print(f"✅ Verified promotion exists in list")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/promotions/{test_code}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_create_duplicate_promotion(self, admin_token):
        """Test creating a promotion with existing code fails"""
        response = requests.post(
            f"{BASE_URL}/api/admin/promotions",
            json={
                "code": "WELCOME10",  # Already exists
                "discount_type": "percentage",
                "discount_value": 50.0
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400 for duplicate, got {response.status_code}"
        print(f"✅ Duplicate promotion correctly rejected with 400")


class TestPromotionsUpdate:
    """Tests for PUT /api/admin/promotions/{code}"""
    
    def test_update_promotion(self, admin_token):
        """Test updating an existing promotion"""
        # First create a test promotion
        test_code = f"UPDT_{uuid.uuid4().hex[:6].upper()}"
        requests.post(
            f"{BASE_URL}/api/admin/promotions",
            json={
                "code": test_code,
                "discount_type": "percentage",
                "discount_value": 10.0,
                "min_order": 20.0,
                "active": True
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Update it
        response = requests.put(
            f"{BASE_URL}/api/admin/promotions/{test_code}",
            json={
                "discount_value": 30.0,
                "min_order": 50.0
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Updated promotion: {test_code}")
        
        # Verify the update
        list_resp = requests.get(
            f"{BASE_URL}/api/admin/promotions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        updated_promo = next((p for p in list_resp.json() if p["code"] == test_code), None)
        assert updated_promo is not None
        assert updated_promo["discount_value"] == 30.0
        assert updated_promo["min_order"] == 50.0
        print(f"✅ Verified update persisted: discount_value=30.0, min_order=50.0")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/promotions/{test_code}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_update_nonexistent_promotion(self, admin_token):
        """Test updating a promotion that doesn't exist"""
        response = requests.put(
            f"{BASE_URL}/api/admin/promotions/NONEXISTENT_CODE",
            json={"discount_value": 50.0},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404
        print(f"✅ Update nonexistent promotion correctly returned 404")


class TestPromotionsToggle:
    """Tests for PATCH /api/admin/promotions/{code}/toggle"""
    
    def test_toggle_promotion_active(self, admin_token):
        """Test toggling promotion active status"""
        # Create a test promotion
        test_code = f"TOGL_{uuid.uuid4().hex[:6].upper()}"
        requests.post(
            f"{BASE_URL}/api/admin/promotions",
            json={
                "code": test_code,
                "discount_type": "percentage",
                "discount_value": 10.0,
                "active": True
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Toggle to inactive
        response = requests.patch(
            f"{BASE_URL}/api/admin/promotions/{test_code}/toggle",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert data.get("active") == False  # Should be toggled to False
        print(f"✅ Toggled promotion to inactive")
        
        # Toggle back to active
        response2 = requests.patch(
            f"{BASE_URL}/api/admin/promotions/{test_code}/toggle",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2.get("active") == True  # Should be toggled back to True
        print(f"✅ Toggled promotion back to active")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/promotions/{test_code}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_toggle_nonexistent_promotion(self, admin_token):
        """Test toggling a promotion that doesn't exist"""
        response = requests.patch(
            f"{BASE_URL}/api/admin/promotions/NONEXISTENT_CODE/toggle",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404
        print(f"✅ Toggle nonexistent promotion correctly returned 404")


class TestPromotionsDelete:
    """Tests for DELETE /api/admin/promotions/{code}"""
    
    def test_delete_promotion(self, admin_token):
        """Test deleting a promotion"""
        # Create a test promotion
        test_code = f"DEL_{uuid.uuid4().hex[:6].upper()}"
        create_resp = requests.post(
            f"{BASE_URL}/api/admin/promotions",
            json={
                "code": test_code,
                "discount_type": "percentage",
                "discount_value": 10.0
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert create_resp.status_code == 200
        
        # Delete it
        response = requests.delete(
            f"{BASE_URL}/api/admin/promotions/{test_code}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Deleted promotion: {test_code}")
        
        # Verify it's gone
        list_resp = requests.get(
            f"{BASE_URL}/api/admin/promotions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        codes = [p["code"] for p in list_resp.json()]
        assert test_code not in codes, f"Deleted promotion {test_code} should not be in list"
        print(f"✅ Verified promotion no longer exists")
    
    def test_delete_nonexistent_promotion(self, admin_token):
        """Test deleting a promotion that doesn't exist"""
        response = requests.delete(
            f"{BASE_URL}/api/admin/promotions/NONEXISTENT_CODE",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 404
        print(f"✅ Delete nonexistent promotion correctly returned 404")


class TestAdminProducts:
    """Test admin products endpoint to verify 5 products exist"""
    
    def test_get_admin_products(self, admin_token):
        """Test fetching all products from admin endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        products = response.json()
        assert isinstance(products, list)
        assert len(products) >= 5, f"Expected at least 5 products, got {len(products)}"
        
        # Verify required products
        product_ids = [p["id"] for p in products]
        expected_products = [
            "unflavored-collagen",
            "vanilla-creamer", 
            "chocolate-collagen",
            "retinol-serum",
            "sleep-cream"
        ]
        for pid in expected_products:
            assert pid in product_ids, f"Product {pid} should exist"
        
        print(f"✅ Retrieved {len(products)} products, all 5 expected products exist")
    
    def test_products_have_price_fields(self, admin_token):
        """Test that products have price, compare_at_price, subscription_price fields"""
        response = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        products = response.json()
        for product in products:
            assert "price" in product, f"Product {product['id']} missing price field"
            assert "compare_at_price" in product or product.get("compare_at_price") is None
            assert "subscription_price" in product or product.get("subscription_price") is None
        
        print(f"✅ All products have required price fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
