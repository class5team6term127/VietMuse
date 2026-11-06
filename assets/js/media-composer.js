/* VietMuse V17: multiple independent image/video embed cards in bilingual newsroom.
   Cards insert plain-text markers into existing VI/EN bodies; no database schema changes. */
(function(root){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const vi=()=>root.VIETMUSE_LANG==='vi';
const tx=(v,e)=>vi()?v:e;
let seq=0,ctx=null,busy=false;
function card(){
 const id=++seq;
 return `<article class="vm-mc-card" data-mc-card="${id}">
 <div class="vm-mc-card-head"><h3><span class="vm-mc-number">${tx('Ảnh/video','Media')} ${id}</span> <span class="vm-mc-tag">${tx('Chưa chèn','Not inserted')}</span></h3><div class="vm-mc-head-actions"><button type="button" class="vm-bi-btn vm-mc-toggle" data-mc-collapse aria-expanded="true">${tx('Thu gọn','Collapse')}</button><button type="button" class="vm-bi-btn vm-mc-remove" data-mc-remove>${tx('Xóa','Remove')}</button></div></div>
 <div class="vm-bi-grid">
 <label class="vm-bi-field">${tx('Loại media','Media type')}<select data-mc-type><option value="image">${tx('Ảnh','Image')}</option><option value="video">${tx('Video','Video')}</option></select></label>
 <label class="vm-bi-field">${tx('Chèn vào bản','Article version')}<select data-mc-lang><option value="vi">VI — Tiếng Việt</option><option value="en">EN — English</option></select></label>
 <label class="vm-bi-field">${tx('Cách chọn vị trí','Placement mode')}<select data-mc-mode><option value="after">${tx('Sau đoạn văn số…','After paragraph…')}</option><option value="cursor">${tx('Tại vị trí con trỏ','At text cursor')}</option></select></label>
 <label class="vm-bi-field" data-mc-position-label>${tx('Chèn sau đoạn','Insert after paragraph')}<select data-mc-position></select></label>
 <label class="vm-bi-field vm-mc-full">${tx('Link ảnh / video (HTTPS)','Image / video link (HTTPS)')}<input data-mc-url type="url" placeholder="https://..." autocomplete="off"></label>
 <label class="vm-bi-field">${tx('Chú thích (tùy chọn)','Caption (optional)')}<input data-mc-caption maxlength="180" placeholder="${tx('Mô tả ảnh / video','Describe the image or video')}"></label>
 <label class="vm-bi-field">${tx('Nguồn / Credit (tùy chọn)','Source / Credit (optional)')}<input data-mc-source maxlength="180" placeholder="VietMuse"></label>
 <label class="vm-bi-field vm-mc-full">${tx('Hoặc chọn file để upload','Or choose a file to upload')}<input data-mc-file type="file" accept="image/jpeg,image/png,image/webp"></label>
 </div>
 <div class="vm-mc-position-help" aria-live="polite" data-mc-counter></div>
 <details class="vm-bi-paragraph-map vm-mc-map" data-mc-map><summary>${tx('Xem và chọn đoạn văn','Preview and choose paragraph')}</summary><ol data-mc-outline></ol></details>
 <div class="vm-bi-toolbar"><button type="button" data-mc-insert="url" class="vm-bi-btn primary">+ ${tx('Chèn bằng link','Insert from link')}</button><button type="button" data-mc-insert="file" class="vm-bi-btn">↑ ${tx('Upload và chèn','Upload & insert')}</button></div>
 <p class="vm-bi-help" data-mc-message>${tx('Ảnh: JPG/PNG/WebP ≤ 2 MB. Video: MP4/WebM ≤ 25 MB. Video dạng link: YouTube, Vimeo hoặc HTTPS .mp4/.webm.','Images: JPG/PNG/WebP ≤ 2 MB. Videos: MP4/WebM ≤ 25 MB. Video links: YouTube, Vimeo, or HTTPS .mp4/.webm.')}</p>
 </article>`;
}
function toggleCard(c,collapsed){
 c.classList.toggle('vm-mc-collapsed',collapsed);
 const button=$('[data-mc-collapse]',c);
 button.setAttribute('aria-expanded',String(!collapsed));
 button.textContent=collapsed?tx('Mở rộng','Expand'):tx('Thu gọn','Collapse');
}
function bodyFor(c){return $(`[name="${$('[data-mc-lang]',c).value}_body"]`)}
function paragraphs(c){return root.VMParagraphTools?.findParagraphs(bodyFor(c)?.value||'')||[]}
function update(c){
 if(!c||c.dataset.mcInserted==='yes')return;
 const type=$('[data-mc-type]',c).value,mode=$('[data-mc-mode]',c).value,lang=$('[data-mc-lang]',c).value;
 $('[data-mc-file]',c).accept=type==='video'?'video/mp4,video/webm':'image/jpeg,image/png,image/webp';
 $('[data-mc-url]',c).placeholder=type==='video'?'https://youtu.be/... or https://.../clip.mp4':'https://.../image.webp';
 const p=paragraphs(c),pos=$('[data-mc-position]',c),old=Number(pos.value)||Number(c.dataset.mcPosition)||1,chosen=Math.min(Math.max(old,1),p.length||1);
 pos.innerHTML=p.map(x=>`<option value="${x.number}">${tx('Sau đoạn','After paragraph')} ${x.number} · ${esc(x.text.slice(0,66))}</option>`).join('');
 if(p.length)pos.value=String(chosen);
 c.dataset.mcPosition=String(chosen);pos.disabled=!p.length||mode!=='after';
 $('[data-mc-position-label]',c).hidden=mode!=='after';
 $('[data-mc-map]',c).hidden=mode!=='after';
 $('[data-mc-counter]',c).textContent=mode==='after'?tx(`${p.length} đoạn văn trong bản ${lang.toUpperCase()}. ${p.length?'Đang chọn đoạn '+chosen+'.':'Hãy nhập nội dung trước.'}`,`${p.length} paragraphs in ${lang.toUpperCase()}. ${p.length?'Selected paragraph '+chosen+'.':'Enter article text first.'}`):tx('Sẽ chèn tại vị trí con trỏ của vùng nội dung đã chọn.','Media will be inserted at the cursor of the chosen article body.');
 $('[data-mc-outline]',c).innerHTML=p.map(x=>`<li class="vm-bi-paragraph-row${chosen===x.number?' selected':''}"><button type="button" class="vm-bi-paragraph-choice" data-mc-pick="${x.number}" aria-pressed="${chosen===x.number?'true':'false'}"><span class="vm-bi-paragraph-number">${x.number}.</span><span class="vm-bi-paragraph-text">${esc(x.text.slice(0,160))}</span><span class="vm-bi-paragraph-action">${chosen===x.number?'✓':''}</span></button></li>`).join('')||`<li>${tx('Chưa có đoạn văn','No paragraphs yet')}</li>`;
}
async function upload(file,kind){
 const types=kind==='video'?{'video/mp4':'mp4','video/webm':'webm'}:{'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
 const max=kind==='video'?25*1024*1024:2*1024*1024;
 if(!file?.size)throw Error(tx('Hãy chọn file trước khi upload.','Choose a file first.'));
 if(!types[file.type]||file.size>max)throw Error(tx(`Định dạng hoặc dung lượng không hợp lệ (tối đa ${kind==='video'?25:2} MB).`,`Unsupported format or oversized file (max ${kind==='video'?25:2} MB).`));
 const user=ctx.user(),sb=ctx.client;
 if(!user?.id||!sb)throw Error(tx('Hãy đăng nhập tài khoản Editor/Admin.','Sign in with an editorial account.'));
 const bucket=kind==='video'?'news-videos':'news-covers';
 const key=`${user.id}/${crypto.randomUUID()}.${types[file.type]}`;
 const {error}=await sb.storage.from(bucket).upload(key,file,{contentType:file.type,cacheControl:'3600',upsert:false});
 if(error)throw Error(`${tx('Không upload được','Upload failed')} (${bucket}): ${error.message}`);
 const url=sb.storage.from(bucket).getPublicUrl(key).data.publicUrl;
 if(!url)throw Error('Storage did not return a public URL.');
 return url;
}
function inject(c,url){
 const kind=$('[data-mc-type]',c).value,lang=$('[data-mc-lang]',c).value,mode=$('[data-mc-mode]',c).value;
 const marker=root.VMStoryMedia.marker(kind,url,$('[data-mc-caption]',c).value,$('[data-mc-source]',c).value);
 const area=bodyFor(c);if(!area)throw Error('Article body missing.');
 if(mode==='after'){
   const number=Number($('[data-mc-position]',c).value);
   const result=root.VMParagraphTools.insertAfter(area.value,number,marker);
   area.value=result.value;area.focus();area.setSelectionRange(result.cursor,result.cursor);
 }else{
   const start=area.selectionStart??area.value.length,end=area.selectionEnd??area.value.length;
   area.setRangeText(`\n\n${marker}\n\n`,start,end,'end');area.focus();
 }
 area.dispatchEvent(new Event('input',{bubbles:true}));
 c.dataset.mcInserted='yes';
 $('.vm-mc-tag',c).textContent=tx('✓ Đã chèn vào bài','✓ Added to article');
 $('[data-mc-message]',c).textContent=tx('Đã chèn vào thân bài. Muốn thêm ảnh/video khác, bấm “+ Thêm ảnh/video” bên dưới. Xóa bảng này không xóa media đã chèn trong nội dung.','Inserted into article body. Click “+ Add image/video” for another. Removing this form will not delete the marker already added to the article.');
 $$('button[data-mc-insert]',c).forEach(b=>b.disabled=true);
 toggleCard(c,true);
 ctx.notify(tx(`${kind==='video'?'Video':'Ảnh'} đã được chèn vào bản ${lang.toUpperCase()}.`,`${kind==='video'?'Video':'Image'} inserted into the ${lang.toUpperCase()} version.`),'ok');
}
function bind(){const rootEl=$('#bi-media-composer');if(!rootEl)return;
 rootEl.innerHTML=`<div class="vm-mc-list" data-mc-list>${card()}</div><button class="vm-bi-btn vm-mc-add" type="button" data-mc-add>+ ${tx('Thêm ảnh/video?','Add another image/video?')}</button><p class="vm-bi-help">${tx('Có thể thêm nhiều khối media, mỗi khối chọn bản VI/EN và vị trí riêng. Cần bấm “Chèn” ở từng khối trước khi lưu bài. Video file cần chạy SQL 08; link YouTube/Vimeo không cần SQL 08.','Add as many media cards as needed, each with its own language and placement. Click Insert in each card before saving. Video file uploads require SQL 08; YouTube/Vimeo links do not.')}</p>`;
 $$('[data-mc-card]',rootEl).forEach(update);
 rootEl.addEventListener('click',async e=>{
   const t=e.target,add=t.closest('[data-mc-add]'),c=t.closest('[data-mc-card]');
   if(add){$('[data-mc-list]',rootEl).insertAdjacentHTML('beforeend',card());const n=$('[data-mc-card]:last-child',rootEl);update(n);n.scrollIntoView({block:'nearest',behavior:'smooth'});return;}
   if(!c)return;
   if(t.closest('[data-mc-collapse]')){toggleCard(c,!c.classList.contains('vm-mc-collapsed'));return;}
   if(t.closest('[data-mc-remove]')){c.remove();return;}
   const pick=t.closest('[data-mc-pick]');if(pick){c.dataset.mcPosition=pick.dataset.mcPick;$('[data-mc-position]',c).value=pick.dataset.mcPick;update(c);return;}
   const ins=t.closest('[data-mc-insert]');if(!ins||busy||c.dataset.mcInserted==='yes')return;
   busy=true;ins.disabled=true;
   try{
     const type=$('[data-mc-type]',c).value;
     if($('[data-mc-mode]',c).value==='after'&&!paragraphs(c).length)throw Error(tx('Hãy nhập ít nhất một đoạn văn trước khi chèn.','Enter at least one prose paragraph first.'));
     const url=ins.dataset.mcInsert==='file'?await upload($('[data-mc-file]',c).files?.[0],type):$('[data-mc-url]',c).value.trim();
     inject(c,url);
     if(ins.dataset.mcInsert==='file')$('[data-mc-url]',c).value=url;
   }catch(err){$('[data-mc-message]',c).textContent=err.message;ctx.notify(err.message,'error');}
   finally{busy=false;if(c.isConnected&&c.dataset.mcInserted!=='yes')ins.disabled=false;}
 });
 rootEl.addEventListener('change',e=>{
   const c=e.target.closest('[data-mc-card]');if(!c)return;
   if(e.target.matches('[data-mc-type]')){$('[data-mc-file]',c).value='';$('[data-mc-url]',c).value='';}
   if(e.target.matches('[data-mc-lang]'))c.dataset.mcPosition='1';
   if(e.target.matches('[data-mc-position]'))c.dataset.mcPosition=e.target.value;
   update(c);
 });
 for(const lang of ['vi','en'])$(`[name="${lang}_body"]`)?.addEventListener('input',()=>$$(`[data-mc-card]`,rootEl).filter(c=>$('[data-mc-lang]',c).value===lang).forEach(update));
}
root.VMArticleMediaComposer=Object.freeze({init(options){ctx=options;bind()}});
})(window);
