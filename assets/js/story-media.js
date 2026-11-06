/* VietMuse V17: safe, reusable article media URLs and marker helpers.
   Never embed arbitrary iframes supplied by article authors. */
(function(root){
  'use strict';
  const id=/^[A-Za-z0-9_-]{11}$/;
  const digits=/^[0-9]{1,18}$/;
  function videoInfo(raw){
    let u;try{u=new URL(String(raw||''));}catch{return null;}
    if(u.protocol!=='https:'||u.username||u.password)return null;
    const host=u.hostname.toLowerCase().replace(/^www\./,'');
    let v=null;
    if(host==='youtu.be')v=u.pathname.split('/')[1];
    if(['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(host)){
      const seg=u.pathname.split('/').filter(Boolean);
      v=seg[0]==='watch'?u.searchParams.get('v'):(['shorts','live','embed'].includes(seg[0])?seg[1]:null);
    }
    if(v&&id.test(v))return {kind:'iframe',src:`https://www.youtube-nocookie.com/embed/${v}`,provider:'YouTube'};
    if(['vimeo.com','player.vimeo.com'].includes(host)){
      const parts=u.pathname.split('/').filter(Boolean);
      const candidate=parts.find(x=>digits.test(x));
      if(candidate)return {kind:'iframe',src:`https://player.vimeo.com/video/${candidate}`,provider:'Vimeo'};
    }
    if(/\.(mp4|webm)$/i.test(u.pathname)){
      return {kind:'file',src:u.href,provider:'Video'};
    }
    return null;
  }
  function cleanText(value){return String(value??'').trim().replace(/[|\]\r\n]/g,' ').replace(/\s+/g,' ').slice(0,180)}
  function marker(kind,url,caption,source){
    const type=kind==='video'?'video':kind==='image'?'image':null;
    let u;try{u=new URL(String(url||'').trim())}catch{throw Error('A valid HTTPS media URL is required.');}
    if(!type||u.protocol!=='https:'||u.username||u.password||!u.host||/[|\]\s]/.test(u.href))throw Error('A valid HTTPS media URL is required.');
    if(type==='video'&&!videoInfo(u.href))throw Error('Video URL must be YouTube, Vimeo, or a direct .mp4/.webm HTTPS link.');
    return `[[${type}|${u.href}|${cleanText(caption)}|${cleanText(source)}]]`;
  }
  root.VMStoryMedia=Object.freeze({videoInfo,marker});
})(window);
