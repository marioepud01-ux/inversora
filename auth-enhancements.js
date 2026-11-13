/* Inversora · accesos y caducidad por inactividad */
(function(){
 'use strict';
 const IDLE_LIMIT=30*60*1000, KEY='inversora_last_activity_v1';
 const label=p=>p==='apple'?'Apple':'Google';
 function addAppleButton(){
  const host=document.querySelector('#accountContent .social-auth');
  if(!host||host.querySelector('[data-provider="apple"]'))return;
  const b=document.createElement('button');
  b.type='button';b.dataset.provider='apple';b.className='social-auth-apple';
  b.innerHTML='<span class="social-auth-apple-mark" aria-hidden="true">●</span><span>Continuar con Apple</span>';
  b.addEventListener('click',()=>window.startSocialAuth('apple'));
  host.appendChild(b);
  const passkey=document.createElement('button');
  passkey.type='button';passkey.dataset.provider='passkey';passkey.className='social-auth-passkey';
  passkey.innerHTML='<span aria-hidden="true">⌁</span><span>Entrar con Face ID / huella</span>';
  passkey.addEventListener('click',signInWithPasskey);
  host.appendChild(passkey);
  if(!document.getElementById('invAuthEnhancementsStyle')){
   const s=document.createElement('style');s.id='invAuthEnhancementsStyle';
   s.textContent='.social-auth{display:grid;grid-template-columns:1fr 1fr;gap:10px}.social-auth>button,.social-auth-apple{min-height:48px;padding:12px 15px;border:1px solid #dce7f7;border-radius:13px;background:#fff;color:#17396f;font-weight:750;display:flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 4px 12px rgba(24,67,137,.05)}.social-auth>button:hover,.social-auth-apple:hover,.social-auth-passkey:hover{border-color:#9fc1ff;background:#f7faff}.social-auth-passkey{grid-column:1/-1;background:linear-gradient(135deg,#edf4ff,#fff)!important;color:#155eef!important}.social-auth-passkey>span:first-child{font-size:22px}.social-auth-apple-mark{font-size:19px;color:#101828}@media(max-width:520px){.social-auth{grid-template-columns:1fr}}';
   document.head.appendChild(s);
  }
 }
 if(typeof window.renderAccount==='function'){
  const original=window.renderAccount;
  window.renderAccount=async function(){const result=await original.apply(this,arguments);addAppleButton();addRegisterPasskeyButton();return result};
 }
 async function signInWithPasskey(){
  const msg=document.getElementById('authMessage');
  try{
   if(!invDb.auth.signInWithPasskey)throw new Error('Actualiza el servicio de autenticación o activa Passkeys en Supabase antes de usar esta opción.');
   if(msg){msg.className='auth-message';msg.textContent='Esperando la verificación biométrica del dispositivo…'}
   const {data,error}=await invDb.auth.signInWithPasskey();
   if(error)throw error;
   if(data?.user){invUser=data.user;localStorage.setItem(KEY,String(Date.now()));await invLoadProfile();await invLoadLists();await renderAccount();renderFavorites();refreshAccountNav();invNotice('Has iniciado sesión con tu passkey.')}
  }catch(e){if(msg){msg.className='auth-message';msg.textContent=/passkey_disabled/i.test(String(e?.message||''))?'El acceso biométrico todavía no está activado en Supabase.':'No se ha podido iniciar sesión con Face ID o huella. '+(e.message||'Inténtalo de nuevo.')}}
 }
 function addRegisterPasskeyButton(){
  const host=document.querySelector('#accountContent .profile-account-actions');
  if(!host||host.querySelector('[data-register-passkey]'))return;
  const b=document.createElement('button');b.type='button';b.className='secondary-action';b.dataset.registerPasskey='true';
  b.textContent='Configurar Face ID / huella';
  b.addEventListener('click',async()=>{
   b.disabled=true;b.textContent='Configurando…';
   try{
    if(!invDb.auth.registerPasskey)throw new Error('La versión actual de autenticación no admite passkeys.');
    const {data,error}=await invDb.auth.registerPasskey();if(error)throw error;
    invNotice('Acceso biométrico configurado. La próxima vez podrás entrar con Face ID, huella o el PIN del dispositivo.');
    b.textContent='Face ID / huella configurado';
   }catch(e){invNotice(/passkey_disabled/i.test(String(e?.message||''))?'Activa primero Passkeys en la configuración de autenticación de Supabase.':('No se ha podido configurar el acceso biométrico: '+(e.message||'Inténtalo de nuevo.')));b.disabled=false;b.textContent='Configurar Face ID / huella'}
  });
  host.prepend(b);
 }
 function signedIn(){return !!(typeof invUser!=='undefined'&&invUser);}
 function readTime(){const n=Number(localStorage.getItem(KEY));return Number.isFinite(n)&&n>0?n:0}
 function expireIfNeeded(){
  if(!signedIn())return false;
  const last=readTime();
  if(last&&Date.now()-last>=IDLE_LIMIT){expireSession();return true}
  return false;
 }
 let expiring=false;
 async function expireSession(){
  if(expiring||!signedIn())return;
  expiring=true;
  try{
   await invDb.auth.signOut();
   invUser=null;invProfile=null;invListsCache=[];
   localStorage.removeItem(KEY);
   if(typeof window.renderAccount==='function')await window.renderAccount();
   if(typeof window.renderFavorites==='function')window.renderFavorites();
   if(typeof window.refreshAccountNav==='function')window.refreshAccountNav();
   if(typeof window.invNotice==='function')window.invNotice('Tu sesión se ha cerrado por 30 minutos de inactividad. Vuelve a iniciar sesión para continuar.');
  }catch(e){console.error('Inactivity sign-out:',e)}finally{expiring=false}
 }
 function touch(){
  if(!signedIn())return;
  if(expireIfNeeded())return;
  localStorage.setItem(KEY,String(Date.now()));
 }
 ['pointerdown','keydown','touchstart','scroll','click'].forEach(type=>document.addEventListener(type,touch,{passive:true,capture:true}));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)expireIfNeeded()});
 window.addEventListener('focus',expireIfNeeded);
 window.addEventListener('storage',e=>{if(e.key===KEY)expireIfNeeded()});
 setInterval(expireIfNeeded,15000);
 if(typeof invDb!=='undefined'&&invDb?.auth?.onAuthStateChange){
  invDb.auth.onAuthStateChange((event,session)=>{
   if(session){
    const last=readTime();
    if(last&&Date.now()-last>=IDLE_LIMIT){expireSession();return}
    if(!last)localStorage.setItem(KEY,String(Date.now()));
   }else if(event==='SIGNED_OUT'){localStorage.removeItem(KEY)}
  });
 }
 // Apple and Google OAuth require their respective providers to be enabled in Supabase.
 if(typeof window.startSocialAuth==='function'){
  const originalSocial=window.startSocialAuth;
  window.startSocialAuth=async function(provider){
   const msg=document.getElementById('authMessage');
   if(msg)msg.textContent='Conectando con '+label(provider)+'…';
   try{
    const {error}=await invDb.auth.signInWithOAuth({provider,options:{redirectTo:window.location.origin}});
    if(error)throw error;
   }catch(e){
    if(msg){msg.className='auth-message';msg.textContent=/provider is not enabled/i.test(String(e?.message||''))?label(provider)+' todavía no está activado en Inversora. Hay que habilitar el proveedor y configurar sus credenciales en Supabase.':'No se ha podido iniciar el acceso con '+label(provider)+'. '+(e.message||'Inténtalo de nuevo.')}
   }
  };
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addAppleButton);else addAppleButton();
})();