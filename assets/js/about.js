/* VietMuse V16 — dedicated bilingual About Us page. No database dependency. */
(()=>{
  'use strict';
  const en = {
    page:'About us', small:'CULTURE · HERITAGE · CONTEMPORARY LIFE',
    edition:'AN INTRODUCTION TO VIETMUSE',
    heroA:'The spirit', heroB:'of VietMuse.',
    heroHint:'A home for the stories behind the stories.',
    scroll:'Discover our story',
    note:'THE HEART OF OUR PUBLICATION',
    intro:'VietMuse is a bilingual publication and cultural platform dedicated to preserving and sharing the beating heart of Vietnamese art, heritage, and contemporary life. We believe that within every tradition, historical artifact, and modern movement lies a profound human narrative waiting to be explored.',
    mantra:'ART · HERITAGE · HUMAN STORIES',
    approachLabel:'01 / OUR APPROACH',
    approachHeadA:'Woven together', approachHeadB:'by culture.',
    approach:'Our team of researchers, writers, designers, and technologists collaborates across disciplines to bring VietMuse to life, crafting a dedicated space to honor and experience the depth of Vietnamese identity.',
    approachVisual:'THE MANY THREADS OF VIETNAM',
    approachTag:'A shared creative language',
    missionLabel:'02 / OUR MISSION',
    missionHeadA:'Look beyond', missionHeadB:'the headlines.',
    mission:'We cultivate a space for thoughtful, multi-dimensional long-form journalism and nuanced conversations. By publishing in both Vietnamese and English, we bridge local depth with a global perspective.',
    missionLeft:'ROOTED IN VIETNAM', missionRight:'OPEN TO THE WORLD',
    boardLabel:'03 / EDITORIAL BOARD',
    boardHeadA:'The voices', boardHeadB:'shaping VietMuse.',
    board:'Meet the minds driving our stories, explore our editorial standards, and discover how each contributor enriches our perspective. Full masthead and columnist profiles coming soon.',
    boardMark:'OUR COLLECTIVE CRAFT',
    roleOne:'Research', roleTwo:'Writing',roleThree:'Design',roleFour:'Technology',
    boardComing:'FULL MASTHEAD & COLUMNIST PROFILES · COMING SOON',
    endTop:'THE NEXT CHAPTER',endHeadA:'Every story has',endHeadB:'a soul.',
    endText:'Find the stories and perspectives that bring VietMuse to life.',
    cta:'Explore stories',forum:'Join the conversation',
    artCaption:'An editorial illustration inspired by Vietnam’s cultural heritage.',
    back:'Home'
  };
  const vi = {
    page:'Về chúng tôi', small:'VĂN HÓA · DI SẢN · ĐỜI SỐNG ĐƯƠNG ĐẠI',
    edition:'LỜI GIỚI THIỆU VỀ VIETMUSE',
    heroA:'Linh hồn', heroB:'của VietMuse.',
    heroHint:'Nơi lưu giữ câu chuyện đằng sau mỗi câu chuyện.',
    scroll:'Khám phá câu chuyện của chúng tôi',
    note:'TRÁI TIM CỦA ẤN PHẨM',
    intro:'VietMuse là một ấn phẩm song ngữ và nền tảng văn hóa, hướng đến việc gìn giữ và lan tỏa nhịp đập của nghệ thuật, di sản và đời sống đương đại Việt Nam. Chúng tôi tin rằng đằng sau mỗi truyền thống, hiện vật lịch sử và chuyển động hiện đại đều là một câu chuyện sâu sắc về con người đang chờ được khám phá.',
    mantra:'NGHỆ THUẬT · DI SẢN · CÂU CHUYỆN CON NGƯỜI',
    approachLabel:'01 / CÁCH TIẾP CẬN',
    approachHeadA:'Được dệt nên', approachHeadB:'từ văn hóa.',
    approach:'Đội ngũ nghiên cứu, người viết, nhà thiết kế và những người làm công nghệ của chúng tôi hợp tác liên ngành để tạo nên VietMuse, xây dựng một không gian chuyên biệt nhằm tôn vinh và cảm nhận chiều sâu bản sắc Việt Nam.',
    approachVisual:'NHỮNG SỢI CHỈ VĂN HÓA VIỆT NAM',
    approachTag:'Một ngôn ngữ sáng tạo chung',
    missionLabel:'02 / SỨ MỆNH',
    missionHeadA:'Nhìn xa hơn', missionHeadB:'những dòng tít.',
    mission:'Chúng tôi nuôi dưỡng một không gian cho những bài báo dài có chiều sâu, đa chiều và những cuộc đối thoại tinh tế. Bằng việc xuất bản bằng cả tiếng Việt và tiếng Anh, chúng tôi kết nối chiều sâu của góc nhìn địa phương với một tầm nhìn toàn cầu.',
    missionLeft:'BẮT RỄ TỪ VIỆT NAM', missionRight:'MỞ RA THẾ GIỚI',
    boardLabel:'03 / BAN BIÊN TẬP',
    boardHeadA:'Những tiếng nói', boardHeadB:'định hình VietMuse.',
    board:'Gặp gỡ những người làm nên các câu chuyện của chúng tôi, tìm hiểu các chuẩn mực biên tập và khám phá đóng góp của từng thành viên. Danh sách ban biên tập đầy đủ và hồ sơ các cây bút sẽ sớm được cập nhật.',
    boardMark:'NHỮNG LĨNH VỰC CỘNG TÁC',
    roleOne:'Nghiên cứu', roleTwo:'Viết bài',roleThree:'Thiết kế',roleFour:'Công nghệ',
    boardComing:'DANH SÁCH BAN BIÊN TẬP & HỒ SƠ CÂY BÚT · SẮP RA MẮT',
    endTop:'CHƯƠNG TIẾP THEO',endHeadA:'Mỗi câu chuyện',endHeadB:'đều có linh hồn.',
    endText:'Khám phá những câu chuyện và góc nhìn làm nên VietMuse.',
    cta:'Khám phá bài viết',forum:'Cùng chia sẻ góc nhìn',
    artCaption:'Minh họa biên tập lấy cảm hứng từ di sản văn hóa Việt Nam.',
    back:'Trang chủ'
  };
  const d = window.VIETMUSE_LANG === 'vi' ? vi : en;
  const e = str => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(){
    if(document.body.dataset.page!=='about')return;
    const root=document.getElementById('page-content');
    if(!root)return;
    document.title=`${d.page} | VietMuse`;
    root.innerHTML=`
      <div class="vm-about-page" id="vm-about-top">
        <div class="shell vm-about-breadcrumb"><a href="./index.html">${e(d.back)}</a><span aria-hidden="true">/</span><span>${e(d.page)}</span></div>
        <section class="vm-about-hero" aria-labelledby="vm-about-h1">
          <div class="vm-about-grain" aria-hidden="true"></div>
          <div class="shell vm-about-hero-inner">
            <div class="vm-about-hero-content">
              <p class="vm-about-eyebrow"><span class="vm-about-dot" aria-hidden="true"></span>${e(d.edition)}</p>
              <h1 id="vm-about-h1">${e(d.heroA)}<br><em>${e(d.heroB)}</em></h1>
              <div class="vm-about-hero-line" aria-hidden="true"></div>
              <p class="vm-about-hero-caption">${e(d.heroHint)}</p>
              <a class="vm-about-discover" href="#vm-about-intro">${e(d.scroll)} <span aria-hidden="true">↓</span></a>
            </div>
            <div class="vm-about-hero-art" aria-hidden="true">
              <div class="vm-about-ring ring-one"></div><div class="vm-about-ring ring-two"></div>
              <div class="vm-about-ring ring-three"></div>
              <div class="vm-about-logo-orbit"><img src="./assets/images/vietmuse-mark.webp" alt=""></div>
              <span class="vm-about-art-top">V M / 0 1</span><span class="vm-about-art-bottom">${e(d.small)}</span>
            </div>
          </div>
          <div class="vm-about-hero-foot shell"><span>VIETMUSE / 2026</span><span>${e(d.small)}</span></div>
        </section>
        <section class="shell vm-about-intro" id="vm-about-intro" aria-labelledby="vm-about-intro-h">
          <div class="vm-about-intro-label"><span class="vm-about-small-star" aria-hidden="true">✳</span><span id="vm-about-intro-h">${e(d.note)}</span></div>
          <p>${e(d.intro)}</p>
          <div class="vm-about-intro-end" aria-hidden="true">↗</div>
        </section>
        <div class="vm-about-marquee" aria-hidden="true"><span>${e(d.mantra)}</span><span class="vm-about-marquee-flower">✳</span><span>VIETMUSE</span></div>
        <section class="shell vm-about-section vm-about-approach" id="vm-about-approach" aria-labelledby="vm-about-approach-head">
          <div class="vm-about-section-copy">
            <p class="vm-about-number">${e(d.approachLabel)}</p>
            <h2 id="vm-about-approach-head">${e(d.approachHeadA)} <em>${e(d.approachHeadB)}</em></h2>
            <p class="vm-about-section-body">${e(d.approach)}</p>
            <div class="vm-about-section-rule"><span aria-hidden="true">✳</span><span>${e(d.approachTag)}</span></div>
          </div>
          <figure class="vm-about-visual">
            <img src="./assets/images/culture.svg" loading="lazy" alt="${e(d.artCaption)}">
            <figcaption><span>VIETMUSE / CULTURE</span><span>${e(d.approachVisual)}</span></figcaption>
          </figure>
        </section>
        <section class="vm-about-mission" id="vm-about-mission" aria-labelledby="vm-about-mission-head">
          <div class="shell vm-about-mission-inner">
            <div class="vm-about-mission-heading">
              <p class="vm-about-number">${e(d.missionLabel)}</p>
              <h2 id="vm-about-mission-head">${e(d.missionHeadA)}<br><em>${e(d.missionHeadB)}</em></h2>
              <div class="vm-about-mission-sigil" aria-hidden="true">✳</div>
            </div>
            <div class="vm-about-mission-right">
              <p>${e(d.mission)}</p>
              <div class="vm-about-mission-bridge"><span>${e(d.missionLeft)}</span><i aria-hidden="true"></i><span>${e(d.missionRight)}</span></div>
            </div>
          </div>
        </section>
        <section class="shell vm-about-board" id="vm-about-board" aria-labelledby="vm-about-board-head">
          <div class="vm-about-board-top"><div><p class="vm-about-number">${e(d.boardLabel)}</p><h2 id="vm-about-board-head">${e(d.boardHeadA)} <em>${e(d.boardHeadB)}</em></h2></div><span class="vm-about-board-monogram" aria-hidden="true">VM.</span></div>
          <div class="vm-about-board-content"><p>${e(d.board)}</p><div class="vm-about-roles" aria-label="${e(d.boardMark)}"><span>${e(d.roleOne)}</span><span>${e(d.roleTwo)}</span><span>${e(d.roleThree)}</span><span>${e(d.roleFour)}</span></div></div>
          <div class="vm-about-board-status"><span class="vm-about-status-dot" aria-hidden="true"></span>${e(d.boardComing)}</div>
        </section>
        <section class="vm-about-outro" aria-labelledby="vm-about-outro-head"><div class="shell vm-about-outro-inner"><div><p class="vm-about-eyebrow">${e(d.endTop)}</p><h2 id="vm-about-outro-head">${e(d.endHeadA)} <em>${e(d.endHeadB)}</em></h2><p>${e(d.endText)}</p></div><div class="vm-about-outro-actions"><a href="./index.html" class="vm-about-cta">${e(d.cta)} <span aria-hidden="true">↗</span></a><a class="vm-about-cta-secondary" href="./gui-bai.html">${e(d.forum)} <span aria-hidden="true">→</span></a></div></div></section>
      </div>`;
    // The site's language switcher reloads the page, so no extra UI event handlers needed.
  }
  document.addEventListener('DOMContentLoaded', render);
})();
