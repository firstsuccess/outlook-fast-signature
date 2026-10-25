// Session-only compose tab pointer, never mail content or credentials.
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
 if(message.action==='openSettings'){chrome.runtime.openOptionsPage().then(()=>respond({ok:true})).catch(e=>respond({error:String(e)}));return true;}
 if(message.action==='focusCompose'&&sender.tab?.id&&typeof message.composeId==='string'){chrome.storage.session.set({composeTab:sender.tab.id,composeId:message.composeId}).then(()=>respond({ok:true})).catch(e=>respond({error:String(e)}));return true;}
 if(message.action==='routeCompose'&&!sender.tab?.url?.startsWith('https://outlook.')){
  (async()=>{try{const {composeTab,composeId}=await chrome.storage.session.get(['composeTab','composeId']);if(typeof composeTab!=='number'||typeof composeId!=='string')throw Error('Focus the intended Outlook compose message first.');const result=await chrome.tabs.sendMessage(composeTab,{...message.message,expectedComposeId:composeId});respond(result);}catch(e){respond({error:String(e)});}})();return true;
 }
 return false;
});
