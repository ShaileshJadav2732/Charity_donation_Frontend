// Test script to verify messaging API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/messages';

// Test data
const testData = {
  // You'll need to replace these with actual IDs from your database
  userId1: '6838302f0060c3ec49a0e80e', // Replace with actual user ID
  userId2: '683c1e7e72348658779ebecd', // Replace with actual user ID
  token: '', // You'll need to get this from login
};

async function testMessagingAPI() {
  console.log('🧪 Testing Messaging API...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:8080/health');
    console.log('✅ Server is running:', healthResponse.data);

    // Test 2: Test participant ID resolver (no auth needed)
    console.log('\n2. Testing participant ID resolver...');
    const resolverResponse = await axios.get(`${BASE_URL}/resolve-participant/${testData.userId1}`);
    console.log('✅ Participant resolver working:', resolverResponse.data);

    // Test 3: Test authenticated endpoints (you'll need to add token)
    if (testData.token) {
      console.log('\n3. Testing authenticated endpoints...');
      
      const headers = {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      };

      // Test get conversations
      const conversationsResponse = await axios.get(`${BASE_URL}/conversations`, { headers });
      console.log('✅ Get conversations working:', conversationsResponse.data);

      // Test unread count
      const unreadResponse = await axios.get(`${BASE_URL}/unread-count`, { headers });
      console.log('✅ Unread count working:', unreadResponse.data);
    } else {
      console.log('\n⚠️  Skipping authenticated tests - no token provided');
      console.log('To test authenticated endpoints:');
      console.log('1. Login to your app');
      console.log('2. Get the token from localStorage or Redux store');
      console.log('3. Add it to testData.token in this script');
    }

  } catch (error) {
    console.error('❌ Error testing API:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
  }
}

// Test FormData sending (similar to what the frontend does)
async function testSendMessage() {
  if (!testData.token) {
    console.log('\n⚠️  Cannot test send message - no token provided');
    return;
  }

  console.log('\n4. Testing send message...');
  
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('content', 'Test message from API test script');
    formData.append('recipientId', testData.userId2);
    formData.append('messageType', 'text');

    const response = await axios.post(`${BASE_URL}/send`, formData, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Send message working:', response.data);
  } catch (error) {
    console.error('❌ Error sending message:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Run tests
testMessagingAPI().then(() => {
  return testSendMessage();
}).then(() => {
  console.log('\n🎉 API testing complete!');
}).catch(console.error);
