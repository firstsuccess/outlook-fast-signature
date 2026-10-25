import {test,expect} from '@playwright/test';
import path from 'node:path';
for(const failFirst of [false,true])test('waits for delayed Outlook hydration and retries only unchanged failures: '+failFirst,async({page})=>{
 await page.goto('/privacy.html');await page.evaluate(fail=>{
  const attach=Element.prototype.attachShadow;Element.prototype.attachShadow=function(init){return attach.call(this,{...init,mode:'open'});};
  let listener:any;const requests:any[]=[];(window as any).monjaRequests=requests;
  const library={schemaVersion:1,signatures:[{id:'n',name:'New',html:'NEW_SIGNATURE'},{id:'r',name:'Reply',html:'REPLY_SIGNATURE'}],defaults:{'':{new:'n',reply:'r'}},language:'ja',overlay:true};
  (window as any).chrome={runtime:{id:'fixture',onMessage:{addListener:(fn:any)=>{listener=fn;}},sendMessage:async(message:any)=>{requests.push(message);return {ok:true};}},storage:{local:{get:async()=>({'monja-fast-signature-v1':JSON.stringify(library)})},onChanged:{addListener:()=>{}}}};
  (window as any).monjaDiagnostic=()=>new Promise(resolve=>listener({action:'diagnostics'},{},resolve));
  if(fail){const command=document.execCommand.bind(document);let once=true;document.execCommand=(...args:Parameters<typeof document.execCommand>)=>{if(once&&args[0]==='insertHTML'){once=false;return false;}return command(...args);};}
  document.body.innerHTML='<section id="compose" aria-busy="true"><input placeholder="Add a subject"><div id="body" contenteditable="true" role="textbox" aria-label="Message body" style="width:600px;height:180px"></div></section>';document.querySelector('input')!.focus();
 },failFirst);await page.addScriptTag({path:path.resolve('dist/browser-extension/content.js')});
 await expect(page.locator('[data-monja-ui]')).toHaveCount(1);await expect(page.getByRole('button',{name:'設定',exact:true})).toBeVisible();
 await page.waitForTimeout(1200);await page.evaluate(()=>{document.querySelector('input')!.value='Re: delayed conversation';document.getElementById('body')!.dispatchEvent(new InputEvent('beforeinput',{bubbles:true,inputType:'insertText'}));document.getElementById('body')!.innerHTML='<p><br></p><blockquote>ORIGINAL_QUOTE</blockquote>';});await page.waitForTimeout(1100);await expect(page.locator('#body [data-monja-signature]')).toHaveCount(0);await expect(page.locator('#body')).toHaveText('ORIGINAL_QUOTE');
 await page.evaluate(()=>document.getElementById('compose')!.removeAttribute('aria-busy'));await expect(page.locator('#body [data-monja-signature]')).toHaveText('REPLY_SIGNATURE');await expect(page.locator('#body [data-monja-signature]')).toHaveCount(1);await expect(page.locator('#body blockquote')).toHaveText('ORIGINAL_QUOTE');await expect(page.locator('input')).toBeFocused();
 const diagnostic:any=await page.evaluate(()=>(window as any).monjaDiagnostic());expect(diagnostic.composers[0].stage).toBe('inserted');expect(diagnostic.composers[0].kind).toBe('reply');expect(diagnostic.composers[0].retries).toBe(failFirst?1:0);expect(JSON.stringify(diagnostic)).not.toMatch(/ORIGINAL_QUOTE|REPLY_SIGNATURE/);
 await page.getByRole('button',{name:'設定',exact:true}).click();const requests:any[]=await page.evaluate(()=>(window as any).monjaRequests);expect(requests.some(r=>r.action==='openSettings')).toBe(true);await expect(page.locator('#body select,#body button')).toHaveCount(0);
});
