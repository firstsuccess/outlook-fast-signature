import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve('sites/outlook-add-in');
const site=root+'/dist/fast-signature';
await fs.mkdir(site,{recursive:true});
await fs.cp('dist/outlook-addin',site,{recursive:true});
for(const file of ['index.html','site.css','site.js'])await fs.copyFile('web/landing/'+file,site+'/'+file);
await fs.copyFile('web/hub/outlook.svg',site+'/outlook.svg');
// A single user-facing guide; taskpane privacy links return to the same page.
await fs.writeFile(site+'/privacy.html','<!doctype html><html lang="ja"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./#privacy"><title>Monja Privacy</title><a href="./#privacy">Privacy / プライバシー / 隐私</a></html>');
if(!process.argv.includes('--signature-only'))for(const file of ['index.html','hub.css','hub.js','outlook.svg'])await fs.copyFile('web/hub/'+file,root+'/dist/'+file);
const {version}=JSON.parse(await fs.readFile('package.json','utf8'));const checksums=[];
for(const filename of await fs.readdir(site)){if(/^monja-fast-signature-(browser|outlook|deployment|guides|source)-[\w.-]+\.zip$/.test(filename)&&!filename.endsWith('-'+version+'.zip'))await fs.unlink(path.join(site,filename));}
for(const kind of ['browser','outlook','deployment','guides','source']){const filename=`monja-fast-signature-${kind}-${version}.zip`;await fs.copyFile('dist/packages/'+filename,site+'/'+filename);checksums.push(createHash('sha256').update(await fs.readFile(site+'/'+filename)).digest('hex')+'  '+filename);}
await fs.writeFile(site+'/SHA256SUMS.txt',checksums.join('\n')+'\n');
await fs.mkdir(root+'/.openai',{recursive:true});
await fs.writeFile(root+'/.gitignore','*.md\n.openai/.sites-*\nnode_modules/\n');
console.log('Prepared flat /fast-signature/ guide, Office assets, manifest, and five downloads.');
