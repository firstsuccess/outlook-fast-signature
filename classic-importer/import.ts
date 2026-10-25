import {sanitize} from '../shared/model';
export async function importFiles(files:File[]):Promise<string>{
 const candidates=files.filter(f=>/\.html?$/i.test(f.name));if(candidates.length>1)throw Error('Select one signature HTML and its related images at a time.');
 const main=candidates[0]||files.find(f=>/\.txt$/i.test(f.name));if(!main)throw Error('Choose HTML or TXT with its image folder. RTF: save as HTML in Outlook first.');if(main.size>5_000_000)throw Error('HTML/TXT file larger than 5 MB');
 if(/\.txt$/i.test(main.name)){const p=document.createElement('div');p.textContent=await main.text();return p.innerHTML.replace(/\r?\n/g,'<br>');}
 const t=document.createElement('template');t.innerHTML=await main.text();for(const img of t.content.querySelectorAll('img')){
 const src=img.getAttribute('src')||'';if(/^(https:|data:)/i.test(src))continue;const path=decodeURIComponent(src).replace(/\\/g,'/').replace(/^\.\//,'').toLowerCase();
 let match=files.filter(f=>((f as any).webkitRelativePath||f.name).toLowerCase().endsWith(path));
 if(!match.length){const basename=path.split('/').pop();match=files.filter(f=>f.name.toLowerCase()===basename);}
 if(match.length!==1)throw Error('Missing or ambiguous image: '+src);const file=match[0];if(!/^image\/(png|jpeg|gif|webp)$/.test(file.type)||file.size>2_000_000)throw Error('Unsupported image or larger than 2 MB');
 img.src=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file);});
 }return sanitize(t.innerHTML);
}
