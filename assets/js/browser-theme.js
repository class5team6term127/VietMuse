/* VietMuse V19c — logo contrast for browser-level dark browsing.
   Auto-detects CSS-based dark modes. Browser native forced-dark compositor may
   not expose its state to websites: a logo-only override is provided.
   Does not read operating-system color scheme or recolor the website. */
(()=>{'use strict';
 const PATH='./assets/images/';
 const LIGHT=PATH+'vietmuse-mark-light.webp';
 const DARK=PATH+'vietmuse-mark-dark.webp';
 const KEY='vietmuse-logo-mode-v19c';
 const allowed=['auto','dark','light'];
 let setting='auto',effective='light',waiting=false;
 try{const s=localStorage.getItem(KEY);if(allowed.includes(s))setting=s;}catch{}
 const luminance=(value)=>{
   const m=/^rgba?\(([^)]+)\)$/i.exec(value||'');
   if(!m)return null;
   const parts=m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
   if(parts.length<3 || parts.slice(0,3).some(n=>!Number.isFinite(n)))return null;
   if(parts.length>3&&parts[3]<.1)return null;
   // Relative approximation is enough to distinguish dark from light surfaces.
   return (.2126*parts[0]+.7152*parts[1]+.0722*parts[2])/255;
 };
 const hasExtensionMarker=()=>!!document.querySelector(
   'style.darkreader,link.darkreader,meta[name="darkreader"],.darkreader--proxy,.darkreader--fallback,html[data-darkreader-mode],body.dark-mode'
 );
 function browserIsDark(){
   if(hasExtensionMarker())return true;
   for(const selector of ['body','html','.masthead','.home','.inner-page']){
     const el=document.querySelector(selector);if(!el)continue;
     const level=luminance(getComputedStyle(el).backgroundColor);
     if(level!==null && level<.38)return true;
     if(level!==null && level>.72 && (selector==='body'||selector==='html'))return false;
   }
   return false;
 }
 const lang=()=>window.VIETMUSE_LANG==='vi'?'vi':'en';
 const label=()=>{
   const vi=lang()==='vi';
   return setting==='auto'?(vi?'Logo: tự động':'Logo: auto'):
     setting==='dark'?(vi?'Logo: bản tối':'Logo: dark version'):
     (vi?'Logo: bản sáng':'Logo: light version');
 };
 function sync(){
   effective=setting==='auto'?(browserIsDark()?'dark':'light'):setting;
   const path=effective==='dark'?DARK:LIGHT;
   document.documentElement.dataset.vmLogoTheme=effective;
   document.querySelectorAll('img[data-vm-light][data-vm-dark]').forEach(img=>{
     if((img.getAttribute('src')||'')!==path){img.src=path;}
   });
   document.querySelectorAll('[data-vm-logo-mode]').forEach(button=>{
     const txt=label();
     button.setAttribute('aria-label',txt+'. '+(lang()==='vi'?'Nhấn để đổi chế độ logo.':'Press to cycle logo modes.'));
     button.setAttribute('title',txt+' · '+(lang()==='vi'?'Tự động → Tối → Sáng':'Auto → Dark → Light'));
     button.dataset.logoMode=setting;
     const text=button.querySelector('.vm-logo-mode-text');
     if(text)text.textContent=setting==='auto'?'Auto':(setting==='dark'?'Dark':'Light');
     button.setAttribute('aria-pressed',setting==='dark'?'true':'false');
   });
 }
 function queue(){if(waiting)return;waiting=true;requestAnimationFrame(()=>{waiting=false;sync();});}
 function cycle(){setting=setting==='auto'?'dark':setting==='dark'?'light':'auto';
   try{if(setting==='auto')localStorage.removeItem(KEY);else localStorage.setItem(KEY,setting);}catch{}
   sync();
 }
 function init(){
   sync();
   document.addEventListener('click',e=>{if(e.target.closest('[data-vm-logo-mode]'))cycle();});
   const obs=new MutationObserver(queue);
   obs.observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme','data-darkreader-mode']});
   if(document.head)obs.observe(document.head,{childList:true,subtree:false});
   if(document.body)obs.observe(document.body,{attributes:true,attributeFilter:['class','style','data-theme']});
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)queue();});
   window.addEventListener('focus',queue);
   window.addEventListener('pageshow',queue);
   // A few extensions apply styles asynchronously or only after browser interaction.
   setTimeout(queue,250);setTimeout(queue,1200);
   setInterval(()=>{if(setting==='auto' && !document.hidden)queue();},3500);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.VietMuseBrowserTheme={sync,setMode:(m)=>{if(allowed.includes(m)){setting=m;sync();}},getMode:()=>setting};
})();
