/* VietMuse V5 — automatic homepage date + approximate IP weather.
 * The browser contacts ipwho.is on load, and Open-Meteo for current conditions.
 * No GPS permission, no city menu, no manual IP button, no location saved.
 */
(()=>{'use strict';
 const vi=()=>window.VIETMUSE_LANG==='vi';
 const words=(en,vn)=>vi()?vn:en;
 const $=s=>document.querySelector(s);
 const displayCity=name=>{if(!vi())return name;const key=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');return ({'hanoi':'Hà Nội','ha noi':'Hà Nội','ho chi minh city':'TP. Hồ Chí Minh','da nang':'Đà Nẵng'})[key]||name};
 const dateFormat=()=>new Intl.DateTimeFormat(vi()?'vi-VN':'en-GB',{
   weekday:'long',day:'numeric',month:'long',year:'numeric'
 }).format(new Date());
 let city='',coords=null,temp=null,weatherError=false,loading=true,requested=false;
 let refreshTimer=null;
 function widget(){return `<div class="home-context-bar" id="home-context-bar" aria-label="${words('Date and local weather','Ngày tháng và thời tiết địa phương')}">
   <div class="home-context-date"><span class="context-symbol" aria-hidden="true">◷</span><time id="home-context-date">${dateFormat()}</time></div>
   <span class="context-divider" aria-hidden="true"></span>
   <div class="home-context-weather" title="${words('Approximate location from IP. Your IP address is shared with ipwho.is; temperature is provided by Open-Meteo.','Vị trí ước tính theo IP. Địa chỉ IP của bạn được gửi đến ipwho.is; nhiệt độ được cung cấp bởi Open-Meteo.')}">
     <span class="context-symbol context-sun" aria-hidden="true">☀</span>
     <span id="home-context-weather" aria-live="polite">${words('Finding local weather…','Đang tải thời tiết địa phương…')}</span>
     <span class="context-approx" aria-label="${words('Approximate IP location','Vị trí ước tính theo IP')}">${words('IP estimate','Theo IP')}</span>
   </div>
 </div>`}
 function mount(){
   const d=$('#home-context-date');if(d){const now=new Date();d.textContent=dateFormat();d.dateTime=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`}
   const w=$('#home-context-weather');if(!w)return;
   if(weatherError){w.textContent=words('Weather unavailable','Không có dữ liệu thời tiết');return}
   if(temp!==null&&city){w.textContent=`${displayCity(city)} · ${Math.round(temp)}°C`;return}
   w.textContent=words('Finding local weather…','Đang tải thời tiết địa phương…');
 }
 function timeoutFetch(url,ms=7500){
   const controller=new AbortController();const tid=setTimeout(()=>controller.abort(),ms);
   return fetch(url,{signal:controller.signal,cache:'no-store'}).finally(()=>clearTimeout(tid));
 }
 async function getWeather(){
   if(!coords)return;
   try{
     const [lat,lon]=coords;
     const r=await timeoutFetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&temperature_unit=celsius`,8000);
     if(!r.ok)throw Error('weather status');
     const j=await r.json(), value=Number(j?.current?.temperature_2m);
     if(!Number.isFinite(value)||value < -100||value > 65)throw Error('invalid weather data');
     temp=value;weatherError=false;
   }catch(e){weatherError=true;temp=null}
   mount();
 }
 async function init(){
   mount();
   if(requested||!$('#home-context-bar'))return;
   requested=true;
   // This is IP-based, approximate geolocation, not browser GPS.
   try{
     const r=await timeoutFetch('https://ipwho.is/',7500);
     if(!r.ok)throw Error('ip service');
     const j=await r.json();
     if(j.success!==true)throw Error('ip location unavailable');
     const lat=Number(j.latitude),lon=Number(j.longitude);
     if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180)throw Error('invalid location');
     city=String(j.city||j.region||j.country||'').trim();
     if(!city)throw Error('city unavailable');
     coords=[lat,lon];
     await getWeather();
     refreshTimer=setInterval(()=>{if(!document.hidden)getWeather()},30*60*1000);
   }catch(e){weatherError=true;mount()}
 }
 document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
 // The editorial CMS may replace homepage markup after fetching posts.
 // Calling mount restores the previously fetched weather without another IP request.
 setInterval(()=>{if($('#home-context-date'))mount()},60*1000);
 window.VietMuseWeather={widget,mount};
})();
