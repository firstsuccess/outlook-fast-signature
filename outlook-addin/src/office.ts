import {sanitize} from '../../shared/model';
export const officeReady=()=>new Promise<void>((resolve,reject)=>{
 if(typeof Office==='undefined'){reject(Error('Microsoft Office.js could not load. Check the Microsoft CDN, proxy, and HTTPS hosting configuration.'));return;}
 const timer=setTimeout(()=>reject(Error('Outlook initialization timed out. Reopen the add-in from an Outlook compose message.')),20_000);
 Office.onReady(()=>{clearTimeout(timer);resolve();});
});
const images=new WeakMap<object,Map<string,string>>();
let applying=false;
const uncertain=new WeakSet<object>();
const maxSignatureLength=30_000;
function operation<T>(item:object,label:string,start:(done:(result:Office.AsyncResult<T>)=>void)=>void):Promise<T>{
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{uncertain.add(item);reject(Error(label+' timed out. Reopen the task pane and inspect the draft before retrying.'));},20_000);
  try{start(result=>{clearTimeout(timer);if(result.status===Office.AsyncResultStatus.Succeeded)resolve(result.value);else reject(Error(label+': '+result.error.message));});}catch(e){clearTimeout(timer);reject(e);}
 });
}
export async function applyOffice(html:string,expectedAccount=''):Promise<void>{
 if(applying)throw Error('Signature operation in progress.');
 if(typeof Office==='undefined'||!Office.context?.mailbox)throw Error('Open this task pane from an Outlook compose message.');
 if(!Office.context.requirements.isSetSupported('Mailbox','1.10'))throw Error('Mailbox 1.10 setSignatureAsync unavailable. Copy HTML from the editor and use Outlook signature settings.');
 const item=Office.context.mailbox.item;const body=item?.body;if(!body||typeof body.setSignatureAsync!=='function')throw Error('Open a compose message.');
 if(uncertain.has(item))throw Error('An earlier operation timed out. Reopen the task pane before retrying.');
 applying=true;try{
 if(expectedAccount){
  if(!Office.context.requirements.isSetSupported('Mailbox','1.7')||!item.from?.getAsync)throw Error('Sender verification unavailable. Use an account-independent signature or a supported Outlook client.');
  const sender=await operation<Office.EmailAddressDetails>(item,'Verify sender',done=>item.from.getAsync(done));if(sender.emailAddress.trim().toLowerCase()!==expectedAccount.trim().toLowerCase())throw Error('Sender account changed. Select the matching account signature.');
 }
 const t=document.createElement('template');t.innerHTML=sanitize(html);const cache=images.get(item)||new Map<string,string>();images.set(item,cache);
 const lengthCheck=t.content.cloneNode(true) as DocumentFragment;for(const img of lengthCheck.querySelectorAll('img'))if(img.getAttribute('src')?.startsWith('data:'))img.setAttribute('src','cid:monja-00000000-0000-0000-0000-000000000000.jpeg');const check=document.createElement('div');check.append(lengthCheck);if(check.innerHTML.length>maxSignatureLength)throw Error('Outlook limits signatures to 30,000 characters. Shorten the HTML before applying.');
 for(const img of t.content.querySelectorAll('img')){const data=img.getAttribute('src')||'';if(!data.startsWith('data:'))continue;
  if(Office.context.mailbox.item!==item)throw Error('Message changed during image preparation. Select the signature again.');
  if(typeof item.addFileAttachmentFromBase64Async!=='function')throw Error('Inline attachment API unavailable. Use HTTPS images.');
  let name=cache.get(data);if(!name){const match=/^data:image\/(png|jpeg|gif|webp);base64,([a-z0-9+/=\s]+)$/i.exec(data);if(!match||match[2].length>2_800_000)throw Error('Invalid inline image or larger than 2 MB');name='monja-'+crypto.randomUUID()+'.'+match[1];
   await operation<string>(item,'Inline attachment',done=>item.addFileAttachmentFromBase64Async(match[2],name!,{isInline:true},done));cache.set(data,name);
  }img.setAttribute('src','cid:'+name);
 }
 if(Office.context.mailbox.item!==item)throw Error('Message changed during operation. Select the signature again.');
 if(t.innerHTML.length>maxSignatureLength)throw Error('Signature exceeds the Outlook 30,000-character limit.');
 await operation<void>(item,'Apply signature',done=>body.setSignatureAsync(t.innerHTML,{coercionType:Office.CoercionType.Html},done));
 }finally{applying=false;}
}
export async function captureOffice():Promise<string>{const item=Office.context.mailbox.item;if(!item||typeof item.getSelectedDataAsync!=='function')throw Error('Selection API unavailable. Paste signature HTML or import an HTML file.');return new Promise((resolve,reject)=>item.getSelectedDataAsync(Office.CoercionType.Html,r=>{if(r.status!==Office.AsyncResultStatus.Succeeded)return reject(Error(r.error.message));const html=r.value.data;if(!html.trim())return reject(Error('Select only the signature in the message.'));resolve(sanitize(html));}));}
