import {test,expect} from '@playwright/test';
import path from 'node:path';import fs from 'node:fs/promises';
test('offline acceptance sheet exports pending results and does not invent successful Outlook tests',async({page})=>{
 await page.goto('file:///'+path.resolve('dist/deployment-kit/acceptance/index.html').replace(/\\/g,'/'));await expect(page.locator('select')).toHaveCount(40);await expect(page.locator('select').first()).toHaveValue('pending');
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'試験結果JSONを書き出す'}).click()]);const report=JSON.parse(await fs.readFile((await download.path())!,'utf8'));expect(report.results).toHaveLength(40);expect(report.results.every((r:any)=>r.status==='pending')).toBe(true);expect(report.version).toBe('0.2.9-pilot.1');
});

