import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testPWA = () => {
  console.log('🔍 Testing PWA Configuration...\n');

  // Test 1: Kiểm tra manifest.json
  console.log('1. Checking manifest.json...');
  try {
    const manifestPath = path.join(__dirname, '../public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ manifest.json is valid');
    } else {
      console.log('❌ Missing required fields:', missingFields);
    }
  } catch (error) {
    console.log('❌ Error reading manifest.json:', error.message);
  }

  // Test 2: Kiểm tra icons
  console.log('\n2. Checking icons...');
  const iconsDir = path.join(__dirname, '../public/icons');
  const requiredIcons = [
    'icon-192x192.png',
    'icon-512x512.png',
    'browserconfig.xml',
    'safari-pinned-tab.svg'
  ];

  requiredIcons.forEach(icon => {
    const iconPath = path.join(iconsDir, icon);
    if (fs.existsSync(iconPath)) {
      console.log(`✅ ${icon} exists`);
    } else {
      console.log(`❌ ${icon} missing`);
    }
  });

  // Test 3: Kiểm tra PWA components
  console.log('\n3. Checking PWA components...');
  const componentsDir = path.join(__dirname, '../src/components');
  const requiredComponents = [
    'PWAInstallPrompt.tsx',
    'PWAUpdatePrompt.tsx',
    'PWAInfo.tsx'
  ];

  requiredComponents.forEach(component => {
    const componentPath = path.join(componentsDir, component);
    if (fs.existsSync(componentPath)) {
      console.log(`✅ ${component} exists`);
    } else {
      console.log(`❌ ${component} missing`);
    }
  });

  // Test 4: Kiểm tra vite config
  console.log('\n4. Checking Vite PWA configuration...');
  try {
    const viteConfigPath = path.join(__dirname, '../vite.config.ts');
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    if (viteConfig.includes('VitePWA')) {
      console.log('✅ VitePWA plugin is configured');
    } else {
      console.log('❌ VitePWA plugin not found');
    }
  } catch (error) {
    console.log('❌ Error reading vite.config.ts:', error.message);
  }

  console.log('\n🎉 PWA Test completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Run "npm run build" to build the application');
  console.log('2. Run "npm run preview" to test locally');
  console.log('3. Deploy to HTTPS server for full PWA functionality');
  console.log('4. Test install prompt and offline functionality');
};

testPWA(); 