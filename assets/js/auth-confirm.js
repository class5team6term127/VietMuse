/* VietMuse V11 - browser-only Supabase email confirmation landing page.
   SECURITY: No secret or service-role key is required or permitted here.
   Never report verification as successful merely because a URL parameter exists.
*/
(()=>{'use strict';
const text={
 en:{
  checking:['Checking confirmation…','We are checking your email verification status.'],
  success:['Email verified successfully!','Your VietMuse account is verified. You can now sign in and return to the homepage.'],
  needsLogin:['Please sign in to VietMuse','The confirmation page has opened, but this browser cannot confirm your account status. If you already verified your email, sign in to continue.'],
  failed:['Confirmation link could not be verified','The link may be invalid or expired. Please return to the sign-in page and request a new confirmation email if needed.'],
  unavailable:['Verification check is unavailable','We could not connect to the authentication service. Check your connection, or sign in if your email was already verified.'],
  home:'Back to homepage',login:'Sign in',kicker:'VIETMUSE / ACCOUNT'
 },
 vi:{
  checking:['Đang kiểm tra xác minh…','VietMuse đang kiểm tra trạng thái xác minh email của bạn.'],
  success:['Xác minh tài khoản thành công!','Tài khoản VietMuse của bạn đã được xác minh. Mời bạn trở về trang chủ hoặc đăng nhập để tiếp tục.'],
  needsLogin:['Mời bạn đăng nhập VietMuse','Trang xác minh đã mở, nhưng trình duyệt này chưa kiểm tra được trạng thái tài khoản. Nếu bạn đã xác minh email, hãy đăng nhập để tiếp tục.'],
  failed:['Không thể xác minh liên kết','Liên kết có thể không hợp lệ hoặc đã hết hạn. Hãy trở lại trang đăng nhập và yêu cầu email xác minh mới nếu cần.'],
  unavailable:['Chưa thể kiểm tra xác minh','Không thể kết nối dịch vụ xác thực. Hãy kiểm tra mạng hoặc đăng nhập nếu email đã được xác minh.'],
  home:'Về trang chủ',login:'Đăng nhập',kicker:'VIETMUSE / TÀI KHOẢN'
 }
};
let locale='en',status='checking';
try{const saved=localStorage.getItem('vietmuse-lang');if(saved==='vi'||saved==='en')locale=saved;}catch{}
const el=id=>document.getElementById(id);
const show=()=>{const t=text[locale],pair=t[status]||t.needsLogin;
 document.documentElement.lang=locale;el('state-title').textContent=pair[0];el('state-message').textContent=pair[1];
 el('go-home').textContent=t.home;el('go-login').textContent=t.login;el('state-kicker').textContent=t.kicker;
 el('state-symbol').textContent=status==='success'?'✓':status==='failed'?'!':status==='checking'?'…':'i';
 document.title=pair[0]+' | VietMuse';
};
const setStatus=s=>{status=s;show()};
el('switch-lang').addEventListener('click',()=>{locale=locale==='en'?'vi':'en';try{localStorage.setItem('vietmuse-lang',locale)}catch{}show()});
show();
async function verify(){
 const qs=new URLSearchParams(location.search),hs=new URLSearchParams(location.hash.slice(1));
 // Supabase may put errors in either the query or URL fragment.
 if(qs.has('error')||qs.has('error_code')||hs.has('error')||hs.has('error_code'))return setStatus('failed');
 const cfg=window.COMMUNITY_CONFIG||{};
 if(!/^https:\/\/[^/]+\.supabase\.co\/?$/.test(cfg.supabaseUrl||'') || !cfg.publishableKey || !window.supabase?.createClient)return setStatus('unavailable');
 try{
  const client=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,{auth:{persistSession:true,detectSessionInUrl:true}});
  // Alternative custom email templates sometimes send a token hash directly.
  const tokenHash=qs.get('token_hash');
  if(tokenHash){
    const otpType=qs.get('type')==='email'?'email':'signup';
    const {error}=await client.auth.verifyOtp({token_hash:tokenHash,type:otpType});
    if(error)return setStatus('failed');
  }
  // getSession waits for redirect parameters to be handled by supabase-js;
  // getUser asks Supabase to validate the session, not just a URL claim.
  const sess=await client.auth.getSession();
  if(sess.error && (qs.has('code')||hs.has('access_token')))return setStatus('failed');
  const {data,error}=await client.auth.getUser();
  if(!error && data?.user && (data.user.email_confirmed_at || data.user.confirmed_at)){
    // Strip tokens from the address bar after processing.
    if(location.hash || qs.has('code') || qs.has('token_hash'))history.replaceState(null,'',location.pathname);
    return setStatus('success');
  }
  // No verified session visible to this browser: do not claim success.
  return setStatus('needsLogin');
 }catch(err){return setStatus('unavailable')}
}
verify();
})();
