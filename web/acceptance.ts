import data from '../shared/pilot-cases.json';
import {VERSION} from '../shared/version';
const container=document.getElementById('tests')!;
const versions=new Map<string,HTMLInputElement>();
const rows:{client:string;caseId:string;status:HTMLSelectElement;note:HTMLInputElement}[]=[];
for(const client of data.clients){
 const section=document.createElement('section');const h=document.createElement('h2');h.textContent=client;const label=document.createElement('label');label.textContent='クライアント／ブラウザーのバージョン: ';const version=document.createElement('input');version.placeholder='例: Outlook 16.0.x / Edge x';label.append(version);versions.set(client,version);section.append(h,label);
 for(const c of data.cases){const row=document.createElement('label');row.textContent=c.label+' ';const status=document.createElement('select');status.setAttribute('aria-label',client+' '+c.label);for(const [id,text]of [['pending','未実施'],['pass','合格'],['fail','不合格'],['na','対象外（理由を記入）']])status.add(new Option(text,id));const note=document.createElement('input');note.placeholder='実際の結果・対象外理由（本文・個人情報は記入しない）';row.append(status,note);rows.push({client,caseId:c.id,status,note});section.append(row);}
 container.append(section);
}
document.getElementById('export')!.onclick=()=>{
 const report={product:'monja-fast-signature',version:VERSION,recordedAt:new Date().toISOString(),realEnvironment:'Exchange Online',results:rows.map(r=>({client:r.client,caseId:r.caseId,status:r.status.value,clientVersion:versions.get(r.client)!.value.trim(),note:r.note.value.trim()}))};
 const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='monja-pilot-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('status')!.textContent='試験結果を書き出しました。未実施の項目は合格になりません。';
};
