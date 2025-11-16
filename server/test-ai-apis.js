/**
 * Test AI API Endpoints
 *
 * Run: node test-ai-apis.js
 */

const baseURL = 'https://server-p7x55tiuk-chanwoos-projects-bd61ed6a.vercel.app';

async function testAIAPIs() {
  console.log('\n🤖 Testing AIMix AI API Endpoints...\n');

  // Test 1: Face Reading (using sample image URL)
  console.log('1️⃣ Testing /api/ai/face-reading');
  try {
    const response = await fetch(`${baseURL}/api/ai/face-reading`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Pierre-Person.jpg/800px-Pierre-Person.jpg',
        birthDate: '1990-01-01'
      })
    });
    const data = await response.json();
    console.log('✅ Face Reading Response:');
    if (data.success && data.analysis) {
      console.log('- Overall Impression:', data.analysis.overallImpression?.substring(0, 100) + '...');
      console.log('- Lucky Colors:', data.analysis.luckyColors);
      console.log('- Lucky Numbers:', data.analysis.luckyNumbers);
    } else if (data.success && data.rawText) {
      console.log('- Raw Response:', data.rawText.substring(0, 200) + '...');
    } else {
      console.log('- Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Face Reading Error:', error.message);
  }

  console.log('\n2️⃣ Testing /api/ai/name-analysis');
  try {
    const response = await fetch(`${baseURL}/api/ai/name-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '지훈', birthDate: '1995-05-15' })
    });
    const data = await response.json();
    console.log('✅ Name Analysis Response:');
    if (data.success && data.analysis) {
      console.log('- Name:', data.analysis.name);
      console.log('- Meaning:', data.analysis.meaning?.substring(0, 100) + '...');
      console.log('- Lucky Numbers:', data.analysis.luckyNumbers);
    } else if (data.success && data.rawText) {
      console.log('- Raw Response:', data.rawText.substring(0, 200) + '...');
    } else {
      console.log('- Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Name Analysis Error:', error.message);
  }

  console.log('\n3️⃣ Testing /api/ai/dream-interpretation');
  try {
    const response = await fetch(`${baseURL}/api/ai/dream-interpretation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dream: '밤하늘에 별이 쏟아지는 꿈을 꿨어요' })
    });
    const data = await response.json();
    console.log('✅ Dream Interpretation Response:');
    if (data.success && data.interpretation) {
      console.log('- Overall Meaning:', data.interpretation.overallMeaning?.substring(0, 100) + '...');
      console.log('- Positive Message:', data.interpretation.positiveMessage?.substring(0, 100) + '...');
      console.log('- Lucky Numbers:', data.interpretation.luckyNumbers);
    } else if (data.success && data.rawText) {
      console.log('- Raw Response:', data.rawText.substring(0, 200) + '...');
    } else {
      console.log('- Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Dream Interpretation Error:', error.message);
  }

  console.log('\n4️⃣ Testing /api/ai/story');
  try {
    const response = await fetch(`${baseURL}/api/ai/story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: '시간여행을 하는 고양이', length: 'short' })
    });
    const data = await response.json();
    console.log('✅ Story Generation Response:');
    if (data.success && data.text) {
      console.log('- Story Preview:', data.text.substring(0, 200) + '...');
      console.log('- Model:', data.model);
    } else {
      console.log('- Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Story Generation Error:', error.message);
  }

  console.log('\n5️⃣ Testing /api/ai/chat');
  try {
    const response = await fetch(`${baseURL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '오늘의 운세를 알려줘' })
    });
    const data = await response.json();
    console.log('✅ Chat Response:');
    if (data.success && data.text) {
      console.log('- Response:', data.text.substring(0, 200) + '...');
      console.log('- Model:', data.model);
    } else {
      console.log('- Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Chat Error:', error.message);
  }

  console.log('\n✅ All API tests completed!\n');
}

testAIAPIs();
