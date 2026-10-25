import type {Kind} from '../../shared/model';
export interface Detection {kind:Kind;source:'action'|'subject'|'layout'}
const actionLabels:Record<Kind,RegExp>={
 new:/^(new mail|new message|new email|compose|compose mail|新規メール|新規メールの作成|メールを作成|新しいメール|新規メッセージ|新しいメッセージ|新邮件|新郵件|新增郵件|撰写|撰寫)$/i,
 reply:/^(reply|reply all|返信|全員に返信|全員へ返信|回复|全部回复|回复所有人|回覆|全部回覆|回覆所有人)$/i,
 forward:/^(forward|転送|转发|轉寄|轉發)$/i
};
/** Accessible UI only. No Office internals, tokens, or page JavaScript. */
export function actionKind(target:Element):Kind|undefined {
 const button=target.closest('button,[role="button"],[role="menuitem"]');if(!button||button.closest('[data-monja-ui]'))return;
 for(const candidate of [button.getAttribute('aria-label'),button.getAttribute('title'),button.textContent]){const label=(candidate||'').trim().replace(/\s*\([^)]*\)\s*$/,'').replace(/\s+/g,' ');const kind=(Object.keys(actionLabels) as Kind[]).find(k=>actionLabels[k].test(label));if(kind)return kind;}
}
export function subjectKind(subject:string):Kind|undefined {
 const value=subject.trim();if(/^(fw|fwd|wg|tr|転送|转发|轉寄|轉發)\s*[:：]/i.test(value))return 'forward';
 if(/^(re|aw|sv|vs|答复|回复|回覆|返信)\s*[:：]/i.test(value))return 'reply';
 // An unprefixed or blank subject never proves that this is a new message.
}
export function isSubjectInput(input:HTMLInputElement){return [input.getAttribute('aria-label'),input.getAttribute('placeholder'),input.name,input.id].some(value=>/^(subject|add a subject|enter a subject|件名|件名を追加|件名を入力|主题|添加主题|输入主题|主旨|新增主旨|輸入主旨)$/i.test((value||'').trim()));}
export function composeScope(editor:HTMLElement):HTMLElement|undefined {
 for(let parent=editor.parentElement;parent&&parent!==document.body;parent=parent.parentElement){
  const bodies=[...parent.querySelectorAll('[contenteditable="true"][role="textbox"][aria-label]')].filter(e=>/message body|本文|正文|郵件內文|邮件内容/i.test(e.getAttribute('aria-label')||''));
  if(bodies.length!==1)return;
  if([...parent.querySelectorAll('input')].some(input=>isSubjectInput(input)))return parent;
 }return editor.closest<HTMLElement>('[role="dialog"],form')||undefined;
}
export function detectSubject(editor:HTMLElement):Detection|undefined {
 const scope=composeScope(editor);if(!scope)return;
 const subjects=[...scope.querySelectorAll<HTMLInputElement>('input')].filter(input=>isSubjectInput(input));
 if(subjects.length!==1)return;const kind=subjectKind(subjects[0].value);if(kind)return {kind,source:'subject'};if(!subjects[0].value.trim()&&!editor.textContent?.trim()&&!editor.querySelector('img,table,hr,blockquote,[data-monja-signature]'))return {kind:'new',source:'layout'};
}
