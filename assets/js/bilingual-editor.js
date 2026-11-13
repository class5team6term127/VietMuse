/* VietMuse V12 bilingual editor. All database writes use authenticated Supabase RPC.
   RLS and private.news_role() are enforced server-side; never use a secret key in JS. */
(()=>{'use strict';
const $=(q,root=document)=>root.querySelector(q);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const vi=window.VIETMUSE_LANG==='vi';
const tx=(v,e)=>vi?v:e;
const cfg=window.COMMUNITY_CONFIG||{};
const client=(window.supabase&&cfg.supabaseUrl&&cfg.publishableKey)?window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey):null;
const allowedCats=['thoi-su','doi-song','giao-duc','van-hoa','cong-nghe','kinh-te','moi-truong','du-lich','suc-khoe','giai-tri','the-thao'];
const cats=(window.SITE?.categories||[]).filter(c=>allowedCats.includes(c.slug));
let user=null,role='reader',editing=null,pair=null,sourceItems=[],working=false;
// Keep a separate image-placement choice for each translation.
const chosenParagraph={vi:1,en:1};
function status(message,type='info'){const box=$('#bi-status');if(!box)return;box.hidden=false;box.className=`vm-bi-status ${type}`;box.textContent=message;box.scrollIntoView({behavior:'smooth',block:'nearest'});}
function safeUrl(url){try{const u=new URL(url);return u.protocol==='https:'&&u.host?u.href:null}catch{return null}}
function field(label,name,val='',attrs=''){return `<label class="vm-bi-field">${label}<input name="${name}" value="${esc(val)}" ${attrs}></label>`}
function textField(label,name,val='',len=3,attrs=''){return `<label class="vm-bi-field">${label}<textarea name="${name}" rows="${len}" ${attrs}>${esc(val)}</textarea></label>`}
function langPanel(lang,p){const local=lang==='vi';const label=local?'VIETNAMESE VERSION':'ENGLISH VERSION';return `<section class="vm-bi-lang" aria-label="${label}"><h3>${local?'🇻🇳 Vietnamese version · Bản tiếng Việt':'🇬🇧 English version · Bản tiếng Anh'}</h3>${field(local?'Tiêu đề':'Headline',`${lang}_title`,p?.title||'','maxlength="180" minlength="8"')}${textField(local?'Tóm tắt (không bắt buộc)':'Summary (optional)',`${lang}_excerpt`,p?.excerpt||'',3,'maxlength="400"')}${textField(local?'Nội dung bài (tối thiểu 60 ký tự)':'Article body (minimum 60 characters)',`${lang}_body`,p?.body||'',14,'maxlength="30000"')}
<div class="vm-bi-toolbar"><button type="button" class="vm-bi-btn" data-insert="heading" data-lang="${lang}">+ Heading</button><button type="button" class="vm-bi-btn" data-insert="bold" data-lang="${lang}">** Bold</button><button type="button" class="vm-bi-btn" data-insert="quote" data-lang="${lang}">❝ Quote</button><button type="button" class="vm-bi-btn" data-note-open="${lang}" aria-expanded="false" aria-controls="bi-note-builder-${lang}">ⓘ ${local?'Bên lề':'Side note'}</button><button type="button" class="vm-bi-btn" data-preview="${lang}">${local?'Xem trước':'Preview'}</button></div>
<div class="vm-bi-note-builder" id="bi-note-builder-${lang}" hidden>
  <h4>${local?'Thêm thông tin bên lề':'Insert a side note'}</h4>
  <div class="vm-bi-note-fields">
    <label class="vm-bi-field">${local?'Tiêu đề (không bắt buộc)':'Title (optional)'}<input name="${lang}_note_title" maxlength="100" placeholder="${local?'Bạn có biết?':'Did you know?'}"></label>
    <label class="vm-bi-field">${local?'Nội dung bên lề':'Side note text'}<textarea name="${lang}_note_content" maxlength="1800" rows="4" placeholder="${local?'Ghi thông tin bổ sung tại đây…':'Additional context goes here…'}"></textarea></label>
  </div>
  <label class="vm-bi-note-fill"><input name="${lang}_note_fill" type="checkbox"> ${local?'Đổ nền màu kem (tùy chọn)':'Filled cream background (optional)'}</label>
  <div class="vm-bi-note-actions"><button class="vm-bi-btn primary" type="button" data-note-insert="${lang}">${local?'Chèn vào bài':'Insert into article'}</button><button class="vm-bi-btn" type="button" data-note-cancel="${lang}">${local?'Hủy':'Cancel'}</button></div>
  <p class="vm-bi-help">${local?'Khung bên lề sẽ xuất hiện tại vị trí con trỏ trong bài.':'The note appears wherever the text cursor is placed.'}</p>
</div>
<div class="vm-bi-preview" id="bi-preview-${lang}" hidden></div></section>`}
function managementHTML(){
 if(!editing?.id)return '';
 const links=['vi','en'].filter(lang=>pair?.[lang]?.id&&pair[lang].status==='published').map(lang=>`<a class="vm-bi-btn" href="./bai-ban-doc.html?id=${encodeURIComponent(pair[lang].id)}" target="_blank" rel="noopener noreferrer">👁 ${lang==='vi'?tx('Xem bản Việt','View Vietnamese'):tx('Xem bản Anh','View English')}</a>`).join('');
 const count=['vi','en'].filter(lang=>Boolean(pair?.[lang]?.id)).length;
 return `<section class="vm-bi-panel vm-bi-management" id="bi-management"><div><h2 class="vm-bi-section-head">${tx('Quản lý bài viết','Article management')}</h2><p class="vm-bi-help">${tx('View mở bài đã xuất bản. Bản nháp có thể dùng nút Xem trước ngay trong từng ngôn ngữ.','View opens published articles. For drafts, use Preview in each language section.')}</p></div><div class="vm-bi-management-actions">${links}<button type="button" id="bi-delete-article" class="vm-bi-btn danger">${count>1?tx('Xóa cả bài VI + EN…','Delete VI + EN article…'):tx('Xóa bài viết…','Delete article…')}</button></div></section>`;
}
function refreshManagement(){const anchor=$('#bi-management-anchor');if(!anchor)return;anchor.innerHTML=managementHTML();const button=$('#bi-delete-article');if(button)button.addEventListener('click',deleteArticle);}
function html(){const pvi=pair?.vi||null,pen=pair?.en||null,ref=pvi||pen||{};
const categoryOpts=cats.map(c=>`<option value="${esc(c.slug)}" ${ref.category===c.slug?'selected':''}>${esc(c.name)}</option>`).join('');return `<div class="vm-bi-container">
<header class="vm-bi-header"><div><span class="vm-bi-eyebrow">VIETMUSE / ${tx('BIÊN TẬP SONG NGỮ','BILINGUAL NEWSROOM')}</span><h1>${tx('Soạn và đăng bài song ngữ','Write and publish in two languages')}</h1><p>${tx('Soạn bản Việt và Anh trong cùng một biểu mẫu. Xuất bản cả hai bản chỉ khi đã hoàn thiện.','Write Vietnamese and English in the same form. Both versions must be complete before publishing.')}</p><a class="vm-bi-btn vm-bi-navback" href="./quan-ly-bao.html">← ${tx('Quay về Newsroom','Back to Newsroom')}</a></div></header>
<div id="bi-status" class="vm-bi-status" hidden role="status" aria-live="polite"></div>
<div id="bi-management-anchor">${managementHTML()}</div>
<form id="bi-form" class="vm-bi-form" novalidate>
<section class="vm-bi-panel"><h2 class="vm-bi-section-head">${tx('Thông tin chung','Shared article details')}</h2><div class="vm-bi-grid">
<label class="vm-bi-field">${tx('Chuyên mục','Section')}<select name="category" required>${categoryOpts}</select></label>
${field(tx('Tác giả','Author'),'author_name',ref.author_name||'VietMuse Editorial','required maxlength="80" minlength="2"')}
${field(tx('Biên tập viên (tùy chọn)','Editor (optional)'),'editor_name',ref.editor_name||'','maxlength="100"')}
${field(tx('Dịch giả (tùy chọn)','Translator (optional)'),'translator_name',ref.translator_name||'','maxlength="100"')}
${field(tx('Nhà xuất bản / Nguồn gốc (tùy chọn)','Original publisher / Source (optional)'),'source_name',ref.source_name||'','maxlength="200"')}
${field(tx('URL nguồn gốc (tùy chọn)','Original source URL (optional)'),'source_url',ref.source_url||'','type="url" placeholder="https://..."')}
${field(tx('Ảnh bìa chung (HTTPS)','Shared cover image URL (HTTPS)'),'cover_url',ref.cover_url||'','type="url" placeholder="https://..."')}
<label class="vm-bi-field">${tx('Hoặc tải ảnh bìa','Or upload cover')}<input name="cover_file" type="file" accept="image/png,image/jpeg,image/webp"></label></div>
<p class="vm-bi-help">${tx('Chỉ tài khoản Editor/Admin đã xác minh mới được gửi bài. File ảnh tối đa 2 MB; cần tạo bucket news-covers trước.','Only verified Editors/Admins can save. Cover images: JPG/PNG/WebP up to 2 MB; news-covers Storage bucket must exist.')}</p></section>
<div class="vm-bi-two">${langPanel('vi',pvi)}${langPanel('en',pen)}</div>
<section class="vm-bi-panel"><div id="bi-crowd-editor"></div></section>
<section class="vm-bi-panel"><h2 class="vm-bi-section-head">${tx('Chèn ảnh & video','Insert images & videos')}</h2>
<div id="bi-media-composer" aria-label="${tx('Các khối ảnh và video','Image and video cards')}"></div></section>
<div class="vm-bi-actions"><button type="button" class="vm-bi-btn" data-bi-save="draft">${tx('Lưu nháp','Save draft')}</button><button type="button" class="vm-bi-btn" data-bi-save="pending">${tx('Gửi chờ duyệt','Send for review')}</button><button type="button" class="vm-bi-btn primary" data-bi-save="published">${tx('Xuất bản cả VI + EN','Publish both VI + EN')}</button></div>
</form>
<details class="vm-bi-panel vm-bi-import"><summary>${tx('Nhập bản nháp từ Google Docs bằng JSON','Import Google Docs draft pack (JSON)')}</summary>
<p class="vm-bi-help">${tx('Tải file vietmuse-bilingual-drafts.json trong gói bài trước. Chỉ nhập bản nháp để rà soát, không tự công khai bài lấy từ báo khác.','Select vietmuse-bilingual-drafts.json from the previous pack. Import as drafts only, not as public copies of third-party articles.')}</p>
<label class="vm-bi-field">JSON draft pack<input id="bi-import-file" type="file" accept="application/json,.json"></label><div id="bi-import-choices" class="vm-bi-import-list" hidden></div><button type="button" class="vm-bi-btn" id="bi-do-import" disabled>${tx('Nhập các bài đã chọn (bản nháp)','Import selected as drafts')}</button></details></div>`;}
function pairFromPosts(posts){const p={vi:null,en:null};for(const r of posts||[])if(r.language==='vi'||r.language==='en')p[r.language]=r;return p}
async function openExisting(id){const {data:record,error}=await client.from('news_posts').select('*').eq('id',id).single();if(error)throw Error(error.message);if(record.post_type!=='news')throw Error(tx('Góc nhìn phải chỉnh ở trang kiểm duyệt.','Forum posts are edited in moderation.'));editing=record;let posts=[record];if(record.translation_group){const r=await client.from('news_posts').select('*').eq('translation_group',record.translation_group);if(r.error)throw Error(r.error.message);posts=r.data||posts;}pair=pairFromPosts(posts);}
async function init(){const root=$('#page-content');if(!root)return;if(!client){root.innerHTML='<div class="vm-bi-container"><p>Supabase not configured. Check assets/js/config.js.</p></div>';return}
try{const {data,error}=await client.auth.getUser();if(error)throw Error(error.message);user=data?.user;if(!user)throw Error(tx('Đăng nhập trước khi soạn bài.','Sign in before editing.'));const r=await client.rpc('news_my_role');if(r.error)throw Error(r.error.message);role=r.data||'reader';if(!['editor','admin'].includes(role))throw Error(tx('Chỉ biên tập viên và quản trị viên được viết bài.','Only Editors and Administrators can edit articles.'));const id=new URLSearchParams(location.search).get('id');if(id)await openExisting(id);root.innerHTML=html();bind();refreshManagement();await window.VMCrowdEditor?.init({client,group:editing?.translation_group||pair?.vi?.translation_group||pair?.en?.translation_group});window.VMArticleMediaComposer?.init({client,user:()=>user,notify:status});}catch(error){root.innerHTML=`<div class="vm-bi-container vm-bi-status error">${esc(error.message)} <a href="./tai-khoan.html">${tx('Đăng nhập','Sign in')}</a></div>`}}
function variants(){const form=$('#bi-form');const fd=new FormData(form);const val=(key)=>String(fd.get(key)||'').trim();const out={category:val('category'),author_name:val('author_name'),editor_name:val('editor_name'),translator_name:val('translator_name'),cover_url:val('cover_url'),source_name:val('source_name'),source_url:val('source_url'),post_id:editing?.id||null};for(const lang of ['vi','en']){const item={title:val(`${lang}_title`),excerpt:val(`${lang}_excerpt`),body:val(`${lang}_body`)};out[lang]=Object.values(item).some(Boolean)?item:null;}return out}
function validate(variant,statusValue){if(!variant){if(statusValue==='published')throw Error(tx('Cần đủ cả hai phiên bản trước khi xuất bản.','Complete both languages before publishing.'));return}if(variant.title.length<8||variant.title.length>180||variant.excerpt.length>400||variant.body.length<60||variant.body.length>30000)throw Error(tx('Tiêu đề 8–180, tóm tắt không bắt buộc (tối đa 400), nội dung 60–30.000 ký tự.','Headline 8–180, summary optional (up to 400), body 60–30,000 characters.'))}
async function upload(file){if(!file?.size)throw Error(tx('Chưa chọn file ảnh.','Choose an image first.'));const exts={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};if(!exts[file.type]||file.size>2*1024*1024)throw Error('JPG/PNG/WebP only, max 2 MB.');const key=`${user.id}/${crypto.randomUUID()}.${exts[file.type]}`;const {error}=await client.storage.from('news-covers').upload(key,file,{contentType:file.type,upsert:false});if(error)throw Error(`Image upload failed: ${error.message}`);return client.storage.from('news-covers').getPublicUrl(key).data.publicUrl}
async function rpcSave(payload){const {data,error}=await client.rpc('news_save_bilingual',{p_payload:payload});if(error)throw Error(error.message + (error.code==='PGRST202'?' — '+tx('Hãy chạy migration 06 và tải lại schema cache.','Run migration 06 and refresh the schema cache.') : ''));return data}
async function save(action){if(working)return;working=true;const buttons=[...document.querySelectorAll('[data-bi-save]')];buttons.forEach(b=>b.disabled=true);try{const payload=variants();if(!payload.author_name||payload.author_name.length<2)throw Error('Please enter the author.');if(payload.source_url&&!safeUrl(payload.source_url))throw Error('Source URL must use HTTPS.');validate(payload.vi,action);validate(payload.en,action);const crowdConfig=window.VMCrowdEditor?.collect();if(!payload.vi&&!payload.en)throw Error(tx('Điền ít nhất một bản ngôn ngữ.','Enter at least one language version.'));
if(action==='published'){const answer=confirm(tx('Hai bản sẽ công khai ngay. Xác nhận nội dung đã được biên tập, kiểm chứng và có quyền đăng lại?','Both versions will be public. Confirm fact-checking and publication rights?'));if(!answer)return}
const file=$('[name="cover_file"]')?.files?.[0];if(file?.size)payload.cover_url=await upload(file);if(payload.cover_url&&!safeUrl(payload.cover_url))throw Error('Cover image URL must use HTTPS.');payload.status=action;const result=await rpcSave(payload);const posts=result.posts||{};pair=pair||{vi:null,en:null};for(const lang of ['vi','en']){if(posts[lang])pair[lang]={...(pair[lang]||{}),id:posts[lang],status:action};}editing={...(editing||{}),id:posts.vi||posts.en||editing?.id,translation_group:result.translation_group};refreshManagement();try{await window.VMCrowdEditor?.persist(result.translation_group,crowdConfig)}catch(pollError){history.replaceState(null,'',`?id=${encodeURIComponent(editing.id)}`);status(tx('BÀI ĐÃ LƯU, nhưng Crowd Poll chưa lưu. Hãy kiểm tra SQL 10 rồi bấm Lưu lại: ','ARTICLE SAVED, but the Crowd Poll failed. Check SQL 10 and save again: ')+pollError.message,'error');return;}status(action==='published'?tx('Đã xuất bản hai phiên bản. Bài hiện trên VietMuse nếu không bị bộ lọc chuyên mục ẩn.','Both versions published to VietMuse.'):action==='draft'?tx('Đã lưu bản nháp vào Supabase.','Draft saved to Supabase.'):tx('Đã gửi hai bản chờ duyệt.','Sent both versions for review.'),'ok');history.replaceState(null,'',`?id=${encodeURIComponent(editing.id)}`);}catch(error){status(error.message,'error')}finally{working=false;buttons.forEach(b=>b.disabled=false)}}
async function deleteArticle(){
 if(working||!editing?.id)return;
 const ids=[...new Set([pair?.vi?.id,pair?.en?.id,editing.id].filter(Boolean))];
 const title=pair?.vi?.title||pair?.en?.title||tx('bài viết này','this article');
 const confirmed=confirm(tx(`XÓA VĨNH VIỄN «${title}»?\n\nThao tác này xóa ${ids.length} phiên bản VI/EN hiện có cùng bình luận và dữ liệu liên quan. KHÔNG THỂ HOÀN TÁC.`,`PERMANENTLY DELETE «${title}»?\n\nThis removes ${ids.length} existing VI/EN version(s), linked comments and related data. THIS CANNOT BE UNDONE.`));
 if(!confirmed)return;
 working=true;
 const buttons=[...document.querySelectorAll('[data-bi-save],#bi-delete-article')];buttons.forEach(b=>b.disabled=true);
 try{
  const {data,error}=await client.from('news_posts').delete().in('id',ids).select('id');
  if(error)throw Error(error.message);
  if((data||[]).length!==ids.length)throw Error(tx('Không đủ quyền xóa tất cả phiên bản. Kiểm tra Supabase rồi thử lại; đừng bấm xóa liên tiếp.','Not every version was removed. Check Supabase before retrying.'));
  location.assign('./quan-ly-bao.html');
 }catch(error){status(error.message,'error')}
 finally{working=false;buttons.forEach(b=>b.disabled=false)}
}
function insertText(lang,text){const box=$(`[name="${lang}_body"]`);if(!box)return;const start=box.selectionStart??box.value.length,end=box.selectionEnd??box.value.length;box.setRangeText(text,start,end,'end');box.focus();box.dispatchEvent(new Event('input',{bubbles:true}))}
function bind(){
 document.querySelectorAll('[data-bi-save]').forEach(b=>b.addEventListener('click',()=>save(b.dataset.biSave)));
 document.querySelectorAll('[data-insert]').forEach(b=>b.addEventListener('click',()=>{const lang=b.dataset.lang,val=b.dataset.insert;insertText(lang,val==='heading'?'\n\n## Section heading\n':val==='bold'?'**bold text**':'\n\n> Quote\n')}));
 document.querySelectorAll('[data-note-open]').forEach(button=>button.addEventListener('click',()=>{
   const lang=button.dataset.noteOpen,panel=$(`#bi-note-builder-${lang}`);
   panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));
   if(!panel.hidden)$(`[name="${lang}_note_title"]`)?.focus();
 }));
 document.querySelectorAll('[data-note-cancel]').forEach(button=>button.addEventListener('click',()=>{
   const lang=button.dataset.noteCancel,panel=$(`#bi-note-builder-${lang}`);
   panel.hidden=true;$(`[data-note-open="${lang}"]`)?.setAttribute('aria-expanded','false');
 }));
 document.querySelectorAll('[data-note-insert]').forEach(button=>button.addEventListener('click',()=>{
   const lang=button.dataset.noteInsert;
   const noteTitle=String($(`[name="${lang}_note_title"]`)?.value||'').trim().replace(/[|\r\n]/g,' ') || (lang==='vi'?'Thông tin bên lề':'Side note');
   const noteContent=String($(`[name="${lang}_note_content"]`)?.value||'').trim();
   if(!noteContent){status(tx('Điền nội dung của khung bên lề trước khi chèn.','Enter the side note text before inserting.'),'error');return;}
   if(/^:::\s*$/m.test(noteContent)){status(tx('Nội dung không được chứa dòng ::: riêng.','A line containing only ::: is reserved for the note format.'),'error');return;}
   const fill=$(`[name="${lang}_note_fill"]`)?.checked;
   const marker=`\n\n:::note${fill?' fill':''}${'|'+noteTitle}\n${noteContent}\n:::\n\n`;
   const editor=$(`[name="${lang}_body"]`);
   if(editor.value.length+marker.length>30000){status(tx('Nội dung bài vượt giới hạn 30.000 ký tự.','Article body exceeds 30,000 characters.'),'error');return;}
   insertText(lang,marker);
   $(`#bi-note-builder-${lang}`).hidden=true;
   $(`[data-note-open="${lang}"]`)?.setAttribute('aria-expanded','false');
   $(`[name="${lang}_note_title"]`).value='';$(`[name="${lang}_note_content"]`).value='';
   $(`[name="${lang}_note_fill"]`).checked=false;
 }));
 document.querySelectorAll('[data-preview]').forEach(b=>b.addEventListener('click',()=>{const lang=b.dataset.preview,box=$(`#bi-preview-${lang}`);box.hidden=!box.hidden;if(!box.hidden){const t=$(`[name="${lang}_body"]`).value;box.innerHTML=window.VMStoryBody?window.VMStoryBody(t):`<p>${esc(t)}</p>`;}}));
 $('#bi-import-file').addEventListener('change',readImport);
 $('#bi-do-import').addEventListener('click',importDrafts);
}
async function readImport(event){sourceItems=[];const box=$('#bi-import-choices'),button=$('#bi-do-import');box.hidden=true;button.disabled=true;const f=event.target.files?.[0];if(!f)return;try{if(f.size>2*1024*1024)throw Error('JSON draft file must be under 2 MB.');const source=JSON.parse(await f.text());if(!Array.isArray(source.items))throw Error('Expected JSON with an items array.');const byIndex=new Map();for(const item of source.items){if(!Number.isInteger(item.index)||!['en','vi'].includes(item.language)||!allowedCats.includes(item.category))continue;let set=byIndex.get(item.index);if(!set){set={index:item.index,vi:null,en:null};byIndex.set(item.index,set)}set[item.language]=item;}
sourceItems=[...byIndex.values()].sort((a,b)=>a.index-b.index);if(!sourceItems.length)throw Error('No matching draft articles.');box.innerHTML=sourceItems.map((a,i)=>`<label class="vm-bi-chosen"><input type="checkbox" data-import-index="${i}" checked><span><strong>${esc(a.vi?.title||a.en?.title||'Article')}</strong><br><small>${esc(a.en?.title||'')} · ${a.vi?'VI ✓':'VI —'} · ${a.en?'EN ✓':'EN —'}</small></span></label>`).join('');box.hidden=false;button.disabled=false;status(tx(`Đã đọc ${sourceItems.length} cặp bài. Chỉ có thể nhập làm bản nháp.`,`Loaded ${sourceItems.length} article pairs. They can only be imported as drafts.`));}catch(error){status(error.message,'error')}}
async function importDrafts(){if(working)return;const picked=[...document.querySelectorAll('[data-import-index]:checked')].map(c=>sourceItems[Number(c.dataset.importIndex)]);if(!picked.length)return status(tx('Chưa chọn bài nào.','Select at least one article.'),'error');if(!confirm(tx(`Nhập ${picked.length} cặp bài vào trạng thái BẢN NHÁP? Đọc và rà quyền đăng lại trước khi xuất bản.`,`Import ${picked.length} article pairs as DRAFTS? Review content and publishing permissions before going public.`)))return;working=true;$('#bi-do-import').disabled=true;let ok=0,errors=[];try{for(const item of picked){const main=item.vi||item.en;const p={category:main.category,author_name:String(main.author_name||'VietMuse Editorial'),editor_name:String(main.editor_name||''),translator_name:String(main.translator_name||''),source_name:String(main.source||''),source_url:String(main.source_url||''),source_key:`docs-week8-${item.index}`,status:'draft',cover_url:main.cover_url||null};for(const l of ['vi','en'])p[l]=item[l]?{title:item[l].title,excerpt:item[l].excerpt,body:item[l].body}:null;try{validate(p.vi,'draft');validate(p.en,'draft');await rpcSave(p);ok++;}catch(e){errors.push(`${item.index}: ${e.message}`)}status(tx(`Đã nhập ${ok}/${picked.length} cặp bài dưới dạng nháp.`,`Imported ${ok}/${picked.length} pairs as drafts.`));}
status(tx(`Hoàn tất: ${ok} thành công, ${errors.length} lỗi.`,`Complete: ${ok} successful, ${errors.length} errors.`)+(errors.length?'\n'+errors.slice(0,4).join('\n'):''),errors.length?'error':'ok');}finally{working=false;$('#bi-do-import').disabled=false}}
document.addEventListener('DOMContentLoaded',init);
})();
