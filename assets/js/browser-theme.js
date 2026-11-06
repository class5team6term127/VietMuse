/* VietMuse V19b — browser dark-extension compatible logo selector.
   Never inspect operating system prefers-color-scheme.
   Browser extensions do not provide a standard toggle API: measure actual page colors,
   including common Dark Reader markers.  Default to light where ambiguous.
*/
(()=>{'use strict';
  const LIGHT='./assets/images/vietmuse-mark-light.webp';
  const DARK='./assets/images/vietmuse-mark-dark.webp';
  const lum=c=>{const x=c.match(/^rgba?\(([^)]+)\)$/i);if(!x)return null;const v=x[1].split(/[\s,\/]+/).map(Number);if(v.length<3||v.slice(0,3).some(n=>!Number.isFinite(n)))return null;if(v.length>=4&&v[3]===0)return null;return (v[0]*.2126+v[1]*.7152+v[2]*.0722)/255;};
  function darkInjected(){
    if(document.querySelector('style.darkreader,link.darkreader,meta[name="darkreader"],.darkreader--proxy,.darkreader--fallback'))return true;
    const targets=[document.body,document.documentElement];
    for(const el of targets){if(!el)continue;
      const c=getComputedStyle(el),v=lum(c.backgroundColor);
      if(v!==null&&v<.42)return true;
    }
    return false;
  }
  function sync(){
    const url=darkInjected()?DARK:LIGHT;
    document.querySelectorAll('img[data-vm-light]').forEach(img=>{
      const path=img.getAttribute('src')||'';
      if(!path.endsWith(url.slice(2)))img.setAttribute('src',url);
    });
  }
  let queued=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync();});}
  document.addEventListener('DOMContentLoaded',()=>{
    sync();
    // Applied browser extension themes often insert style/link elements asynchronously.
    const observer=new MutationObserver(queue);
    observer.observe(document.documentElement,{childList:true,subtree:false,attributes:true,attributeFilter:['class','style']});
    if(document.head)observer.observe(document.head,{childList:true,subtree:false});
    if(document.body)observer.observe(document.body,{attributes:true,attributeFilter:['class','style']});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)queue();});
    window.addEventListener('focus',queue);
    window.setTimeout(queue,500);
  });
  window.VietMuseBrowserTheme={sync};
})();
