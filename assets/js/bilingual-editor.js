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
<div class="vm-bi-toolbar"><button type="button" class="vm-bi-btn" data-insert="heading" data-lang="${lang}">+ Heading</button><button type="button" class="vm-bi-btn" data-insert="bold" data-lang="${lang}">** Bold</button><button type="button" class="vm-bi-btn" data-insert="quote" data-lang="${lang}">❝ Quote</button><button type="button" class="vm-bi-btn" data-preview="${lang}">${local?'Xem trước':'Preview'}</button></div>
<div class="vm-bi-preview" id="bi-preview-${lang}" hidden></div></section>`}
function html(){const pvi=pair?.vi||null,pen=pair?.en||null,ref=pvi||pen||{};
const categoryOpts=cats.map(c=>`<option value="${esc(c.slug)}" ${ref.category===c.slug?'selected':''}>${esc(c.name)}</option>`).join('');return `<div class="vm-bi-container">
<header class="vm-bi-header"><div><span class="vm-bi-eyebrow">VIETMUSE / ${tx('BIÊN TẬP SONG NGỮ','BILINGUAL NEWSROOM')}</span><h1>${tx('Soạn và đăng bài song ngữ','Write and publish in two languages')}</h1><p>${tx('Soạn bản Việt và Anh trong cùng một biểu mẫu. Xuất bản cả hai bản chỉ khi đã hoàn thiện.','Write Vietnamese and English in the same form. Both versions must be complete before publishing.')}</p><a class="vm-bi-btn vm-bi-navback" href="./quan-ly-bao.html">← ${tx('Quay về Newsroom','Back to Newsroom')}</a></div></header>
<div id="bi-status" class="vm-bi-status" hidden role="status" aria-live="polite"></div>
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
<section class="vm-bi-panel"><h2 class="vm-bi-section-head">${tx('Chèn ảnh vào nội dung','Insert a photo in the article')}</h2>
<div class="vm-bi-grid"><label class="vm-bi-field">${tx('Chèn vào phiên bản','Insert into version')}<select id="bi-image-lang"><option value="vi">VI — Tiếng Việt</option><option value="en">EN — English</option></select></label>
<label class="vm-bi-field">${tx('Vị trí ảnh','Image placement')}<select id="bi-image-mode"><option value="after">${tx('Sau đoạn văn được chọn','After a chosen paragraph')}</option><option value="cursor">${tx('Tại vị trí con trỏ (cách cũ)','At the text cursor (legacy)')}</option></select></label>
<label class="vm-bi-field" id="bi-image-position-wrap">${tx('Chèn ảnh sau đoạn số','Insert image after paragraph')}<select id="bi-image-position" aria-describedby="bi-paragraph-count"></select></label>
${field('Image URL (https://...)','image_url','','type="url" placeholder="https://..."')}
${field('Caption / Chú thích ảnh','image_caption','','maxlength="180"')}
${field('Source / Nguồn ảnh','image_source','','maxlength="180"')}
<label class="vm-bi-field">Upload photo (max 2 MB)<input type="file" id="bi-inline-file" accept="image/png,image/jpeg,image/webp"></label></div>
<div class="vm-bi-paragraph-helper" aria-live="polite"><strong id="bi-paragraph-count"></strong><p id="bi-paragraph-selected" class="vm-bi-help"></p>
<details id="bi-paragraph-map" class="vm-bi-paragraph-map"><summary>${tx('Chọn vị trí bằng cách bấm vào đoạn văn','Click a paragraph to choose image position')}</summary><p class="vm-bi-paragraph-instruction">${tx('Bấm vào đoạn văn bên dưới để chọn chèn ảnh ngay SAU đoạn đó. Đoạn được chọn sẽ có viền nâu.','Tap any paragraph below to insert an image AFTER it. The selected paragraph is highlighted.')}</p><ol id="bi-paragraph-outline" aria-label="${tx('Các đoạn văn có thể chọn','Selectable paragraphs')}"></ol></details></div>
<div class="vm-bi-toolbar"><button type="button" id="bi-insert-url" class="vm-bi-btn">+ ${tx('Chèn URL ảnh','Insert image link')}</button><button type="button" id="bi-upload-inline" class="vm-bi-btn">↑ ${tx('Tải ảnh và chèn','Upload & insert image')}</button><a href="./thu-vien-anh.html" target="_blank" rel="noopener" class="vm-bi-btn">${tx('Mở thư viện ảnh','Open Media Library')} ↗</a></div>
<p class="vm-bi-help">${tx('Hệ thống tự đếm các đoạn văn của phiên bản đã chọn. Mỗi đoạn cách nhau bằng một dòng trống (nhấn Enter hai lần). Tiêu đề phụ, trích dẫn, danh sách và ảnh sẵn có không được tính là đoạn văn. Có thể chuyển sang chế độ con trỏ nếu muốn chèn thủ công như trước.','Paragraphs are counted automatically in the selected language. Separate paragraphs with a blank line (press Enter twice). Headings, quotes, lists and existing images are not counted. Switch to cursor mode to insert manually as before.')}</p></section>
<div class="vm-bi-actions"><button type="button" class="vm-bi-btn" data-bi-save="draft">${tx('Lưu nháp','Save draft')}</button><button type="button" class="vm-bi-btn" data-bi-save="pending">${tx('Gửi chờ duyệt','Send for review')}</button><button type="button" class="vm-bi-btn primary" data-bi-save="published">${tx('Xuất bản cả VI + EN','Publish both VI + EN')}</button></div>
</form>
<details class="vm-bi-panel vm-bi-import"><summary>${tx('Nhập bản nháp từ Google Docs bằng JSON','Import Google Docs draft pack (JSON)')}</summary>
<p class="vm-bi-help">${tx('Tải file vietmuse-bilingual-drafts.json trong gói bài trước. Chỉ nhập bản nháp để rà soát, không tự công khai bài lấy từ báo khác.','Select vietmuse-bilingual-drafts.json from the previous pack. Import as drafts only, not as public copies of third-party articles.')}</p>
<label class="vm-bi-field">JSON draft pack<input id="bi-import-file" type="file" accept="application/json,.json"></label><div id="bi-import-choices" class="vm-bi-import-list" hidden></div><button type="button" class="vm-bi-btn" id="bi-do-import" disabled>${tx('Nhập các bài đã chọn (bản nháp)','Import selected as drafts')}</button></details></div>`;}
function pairFromPosts(posts){const p={vi:null,en:null};for(const r of posts||[])if(r.language==='vi'||r.language==='en')p[r.language]=r;return p}
async function openExisting(id){const {data:record,error}=await client.from('news_posts').select('*').eq('id',id).single();if(error)throw Error(error.message);if(record.post_type!=='news')throw Error(tx('Góc nhìn phải chỉnh ở trang kiểm duyệt.','Forum posts are edited in moderation.'));editing=record;let posts=[record];if(record.translation_group){const r=await client.from('news_posts').select('*').eq('translation_group',record.translation_group);if(r.error)throw Error(r.error.message);posts=r.data||posts;}pair=pairFromPosts(posts);}
async function init(){const root=$('#page-content');if(!root)return;if(!client){root.innerHTML='<div class="vm-bi-container"><p>Supabase not configured. Check assets/js/config.js.</p></div>';return}
try{const {data,error}=await client.auth.getUser();if(error)throw Error(error.message);user=data?.user;if(!user)throw Error(tx('Đăng nhập trước khi soạn bài.','Sign in before editing.'));const r=await client.rpc('news_my_role');if(r.error)throw Error(r.error.message);role=r.data||'reader';if(!['editor','admin'].includes(role))throw Error(tx('Chỉ biên tập viên và quản trị viên được viết bài.','Only Editors and Administrators can edit articles.'));const id=new URLSearchParams(location.search).get('id');if(id)await openExisting(id);root.innerHTML=html();bind();}catch(error){root.innerHTML=`<div class="vm-bi-container vm-bi-status error">${esc(error.message)} <a href="./tai-khoan.html">${tx('Đăng nhập','Sign in')}</a></div>`}}
function variants(){const form=$('#bi-form');const fd=new FormData(form);const val=(key)=>String(fd.get(key)||'').trim();const out={category:val('category'),author_name:val('author_name'),editor_name:val('editor_name'),translator_name:val('translator_name'),cover_url:val('cover_url'),source_name:val('source_name'),source_url:val('source_url'),post_id:editing?.id||null};for(const lang of ['vi','en']){const item={title:val(`${lang}_title`),excerpt:val(`${lang}_excerpt`),body:val(`${lang}_body`)};out[lang]=Object.values(item).some(Boolean)?item:null;}return out}
function validate(variant,statusValue){if(!variant){if(statusValue==='published')throw Error(tx('Cần đủ cả hai phiên bản trước khi xuất bản.','Complete both languages before publishing.'));return}if(variant.title.length<8||variant.title.length>180||variant.excerpt.length>400||variant.body.length<60||variant.body.length>30000)throw Error(tx('Tiêu đề 8–180, tóm tắt không bắt buộc (tối đa 400), nội dung 60–30.000 ký tự.','Headline 8–180, summary optional (up to 400), body 60–30,000 characters.'))}
async function upload(file){if(!file?.size)throw Error(tx('Chưa chọn file ảnh.','Choose an image first.'));const exts={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};if(!exts[file.type]||file.size>2*1024*1024)throw Error('JPG/PNG/WebP only, max 2 MB.');const key=`${user.id}/${crypto.randomUUID()}.${exts[file.type]}`;const {error}=await client.storage.from('news-covers').upload(key,file,{contentType:file.type,upsert:false});if(error)throw Error(`Image upload failed: ${error.message}`);return client.storage.from('news-covers').getPublicUrl(key).data.publicUrl}
async function rpcSave(payload){const {data,error}=await client.rpc('news_save_bilingual',{p_payload:payload});if(error)throw Error(`${error.message}. ${tx('Đảm bảo đã chạy migration 06.','Run migration 06 in Supabase first.')}`);return data}
async function save(action){if(working)return;working=true;const buttons=[...document.querySelectorAll('[data-bi-save]')];buttons.forEach(b=>b.disabled=true);try{const payload=variants();if(!payload.author_name||payload.author_name.length<2)throw Error('Please enter the author.');if(payload.source_url&&!safeUrl(payload.source_url))throw Error('Source URL must use HTTPS.');validate(payload.vi,action);validate(payload.en,action);if(!payload.vi&&!payload.en)throw Error(tx('Điền ít nhất một bản ngôn ngữ.','Enter at least one language version.'));
if(action==='published'){const answer=confirm(tx('Hai bản sẽ công khai ngay. Xác nhận nội dung đã được biên tập, kiểm chứng và có quyền đăng lại?','Both versions will be public. Confirm fact-checking and publication rights?'));if(!answer)return}
const file=$('[name="cover_file"]')?.files?.[0];if(file?.size)payload.cover_url=await upload(file);if(payload.cover_url&&!safeUrl(payload.cover_url))throw Error('Cover image URL must use HTTPS.');payload.status=action;const result=await rpcSave(payload);editing={id:result.posts?.vi||result.posts?.en,translation_group:result.translation_group};status(action==='published'?tx('Đã xuất bản hai phiên bản. Bài hiện trên VietMuse nếu không bị bộ lọc chuyên mục ẩn.','Both versions published to VietMuse.'):action==='draft'?tx('Đã lưu bản nháp vào Supabase.','Draft saved to Supabase.'):tx('Đã gửi hai bản chờ duyệt.','Sent both versions for review.'),'ok');history.replaceState(null,'',`?id=${encodeURIComponent(editing.id)}`);}catch(error){status(error.message,'error')}finally{working=false;buttons.forEach(b=>b.disabled=false)}}
function insertText(lang,text){const box=$(`[name="${lang}_body"]`);if(!box)return;const start=box.selectionStart??box.value.length,end=box.selectionEnd??box.value.length;box.setRangeText(text,start,end,'end');box.focus();box.dispatchEvent(new Event('input',{bubbles:true}))}
function imageSnippet(url){if(!safeUrl(url))throw Error('Image URL must use HTTPS.');const cap=String($('[name="image_caption"]')?.value||'').replaceAll('|','–').replaceAll(']','').replaceAll('\n',' ').trim();const src=String($('[name="image_source"]')?.value||'').replaceAll('|','–').replaceAll(']','').replaceAll('\n',' ').trim();return `\n\n[[image|${url}|${cap}|${src}]]\n\n`}
function currentParagraphs(){const lang=$('#bi-image-lang')?.value||'vi';return window.VMParagraphTools.findParagraphs($(`[name="${lang}_body"]`)?.value||'')}
function updateParagraphChoices(){
 const select=$('#bi-image-position'),mode=$('#bi-image-mode'),wrap=$('#bi-image-position-wrap');
 if(!select||!mode)return;
 const lang=$('#bi-image-lang').value,paras=currentParagraphs(),after=mode.value==='after';
 const selected=Math.max(1,Math.min(Number(chosenParagraph[lang])||1,paras.length||1));
 chosenParagraph[lang]=selected;
 wrap.hidden=!after;
 select.innerHTML=paras.map(p=>`<option value="${p.number}">${tx('Sau đoạn','After paragraph')} ${p.number} — ${esc(p.text.slice(0,65))}${p.text.length>65?'…':''}</option>`).join('');
 if(paras.length)select.value=String(selected);
 select.disabled=!paras.length;
 const count=$('#bi-paragraph-count');
 count.textContent=tx(`${paras.length} đoạn văn trong bản ${lang.toUpperCase()}`,`${paras.length} paragraphs in the ${lang.toUpperCase()} version`);
 const detail=$('#bi-paragraph-selected');
 detail.textContent=after?(paras.length?tx(`Đã chọn đoạn ${selected}: ảnh sẽ chèn ngay sau đoạn này.`,`Selected paragraph ${selected}: the image will appear immediately after it.`):tx('Chưa có đoạn văn. Nhập nội dung trước hoặc chuyển sang chế độ con trỏ.','No paragraphs found. Write the article or switch to cursor mode.')):tx('Chế độ con trỏ: chèn ảnh tại nơi đang chọn trong nội dung.','Cursor mode: insert at the current cursor position.');
 const list=$('#bi-paragraph-outline');
 list.innerHTML=paras.map(p=>{
   const active=after&&p.number===selected;
   return `<li class="vm-bi-paragraph-row${active?' selected':''}"><button type="button" class="vm-bi-paragraph-choice" data-bi-paragraph-number="${p.number}" aria-pressed="${active?'true':'false'}" aria-label="${esc(tx(`Chọn chèn ảnh sau đoạn ${p.number}`,`Insert image after paragraph ${p.number}`))}"><span class="vm-bi-paragraph-number">${p.number}.</span><span class="vm-bi-paragraph-text">${esc(p.text.slice(0,180))}${p.text.length>180?'…':''}</span><span class="vm-bi-paragraph-action">${active?tx('✓ Đã chọn','✓ Selected'):tx('Chọn đoạn này','Select this')}</span></button></li>`;
 }).join('')||`<li class="vm-bi-paragraph-empty">${tx('Chưa có đoạn nào','No paragraphs yet')}</li>`;
 $('#bi-paragraph-map').hidden=!after;
}
function chooseParagraph(number){
 const lang=$('#bi-image-lang').value;
 const paragraphs=currentParagraphs();
 if(!Number.isInteger(number)||number<1||number>paragraphs.length)return;
 chosenParagraph[lang]=number;
 // Selecting a preview also moves the real form dropdown, not just its highlight.
 $('#bi-image-mode').value='after';
 updateParagraphChoices();
}

function insertImageInPosition(url){
 const lang=$('#bi-image-lang').value;
 if($('#bi-image-mode').value==='cursor'){insertText(lang,imageSnippet(url));return null;}
 const area=$(`[name="${lang}_body"]`),number=Number($('#bi-image-position').value);
 if(!area)throw Error('Article body is not available.');
 if(!window.VMParagraphTools)throw Error('Image placement script is not loaded.');
 const result=window.VMParagraphTools.insertAfter(area.value,number,imageSnippet(url).trim());
 area.value=result.value;area.focus();area.setSelectionRange(result.cursor,result.cursor);
 area.dispatchEvent(new Event('input',{bubbles:true}));
 return result.paragraphNumber;
}
function bind(){document.querySelectorAll('[data-bi-save]').forEach(b=>b.addEventListener('click',()=>save(b.dataset.biSave)));
document.querySelectorAll('[data-insert]').forEach(b=>b.addEventListener('click',()=>{const lang=b.dataset.lang;const val=b.dataset.insert;insertText(lang,val==='heading'?'\n\n## Section heading\n':val==='bold'?'**bold text**':'\n\n> Quote\n')}));
document.querySelectorAll('[data-preview]').forEach(b=>b.addEventListener('click',()=>{const lang=b.dataset.preview,box=$(`#bi-preview-${lang}`);box.hidden=!box.hidden;if(!box.hidden){const text=$(`[name="${lang}_body"]`).value;box.innerHTML=window.VMStoryBody?window.VMStoryBody(text):`<p>${esc(text)}</p>`;}}));
$('#bi-image-lang').addEventListener('change',updateParagraphChoices);
$('#bi-image-mode').addEventListener('change',updateParagraphChoices);
$('#bi-image-position').addEventListener('change',()=>{chosenParagraph[$('#bi-image-lang').value]=Number($('#bi-image-position').value);updateParagraphChoices()});
// Event delegation survives the list being rebuilt while the author edits the body.
$('#bi-paragraph-outline').addEventListener('click',event=>{
 const button=event.target.closest('[data-bi-paragraph-number]');
 if(button)chooseParagraph(Number(button.dataset.biParagraphNumber));
});
for(const lang of ['vi','en'])$(`[name="${lang}_body"]`).addEventListener('input',()=>{if($('#bi-image-lang').value===lang)updateParagraphChoices()});
updateParagraphChoices();
$('#bi-insert-url').addEventListener('click',()=>{try{const index=insertImageInPosition($('[name="image_url"]').value.trim());status(index?tx(`Đã chèn ảnh sau đoạn ${index}.`,`Image inserted after paragraph ${index}.`):tx('Đã chèn ảnh tại con trỏ.','Image inserted at the cursor.'),'ok')}catch(e){status(e.message,'error')}});
$('#bi-upload-inline').addEventListener('click',async()=>{const b=$('#bi-upload-inline');b.disabled=true;try{
// Validate placement before uploading, to avoid storing an unused file when no paragraph exists.
if($('#bi-image-mode').value==='after'&&!currentParagraphs().length)throw Error(tx('Bản này chưa có đoạn văn để chèn ảnh.','This version has no paragraph to insert after.'));
const url=await upload($('#bi-inline-file').files[0]);$('[name="image_url"]').value=url;
const index=insertImageInPosition(url);
status(index?tx(`Đã tải ảnh và chèn sau đoạn ${index}.`,`Photo uploaded and inserted after paragraph ${index}.`):tx('Đã upload và chèn ảnh tại con trỏ.','Photo uploaded and inserted at the cursor.'),'ok')
}catch(e){status(e.message,'error')}finally{b.disabled=false}});
$('#bi-import-file').addEventListener('change',readImport);$('#bi-do-import').addEventListener('click',importDrafts);
}
async function readImport(event){sourceItems=[];const box=$('#bi-import-choices'),button=$('#bi-do-import');box.hidden=true;button.disabled=true;const f=event.target.files?.[0];if(!f)return;try{if(f.size>2*1024*1024)throw Error('JSON draft file must be under 2 MB.');const source=JSON.parse(await f.text());if(!Array.isArray(source.items))throw Error('Expected JSON with an items array.');const byIndex=new Map();for(const item of source.items){if(!Number.isInteger(item.index)||!['en','vi'].includes(item.language)||!allowedCats.includes(item.category))continue;let set=byIndex.get(item.index);if(!set){set={index:item.index,vi:null,en:null};byIndex.set(item.index,set)}set[item.language]=item;}
sourceItems=[...byIndex.values()].sort((a,b)=>a.index-b.index);if(!sourceItems.length)throw Error('No matching draft articles.');box.innerHTML=sourceItems.map((a,i)=>`<label class="vm-bi-chosen"><input type="checkbox" data-import-index="${i}" checked><span><strong>${esc(a.vi?.title||a.en?.title||'Article')}</strong><br><small>${esc(a.en?.title||'')} · ${a.vi?'VI ✓':'VI —'} · ${a.en?'EN ✓':'EN —'}</small></span></label>`).join('');box.hidden=false;button.disabled=false;status(tx(`Đã đọc ${sourceItems.length} cặp bài. Chỉ có thể nhập làm bản nháp.`,`Loaded ${sourceItems.length} article pairs. They can only be imported as drafts.`));}catch(error){status(error.message,'error')}}
async function importDrafts(){if(working)return;const picked=[...document.querySelectorAll('[data-import-index]:checked')].map(c=>sourceItems[Number(c.dataset.importIndex)]);if(!picked.length)return status(tx('Chưa chọn bài nào.','Select at least one article.'),'error');if(!confirm(tx(`Nhập ${picked.length} cặp bài vào trạng thái BẢN NHÁP? Đọc và rà quyền đăng lại trước khi xuất bản.`,`Import ${picked.length} article pairs as DRAFTS? Review content and publishing permissions before going public.`)))return;working=true;$('#bi-do-import').disabled=true;let ok=0,errors=[];try{for(const item of picked){const main=item.vi||item.en;const p={category:main.category,author_name:String(main.author_name||'VietMuse Editorial'),editor_name:String(main.editor_name||''),translator_name:String(main.translator_name||''),source_name:String(main.source||''),source_url:String(main.source_url||''),source_key:`docs-week8-${item.index}`,status:'draft',cover_url:main.cover_url||null};for(const l of ['vi','en'])p[l]=item[l]?{title:item[l].title,excerpt:item[l].excerpt,body:item[l].body}:null;try{validate(p.vi,'draft');validate(p.en,'draft');await rpcSave(p);ok++;}catch(e){errors.push(`${item.index}: ${e.message}`)}status(tx(`Đã nhập ${ok}/${picked.length} cặp bài dưới dạng nháp.`,`Imported ${ok}/${picked.length} pairs as drafts.`));}
status(tx(`Hoàn tất: ${ok} thành công, ${errors.length} lỗi.`,`Complete: ${ok} successful, ${errors.length} errors.`)+(errors.length?'\n'+errors.slice(0,4).join('\n'):''),errors.length?'error':'ok');}finally{working=false;$('#bi-do-import').disabled=false}}
document.addEventListener('DOMContentLoaded',init);
})();
