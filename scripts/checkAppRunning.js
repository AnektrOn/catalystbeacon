#!/usr/bin/env node

const http = require('http');

function checkAppRunning(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({ running: true, status: res.statusCode });
    });
    
    req.on('error', () => {
      resolve({ running: false });
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve({ running: false, timeout: true });
    });
  });
}

async function main() {
  const url = process.env.APP_URL || 'http://localhost:3000';
  const result = await checkAppRunning(url);
  
  if (result.running) {
    console.log(`✅ Application is running at ${url}`);
    process.exit(0);
  } else {
    console.log(`❌ Application is NOT running at ${url}`);
    console.log('\nPlease start the application with:');
    console.log('  npm start');
    console.log('\nThen run the tests again.');
    process.exit(1);
  }
}

main();
