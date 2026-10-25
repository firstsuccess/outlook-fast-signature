/** Visible signature content, independent of Outlook's harmless wrapper/style rewrites. */
export function signatureStream(root:HTMLElement|DocumentFragment){
 const segments:{from:number;to:number;node:Node;text:boolean}[]=[];let value='';
 function visit(node:Node){
  if(node.nodeType===Node.TEXT_NODE){const text=(node.textContent||'').replace(/\u00a0/g,' ');if(text){segments.push({from:value.length,to:value.length+text.length,node,text:true});value+=text;}return;}
  if(node instanceof HTMLElement){let token='';if(node.tagName==='BR')token='\n';else if(node.tagName==='IMG')token='\ufffc'+JSON.stringify([node.getAttribute('src'),node.getAttribute('alt')||''])+'\ufffc';
   if(token){segments.push({from:value.length,to:value.length+token.length,node,text:false});value+=token;return;}}
  for(const child of node.childNodes)visit(child);
 }for(const child of root.childNodes)visit(child);
 return {value,segments};
}
export function contentKey(value:string){let a=2166136261,b=5381;for(let i=0;i<value.length;i++){a=Math.imul(a^value.charCodeAt(i),16777619);b=Math.imul(b,33)^value.charCodeAt(i);}return value.length+':'+(a>>>0).toString(16)+':'+(b>>>0).toString(16);}
export function signatureValue(html:string){const root=document.createElement('template');root.innerHTML=html;return signatureStream(root.content).value;}
export function locateSignature(root:HTMLElement,expected:string,within?:Range):{range:Range;whole:boolean}|undefined {
 const {value,segments}=signatureStream(root);const range=document.createRange();
 if(value===expected&&!within){range.selectNodeContents(root);return {range,whole:true};}
 if(!expected)return;
 const matches:number[]=[];let cursor=0;
 while(cursor<=value.length){const at=value.indexOf(expected,cursor);if(at<0)break;cursor=at+1;
  if(!within){matches.push(at);continue;}
  const start=segments.find(s=>at>=s.from&&at<s.to),end=segments.find(s=>at+expected.length>s.from&&at+expected.length<=s.to);if(!start||!end)continue;
  const candidate=document.createRange();if(start.text)candidate.setStart(start.node,at-start.from);else candidate.setStartBefore(start.node);if(end.text)candidate.setEnd(end.node,at+expected.length-end.from);else candidate.setEndAfter(end.node);
  if(candidate.compareBoundaryPoints(Range.START_TO_START,within)>=0&&candidate.compareBoundaryPoints(Range.END_TO_END,within)<=0)matches.push(at);
 }
 if(matches.length!==1)return;const at=matches[0];
 const end=at+expected.length;const first=segments.find(s=>at>=s.from&&at<s.to),last=segments.find(s=>end>s.from&&end<=s.to);if(!first||!last)return;
 if(first.text)range.setStart(first.node,at-first.from);else {if(at!==first.from)return;range.setStartBefore(first.node);}
 if(last.text)range.setEnd(last.node,end-last.from);else {if(end!==last.to)return;range.setEndAfter(last.node);}
 // Remove the entire original table when it contains exactly the signature, not body text.
 const common=range.commonAncestorContainer;const element=common instanceof Element?common:common.parentElement;const table=element?.closest('table');if(table&&root.contains(table)&&signatureStream(table).value===expected)range.selectNode(table);
 return {range,whole:false};
}
