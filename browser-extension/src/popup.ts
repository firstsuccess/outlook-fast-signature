import {load} from '../../shared/storage';
(async()=>{const lib=await load();document.documentElement.lang=lib.language;const button=document.querySelector('button')!;button.textContent={ja:'設定',en:'Settings',zh:'设置'}[lib.language];button.onclick=()=>chrome.runtime.openOptionsPage();})();
