import fs from 'node:fs';
import path from 'node:path';
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.zip':'application/zip','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json'};
const assets={};
function walk(dir, prefix='') {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if(['server','.openai','_appgen_meta'].includes(entry.name)) continue;
    const file=path.join(dir,entry.name), name=prefix+'/'+entry.name;
    if(entry.isDirectory()) walk(file,name);
    else assets[name]={type:types[path.extname(file)]||'application/octet-stream',data:fs.readFileSync(file).toString('base64')};
  }
}
walk('dist');
fs.mkdirSync('dist/server',{recursive:true});
fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\n'+fs.readFileSync('worker/index.js','utf8'));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built Worker with '+Object.keys(assets).length+' preserved assets and Sites D1 counter.');
