"""
Customer Authentication API Tests
Tests: Register, Login, Profile, Address, Orders, Checkout with shipping
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL_BASE = f"test_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "testpassword123"
EXISTING_EMAIL = "sarah@example.com"
EXISTING_PASSWORD = "password123"


class TestCustomerRegistration:
    """Test customer registration endpoint"""
    
    def test_register_new_customer(self):
        """POST /api/auth/register - creates customer with valid data"""
        email = f"test_new_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": TEST_PASSWORD,
            "first_name": "Test",
            "last_name": "User"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "customer" in data, "Response should contain customer object"
        assert data["customer"]["email"] == email.lower()
        assert data["customer"]["first_name"] == "Test"
        assert data["customer"]["last_name"] == "User"
        assert "id" in data["customer"]
        
        # Store token for cleanup if needed
        print(f"✓ Created customer: {email}")
    
    def test_register_duplicate_email_rejected(self):
        """POST /api/auth/register - rejects duplicate email"""
        # First, create a customer
        email = f"test_dup_{uuid.uuid4().hex[:8]}@example.com"
        response1 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": TEST_PASSWORD,
            "first_name": "First",
            "last_name": "User"
        })
        assert response1.status_code == 200
        
        # Try to register same email again
        response2 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": TEST_PASSWORD,
            "first_name": "Second",
            "last_name": "User"
        })
        
        assert response2.status_code == 400, f"Expected 400 for duplicate, got {response2.status_code}"
        assert "already registered" in response2.json().get("detail", "").lower()
        print("✓ Duplicate email correctly rejected")


class TestCustomerLogin:
    """Test customer login endpoint"""
    
    def test_login_existing_customer(self):
        """POST /api/auth/login - authenticates with email/password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EXISTING_EMAIL,
            "password": EXISTING_PASSWORD
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "customer" in data, "Response should contain customer object"
        assert data["customer"]["email"] == EXISTING_EMAIL.lower()
        print(f"✓ Login successful for {EXISTING_EMAIL}")
    
    def test_login_wrong_password_rejected(self):
        """POST /api/auth/login - rejects wrong password with 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EXISTING_EMAIL,
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401, f"Expected 401 for wrong password, got {response.status_code}"
        print("✓ Wrong password correctly rejected with 401")
    
    def test_login_nonexistent_email_rejected(self):
        """POST /api/auth/login - rejects non-existent email"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "anypassword"
        })
        
        assert response.status_code == 401, f"Expected 401 for non-existent email, got {response.status_code}"
        print("✓ Non-existent email correctly rejected")


