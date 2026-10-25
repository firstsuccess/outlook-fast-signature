import {build} from 'esbuild';
import fs from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
import {manifest} from './manifest.mjs';
const config=JSON.parse(await fs.readFile('release.config.json','utf8'));const base=(process.env.MONJA_BASE_URL||config.baseUrl).replace(/\/$/,'');const support=process.env.MONJA_SUPPORT_URL||config.supportUrl;
const {version}=JSON.parse(await fs.readFile('package.json','utf8'));
for(const url of [base,support]){if(!/^https:\/\//.test(url)||/[<>&"']/.test(url))throw Error('HTTPS URL required');new URL(url);}
const ext='dist/browser-extension',office='dist/outlook-addin';
await build({entryPoints:['browser-extension/src/background.ts'],outfile:ext+'/background.js',bundle:true,minify:true,target:'es2020',format:'iife'});
for(const d of [ext,office])await fs.mkdir(d+'/assets',{recursive:true});
for(const [entry,out]of [['web/app.ts',ext+'/app.js'],['web/app.ts',office+'/app.js'],['browser-extension/src/content.ts',ext+'/content.js'],['browser-extension/src/popup.ts',ext+'/popup.js']])await build({entryPoints:[entry],outfile:out,bundle:true,minify:true,target:'es2020',format:'iife',legalComments:'eof'});
const page=await fs.readFile('web/page.html','utf8');await fs.writeFile(ext+'/options.html',page.replace('<!--OFFICE-->',''));await fs.writeFile(office+'/taskpane.html',page.replace('<!--OFFICE-->','<script src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"></script>'));
await fs.copyFile('web/popup.html',ext+'/popup.html');await fs.copyFile('browser-extension/manifest.json',ext+'/manifest.json');
// Generate deterministic first-party PNG icons; no external image or font assets.
function crc(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(data.length);c.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([n,t,data,c]);}
function png(n){const raw=Buffer.alloc(n*(n*4+1));for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*(n*4+1)+1+x*4;const mark=x>n*.2&&x<n*.8&&y>n*.25&&y<n*.75&&(x<n*.3||x>n*.7||Math.abs((x/n-.5)*1.2+.48-y/n)<.08);raw.set(mark?[255,255,255,255]:[23,73,146,255],i);}const h=Buffer.alloc(13);h.writeUInt32BE(n);h.writeUInt32BE(n,4);h[8]=8;h[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
for(const size of [16,32,64,80,128]){await fs.mkdir('browser-extension/assets',{recursive:true});await fs.mkdir('outlook-addin/assets',{recursive:true});for(const d of [ext,office,'browser-extension','outlook-addin'])await fs.writeFile(`${d}/assets/icon-${size}.png`,png(size));}
const xml=manifest(base,support);await fs.writeFile('outlook-addin/manifest.xml',xml);await fs.writeFile(office+'/manifest.xml',xml);
for(const d of [ext,office]){for(const f of ['style.css','privacy.html'])await fs.copyFile('web/'+f,d+'/'+f);await fs.copyFile('LICENSE',d+'/LICENSE.txt');const lic=await fs.readFile('node_modules/dompurify/LICENSE','utf8');await fs.writeFile(d+'/THIRD_PARTY_NOTICES.txt','DOMPurify\n'+lic);}
await fs.copyFile('web/health.html',office+'/health.html');
const deployment='dist/deployment-kit';await fs.mkdir(deployment+'/scripts',{recursive:true});await fs.cp(office,deployment+'/outlook-addin',{recursive:true});for(const file of ['Configure-Deployment.ps1','Test-Deployment.ps1'])await fs.copyFile('scripts/'+file,deployment+'/scripts/'+file);
await fs.mkdir(deployment+'/acceptance',{recursive:true});await fs.copyFile('web/acceptance.html',deployment+'/acceptance/index.html');await fs.copyFile('web/style.css',deployment+'/acceptance/style.css');await build({entryPoints:['web/acceptance.ts'],outfile:deployment+'/acceptance/acceptance.js',bundle:true,minify:true,target:'es2020',format:'iife'});
await fs.writeFile(deployment+'/START-HERE.txt',`Monja Fast Signature ${version}\nRun PowerShell (no Node.js required; follow your organization script execution policy):\npowershell -File .\\scripts\\Configure-Deployment.ps1 -BaseUrl https://YOUR-DOMAIN/monja -OutputDirectory .\\configured\nUpload configured/site/* and install configured/manifest.xml.\nUse deployment kit only after HTTPS configuration; do not install the .invalid template manifest.\nSee PRODUCTION_PILOT guide in the guides package.\n`);
await fs.writeFile('dist/build-info.json',JSON.stringify({version,baseUrl:base,releaseReady:!base.includes('.invalid')&&config.releaseReady,realOutlookVerified:false},null,2));console.log('Built extension and static Office add-in. Publication gate: '+(base.includes('.invalid')?'BLOCKED — configure publisher HTTPS URLs':'run validate:release'));

