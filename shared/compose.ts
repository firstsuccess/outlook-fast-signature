import {signatureStream,signatureValue,contentKey,locateSignature} from './signature-range';
import {sanitize,blankLineCount} from './model';

/** Native editing lets Outlook observe input and preserves browser undo.
 * dom-test is an explicit jsdom test adapter, never used by the extension. */
export class Compose {
 private node:HTMLElement|null=null;
 private signature='';private token='';
 private ambiguous=false;
 private selected?:Range;private bodyCursor?:Range;
 constructor(public editor:HTMLElement,private mode:'native'|'dom-test'='native',knownSignatures?:string[]){
  const found=editor.querySelectorAll<HTMLElement>('[data-monja-signature]');
  if(found.length){this.node=found[0];this.token=this.node.dataset.monjaSignature!;
   if([...found].some(node=>node.dataset.monjaSignature!==this.token)){this.ambiguous=true;return;}
   const actual=signatureStream(this.node).value,key=this.node.dataset.monjaContent;
   if(found.length===1&&(key===contentKey(actual)||(!key&&!knownSignatures)))this.signature=actual;
   else if(knownSignatures){const candidates=[...new Set([...knownSignatures,'<br>'].map(signatureValue))].filter(value=>(!key||contentKey(value)===key)&&[...found].filter(node=>locateSignature(node,value)).length===1);if(candidates.length===1)this.signature=candidates[0];else this.ambiguous=true;}else this.ambiguous=true;
  }
 }
 typingCursor(){return this.bodyCursor&&this.editor.contains(this.bodyCursor.commonAncestorContainer)&&!this.node?.contains(this.bodyCursor.commonAncestorContainer)?this.bodyCursor.cloneRange():undefined;}
 anchor(){return this.node&&this.editor.contains(this.node)?this.node:this.editor;}
 adopt(range:Range){
  if(range.collapsed||!this.editor.contains(range.commonAncestorContainer))throw Error('Select only the signature inside this message.');
  if(this.node&&this.editor.contains(this.node)&&!range.intersectsNode(this.node))throw Error('A managed signature already exists. Select that signature or use the dropdown without selecting another part of the body.');
  this.selected=range.cloneRange();
 }
 apply(html:string,insertion?:Range,leadingBlankLines=0){
  if(!this.editor.isConnected)throw Error('Compose unavailable.');
  const safe=sanitize(html);this.bodyCursor=undefined;
  if(!safe&&!this.node&&!this.selected)return;
  if(insertion&&(!insertion.collapsed||!this.editor.contains(insertion.commonAncestorContainer)))throw Error('Insertion cursor is outside this message.');
  let tracked:ReturnType<typeof locateSignature>;
  if(!this.selected){
   if(this.ambiguous)throw Error('Multiple signature markers. Select the exact signature to replace.');
   if(this.node){const found=this.editor.querySelectorAll<HTMLElement>('[data-monja-signature]');if([...found].some(node=>node.dataset.monjaSignature!==this.token))throw Error('Multiple signature markers. Select the exact signature to replace.');const matches=[...found].map(node=>({node,located:locateSignature(node,this.signature)})).filter(match=>match.located);if(matches.length>1)throw Error('Multiple signature markers. Select the exact signature to replace.');if(matches.length!==1)throw Error('Signature changed. Select the exact signature to replace.');this.node=matches[0].node;tracked=matches[0].located;}
   if(!this.node&&!insertion&&(this.editor.textContent?.trim()||this.editor.querySelector('img,table,hr,video,object')))throw Error('Existing body: select the exact signature range first.');
  }
  const range=this.selected?.cloneRange()||tracked?.range||insertion?.cloneRange()||document.createRange();
  if(this.selected&&!this.editor.contains(range.commonAncestorContainer))throw Error('Selection moved. Select the signature again.');
  const reuse=!!tracked?.whole&&!this.selected;
  if(reuse&&this.node!.innerHTML===(safe||'<br>'))return;
  if(!this.selected&&!tracked){if(this.node)range.selectNodeContents(this.node);else if(!insertion){range.selectNodeContents(this.editor);range.collapse(false);}}
  const addLines=!this.node&&safe&&leadingBlankLines?blankLineCount(leadingBlankLines):0;
  const token=reuse?this.node!.dataset.monjaSignature!:crypto.randomUUID();const next=document.createElement('div');next.dataset.monjaSignature=token;next.innerHTML=safe||'<br>';
  if(this.mode==='native'){
   if(typeof document.execCommand!=='function')throw Error('Browser editing API unavailable. Use the Office add-in or copy the signature.');
   this.editor.focus();const selection=getSelection();if(!selection)throw Error('Selection unavailable.');selection.removeAllRanges();selection.addRange(range);
   const start=range.cloneRange();const prefix=Array.from({length:addLines},(_,i)=>'<div'+(i===0?' data-monja-spacer="'+token+'"':'')+'><br></div>').join('');const before=this.editor.innerHTML;document.execCommand('insertHTML',false,reuse?next.innerHTML:prefix+next.outerHTML);
   if(this.editor.innerHTML===before)throw Error('Outlook did not accept the edit. No change was made.');
   // Chromium may normalize away a block wrapper inside a paragraph. Recover only
   // the exact inserted fragment, never a guessed existing signature or body range.
   if(!reuse&&!this.editor.querySelector('[data-monja-signature="'+token+'"]')&&selection.rangeCount){
    const end=selection.getRangeAt(0);const insertedRange=document.createRange();insertedRange.setStart(start.startContainer,start.startOffset);insertedRange.setEnd(end.endContainer,end.endOffset);
    const recovery=locateSignature(this.editor,signatureValue(next.innerHTML),insertedRange);const signatureRange=recovery?.range;const fragment=document.createElement('div');if(signatureRange)fragment.append(signatureRange.cloneContents());const imageSources=(el:HTMLElement)=>JSON.stringify([...el.querySelectorAll('img')].map(img=>img.getAttribute('src')));
    if(signatureRange&&!signatureRange.collapsed&&this.editor.contains(signatureRange.commonAncestorContainer)&&fragment.textContent===next.textContent&&imageSources(fragment)===imageSources(next)){
     const marker=document.createElement('div');marker.dataset.monjaSignature=token;marker.append(signatureRange.extractContents());signatureRange.insertNode(marker);this.editor.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText'}));
    }
   }
  }else{
   range.deleteContents();if(reuse){const fragment=document.createRange().createContextualFragment(next.innerHTML);range.insertNode(fragment);}else{for(let i=0;i<addLines;i++){const spacer=document.createElement('div');spacer.innerHTML='<br>';if(i===0)spacer.dataset.monjaSpacer=token;range.insertNode(spacer);range.setStartAfter(spacer);range.collapse(true);}range.insertNode(next);}this.editor.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText'}));
  }
  const inserted=this.editor.querySelector<HTMLElement>(`[data-monja-signature="${token}"]`);this.selected=undefined;
  if(!inserted){this.node=null;this.ambiguous=true;throw Error('Editing result cannot be tracked. Inspect the body; do not repeat insertion. Use the Office add-in if Outlook removes the signature marker.');}
  let ancestor=inserted.parentElement?.closest<HTMLElement>('[data-monja-signature]');while(ancestor&&this.editor.contains(ancestor)){ancestor.removeAttribute('data-monja-signature');ancestor=ancestor.parentElement?.closest<HTMLElement>('[data-monja-signature]');}
  for(const clone of this.editor.querySelectorAll<HTMLElement>('[data-monja-signature]'))if(clone!==inserted&&clone.dataset.monjaSignature===this.token){clone.removeAttribute('data-monja-signature');clone.removeAttribute('data-monja-content');}
  if(addLines){const spacer=this.editor.querySelector<HTMLElement>('[data-monja-spacer="'+token+'"]');if(spacer&&!inserted.contains(spacer)){this.bodyCursor=document.createRange();this.bodyCursor.selectNodeContents(spacer);this.bodyCursor.collapse(true);spacer.removeAttribute('data-monja-spacer');}else{let first:Node|null=inserted;for(let i=0;i<addLines;i++){const previous:Node|null=first?.previousSibling||null;if(previous&&!(previous.textContent||'').trim()&&(!(previous instanceof Element)||!previous.querySelector('img,table,[data-monja-signature]')))first=previous;else break;}this.bodyCursor=document.createRange();if(first&&first!==inserted){this.bodyCursor.selectNodeContents(first);this.bodyCursor.collapse(true);}else if(!inserted.contains(range.startContainer)&&this.editor.contains(range.startContainer)){this.bodyCursor=range.cloneRange();this.bodyCursor.collapse(true);}else{this.bodyCursor.setStartBefore(inserted);this.bodyCursor.collapse(true);}}}
  this.node=inserted;this.signature=signatureStream(inserted).value;this.token=token;inserted.dataset.monjaContent=contentKey(this.signature);this.ambiguous=false;
 }
}