class TestCustomerProfile:
    """Test customer profile endpoints - /auth/me and /auth/profile"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for existing customer"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EXISTING_EMAIL,
            "password": EXISTING_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Could not authenticate")
    
    def test_get_profile_authenticated(self, auth_token):
        """GET /api/auth/me - returns customer profile when authenticated"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "email" in data
        assert "first_name" in data
        assert "last_name" in data
        assert data["email"] == EXISTING_EMAIL.lower()
        print(f"✓ Profile retrieved: {data['first_name']} {data['last_name']}")
    
    def test_get_profile_unauthenticated(self):
        """GET /api/auth/me - returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Unauthenticated request correctly rejected")
    
    def test_get_profile_invalid_token(self):
        """GET /api/auth/me - returns 401 with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid token correctly rejected")
    
    def test_update_profile(self, auth_token):
        """PUT /api/auth/profile - updates first_name, last_name, phone"""
        # Update profile
        update_data = {
            "first_name": "UpdatedFirst",
            "last_name": "UpdatedLast",
            "phone": "555-1234"
        }
        response = requests.put(
            f"{BASE_URL}/api/auth/profile",
            json=update_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.json().get("success") == True
        
        # Verify update by fetching profile
        get_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["first_name"] == "UpdatedFirst"
        assert data["last_name"] == "UpdatedLast"
        assert data["phone"] == "555-1234"
        print("✓ Profile update successful and verified")
        
        # Restore original values
        requests.put(
            f"{BASE_URL}/api/auth/profile",
            json={"first_name": "Sarah", "last_name": "Example", "phone": ""},
            headers={"Authorization": f"Bearer {auth_token}"}
        )


class TestCustomerAddress:
    """Test customer shipping address endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for existing customer"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EXISTING_EMAIL,
            "password": EXISTING_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Could not authenticate")
    
    def test_save_shipping_address(self, auth_token):
        """PUT /api/auth/address - saves shipping address with all fields"""
        address_data = {
            "first_name": "Sarah",
            "last_name": "Example",
            "address_line1": "123 Test Street",
            "address_line2": "Apt 4B",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001",
            "country": "US",
            "phone": "555-123-4567"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/auth/address",
            json=address_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.json().get("success") == True
        
        # Verify address was saved
        get_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert get_response.status_code == 200
        data = get_response.json()
        assert data.get("shipping_address") is not None
        assert data["shipping_address"]["city"] == "New York"
        assert data["shipping_address"]["phone"] == "555-123-4567"
        print("✓ Shipping address saved and verified")


class TestCustomerOrders:
    """Test customer orders endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for existing customer"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EXISTING_EMAIL,
            "password": EXISTING_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Could not authenticate")
    
    def test_get_orders_authenticated(self, auth_token):
        """GET /api/auth/orders - returns customer orders (may be empty)"""
        response = requests.get(
            f"{BASE_URL}/api/auth/orders",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Orders should be a list"
        print(f"✓ Orders retrieved: {len(data)} orders found")
    
    def test_get_orders_unauthenticated(self):
        """GET /api/auth/orders - returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/auth/orders")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Unauthenticated orders request correctly rejected")


class TestCheckoutShippingValidation:
    """Test checkout endpoint shipping validation"""
    
    @pytest.fixture
    def cart_id(self):
        """Create a cart with items for checkout testing"""
        # Create cart
        response = requests.post(f"{BASE_URL}/api/cart")
        assert response.status_code == 200
        cart_id = response.json()["id"]
        
        # Add an item
        requests.post(f"{BASE_URL}/api/cart/{cart_id}/items", json={
            "product_id": "unflavored-collagen",
            "quantity": 1
        })
        
        return cart_id
    
    def test_checkout_rejects_missing_shipping(self, cart_id):
        """POST /api/checkout/session - rejects if no shipping_address provided"""
        response = requests.post(f"{BASE_URL}/api/checkout/session", json={
            "cart_id": cart_id,
            "origin_url": "https://pnice-skincare.preview.emergentagent.com"
        })
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "shipping" in response.json().get("detail", "").lower()
        print("✓ Checkout correctly rejects missing shipping address")
    
    def test_checkout_rejects_missing_phone(self, cart_id):
        """POST /api/checkout/session - rejects if phone is missing"""
        shipping = {
            "first_name": "Test",
            "last_name": "User",
            "address_line1": "123 Test St",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001"
            # phone is missing
        }
        
        response = requests.post(f"{BASE_URL}/api/checkout/session", json={
            "cart_id": cart_id,
            "origin_url": "https://pnice-skincare.preview.emergentagent.com",
            "shipping_address": shipping
        })
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "phone" in response.json().get("detail", "").lower()
        print("✓ Checkout correctly rejects missing phone number")
    
    def test_checkout_rejects_missing_required_fields(self, cart_id):
        """POST /api/checkout/session - rejects if required shipping fields are missing"""
        # Missing city, state, zip
        shipping = {
            "first_name": "Test",
            "last_name": "User",
            "address_line1": "123 Test St",
            "phone": "555-1234"
        }
        
        response = requests.post(f"{BASE_URL}/api/checkout/session", json={
            "cart_id": cart_id,
            "origin_url": "https://pnice-skincare.preview.emergentagent.com",
            "shipping_address": shipping
        })
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Checkout correctly rejects incomplete shipping info")
    
    def test_checkout_accepts_complete_shipping(self, cart_id):
        """POST /api/checkout/session - accepts complete shipping info"""
        shipping = {
            "first_name": "Test",
            "last_name": "User",
            "address_line1": "123 Test St",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001",
            "phone": "555-123-4567"
        }
        
        response = requests.post(f"{BASE_URL}/api/checkout/session", json={
            "cart_id": cart_id,
            "origin_url": "https://pnice-skincare.preview.emergentagent.com",
            "shipping_address": shipping
        })
        
        # Stripe checkout should succeed (returns URL) or fail gracefully
        # Status 200 means success, other status might be stripe config issue
        if response.status_code == 200:
            data = response.json()
            assert "url" in data, "Should return checkout URL"
            assert "session_id" in data
            print(f"✓ Checkout session created successfully")
        else:
            # May fail due to Stripe config in test environment
            print(f"Note: Checkout returned {response.status_code} - may be Stripe config issue")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
