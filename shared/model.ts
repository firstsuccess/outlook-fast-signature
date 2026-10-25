import DOMPurify from 'dompurify';
export type Kind = 'new'|'reply'|'forward';
export interface Signature {id:string;name:string;html:string;createdAt:string;updatedAt:string;source:string;account:string}
export interface Library {schemaVersion:1;defaultsScope?:'installation';signatures:Signature[];defaults:Record<string,Partial<Record<Kind,string>>>;language:'ja'|'en'|'zh';overlay:boolean;leadingBlankLines:number}
export const empty = ():Library=>({schemaVersion:1,defaultsScope:'installation',signatures:[],defaults:{},language:'ja',overlay:true,leadingBlankLines:3});
export function sanitize(html:string):string {
 const clean=DOMPurify.sanitize(html,{ALLOWED_TAGS:['div','p','br','span','b','strong','i','em','u','s','a','img','table','tbody','thead','tr','td','th','ul','ol','li','font'],ALLOWED_ATTR:['href','src','alt','title','width','height','style','color','size','face','cellpadding','cellspacing','border','colspan','rowspan'],ALLOW_DATA_ATTR:false});
 const t=document.createElement('template');t.innerHTML=clean;
 t.content.querySelectorAll('*').forEach(el=>{
  if(el.hasAttribute('style')) {const style=(el as HTMLElement).style;const safe=document.createElement('span').style;for(const p of ['color','background-color','font-family','font-size','font-weight','font-style','text-decoration','text-align','border','border-collapse','padding','margin','width','height','vertical-align']){const v=style.getPropertyValue(p);if(v&&!/url|expression|@|\\/i.test(v))safe.setProperty(p,v);}el.setAttribute('style',safe.cssText);}
  for(const attr of ['src','href']){const v=el.getAttribute(attr);if(v&&!(/^(https:\/\/|mailto:|tel:)/i.test(v)||(attr==='src'&&/^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(v))))el.removeAttribute(attr);}
 });return t.innerHTML;
}
export function createSignature(name:string,html:string,source='editor',account=''):Signature {const now=new Date().toISOString();return {id:crypto.randomUUID(),name:name.trim()||'Signature',html:sanitize(html),createdAt:now,updatedAt:now,source,account:account.trim().toLowerCase()};}
export function parseLibrary(raw:string):Library {
 if(raw.length>12_000_000)throw Error('File too large');const v=JSON.parse(raw);
 if(!v||v.schemaVersion!==1||!Array.isArray(v.signatures)||v.signatures.length>500)throw Error('Invalid schema');
 const ids=new Set<string>();const signatures:Signature[]=v.signatures.map((s:any)=>{
  if(!s||typeof s.id!=='string'||ids.has(s.id)||typeof s.name!=='string'||typeof s.html!=='string'||!s.id.match(/^[\w-]{1,80}$/)||s.name.length>120)throw Error('Invalid signature');
  ids.add(s.id);const result=createSignature(s.name,s.html,String(s.source||'json'),typeof s.account==='string'?s.account:'');
  return {...result,id:s.id,createdAt:typeof s.createdAt==='string'&&Number.isFinite(Date.parse(s.createdAt))?s.createdAt:result.createdAt,updatedAt:typeof s.updatedAt==='string'&&Number.isFinite(Date.parse(s.updatedAt))?s.updatedAt:result.updatedAt};
 });
 const defaults:Library['defaults']={};for(const [a,d]of Object.entries(v.defaults||{})){
  if(!d||typeof d!=='object')continue;const row:Partial<Record<Kind,string>>={};for(const k of ['new','reply','forward'] as Kind[]){const id=(d as any)[k];const sig=signatures.find(s=>s.id===id);if(id===''||id==='__unset'||sig)row[k]=id;}
  Object.defineProperty(defaults,a.toLowerCase(),{value:row,enumerable:true,writable:true,configurable:true});
 }
 // Preserve legacy rows for backup; only promote unanimous values when no shared choice exists.
 const common=defaults['']||{};if(v.defaultsScope!=='installation')for(const k of ['new','reply','forward'] as Kind[]){if(Object.hasOwn(common,k))continue;const values=[...new Set(Object.entries(defaults).filter(([a])=>a!=='').map(([,d])=>d[k]).filter((v):v is string=>v!==undefined))];if(values.length===1)common[k]=values[0];}defaults['']=common;
 return {schemaVersion:1,defaultsScope:'installation',signatures,defaults,language:['ja','en','zh'].includes(v.language)?v.language:'ja',overlay:v.overlay!==false,leadingBlankLines:blankLineCount(v.leadingBlankLines)};
}
export const forAccount=(l:Library,account:string)=>l.signatures;
export const serialize=(l:Library)=>JSON.stringify(l,null,2);
export function remove(l:Library,id:string){l.signatures=l.signatures.filter(s=>s.id!==id);for(const d of Object.values(l.defaults))for(const k of ['new','reply','forward'] as Kind[])if(d[k]===id)delete d[k];}
export function defaultId(l:Library,account:string,kind:Kind){const id=l.defaults['']?.[kind];return id==='__unset'?undefined:id;}

export function blankLineCount(value:unknown){return typeof value==='number'&&Number.isInteger(value)&&value>=1&&value<=9?value:3;}
