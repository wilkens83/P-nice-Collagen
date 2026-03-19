#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime
import os
import tempfile

class AdminBackendTester:
    def __init__(self, base_url="https://polished-wellness.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None

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

    def test_admin_login(self):
        """Test admin login with correct credentials"""
        try:
            payload = {
                "username": "admin",
                "password": "pnice2024"
            }
            response = requests.post(f"{self.base_url}/admin/login", json=payload, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.admin_token = data.get('token')
                details = f"Token received: {self.admin_token[:20]}..." if self.admin_token else "No token"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            
            self.log_test("Admin Login", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Login", False, str(e))
            return False

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        try:
            payload = {
                "username": "admin",
                "password": "wrong_password"
            }
            response = requests.post(f"{self.base_url}/admin/login", json=payload, timeout=10)
            success = response.status_code == 401  # Should return 401 for invalid creds
            
            details = f"Correctly rejected invalid credentials with status {response.status_code}"
            self.log_test("Admin Login (Invalid Credentials)", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Login (Invalid Credentials)", False, str(e))
            return False

    def test_admin_verify_token(self):
        """Test admin token verification"""
        if not self.admin_token:
            self.log_test("Admin Token Verification", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/verify", headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                details = "Token is valid"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Admin Token Verification", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Token Verification", False, str(e))
            return False

    def test_admin_stats(self):
        """Test admin dashboard stats endpoint"""
        if not self.admin_token:
            self.log_test("Admin Stats", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/stats", headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                products = data.get('total_products', 0)
                revenue = data.get('total_revenue', 0)
                orders = data.get('total_orders', 0)
                subscribers = data.get('total_subscribers', 0)
                details = f"Products: {products}, Revenue: ${revenue}, Orders: {orders}, Subscribers: {subscribers}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Admin Dashboard Stats", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Dashboard Stats", False, str(e))
            return False

    def test_admin_products(self):
        """Test admin products endpoint"""
        if not self.admin_token:
            self.log_test("Admin Products", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/products", headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                product_count = len(data)
                product_names = [p.get('name', 'Unknown')[:20] for p in data[:3]]
                details = f"Found {product_count} products: {', '.join(product_names)}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Admin Get Products", success, details)
            return success, data if success else []
        except Exception as e:
            self.log_test("Admin Get Products", False, str(e))
            return False, []

    def test_admin_orders(self):
        """Test admin orders endpoint"""
        if not self.admin_token:
            self.log_test("Admin Orders", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/orders", headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                orders_count = len(data)
                details = f"Found {orders_count} orders"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Admin Get Orders", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Get Orders", False, str(e))
            return False

    def test_admin_customers(self):
        """Test admin customers endpoint"""
        if not self.admin_token:
            self.log_test("Admin Customers", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/customers", headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                customers_count = len(data)
                details = f"Found {customers_count} customers"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Admin Get Customers", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Get Customers", False, str(e))
            return False

    def test_admin_uploads_list(self):
        """Test admin uploads list endpoint"""
        if not self.admin_token:
            self.log_test("Admin Uploads List", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{self.base_url}/admin/uploads", headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                uploads_count = len(data)
                details = f"Found {uploads_count} uploaded files"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Admin Get Uploads", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Get Uploads", False, str(e))
            return False

    def test_admin_image_upload(self):
        """Test admin image upload functionality"""
        if not self.admin_token:
            self.log_test("Admin Image Upload", False, "No admin token available")
            return False
        
        try:
            # Create a small test image (1x1 pixel PNG)
            test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
            
            files = {'file': ('test_image.png', test_image_data, 'image/png')}
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            response = requests.post(f"{self.base_url}/admin/upload", files=files, headers=headers, timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                url = data.get('url', '')
                filename = data.get('filename', '')
                details = f"Upload successful: {filename}, URL: {url}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            
            self.log_test("Admin Image Upload", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Image Upload", False, str(e))
            return False

    def test_discount_validation(self):
        """Test discount code validation API"""
        try:
            # Create a cart first
            cart_response = requests.post(f"{self.base_url}/cart", timeout=10)
            if cart_response.status_code != 200:
                self.log_test("Discount Validation", False, "Could not create cart for testing")
                return False
            
            cart_id = cart_response.json().get('id')
            
            # Add item to cart
            add_payload = {
                "product_id": "unflavored-collagen",
                "quantity": 1,
                "is_subscription": False
            }
            requests.post(f"{self.base_url}/cart/{cart_id}/items", json=add_payload, timeout=10)
            
            # Test discount validation
            discount_payload = {
                "cart_id": cart_id,
                "discount_code": "WELCOME10"
            }
            response = requests.post(f"{self.base_url}/discount/validate", json=discount_payload, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                code = data.get('code')
                discount_amount = data.get('discount_amount', 0)
                details = f"Code: {code}, Discount: ${discount_amount}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Discount Code Validation", success, details)
            return success
        except Exception as e:
            self.log_test("Discount Code Validation", False, str(e))
            return False

    def test_cart_tax_calculation(self):
        """Test cart totals with tax calculation"""
        try:
            # Create a cart first
            cart_response = requests.post(f"{self.base_url}/cart", timeout=10)
            if cart_response.status_code != 200:
                self.log_test("Tax Calculation", False, "Could not create cart for testing")
                return False
            
            cart_id = cart_response.json().get('id')
            
            # Add item to cart
            add_payload = {
                "product_id": "unflavored-collagen",
                "quantity": 1,
                "is_subscription": False
            }
            requests.post(f"{self.base_url}/cart/{cart_id}/items", json=add_payload, timeout=10)
            
            # Get cart totals with tax
            response = requests.get(f"{self.base_url}/cart/{cart_id}/totals", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                subtotal = data.get('subtotal', 0)
                tax = data.get('tax', 0)
                tax_rate = data.get('tax_rate', 0)
                total = data.get('total', 0)
                details = f"Subtotal: ${subtotal}, Tax: ${tax} ({tax_rate}%), Total: ${total}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Cart Tax Calculation", success, details)
            return success
        except Exception as e:
            self.log_test("Cart Tax Calculation", False, str(e))
            return False

    def test_admin_logout(self):
        """Test admin logout"""
        if not self.admin_token:
            self.log_test("Admin Logout", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.post(f"{self.base_url}/admin/logout", headers=headers, timeout=10)
            success = response.status_code == 200
            
            details = "Logout successful" if success else f"Status: {response.status_code}"
            self.log_test("Admin Logout", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Logout", False, str(e))
            return False

    def run_all_tests(self):
        """Run all admin API tests"""
        print("🧪 Starting P-Nice Admin API Tests...")
        print(f"🔗 Testing against: {self.base_url}")
        print("=" * 60)

        # Authentication tests
        if not self.test_admin_login():
            print("\n❌ Admin login failed. Cannot proceed with admin tests.")
            return False
        
        # Test invalid login too
        self.test_admin_login_invalid()
        
        # Token verification
        self.test_admin_verify_token()

        # Admin dashboard endpoints
        self.test_admin_stats()
        self.test_admin_products()
        self.test_admin_orders()
        self.test_admin_customers()
        self.test_admin_uploads_list()

        # Media upload test
        self.test_admin_image_upload()

        # Additional functionality tests
        self.test_discount_validation()
        self.test_cart_tax_calculation()

        # Logout
        self.test_admin_logout()

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
            print("🎉 All admin backend tests passed!")
            return True

def main():
    """Main test runner"""
    tester = AdminBackendTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())