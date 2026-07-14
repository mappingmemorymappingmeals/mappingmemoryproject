"""
Backend API Testing for Mapping Memory, Mapping Meals
Tests all data and AI endpoints systematically
"""
import requests
import sys
import time
from datetime import datetime

class BackendTester:
    def __init__(self, base_url="https://indigenous-tastes-3d.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_entry_id = None  # Will be set from first entry

    def log(self, msg, level="INFO"):
        """Log test messages"""
        print(f"[{level}] {msg}")

    def run_test(self, name, method, endpoint, expected_status=200, data=None, timeout=30, validate_fn=None):
        """Run a single API test with optional validation"""
        url = f"{self.api_url}/{endpoint}"
        self.tests_run += 1
        
        self.log(f"\n{'='*60}")
        self.log(f"Test #{self.tests_run}: {name}")
        self.log(f"Endpoint: {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, timeout=timeout)
            else:
                raise ValueError(f"Unsupported method: {method}")

            # Check status code
            if response.status_code != expected_status:
                self.log(f"❌ FAILED - Expected status {expected_status}, got {response.status_code}", "ERROR")
                self.log(f"Response: {response.text[:500]}", "ERROR")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:500]
                })
                return False, None

            # Parse JSON
            try:
                json_data = response.json()
            except Exception as e:
                self.log(f"❌ FAILED - Could not parse JSON: {e}", "ERROR")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "error": f"JSON parse error: {e}"
                })
                return False, None

            # Run custom validation if provided
            if validate_fn:
                validation_result = validate_fn(json_data)
                if validation_result is not True:
                    self.log(f"❌ FAILED - Validation failed: {validation_result}", "ERROR")
                    self.failed_tests.append({
                        "test": name,
                        "endpoint": endpoint,
                        "error": f"Validation failed: {validation_result}"
                    })
                    return False, json_data

            self.tests_passed += 1
            self.log(f"✅ PASSED - Status: {response.status_code}", "SUCCESS")
            return True, json_data

        except requests.exceptions.Timeout:
            self.log(f"❌ FAILED - Request timeout after {timeout}s", "ERROR")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": f"Timeout after {timeout}s"
            })
            return False, None
        except Exception as e:
            self.log(f"❌ FAILED - Exception: {str(e)}", "ERROR")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, None

    def test_stats(self):
        """Test GET /api/stats"""
        def validate(data):
            if not isinstance(data, dict):
                return "Response is not a dict"
            if data.get('entries') != 100:
                return f"Expected 100 entries, got {data.get('entries')}"
            if data.get('communities') != 16:
                return f"Expected 16 communities, got {data.get('communities')}"
            if data.get('layers') != 14:
                return f"Expected 14 layers, got {data.get('layers')}"
            # Districts should be around 30 (flexible)
            districts = data.get('districts', 0)
            if districts < 10 or districts > 40:
                return f"Expected ~30 districts, got {districts}"
            return True
        
        return self.run_test(
            "GET /api/stats - Returns correct counts",
            "GET",
            "stats",
            validate_fn=validate
        )

    def test_entries_list(self):
        """Test GET /api/entries"""
        def validate(data):
            if not isinstance(data, list):
                return "Response is not a list"
            if len(data) != 100:
                return f"Expected 100 entries, got {len(data)}"
            # Check first entry has required fields
            if len(data) > 0:
                entry = data[0]
                required_fields = ['entry_id', 'food_name', 'community', 'district', 'category', 
                                 'ingredients', 'culinary_technology', 'lat', 'lng']
                for field in required_fields:
                    if field not in entry:
                        return f"Entry missing required field: {field}"
                # Store first entry_id for later tests
                self.test_entry_id = entry['entry_id']
            return True
        
        return self.run_test(
            "GET /api/entries - Returns 100 entries with all fields",
            "GET",
            "entries",
            validate_fn=validate
        )

    def test_entries_filter_community(self):
        """Test GET /api/entries?community=Toto"""
        def validate(data):
            if not isinstance(data, list):
                return "Response is not a list"
            if len(data) == 0:
                return "No Toto entries found"
            # Check all entries are Toto
            for entry in data:
                if 'toto' not in entry.get('community', '').lower():
                    return f"Found non-Toto entry: {entry.get('community')}"
            return True
        
        return self.run_test(
            "GET /api/entries?community=Toto - Filters by community",
            "GET",
            "entries?community=Toto",
            validate_fn=validate
        )

    def test_entries_filter_district(self):
        """Test GET /api/entries?district=Jhargram"""
        def validate(data):
            if not isinstance(data, list):
                return "Response is not a list"
            if len(data) == 0:
                return "No Jhargram entries found"
            return True
        
        return self.run_test(
            "GET /api/entries?district=Jhargram - Filters by district",
            "GET",
            "entries?district=Jhargram",
            validate_fn=validate
        )

    def test_entries_search(self):
        """Test GET /api/entries?q=millet"""
        def validate(data):
            if not isinstance(data, list):
                return "Response is not a list"
            # Should find some millet entries
            if len(data) == 0:
                return "No millet entries found"
            return True
        
        return self.run_test(
            "GET /api/entries?q=millet - Search works",
            "GET",
            "entries?q=millet",
            validate_fn=validate
        )

    def test_entry_detail(self):
        """Test GET /api/entries/{entry_id}"""
        if not self.test_entry_id:
            self.log("⚠️  SKIPPED - No entry_id available", "WARN")
            return False, None
        
        def validate(data):
            if not isinstance(data, dict):
                return "Response is not a dict"
            if data.get('entry_id') != self.test_entry_id:
                return f"Wrong entry_id: {data.get('entry_id')}"
            # Check for origin object (Layer 14)
            if 'origin' not in data:
                return "Missing origin field"
            return True
        
        return self.run_test(
            f"GET /api/entries/{self.test_entry_id} - Returns full entry with origin",
            "GET",
            f"entries/{self.test_entry_id}",
            validate_fn=validate
        )

    def test_places(self):
        """Test GET /api/places"""
        def validate(data):
            if not isinstance(data, list):
                return "Response is not a list"
            # Should have ~26 grouped places
            if len(data) < 20 or len(data) > 35:
                return f"Expected ~26 places, got {len(data)}"
            # Check first place structure
            if len(data) > 0:
                place = data[0]
                required = ['lat', 'lng', 'place', 'communities', 'count', 'entries']
                for field in required:
                    if field not in place:
                        return f"Place missing field: {field}"
                if not isinstance(place['entries'], list):
                    return "entries is not a list"
                if len(place['entries']) == 0:
                    return "Place has no entries"
            return True
        
        return self.run_test(
            "GET /api/places - Returns ~26 grouped places with entries arrays",
            "GET",
            "places",
            validate_fn=validate
        )

    def test_communities(self):
        """Test GET /api/communities"""
        def validate(data):
            if not isinstance(data, list):
                return "Response is not a list"
            if len(data) != 16:
                return f"Expected 16 communities, got {len(data)}"
            return True
        
        return self.run_test(
            "GET /api/communities - Returns 16 communities",
            "GET",
            "communities",
            validate_fn=validate
        )

    def test_districts(self):
        """Test GET /api/districts"""
        def validate(data):
            if not isinstance(data, list):
                return "Response is not a list"
            if len(data) < 10:
                return f"Expected multiple districts, got {len(data)}"
            return True
        
        return self.run_test(
            "GET /api/districts - Returns district list",
            "GET",
            "districts",
            validate_fn=validate
        )

    def test_categories(self):
        """Test GET /api/categories"""
        def validate(data):
            if not isinstance(data, list):
                return "Response is not a list"
            if len(data) < 5:
                return f"Expected multiple categories, got {len(data)}"
            return True
        
        return self.run_test(
            "GET /api/categories - Returns category list",
            "GET",
            "categories",
            validate_fn=validate
        )

    def test_layer_guide(self):
        """Test GET /api/meta/layer-guide"""
        def validate(data):
            if not isinstance(data, list):
                return "Response is not a list"
            if len(data) != 13:
                return f"Expected 13 layers, got {len(data)}"
            return True
        
        return self.run_test(
            "GET /api/meta/layer-guide - Returns 13 layers",
            "GET",
            "meta/layer-guide",
            validate_fn=validate
        )

    def test_cross_reference(self):
        """Test GET /api/meta/cross-reference"""
        def validate(data):
            if not isinstance(data, list):
                return "Response is not a list"
            # Should have ~17 cross-references
            if len(data) < 10:
                return f"Expected ~17 cross-references, got {len(data)}"
            # Check that entry_ids arrays are present
            if len(data) > 0:
                xref = data[0]
                if 'entry_ids' not in xref:
                    return "Missing entry_ids field"
                if not isinstance(xref['entry_ids'], list):
                    return "entry_ids is not a list"
            return True
        
        return self.run_test(
            "GET /api/meta/cross-reference - Returns 17 with entry_ids arrays",
            "GET",
            "meta/cross-reference",
            validate_fn=validate
        )

    def test_ai_tour_english(self):
        """Test POST /api/ai/tour - English"""
        if not self.test_entry_id:
            self.log("⚠️  SKIPPED - No entry_id available", "WARN")
            return False, None
        
        def validate(data):
            if not isinstance(data, dict):
                return "Response is not a dict"
            if 'script' not in data:
                return "Missing script field"
            script = data.get('script', '')
            if len(script) < 50:
                return f"Script too short: {len(script)} chars"
            if data.get('language') != 'en':
                return f"Wrong language: {data.get('language')}"
            return True
        
        self.log("⏳ AI generation may take 10-30s first time (cached after)...", "INFO")
        return self.run_test(
            f"POST /api/ai/tour - English script for {self.test_entry_id}",
            "POST",
            "ai/tour",
            data={"entry_id": self.test_entry_id, "language": "en"},
            timeout=90,
            validate_fn=validate
        )

    def test_ai_tour_bengali(self):
        """Test POST /api/ai/tour - Bengali"""
        if not self.test_entry_id:
            self.log("⚠️  SKIPPED - No entry_id available", "WARN")
            return False, None
        
        def validate(data):
            if not isinstance(data, dict):
                return "Response is not a dict"
            if 'script' not in data:
                return "Missing script field"
            script = data.get('script', '')
            if len(script) < 50:
                return f"Script too short: {len(script)} chars"
            # Check for Bengali characters (Unicode range)
            has_bengali = any('\u0980' <= c <= '\u09FF' for c in script)
            if not has_bengali:
                return "Script does not contain Bengali characters"
            return True
        
        return self.run_test(
            f"POST /api/ai/tour - Bengali script for {self.test_entry_id}",
            "POST",
            "ai/tour",
            data={"entry_id": self.test_entry_id, "language": "bn"},
            timeout=90,
            validate_fn=validate
        )

    def test_ai_tour_hindi(self):
        """Test POST /api/ai/tour - Hindi"""
        if not self.test_entry_id:
            self.log("⚠️  SKIPPED - No entry_id available", "WARN")
            return False, None
        
        def validate(data):
            if not isinstance(data, dict):
                return "Response is not a dict"
            if 'script' not in data:
                return "Missing script field"
            script = data.get('script', '')
            if len(script) < 50:
                return f"Script too short: {len(script)} chars"
            # Check for Devanagari characters (Unicode range)
            has_hindi = any('\u0900' <= c <= '\u097F' for c in script)
            if not has_hindi:
                return "Script does not contain Devanagari characters"
            return True
        
        return self.run_test(
            f"POST /api/ai/tour - Hindi script for {self.test_entry_id}",
            "POST",
            "ai/tour",
            data={"entry_id": self.test_entry_id, "language": "hi"},
            timeout=90,
            validate_fn=validate
        )

    def test_ai_snapshot(self):
        """Test POST /api/ai/snapshot"""
        def validate(data):
            if not isinstance(data, dict):
                return "Response is not a dict"
            if 'script' not in data:
                return "Missing script field"
            script = data.get('script', '')
            if len(script) < 30:
                return f"Script too short: {len(script)} chars"
            return True
        
        self.log("⏳ AI generation may take 10-30s...", "INFO")
        return self.run_test(
            "POST /api/ai/snapshot - Returns AI analysis script",
            "POST",
            "ai/snapshot",
            data={
                "district": "Alipurduar",
                "center": [89.5, 26.5],
                "zoom": 8,
                "visible_foods": ["Eu"],
                "visible_communities": ["Toto"],
                "language": "en"
            },
            timeout=90,
            validate_fn=validate
        )

    def test_ai_questions(self):
        """Test POST /api/ai/questions"""
        if not self.test_entry_id:
            self.log("⚠️  SKIPPED - No entry_id available", "WARN")
            return False, None
        
        def validate(data):
            if not isinstance(data, dict):
                return "Response is not a dict"
            if 'questions' not in data:
                return "Missing questions field"
            questions = data.get('questions', [])
            if not isinstance(questions, list):
                return "questions is not a list"
            if len(questions) != 5:
                return f"Expected exactly 5 questions, got {len(questions)}"
            # Check questions are non-empty strings
            for i, q in enumerate(questions):
                if not isinstance(q, str) or len(q) < 10:
                    return f"Question {i+1} is invalid: {q}"
            return True
        
        self.log("⏳ AI generation may take 10-30s...", "INFO")
        return self.run_test(
            f"POST /api/ai/questions - Returns exactly 5 questions for {self.test_entry_id}",
            "POST",
            "ai/questions",
            data={"entry_id": self.test_entry_id, "language": "en"},
            timeout=90,
            validate_fn=validate
        )

    def test_ai_translate(self):
        """Test POST /api/ai/translate"""
        def validate(data):
            if not isinstance(data, dict):
                return "Response is not a dict"
            if 'translated' not in data:
                return "Missing translated field"
            translated = data.get('translated', '')
            if len(translated) < 5:
                return f"Translation too short: {translated}"
            # Check for Bengali characters
            has_bengali = any('\u0980' <= c <= '\u09FF' for c in translated)
            if not has_bengali:
                return "Translation does not contain Bengali characters"
            return True
        
        self.log("⏳ AI generation may take 10-30s...", "INFO")
        return self.run_test(
            "POST /api/ai/translate - Translates to Bengali",
            "POST",
            "ai/translate",
            data={"text": "Hello forest", "target": "bn"},
            timeout=90,
            validate_fn=validate
        )

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("\n" + "="*60)
        self.log("STARTING BACKEND API TESTS")
        self.log(f"Base URL: {self.base_url}")
        self.log("="*60)
        
        start_time = time.time()
        
        # Data endpoints
        self.log("\n📊 TESTING DATA ENDPOINTS...")
        self.test_stats()
        self.test_entries_list()
        self.test_entries_filter_community()
        self.test_entries_filter_district()
        self.test_entries_search()
        self.test_entry_detail()
        self.test_places()
        self.test_communities()
        self.test_districts()
        self.test_categories()
        self.test_layer_guide()
        self.test_cross_reference()
        
        # AI endpoints
        self.log("\n🤖 TESTING AI ENDPOINTS...")
        self.test_ai_tour_english()
        self.test_ai_tour_bengali()
        self.test_ai_tour_hindi()
        self.test_ai_snapshot()
        self.test_ai_questions()
        self.test_ai_translate()
        
        elapsed = time.time() - start_time
        
        # Print summary
        self.log("\n" + "="*60)
        self.log("TEST SUMMARY")
        self.log("="*60)
        self.log(f"Total tests: {self.tests_run}")
        self.log(f"Passed: {self.tests_passed} ✅")
        self.log(f"Failed: {len(self.failed_tests)} ❌")
        self.log(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        self.log(f"Time elapsed: {elapsed:.1f}s")
        
        if self.failed_tests:
            self.log("\n❌ FAILED TESTS:")
            for i, failure in enumerate(self.failed_tests, 1):
                self.log(f"\n{i}. {failure.get('test', 'Unknown')}")
                self.log(f"   Endpoint: {failure.get('endpoint', 'Unknown')}")
                self.log(f"   Error: {failure.get('error', failure.get('response', 'Unknown'))}")
        
        self.log("\n" + "="*60)
        
        return self.tests_passed == self.tests_run


def main():
    tester = BackendTester()
    success = tester.run_all_tests()
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
