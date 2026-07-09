const http = require('http');

async function testLogin() {
  try {
    const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    const cookies = csrfRes.headers.get('set-cookie');
    
    const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        email: 'dr@aethermed.com',
        password: 'doctor123',
        csrfToken: csrfToken,
        json: true
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Result:', loginData);
  } catch (e) {
    console.error(e);
  }
}
testLogin();
