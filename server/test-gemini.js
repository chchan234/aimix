/**
 * Test Gemini API
 *
 * Run: node test-gemini.js
 */

async function testGeminiAPI() {
  const baseURL = 'http://localhost:3000';

  console.log('\n🧪 Testing Gemini API...\n');

  // Test 1: Simple Chat
  console.log('1️⃣ Testing /api/ai/chat');
  try {
    const response = await fetch(`${baseURL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Say hello in Korean' })
    });
    const data = await response.json();
    console.log('✅ Chat Response:', data.text ? data.text.substring(0, 100) + '...' : data);
  } catch (error) {
    console.error('❌ Chat Error:', error.message);
  }

  console.log('\n2️⃣ Testing /api/ai/name-analysis');
  try {
    const response = await fetch(`${baseURL}/api/ai/name-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '민수', birthDate: '1990-01-01' })
    });
    const data = await response.json();
    console.log('✅ Name Analysis:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ Name Analysis Error:', error.message);
  }

  console.log('\n3️⃣ Testing /api/ai/dream-interpretation');
  try {
    const response = await fetch(`${baseURL}/api/ai/dream-interpretation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dream: '하늘을 날고 있었어요' })
    });
    const data = await response.json();
    console.log('✅ Dream Interpretation:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ Dream Error:', error.message);
  }

  console.log('\n4️⃣ Testing /api/ai/story');
  try {
    const response = await fetch(`${baseURL}/api/ai/story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: '우주여행', length: 'short' })
    });
    const data = await response.json();
    console.log('✅ Story:', data.text ? data.text.substring(0, 150) + '...' : data);
  } catch (error) {
    console.error('❌ Story Error:', error.message);
  }

  console.log('\n✅ All tests completed!\n');
}

testGeminiAPI();
