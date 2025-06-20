import requests
import sys
import json
from datetime import datetime, timedelta

class InvoiceFlowAPITester:
    def __init__(self, base_url="https://d7b0d4af-b651-42b5-88e2-c88951152ec8.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.client_id = None
        self.invoice_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except json.JSONDecodeError:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health endpoint"""
        return self.run_test("API Health Check", "GET", "health", 200)

    def test_register(self, email, name, password):
        """Test user registration"""
        data = {
            "email": email,
            "name": name,
            "password": password
        }
        success, response = self.run_test("User Registration", "POST", "register", 200, data=data)
        if success:
            self.user_id = response.get('id')
        return success

    def test_login(self, email, password):
        """Test login and get token"""
        data = {
            "email": email,
            "password": password
        }
        success, response = self.run_test("User Login", "POST", "login", 200, data=data)
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test("Get Current User", "GET", "me", 200)
        return success

    def test_create_client(self, name, email):
        """Test client creation"""
        data = {
            "name": name,
            "email": email,
            "phone": "0123456789",
            "address": "123 Test Street",
            "status": "Actif"
        }
        success, response = self.run_test("Create Client", "POST", "clients", 200, data=data)
        if success:
            self.client_id = response.get('id')
        return success

    def test_get_clients(self):
        """Test getting all clients"""
        success, response = self.run_test("Get All Clients", "GET", "clients", 200)
        return success

    def test_get_client(self):
        """Test getting a specific client"""
        if not self.client_id:
            print("❌ No client ID available for testing")
            return False
        success, _ = self.run_test("Get Client", "GET", f"clients/{self.client_id}", 200)
        return success

    def test_update_client(self):
        """Test updating a client"""
        if not self.client_id:
            print("❌ No client ID available for testing")
            return False
        data = {
            "name": "Updated Test Client",
            "email": "updated@test.com",
            "phone": "9876543210",
            "address": "456 Updated Street",
            "status": "Actif"
        }
        success, _ = self.run_test("Update Client", "PUT", f"clients/{self.client_id}", 200, data=data)
        return success

    def test_create_invoice(self):
        """Test invoice creation"""
        if not self.client_id:
            print("❌ No client ID available for testing")
            return False
        
        due_date = (datetime.now() + timedelta(days=30)).isoformat()
        data = {
            "client_id": self.client_id,
            "due_date": due_date,
            "status": "Brouillon",
            "description": "Test Invoice",
            "items": [
                {
                    "description": "Test Item 1",
                    "quantity": 2,
                    "price": 100.0
                },
                {
                    "description": "Test Item 2",
                    "quantity": 1,
                    "price": 50.0
                }
            ]
        }
        success, response = self.run_test("Create Invoice", "POST", "invoices", 200, data=data)
        if success:
            self.invoice_id = response.get('id')
        return success

    def test_get_invoices(self):
        """Test getting all invoices"""
        success, _ = self.run_test("Get All Invoices", "GET", "invoices", 200)
        return success

    def test_get_invoice(self):
        """Test getting a specific invoice"""
        if not self.invoice_id:
            print("❌ No invoice ID available for testing")
            return False
        success, _ = self.run_test("Get Invoice", "GET", f"invoices/{self.invoice_id}", 200)
        return success

    def test_update_invoice_status(self):
        """Test updating invoice status"""
        if not self.invoice_id:
            print("❌ No invoice ID available for testing")
            return False
        success, _ = self.run_test("Update Invoice Status", "PUT", f"invoices/{self.invoice_id}/status", 200, params={"status": "Envoyé"})
        return success

    def test_get_dashboard(self):
        """Test getting dashboard data"""
        success, _ = self.run_test("Get Dashboard Data", "GET", "dashboard", 200)
        return success

    def test_delete_client(self):
        """Test client deletion"""
        if not self.client_id:
            print("❌ No client ID available for testing")
            return False
        success, _ = self.run_test("Delete Client", "DELETE", f"clients/{self.client_id}", 200)
        return success

def main():
    # Setup
    tester = InvoiceFlowAPITester()
    test_email = f"test_user_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com"
    test_name = "Test User"
    test_password = "TestPassword123"
    demo_email = "demo@invoiceflow.com"
    demo_password = "demo123"

    # Run tests
    print("\n===== TESTING INVOICEFLOW API =====\n")
    
    # Test health check
    tester.test_health_check()
    
    # Test registration
    tester.test_register(test_email, test_name, test_password)
    
    # Test login with new account
    if not tester.test_login(test_email, test_password):
        print("❌ Login with new account failed, trying demo account")
        if not tester.test_login(demo_email, demo_password):
            print("❌ Login with demo account failed, stopping tests")
            return 1
    
    # Test getting current user
    tester.test_get_current_user()
    
    # Test client operations
    client_name = f"Test Client {datetime.now().strftime('%Y%m%d%H%M%S')}"
    client_email = f"client_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com"
    
    if tester.test_create_client(client_name, client_email):
        tester.test_get_clients()
        tester.test_get_client()
        tester.test_update_client()
    
    # Test invoice operations
    if tester.client_id:
        if tester.test_create_invoice():
            tester.test_get_invoices()
            tester.test_get_invoice()
            tester.test_update_invoice_status()
    
    # Test dashboard
    tester.test_get_dashboard()
    
    # Test client deletion (cleanup)
    if tester.client_id:
        tester.test_delete_client()
    
    # Print results
    print(f"\n===== TEST RESULTS =====")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run} ({tester.tests_passed/tester.tests_run*100:.1f}%)")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())