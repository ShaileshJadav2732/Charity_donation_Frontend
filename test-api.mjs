import fetch from 'node-fetch';

// API URL
const API_URL = 'http://localhost:8080';

// Test the health endpoint
async function testHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('Health endpoint response:', data);
    return data;
  } catch (error) {
    console.error('Error testing health endpoint:', error);
    return null;
  }
}

// Test the test endpoint
async function testTestEndpoint() {
  try {
    const response = await fetch(`${API_URL}/api/test`);
    const data = await response.json();
    console.log('Test endpoint response:', data);
    return data;
  } catch (error) {
    console.error('Error testing test endpoint:', error);
    return null;
  }
}

// Test the register endpoint
async function testRegister() {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test-api@example.com',
        firebaseUid: 'test-firebase-uid-' + Date.now(),
        role: 'donor',
      }),
    });
    const data = await response.json();
    console.log('Register endpoint response:', data);
    return data;
  } catch (error) {
    console.error('Error testing register endpoint:', error);
    return null;
  }
}

// Main function
async function main() {
  // Test the health endpoint
  await testHealth();

  // Test the test endpoint
  await testTestEndpoint();

  // Test the register endpoint
  await testRegister();
}

// Run the main function
main().catch(console.error);
