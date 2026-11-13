/* Inversora · acceso social, passkeys y caducidad por inactividad */
(function(){
 'use strict';
 const IDLE_LIMIT=30*60*1000, KEY='inversora_last_activity_v1';
 const $=s=>document.querySelector(s);
 function style(){
  if(document.getElementById('invAuthEnhancementsStyle'))return;
  const s=document.createElement('style');s.id='invAuthEnhancementsStyle';
  s.textContent='.social-auth{display:grid;grid-template-columns:1fr 1fr;gap:10px}.social-auth>button{min-height:48px;padding:12px 15px;border:1px solid #dce7f7;border-radius:13px;background:#fff;color:#17396f;font-weight:750;display:flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 4px 12px rgba(24,67,137,.05)}.social-auth>button:hover{border-color:#9fc1ff;background:#f7faff}.social-auth-apple-mark{width:20px;height:20px;display:block;fill:#111}.social-auth-google-mark{width:20px;height:20px;display:block;flex:none}.social-auth-passkey{grid-column:1/-1;background:linear-gradient(135deg,#edf4ff,#fff)!important;color:#155eef!important}@media(max-width:520px){.social-auth{grid-template-columns:1fr}}';
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
   if(google&&!google.dataset.provider){google.dataset.provider='google';google.innerHTML='<svg class="social-auth-google-mark" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.65 5.94c4.46-4.12 7.13-10.2 7.13-17.59z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.65-5.94c-2.13 1.43-4.86 2.27-8.25 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span>Continuar con Google</span>'}
   if(!host.querySelector('[data-provider="apple"]')){
    const b=document.createElement('button');b.type='button';b.dataset.provider='apple';
    b.innerHTML='<svg class="social-auth-apple-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.365 1.43c0 1.14-.417 2.204-1.247 3.182-1.004 1.2-2.22 1.89-3.52 1.78a3.9 3.9 0 0 1-.03-.48c0-1.09.474-2.25 1.316-3.2.42-.48.955-.88 1.604-1.2.647-.31 1.26-.49 1.84-.52.017.15.037.3.037.44zM20.7 15.7c-.36.83-.79 1.59-1.29 2.29-.68.96-1.24 1.62-1.67 1.98-.66.61-1.36.92-2.11.94-.54 0-1.19-.15-1.94-.46-.75-.31-1.44-.46-2.07-.46-.66 0-1.37.15-2.13.46-.76.31-1.37.47-1.84.49-.72.03-1.44-.29-2.17-.97-.46-.39-1.04-1.08-1.74-2.06-.75-1.04-1.37-2.25-1.86-3.63-.52-1.49-.78-2.94-.78-4.34 0-1.6.35-2.98 1.06-4.14.56-.93 1.31-1.67 2.25-2.21.94-.54 1.96-.82 3.05-.84.6 0 1.38.18 2.35.54.97.36 1.59.54 1.87.54.21 0 .9-.21 2.06-.64 1.1-.4 2.03-.57 2.78-.51 2.05.17 3.59.97 4.62 2.42-1.83 1.11-2.74 2.66-2.74 4.64 0 1.55.56 2.84 1.67 3.86.5.45 1.06.8 1.67 1.03-.13.38-.27.74-.42 1.08z"/></svg><span>Continuar con Apple</span>';
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