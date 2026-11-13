/* Inversora · acceso social, passkeys y caducidad por inactividad */
(function(){
 'use strict';
 const IDLE_LIMIT=30*60*1000, KEY='inversora_last_activity_v1';
 const $=s=>document.querySelector(s);
 function style(){
  if(document.getElementById('invAuthEnhancementsStyle'))return;
  const s=document.createElement('style');s.id='invAuthEnhancementsStyle';
  s.textContent='.social-auth{display:grid;grid-template-columns:1fr 1fr;gap:10px}.social-auth>button{min-height:48px;padding:12px 15px;border:1px solid #dce7f7;border-radius:13px;background:#fff;color:#17396f;font-weight:750;display:flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 4px 12px rgba(24,67,137,.05)}.social-auth>button:hover{border-color:#9fc1ff;background:#f7faff}.social-auth-apple-mark{font-size:21px;color:#101828}.social-auth-google-mark{font-size:20px;font-weight:900;color:#4285f4}.social-auth-passkey{grid-column:1/-1;background:linear-gradient(135deg,#edf4ff,#fff)!important;color:#155eef!important}@media(max-width:520px){.social-auth{grid-template-columns:1fr}}';
  document.head.appendChild(s);
 }
 async function signInWithPasskey(){
  const msg=$('#authMessage');
  try{
   if(!invDb.auth.signInWithPasskey)throw new Error('Actualiza la librería de Supabase JS a la versión 2.105.0 o posterior y habilita Passkeys.');
   if(msg){msg.className='auth-message';msg.textContent='Esperando la verificación de Face ID, huella o PIN…'}
   const {error}=await invDb.auth.signInWithPasskey();
   if(error)throw error;
  }catch(e){
   if(msg){msg.className='auth-message';msg.textContent=/passkey_disabled/i.test(String(e?.message||''))?'Passkeys todavía no está activado en Supabase.':'No se ha podido iniciar sesión con el método biométrico. '+(e.message||'Inténtalo de nuevo.')}
  }
 }
 function addAuthButtons(){
  const host=$('#accountContent .social-auth');
  if(host){
   style();
   const google=host.querySelector('button');
   if(google&&!google.dataset.provider){google.dataset.provider='google';google.innerHTML='<span class="social-auth-google-mark" aria-hidden="true">G</span><span>Continuar con Google</span>'}
   if(!host.querySelector('[data-provider="apple"]')){
    const b=document.createElement('button');b.type='button';b.dataset.provider='apple';
    b.innerHTML='<span class="social-auth-apple-mark" aria-hidden="true"></span><span>Continuar con Apple</span>';
    b.addEventListener('click',()=>startSocialAuth('Apple'));host.appendChild(b);
   }
   if(!host.querySelector('[data-provider="passkey"]')){
    const b=document.createElement('button');b.type='button';b.dataset.provider='passkey';b.className='social-auth-passkey';
    b.innerHTML='<span aria-hidden="true">⌁</span><span>Entrar con Face ID / huella / PIN</span>';
    b.addEventListener('click',signInWithPasskey);host.appendChild(b);
   }
  }
  const actions=$('#accountContent .account-actions');
  if(actions&&typeof invUser!=='undefined'&&invUser&&!actions.querySelector('[data-register-passkey]')){
   const b=document.createElement('button');b.type='button';b.className='secondary-action';b.dataset.registerPasskey='true';b.textContent='Configurar Face ID / huella';
   b.addEventListener('click',async()=>{
    b.disabled=true;b.textContent='Configurando acceso biométrico…';
    try{
     if(!invDb.auth.registerPasskey)throw new Error('Actualiza la librería de Supabase JS a la versión 2.105.0 o posterior.');
     const {error}=await invDb.auth.registerPasskey();if(error)throw error;
     invNotice('Acceso biométrico configurado. La próxima vez podrás entrar con Face ID, huella o PIN.');
     b.textContent='Acceso biométrico configurado';
    }catch(e){invNotice(/passkey_disabled/i.test(String(e?.message||''))?'Passkeys todavía no está activado en Supabase.':('No se ha podido configurar el acceso biométrico: '+(e.message||'Inténtalo de nuevo.')));b.disabled=false;b.textContent='Configurar Face ID / huella'}
   });
   actions.prepend(b);
  }
 }
 function signedIn(){return typeof invUser!=='undefined'&&!!invUser}
 function readTime(){const n=Number(localStorage.getItem(KEY));return Number.isFinite(n)&&n>0?n:0}
 let expiring=false;
 async function expireSession(){
  if(expiring||!signedIn())return;
  expiring=true;
  try{
   await invDb.auth.signOut();
   localStorage.removeItem(KEY);
   invUser=null;invProfile=null;invListsCache=[];
   if(typeof renderAccount==='function')renderAccount();
   if(typeof renderFavorites==='function')renderFavorites();
   refreshAccountNav();
   invNotice('Tu sesión se ha cerrado por 30 minutos de inactividad. Vuelve a iniciar sesión para continuar.');
  }catch(e){console.error('Inversora inactivity sign-out:',e)}
  finally{expiring=false}
 }
 function expireIfNeeded(){
  if(!signedIn())return false;
  const last=readTime();
  if(last&&Date.now()-last>=IDLE_LIMIT){expireSession();return true}
  return false;
 }
 function touch(){
  if(!signedIn()||expireIfNeeded())return;
  localStorage.setItem(KEY,String(Date.now()));
 }
 ['pointerdown','keydown','touchstart','scroll','click'].forEach(type=>document.addEventListener(type,touch,{passive:true,capture:true}));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)expireIfNeeded()});
 window.addEventListener('focus',expireIfNeeded);
 window.addEventListener('storage',e=>{if(e.key===KEY)expireIfNeeded()});
 setInterval(expireIfNeeded,15000);
 if(typeof invDb!=='undefined'&&invDb.auth?.onAuthStateChange){
  invDb.auth.onAuthStateChange((event,session)=>{
   if(session){
    const last=readTime();
    if(last&&Date.now()-last>=IDLE_LIMIT){expireSession();return}
    if(!last)localStorage.setItem(KEY,String(Date.now()));
   }else if(event==='SIGNED_OUT'){localStorage.removeItem(KEY)}
  });
 }
 // renderAccount replaces its HTML; observe it so the access buttons persist after every render.
 const target=$('#accountContent');
 if(target)new MutationObserver(addAuthButtons).observe(target,{childList:true,subtree:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addAuthButtons);else addAuthButtons();
})();