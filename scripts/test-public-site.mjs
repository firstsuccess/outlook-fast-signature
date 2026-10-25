import {chromium} from '@playwright/test';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4180/fast-signature/');await page.locator('h1').waitFor();assert.match(await page.title(),/もんじゃ高速署名/);
 await page.screenshot({path:'dist/site-desktop.png',fullPage:false});
 await page.locator('#demo').selectOption('3');assert.equal(await page.locator('#sampleSignature').textContent(),'');await page.locator('#demo').selectOption('2');assert.match(await page.locator('#sampleSignature').textContent(),/Taro Yamada/);
 for(const [language,text]of [['en','Switch signatures.'],['zh','轻松切换签名'],['ja','署名の切り替え']]){await page.locator('#language').selectOption(language);assert.equal(await page.locator('html').getAttribute('lang'),language);assert.ok((await page.locator('h1').textContent()).includes(text));}
 await page.getByRole('tab',{name:'Outlookアドイン',exact:true}).click();assert.equal(await page.getByRole('tab',{name:'Outlookアドイン',exact:true}).getAttribute('aria-selected'),'true');assert.match(await page.locator('#steps').textContent(),/setSignatureAsync/);
 const links=await page.locator('a[download]').evaluateAll(els=>els.map(e=>e.href));for(const url of links){const response=await page.request.get(url);assert.equal(response.status(),200,url);assert.ok((await response.body()).length>0,url);}
 const xml=await(await page.request.get('http://127.0.0.1:4180/fast-signature/manifest.xml')).text();assert.ok(xml.includes('https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/taskpane.html'));assert.ok(!xml.includes('.invalid'));assert.ok(!xml.includes('localhost'));
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'dist/site-mobile.png',fullPage:false});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.emulateMedia({colorScheme:'dark'});await page.screenshot({path:'dist/site-dark.png',fullPage:false});assert.deepEqual(errors,[]);
 await fs.writeFile('dist/site-test-results.json',JSON.stringify({languageSwitching:'passed',demo:'passed',tabs:'passed',downloads:links.length,manifest:'configured',mobileOverflow:'none',javascriptErrors:errors},null,2));console.log('Site QA passed: JA/EN/ZH, sample selector, install tabs, '+links.length+' downloads, configured manifest, mobile and dark mode.');
}finally{await browser.close();}
