const http = require('http');

async function testLogin() {
  try {
    // 1. Get CSRF Token
    const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    const cookies = csrfRes.headers.get('set-cookie');
    
    // 2. Perform Login
    const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies
      },
      body: new URLSearchParams({
        email: 'dr@aethermed.com',
        password: 'doctor123',
        csrfToken: csrfToken,
        json: 'true'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Result:', loginData);
  } catch (e) {
    console.error(e);
  }
}
testLogin();
