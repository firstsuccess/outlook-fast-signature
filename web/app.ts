import {displayError} from '../shared/errors';
import {createSignature,empty,Library,parseLibrary,remove,sanitize,serialize,Kind,forAccount,defaultId} from '../shared/model';
import {load,save,loadUiState,saveUiState} from '../shared/storage';
import {importFiles} from '../classic-importer/import';
import {messages} from './i18n';
import {applyOffice,captureOffice,officeReady} from '../outlook-addin/src/office';
import {diagnostics} from '../shared/diagnostics';
import {VERSION} from '../shared/version';
import {uiText} from './ui-text';
let lib:Library=empty(), selected='__choose',sourceMode=false;
let uiSaveQueue=Promise.resolve();
function rememberSelection(){const state={signatureId:selected,account:''};uiSaveQueue=uiSaveQueue.catch(()=>{}).then(()=>saveUiState(state));return uiSaveQueue;}
const office=location.pathname.includes('taskpane');
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const val=(id:string)=>$<HTMLInputElement>(id).value;
const report=(e:unknown)=>{$('status').textContent=displayError(e,lib.language);};
const run=(f:()=>unknown)=>async()=>{try{await f();}catch(e){report(e);}};
const download=(name:string,body:string,type:string)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
function render(){sourceMode=false;const t=messages[lib.language],u=uiText[lib.language];document.documentElement.lang=lib.language;document.title=t.title;
document.body.innerHTML=`<header><div><h1>${t.title}</h1><small>Monja Fast Signature · First Success G.K. · 2026.10 · ${VERSION}</small></div><select id="language" aria-label="${t.language}"><option value="ja">日本語</option><option value="en">English</option><option value="zh">中文</option></select></header><main><aside><h2>${t.library}</h2><div id="list"></div><button id="new">${t.new}</button><hr><button id="apply" class="primary">${t.apply}</button><button id="capture">${t.capture}</button></aside><section><label>${t.name}<input id="name" maxlength="120"></label><div class="toolbar"><button id="bold">${t.bold}</button><button id="italic">${t.italic}</button><select id="font" aria-label="${t.font}"><option>Arial</option><option>Meiryo</option><option>Georgia</option><option>Calibri</option></select><select id="size" aria-label="${t.size}"><option value="2">10</option><option value="3" selected>12</option><option value="4">14</option><option value="5">18</option></select><input id="color" type="color" aria-label="${t.color}"><button id="link">${t.link}</button><button id="image">${t.image}</button><button id="table">${t.table}</button></div><label><input type="checkbox" id="source"> ${t.source}</label><div id="editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="${t.paste}"></div><textarea id="html" aria-label="${t.source}" hidden></textarea><div><button class="primary" id="save">${t.save}</button><button id="duplicate">${t.duplicate}</button><button id="delete">${t.delete}</button><button id="up">${t.up}</button><button id="down">${t.down}</button><button id="htmlOut">${t.htmlOut}</button></div><h2>${t.preview}</h2><iframe id="preview" sandbox="" title="${t.preview}" referrerpolicy="no-referrer"></iframe></section><section class="wide"><h2>${t.defaults}</h2><div id="defaults"></div><label id="blankLinesLabel"></label><label><input type="checkbox" id="overlay"> ${t.overlay}</label><p>${t.selection}</p><label>${t.import}<input type="file" id="files" multiple accept=".html,.htm,.txt,image/png,image/jpeg,image/gif,image/webp"></label><label>${t.folder}<input type="file" id="folder" multiple webkitdirectory></label><label>${t.jsonIn}<input type="file" id="json" accept="application/json,.json"></label><button id="jsonOut">${t.jsonOut}</button></section><section class="wide"><h2>${t.support}</h2><p>ファーストサクセス合同会社 / First Success G.K.</p><p>${t.privacy}</p><a href="privacy.html" target="_blank" rel="noreferrer">Privacy / Security / Support</a></section></main><div id="status" role="status" aria-live="polite"></div>`;
$<HTMLSelectElement>('language').value=lib.language;$<HTMLInputElement>('overlay').checked=lib.overlay;
const blankLabel={ja:'署名の前に追加する空行（Web拡張）',en:'Blank lines before signature (Web extension)',zh:'签名前的空行（Web 扩展）'}[lib.language];$('blankLinesLabel').textContent=blankLabel;const blankLines=document.createElement('select');blankLines.id='leadingBlankLines';for(let n=1;n<=9;n++)blankLines.add(new Option(String(n),String(n)));blankLines.value=String(lib.leadingBlankLines);blankLines.onchange=run(async()=>{lib.leadingBlankLines=Number(blankLines.value);await save(lib);report(u.saved);});$('blankLinesLabel').append(blankLines);
$('apply').textContent=u.apply;$('capture').textContent=u.capture;const captureHelp=document.createElement('p');captureHelp.className='help';captureHelp.textContent=u.captureHelp;$('capture').after(captureHelp);const accountHelp=document.createElement('p');accountHelp.className='help';accountHelp.textContent=u.accountHelp;$('defaults').before(accountHelp);$('overlay').parentElement!.classList.add('overlay-setting');
const diagnosticButton=document.createElement('button');diagnosticButton.textContent={ja:'診断情報を書き出す（本文・署名を含まない）',en:'Export diagnostics (no message or signature)',zh:'导出诊断信息（不含正文或签名）'}[lib.language];diagnosticButton.onclick=run(async()=>{let extension:unknown;try{if(!office&&typeof chrome!=='undefined'&&chrome.runtime)extension=await activeMessage('diagnostics');}catch{extension={unavailable:true};}download('monja-diagnostics.json',JSON.stringify({...diagnostics(),extension},null,2),'application/json');});$('status').before(diagnosticButton);
const copyButton=document.createElement('button');copyButton.textContent={ja:'署名をコピー（手動貼り付け用）',en:'Copy signature for manual paste',zh:'复制签名以手动粘贴'}[lib.language];$('htmlOut').after(copyButton);copyButton.onclick=run(async()=>{const html=currentHTML();const temp=document.createElement('div');temp.innerHTML=html;const text=temp.innerText||temp.textContent||'';if(navigator.clipboard?.write&&typeof ClipboardItem!=='undefined')await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([text],{type:'text/plain'})})]);else if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else throw Error('Clipboard unavailable. Export HTML or copy from the editor.');report({ja:'コピーしました。Outlookで署名範囲を選んで貼り付けてください。',en:'Copied. Select the signature range in Outlook and paste.',zh:'已复制。请在 Outlook 选择签名范围后粘贴。'}[lib.language]);});
const quick=document.createElement('select');quick.id='signatureSelect';quick.setAttribute('aria-label',t.select);$('apply').before(quick);
quick.onchange=run(async()=>{selected=quick.value;edit();drawList();await rememberSelection();if(selected==='__choose')return;
 if(!office&&(typeof chrome==='undefined'||!chrome.runtime)){report(u.selected);return;}
 try{await applySelected();}catch(e){report(u.previewKept+'\n'+(displayError(e,lib.language)));}
});
for(const s of lib.signatures){const b=document.createElement('button');b.textContent=s.name;b.setAttribute('aria-current',String(s.id===selected));b.onclick=run(async()=>{selected=s.id;quick.value=s.id;edit();drawList();await rememberSelection();});$('list').append(b);}
function drawList(){[...$('list').children].forEach((b,i)=>b.setAttribute('aria-current',String(lib.signatures[i].id===selected)));}
function edit(){const s=lib.signatures.find(s=>s.id===selected);$<HTMLInputElement>('name').value=s?.name||'';$('editor').innerHTML=s?.html||'';$<HTMLTextAreaElement>('html').value=s?.html||'';preview();}
const currentHTML=()=>sanitize(sourceMode?val('html'):$('editor').innerHTML);
function preview(){$<HTMLIFrameElement>('preview').srcdoc=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:">${currentHTML()}`;}
let editorRange:Range|undefined;const rememberRange=()=>{const selection=getSelection();if(selection?.rangeCount&&$('editor').contains(selection.getRangeAt(0).commonAncestorContainer))editorRange=selection.getRangeAt(0).cloneRange();};for(const event of ['keyup','pointerup','blur'])$('editor').addEventListener(event,rememberRange);
function format(command:string,value?:string){if(sourceMode)return;const editor=$('editor');editor.focus();if(editorRange&&editor.contains(editorRange.commonAncestorContainer)){const selection=getSelection();selection?.removeAllRanges();selection?.addRange(editorRange);}document.execCommand(command,false,value);rememberRange();preview();}
$('editor').addEventListener('input',preview);$('html').addEventListener('input',preview);
$('editor').addEventListener('paste',e=>{e.preventDefault();const data=(e as ClipboardEvent).clipboardData;document.execCommand('insertHTML',false,sanitize(data?.getData('text/html')||data?.getData('text/plain')?.replace(/</g,'&lt;')||''));preview();});
$('editor').addEventListener('drop',e=>{e.preventDefault();const data=(e as DragEvent).dataTransfer;document.execCommand('insertHTML',false,sanitize(data?.getData('text/html')||data?.getData('text/plain')?.replace(/</g,'&lt;')||''));preview();});
$('source').onchange=()=>{sourceMode=$<HTMLInputElement>('source').checked;if(sourceMode)$<HTMLTextAreaElement>('html').value=sanitize($('editor').innerHTML);else $('editor').innerHTML=sanitize(val('html'));$('editor').hidden=sourceMode;$('html').hidden=!sourceMode;preview();};
for(const [id,cmd] of [['bold','bold'],['italic','italic']]){$(id).onmousedown=e=>e.preventDefault();$(id).onclick=()=>format(cmd);}
for(const [id,cmd]of [['font','fontName'],['size','fontSize'],['color','foreColor']])$(id).onchange=()=>format(cmd,val(id));
for(const [id,cmd]of [['link','createLink'],['image','insertImage']]){$(id).onmousedown=e=>e.preventDefault();$(id).onclick=()=>{const url=prompt(id==='image'?'https://':'https:// / mailto: / tel:');if(url&&(id==='image'?/^https:\/\//i:/^(https:\/\/|mailto:|tel:)/i).test(url))format(cmd,url);};}
$('table').onmousedown=e=>e.preventDefault();$('table').onclick=()=>format('insertHTML','<table border="1"><tbody><tr><td>Company</td><td>Name</td></tr><tr><td>Phone</td><td>Email</td></tr></tbody></table>');
$('new').onclick=run(async()=>{selected='__choose';quick.value='__choose';edit();drawList();await rememberSelection();});
$('save').onclick=run(async()=>{const s=lib.signatures.find(s=>s.id===selected);if(s){s.name=val('name').trim()||'Signature';s.html=currentHTML();s.updatedAt=new Date().toISOString();}else{const n=createSignature(val('name'),currentHTML(),'editor');lib.signatures.push(n);selected=n.id;}await save(lib);await rememberSelection();sourceMode=false;render();report(t.saved);});
$('duplicate').onclick=run(async()=>{const s=lib.signatures.find(s=>s.id===selected);if(!s)throw Error(t.choose);const n=createSignature(s.name+' (copy)',s.html,'duplicate',s.account);lib.signatures.push(n);selected=n.id;await save(lib);await rememberSelection();render();});
$('delete').onclick=run(async()=>{if(confirm(t.confirm)){remove(lib,selected);selected='__choose';await save(lib);await rememberSelection();render();}});
for(const [id,offset]of [['up',-1],['down',1]] as const)$(id).onclick=run(async()=>{const i=lib.signatures.findIndex(s=>s.id===selected),j=i+offset;if(i>=0&&j>=0&&j<lib.signatures.length){[lib.signatures[i],lib.signatures[j]]=[lib.signatures[j],lib.signatures[i]];await save(lib);render();}});
$('htmlOut').onclick=()=>download('signature.html',currentHTML(),'text/html');$('jsonOut').onclick=()=>download('monja-signatures.json',serialize(lib),'application/json');
$('json').onchange=run(async()=>{const file=$<HTMLInputElement>('json').files?.[0];if(file&&confirm(t.replace)){const next=parseLibrary(await file.text());await save(next);lib=next;selected='__choose';await rememberSelection();render();}});
for(const id of ['files','folder'])$(id).onchange=run(async()=>{const files=[...($<HTMLInputElement>(id).files||[])];const html=await importFiles(files);const s=createSignature(files.find(f=>/\.html?$/i.test(f.name))?.name||'Imported',html,'classic-file');lib.signatures.push(s);selected=s.id;await save(lib);await rememberSelection();render();});
function defaults(){
 const a='';$('defaults').replaceChildren();quick.replaceChildren(new Option(t.select,'__choose'),new Option(t.none,''));for(const s of forAccount(lib,a))quick.add(new Option(s.name,s.id));
 if(![...quick.options].some(o=>o.value===selected)){selected='__choose';edit();drawList();}quick.value=selected;
 for(const [k,label]of [['new',t.newMail],['reply',t.reply],['forward',t.forward]] as const){
  const l=document.createElement('label');l.textContent=label;const select=document.createElement('select');select.id='default-'+k;for(const [id,name]of [['__unset',t.unset],['',t.none],...forAccount(lib,a).map(s=>[s.id,s.name])])select.add(new Option(name,id));
  const configured=defaultId(lib,a,k);select.value=configured===''?'':forAccount(lib,a).some(s=>s.id===configured)?configured!:'__unset';select.onchange=run(async()=>{if(!Object.hasOwn(lib.defaults,a))Object.defineProperty(lib.defaults,a,{value:{},enumerable:true,writable:true});if(select.value==='__unset'&&!a)delete lib.defaults[a][k];else lib.defaults[a][k]=select.value;await save(lib);report(u.saved);});
  l.append(select);$('defaults').append(l);
 }
}
defaults();$('overlay').onchange=run(async()=>{lib.overlay=$<HTMLInputElement>('overlay').checked;await save(lib);});$('language').onchange=run(async()=>{lib.language=val('language') as Library['language'];await save(lib);sourceMode=false;render();});
async function activeMessage(action:string,html?:string){const r=await chrome.runtime.sendMessage({action:'routeCompose',message:{action,html}});if(r?.error)throw Error(r.error);if(!r)throw Error('Focus Outlook compose first.');return r;}
async function applySelected(){const s=lib.signatures.find(s=>s.id===selected);if(selected==='__choose'||(selected&&!s))throw Error(t.choose);if(office){await applyOffice(s?.html||'');report(t.saved);}else{await activeMessage('apply',s?.html||'');report(t.draft);}}
$('apply').onclick=run(applySelected);
$('capture').onclick=run(async()=>{const html=office?await captureOffice():(await activeMessage('capture')).html;const s=createSignature('Outlook',html,'outlook-selection');lib.signatures.push(s);selected=s.id;await save(lib);await rememberSelection();render();});
edit();
}
(async()=>{try{
 if(office)await officeReady();lib=await load();const ui=await loadUiState();selected=ui.signatureId===''||lib.signatures.some(s=>s.id===ui.signatureId)?ui.signatureId:'__choose';render();
 if(office){if(!Office.context.mailbox){report('Open the add-in from Outlook to apply signatures. Local editing and import/export are available here.');return;}Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged,()=>{selected='__choose';render();void rememberSelection().catch(report);report('Message changed. Select a signature.');});}
}catch(e){document.body.textContent=String(e);}})();




