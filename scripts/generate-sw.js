#!/usr/bin/env node

// Generate firebase-messaging-sw.js from template with environment variables

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const templatePath = path.join(__dirname, '../public/firebase-messaging-sw.template.js');
const outputPath = path.join(__dirname, '../public/firebase-messaging-sw.js');

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all required config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.warn('⚠️  Warning: Missing Firebase config values:', missingKeys.join(', '));
  console.warn('   Service worker will use placeholder values. Make sure to set env vars.');
  
  // Use placeholder values if missing
  firebaseConfig.apiKey = firebaseConfig.apiKey || 'YOUR_API_KEY';
  firebaseConfig.authDomain = firebaseConfig.authDomain || 'YOUR_PROJECT.firebaseapp.com';
  firebaseConfig.projectId = firebaseConfig.projectId || 'YOUR_PROJECT_ID';
  firebaseConfig.storageBucket = firebaseConfig.storageBucket || 'YOUR_PROJECT.appspot.com';
  firebaseConfig.messagingSenderId = firebaseConfig.messagingSenderId || 'YOUR_SENDER_ID';
  firebaseConfig.appId = firebaseConfig.appId || 'YOUR_APP_ID';
} else {
  console.log('✅ All Firebase config values found');
}

// Read template
if (!fs.existsSync(templatePath)) {
  console.error('❌ Template file not found:', templatePath);
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');

// Replace placeholder with actual config
const configString = `const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};`;
const generatedContent = template.replace(
  '/* FIREBASE_CONFIG_PLACEHOLDER */',
  configString
);

// Write generated file
fs.writeFileSync(outputPath, generatedContent, 'utf8');

console.log('✅ Service worker generated successfully:', outputPath);
console.log('   Using Firebase project:', firebaseConfig.projectId);

