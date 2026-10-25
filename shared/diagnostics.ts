import {VERSION} from './version';
/** Deliberately excludes signatures, message text, sender addresses, and URLs. */
export function diagnostics(){
 const office=typeof Office!=='undefined'&&!!Office.context?.mailbox;
 return {product:'monja-fast-signature',version:VERSION,capturedAt:new Date().toISOString(),environment:office?'office-addin':'browser-extension',capabilities:office?{mailbox13:Office.context.requirements.isSetSupported('Mailbox','1.3'),mailbox110:Office.context.requirements.isSetSupported('Mailbox','1.10'),host:Office.context.mailbox.diagnostics?.hostName,hostVersion:Office.context.mailbox.diagnostics?.hostVersion}:{manifestV3:typeof chrome!=='undefined'&&!!chrome.runtime?.id},online:navigator.onLine,localStorageAvailable:storageAvailable()};
}
function storageAvailable(){try{const key='monja-capability-'+crypto.randomUUID();localStorage.setItem(key,'1');localStorage.removeItem(key);return true;}catch{return false;}}
