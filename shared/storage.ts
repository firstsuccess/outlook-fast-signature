import {empty,parseLibrary,serialize,Library} from './model';
export const LIBRARY_STORAGE_KEY='monja-fast-signature-v1';
const key=LIBRARY_STORAGE_KEY;
const uiKey='monja-fast-signature-ui-v1';
export interface UiState {signatureId:string;account:string}
export async function loadUiState():Promise<UiState>{
 const raw=typeof chrome!=='undefined'&&chrome.storage?(await chrome.storage.local.get(uiKey))[uiKey]:localStorage.getItem(uiKey);
 try{const value=typeof raw==='string'?JSON.parse(raw):null;return {signatureId:typeof value?.signatureId==='string'?value.signatureId:'__choose',account:typeof value?.account==='string'?value.account:''};}catch{return {signatureId:'__choose',account:''};}
}
export async function saveUiState(state:UiState){const raw=JSON.stringify(state);if(typeof chrome!=='undefined'&&chrome.storage)await chrome.storage.local.set({[uiKey]:raw});else localStorage.setItem(uiKey,raw);}
export async function load():Promise<Library>{const raw=typeof chrome!=='undefined'&&chrome.storage? (await chrome.storage.local.get(key))[key]:localStorage.getItem(key);if(raw!=null&&typeof raw!=='string')throw Error('Invalid stored library');return raw?parseLibrary(raw):empty();}
export async function save(l:Library){const raw=serialize(l);if(new TextEncoder().encode(raw).length>9_000_000)throw Error('Storage limit (9 MB). Export images separately.');if(typeof chrome!=='undefined'&&chrome.storage)await chrome.storage.local.set({[key]:raw});else localStorage.setItem(key,raw);}
