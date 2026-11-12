/* VietMuse V27: optional bilingual editorial polls. No direct poll-table writes. */
(()=>{'use strict';
const tx=(vi,en)=>window.VIETMUSE_LANG==='vi'?vi:en;
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
let client=null,group=null,existing=false,locked=false,loaded=true;
const el=q=>document.querySelector(q);
function optionRow(item={},i=0){return `<div class="vm-crowd-row" data-crowd-row>
  <span class="vm-crowd-position">${i+1}</span>
  <label class="vm-bi-field">${tx('Lựa chọn tiếng Việt','Vietnamese option')}<input data-crowd-vi maxlength="120" value="${esc(item.vi||'')}" ${locked?'readonly':''} placeholder="${tx('Ví dụ: Đồng ý','e.g. Đồng ý')}"></label>
  <label class="vm-bi-field">${tx('Lựa chọn tiếng Anh','English option')}<input data-crowd-en maxlength="120" value="${esc(item.en||'')}" ${locked?'readonly':''} placeholder="e.g. Agree"></label>
  ${locked?'':`<button type="button" class="vm-bi-btn vm-crowd-remove" data-crowd-remove aria-label="${tx('Xóa lựa chọn','Remove option')}">×</button>`}
</div>`}
function rows(items){el('#bi-crowd-rows').innerHTML=items.map(optionRow).join('');updateRows()}
function updateRows(){const set=[...document.querySelectorAll('[data-crowd-row]')];set.forEach((node,i)=>{node.querySelector('.vm-crowd-position').textContent=i+1;const remove=node.querySelector('[data-crowd-remove]');if(remove)remove.disabled=set.length<=2});const add=el('#bi-crowd-add');if(add)add.disabled=locked||set.length>=6}
function expanded(){el('#bi-crowd-fields').hidden=!el('#bi-crowd-enabled').checked}
function render(){const root=el('#bi-crowd-editor');if(!root)return;root.innerHTML=`<div class="vm-crowd-head"><div><h2 class="vm-bi-section-head">${tx('Crowd Poll · Bình chọn độc giả','Crowd Poll · Reader voting')}</h2><p class="vm-bi-help">${tx('Không bắt buộc. Một cuộc bình chọn dùng chung kết quả giữa hai bản VI/EN.','Optional. One poll shares results across both VI and EN versions.')}</p></div>
<label class="vm-crowd-toggle"><input id="bi-crowd-enabled" type="checkbox"> ${tx('Thêm Crowd Poll?','Add a Crowd Poll?')}</label></div>
<div id="bi-crowd-fields" hidden>
  <div class="vm-bi-grid">
    <label class="vm-bi-field">${tx('Câu hỏi tiếng Việt','Vietnamese question')}<textarea id="bi-crowd-qvi" maxlength="240" rows="2" placeholder="${tx('Bạn nghĩ gì về…?','Câu hỏi bằng tiếng Việt')}"></textarea></label>
    <label class="vm-bi-field">${tx('Câu hỏi tiếng Anh','English question')}<textarea id="bi-crowd-qen" maxlength="240" rows="2" placeholder="What do you think about…?"></textarea></label>
  </div>
  <p class="vm-bi-help">${tx('Nhập 2–6 đáp án, mỗi đáp án có cả bản Việt và Anh.','Add 2–6 choices, each with Vietnamese and English labels.')}</p>
  <div id="bi-crowd-rows" class="vm-crowd-rows"></div>
  <button type="button" id="bi-crowd-add" class="vm-bi-btn">+ ${tx('Thêm lựa chọn','Add another option')}</button>
  <p class="vm-bi-help" id="bi-crowd-lock" hidden>${tx('Bình chọn đã có người tham gia: không thể đổi câu hỏi/đáp án, chỉ có thể tắt poll.','This poll has votes; options and questions are locked. You may still disable it.')}</p>
  <p class="vm-bi-help">${tx('Tài khoản độc giả đã đăng nhập có thể chọn một đáp án và đổi lựa chọn sau đó. Kết quả là ý kiến tự nguyện, không phải khảo sát đại diện.','Signed-in readers can vote once and change their choice. Results reflect voluntary participation, not a representative survey.')}</p>
</div><p id="bi-crowd-error" class="vm-bi-help vm-crowd-error" role="status" hidden></p>`;
root.addEventListener('change',e=>{if(e.target.id==='bi-crowd-enabled')expanded()});
root.addEventListener('click',e=>{if(e.target.closest('#bi-crowd-add')){const all=[...document.querySelectorAll('[data-crowd-row]')];if(all.length<6){el('#bi-crowd-rows').insertAdjacentHTML('beforeend',optionRow({},all.length));updateRows()}return}const remove=e.target.closest('[data-crowd-remove]');if(remove&&document.querySelectorAll('[data-crowd-row]').length>2){remove.closest('[data-crowd-row]').remove();updateRows()}});
rows([{},{}]);expanded();}
async function init(args){client=args.client;group=args.group||null;existing=false;locked=false;loaded=true;render();if(!group)return;
const {data,error}=await client.rpc('news_crowd_editor_get',{p_group:group});
if(error){loaded=false;const message=el('#bi-crowd-error');if(message){message.hidden=false;message.textContent=tx('Chưa đọc được poll cũ. Cần chạy SQL 10 nếu muốn dùng Crowd Poll. Bài báo vẫn có thể lưu riêng.','Could not load existing poll. Run SQL 10 before using Crowd Poll; article editing remains available.')+' '+error.message;}return}
if(!data)return;existing=true;locked=Number(data.votes||0)>0;
el('#bi-crowd-enabled').checked=Boolean(data.enabled);
el('#bi-crowd-qvi').value=data.question_vi||'';
el('#bi-crowd-qen').value=data.question_en||'';
if(locked){el('#bi-crowd-qvi').readOnly=true;el('#bi-crowd-qen').readOnly=true;el('#bi-crowd-add').hidden=true;el('#bi-crowd-lock').hidden=false;}
rows(Array.isArray(data.choices)&&data.choices.length?data.choices:[{},{}]);expanded();}
function collect(){const on=Boolean(el('#bi-crowd-enabled')?.checked);if(!on)return {enabled:false};
if(!loaded)throw Error(tx('Không thể tải cấu hình poll. Kiểm tra SQL 10 trong Supabase.','Poll configuration unavailable. Check SQL 10 in Supabase.'));
const qvi=(el('#bi-crowd-qvi')?.value||'').trim(),qen=(el('#bi-crowd-qen')?.value||'').trim();
const choices=[...document.querySelectorAll('[data-crowd-row]')].map(x=>({vi:x.querySelector('[data-crowd-vi]').value.trim(),en:x.querySelector('[data-crowd-en]').value.trim()}));
if(qvi.length<8||qvi.length>240||qen.length<8||qen.length>240)throw Error(tx('Cần đủ hai câu hỏi VI/EN, 8–240 ký tự.','Both VI/EN poll questions must be 8–240 characters.'));
if(choices.length<2||choices.length>6||choices.some(c=>!c.vi||!c.en||c.vi.length>120||c.en.length>120))throw Error(tx('Cần 2–6 lựa chọn song ngữ (mỗi nhãn tối đa 120 ký tự).','Enter 2–6 bilingual choices (up to 120 characters each).'));
for(const lang of ['vi','en'])if(new Set(choices.map(c=>c[lang].toLocaleLowerCase())).size!==choices.length)throw Error(tx('Các lựa chọn không được trùng nhau.','Poll choices must be distinct.'));
return {enabled:true,question_vi:qvi,question_en:qen,choices};}
async function persist(newGroup,config){group=newGroup||group;if(!config?.enabled&&!existing)return;
if(!group)throw Error('Missing translation group for the article');
if(!loaded)throw Error(tx('Không thể kiểm tra poll hiện có; không ghi đè.','Cannot inspect existing poll; refusing to overwrite it.'));
const {error}=await client.rpc('news_crowd_save',{
  p_group:group,p_enabled:Boolean(config.enabled),p_question_vi:config.question_vi||'',
  p_question_en:config.question_en||'',p_choices:config.choices||[]
});if(error)throw Error(error.message);
existing=Boolean(config.enabled)||existing;
}
window.VMCrowdEditor={init,collect,persist};
})();
