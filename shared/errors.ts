type Language='ja'|'en'|'zh';
const errors:Record<string,{ja:string;zh:string}>={
 'Focus the intended Outlook compose message first.':{ja:'操作したいOutlookメールの本文をクリックしてください。',zh:'请先点击要操作的 Outlook 邮件正文。'},
 'Focus Outlook compose first.':{ja:'操作したいOutlookメールの本文をクリックしてください。',zh:'请先点击要操作的 Outlook 邮件正文。'},
 'Could not establish connection. Receiving end does not exist.':{ja:'Outlookとの接続を確認できません。Outlookのページを再読み込みしてください。',zh:'无法连接 Outlook，请刷新 Outlook 页面。'},
 'Signature changed. Select the exact signature to replace.':{ja:'署名部分を特定できません。署名を直接編集した場合は、その部分だけを選択して切り替えてください。',zh:'无法确定签名范围。如果直接编辑了签名，请仅选择该范围后切换。'},
 'Multiple signature markers. Select the exact signature to replace.':{ja:'署名の候補が複数あります。置き換える署名だけを選択してください。',zh:'存在多个签名候选，请仅选择要替换的签名。'},
 'Select only the signature inside this message.':{ja:'このメール本文内で、署名部分だけを選択してください。',zh:'请仅选择此邮件正文中的签名范围。'},
 'A managed signature already exists. Select that signature or use the dropdown without selecting another part of the body.':{ja:'管理中の署名があります。別の本文を選択せずに切り替えるか、既存の署名部分だけを選択してください。',zh:'已有受管理签名。请直接切换，或仅选择现有签名，不要选择其他正文。'},
 'Compose unavailable.':{ja:'メール作成画面を確認できません。対象のメールを開き直してください。',zh:'无法访问撰写窗口，请重新打开目标邮件。'},
 'Insertion cursor is outside this message.':{ja:'カーソルが対象メールの本文内にありません。本文をクリックしてください。',zh:'光标不在目标邮件正文内，请点击正文。'},
 'Existing body: select the exact signature range first.':{ja:'置き換える署名部分だけを選択してください。',zh:'请仅选择要替换的签名范围。'},
 'Selection moved. Select the signature again.':{ja:'選択範囲が変わりました。署名部分を選択し直してください。',zh:'选区已变化，请重新选择签名范围。'},
 'Browser editing API unavailable. Use the Office add-in or copy the signature.':{ja:'このブラウザーでは挿入できません。Officeアドインか署名のコピーをご利用ください。',zh:'此浏览器无法插入，请使用 Office 加载项或复制签名。'},
 'Selection unavailable.':{ja:'カーソル位置を取得できません。本文をクリックしてお試しください。',zh:'无法获取光标位置，请点击正文后重试。'},
 'Outlook did not accept the edit. No change was made.':{ja:'Outlookが署名の変更を受け付けませんでした。本文をクリックして再度お試しください。',zh:'Outlook 未接受签名更改，请点击正文后重试。'},
 'Editing result cannot be tracked. Inspect the body; do not repeat insertion. Use the Office add-in if Outlook removes the signature marker.':{ja:'挿入後の署名を追跡できません。繰り返し挿入せず、本文を確認してください。必要ならOfficeアドインをご利用ください。',zh:'无法追踪插入后的签名，请勿重复插入。请检查正文，必要时使用 Office 加载项。'},
 'The target message changed. Focus the intended message again.':{ja:'対象のメールが変わりました。操作したいメールの本文をクリックしてください。',zh:'目标邮件已变化，请点击要操作的邮件正文。'},
 'Focus the intended Outlook message first.':{ja:'操作したいOutlookメールの本文をクリックしてください。',zh:'请先点击要操作的 Outlook 邮件正文。'},
 'Extension updated. Reload Outlook.':{ja:'拡張機能が更新されました。Outlookのページを再読み込みしてください。',zh:'扩展已更新，请刷新 Outlook 页面。'},
 'Signature not found':{ja:'選択した署名が見つかりません。設定画面を確認してください。',zh:'找不到所选签名，请检查设置。'},
 'Outlook Web: embedded data images are unverified. Use HTTPS image URLs or the Office add-in (CID attachment).':{ja:'この画像形式はWeb版で挿入できません。HTTPS画像URLかOfficeアドインのCID画像をご利用ください。',zh:'Web 版无法插入此图片格式，请使用 HTTPS 图片网址或 Office 加载项的 CID 图片。'}
};
export function displayError(error:unknown,language:Language){const message=(error instanceof Error?error.message:String(error)).replace(/^Error:\s*/,'');return language==='en'?message:errors[message]?.[language]||message;}
