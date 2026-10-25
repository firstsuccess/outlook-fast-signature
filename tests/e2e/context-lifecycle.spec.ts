import {test,expect} from '@playwright/test';
import path from 'node:path';
for(const failure of ['missing-id','synchronous-send-error','startup-storage-error'])test('extension invalidation safely stops content script: '+failure,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/privacy.html');await page.evaluate(mode=>{
  let invalid=false;const runtime={get id(){return invalid&&mode==='missing-id'?undefined:'fixture';},sendMessage:()=>{if(invalid)throw Error('Extension context invalidated.');return Promise.resolve({ok:true});},onMessage:{addListener:()=>{},removeListener:()=>{}}};
  (window as any).invalidateMonja=()=>{invalid=true;};(window as any).chrome={runtime,storage:{local:{get:async()=>{if(mode==='startup-storage-error')throw Error('Extension context invalidated.');return {}; }},onChanged:{addListener:()=>{},removeListener:()=>{}}}};
  document.body.innerHTML='<div id="body" role="textbox" aria-label="Message body" contenteditable="true" style="width:600px;height:150px">Keep this draft</div>';
 },failure);await page.addScriptTag({path:path.resolve('dist/browser-extension/content.js')});
 if(failure!=='startup-storage-error'){await expect(page.locator('[data-monja-ui]')).toHaveCount(1);await page.evaluate(()=>(window as any).invalidateMonja());await page.locator('#body').click();}
 await expect(page.locator('[data-monja-ui]')).toHaveCount(0);await page.evaluate(()=>{document.getElementById('body')!.insertAdjacentHTML('afterend','<div contenteditable="true" role="textbox" aria-label="Message body" style="width:600px;height:150px"></div>');window.dispatchEvent(new Event('resize'));});await page.locator('#body').focus();await page.keyboard.press('End');await page.keyboard.type(' editable');await expect(page.locator('#body')).toHaveText('Keep this draft editable');await expect(page.locator('[data-monja-ui]')).toHaveCount(0);expect(errors).toEqual([]);
});
