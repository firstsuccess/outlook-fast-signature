import {it,expect} from 'vitest';
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
it.skipIf(process.platform!=='win32')('configures a built deployment with Windows PowerShell and preserves Japanese XML without Node',()=>{
 fs.mkdirSync('.cache',{recursive:true});const root=fs.mkdtempSync(path.resolve('.cache/deployment-test-'));fs.mkdirSync(root+'/scripts');fs.mkdirSync(root+'/outlook-addin');
 for(const file of ['Configure-Deployment.ps1','Test-Deployment.ps1'])fs.copyFileSync('scripts/'+file,root+'/scripts/'+file);
 fs.writeFileSync(root+'/outlook-addin/taskpane.html','<!doctype html><title>もんじゃ高速署名</title>');
 fs.writeFileSync(root+'/outlook-addin/manifest.xml','<?xml version="1.0" encoding="UTF-8"?><OfficeApp><DisplayName DefaultValue="もんじゃ高速署名"/><SourceLocation DefaultValue="https://old.example.invalid/taskpane.html"/><SupportUrl DefaultValue="https://old.example.invalid/privacy.html"/><AppDomain>https://old.example.invalid</AppDomain><Url DefaultValue="https://old.example.invalid/app.js"/></OfficeApp>');
 const output=root+'/configured';const result=spawnSync('powershell.exe',['-NoProfile','-File',root+'/scripts/Configure-Deployment.ps1','-BaseUrl','https://deployment.example.com/monja','-SupportUrl','https://support.example.com/help','-OutputDirectory',output],{encoding:'utf8',timeout:15_000});
 expect(result.status,result.stderr).toBe(0);const xml=fs.readFileSync(output+'/manifest.xml','utf8');expect(xml).toContain('もんじゃ高速署名');expect(xml).toContain('https://deployment.example.com/monja/taskpane.html');expect(xml).toContain('https://support.example.com/help');expect(xml).not.toContain('.invalid');expect(fs.existsSync(output+'/site/taskpane.html')).toBe(true);expect(fs.existsSync(output+'/site/manifest.xml')).toBe(false);expect(fs.existsSync(output+'/Test-Deployment.ps1')).toBe(true);
 const bad=spawnSync('powershell.exe',['-NoProfile','-File',root+'/scripts/Configure-Deployment.ps1','-BaseUrl','http://localhost:3000','-OutputDirectory',root+'/bad'],{encoding:'utf8',timeout:15_000});expect(bad.status).not.toBe(0);expect(fs.existsSync(root+'/bad')).toBe(false);
},35_000);
