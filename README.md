# もんじゃ高速署名 / Monja Fast Signature / Monja 快速签名

[日本語](#日本語) | [English](#english) | [简体中文](#简体中文)

## 日本語

新規・返信・転送の既定署名、社内用、社外用。メールに合わせて、いつもの署名をすばやく選択。もんじゃ高速署名は、Outlookの署名を端末内で管理できるアドインです。Web版Outlook（ブラウザの拡張機能）はメールが新規・返信・転送なのかを自動検知し、検知できた場合はそれぞれの既定署名を追加する機能を備えています。

- [紹介サイト・ダウンロード・利用ガイド](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/?lang=ja)
- [GitHub](https://github.com/firstsuccess/outlook-fast-signature)
- [First Success G.K. / ファーストサクセス合同会社](https://first-success.com)

### 主な機能

- **選ぶだけで切り替え** — 用途別の署名を保存し、作成画面ごとに選択。Webの操作UIは本文外に配置します。
- **HTMLを安全に管理** — リッチテキストとHTMLソースを編集。保存時にスクリプト、危険なURLや属性を除去します。
- **サービス登録なし** — 製品ログイン、Graph、データベース、テナント固有のアプリ登録を要求しません。

### 導入方法

#### ブラウザーで使う（推奨・本文にフロート有り）

Microsoft Edge・Google Chrome・Brave用。署名の右側のドロップダウンで、新規既定・返信既定・転送既定と登録済み署名を選べます。拡張アイコンは「設定」を開きます。

ZIPを展開して読み込み · ストア未公開

1. **ZIPを展開する** — ダウンロードしたZIPを、移動しないフォルダーへ展開します。更新前には旧版でJSONを書き出してください。
2. **拡張を読み込む** — `edge://extensions` / `chrome://extensions` / `brave://extensions` を開き、許可されていれば開発者モード →「展開して読み込み」でmanifest.jsonのあるフォルダーを選びます。
3. **署名を登録する** — 拡張アイコン →「設定」で署名一覧を開き、「新規登録」から署名を作成して保存します。必要に応じて既存の署名やJSONを取り込めます。
4. **Outlookで切り替える** — Outlookのページを再読み込みし、作成中の本文をクリック。署名を選択すると即時に反映します。UIが見えない場合は拡張アイコン →「設定」から管理画面を開き、「メール本文に適用」または署名のコピーを使います。

#### Outlookアドインで使う（非推奨・本文にフロート無し/サイドバーのみで管理）

Exchange OnlineのNew / Classic Outlookに対応するOffice.js版。作業ウィンドウから選択し、公式の署名APIで適用します。

[manifest.xml](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/manifest.xml)

Mailbox 1.10の署名APIが必要 · 手動起動

1. **manifest.xmlを保存する** — 上のボタンから、配信済みサイトを参照するXMLをダウンロードします。利用者のサーバーやNode.jsは不要です。
2. **Outlookに追加する** — アドイン管理画面から、許可されていればカスタムアドインをファイルで追加します。項目の名称・個人追加の可否は環境と組織ポリシーで異なります。
[Web版Outlook：アドイン管理画面を開く](https://outlook.office.com/owa/?path=/options/manageapps)
3. **作業ウィンドウを開く** — 新規メールのコマンドから「もんじゃ高速署名」を手動で開き、署名を登録・保存します。標準署名の設定自体は変更しません。
4. **署名を選ぶ** — 上部の署名ドロップダウンで選ぶと、公式setSignatureAsyncで現在の署名を置き換えます。対応APIがない環境は停止メッセージを表示します。

### 対応範囲

| 項目 | Web拡張 | Officeアドイン |
| --- | --- | --- |
| 署名ライブラリ・JSON移行 | 対応 | 対応 |
| 署名の選択・置換 | 独立ドロップダウン / 設定画面 | 作業ウィンドウ / 公式API |
| 必要な環境 | Edge / Chrome / Brave | Exchange Online・対応Outlook / WebView2 |
| 署名APIの条件 | Outlook DOMの認識が必要 | Mailbox 1.10以上 |
| 既定署名の自動選択・挿入 | カーソル位置へ自動挿入・本文選択不要 | イベント自動起動は未提供 |
| 実際のOutlookでの検証 | 利用環境で受入試験が必要 | New / Classic / Webで受入試験が必要 |

### 使い方・移行

#### 署名を作成・編集・整理する

新規登録 → 署名名と本文 → 保存。太字・斜体・フォント・サイズ・色・リンク・画像URL・表に対応します。HTMLソースも編集できます。複製、削除、上下移動で整理でき、削除した署名の既定値は解除されます。プレビューでは外部画像を読み込みません。

#### 既存のOutlook署名を取り込む

Outlookで標準署名を本文へ挿入し、署名部分だけを選択して「Outlookの既存署名を登録」を実行します。本文全体から推測して抽出しません。選択APIが利用できない場合はHTMLの貼り付けやファイル取り込みを使います。

#### Classic署名と関連画像を読み込む

`%APPDATA%\Microsoft\Signatures` のHTMLと関連画像を明示的に選択します。フォルダーまたは複数ファイルで取り込めます。署名HTMLは一度に1つ。TXTにも対応し、RTFはOutlookやWordでHTMLへ保存してから取り込んでください。画像が不足・重複する場合は停止します。ZIPの直接取り込みはありません。

#### 既存本文や署名を壊さずに切り替える

Web拡張の初回挿入は本文内のカーソル位置（未取得なら先頭）へ追加します。既存署名を置き換えたい場合だけ、その署名を正確に選択してください。標準署名や引用履歴を自動で削除しません。署名の前後に本文を入力しても、元の署名部分だけを切り替えます。OutlookがHTMLの外枠を作り直した場合や、Enterで同じ署名マーカーが分かれた場合も、元の内容を一意に確認できれば本文を残して交換します。署名自体の文字・画像を変更した場合、同じ候補が複数ある場合、識別属性が失われた場合は停止します。その場合だけ、署名部分を範囲選択して切り替えてください。追跡エラーは表示言語に合わせて案内します。署名範囲を選び直して再適用できます。Office版は公式署名APIにより既存の標準署名が置換される場合があります。

#### 作成種別の自動判定と既定署名

Web拡張は新規・返信・転送の作成操作、件名、空の新規作成画面を使って種類を判定し、設定した既定署名をカーソル位置へ1回だけ自動挿入します。本文が既にあっても範囲選択は不要です。本文内のカーソル位置が取得できない場合は本文先頭へ挿入し、宛先欄・件名欄にフォーカスがあれば元へ戻します。返信時にカーソルが先頭にあれば、引用文の前に入ります。既存本文や標準署名は削除しないため、Outlook標準署名を自動挿入している場合は両方が残ることがあります。管理マーカーがある再表示下書きへは再挿入しません。入力・手動選択・取り消し後も再挿入しません。種類を判定できない場合はフロートから手動で選択してください。フロートの「設定」から署名一覧を開けます。自動挿入は作成画面の検出から最低2秒待ち、本文・件名の変化が750ミリ秒以上止まり、読み込み中表示がなくなってから実行します。250ミリ秒間隔で最大20秒再判定します。一時失敗は本文が全く変化していない場合に限り最大2回再試行します。待機中に入力・手動選択すると自動挿入を中止します。これは完全読み込み完了の保証ではありません。動かない場合はフロート→「設定」→「診断情報を書き出す」で、本文・署名・アドレスを含まない処理状態を保存できます。 Office版のイベント自動起動は未提供です。

#### 署名前の空行を設定する

設定画面の「署名の前に追加する空行（Web拡張）」で1〜9行を選べます。初期値は3行で、選択時に自動保存します。署名を初めて挿入するときに空行を署名の管理範囲の外へ追加し、本文内で編集中ならカーソルを空行側へ戻します。署名切替時には空行を増やしません。変更後の設定は次の初回挿入に適用します。JSONバックアップ・インポートにも保存します。この設定はWeb拡張用です。

#### 全メールアドレス共通の既定署名

署名と既定署名は、この拡張機能を利用する全メールアドレスで共通です。アカウントの入力・選択は不要です。新規・返信・転送の署名は選ぶだけで自動保存されます。同じブラウザープロファイル内で共有し、別PC・別プロファイルとは自動同期しません。旧版の共通既定値を優先し、共通値がなくアカウント別設定が一致する場合のみ移行します。設定が競合する項目は改めて選択してください。 本文への適用はドロップダウンの「新規既定」「返信既定」「転送既定」または登録済み署名の選択で行います。

#### JSONでバックアップ・別クライアントへ移行する

署名バックアップ（JSON）で署名・既定値・言語を保存し、WebとOffice間を手動移行できます。署名インポート（JSON)は現在の全設定を置き換えるため、先にバックアップしてください。HTML書き出しも可能です。端末・ブラウザープロファイル・Office WebView間の自動同期はなく、拡張削除やサイトデータ消去でデータが失われる場合があります。

#### 画像・企業ロゴを使うとき

HTTPS画像は受信側でブロックされることがあります。取り込んだdata画像はライブラリに保存できますが、Web拡張は送信適用を停止し、HTTPS画像またはOffice版を案内します。Office版は公式APIでインラインCID添付へ変換します。受信時の表示は実機確認してください。画像を変更すると古いインライン添付が残る場合があります。

### プライバシー

署名・設定は、拡張ではchrome.storage.local、Office版ではブラウザーのローカル保存領域で管理します。メール本文や署名を開発元へ送信せず、テレメトリーも収集しません。認証Cookie・アクセストークンを取得しません。

Office.jsはMicrosoftの公式CDNから取得します。HTTPS画像はOutlookや受信者側が画像提供元へ接続する場合があります。静的ホストには通常のアクセスログが残る場合がありますが、署名をURLへ埋め込みません。

診断情報は版数・API対応などだけを書き出し、本文・署名・送信者を含みません。JSONやHTMLのバックアップは個人情報を含むため安全に保管してください。ローカルデータと書き出しファイルは暗号化していません。

削除は拡張のアンインストール、またはOffice WebView／サイトデータの消去で行えます。事前に必要なデータを書き出してください。言語選択だけはこの案内ページ内のローカル保存を利用します。

### サポート

- 拡張の更新・再読み込み・無効化の後は、開いたままのOutlookタブを再読み込みしてください。旧版で「Extension context invalidated」が残っている場合は、Outlookを再読み込みした後、拡張管理画面のエラー履歴を消去します。修正版は古いスクリプトを安全停止します。署名データの再登録・拡張削除は不要です。
- Webの選択UIがないときは拡張アイコン →「設定」から本文への適用または署名のコピーを使う。
- OfficeはAPI対応とOffice.js CDN、組織ポリシーを確認する。
- 管理画面から診断JSONを保存し、版数・再現手順・実結果とともに報告する。本文・署名・認証情報を含めない。

Microsoft 365管理センターの統合アプリでXMLを試験ユーザーに配布できます。Graph/SSOは使用しないためEntraアプリ登録は不要です。組織ポリシーを回避しません。更新前にJSONを書き出し、拡張は同じフォルダーで更新、Officeは配布XMLと静的ファイルを更新します。切り戻しは拡張の無効化／アドインの配布解除で行い、挿入済みの本文は自動削除しません。別ホストへ配置する場合は配信キットのConfigure-Deployment.ps1でHTTPS URLを変更できます。ソースの再ビルドに限り開発者のNode.jsが必要です。

[サポート](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/?lang=ja#support)

### サンプル画像

![サンプル画像 1](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/samples/signature1.png)

![サンプル画像 2](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/samples/signature2.png)

### ソースコード・ライセンス

GitHubの「Code → Download ZIP」からソースコードを取得できます。GNU General Public License 3.0で配布します。ライセンス本文は[GitHubのLICENSE](https://github.com/firstsuccess/outlook-fast-signature/blob/main/LICENSE)をご確認ください。

---

## English

Manage Outlook signatures on your device and switch them to suit each message. Save defaults for new messages, replies and forwards, as well as internal, external and customer support signatures. The Web extension detects the compose type and inserts the corresponding default when detection succeeds.

- [Website, downloads and user guide](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/?lang=en)
- [GitHub](https://github.com/firstsuccess/outlook-fast-signature)
- [First Success G.K. / ファーストサクセス合同会社](https://first-success.com)

### Features

- **Choose, then switch** — Save signatures for different contexts and select for each compose window. Web controls stay outside the message body.
- **Manage HTML safely** — Edit rich text or HTML source. Scripts, unsafe URLs, and dangerous attributes are removed when saving.
- **No extra service account** — No product login, Graph, database, or tenant-specific app registration is required.

### Installation

#### In your browser (Recommended · Floating controls in the message body)

For Microsoft Edge, Google Chrome, and Brave. Choose New default, Reply default, Forward default, or a saved signature beside the signature. The extension icon opens Settings.

Unzip and load unpacked · Not listed in stores

1. **Unzip the package** — Extract the extension to a folder you will keep. Export JSON from any older version before upgrading.
2. **Load the extension** — Open `edge://extensions`, `chrome://extensions`, or `brave://extensions`. If allowed, enable Developer mode and Load unpacked, then select the folder containing manifest.json.
3. **Create your library** — Click the extension icon, then Settings to open the signature library. Create a signature, edit it, and Save. Import existing signatures or a JSON backup if needed.
4. **Switch in Outlook** — Reload Outlook and focus the intended message body. Choose a signature to apply it immediately. If the selector is unavailable, open Settings from the extension icon and use Apply to message or copy for manual paste.

#### In your Outlook add-in (Not recommended · No floating controls in the message body / Manage in the sidebar only)

The Office.js edition for New and Classic Outlook connected to Exchange Online. Select a signature in the task pane and apply it with the official signature API.

[manifest.xml](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/manifest.xml)

Requires Mailbox 1.10 signature API · Open manually

1. **Save manifest.xml** — Download the XML above. It points to the hosted application; you do not need your own server or Node.js.
2. **Add it to Outlook** — Where permitted, use Outlook add-in management to add a custom add-in from a file. The menu and availability depend on your account, client, and organization policy.
3. **Open the task pane** — In a compose message, manually open Monja Fast Signature from the commands. Create and save your signatures. Outlook signature settings are not changed.
4. **Choose a signature** — Use the signature dropdown to replace the current signature through official setSignatureAsync. Unsupported API environments show a stop message.

### Compatibility

| Capability | Browser extension | Office add-in |
| --- | --- | --- |
| Library & JSON migration | Supported | Supported |
| Select & replace | Independent dropdown / Settings | Task pane / official API |
| Environment | Edge / Chrome / Brave | Exchange Online · supported Outlook / WebView2 |
| Signature API requirement | Recognizable Outlook DOM | Mailbox 1.10 or later |
| Automatic defaults | Insert at body caret without selecting the body | Event activation not provided |
| Real Outlook verification | Acceptance testing required | Test New / Classic / Web |

### Usage and migration

#### Create, edit, and organize signatures

Choose New, enter a name and signature, then Save. Edit fonts, size, color, bold, italic, links, image URLs, and tables, or use HTML source mode. Duplicate, delete, and reorder entries. Deleting a signature clears its defaults. The preview does not load remote images.

#### Import an existing Outlook signature

Insert your standard signature into an Outlook message, select only that signature, and choose Import Outlook selection. The app never guesses a signature from the entire message body. If selection APIs are unavailable, paste HTML or import a file.

#### Import Classic signatures and images

Explicitly select HTML and related images from `%APPDATA%\Microsoft\Signatures`, using folder or multiple-file selection. Import one signature HTML at a time. TXT is supported; save RTF as HTML in Outlook or Word first. Missing or ambiguous images stop import. Direct ZIP import is not provided.

#### Switch without removing other message content

Initial Web insertion uses the body caret, or the body start if unavailable. Select the old signature only when you want to replace it. The extension does not guess or automatically delete standard signatures or quoted history. Body text typed before or after a signature is preserved when switching. Harmless Outlook wrapper rewrites and Enter-split markers can be recovered when the original signature content is uniquely identifiable. Editing the signature text or images, ambiguous duplicate content, or missing markers still stops replacement. In those cases, select only the signature range before switching. Tracking errors follow the selected UI language. The Office edition uses the official signature API, which can replace a standard signature.

#### Compose detection and automatic defaults

The Web extension detects compose actions, subject prefixes and blank new-message layouts, then inserts the configured default once at the body caret. Existing content does not require a range selection. If no body caret is available, insertion uses the start of the body and restores focus to the recipient or subject field. Replies with a caret at the top receive the signature before quoted content. Existing content and standard signatures are preserved, so an Outlook standard signature may remain alongside the added signature. Drafts with a managed marker, manual choices, typing and undo prevent reinsertion. Use the dropdown when the compose type is unknown. Open Settings from the floating selector. Automatic insertion waits at least two seconds, with no body or subject changes for 750 ms and no loading indicator. It checks every 250 ms for up to 20 seconds. Transient failures retry at most twice, only if the body has not changed at all. Typing or choosing manually cancels automatic insertion. This does not guarantee that every Outlook load has completed. Use Settings and Export diagnostics to save processing states without message content, signatures or email addresses. Office event-based automatic activation is not provided.

#### Blank lines before signatures

In Settings, choose Blank lines before signature (Web extension), from 1 to 9. The default is 3 and changes save automatically. Initial insertion adds blank lines outside the managed signature and places the body caret in the blank area. Switching signatures does not add more lines. Changes apply to the next initial insertion and are included in JSON backups and imports. This setting is for the Web extension.

#### Shared new/reply/forward defaults

Signatures and defaults are shared by all email addresses in this installation. No account entry or selection is needed. New/reply/forward choices save automatically. Settings are shared within the same browser profile; they do not sync across PCs or profiles. Existing shared defaults take priority. Legacy account defaults migrate only when their values agree; choose a common default again for conflicting settings. Choose New default, Reply default, Forward default, or a saved signature from the single dropdown.

#### Back up or migrate with JSON

Export JSON to preserve signatures, defaults, and language, and transfer between Web and Office. Import replaces all current settings; back up first. HTML export is also available. There is no automatic synchronization across profiles or Office WebViews. Uninstalling or clearing site data can erase the library.

#### Use images and company logos

Recipients may block HTTPS images. Imported data images can stay in the library, but Web insertion stops and recommends HTTPS images or the Office edition. Office converts data images into inline CID attachments through official APIs. Verify recipient rendering. Older inline attachments may remain when image content changes.

### Privacy

The extension stores signatures and settings in chrome.storage.local; Office uses browser-local storage. Message bodies and signatures are not uploaded to the developer. No telemetry, authentication cookies, or access tokens are collected.

Office.js loads from Microsoft’s official CDN. HTTPS images may contact their hosts through Outlook or recipient clients. Static hosting may retain ordinary access logs; signature data is never placed in URLs.

Diagnostics export only version and capability information, not message text, signatures, or sender details. JSON and HTML backups can contain personal information: keep them safe. Local storage and exports are not encrypted.

Delete local data by uninstalling the extension or clearing the relevant Office WebView/site storage. Export needed data first. This guide only stores your language preference locally.

### Support

- After updating, reloading or disabling the extension, reload every open Outlook tab. If an old Extension context invalidated entry remains, clear the extension error history after reloading Outlook. Signature data does not need to be recreated.
- If the Web selector is unavailable, open Settings and apply to the message or copy for manual paste.
- For Office, check API support, Microsoft CDN access, and organization policies.
- Export diagnostics from the manager and report the version, steps, and actual result. Do not include message content, signatures, or credentials.

Administrators can upload XML through Microsoft 365 Integrated Apps and target pilot users first. No Graph or SSO means no Entra app registration for this product. Respect organization restrictions. Export JSON before updates. Update the extension in the same folder, or update the Office XML and hosted assets. Roll back by disabling the extension or removing add-in deployment. Existing message signatures are not automatically deleted. For another host, use Configure-Deployment.ps1 in the kit. Only developers rebuilding source need Node.js.

[Support](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/?lang=en#support)

### Screenshots

![Screenshots 1](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/samples/signature1.png)

![Screenshots 2](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/samples/signature2.png)

### Source code and license

Download the source from GitHub using **Code → Download ZIP**. The source is distributed under the GNU General Public License 3.0. See [LICENSE on GitHub](https://github.com/firstsuccess/outlook-fast-signature/blob/main/LICENSE) for the license text.

---

## 简体中文

在本机管理 Outlook 签名，根据邮件用途快速切换。可设置新邮件、回复和转发的默认签名，并保存公司内部、公司外部及客户支持等用途的签名。Web 扩展自动检测邮件类型，检测成功时插入对应默认签名。

- [介绍网站、下载与使用指南](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/?lang=zh)
- [GitHub](https://github.com/firstsuccess/outlook-fast-signature)
- [First Success G.K. / ファーストサクセス合同会社](https://first-success.com)

### 主要功能

- **选择即可切换** — 保存不同用途的签名，为每个撰写窗口选择。Web 操作控件位于邮件正文之外。
- **安全管理 HTML** — 使用富文本或 HTML 源代码编辑。保存时移除脚本、危险网址和属性。
- **无需额外服务账户** — 无需产品登录、Graph、数据库或租户专用应用注册。

### 安装方式

#### 在浏览器中使用（推荐・正文中有悬浮控件）

适用于 Microsoft Edge、Google Chrome 和 Brave。通过签名右侧的下拉框选择新邮件默认、回复默认、转发默认或已保存签名。扩展图标只提供「设置」。

解压后加载 · 尚未上架商店

1. **解压安装包** — 将扩展解压到固定文件夹。升级前请先从旧版导出 JSON。
2. **加载扩展** — 打开 `edge://extensions`、`chrome://extensions` 或 `brave://extensions`。在组织允许时启用开发者模式，选择「加载已解压的扩展程序」，并指定包含 manifest.json 的文件夹。
3. **创建签名库** — 点击扩展图标 →「设置」打开签名列表，新建签名、编辑后保存。也可导入已有签名或 JSON 备份。
4. **在 Outlook 中切换** — 刷新 Outlook，点击目标邮件正文，再选择签名即可应用。如果看不到选择器，请点击扩展图标 →「设置」，从管理画面应用或复制签名。

#### 使用 Outlook 加载项（不推荐・正文中无悬浮控件／仅通过侧边栏管理）

面向连接 Exchange Online 的 New / Classic Outlook 的 Office.js 版。从任务窗格选择签名，通过官方签名 API 应用。

[manifest.xml](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/manifest.xml)

需要 Mailbox 1.10 签名 API · 手动启动

1. **保存 manifest.xml** — 点击上方按钮下载指向已托管应用的 XML。您无需自己的服务器或 Node.js。
2. **添加到 Outlook** — 在允许的情况下，从 Outlook 加载项管理中选择从文件添加自定义加载项。菜单名称及个人添加权限因账户、客户端和组织策略而异。
3. **打开任务窗格** — 在撰写邮件时，从命令栏手动打开 Monja 快速签名，创建并保存签名。不会更改 Outlook 标准签名设置。
4. **选择签名** — 使用签名下拉框，通过官方 setSignatureAsync 替换当前签名。不支持所需 API 时会停止并提示。

### 兼容性

| 项目 | 浏览器扩展 | Office 加载项 |
| --- | --- | --- |
| 签名库与 JSON 迁移 | 支持 | 支持 |
| 签名选择与替换 | 独立下拉框／设置 | 任务窗格／官方 API |
| 所需环境 | Edge / Chrome / Brave | Exchange Online · 支持的 Outlook / WebView2 |
| 签名 API 条件 | 需要识别 Outlook DOM | Mailbox 1.10 或更高 |
| 自动选择和插入默认签名 | 自动插入到正文光标处，无需选择正文 | 不提供事件自动激活 |
| 真实 Outlook 验证 | 请在使用环境完成验收 | 请验证 New / Classic / Web |

### 使用与迁移

#### 创建、编辑和整理签名

选择新建，填写签名名称和内容后保存。支持字体、字号、颜色、粗体、斜体、链接、图片网址及表格，也可编辑 HTML 源代码。支持复制、删除及排序。删除签名后会清除对应默认值。预览不会加载远程图片。

#### 导入 Outlook 标准签名

先将标准签名插入邮件正文，仅选择签名范围，再选择导入 Outlook 选区。应用不会从整封邮件中猜测提取签名。选区 API 不可用时，可粘贴 HTML 或导入文件。

#### 读取 Classic 签名和相关图片

显式选择 `%APPDATA%\Microsoft\Signatures` 下的 HTML 和相关图片，可选择文件夹或多个文件。每次导入一个签名 HTML。支持 TXT；RTF 请先通过 Outlook 或 Word 保存为 HTML。图片缺失或存在歧义时会停止。不直接导入 ZIP。

#### 保护正文内容后切换

Web 扩展首次插入到正文光标处，无法取得时插入开头。只有需要替换旧签名时才选择其范围。不会自动猜测删除标准签名或引用历史。在签名前后输入的正文会在切换时保留。Outlook 重建外层 HTML 或 Enter 拆分同一签名标记时，只要能唯一识别原签名内容，就仅替换签名。直接修改签名文字或图片、存在多个相同候选或标记丢失时仍会停止。此时请仅选择签名范围后切换。追踪错误按当前界面语言显示。Office 版使用官方签名 API，可能替换现有标准签名。

#### 自动检测邮件类型与默认签名

Web 扩展根据创建操作、主题前缀及空白新邮件界面判断类型，将默认签名一次性插入正文光标处。已有正文也无需范围选择。无法取得正文光标时插入正文开头，并恢复收件人或主题栏的焦点。回复时光标在开头，签名就放在引用前。保留已有正文和标准签名，因此 Outlook 标准签名可能与新签名同时存在。草稿已有管理标记，或用户输入、手动选择、撤销后不会再次插入。类型不明时请通过下拉框选择。通过浮动选择器的设置打开签名列表。自动插入至少等待2秒，并确认正文和主题750毫秒内没有变化且加载提示已消失。每250毫秒重新检查，最多20秒。暂时失败时仅在正文完全未变化的情况下最多重试2次；输入或手动选择后停止自动插入。这不能保证 Outlook 已完成全部加载。可在设置中导出诊断，仅含处理状态，不含正文、签名或邮箱。 Office 版不提供事件自动激活。

#### 设置签名前的空行

设置中的签名前的空行（Web 扩展）可选择1至9行，初始为3行，选择后自动保存。首次插入时将空行放在签名管理范围之外，并把正文光标放到空行区域。切换签名不会增加空行。修改后应用于下一次首次插入，并包含在 JSON 备份和导入中。此设置仅适用于 Web 扩展。

#### 所有邮箱共用默认签名

此安装中的所有邮箱共用签名和默认设置，无需输入或选择账户。新邮件、回复、转发的选择会自动保存。同一浏览器配置文件内共享，不会跨电脑或配置文件自动同步。旧版通用默认值优先；仅在账户默认值一致时迁移，冲突项目请重新选择。 从同一下拉框选择新邮件默认、回复默认、转发默认或已保存签名即可应用。

#### 通过 JSON 备份和迁移

导出 JSON 可保存签名、默认值和语言，并在 Web 与 Office 版之间手动迁移。导入会替换当前全部设置，请先备份。也可导出 HTML。配置文件或 Office WebView 之间不会自动同步，卸载扩展或清除网站数据可能丢失签名库。

#### 使用图片与公司标志

HTTPS 图片可能被收件人客户端阻止。导入的 data 图片可保存在库中，但 Web 扩展会停止应用并推荐 HTTPS 图片或 Office 版。Office 版通过官方 API 转为内联 CID 附件。请验证收件方显示效果。更换图片后旧内联附件可能仍然存在。

### 隐私

扩展将签名和设置保存在 chrome.storage.local，Office 版使用浏览器本地存储。不向开发商上传邮件正文或签名，不收集遥测、认证 Cookie 或访问令牌。

Office.js 来自 Microsoft 官方 CDN。Outlook 或收件人客户端可能访问 HTTPS 图片服务器。静态托管可能保留普通访问日志，但不会将签名内容写入网址。

诊断导出只包含版本和 API 能力等信息，不含正文、签名或发件人。JSON 和 HTML 备份可能包含个人信息，请妥善保管。本地数据和导出文件未加密。

可通过卸载扩展或清除相应 Office WebView／网站数据删除本地信息。请先导出需要保留的数据。本说明页仅在本地保存语言偏好。

### 支持

- 更新、重新加载或停用扩展后，请刷新所有已打开的 Outlook 标签页。刷新后可清除旧的 Extension context invalidated 错误记录，无需重新登记签名。
- 看不到 Web 选择器时，通过「设置」应用或复制签名后手动粘贴。
- Office 版请检查 API 支持、Microsoft CDN 访问和组织策略。
- 从管理画面导出诊断 JSON，报告版本、复现步骤和实际结果。请勿提供正文、签名或认证信息。

管理员可在 Microsoft 365 集成应用中上传 XML，先部署给试用用户。产品不使用 Graph 或 SSO，无需 Entra 应用注册。请遵守组织限制。更新前导出 JSON。扩展在原文件夹中更新，Office 版更新 XML 与托管文件。回退时禁用扩展或解除加载项部署，已插入正文的签名不会自动删除。改用其他托管时，可通过工具包的 Configure-Deployment.ps1 更换 HTTPS URL。只有从源代码重新构建的开发者需要 Node.js。

[支持](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/?lang=zh#support)

### 示例图片

![示例图片 1](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/samples/signature1.png)

![示例图片 2](https://outlook-add-in.mnoda1979.chatgpt.site/fast-signature/samples/signature2.png)

### 源代码与许可证

可在 GitHub 通过“Code → Download ZIP”下载源代码。源代码以 GNU General Public License 3.0 分发。许可证全文请参阅 [GitHub 上的 LICENSE](https://github.com/firstsuccess/outlook-fast-signature/blob/main/LICENSE)。
