import puppeteer from 'puppeteer';

async function testTabLoading() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting tab loading test...');
    
    // Navigate to auth page
    await page.goto('http://localhost:4002/auth/signin', { waitUntil: 'networkidle2' });
    console.log('✅ Navigated to auth page');
    
    // Fill login form
    await page.type('input[placeholder*="email"]', 'guowei.jiang.work@gmail.com');
    await page.type('input[placeholder*="password"]', 'J4913836j');
    
    // Submit form
    await page.click('button[type="submit"]');
    console.log('✅ Login submitted');
    
    // Wait for navigation or auth to complete
    await page.waitForTimeout(3000);
    
    // Navigate to dashboard
    await page.goto('http://localhost:4002/dashboard', { waitUntil: 'networkidle2' });
    console.log('✅ Navigated to dashboard');
    
    // Wait for dashboard to load
    await page.waitForTimeout(2000);
    
    // Test each tab
    const tabs = [
      { name: 'Overview', selector: 'button:has-text("Overview")' },
      { name: 'Messages', selector: 'button:has-text("Messages")' },
      { name: 'Care Groups', selector: 'button:has-text("Care Groups")' },
      { name: 'Notifications', selector: 'button:has-text("Notifications")' },
      { name: 'Providers', selector: 'button:has-text("Providers")' },
      { name: 'Safety & Location', selector: 'button:has-text("Safety")' },
      { name: 'Medication Management', selector: 'button:has-text("Medication")' }
    ];
    
    for (const tab of tabs) {
      try {
        // Click tab using evaluate
        const clicked = await page.evaluate((tabName) => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const button = buttons.find(btn => btn.textContent.includes(tabName));
          if (button) {
            button.click();
            return true;
          }
          return false;
        }, tab.name);
        
        if (clicked) {
          console.log(`✅ Clicked ${tab.name} tab`);
          
          // Wait for content to load
          await page.waitForTimeout(2000);
          
          // Check for loading state
          const hasLoading = await page.evaluate(() => {
            const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
            return loadingElements.length > 0;
          });
          
          if (hasLoading) {
            console.log(`⏳ ${tab.name} tab is loading...`);
            // Wait up to 5 seconds for loading to complete
            await page.waitForTimeout(5000);
            
            // Check if still loading
            const stillLoading = await page.evaluate(() => {
              const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
              return loadingElements.length > 0;
            });
            
            if (stillLoading) {
              console.log(`❌ ${tab.name} tab stuck in loading state!`);
            } else {
              console.log(`✅ ${tab.name} tab loaded successfully`);
            }
          } else {
            console.log(`✅ ${tab.name} tab loaded successfully`);
          }
        } else {
          console.log(`⚠️ Could not find ${tab.name} tab`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${tab.name} tab:`, error.message);
      }
    }
    
    console.log('🎉 Tab loading test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testTabLoading();
