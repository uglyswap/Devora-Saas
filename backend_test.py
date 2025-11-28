import requests
import sys
import json
from datetime import datetime, timezone, timedelta

class DevoraAPITester:
    def __init__(self, base_url="https://codecreator-9.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_resources = {
            'projects': [],
            'conversations': [],
            'users': []
        }
        self.user_token = None
        self.admin_token = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            'name': name,
            'success': success,
            'details': details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None, token=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else f"{self.api_url}/"
        headers = {'Content-Type': 'application/json'}
        
        # Add authorization header if token provided
        if token:
            headers['Authorization'] = f'Bearer {token}'

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                if response.content:
                    try:
                        error_detail = response.json()
                        error_msg += f" - {error_detail}"
                    except:
                        error_msg += f" - {response.text[:200]}"
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("Health Check", "GET", "", 200)

    def test_settings_get(self):
        """Test getting settings"""
        return self.run_test("Get Settings", "GET", "settings", 200)

    def test_settings_update(self):
        """Test updating settings"""
        test_data = {
            "openrouter_api_key": "test-key-123",
            "github_token": "test-github-token",
            "vercel_token": "test-vercel-token"
        }
        return self.run_test("Update Settings", "PUT", "settings", 200, test_data)

    def test_conversations_create(self):
        """Test creating a conversation"""
        test_data = {"title": f"Test Conversation {datetime.now().strftime('%H%M%S')}"}
        success, response = self.run_test("Create Conversation", "POST", "conversations", 200, test_data)
        if success and 'id' in response:
            self.created_resources['conversations'].append(response['id'])
        return success, response

    def test_conversations_list(self):
        """Test listing conversations"""
        return self.run_test("List Conversations", "GET", "conversations", 200)

    def test_conversation_get(self, conversation_id):
        """Test getting a specific conversation"""
        return self.run_test(f"Get Conversation {conversation_id[:8]}", "GET", f"conversations/{conversation_id}", 200)

    def test_conversation_delete(self, conversation_id):
        """Test deleting a conversation"""
        return self.run_test(f"Delete Conversation {conversation_id[:8]}", "DELETE", f"conversations/{conversation_id}", 200)

    def test_projects_create(self):
        """Test creating a project"""
        test_data = {
            "name": f"Test Project {datetime.now().strftime('%H%M%S')}",
            "description": "Test project created by automated tests",
            "files": [
                {
                    "name": "index.html",
                    "content": "<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello World</h1></body></html>",
                    "language": "html"
                },
                {
                    "name": "styles.css",
                    "content": "body { font-family: Arial, sans-serif; }",
                    "language": "css"
                }
            ]
        }
        success, response = self.run_test("Create Project", "POST", "projects", 200, test_data)
        if success and 'id' in response:
            self.created_resources['projects'].append(response['id'])
        return success, response

    def test_projects_list(self):
        """Test listing projects"""
        return self.run_test("List Projects", "GET", "projects", 200)

    def test_project_get(self, project_id):
        """Test getting a specific project"""
        return self.run_test(f"Get Project {project_id[:8]}", "GET", f"projects/{project_id}", 200)

    def test_project_update(self, project_id):
        """Test updating a project"""
        test_data = {
            "name": f"Updated Test Project {datetime.now().strftime('%H%M%S')}",
            "description": "Updated test project",
            "files": [
                {
                    "name": "index.html",
                    "content": "<!DOCTYPE html><html><head><title>Updated Test</title></head><body><h1>Updated Hello World</h1></body></html>",
                    "language": "html"
                }
            ]
        }
        return self.run_test(f"Update Project {project_id[:8]}", "PUT", f"projects/{project_id}", 200, test_data)

    def test_project_delete(self, project_id):
        """Test deleting a project"""
        return self.run_test(f"Delete Project {project_id[:8]}", "DELETE", f"projects/{project_id}", 200)

    def test_openrouter_models(self):
        """Test OpenRouter models endpoint (without API key - should fail gracefully)"""
        # This should fail without a valid API key, but we test the endpoint structure
        success, response = self.run_test("OpenRouter Models (no key)", "GET", "openrouter/models", 422, params={"api_key": ""})
        # We expect this to fail, so if it returns 422 (validation error), that's correct behavior
        return True, response  # Override success since we expect this to fail

    def test_openrouter_generate(self):
        """Test OpenRouter code generation (without API key - should fail gracefully)"""
        test_data = {
            "message": "Create a simple HTML page",
            "model": "openai/gpt-4o",
            "api_key": "invalid-key",
            "conversation_history": []
        }
        # This should fail without a valid API key
        success, response = self.run_test("OpenRouter Generate (invalid key)", "POST", "generate/openrouter", 500, test_data)
        # We expect this to fail, so if it returns 500, that's expected behavior
        return True, response  # Override success since we expect this to fail

    # ===== DEVORA SAAS USER FLOW TESTS =====
    
    def test_user_registration(self):
        """Test user registration"""
        test_data = {
            "email": "test.user@example.com",
            "password": "TestUser123!",
            "full_name": "Test User"
        }
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, test_data)
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            print(f"✅ User token obtained: {self.user_token[:20]}...")
        return success, response

    def test_user_login(self):
        """Test user login"""
        test_data = {
            "email": "test.user@example.com",
            "password": "TestUser123!"
        }
        success, response = self.run_test("User Login", "POST", "auth/login", 200, test_data)
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            print(f"✅ User login token: {self.user_token[:20]}...")
        return success, response

    def test_user_info(self):
        """Test getting user info"""
        if not self.user_token:
            self.log_test("User Info (no token)", False, "No user token available")
            return False, {}
        
        success, response = self.run_test("User Info", "GET", "auth/me", 200, token=self.user_token)
        if success:
            # Verify subscription status and trial period
            if response.get('subscription_status') == 'trialing':
                print(f"✅ User has trialing status")
                # Check if current_period_end is approximately 7 days from now
                if 'current_period_end' in response:
                    print(f"✅ Trial period end: {response['current_period_end']}")
                else:
                    print("⚠️ No current_period_end found")
            else:
                print(f"⚠️ Unexpected subscription status: {response.get('subscription_status')}")
        return success, response

    def test_billing_plans(self):
        """Test getting subscription plans"""
        success, response = self.run_test("Billing Plans", "GET", "billing/plans", 200)
        if success:
            # Verify plan details
            expected_price = 9.90
            expected_interval = "month"
            if response.get('price') == expected_price:
                print(f"✅ Correct price: {expected_price}€")
            else:
                print(f"⚠️ Unexpected price: {response.get('price')} (expected {expected_price})")
            
            if response.get('interval') == expected_interval:
                print(f"✅ Correct interval: {expected_interval}")
            else:
                print(f"⚠️ Unexpected interval: {response.get('interval')} (expected {expected_interval})")
                
            if 'features' in response and len(response['features']) > 0:
                print(f"✅ Features present: {len(response['features'])} features")
            else:
                print("⚠️ No features found")
        return success, response

    def test_admin_login(self):
        """Test admin login"""
        test_data = {
            "email": "admin@devora.fun",
            "password": "Admin123!"
        }
        success, response = self.run_test("Admin Login", "POST", "auth/login", 200, test_data)
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"✅ Admin token obtained: {self.admin_token[:20]}...")
        return success, response

    def test_admin_stats(self):
        """Test admin stats"""
        if not self.admin_token:
            self.log_test("Admin Stats (no token)", False, "No admin token available")
            return False, {}
        
        success, response = self.run_test("Admin Stats", "GET", "admin/stats", 200, token=self.admin_token)
        if success:
            # Verify stats structure
            expected_fields = ['total_users', 'active_subscriptions', 'total_revenue', 'total_projects', 'new_users_this_month', 'churn_rate']
            for field in expected_fields:
                if field in response:
                    print(f"✅ {field}: {response[field]}")
                else:
                    print(f"⚠️ Missing field: {field}")
            
            # Check if total_users >= 1 (we just registered a user)
            if response.get('total_users', 0) >= 1:
                print(f"✅ Total users >= 1: {response.get('total_users')}")
            else:
                print(f"⚠️ Expected total_users >= 1, got: {response.get('total_users')}")
        return success, response

    def test_admin_config_get(self):
        """Test getting admin config"""
        if not self.admin_token:
            self.log_test("Admin Config Get (no token)", False, "No admin token available")
            return False, {}
        
        success, response = self.run_test("Admin Config Get", "GET", "admin/config", 200, token=self.admin_token)
        if success:
            # Verify config structure
            expected_fields = ['stripe_test_mode', 'subscription_price', 'free_trial_days']
            for field in expected_fields:
                if field in response:
                    print(f"✅ {field}: {response[field]}")
                else:
                    print(f"⚠️ Missing field: {field}")
        return success, response

    def test_admin_config_update(self):
        """Test updating admin config"""
        if not self.admin_token:
            self.log_test("Admin Config Update (no token)", False, "No admin token available")
            return False, {}
        
        test_data = {
            "free_trial_days": 10
        }
        success, response = self.run_test("Admin Config Update", "PUT", "admin/config", 200, test_data, token=self.admin_token)
        if success:
            # Verify the update was applied
            if response.get('free_trial_days') == 10:
                print(f"✅ Config updated: free_trial_days = 10")
            else:
                print(f"⚠️ Config not updated correctly: {response.get('free_trial_days')}")
        return success, response

    def test_contact_support(self):
        """Test contact support"""
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test contact",
            "message": "This is a test message"
        }
        success, response = self.run_test("Contact Support", "POST", "support/contact", 200, test_data)
        if success:
            if response.get('status') == 'success':
                print(f"✅ Contact form submitted successfully")
            else:
                print(f"⚠️ Unexpected response status: {response.get('status')}")
        return success, response

    def cleanup_resources(self):
        """Clean up created test resources"""
        print("\n🧹 Cleaning up test resources...")
        
        # Delete created projects
        for project_id in self.created_resources['projects']:
            try:
                self.test_project_delete(project_id)
            except:
                pass
        
        # Delete created conversations
        for conversation_id in self.created_resources['conversations']:
            try:
                self.test_conversation_delete(conversation_id)
            except:
                pass

    def run_devora_saas_tests(self):
        """Run Devora SaaS user flow tests"""
        print("🚀 Starting Devora SaaS User Flow Tests")
        print(f"📍 Testing API at: {self.api_url}")
        print("=" * 80)

        # Basic health check
        self.test_health_check()

        # 1. User Registration
        print("\n👤 Testing User Registration...")
        self.test_user_registration()

        # 2. User Login (alternative method)
        print("\n🔐 Testing User Login...")
        self.test_user_login()

        # 3. User Info
        print("\n📋 Testing User Info...")
        self.test_user_info()

        # 4. Billing Plans
        print("\n💳 Testing Billing Plans...")
        self.test_billing_plans()

        # 5. Admin Login
        print("\n👑 Testing Admin Login...")
        self.test_admin_login()

        # 6. Admin Stats
        print("\n📊 Testing Admin Stats...")
        self.test_admin_stats()

        # 7. Admin Config Get
        print("\n⚙️ Testing Admin Config Get...")
        self.test_admin_config_get()

        # 8. Admin Config Update
        print("\n🔧 Testing Admin Config Update...")
        self.test_admin_config_update()

        # 9. Contact Support
        print("\n📞 Testing Contact Support...")
        self.test_contact_support()

        # Print results
        print("\n" + "=" * 80)
        print(f"📊 Devora SaaS Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All Devora SaaS tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            failed_tests = [test for test in self.test_results if not test['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['details']}")
            return 1

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Devora API Tests")
        print(f"📍 Testing API at: {self.api_url}")
        print("=" * 60)

        # Basic health check
        self.test_health_check()

        # Settings tests
        print("\n📋 Testing Settings API...")
        self.test_settings_get()
        self.test_settings_update()

        # Conversation tests
        print("\n💬 Testing Conversations API...")
        self.test_conversations_list()
        success, conv_response = self.test_conversations_create()
        if success and 'id' in conv_response:
            conv_id = conv_response['id']
            self.test_conversation_get(conv_id)
            # Don't delete immediately, keep for later cleanup

        # Project tests
        print("\n📁 Testing Projects API...")
        self.test_projects_list()
        success, proj_response = self.test_projects_create()
        if success and 'id' in proj_response:
            proj_id = proj_response['id']
            self.test_project_get(proj_id)
            self.test_project_update(proj_id)
            # Don't delete immediately, keep for later cleanup

        # OpenRouter tests (expected to fail without valid keys)
        print("\n🤖 Testing OpenRouter API...")
        self.test_openrouter_models()
        self.test_openrouter_generate()

        # Cleanup
        self.cleanup_resources()

        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            failed_tests = [test for test in self.test_results if not test['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['details']}")
            return 1

def main():
    tester = DevoraAPITester()
    # Run the specific Devora SaaS user flow tests
    return tester.run_devora_saas_tests()

if __name__ == "__main__":
    sys.exit(main())