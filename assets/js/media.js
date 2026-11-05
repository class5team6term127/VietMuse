/* VietMuse V10: staff-only media library using the existing Supabase Storage bucket.
   Security: server-side Storage RLS controls LIST and INSERT; this UI is not permission enforcement.
   Only publishable/anon keys belong in config.js. Do not insert service-role keys. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const vi=window.VIETMUSE_LANG==='vi', tx=(v,e)=>vi?v:e;
const cfg=window.COMMUNITY_CONFIG||{};
const sb=cfg.supabaseUrl?.startsWith('https://')&&cfg.publishableKey&&window.supabase?.createClient?window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey):null;
const bucket='news-covers';
let user=null,activeUrl='',uploading=false;
const shell=(body)=>{$('#page-content').innerHTML=`<div class="shell vm-media-page"><span class="vm-nr-eyebrow">VIETMUSE / ${tx('THƯ VIỆN ẢNH','MEDIA LIBRARY')}</span><h1 class="vm-media-title">${tx('Kho ảnh tòa soạn','Editorial Media Library')}</h1><p class="vm-media-intro">${tx('Tải ảnh lên Supabase, sao chép đường dẫn và dán vào bài viết. Hình ảnh trong bucket công khai có thể truy cập nếu biết đường dẫn, kể cả trước khi đăng bài.','Upload photos to Supabase, copy their URL and paste them into an article. Files in this public bucket can be accessed by anyone who has their URL, even before publication.')}</p><div class="vm-media-tools"><a class="vm-nr-btn" href="./quan-ly-bao.html">← ${tx('Trở về Newsroom','Back to Newsroom')}</a><a class="vm-nr-btn" href="./duyet-bai.html">${tx('Duyệt bài','Moderation')}</a></div><div id="vm-media-status" class="vm-media-message" role="status" hidden></div>${body}</div>`};
function status(message,isError=false){const el=$('#vm-media-status');if(!el)return;el.textContent=message;el.classList.toggle('error',isError);el.hidden=false}
const validUrl=u=>{try{const x=new URL(u);return x.protocol==='https:'?x.href:null}catch{return null}};
const clean=s=>String(s||'').trim().replaceAll('|','–').replaceAll(']','').replace(/[\r\n]/g,' ').slice(0,180);
const snippet=(url,caption='',source='')=>`[[image|${url}|${clean(caption)}|${clean(source)}]]`;
function editorFields(url=''){
 const u=validUrl(url);
 return `<div class="vm-media-result">${u?`<img src="${esc(u)}" alt="${tx('Ảnh mới tải lên','Recently uploaded photo')}" loading="lazy">`:''}<div><label class="vm-media-field">${tx('Liên kết HTTPS của ảnh','Photo HTTPS URL')}<input id="vm-media-url" readonly value="${esc(u||'')}"></label><div class="vm-media-tools"><button class="vm-nr-btn primary" type="button" id="vm-copy-url">${tx('Sao chép link ảnh','Copy image URL')}</button></div><label class="vm-media-field">${tx('Chú thích ảnh (tùy chọn)','Caption (optional)')}<input id="vm-caption" maxlength="180" placeholder="${tx('Mô tả ngắn về ảnh','Short photo description')}"></label><label class="vm-media-field">${tx('Nguồn ảnh / credit (tùy chọn)','Photo source / credit (optional)')}<input id="vm-source" maxlength="180" placeholder="${tx('Ví dụ: Nhóm VietMuse','e.g. VietMuse Team')}"></label><label class="vm-media-field">${tx('Đoạn mã để dán vào thân bài','Snippet to paste into article body')}<textarea id="vm-snippet" rows="3" readonly></textarea></label><button class="vm-nr-btn primary" type="button" id="vm-copy-snippet">${tx('Sao chép mã chèn ảnh','Copy image snippet')}</button><p class="vm-nr-help">${tx('Dán đoạn mã vào dòng trống giữa hai đoạn văn. Ảnh và nguồn sẽ hiện khi xem bài.','Paste the snippet on a blank line between two paragraphs. The photo and source credit will appear in the published article.')}</p></div></div>`
}
function render(){shell(`<section class="vm-media-panel"><h2>${tx('Tải ảnh mới','Upload a photo')}</h2><form class="vm-media-upload" id="vm-media-upload"><label>${tx('Chọn ảnh JPG, PNG hoặc WebP (tối đa 2 MB)','Choose JPG, PNG or WebP (max 2 MB)')}<input id="vm-media-file" type="file" accept="image/jpeg,image/png,image/webp" required></label><button type="submit" class="vm-nr-btn primary" id="vm-media-upload-btn">↑ ${tx('Upload và lấy link','Upload & get link')}</button></form></section><section class="vm-media-panel" id="vm-upload-result" hidden><h2>${tx('Link ảnh và mã chèn','Photo URL & embed snippet')}</h2><div id="vm-media-result-body"></div></section><section class="vm-media-panel"><div class="vm-nr-pane-h"><h2>${tx('Ảnh bạn đã tải lên','Your uploaded photos')}</h2><button class="vm-nr-btn" id="vm-media-refresh" type="button">↻ ${tx('Làm mới','Refresh')}</button></div><p class="vm-nr-help">${tx('Tệp của tài khoản đang đăng nhập. Tòa soạn không truy cập file cá nhân của thành viên khác qua danh sách này.','Files uploaded under the current account. This list does not reveal other contributors’ personal folders.')}</p><div id="vm-media-list">${tx('Đang tải ảnh…','Loading photos…')}</div></section>`)}
async function copy(value){
 try{
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value)}
  else {const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();if(!document.execCommand('copy'))throw Error('Copy unavailable');t.remove()}
  status(tx('Đã sao chép!','Copied!'));
 }catch(e){status(tx('Không sao chép được tự động. Hãy chọn và sao chép từ ô hiển thị.','Automatic copy unavailable. Select and copy the text in the field instead.'),true)}
}
function updateSnippet(){const u=validUrl(activeUrl);const el=$('#vm-snippet');if(el&&u)el.value=snippet(u,$('#vm-caption')?.value,$('#vm-source')?.value)}
function showUrl(url){activeUrl=url;const wrap=$('#vm-upload-result');if(!wrap)return;wrap.hidden=false;$('#vm-media-result-body').innerHTML=editorFields(url);updateSnippet();wrap.scrollIntoView({block:'nearest',behavior:'smooth'})}
async function upload(file){
 if(!file||!file.size)throw Error(tx('Vui lòng chọn ảnh.','Select a file.'));
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024)throw Error(tx('Chỉ cho phép ảnh JPG/PNG/WebP tối đa 2 MB.','Only JPG/PNG/WebP up to 2 MB.'));
 const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
 const key=`${user.id}/${crypto.randomUUID()}.${ext}`;
 const {error}=await sb.storage.from(bucket).upload(key,file,{contentType:file.type,upsert:false});
 if(error)throw Error(error.message);
 const {data}=sb.storage.from(bucket).getPublicUrl(key);
 if(!validUrl(data?.publicUrl))throw Error('Invalid public URL');
 return data.publicUrl;
}
async function list(){const el=$('#vm-media-list');if(!el)return;el.textContent=tx('Đang tải ảnh…','Loading photos…');
 const {data,error}=await sb.storage.from(bucket).list(user.id,{limit:60,offset:0,sortBy:{column:'created_at',order:'desc'}});
 if(error){el.innerHTML=`<div class="vm-media-message error">${esc(error.message)}<p>${tx('Hãy kiểm tra bucket news-covers và chạy SQL V10.','Check the news-covers bucket and run V10 SQL.')}</p></div>`;return}
 const files=(data||[]).filter(x=>/\.(jpe?g|png|webp)$/i.test(x.name)&&x.id);
 el.innerHTML=files.length?`<div class="vm-media-grid">${files.map(x=>{const {data:o}=sb.storage.from(bucket).getPublicUrl(`${user.id}/${x.name}`),url=validUrl(o.publicUrl);return url?`<div class="vm-media-tile"><img src="${esc(url)}" alt="${tx('Ảnh đã tải lên','Uploaded photo')}" loading="lazy"><div><small title="${esc(x.name)}">${esc(x.name)}</small><button type="button" class="vm-nr-btn" data-vm-use="${esc(url)}">${tx('Lấy link / mã ảnh','Use photo')}</button></div></div>`:''}).join('')}</div>`:`<p class="vm-nr-help">${tx('Chưa có ảnh nào. Hãy tải ảnh đầu tiên ở phía trên.','No photos yet. Upload your first one above.')}</p>`;
}
async function init(){if(!$('#page-content'))return;
 if(!sb){shell(`<div class="vm-media-message error">${tx('Chưa kết nối Supabase; kiểm tra config.js.','Supabase is not configured. Check config.js.')}</div>`);return}
 shell(`<p>${tx('Đang kiểm tra quyền tòa soạn…','Checking editorial access…')}</p>`);
 try{const a=await sb.auth.getUser();if(a.error)throw Error(a.error.message);user=a.data?.user;if(!user){shell(`<div class="vm-media-message error">${tx('Đăng nhập tài khoản biên tập viên để tiếp tục.','Sign in with an editorial account to continue.')} <a href="./tai-khoan.html?mode=login">${tx('Đăng nhập','Log in')} →</a></div>`);return}
 const r=await sb.rpc('news_my_role');if(r.error)throw Error(r.error.message);if(!['admin','editor'].includes(r.data)){shell(`<div class="vm-media-message error">${tx('Chỉ tài khoản biên tập viên hoặc quản trị viên được dùng thư viện ảnh.','Media Library is available only to Editors and Administrators.')}</div>`);return}
 render();await list();
 }catch(e){shell(`<div class="vm-media-message error">${esc(e.message)}</div>`)}
}
document.addEventListener('DOMContentLoaded',init);
document.addEventListener('submit',async e=>{if(e.target.id!=='vm-media-upload')return;e.preventDefault();if(uploading)return;uploading=true;const button=$('#vm-media-upload-btn');button.disabled=true;button.textContent=tx('Đang tải ảnh…','Uploading…');try{const url=await upload($('#vm-media-file').files[0]);showUrl(url);status(tx('Đã upload ảnh thành công. Sao chép link hoặc mã chèn ảnh ở dưới.','Photo uploaded. Copy the URL or embed snippet below.'));$('#vm-media-file').value='';await list()}catch(err){status(tx('Lỗi tải ảnh: ','Upload failed: ')+err.message,true)}finally{uploading=false;button.disabled=false;button.textContent='↑ '+tx('Upload và lấy link','Upload & get link')}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='vm-copy-url')return copy(activeUrl);if(b.id==='vm-copy-snippet')return copy($('#vm-snippet')?.value||'');if(b.id==='vm-media-refresh')return list();if(b.dataset.vmUse){showUrl(b.dataset.vmUse);status(tx('Đã chọn ảnh. Sao chép link hoặc đoạn mã chèn ảnh.','Photo selected. Copy its URL or embed snippet.'))}});
document.addEventListener('input',e=>{if(['vm-caption','vm-source'].includes(e.target.id))updateSnippet()});
})();
