/* VietMuse V17 — Media Library for editorial images and short videos.
   File INSERT/LIST permissions are enforced by Supabase Storage RLS.
   Only publishable/anon keys belong in config.js. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const vi=window.VIETMUSE_LANG==='vi',tx=(v,e)=>vi?v:e;
const cfg=window.COMMUNITY_CONFIG||{};
const sb=cfg.supabaseUrl?.startsWith('https://')&&cfg.publishableKey&&window.supabase?.createClient?window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey):null;
let user=null,activeUrl='',activeKind='image',uploading=false;
const bucket=kind=>kind==='video'?'news-videos':'news-covers';
const url=u=>{try{const x=new URL(u);return x.protocol==='https:'&&!x.username&&!x.password?x.href:null}catch{return null}};
const clean=s=>String(s||'').trim().replace(/[|\]\r\n]/g,' ').replace(/\s+/g,' ').slice(0,180);
const markup=(value,kind,caption='',source='')=>window.VMStoryMedia.marker(kind,value,clean(caption),clean(source));
function shell(content){$('#page-content').innerHTML=`<div class="shell vm-media-page"><span class="vm-nr-eyebrow">VIETMUSE / ${tx('THƯ VIỆN MEDIA','MEDIA LIBRARY')}</span><h1 class="vm-media-title">${tx('Thư viện ảnh & video','Editorial Image & Video Library')}</h1><p class="vm-media-intro">${tx('Upload ảnh hoặc video ngắn lên Supabase và sao chép link/mã chèn để dùng trong bài. Video dài nên dùng YouTube hoặc Vimeo để tiết kiệm dung lượng.','Upload photos or short videos and copy the URL/embed marker for an article. Use YouTube/Vimeo for longer videos to save storage.')}</p><div class="vm-media-tools"><a href="./quan-ly-bao.html" class="vm-nr-btn">← Newsroom</a><a href="./soan-bai-song-ngu.html" class="vm-nr-btn">${tx('Soạn bài song ngữ','Bilingual Editor')} ↗</a></div><div id="vm-media-status" class="vm-media-message" role="status" hidden></div>${content}</div>`;}
function status(message,error=false){const el=$('#vm-media-status');if(!el)return;el.textContent=message;el.classList.toggle('error',error);el.hidden=false;}
function render(){shell(`<section class="vm-media-panel"><h2>${tx('Upload ảnh hoặc video','Upload an image or a video')}</h2><form id="vm-media-upload" class="vm-media-upload"><label>${tx('Loại file','File type')}<select id="vm-media-type"><option value="image">${tx('Ảnh (JPG/PNG/WebP, tối đa 2 MB)','Image (JPG/PNG/WebP, max 2 MB)')}</option><option value="video">${tx('Video (MP4/WebM, tối đa 25 MB)','Video (MP4/WebM, max 25 MB)')}</option></select></label><label>${tx('Chọn file','Select file')}<input id="vm-media-file" type="file" accept="image/jpeg,image/png,image/webp" required></label><button type="submit" class="vm-nr-btn primary" id="vm-media-upload-btn">↑ ${tx('Upload và lấy link','Upload & get link')}</button></form><p class="vm-nr-help">${tx('File trong bucket công khai có thể được xem bởi người có link, ngay cả trước khi bài báo xuất bản. Video cần SQL 08 trong Supabase.','Files in public buckets can be accessed via URL before the article is published. Video uploads require SQL 08 in Supabase.')}</p></section>
<section class="vm-media-panel" id="vm-upload-result" hidden><h2>${tx('Link media và mã chèn','Media URL & embed marker')}</h2><div id="vm-media-result-body"></div></section>
<section class="vm-media-panel"><div class="vm-nr-pane-h"><h2>${tx('Media đã upload','Your uploaded media')}</h2><button type="button" class="vm-nr-btn" id="vm-media-refresh">↻ ${tx('Làm mới','Refresh')}</button></div><div id="vm-media-list">${tx('Đang tải danh sách…','Loading uploads…')}</div></section>`);}
function fields(value,kind){
 const u=url(value)||'',isVid=kind==='video';
 const preview=isVid?`<video controls preload="metadata" style="max-width:100%;max-height:270px" src="${esc(u)}"></video>`:`<img loading="lazy" src="${esc(u)}" alt="${tx('Ảnh đã tải lên','Uploaded photo')}">`;
 return `<div class="vm-media-result">${preview}<div><label class="vm-media-field">${tx('Đường dẫn HTTPS','HTTPS media URL')}<input id="vm-media-url" readonly value="${esc(u)}"></label><button class="vm-nr-btn primary" type="button" id="vm-copy-url">${tx('Sao chép link','Copy URL')}</button><label class="vm-media-field">${tx('Chú thích (tùy chọn)','Caption (optional)')}<input id="vm-caption" maxlength="180"></label><label class="vm-media-field">${tx('Nguồn / credit (tùy chọn)','Source / credit (optional)')}<input id="vm-source" maxlength="180"></label><label class="vm-media-field">${tx('Đoạn mã chèn vào bài','Embed marker for article')}<textarea rows="3" readonly id="vm-snippet"></textarea></label><button class="vm-nr-btn primary" type="button" id="vm-copy-snippet">${tx('Sao chép mã chèn','Copy embed marker')}</button></div></div>`;
}
function updateSnippet(){if(!activeUrl)return;try{$('#vm-snippet').value=markup(activeUrl,activeKind,$('#vm-caption')?.value,$('#vm-source')?.value);}catch(e){status(e.message,true);}}
function showUrl(v,kind){activeUrl=v;activeKind=kind;$('#vm-upload-result').hidden=false;$('#vm-media-result-body').innerHTML=fields(v,kind);updateSnippet();}
async function upload(file,kind){
 const extensions=kind==='video'?{'video/mp4':'mp4','video/webm':'webm'}:{'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
 const limit=kind==='video'?25*1024*1024:2*1024*1024;
 if(!file?.size)throw Error(tx('Hãy chọn file trước.','Select a file.'));
 if(!extensions[file.type]||file.size>limit)throw Error(tx('File quá lớn hoặc sai định dạng.','File too large or unsupported type.'));
 const key=`${user.id}/${crypto.randomUUID()}.${extensions[file.type]}`;
 const b=bucket(kind);const {error}=await sb.storage.from(b).upload(key,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
 if(error)throw Error(`${b}: ${error.message}`);
 return sb.storage.from(b).getPublicUrl(key).data.publicUrl;
}
async function list(){const box=$('#vm-media-list');if(!box)return;box.textContent=tx('Đang tải danh sách…','Loading uploads…');
 const groups=await Promise.all(['image','video'].map(async kind=>({kind,result:await sb.storage.from(bucket(kind)).list(user.id,{limit:60,offset:0,sortBy:{column:'created_at',order:'desc'}})})));
 box.innerHTML=groups.map(({kind,result})=>{
  const b=bucket(kind),label=kind==='video'?tx('Video đã tải lên','Uploaded videos'):tx('Ảnh đã tải lên','Uploaded images');
  if(result.error)return `<div class="vm-media-message error"><b>${label}:</b> ${esc(result.error.message)}${kind==='video'?`<p>${tx('Kiểm tra SQL 08.','Check SQL 08.')}</p>`:''}</div>`;
  const files=(result.data||[]).filter(x=>x.id&&(kind==='video'?/\.(mp4|webm)$/i:/\.(jpe?g|png|webp)$/i).test(x.name));
  const tiles=files.map(x=>{const link=sb.storage.from(b).getPublicUrl(`${user.id}/${x.name}`).data.publicUrl;
  const preview=kind==='video'?`<video src="${esc(link)}" muted preload="none"></video>`:`<img loading="lazy" src="${esc(link)}" alt="">`;
  return `<div class="vm-media-tile">${preview}<div><small title="${esc(x.name)}">${esc(x.name)}</small><button type="button" class="vm-nr-btn" data-vm-use="${esc(link)}" data-vm-kind="${kind}">${tx('Dùng file này','Use media')}</button></div></div>`;}).join('');
  return `<section><h3>${label}</h3>${tiles?`<div class="vm-media-grid">${tiles}</div>`:`<p class="vm-nr-help">${tx('Chưa có file.','No files yet.')}</p>`}</section>`;
 }).join('');
}
async function copy(value){try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(value);else{const t=document.createElement('textarea');t.value=value;document.body.appendChild(t);t.select();if(!document.execCommand('copy'))throw Error('Copy failed');t.remove()}status(tx('Đã sao chép.','Copied.'))}catch{status(tx('Không sao chép được tự động, hãy chọn ô và sao chép.','Cannot auto-copy; select the text field instead.'),true)}}
async function init(){if(!$('#page-content'))return;if(!sb){shell('<p>Supabase is not configured. Check config.js.</p>');return;}shell(`<p>${tx('Đang kiểm tra quyền…','Checking permissions…')}</p>`);
 try{const a=await sb.auth.getUser();if(a.error)throw Error(a.error.message);user=a.data?.user;if(!user)throw Error(tx('Đăng nhập trước khi tiếp tục.','Please sign in first.'));
 const r=await sb.rpc('news_my_role');if(r.error)throw Error(r.error.message);if(!['editor','admin'].includes(r.data))throw Error(tx('Chỉ biên tập viên/quản trị viên được dùng.','Editors/Admins only.'));
 render();await list();
 }catch(e){shell(`<div class="vm-media-message error">${esc(e.message)}</div><p><a href="./tai-khoan.html?mode=login">${tx('Đăng nhập','Sign in')}</a></p>`)}
}
document.addEventListener('DOMContentLoaded',init);
document.addEventListener('submit',async e=>{if(e.target.id!=='vm-media-upload')return;e.preventDefault();if(uploading)return;uploading=true;const button=$('#vm-media-upload-btn');button.disabled=true;
 try{const kind=$('#vm-media-type').value,result=await upload($('#vm-media-file').files[0],kind);showUrl(result,kind);$('#vm-media-file').value='';status(tx('Upload thành công!','Upload complete!'));await list()}catch(err){status(err.message,true)}finally{uploading=false;button.disabled=false;}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='vm-copy-url')return copy(activeUrl);if(b.id==='vm-copy-snippet')return copy($('#vm-snippet')?.value||'');if(b.id==='vm-media-refresh')return list();if(b.dataset.vmUse){showUrl(b.dataset.vmUse,b.dataset.vmKind);status(tx('Đã chọn media.','Media selected.'))}});
document.addEventListener('change',e=>{if(e.target.id==='vm-media-type')$('#vm-media-file').accept=e.target.value==='video'?'video/mp4,video/webm':'image/jpeg,image/png,image/webp'});
document.addEventListener('input',e=>{if(['vm-caption','vm-source'].includes(e.target.id))updateSnippet()});
})();
