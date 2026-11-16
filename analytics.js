/* Inversora · analítica propia, anónima y con consentimiento */
(function(){
 'use strict';
 const CONSENT_KEY='inv_analytics_consent_v1', VISITOR_KEY='inv_analytics_visitor_v1', SESSION_KEY='inv_analytics_session_v1';
 const URL='https://uljmihttgktaidoreopk.supabase.co';
 const KEY='sb_publishable_oY8SaiUn6UWDs-ysKpv8ng__zZ1b1no';
 let client=null, lastView='', consented=false;
 const uuid=()=>window.crypto?.randomUUID?.()||('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16)}));
 function getClient(){if(!client&&window.supabase?.createClient)client=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});return client}
 function sourceName(){try{const h=new URL(document.referrer).hostname.replace(/^www\./,'');if(!h)return'direct';if(/google\./i.test(h))return'Google';if(/bing\./i.test(h))return'Bing';if(/linkedin\./i.test(h))return'LinkedIn';if(/facebook\.|instagram\./i.test(h))return'Social';if(h===location.hostname)return'direct';return h.slice(0,80)}catch(_){return'direct'}}
 function identity(){let visitor=localStorage.getItem(VISITOR_KEY),session=sessionStorage.getItem(SESSION_KEY);if(!visitor){visitor=uuid();localStorage.setItem(VISITOR_KEY,visitor)}if(!session){session=uuid();sessionStorage.setItem(SESSION_KEY,session)}return{visitor,session}}
 async function track(eventName,extra={}){
  if(!consented)return;
  const db=getClient();if(!db)return;
  const ids=identity();
  const payload={event_name:eventName,visitor_id:ids.visitor,session_id:ids.session,page_path:location.pathname||'/',page_title:(document.title||'').slice(0,160),source:sourceName(),asset_name:extra.asset_name?String(extra.asset_name).slice(0,160):null};
  try{const {error}=await db.from('analytics_events').insert(payload);if(error)console.debug('Inversora analytics:',error.message)}catch(e){console.debug('Inversora analytics unavailable',e)}
 }
 function showConsent(){
  if(document.getElementById('invAnalyticsConsent'))return;
  const el=document.createElement('aside');el.id='invAnalyticsConsent';el.setAttribute('aria-label','Preferencias de analítica');
  el.innerHTML='<div class="inv-analytics-copy"><strong>Ayúdanos a mejorar Inversora</strong><span>Si aceptas, utilizaremos analítica propia y anónima para medir visitas y uso de las herramientas. No registramos tu nombre, correo ni el contenido que escribes.</span><a href="/#privacy" aria-label="Consultar privacidad">Privacidad</a></div><div class="inv-analytics-actions"><button type="button" data-choice="reject">Ahora no</button><button type="button" data-choice="accept">Aceptar analítica</button></div>';
  const css=document.createElement('style');css.textContent='#invAnalyticsConsent{position:fixed;z-index:9998;left:18px;right:18px;bottom:18px;max-width:760px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:17px 19px;background:#fff;border:1px solid #dce7f7;border-radius:18px;box-shadow:0 16px 50px #102a5630;font:14px/1.45 Inter,system-ui,sans-serif;color:#17345f}#invAnalyticsConsent .inv-analytics-copy{display:grid;gap:4px;min-width:0}#invAnalyticsConsent strong{font-size:14px}#invAnalyticsConsent span{font-size:12px;color:#667895}#invAnalyticsConsent a{font-size:12px;color:#155eef;text-decoration:none;font-weight:700}#invAnalyticsConsent .inv-analytics-actions{display:flex;gap:8px;flex:none}#invAnalyticsConsent button{border:1px solid #dce7f7;border-radius:10px;padding:10px 12px;background:#f5f8fe;color:#31527f;font-weight:750;white-space:nowrap}#invAnalyticsConsent button[data-choice=accept]{background:#155eef;color:#fff;border-color:#155eef}@media(max-width:640px){#invAnalyticsConsent{left:10px;right:10px;bottom:10px;display:grid;gap:12px;padding:15px}#invAnalyticsConsent .inv-analytics-actions{display:grid;grid-template-columns:1fr 1fr}#invAnalyticsConsent button{padding:11px 8px}}';
  document.head.appendChild(css);document.body.appendChild(el);
  el.addEventListener('click',e=>{const b=e.target.closest('button[data-choice]');if(!b)return;const accepted=b.dataset.choice==='accept';localStorage.setItem(CONSENT_KEY,accepted?'accepted':'rejected');el.remove();consented=accepted;if(accepted){track('session_start');track('page_view')}});
 }
 function currentView(){
  const visible=[...document.querySelectorAll('main.view:not(.hidden)')].find(x=>x.id);
  if(!visible)return location.hash==='#privacy'?'privacy':'home';
  return visible.id;
 }
 function trackView(){
  const view=currentView();if(view===lastView)return;lastView=view;
  const title=({home:'Inicio',explore:'Explorar',detail:'Ficha de activo',favorites:'Favoritos',tools:'Herramientas',community:'Comunidad',account:'Mi cuenta',compare:'Comparador',sim:'Simulador',glossary:'Glosario financiero',privacy:'Privacidad',terms:'Términos'})[view]||view;
  const titleNode=document.querySelector('main.view:not(.hidden) h1');
  const pageTitle=titleNode?.textContent?.trim()||title;
  const original=document.title;document.title='Inversora | '+pageTitle;
  track('page_view');
 }
 function install(){
  const saved=localStorage.getItem(CONSENT_KEY);
  consented=saved==='accepted';
  if(!saved)showConsent();
  if(consented){track('session_start');track('page_view')}
  const app=document.querySelector('.app')||document.body;
  new MutationObserver(()=>{if(consented)trackView()}).observe(app,{subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',e=>{
   const b=e.target.closest('button');
   if(!b||!consented)return;
   if(b.matches('.fp-save')){const modal=document.getElementById('favPickerModal');if(modal){const creating=!!modal.querySelector('#fpCreatePanel:not([hidden])');const watch=new MutationObserver(()=>{if(!document.getElementById('favPickerModal')){watch.disconnect();track('favorite_saved');if(creating)track('list_created')}});watch.observe(document.body,{childList:true})}}
   if(b.matches('.apply-filters')||b.matches('.quick-search button'))track('search_used');
  });
  const wrap=(name,event,assetArg)=>{const original=window[name];if(typeof original!=='function'||original.__invAnalyticsWrapped)return;const fn=function(){const args=arguments;const result=original.apply(this,args);try{track(event,assetArg?{asset_name:assetArg(args)}:{})}catch(_){}return result};fn.__invAnalyticsWrapped=true;window[name]=fn};
  wrap('openDetail','asset_opened',a=>a[0]);
  wrap('simulateInvestment','simulator_used',a=>({asset_name:a[0]}).asset_name);
  wrap('startCompare','compare_used');
  wrap('publishCommunityPost','community_posted');
  wrap('invSubmitAssetReview','review_submitted');
  const search=document.getElementById('exploreSearch');if(search)search.addEventListener('change',()=>track('search_used'));
  if(consented)setTimeout(trackView,400);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();