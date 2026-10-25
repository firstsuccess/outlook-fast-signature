import fs from 'node:fs/promises';
const config=JSON.parse(await fs.readFile('release.config.json','utf8'));const info=JSON.parse(await fs.readFile('dist/build-info.json','utf8'));let failed=false;
const spec=JSON.parse(await fs.readFile('shared/pilot-cases.json','utf8'));let acceptance=false;
try{const report=JSON.parse(await fs.readFile(process.env.MONJA_ACCEPTANCE_REPORT||config.acceptanceReport||'docs/monja-pilot-results.json','utf8'));acceptance=report.version===info.version&&report.realEnvironment==='Exchange Online'&&Number.isFinite(Date.parse(report.recordedAt))&&spec.clients.every(client=>spec.cases.every(c=>report.results?.some(r=>r.client===client&&r.caseId===c.id&&r.status==='pass'&&typeof r.clientVersion==='string'&&r.clientVersion.trim())));}catch{}
for(const [ok,label]of [[!info.baseUrl.includes('.invalid'),'Publisher HTTPS configured'],[config.releaseReady,'Publisher release approval'],[acceptance,'Real Outlook acceptance report (all required cases passed)']]){console.log(`${ok?'PASS':'BLOCK'} ${label}`);if(!ok)failed=true;}
if(failed)process.exitCode=1;
