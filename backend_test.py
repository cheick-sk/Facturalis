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
        self.quote_id = None
        self.product_id = None
        self.expense_id = None

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

    # ===== AUTH TESTS =====
    def test_health_check(self):
        """Test API health endpoint"""
        return self.run_test("API Health Check", "GET", "health", 200)

    def test_register(self, email, name, password, company_name="Test Company", siret="12345678901234"):
        """Test user registration with company info"""
        data = {
            "email": email,
            "name": name,
            "password": password,
            "company_name": company_name,
            "siret": siret,
            "address": "123 Test Street, 75001 Paris",
            "phone": "0123456789"
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

    def test_update_profile(self):
        """Test updating user profile"""
        data = {
            "name": "Updated Test User",
            "company_name": "Updated Company",
            "siret": "98765432109876",
            "address": "456 Updated Street, 75002 Paris",
            "phone": "9876543210"
        }
        success, _ = self.run_test("Update User Profile", "PUT", "me", 200, data=data)
        return success

    # ===== CLIENT TESTS =====
    def test_create_client(self, name, email, siret="12345678901234"):
        """Test client creation with full info"""
        data = {
            "name": name,
            "email": email,
            "phone": "0123456789",
            "address": "123 Client Street, 75001 Paris",
            "status": "Actif",
            "siret": siret,
            "contact_person": "Contact Person",
            "notes": "Test client notes"
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
            "address": "456 Updated Street, 75002 Paris",
            "status": "Actif",
            "siret": "98765432109876",
            "contact_person": "Updated Contact Person",
            "notes": "Updated test client notes"
        }
        success, _ = self.run_test("Update Client", "PUT", f"clients/{self.client_id}", 200, data=data)
        return success

    def test_delete_client(self):
        """Test client deletion"""
        if not self.client_id:
            print("❌ No client ID available for testing")
            return False
        success, _ = self.run_test("Delete Client", "DELETE", f"clients/{self.client_id}", 200)
        return success

    # ===== PRODUCT TESTS =====
    def test_create_product(self, name="Test Product", price=100.0):
        """Test product creation"""
        data = {
            "name": name,
            "description": "Test product description",
            "price": price,
            "unit": "heure",
            "category": "Développement",
            "is_service": True
        }
        success, response = self.run_test("Create Product", "POST", "products", 200, data=data)
        if success:
            self.product_id = response.get('id')
        return success

    def test_get_products(self):
        """Test getting all products"""
        success, _ = self.run_test("Get All Products", "GET", "products", 200)
        return success

    def test_update_product(self):
        """Test updating a product"""
        if not self.product_id:
            print("❌ No product ID available for testing")
            return False
        data = {
            "name": "Updated Test Product",
            "description": "Updated test product description",
            "price": 150.0,
            "unit": "jour",
            "category": "Design",
            "is_service": True
        }
        success, _ = self.run_test("Update Product", "PUT", f"products/{self.product_id}", 200, data=data)
        return success

    def test_delete_product(self):
        """Test product deletion"""
        if not self.product_id:
            print("❌ No product ID available for testing")
            return False
        success, _ = self.run_test("Delete Product", "DELETE", f"products/{self.product_id}", 200)
        return success

    # ===== EXPENSE TESTS =====
    def test_create_expense(self, title="Test Expense", amount=100.0):
        """Test expense creation"""
        data = {
            "title": title,
            "description": "Test expense description",
            "amount": amount,
            "category": "Transport",
            "expense_date": datetime.now().isoformat(),
            "is_billable": True,
            "client_id": self.client_id,
            "status": "En attente"
        }
        success, response = self.run_test("Create Expense", "POST", "expenses", 200, data=data)
        if success:
            self.expense_id = response.get('id')
        return success

    def test_get_expenses(self):
        """Test getting all expenses"""
        success, _ = self.run_test("Get All Expenses", "GET", "expenses", 200)
        return success

    def test_update_expense(self):
        """Test updating an expense"""
        if not self.expense_id:
            print("❌ No expense ID available for testing")
            return False
        data = {
            "title": "Updated Test Expense",
            "description": "Updated test expense description",
            "amount": 150.0,
            "category": "Repas",
            "expense_date": datetime.now().isoformat(),
            "is_billable": False,
            "status": "Approuvé"
        }
        success, _ = self.run_test("Update Expense", "PUT", f"expenses/{self.expense_id}", 200, data=data)
        return success

    def test_delete_expense(self):
        """Test expense deletion"""
        if not self.expense_id:
            print("❌ No expense ID available for testing")
            return False
        success, _ = self.run_test("Delete Expense", "DELETE", f"expenses/{self.expense_id}", 200)
        return success

    # ===== QUOTE TESTS =====
    def test_create_quote(self):
        """Test quote creation"""
        if not self.client_id:
            print("❌ No client ID available for testing")
            return False
        
        expiry_date = (datetime.now() + timedelta(days=30)).isoformat()
        data = {
            "client_id": self.client_id,
            "expiry_date": expiry_date,
            "status": "Brouillon",
            "description": "Test Quote",
            "notes": "Test quote notes",
            "discount": 0,
            "items": [
                {
                    "description": "Test Quote Item 1",
                    "quantity": 2,
                    "price": 100.0,
                    "tax_rate": 20.0,
                    "product_id": self.product_id
                },
                {
                    "description": "Test Quote Item 2",
                    "quantity": 1,
                    "price": 50.0,
                    "tax_rate": 20.0
                }
            ]
        }
        success, response = self.run_test("Create Quote", "POST", "quotes", 200, data=data)
        if success:
            self.quote_id = response.get('id')
        return success

    def test_get_quotes(self):
        """Test getting all quotes"""
        success, _ = self.run_test("Get All Quotes", "GET", "quotes", 200)
        return success

    def test_update_quote_status(self, status="Envoyé"):
        """Test updating quote status"""
        if not self.quote_id:
            print("❌ No quote ID available for testing")
            return False
        success, _ = self.run_test("Update Quote Status", "PUT", f"quotes/{self.quote_id}/status", 200, params={"status": status})
        return success

    def test_convert_quote_to_invoice(self):
        """Test converting quote to invoice"""
        if not self.quote_id:
            print("❌ No quote ID available for testing")
            return False
        success, response = self.run_test("Convert Quote to Invoice", "POST", f"quotes/{self.quote_id}/convert", 200)
        if success:
            self.invoice_id = response.get('id')
        return success

    # ===== INVOICE TESTS =====
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
            "notes": "Test invoice notes",
            "payment_terms": "30 jours",
            "discount": 0,
            "items": [
                {
                    "description": "Test Invoice Item 1",
                    "quantity": 2,
                    "price": 100.0,
                    "tax_rate": 20.0,
                    "product_id": self.product_id
                },
                {
                    "description": "Test Invoice Item 2",
                    "quantity": 1,
                    "price": 50.0,
                    "tax_rate": 20.0
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

    def test_update_invoice_status(self, status="Envoyé"):
        """Test updating invoice status"""
        if not self.invoice_id:
            print("❌ No invoice ID available for testing")
            return False
        success, _ = self.run_test("Update Invoice Status", "PUT", f"invoices/{self.invoice_id}/status", 200, params={"status": status})
        return success

    # ===== DASHBOARD & REPORTS TESTS =====
    def test_get_dashboard(self):
        """Test getting dashboard data"""
        success, _ = self.run_test("Get Dashboard Data", "GET", "dashboard", 200)
        return success

    def test_get_financial_report(self, period="month"):
        """Test getting financial report"""
        success, _ = self.run_test("Get Financial Report", "GET", "reports/financial", 200, params={"period": period})
        return success

    def test_get_cashflow_report(self):
        """Test getting cashflow report"""
        success, _ = self.run_test("Get Cashflow Report", "GET", "reports/cashflow", 200)
        return success

def main():
    # Setup
    tester = InvoiceFlowAPITester()
    test_email = f"test_user_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com"
    test_name = "Test User"
    test_password = "TestPassword123"
    admin_email = "admin@invoiceflow.fr"
    admin_password = "admin123"

    # Run tests
    print("\n===== TESTING INVOICEFLOW API v2.0 =====\n")
    
    # Test health check
    tester.test_health_check()
    
    # Test registration
    tester.test_register(test_email, test_name, test_password)
    
    # Test login with admin account first (as mentioned in the request)
    if not tester.test_login(admin_email, admin_password):
        print("❌ Login with admin account failed, trying new account")
        if not tester.test_login(test_email, test_password):
            print("❌ Login with new account failed, stopping tests")
            return 1
    
    # Test getting current user
    tester.test_get_current_user()
    
    # Test updating profile
    tester.test_update_profile()
    
    # Test product operations
    print("\n===== TESTING PRODUCT OPERATIONS =====")
    if tester.test_create_product("Développement Web", 120.0):
        tester.test_get_products()
        tester.test_update_product()
    
    # Test client operations
    print("\n===== TESTING CLIENT OPERATIONS =====")
    client_name = f"Test Client {datetime.now().strftime('%Y%m%d%H%M%S')}"
    client_email = f"client_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com"
    
    if tester.test_create_client(client_name, client_email):
        tester.test_get_clients()
        tester.test_get_client()
        tester.test_update_client()
    
    # Test expense operations
    print("\n===== TESTING EXPENSE OPERATIONS =====")
    if tester.client_id:
        if tester.test_create_expense("Déplacement client", 85.50):
            tester.test_get_expenses()
            tester.test_update_expense()
    
    # Test quote operations
    print("\n===== TESTING QUOTE OPERATIONS =====")
    if tester.client_id and tester.product_id:
        if tester.test_create_quote():
            tester.test_get_quotes()
            tester.test_update_quote_status("Envoyé")
            tester.test_update_quote_status("Accepté")
            tester.test_convert_quote_to_invoice()
    
    # Test invoice operations
    print("\n===== TESTING INVOICE OPERATIONS =====")
    if tester.client_id and tester.product_id:
        # Create a new invoice if we don't have one from quote conversion
        if not tester.invoice_id:
            tester.test_create_invoice()
        
        if tester.invoice_id:
            tester.test_get_invoices()
            tester.test_get_invoice()
            tester.test_update_invoice_status("Envoyé")
            tester.test_update_invoice_status("Payé")
    
    # Test dashboard and reports
    print("\n===== TESTING DASHBOARD & REPORTS =====")
    tester.test_get_dashboard()
    tester.test_get_financial_report("month")
    tester.test_get_financial_report("quarter")
    tester.test_get_financial_report("year")
    tester.test_get_cashflow_report()
    
    # Cleanup (optional)
    print("\n===== CLEANUP =====")
    if tester.expense_id:
        tester.test_delete_expense()
    
    if tester.product_id:
        tester.test_delete_product()
    
    if tester.client_id:
        tester.test_delete_client()
    
    # Print results
    print(f"\n===== TEST RESULTS =====")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run} ({tester.tests_passed/tester.tests_run*100:.1f}%)")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())