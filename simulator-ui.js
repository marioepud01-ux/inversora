/* Inversora · interfaz del simulador de dinero neto real */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const engine=window.InversoraNetEngine;
let fiscalConfig=null,selectedScenario='base',currentResult=null,currentAsset=null,compareResults=[],assetCategoryFilter='';
const fmt=n=>Number(n||0).toLocaleString('es-ES',{minimumFractionDigits:0,maximumFractionDigits:2});
const euro=n=>Number(n||0).toLocaleString('es-ES',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:0});
const pct=n=>Number(n||0).toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:2})+' %';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=id=>engine.number($(id)?.value??'');
function toast(message){const old=$('netSimToast');if(old)old.remove();const el=document.createElement('div');el.id='netSimToast';el.className='net-sim-toast';el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),2600)}
function assetList(){
 if(typeof catalogTypeNames!=='undefined'&&Array.isArray(catalogTypeNames)&&catalogTypeNames.length){
  return catalogTypeNames.map(item=>{
   const generalDefault=(item.cat==='Inmobiliario'&&(item.sub==='Inmueble directo'||item.sub==='Terrenos'))||
    (item.cat==='Empresas y negocios'&&(item.sub==='Negocio propio'||item.sub==='Negocios digitales'||item.sub==='Intangibles y capital humano'))||
    (item.cat==='Mercados financieros'&&item.sub==='Previsión y seguros de ahorro');
   const fiscalText=generalDefault?'IRPF: base general; rendimientos del capital inmobiliario o actividad económica, según el caso.':'IRPF: intereses, dividendos o ganancias patrimoniales en base del ahorro, según el instrumento.';
   const fiscalDetail=generalDefault?'Tributación orientativa: base general del IRPF; el tratamiento concreto depende de si existe alquiler, actividad económica, prestación o transmisión.':'Tributación orientativa: base del ahorro del IRPF para intereses, dividendos o ganancias patrimoniales; comprobar la naturaleza exacta del producto y del cobro.';
   return {name:item.name,cat:item.cat,catalogSubtype:item.sub,ret:typeof catalogReturnRange==='function'?catalogReturnRange(item.name,item.cat,item.sub):'2% – 7%',tax:fiscalText,taxdetail:fiscalDetail};
  });
 }
 const source=Array.isArray(window.investments)?window.investments:(typeof investments!=='undefined'?investments:[]);
 const unique=new Map();
 source.forEach(a=>{const key=String(a.name||'').trim().toLocaleLowerCase('es');if(key&&!unique.has(key))unique.set(key,a);});
 return [...unique.values()];
}
function normalizeAssetSearch(value){
 return String(value||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
const assetSearchAliases={
 casa:'vivienda pisos residenciales', piso:'vivienda casa residencial', apartamento:'vivienda casa residencial',
 parking:'plaza garaje aparcamiento', aparcamiento:'plaza garaje parking', garaje:'plaza aparcamiento parking',
 trastero:'almacenamiento guardamuebles', local:'locales comerciales negocio',
 bolsa:'acciones renta variable mercados financieros', acciones:'accion renta variable bolsa',
 fondos:'fondo inversion indexados gestion activa', fondo:'fondos inversion indexados',
 bono:'bonos renta fija deuda', letras:'letras tesoro renta fija', deposito:'depositos ahorro bancario',
 cripto:'criptoactivos criptomoneda bitcoin ethereum', criptomoneda:'cripto criptoactivos bitcoin ethereum', crypto:'cripto criptoactivos bitcoin ethereum',
 oro:'materias primas metales preciosos lingotes', web:'pagina web negocio digital',
 empresa:'empresas negocio participaciones empresariales', startup:'startups venture capital'
};
function assetSearchText(asset){
 const base=[asset?.name,categoryOf(asset),subtypeOf(asset)].join(' ');
 const normalized=normalizeAssetSearch(base);
 const aliases=Object.entries(assetSearchAliases).filter(([key])=>normalized.split(' ').includes(key)).map(([,value])=>value).join(' ');
 return normalizeAssetSearch(base+' '+aliases);
}
function assetSearchScore(asset,query){
 const q=normalizeAssetSearch(query),name=normalizeAssetSearch(asset?.name),hay=assetSearchText(asset);
 if(!q)return 0;
 if(name===q)return 1000;
 if(name.startsWith(q))return 800;
 if(name.includes(q))return 650;
 const tokens=q.split(' ').filter(Boolean);
 const tokenMatches=token=>hay.includes(token)||(assetSearchAliases[token]||'').split(' ').some(alias=>alias&&hay.includes(alias));
 if(tokens.every(tokenMatches))return 400+tokens.length;
 return -1;
}
function findAsset(name){return assetList().find(a=>a.name===name)||null}
function rangeFor(asset){
 if(!asset)return {min:5,base:5,max:5};
 const matches=[...String(asset.ret||'').matchAll(/(-?\d+(?:[.,]\d+)?)\s*%/g)].map(m=>Number(m[1].replace(',','.'))).filter(Number.isFinite);
 if(!matches.length)return {min:5,base:5,max:5};
 const min=Math.min(...matches),max=Math.max(...matches);
 return {min,base:(min+max)/2,max};
}
function scenarioRate(asset,scenario=selectedScenario){
 const r=rangeFor(asset);return scenario==='prudente'?r.min:scenario==='optimista'?r.max:r.base;
}
function feeFromText(text){
 const matches=[...String(text||'').matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)].map(m=>Number(m[1].replace(',','.'))).filter(Number.isFinite);
 if(!matches.length)return {value:0,known:false};
 return {value:matches.reduce((a,b)=>a+b,0)/matches.length,known:true};
}
function assetDefaults(asset){
 const entry=feeFromText(asset?.entrycosts),annual=feeFromText(asset?.costs),extra=String(asset?.costsextra||''),exit=/(salida|venta|reembolso|transmisi[oó]n|cancelaci[oó]n|liquidaci[oó]n)/i.test(extra)?feeFromText(extra):{value:0,known:false};
 return {entryFee:entry.value,annualFee:annual.value,exitFee:exit.value,known:entry.known||annual.known||exit.known};
}
function isRentalAsset(asset){return asset?.cat==='Inmobiliario'&&/(vivienda|local(es)? comerciales|plaza(s)? de garaje|trastero|oficina|nave(s)? industriales|edificio|inmueble(s)? tur[ií]stico)/i.test(asset.name||'')}
function catalogMetaFor(asset){
 const name=String(asset?.name||'').toLocaleLowerCase('es');
 return typeof catalogTypeNames!=='undefined'?catalogTypeNames.find(x=>String(x.name).toLocaleLowerCase('es')===name)||null:null;
}
function categoryOf(asset){return catalogMetaFor(asset)?.cat||asset?.cat||'Otros'}
function subtypeOf(asset){return catalogMetaFor(asset)?.sub||asset?.catalogSubtype||(typeof subtypeFor==='function'?subtypeFor(asset):'')||asset?.subtype||'Otros'}
function populateAssetOptions(query='',open=false){
 const select=$('netAsset'),keep=select?.value||'Fondos indexados';if(!select)return;
 const q=query.trim().toLocaleLowerCase('es');
 select.innerHTML='';
 const manual=document.createElement('option');manual.value='__manual__';manual.textContent='Rentabilidad manual';select.appendChild(manual);
 const sorted=assetList().slice().sort((a,b)=>categoryOf(a).localeCompare(categoryOf(b),'es')||subtypeOf(a).localeCompare(subtypeOf(b),'es')||a.name.localeCompare(b.name,'es'));
 sorted.forEach(a=>{const opt=document.createElement('option');opt.value=a.name;opt.textContent=a.name;select.appendChild(opt);});
 if([...select.options].some(o=>o.value===keep))select.value=keep;
 else if(!q&&select.options.length>1)select.value=findAsset('Fondos indexados')?'Fondos indexados':sorted[0]?.name||'__manual__';
 else select.value='__manual__';
 renderAssetPicker(q,open);
}
function renderAssetPicker(query='',open=false){
 const input=$('netAssetSearch'),panel=$('netAssetResults'),clear=$('netAssetSearchClear'),select=$('netAsset');
 if(!input||!panel||!select)return;
 const q=String(query||'').trim();
 input.setAttribute('aria-expanded',String(!!open));clear.hidden=!input.value;
 if(!open){panel.hidden=true;panel.innerHTML='';return;}
 const all=assetList().slice().sort((a,b)=>categoryOf(a).localeCompare(categoryOf(b),'es')||subtypeOf(a).localeCompare(subtypeOf(b),'es')||a.name.localeCompare(b.name,'es'));
 const scoped=assetCategoryFilter?all.filter(a=>categoryOf(a)===assetCategoryFilter):all;
 const matches=q?scoped.map(a=>({asset:a,score:assetSearchScore(a,q)})).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score||a.asset.name.localeCompare(b.asset.name,'es')).map(x=>x.asset):scoped;
 const categories=[...new Set(all.map(categoryOf))].sort((a,b)=>a.localeCompare(b,'es'));
 const shown=q?matches.slice(0,30):matches;
 let content='<div class="net-asset-explore"><div class="net-asset-explore-heading"><small>EXPLORAR POR CATEGORÍA</small><span>'+all.length+' activos</span></div><div class="net-asset-category-filters"><button type="button" class="net-asset-category-chip'+(!assetCategoryFilter?' is-active':'')+'" data-net-asset-category="">Todas</button>'+categories.map(cat=>'<button type="button" class="net-asset-category-chip'+(assetCategoryFilter===cat?' is-active':'')+'" data-net-asset-category="'+esc(cat)+'">'+esc(cat)+'</button>').join('')+'</div></div>';
 content+='<div class="net-asset-results-label">'+(q?'SUGERENCIAS':'CATÁLOGO CLASIFICADO')+' <span>'+matches.length+' resultados</span></div>';
 let lastCat='',lastSub='';
 shown.forEach(a=>{
  const cat=categoryOf(a),sub=subtypeOf(a);
  if(cat!==lastCat){content+='<div class="net-asset-group-label">'+esc(cat)+'</div>';lastCat=cat;lastSub='';}
  if(sub!==lastSub){content+='<div class="net-asset-subgroup-label">'+esc(sub)+'</div>';lastSub=sub;}
  content+='<button type="button" class="net-asset-option'+(select.value===a.name?' is-selected':'')+'" role="option" aria-selected="'+(select.value===a.name)+'" data-net-asset-option="'+esc(a.name)+'"><span class="net-asset-option-mark">↗</span><span class="net-asset-option-copy"><b>'+esc(a.name)+'</b><small>'+esc(cat)+' · '+esc(sub)+'</small></span>'+(select.value===a.name?'<span class="net-asset-option-check">✓</span>':'<span class="net-asset-option-arrow">›</span>')+'</button>';
 });
 if(!matches.length)content+='<div class="net-asset-empty"><b>No encontramos ese activo</b><span>Prueba con otro nombre, una categoría o una subcategoría. También puedes usar una rentabilidad manual.</span></div>';
 if(q&&matches.length>30)content+='<div class="net-asset-more">Mostrando 30 de '+matches.length+'. Añade otra palabra para afinar la búsqueda.</div>';
 content+='<button type="button" class="net-asset-manual-option" data-net-asset-manual="true">Usar rentabilidad manual</button>';
 panel.innerHTML=content;panel.hidden=false;
}
function chooseNetAsset(name){
 const select=$('netAsset'),input=$('netAssetSearch');
 if(!select)return;
 select.value=name||'__manual__';
 if(input)input.value=name&&name!=='__manual__'?name:'Rentabilidad manual';
 renderAssetPicker('',false);
 const asset=findAsset(select.value);
 loadAssetDefaults(asset);
 showAssetTaxAdvice(asset);
}

function readInputs(asset,rateOverride){
 return {
  capital:num('netCapital'),monthly:num('netMonthly'),years:num('netYears'),
  rate:rateOverride??(asset?scenarioRate(asset):num('netManualRate')),
  entryFee:0,entryFixed:$('netEntryCostEnabled').checked?num('netEntryFee'):0,annualFee:0,annualFixed:$('netAnnualCostEnabled').checked?num('netAnnualFee'):0,exitFee:0,exitFixed:$('netExitCostEnabled').checked?num('netExitFee'):0,
  incomeTaxEnabled:$('netIncomeTaxEnabled').checked,
  incomeTaxType:$('netTaxSubject').value==='company'?'is':'irpf',
  incomeTaxBase:$('netIncomeTaxBase').value,
  incomeTaxRate:$('netIncomeTaxRate').value.trim()===''?null:num('netIncomeTaxRate'),
  acquisitionTaxRate:$('netAcquisitionTaxEnabled').checked&&$('netAcquisitionTaxType').value!=='none'?num('netAcquisitionTaxRate')||0:0,
  ajdRate:$('netAjdEnabled').checked?num('netAjdRate')||0:0,
  ibiAnnual:$('netIbiEnabled').checked?num('netIbiAnnual')||0:0,
  municipalExitTax:$('netMunicipalEnabled').checked?num('netMunicipalExitTax')||0:0,
  otherAnnualTax:$('netOtherTaxEnabled').checked?num('netOtherAnnualTax')||0:0,
  otherEntryTax:$('netOtherTaxEnabled').checked?num('netOtherEntryTax')||0:0,
  inflation:num('netInflation'),vacancy:isRentalAsset(asset)?(num('netVacancy')/12*100):0
 };
}
function calculate(asset,scenario=selectedScenario,overrides={}){
 const rate=overrides.rate??(scenario==='custom'?num('netManualRate'):(asset?scenarioRate(asset,scenario):num('netManualRate')));
 const params={...readInputs(asset,rate),...overrides};
 return engine.calculate(params,fiscalConfig);
}
function setScenario(value){
 selectedScenario=value;
 if(currentAsset)$('netManualRate').value=scenarioRate(currentAsset,value).toFixed(2);
 document.querySelectorAll('[data-net-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.netScenario===value)));
 runNetSimulation();
}

function updateCostControls(){
 [['netEntryCostEnabled','netEntryFee'],['netAnnualCostEnabled','netAnnualFee'],['netExitCostEnabled','netExitFee']].forEach(([check,field])=>{$(field).disabled=!$(check).checked;});
}
function updateTaxFieldControls(){
 const pairs=[
  ['netIncomeTaxEnabled',['netTaxSubject','netIncomeTaxBase','netIncomeTaxRate']],
  ['netIbiEnabled',['netIbiAnnual']],
  ['netAcquisitionTaxEnabled',['netAcquisitionTaxType','netAcquisitionTaxRate']],
  ['netAjdEnabled',['netAjdRate']],
  ['netMunicipalEnabled',['netMunicipalExitTax']],
  ['netOtherTaxEnabled',['netOtherTaxName','netOtherEntryTax','netOtherAnnualTax']]
 ];
 pairs.forEach(([check,fields])=>fields.forEach(id=>$(id).disabled=!$(check).checked));
}
function showAssetTaxAdvice(asset){
 const name=String(asset?.name||'Rentabilidad manual'),n=name.toLocaleLowerCase('es');
 const cat=categoryOf(asset),sub=subtypeOf(asset);
 const lines=[];
 const add=(heading,detail)=>lines.push([heading,detail]);
 if(!asset){
  add('Costes','Introduce manualmente comisiones, gastos de gestión, custodia, financiación o costes de operación que correspondan al producto que estás simulando.');
  add('Fiscalidad','La rentabilidad manual no identifica el instrumento ni su tratamiento fiscal. Antes de añadir impuestos, determina si el rendimiento es interés, dividendo, alquiler, actividad económica o ganancia/pérdida patrimonial.');
 }else if(cat==='Inmobiliario'&&sub==='Inmueble directo'){
  const home=/viviend|habitaci[oó]n|inmueble turístico/.test(n),garage=/garaje|plaza/.test(n),storage=/trastero/.test(n),land=/suelo|finca|terreno/.test(n),bare=/nuda propiedad/.test(n),tourist=/turístic/.test(n),commercial=/local|oficina|nave|edificio/.test(n);
  add('Compra y formalización','Segunda mano: normalmente ITP a cargo del comprador, con tipo y bonificaciones de la comunidad autónoma. Primera entrega de obra nueva: IVA (habitualmente 10 % en vivienda; el tipo puede ser distinto en locales, plazas no accesorias y otros inmuebles) y AJD cuando proceda. Añade notaría, Registro, tasación, gestoría y asesoramiento si los pagas. No sumes ITP e IVA como si fueran acumulativos en una compraventa ordinaria.');
  if(home&&!tourist)add('Alquiler residencial','Si una persona física alquila la vivienda para uso residencial permanente, el alquiler está generalmente exento de IVA. El rendimiento neto se declara en IRPF como capital inmobiliario: pueden deducirse gastos necesarios y amortización conforme a sus reglas. La reducción sobre el rendimiento neto positivo solo procede si se cumplen los requisitos legales del contrato y del inmueble; no la presupongas en el simulador.');
  else if(garage||storage)add('Alquiler de garaje o trastero','Si se arrienda de forma independiente, normalmente lleva IVA del 21 %. Si el garaje o trastero se alquila como anexo accesorio junto con la vivienda en el mismo contrato, puede quedar comprendido en la exención de IVA de la vivienda. Para una persona física, la renta suele ser capital inmobiliario en IRPF; no se aplica automáticamente la reducción propia del alquiler de vivienda habitual.');
  else if(commercial)add('Alquiler de uso distinto de vivienda','El alquiler de un local u oficina está normalmente sujeto a IVA del 21 %. Para una persona física, la renta suele declararse como capital inmobiliario en IRPF y no disfruta de la reducción prevista para determinados alquileres de vivienda. Revisa retenciones y obligaciones formales según quién alquile y quién sea el inquilino.');
  else if(tourist)add('Explotación turística','La tributación depende de los servicios prestados. El mero arrendamiento sin servicios propios de la industria hotelera puede estar exento de IVA; si se prestan servicios hoteleros, puede quedar sujeto al tipo reducido aplicable. Comprueba además normativa turística autonómica y municipal, licencias y posibles obligaciones de actividad.');
  else if(land)add('Explotación del suelo','El tratamiento cambia según sea suelo urbano, urbanizable o rústico y según su destino. El arrendamiento de terrenos puede estar exento de IVA, pero hay excepciones (por ejemplo, aparcamiento, depósito o instalaciones empresariales). Si hay explotación agrícola/forestal, pueden existir reglas de actividad económica específicas.');
  else if(bare)add('Nuda propiedad','La compra de la nuda propiedad no equivale a adquirir el pleno uso: normalmente el usufructuario conserva el derecho de uso o alquiler mientras dure el usufructo. No proyectes rentas de alquiler para el nudo propietario si no tiene derecho a percibirlas. La valoración y tributación de compra/venta dependen de la edad, duración y condiciones del usufructo.');
  add('Gastos anuales y vacancia','Valora IBI, comunidad, seguro, mantenimiento, reparaciones, derramas, gestión, financiación e impagos. Para alquileres, los gastos deducibles en IRPF deben estar vinculados a la obtención de la renta y cumplir sus requisitos; los gastos de periodos no alquilados no se deducen automáticamente como si el inmueble hubiera estado arrendado todo el año.');
  add('Venta y fiscalidad de salida','La persona física calcula la ganancia o pérdida patrimonial en IRPF (base del ahorro), incorporando valores y gastos fiscalmente computables. En terrenos urbanos puede devengarse la plusvalía municipal (IIVTNU), según el incremento de valor y la normativa local. Una sociedad integra el resultado en el Impuesto sobre Sociedades. Incluye agencia, cancelación registral de hipoteca y certificados si corresponden.');
 }else if(cat==='Inmobiliario'&&sub==='Terrenos'){
  add('Compra y clasificación del suelo','Comprueba la clasificación y situación urbanística, edificabilidad, cargas, servidumbres, acceso, agua y situación registral/catastral. El precio de suelo rústico, urbanizable y urbano no es fiscal ni jurídicamente intercambiable.');
  add('Impuestos de adquisición y tenencia','La transmisión puede tributar por ITP o, si está sujeta a IVA, por IVA y AJD según vendedor, condición del terreno y operación. Puede haber IBI y tasas locales. El uso agrícola/forestal puede alterar obligaciones y ayudas.');
  add('Alquiler y venta','El alquiler de terrenos puede estar exento de IVA, pero existen excepciones (aparcamiento, depósito, almacenaje o instalaciones empresariales). La venta puede generar ganancia en IRPF/IS y, si es terreno urbano, IIVTNU cuando proceda.');
 }else if(cat==='Inmobiliario'&&sub==='REITs y SOCIMI'){
  add('Costes','Comisión de compra/venta, custodia, cambio de divisa y diferencial de mercado. Revisa los gastos propios del vehículo; no añadas de nuevo gastos inmobiliarios internos que ya estén soportados por la SOCIMI/REIT y reflejados en su cotización o resultados.');
  add('Dividendos','Para una persona física residente, los dividendos distribuidos suelen tributar en la base del ahorro del IRPF. Si inviertes mediante sociedad, se contabilizan y tributan en IS, con posibles reglas de exención/limitación según participación y requisitos; no presupongas exención.');
  add('Venta','La ganancia o pérdida por vender las acciones/participaciones cotizadas suele integrarse en la base del ahorro del IRPF para personas físicas. No es una venta directa del inmueble: normalmente no se liquida ITP inmobiliario ni plusvalía municipal por el accionista.');
  add('Punto clave','La rentabilidad depende de dividendos, evolución bursátil, deuda, ocupación y valoración de los inmuebles del vehículo. Los impuestos soportados por la SOCIMI/REIT no son un coste fiscal directo idéntico al de comprar un inmueble a título personal.');
 }else if(cat==='Inmobiliario'&&sub==='Fondos inmobiliarios'){
  add('Costes','Comisión de gestión y depositaría del fondo, gastos corrientes y posibles comisiones de suscripción/reembolso. En fondos cotizados, añade intermediación, custodia y diferencial. Los gastos corrientes suelen estar descontados del valor liquidativo o cotización: evita duplicarlos.');
  add('Fiscalidad del reembolso','En fondos de inversión, la ganancia o pérdida se calcula al reembolsar y, para personas físicas, normalmente tributa en la base del ahorro. Algunos fondos elegibles permiten traspasos con diferimiento fiscal si se cumplen los requisitos; los ETF cotizados no disfrutan, con carácter general, de ese régimen.');
  add('Distribuciones','Si el vehículo reparte rentas, revisa su naturaleza y el tratamiento fiscal indicado en el folleto y documentación fiscal. No confundas distribución con rentabilidad total ni supongas que todos los fondos inmobiliarios reparten dividendos.');
 }else if(cat==='Inmobiliario'&&sub==='Crowdfunding inmobiliario'){
  add('Costes','Comisión de plataforma, estructuración, gestión del proyecto, administración, éxito y posibles costes de salida. Comprueba si se descuentan del importe invertido o de los cobros para no contarlos dos veces.');
  add('Fiscalidad: identifica el contrato','No adquieres necesariamente un inmueble. Si financias mediante préstamo, los intereses suelen ser rendimientos del capital mobiliario para una persona física. Si recibes participaciones o beneficios de una sociedad/proyecto, el tratamiento depende del instrumento y puede ser dividendo o ganancia patrimonial. No apliques automáticamente las reglas fiscales del alquiler residencial.');
  add('Riesgo y salida','Valora impago, retraso, subordinación, garantías, iliquidez y pérdida parcial o total. La pérdida fiscal por crédito impagado no se deduce automáticamente al primer retraso: depende de los requisitos legales y de la situación del crédito.');
 }else if(cat==='Mercados financieros'){
  if(/cuentas corrientes|efectivo|cuentas remuneradas|depósitos|divisa/.test(n)){
   add('Rendimiento','Los intereses de cuentas y depósitos de una persona física suelen ser rendimientos del capital mobiliario integrados en la base del ahorro del IRPF. En cuentas en divisa, separa el interés de la posible ganancia o pérdida por variación del tipo de cambio.');
   add('Costes','Comisiones de mantenimiento, transferencias, retirada, cambio de divisa y posibles penalizaciones por cancelación anticipada. Comprueba si el tipo anunciado es bruto y si exige saldo máximo, permanencia o vinculación.');
   add('Cobertura','Comprueba qué entidad recibe el depósito y si está cubierta por el Fondo de Garantía de Depósitos aplicable, con sus límites y condiciones. Un fondo monetario o producto de inversión no es un depósito garantizado.');
  }else if(/letras del tesoro|bonos del estado|bonos ligados|bonos corporativos|bonos convertibles|obligaciones|pagarés|participaciones preferentes/.test(n)||sub==='Renta fija'){
   add('Cupones e intereses','Los cupones y rendimientos implícitos de letras, bonos y obligaciones suelen ser rendimientos del capital mobiliario en la base del ahorro del IRPF para personas físicas. En deuda emitida con descuento, el rendimiento puede materializarse al vencimiento; no lo trates como un dividendo.');
   add('Compra, venta y vencimiento','Añade comisión de intermediación, custodia, diferencial y, si procede, gastos de cambio de divisa. Si vendes antes del vencimiento, el precio puede generar una ganancia o pérdida adicional y puedes recuperar menos del nominal. Revisa también el riesgo de crédito y la subordinación.');
   add('Sociedad','En una sociedad, los intereses y resultados se contabilizan y se integran en la base imponible del IS conforme a las reglas contables y fiscales aplicables. La retención soportada, si existe, es un pago a cuenta, no el impuesto definitivo.');
  }else if(/fondos de inversión/.test(sub)||/fondos indexados|fondos de gestión|fondos mixtos|fondos de retorno|fondos de fondos/.test(n)){
   add('Costes del fondo','Revisa gastos corrientes/TER, gestión, depositaría, suscripción y reembolso. Los gastos corrientes se descuentan normalmente del valor liquidativo: no los introduzcas otra vez si tu rentabilidad ya es neta de ellos.');
   add('Reembolso y traspasos','Para una persona física, la ganancia o pérdida del reembolso suele ir a la base del ahorro del IRPF. Los traspasos entre fondos que cumplen los requisitos pueden diferir la tributación hasta el reembolso definitivo; no es una exención y no se aplica a todos los vehículos.');
   add('Distribuciones','Si el fondo reparte dividendos o intereses, tributan cuando se perciben conforme a su naturaleza. En fondos de acumulación, la tributación personal suele producirse al reembolso, no por cada rendimiento reinvertido.');
  }else if(/etf|etc/.test(n)||sub==='ETF y ETC'){
   add('Costes','Comisión de compraventa, custodia, diferencial, cambio de divisa y gastos corrientes del ETF/ETC. El TER suele estar incorporado en el valor del producto; no lo dupliques si usas una rentabilidad histórica ya neta.');
   add('Dividendos y venta','Las distribuciones tributan cuando se perciben y la venta genera una ganancia o pérdida patrimonial en la base del ahorro del IRPF para personas físicas. Los ETF cotizados no disfrutan, con carácter general, del diferimiento por traspaso entre fondos.');
   add('Fiscalidad del ETC','Un ETC no siempre es un fondo: puede ser un título de deuda garantizado o estar respaldado por activos. Comprueba su estructura jurídica y fiscal en el folleto; no asumas que todo ETC tiene el mismo tratamiento que un ETF UCITS.');
  }else if(/acciones/.test(n)||sub==='Renta variable'){
   add('Dividendos','Los dividendos cobrados por una persona física suelen integrarse en la base del ahorro del IRPF. Si proceden del extranjero, puede haber retención en origen y, si se cumplen los requisitos, deducción por doble imposición internacional dentro de sus límites.');
   add('Venta','La diferencia entre valor de venta y adquisición, ajustada por gastos fiscalmente computables, genera ganancia o pérdida patrimonial en la base del ahorro del IRPF. Conserva fechas, importes y comisiones de cada operación.');
   add('Costes','Intermediación, custodia, cambio de divisa y diferencial. En acciones extranjeras, revisa también posibles costes de conversión y retenciones sobre dividendos.');
  }else if(sub==='Productos estructurados y gestión alternativa'){
   add('Estructura y riesgos','Identifica emisor, garante, activo subyacente, barreras, vencimiento, liquidez y escenarios de pérdida. En notas estructuradas puede existir riesgo de crédito del emisor además del riesgo de mercado. Hedge funds pueden tener ventanas de reembolso y restricciones.');
   add('Costes','Comisión de estructuración/distribución, gestión, custodia, diferencial, costes implícitos, comisión de éxito y penalización de salida. Pide el coste total ex ante/ex post y el escenario de recuperación del capital.');
   add('Fiscalidad','No hay un tratamiento único: el resultado puede ser rendimiento de capital mobiliario o ganancia/pérdida patrimonial según la estructura y forma de liquidación. Revisa documentación fiscal y folleto; para sociedades, integración en IS conforme a su naturaleza.');
  }else if(sub==='Gestión delegada'){
   add('Costes totales','Suma gestión del servicio, gastos corrientes de los fondos subyacentes, depositaría, custodia y posibles costes de transacción/cambio de divisa. Comprueba si el porcentaje publicado incluye todos los niveles de coste.');
   add('Fiscalidad','La tributación depende de los activos que componen la cartera y de si el gestor realiza traspasos elegibles entre fondos o ventas de ETF/acciones. No presupongas diferimiento fiscal por el mero hecho de usar un robo-advisor o una cartera gestionada.');
   add('Punto clave','Distingue rentabilidad antes y después de comisiones, y comprueba el régimen de titularidad y custodia. La gestión delegada no garantiza capital ni rentabilidad.');
  }else if(sub==='Mercado monetario'){
   add('Rendimiento y fiscalidad','Los intereses de papel comercial, repos y certificados pueden calificarse como rendimientos del capital mobiliario para personas físicas; el tratamiento concreto depende del instrumento y de si se transmite antes del vencimiento.');
   add('Costes y riesgo','Comisión de suscripción/reembolso o intermediación, custodia, diferencial y riesgo de contraparte. Un fondo monetario no es un depósito bancario y su valor puede fluctuar; no tiene garantía de capital del FGD.');
  }else if(sub==='Derivados'){
   add('Costes y garantías','Comisión, spread, financiación overnight, renovación/vencimiento, primas, cánones de mercado y coste de garantías. En productos apalancados, una pérdida puede ser muy superior a la prima inicial según el instrumento.');
   add('Fiscalidad','El resultado depende de si se trata de liquidación, transmisión, ejercicio o vencimiento y de si operas como inversor particular o actividad económica. No apliques una retención o tipo fijo a todas las operaciones; documenta cada liquidación y sus gastos.');
  }else if(sub==='Previsión y seguros de ahorro'){
   add('Planes de pensiones y PPA','Las aportaciones pueden reducir la base imponible general dentro de los límites y requisitos vigentes. Las prestaciones tributan, en general, como rendimientos del trabajo cuando se cobran. No confundas la reducción de aportaciones con una exención.');
   add('PIAS, SIALP y seguros','PIAS y SIALP tienen beneficios fiscales condicionados a límites, plazo, forma de cobro y demás requisitos legales. En seguros de ahorro y unit linked, la tributación depende de quién sea tomador/beneficiario, contingencia y estructura del contrato; consulta condiciones antes de simular.');
   add('Costes','Comisión de gestión, administración, aseguramiento, riesgo biométrico, rescate o cambio de cartera. Revisa penalizaciones y valor de rescate: puede ser inferior a las primas aportadas.');
  }else{
   add('Costes','Comisión de compra/venta, custodia, administración, asesoramiento, cambio de divisa y diferencial, según intermediario y producto. En carteras gestionadas, suma solo los costes externos no incluidos en la comisión publicada.');
   add('Fiscalidad','El tratamiento depende del instrumento subyacente y de si genera intereses, dividendos, ganancias patrimoniales o prestaciones de seguro. La etiqueta comercial del producto no determina por sí sola el impuesto.');
  }
 }else if(cat==='Empresas y negocios'){
  if(/startup|capital riesgo|venture|semilla/.test(n)||sub==='Venture Capital'){
   add('Entrada y mantenimiento','Due diligence, asesoría legal/fiscal, valoración, comisión de plataforma o fondo, gastos de constitución y futuras rondas. Ten en cuenta la dilución: una ampliación puede reducir tu porcentaje aunque no vendas.');
   add('Fiscalidad de la persona inversora','Dividendos y plusvalías por venta de participaciones suelen integrarse en la base del ahorro del IRPF. Puede existir deducción por inversión en empresas nuevas si se cumplen estrictamente los requisitos estatales/autonómicos; no la des por supuesta.');
   add('Sociedad inversora y salida','Una sociedad integra el resultado en IS; la posible exención por dividendos/plusvalías de participaciones exige requisitos específicos. La venta puede ser ilíquida y generar gastos legales y de intermediación.');
  }else if(sub==='Participaciones empresariales'||sub==='Private Equity'){
   add('Adquisición de participaciones','Distingue comprar acciones/participaciones de comprar activos o una unidad productiva. La compraventa de participaciones suele tener un régimen distinto de IVA/ITP, con excepciones antiabuso en sociedades inmobiliarias. Revisa estatutos, pactos de socios, deuda, contingencias y derechos de salida.');
   add('Dividendos y desinversión','Dividendos y plusvalías de una persona física suelen tributar en la base del ahorro del IRPF. Una sociedad inversora puede aplicar, si cumple requisitos, la exención de doble imposición sobre dividendos/plusvalías; no es automática y hay condiciones de participación y tenencia.');
   add('Costes y liquidez','Due diligence financiera, fiscal, legal y laboral, valoración, asesoría, notaría, financiación y comisión de intermediación. Las participaciones no cotizadas pueden ser difíciles de vender y su valoración no equivale a efectivo disponible.');
  }else if(sub==='Intangibles y capital humano'){
   add('Qué se adquiere','Distingue comprar un activo (marca, patente, dominio o derechos), una licencia de uso, una cesión temporal o servicios/formación. El contrato define duración, exclusividad, territorio, renovaciones, royalties y titularidad del derecho.');
   add('Costes','Registro, renovación, defensa jurídica, mantenimiento de dominio/hosting, royalties, soporte, formación y costes de transferencia. Valora riesgo de caducidad, infracción, obsolescencia y dependencia del titular.');
   add('Fiscalidad','Los cobros pueden ser rendimientos de actividad, capital mobiliario o ganancias patrimoniales según el derecho cedido y si existe actividad habitual. IVA, retenciones e IRPF/IS dependen del contrato, residencia y condición de las partes.');
  }else if(/webs|afiliación|software|saas|aplicaciones|plataformas|contenido|tienda online/.test(n)||sub==='Negocios digitales'){
   add('Costes operativos','Dominio, hosting, software, publicidad, pasarelas de pago, comisiones de marketplace, contenido, mantenimiento, protección de datos, licencias y proveedores. Separa inversión inicial de gastos recurrentes.');
   add('Fiscalidad si lo explotas tú','Si la actividad la realiza una persona física por cuenta propia, el beneficio neto puede tributar como actividad económica en IRPF y generar obligaciones de IVA, pagos fraccionados y cotización, según el caso. No equivale a una inversión pasiva.');
   add('Fiscalidad mediante sociedad','La sociedad tributa por IS sobre su resultado; el dinero que después se distribuya al socio puede tributar además como dividendo en su IRPF. Distingue caja del negocio, beneficio contable y dinero neto disponible para el propietario.');
   add('Venta del negocio','La transmisión de activos, unidad económica o participaciones puede tener tratamientos distintos en IVA/ITP e IRPF/IS. Valora asesoría, contratos, garantías, intermediación y posibles ajustes por contingencias.');
  }else if(/franquicia|máquinas? expendedoras?|vending/.test(n)||sub==='Negocio propio'){
   add('Costes','Canon de entrada, royalties, marketing obligatorio, alquiler, maquinaria, personal, suministros, seguros, licencias, mantenimiento y circulante. Comprueba mínimos garantizados y penalizaciones de salida.');
   add('Fiscalidad operativa','Los ingresos y gastos forman parte de una actividad económica. Persona física: IRPF de actividades económicas; sociedad: IS. El IVA depende de la actividad y de las operaciones; el canon de franquicia puede tener su propio tratamiento.');
   add('Punto clave','Modela el beneficio después de personal, alquiler, amortización, financiación e impuestos, no solo la facturación o el margen bruto. Incluye el tiempo de gestión y posibles inversiones de reposición.');
  }else if(/préstamo participativo|préstamos privados|deuda corporativa|crowdlending|factoring|confirming/.test(n)||sub==='Deuda privada'){
   add('Rendimientos','Los intereses percibidos por una persona física suelen ser rendimientos del capital mobiliario en la base del ahorro. En préstamos participativos, la remuneración fija/variable y la posición del inversor dependen del contrato.');
   add('Costes y riesgo','Comisión de originación, plataforma, administración, cobro y salida. Analiza garantías, prelación, solvencia, concentración, vencimiento y posibilidad de impago; el interés anunciado no equivale a rentabilidad neta.');
   add('Impagos','No conviertas automáticamente un préstamo vencido en una pérdida fiscal deducible. La imputación de pérdidas por créditos requiere que se cumplan las circunstancias y plazos previstos en la normativa.');
  }else{
   add('Adquisición y due diligence','Valora revisión legal, contable, laboral, fiscal y financiera; contratos, licencias, deudas, litigios, inventario, valoración y gastos de formalización. En compra de participaciones y compra de activos, los impuestos indirectos pueden ser distintos.');
   add('Explotación','Personal, alquiler, suministros, seguros, mantenimiento, licencias, gestoría, marketing, tecnología y financiación. Incluye circulante e inversiones de reposición; no confundas caja con beneficio.');
   add('Fiscalidad','Persona física que desarrolla la actividad: IRPF de actividades económicas y, en su caso, IVA. Sociedad: IS; si distribuye beneficios al socio, puede haber tributación adicional en IRPF. La transmisión del negocio exige analizar si se venden activos, unidad económica o participaciones.');
  }
 }else if(cat==='Alternativos'){
  if(/cripto|bitcoin|ethereum|stablecoin|staking|defi|minería|monedas virtuales/.test(n)||sub==='Criptoactivos'){
   add('Compra, venta y permutas','Para una persona física que invierte fuera de una actividad económica, vender cripto por euros o permutar una cripto por otra puede generar ganancia o pérdida patrimonial en la base del ahorro del IRPF. Calcula en euros y conserva fecha, valor y comisiones de cada operación.');
   add('Identificación y rendimientos','La AEAT aplica criterio FIFO para unidades homogéneas del mismo criptoactivo. Staking, lending, minería y recompensas no tienen necesariamente la misma calificación que una compraventa: depende de cómo se obtengan y de la actividad realizada.');
   add('Costes y obligaciones','Comisiones de exchange, spread, red/gas, custodia y retirada. Guarda historial de operaciones y wallets. Pueden existir obligaciones informativas por activos situados en el extranjero si se cumplen los supuestos y umbrales legales.');
  }else if(/oro|plata|platino|paladio|metales preciosos/.test(n)){
   add('Compra y custodia','Spread del distribuidor, prima sobre spot, fabricación, transporte, caja de seguridad, custodia y seguro. Comprueba pureza, autenticidad, recompra y si el producto es oro de inversión a efectos legales.');
   add('IVA y venta','El oro de inversión que cumple la definición legal tiene un régimen específico de exención de IVA; joyería, monedas de colección y otros metales no reciben automáticamente el mismo tratamiento. La venta por una persona física puede generar ganancia o pérdida patrimonial en IRPF.');
   add('Vehículo financiero','Si inviertes mediante ETF, ETC, certificado o derivado, la fiscalidad y los costes corresponden al instrumento, no a la tenencia directa del metal. Revisa folleto y estructura jurídica.');
  }else if(/arte|pintura|escultura|fotografía|reloj|vino|whisky|coche clásico|moneda|sello|carta|joya|antigüedad|coleccion/.test(n)||sub==='Arte'||sub==='Coleccionables'){
   add('Compra, conservación y venta','Prima de subasta, comisión del comprador/vendedor, autenticación, tasación, restauración, almacenamiento, seguro, transporte y costes de plataforma. La iliquidez y el diferencial entre precio de compra y reventa pueden ser elevados.');
   add('Fiscalidad','La venta ocasional por una persona física puede generar ganancia o pérdida patrimonial en IRPF; si existe actividad habitual de compraventa, puede calificarse como actividad económica y tener IVA/IRPF o IS. El IVA de objetos de arte y antigüedades puede depender del régimen y de quién vende.');
   add('Punto clave','No extrapoles una tasación o precio de subasta a un valor de venta garantizado. Conserva factura, procedencia, gastos y documentación de autenticidad.');
  }else if(/préstamo|deuda privada|crowdlending|factoring|confirming/.test(n)||sub==='Deuda privada'){
   add('Intereses','Para persona física, los intereses suelen ser rendimientos del capital mobiliario en la base del ahorro. La remuneración variable y los descuentos deben revisarse según el contrato.');
   add('Costes e impago','Comisiones de plataforma, originación, gestión y cobro. Un impago no permite deducir automáticamente todo el principal: la pérdida fiscal depende de las reglas aplicables a créditos vencidos y reclamaciones.');
  }else if(/materias primas|petróleo|gas natural|cobre|agrícolas/.test(n)||sub==='Materias primas físicas'){
   add('Instrumento y costes','Distingue materia prima física, futuro, ETF, ETC o fondo. Almacenamiento, seguro y transporte solo aplican a tenencia física; los vehículos financieros pueden tener TER, roll yield, spread, garantías y financiación.');
   add('Fiscalidad','La tributación deriva de la estructura concreta: un fondo, ETF/ETC, futuro o compraventa física no se declaran necesariamente igual. Revisa folleto y contrato antes de asignar IRPF, IVA o IS.');
  }else{
   add('Costes','Comisión de plataforma, intermediación, custodia, almacenamiento, seguro, mantenimiento, diferencial y gastos de salida, según el activo.');
   add('Fiscalidad','Identifica si obtienes intereses, dividendos, alquileres, rendimientos de actividad o una ganancia patrimonial. El tratamiento cambia según instrumento, titular y forma de explotación; no hay un tipo fiscal único para “alternativos”.');
  }
 }else{
  add('Costes','Revisa comisión de entrada y salida, mantenimiento, custodia, gestión, financiación y diferencial, según las condiciones del producto.');
  add('Fiscalidad','El impuesto depende del instrumento jurídico, del tipo de rendimiento, de tu residencia fiscal y de si inviertes como persona física o sociedad. La categoría comercial por sí sola no permite fijar un tratamiento único.');
 }
 const escapeHtml=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let modal=$('netAssetAdviceModal');
 if(!modal){
  modal=document.createElement('div');modal.id='netAssetAdviceModal';modal.className='net-asset-advice-overlay';modal.hidden=true;
  modal.innerHTML='<section class="net-asset-advice-dialog" role="dialog" aria-modal="true" aria-labelledby="netAssetAdviceTitle"><button type="button" class="net-asset-advice-close" aria-label="Cerrar aviso">×</button><div class="net-asset-advice-kicker">GUÍA FISCAL Y DE COSTES · ESPAÑA</div><h2 id="netAssetAdviceTitle"></h2><p class="net-asset-advice-intro">Conceptos concretos que conviene revisar antes de simular este activo. Son orientaciones: no se activa ni se incorpora ningún importe automáticamente.</p><div class="net-advice-list"></div><p class="net-asset-advice-footnote">La aplicación final depende de tu residencia fiscal, titularidad, contrato, fecha de adquisición, comunidad autónoma y municipio. En sociedades pueden existir reglas contables y fiscales distintas. Comprueba la normativa vigente y la documentación del producto antes de presentar una declaración. No dupliques gastos ya descontados de la rentabilidad.</p><button type="button" class="net-asset-advice-done">Entendido</button></section>';
  document.body.appendChild(modal);
  const close=()=>{
   modal.hidden=true;document.body.classList.remove('net-asset-advice-open');
   const search=$('netAssetSearch'),selected=$('netAsset')?.value;
   if(search&&selected){search.value=selected==='__manual__'?'Rentabilidad manual':selected;renderAssetPicker('',false);search.focus({preventScroll:true});search.select();}
  };
  modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('.net-asset-advice-close,.net-asset-advice-done'))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});
 }
 modal.querySelector('#netAssetAdviceTitle').textContent='Costes e impuestos · '+name;
 modal.querySelector('.net-advice-list').innerHTML=lines.map(([heading,detail])=>'<div><b>'+escapeHtml(heading)+'</b><span>'+escapeHtml(detail)+'</span></div>').join('');
 modal.hidden=false;document.body.classList.add('net-asset-advice-open');
 modal.querySelector('.net-asset-advice-close').focus({preventScroll:true});
}
function loadAssetDefaults(asset){
 currentAsset=asset;
 const d=assetDefaults(asset),fiscalText=((asset?.tax||'')+' '+(asset?.taxdetail||'')).toLocaleLowerCase('es');
 const hasIrpf=/\birpf\b/.test(fiscalText),hasIs=/\b(?:is|sociedades)\b/.test(fiscalText);
 const savings=/base del ahorro|dividendos|intereses|ganancia patrimonial/.test(fiscalText);
 const general=/base general|capital inmobiliario|actividades econ[oó]micas/.test(fiscalText);
 const realEstate=asset?.cat==='Inmobiliario'&&/(vivienda|habitaci[oó]n|local|oficina|nave|plaza de garaje|trastero|suelo|terreno|edificio|inmueble)/i.test(asset?.name||'');
 const hasIbi=realEstate||/\bibi\b/.test(fiscalText);
 const hasIva=/\biva\b/.test(fiscalText),hasItp=/\bitp\b/.test(fiscalText),hasAjd=/\bajd\b/.test(fiscalText);
 const hasPlusvalia=/plusval[ií]a municipal|iivtnu/.test(fiscalText);
 $('netEntryFee').value='0';
 $('netAnnualFee').value='0';
 $('netExitFee').value='0';
 ['netEntryCostEnabled','netAnnualCostEnabled','netExitCostEnabled'].forEach(id=>$(id).checked=false);
 $('netManualRate').value=asset?scenarioRate(asset,'base').toFixed(2):'5';
 selectedScenario='base';
 document.querySelectorAll('[data-net-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.netScenario==='base')));
 $('netVacancyWrap').classList.toggle('net-sim-hidden',!isRentalAsset(asset));
 if(!isRentalAsset(asset))$('netVacancy').value='0';
 // Ningún impuesto se activa automáticamente: el usuario decide cuáles incluir.
 $('netTaxSubject').value='individual';
 $('netIncomeTaxEnabled').checked=false;
 $('netIncomeTaxTitle').textContent=$('netTaxSubject').value==='company'?'Impuesto sobre Sociedades':'IRPF';
 $('netIncomeTaxBase').value=general?'general':(savings?'savings':'general');
 $('netIncomeTaxRate').value=$('netTaxSubject').value==='company'?'25':'';
 $('netIbiEnabled').checked=false;$('netIbiAnnual').value='0';
 $('netAcquisitionTaxEnabled').checked=false;
 $('netAcquisitionTaxType').value='none';
 const ivaMatch=fiscalText.match(/iva[^.\n]{0,55}?(\d+(?:[.,]\d+)?)\s*%/i);
 const itpHasRange=/itp[^.\n]{0,55}\d+\s*%?\s*(?:-|–|a)\s*\d+/i.test(fiscalText);
 const itpMatch=itpHasRange?null:fiscalText.match(/itp[^.\n]{0,55}?(\d+(?:[.,]\d+)?)\s*%/i);
 const ajdMatch=fiscalText.match(/ajd[^.\n]{0,55}?(\d+(?:[.,]\d+)?)\s*%/i);
 $('netAcquisitionTaxType').dataset.ivaRate=ivaMatch?ivaMatch[1].replace(',','.'):'';
 $('netAcquisitionTaxType').dataset.itpRate=itpMatch?itpMatch[1].replace(',','.'):'';
 $('netAcquisitionTaxRate').value=$('netAcquisitionTaxType').value==='iva'&&ivaMatch?ivaMatch[1].replace(',','.'):($('netAcquisitionTaxType').value==='itp'&&itpMatch?itpMatch[1].replace(',','.'):'');
 $('netAjdEnabled').checked=false;$('netAjdRate').value='';
 $('netMunicipalEnabled').checked=false;$('netMunicipalExitTax').value='0';
 $('netOtherTaxEnabled').checked=false;$('netOtherTaxName').value='';$('netOtherEntryTax').value='0';$('netOtherAnnualTax').value='0';
 // El aviso contextual se muestra como ventana emergente al elegir un activo, fuera de los desplegables fiscales.
 $('netTaxProfileHint')?.remove();$('netAssetTaxAdvice')?.remove();
 $('netIncomeTaxHint').textContent=savings?'Se propone la escala del ahorro, calculada progresivamente sobre la ganancia positiva al final.':'La ficha apunta a rentas de base general o actividad. Introduce tu tipo marginal aproximado; no se presupone un porcentaje personal.';
 // La visibilidad del tipo se gestiona de forma centralizada en updateTaxControls().
 $('netIncomeTaxTitle').textContent=$('netTaxSubject').value==='company'?'Impuesto sobre Sociedades':'IRPF';
 $('netCostHint').textContent='Todos los costes empiezan desactivados y a cero. Marca cada concepto que quieras incluir y añade su importe real o estimado.';
 $('netManualRateWrap').classList.remove('net-sim-hidden');
 updateCostControls();
 updateTaxFieldControls();
 updateTaxControls();
 runNetSimulation();
}
function updateTaxControls(){
 const company=$('netTaxSubject').value==='company',savings=$('netIncomeTaxBase').value==='savings',enabled=$('netIncomeTaxEnabled').checked;
 $('netIncomeTaxTitle').textContent=company?'Impuesto sobre Sociedades':'IRPF';
 // El porcentaje del IS debe seguir visible y editable; solo ocultamos el selector de base del IRPF.
 $('netIrpfFields').classList.remove('net-sim-hidden');
 $('netIncomeTaxBaseWrap').classList.toggle('net-sim-hidden',company);
 $('netIncomeTaxRateWrap').classList.remove('net-sim-hidden');
 $('netIncomeTaxRate').disabled=!enabled;
 $('netIncomeTaxRateLabel').textContent=company?'Tipo del Impuesto sobre Sociedades':'Tipo de IRPF personalizado';
 if(company)$('netIncomeTaxHint').textContent='Se aplica el porcentaje introducido sobre la ganancia imponible estimada. Se propone el 25 % como tipo general, pero puedes cambiarlo (por ejemplo, al 15 % si cumples los requisitos u otro tipo aplicable).';
 else if(!enabled)$('netIncomeTaxHint').textContent='Activa la casilla IRPF para incluir este impuesto en el cálculo.';
 else $('netIncomeTaxHint').textContent=savings?'Puedes dejar el campo vacío para aplicar la escala progresiva de la base del ahorro, o introducir un porcentaje para sustituirla por tu tipo personalizado.':'Introduce tu tipo marginal estimado. El porcentaje se aplica a la ganancia imponible; es una aproximación y no una liquidación completa del IRPF.';
}
function buildWaterfall(result){
 const rows=[
  {label:'Capital final bruto',value:result.grossFinal,desc:'Antes de descontar costes.'},
  {label:'Costes totales',value:-result.costs.total,desc:'Costes directos y efecto acumulado sobre el capital final.',deduction:true},
  {label:'Impuestos estimados',value:-result.taxes,desc:'Sobre la ganancia positiva al final.',deduction:true},
  {label:'Capital final neto',value:result.netNominal,desc:'Después de costes e impuestos.'},
  {label:'Efecto de la inflación',value:-(result.netNominal-result.realFinal),desc:'Lo que pierde poder de compra.',deduction:true},
  {label:'Capital final REAL',value:result.realFinal,desc:'En euros de hoy.',final:true}
 ];
 const max=Math.max(1,...rows.map(r=>Math.abs(r.value)));
 $('netWaterfall').innerHTML=rows.map(r=>'<div class="net-sim-water-row '+(r.deduction?'is-deduction ':'')+(r.final?'is-final':'')+'"><span>'+r.label+'</span><div class="net-sim-track" title="'+esc(r.desc)+'"><i style="width:'+Math.max(0,Math.min(100,Math.abs(r.value)/max*100))+'%"></i></div><b>'+((r.deduction&&r.value<0)?'− ':'')+euro(Math.abs(r.value))+'</b></div>').join('');
}
function graphSvg(prudent,base,optimistic){
 const n=Math.max(prudent.points.length,base.points.length,optimistic.points.length),w=640,h=230,pad=30;
 const vals=[...prudent.points,...base.points,...optimistic.points].map(p=>p.real);
 const min=Math.min(0,...vals),max=Math.max(1,...vals);
 const x=i=>pad+(w-pad*2)*(i/Math.max(1,n-1));
 const y=v=>h-pad-(v-min)/(max-min)*(h-pad*2);
 const path=arr=>arr.map((p,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(p.real).toFixed(1)).join(' ');
 const upper=optimistic.points,lower=prudent.points;
 const band='M'+upper.map((p,i)=>x(i).toFixed(1)+' '+y(p.real).toFixed(1)).join(' L')+' L'+lower.slice().reverse().map((p,i)=>x(lower.length-1-i).toFixed(1)+' '+y(p.real).toFixed(1)).join(' L')+' Z';
 const contributed=base.points.map(p=>({real:p.contributedReal}));
 const table=base.points.map(p=>'<tr><td>'+fmt(p.year)+' años</td><td>'+euro(p.real)+'</td><td>'+euro(p.contributedReal)+'</td><td>'+euro(p.real-p.contributedReal)+'</td></tr>').join('');
 const ticks=[0,Math.round((n-1)/2),n-1].filter((v,i,a)=>a.indexOf(v)===i);
 $('netGraph').innerHTML='<div class="net-sim-chart-legend"><span><i class="net-sim-legend-dot"></i>Capital neto real (€ de hoy)</span><span><i class="net-sim-legend-dot gray"></i>Dinero aportado (€ de hoy)</span><span>Franja: prudente–optimista</span></div><div id="netChartWrap" style="position:relative;touch-action:pan-y"><svg id="netInteractiveChart" class="net-sim-chart" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Gráfico interactivo: toca o mueve el cursor para consultar cada año."><rect x="0" y="0" width="'+w+'" height="'+h+'" fill="transparent" style="pointer-events:all"/><g stroke="#e7edf5" stroke-dasharray="4 5"><line x1="'+pad+'" y1="'+y(max)+'" x2="'+(w-pad)+'" y2="'+y(max)+'"/><line x1="'+pad+'" y1="'+y((max+min)/2)+'" x2="'+(w-pad)+'" y2="'+y((max+min)/2)+'"/><line x1="'+pad+'" y1="'+y(min)+'" x2="'+(w-pad)+'" y2="'+y(min)+'"/></g><path d="'+band+'" fill="#155eef" opacity=".12"/><path d="'+path(contributed)+'" fill="none" stroke="#98a2b3" stroke-width="2" stroke-dasharray="5 5"/><path d="'+path(base.points)+'" fill="none" stroke="#155eef" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><g id="netChartMarker" style="pointer-events:none"><line id="netChartGuide" x1="'+pad+'" y1="'+pad+'" x2="'+pad+'" y2="'+(h-pad)+'" stroke="#155eef" stroke-dasharray="3 4" opacity="0"/><circle id="netChartDot" cx="'+pad+'" cy="'+y(base.points[0].real)+'" r="5" fill="#155eef" stroke="#fff" stroke-width="2" opacity="0"/></g><g fill="#667085" font-size="11" text-anchor="middle">'+ticks.map(i=>'<text x="'+x(i)+'" y="'+(h-5)+'">'+fmt(base.points[i]?.year||0)+' años</text>').join('')+'</g></svg><div id="netChartTooltip" role="status" aria-live="polite" style="display:none;position:absolute;z-index:2;top:8px;left:8px;max-width:min(260px,90%);padding:10px 12px;background:#10294e;color:#fff;border-radius:10px;box-shadow:0 6px 20px #10294e33;font-size:12px;line-height:1.55;pointer-events:none"></div></div><p class="net-sim-hint">Mueve el cursor o desliza el dedo sobre el gráfico para consultar cada año.</p><details><summary style="cursor:pointer;font-size:12px;color:#475467">Ver tabla de datos del gráfico</summary><div class="net-sim-table-wrap"><table class="net-sim-chart-table"><thead><tr><th>Año</th><th>Capital neto real</th><th>Aportado en euros de hoy</th><th>Ganancia real</th></tr></thead><tbody>'+table+'</tbody></table></div></details>';
 const svg=$('netInteractiveChart'),wrap=$('netChartWrap'),tip=$('netChartTooltip'),guide=$('netChartGuide'),dot=$('netChartDot');
 const points=base.points;
 function inspect(event){
  const rect=svg.getBoundingClientRect(),ratio=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
  const index=Math.round(ratio*(points.length-1)),point=points[index],cx=x(index),cy=y(point.real);
  const vbX=cx/640*rect.width,tipWidth=Math.min(260,rect.width*.9);
  guide.setAttribute('x1',cx);guide.setAttribute('x2',cx);guide.setAttribute('opacity','1');
  dot.setAttribute('cx',cx);dot.setAttribute('cy',cy);dot.setAttribute('opacity','1');
  tip.style.display='block';tip.style.left=Math.max(4,Math.min(rect.width-tipWidth-4,vbX-tipWidth/2))+'px';
  tip.innerHTML='<strong>Año '+fmt(point.year)+'</strong><br>Capital neto real: <b>'+euro(point.real)+'</b><br>Dinero aportado: '+euro(point.contributedReal)+'<br>Ganancia real: '+euro(point.real-point.contributedReal);
 }
 svg.addEventListener('pointermove',inspect);
 svg.addEventListener('pointerdown',inspect);
 svg.addEventListener('pointerleave',()=>{tip.style.display='none';guide.setAttribute('opacity','0');dot.setAttribute('opacity','0');});
}
function runNetSimulation(){
 if(!engine||!fiscalConfig)return;
 const capitalField=$('netCapital');if(capitalField){capitalField.setCustomValidity('');if(capitalField.value.trim()==='')capitalField.value='0';}
 const assetName=$('netAsset').value,asset=assetName==='__manual__'?null:findAsset(assetName);
 currentAsset=asset;
 const results={prudente:calculate(asset,'prudente'),base:calculate(asset,'base'),optimista:calculate(asset,'optimista')};
 const active=selectedScenario==='custom'?calculate(asset,'custom'):results[selectedScenario]||results.base;
 if(active.error){$('netSimError').textContent=active.error;$('netSimError').classList.remove('net-sim-hidden');return;}
 $('netSimError').classList.add('net-sim-hidden');currentResult=active;
 const lo=Math.min(results.prudente.realFinal,results.base.realFinal,results.optimista.realFinal),hi=Math.max(results.prudente.realFinal,results.base.realFinal,results.optimista.realFinal);
 $('netRealFinal').textContent=euro(active.realFinal);
 const ibiAnnual=Number(active.assumptions.ibiAnnual||0),projectedIbi=ibiAnnual*Number(active.assumptions.years||0);
 $('netIbiHint').textContent=ibiAnnual>0
  ?'Cuota anual: '+euro(ibiAnnual)+'. En '+fmt(active.assumptions.years)+' años se imputan '+fmt(active.assumptions.years)+' cuotas anuales: '+euro(projectedIbi)+' en total (prorrateadas mes a mes).'
  :'Introduce el recibo anual. Se reparte en 12 partes durante cada año; al terminar cada año se habrá contabilizado exactamente una cuota anual.';
 $('netCostsTotal').textContent=euro(active.costs.total);
 $('netTaxesTotal').textContent=euro(active.taxes);
 const scenarioNames={prudente:'Prudente',base:'Base',optimista:'Optimista'};
 const comparisonScenarios=selectedScenario==='prudente'?['base','optimista']:selectedScenario==='optimista'?['prudente','base']:['prudente','optimista'];
 $('netRealRange').innerHTML=comparisonScenarios.map(key=>'<span>Escenario '+scenarioNames[key]+'<strong>'+euro(results[key].realFinal)+'</strong></span>').join('');
 $('netResultContext').textContent='En euros de hoy · '+(asset?asset.name:'rentabilidad manual')+' · escenario '+({prudente:'prudente',base:'base',optimista:'optimista'}[selectedScenario]);
 $('netContributed').textContent=euro(active.contributedNominal);
 $('netGain').textContent=euro(active.realGain);
 $('netAnnualized').textContent=active.realAnnualRate===null?'—':pct(active.realAnnualRate);
 const liq=asset&&Number.isFinite(Number(asset.liq))?'Nivel '+fmt(asset.liq)+'/10':'No especificada';
 $('netLiquidity').textContent=liq;
 buildWaterfall(active);graphSvg(results.prudente,selectedScenario==='custom'?active:results.base,results.optimista);
 $('netAssumptionLine').textContent='Rentabilidad: '+pct(active.assumptions.rate)+' · Inflación: '+pct(active.assumptions.inflation)+' · Costes: '+euro(active.costs.total)+' · Impuestos: '+euro(active.taxes)+' · Revisión fiscal: '+(fiscalConfig.lastReviewed||'no indicada')+'.';
 $('netUnknownCosts').classList.toggle('net-sim-hidden',!!assetDefaults(asset).known);
 const mgmt=asset&&asset.management!==undefined&&asset.management!==null&&asset.management!==''?Number(asset.management):NaN;
 $('netManagementHint').textContent=Number.isFinite(mgmt)?'Gestión orientativa de ficha: '+fmt(mgmt)+' h/mes.':'Horas de gestión no especificadas en la ficha.';
 window.invSimulationState={
  assetName:asset?.name||'Rentabilidad manual',type:'net-real',
  capital:active.assumptions.capital,monthly:active.assumptions.monthly,
  rate:active.assumptions.rate,years:active.assumptions.years,
  final:active.realFinal,contributed:active.contributedNominal,profit:active.realGain,
  comment:'Capital neto real estimado después de costes, impuestos e inflación.',
  netReal:true,assumptions:active.assumptions,costs:active.costs,taxes:active.taxes,netNominal:active.netNominal,realFinal:active.realFinal
 };
 runWhatIf(active);
}
function runWhatIf(base){
 if(!currentResult)return;
 const inflationAlt=calculate(currentAsset,selectedScenario,{inflation:num('netWhatInflation')});
 const lessRate=calculate(currentAsset,selectedScenario,{rate:num('netManualRate')-num('netWhatRate')});
 const extraMonthly=calculate(currentAsset,selectedScenario,{monthly:num('netMonthly')+num('netWhatMonthly')});
 const show=(id,res)=>{if(res.error){$(id).textContent='No disponible';return;}const diff=res.realFinal-base.realFinal;$(id).textContent=(diff>=0?'+':'−')+euro(Math.abs(diff))+' frente al escenario inicial';};
 $('netWhatInflationLabel').textContent=pct(num('netWhatInflation'));
 $('netWhatRateLabel').textContent='− '+pct(num('netWhatRate'));
 $('netWhatMonthlyLabel').textContent='+ '+euro(num('netWhatMonthly'))+'/mes';
 show('netWhatInflationResult',inflationAlt);show('netWhatRateResult',lessRate);show('netWhatMonthlyResult',extraMonthly);
}
function renderMode(mode){
 $('netModeOne').classList.toggle('net-sim-hidden',mode!=='one');
 $('netModeTwo').classList.toggle('net-sim-hidden',mode!=='two');
 document.querySelectorAll('[data-net-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.netMode===mode)));
 if(mode==='two')renderComparison();
}
function renderComparison(){compareAssets();}
function compareAssets(){
 // La comparación parte de los supuestos reales de la simulación individual activa.
 // Así todas las alternativas reciben exactamente el mismo capital, aportación, plazo,
 // inflación, costes e impuestos introducidos por el usuario; no se añaden costes de ficha.
 if(!currentResult)runNetSimulation();
 const commonInputs=currentResult?.assumptions?{...currentResult.assumptions}:readInputs(null);
 const selected=[1,2,3,4].map(n=>$('netCompare'+n).value).filter(Boolean);
 const unique=[...new Set(selected)].slice(0,4);
 compareResults=unique.map(name=>{
  const asset=findAsset(name);
  if(!asset)return null;
  const rate=selectedScenario==='custom'?num('netManualRate'):scenarioRate(asset,selectedScenario);
  const vacancy=isRentalAsset(asset)?(num('netVacancy')/12*100):0;
  const result=engine.calculate({...commonInputs,rate,vacancy},fiscalConfig);
  return {asset,result};
 }).filter(x=>x&&!x.result.error);
 if(!compareResults.length){$('netCompareOutput').innerHTML='<p class="net-sim-note">Elige al menos un activo para comparar.</p>';return;}
 const months=Math.round(Number(commonInputs.years||0)*12);
 const totalContributed=Number(commonInputs.capital||0)+Number(commonInputs.monthly||0)*months;
 const assumptionsLine='Misma simulación para todas las alternativas: '+euro(commonInputs.capital)+' iniciales · '+euro(commonInputs.monthly)+'/mes · '+fmt(commonInputs.years)+' años · '+euro(totalContributed)+' aportados en total. Se respetan los costes e impuestos que has activado y rellenado; no se incorporan importes automáticos de las fichas.';
 const rows=[
  ['Capital final real',x=>x.result.realFinal,'high',euro],
  ['Ganancia real',x=>x.result.realGain,'high',euro],
  ['Costes totales',x=>x.result.costs.total,'low',euro],
  ['Impuestos estimados',x=>x.result.taxes,'low',euro],
  ['Liquidez (ficha)',x=>Number(x.asset.liq),'high',v=>Number.isFinite(v)?fmt(v)+'/10':'—'],
  ['Gestión (h/mes)',x=>Number(x.asset.management),'low',v=>Number.isFinite(v)?fmt(v)+' h':'No indicada'],
  ['Riesgo (ficha)',x=>Number(x.asset.risk),'low',v=>Number.isFinite(v)?fmt(v)+'/10':'—'],
  ['Ganancia real por hora',x=>{const h=Number(x.asset.management);return Number.isFinite(h)&&h>0?x.result.realGain/(h*12*Number(commonInputs.years||0)):NaN;},'high',v=>Number.isFinite(v)?euro(v)+'/h':'No disponible']
 ];
 const best=row=>{const vals=compareResults.map(row[1]).filter(Number.isFinite);if(!vals.length)return null;return row[2]==='high'?Math.max(...vals):Math.min(...vals)};
 const head='<thead><tr><th>Indicador</th>'+compareResults.map(x=>'<th>'+esc(x.asset.name)+'</th>').join('')+'</tr></thead>';
 const body='<tbody>'+rows.map(row=>{const win=best(row);return '<tr><th>'+row[0]+'</th>'+compareResults.map(x=>{const raw=row[1](x),isBest=Number.isFinite(raw)&&win!==null&&raw===win;return '<td class="'+(isBest?'best':'')+'">'+(Number.isFinite(raw)?row[3](raw):'—')+'</td>';}).join('')+'</tr>';}).join('')+'</tbody>';
 $('netCompareOutput').innerHTML='<p class="net-sim-compare-summary">'+esc(assumptionsLine)+'</p><div class="net-sim-table-wrap"><table class="net-sim-compare-table">'+head+body+'</table></div><p class="net-sim-compare-summary">'+comparisonSentence(compareResults)+'</p><p class="net-sim-note">La ganancia por hora es orientativa: utiliza las horas mensuales indicadas en la ficha y no valora el tiempo de trabajo de forma económica. Liquidez y riesgo son puntuaciones del catálogo, no plazos ni garantías.</p>';
}
function comparisonSentence(items){
 if(items.length<2)return 'Añade al menos dos activos para describir sus diferencias.';
 const sorted=items.slice().sort((a,b)=>b.result.realFinal-a.result.realFinal),a=sorted[0],b=sorted[1],diff=a.result.realFinal-b.result.realFinal;
 const la=Number(a.asset.liq),lb=Number(b.asset.liq);
 let extra='';
 if(Number.isFinite(la)&&Number.isFinite(lb)&&la!==lb)extra=' La ficha asigna a '+a.asset.name+' una liquidez de '+fmt(la)+'/10 y a '+b.asset.name+' '+fmt(lb)+'/10.';
 return 'Con el mismo dinero, '+a.asset.name+' dejaría '+euro(diff)+' más que '+b.asset.name+' en este escenario.'+extra+' Son resultados hipotéticos, no una recomendación.';
}
function resolveCatalogAssetName(name){
 const exact=findAsset(name);if(exact)return exact.name;
 const key=normalizeAssetSearch(name);
 const aliases={
  'fondos indexados':'Fondos indexados de renta variable',
  'fondos de inversion de gestion activa':'Fondos de gestión activa de renta variable',
  'etfs indexados':'ETF de renta variable (índices amplios)',
  'etfs de gestion activa':'ETF de renta variable (índices amplios)',
  'acciones individuales':'Acciones nacionales',
  'acciones que pagan dividendos':'Acciones de dividendos',
  'bonos soberanos':'Bonos del Estado',
  'depositos bancarios':'Depósitos a plazo',
  'reits socimis':'REITs internacionales',
  'oro':'Oro (lingotes y monedas de inversión)',
  'criptomonedas':'Bitcoin',
  'viviendas para alquiler de larga duracion':'Viviendas',
  'viviendas para alquiler de temporada':'Viviendas',
  'viviendas para alquiler turistico':'Inmuebles turísticos',
  'habitaciones en alquiler':'Viviendas',
  'suelo o terrenos':'Suelo urbano',
  'compra reforma y venta de inmuebles':'Viviendas',
  'crowdfunding inmobiliario':'Préstamos inmobiliarios',
  'crear una empresa desde cero':'Negocios de servicios',
  'comprar una empresa en funcionamiento':'Empresas consolidadas',
  'comprar una participacion minoritaria en una empresa':'Empresas privadas',
  'negocios online':'Páginas web monetizadas',
  'crear y monetizar marcas digitales':'Marcas',
  'canales de youtube y medios digitales':'Negocios de contenido',
  'webs de nicho y negocios de afiliacion':'Páginas web monetizadas',
  'productos digitales':'Negocios de contenido',
  'saas o software por suscripcion':'Aplicaciones y software',
  'licencias royalties y propiedad intelectual':'Royalties y derechos de autor',
  'crowdlending':'Crowdlending a empresas',
  'capital riesgo y startups':'Capital semilla',
  'private equity':'Empresas consolidadas',
  'materias primas':'Materias primas agrícolas',
  'coleccionables y activos alternativos':'Otros objetos de colección'
 };
 const mapped=aliases[key];if(mapped&&findAsset(mapped))return mapped;
 const scored=assetList().map(asset=>({asset,score:assetSearchScore(asset,name)})).filter(x=>x.score>=400).sort((a,b)=>b.score-a.score);
 return scored[0]?.asset.name||null;
}
function setCompareOptions(){
 const list=assetList().slice().sort((a,b)=>a.name.localeCompare(b.name,'es'));
 [1,2,3,4].forEach(n=>{const s=$('netCompare'+n);if(!s)return;const old=s.value;s.innerHTML='<option value="">Seleccionar activo…</option>'+list.map(a=>'<option value="'+esc(a.name)+'">'+esc(a.name)+'</option>').join('');if(old&&list.some(a=>a.name===old))s.value=old;});
 const first=list.find(a=>a.name===currentAsset?.name)?.name||list[0]?.name||'';
 const second=list.find(a=>a.name!==first)?.name||'';
 $('netCompare1').value=first;$('netCompare2').value=second;
}
function shareLink(){
 const state={asset:$('netAsset').value,capital:$('netCapital').value,monthly:$('netMonthly').value,years:$('netYears').value,scenario:selectedScenario,entryFixed:$('netEntryFee').value,annualFixed:$('netAnnualFee').value,exitFixed:$('netExitFee').value,inflation:$('netInflation').value,vacancy:$('netVacancy').value,manual:$('netManualRate').value,taxSettings:Object.fromEntries(['netTaxSubject','netIncomeTaxEnabled','netIncomeTaxBase','netIncomeTaxRate','netIbiEnabled','netIbiAnnual','netAcquisitionTaxEnabled','netAcquisitionTaxType','netAcquisitionTaxRate','netAjdEnabled','netAjdRate','netMunicipalEnabled','netMunicipalExitTax','netOtherTaxEnabled','netOtherTaxName','netOtherEntryTax','netOtherAnnualTax'].map(id=>{const el=$(id);return [id,el.type==='checkbox'?el.checked:el.value]}))};
 const url=location.href.split('#')[0]+'#net-sim='+encodeURIComponent(JSON.stringify(state));
 if(navigator.share){navigator.share({title:'Mi simulación en Inversora',url}).catch(()=>{});}
 else if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>toast('Enlace copiado. Reproduce los mismos supuestos.')).catch(()=>prompt('Copia este enlace',url));}
 else prompt('Copia este enlace',url);
}
function loadShared(){
 const raw=location.hash.match(/net-sim=(.*)$/);if(!raw)return;
 try{
  const s=JSON.parse(decodeURIComponent(raw[1]));
  $('netAsset').value=s.asset||'__manual__';
  ['capital','monthly','years'].forEach(k=>{if(s[k]!==undefined)$('net'+k[0].toUpperCase()+k.slice(1)).value=s[k];});
  $('netEntryFee').value=s.entryFixed??s.entry??0;$('netAnnualFee').value=s.annualFixed??s.annual??0;$('netExitFee').value=s.exitFixed??s.exit??0;
  $('netInflation').value=s.inflation??2;$('netVacancy').value=s.vacancy??0;$('netManualRate').value=s.manual??5;
  selectedScenario=s.scenario||'base';
  document.querySelectorAll('[data-net-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.netScenario===selectedScenario)));
  loadAssetDefaults(findAsset($('netAsset').value));
  if(s.asset==='__manual__')$('netAsset').value='__manual__';
  if(s.taxSettings)Object.entries(s.taxSettings).forEach(([id,value])=>{const el=$(id);if(el){if(el.type==='checkbox')el.checked=!!value;else el.value=value;}});
  updateTaxControls();runNetSimulation();
 }catch(e){console.warn('No se pudo leer el enlace de simulación',e);}
}
function saveLocal(){
 const key='inversora_net_simulations';let items=[];
 try{items=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}
 const state={...window.invSimulationState,savedAt:new Date().toISOString(),inflation:num('netInflation'),entryFee:0,entryFixed:num('netEntryFee'),annualFee:0,annualFixed:num('netAnnualFee'),exitFee:0,exitFixed:num('netExitFee'),taxSettings:Object.fromEntries(['netTaxSubject','netIncomeTaxEnabled','netIncomeTaxBase','netIncomeTaxRate','netIbiEnabled','netIbiAnnual','netAcquisitionTaxEnabled','netAcquisitionTaxType','netAcquisitionTaxRate','netAjdEnabled','netAjdRate','netMunicipalEnabled','netMunicipalExitTax','netOtherTaxEnabled','netOtherEntryTax','netOtherAnnualTax'].map(id=>{const el=$(id);return [id,el.type==='checkbox'?el.checked:el.value]}))};
 items.unshift(state);localStorage.setItem(key,JSON.stringify(items.slice(0,20)));toast('Simulación guardada en este dispositivo.');
}

async function saveSimulationToAccount(){
 if(!invUser){if(typeof showView==='function')showView('account');if(typeof invNotice==='function')invNotice('Inicia sesión para guardar simulaciones en tu cuenta.');return;}
 if(!window.invSimulationState||!currentResult){toast('Primero realiza una simulación válida.');return;}
 const title=prompt('Pon un nombre a esta simulación:',(currentAsset?.name||'Simulación')+' · '+new Date().toLocaleDateString('es-ES'));
 if(title===null)return;
 const cleanTitle=String(title).trim().slice(0,100);
 if(!cleanTitle){toast('Escribe un nombre para guardar la simulación.');return;}
 const form={};
 document.querySelectorAll('#netModeOne input[id],#netModeOne select[id],#netModeOne textarea[id]').forEach(el=>{
  form[el.id]=el.type==='checkbox'?el.checked:el.value;
 });
 const snapshot={version:1,scenario:selectedScenario,assetName:$('netAsset').value,form};
 const summary={
  final:Number(currentResult.realFinal||0),
  contributed:Number(currentResult.contributedNominal||0),
  profit:Number(currentResult.realGain||0),
  rate:Number(currentResult.assumptions?.rate||0),
  years:Number(currentResult.assumptions?.years||0),
  costs:Number(currentResult.costs?.total||0),
  taxes:Number(currentResult.taxes||0)
 };
 const button=$('netSaveAccount');if(button){button.disabled=true;button.textContent='Guardando…';}
 try{
  const {data,error}=await invDb.from('saved_simulations').insert({
   user_id:invUser.id,title:cleanTitle,asset_name:window.invSimulationState.assetName||'Rentabilidad manual',
   snapshot,summary
  }).select('id,title,asset_name,snapshot,summary,created_at').single();
  if(error)throw error;
  if(savedSimulationsUserId!==invUser.id){savedSimulationsCache=[];savedSimulationsUserId=invUser.id;}
  savedSimulationsCache=[data,...(savedSimulationsCache||[])];
  toast('Simulación guardada en tu cuenta.');
  renderSavedSimulationsPanel();
 }catch(error){
  console.error('Inversora: error guardando simulación:',error);
  toast('No se ha podido guardar. Inténtalo de nuevo.');
  if(typeof invNotice==='function')invNotice('No se ha podido guardar la simulación: '+(error.message||'Error de conexión.'));
 }finally{if(button){button.disabled=false;button.textContent='Guardar en mi cuenta';}}
}
let savedSimulationsCache=null,savedSimulationsUserId=null;
async function loadSavedSimulations(){
 if(!invUser){savedSimulationsCache=[];savedSimulationsUserId=null;return [];}
 if(savedSimulationsUserId===invUser.id&&Array.isArray(savedSimulationsCache))return savedSimulationsCache;
 const uid=invUser.id;
 const {data,error}=await invDb.from('saved_simulations').select('id,title,asset_name,snapshot,summary,created_at').eq('user_id',uid).order('created_at',{ascending:false});
 if(error)throw error;
 if(invUser?.id!==uid)return [];
 savedSimulationsUserId=uid;savedSimulationsCache=data||[];
 return savedSimulationsCache;
}
function renderSavedSimulationsPanel(){
 const host=document.getElementById('favoritesWorkspace');if(!host)return;
 host.querySelector('#savedSimulationsSection')?.remove();
 if(!invUser)return;
 const section=document.createElement('section');section.id='savedSimulationsSection';section.className='saved-simulations-section';
 section.innerHTML='<div class="section-head"><div><h2>Mis simulaciones guardadas</h2><small>Guarda tus cálculos y recupéralos cuando quieras, también desde otros dispositivos.</small></div><span class="soft-badge" id="savedSimulationsCount">—</span></div><div id="savedSimulationsGrid" class="saved-simulations-grid"><p class="net-sim-note">Cargando tus simulaciones…</p></div>';
 host.appendChild(section);
 loadSavedSimulations().then(items=>{
  if(!section.isConnected)return;
  const count=section.querySelector('#savedSimulationsCount'),grid=section.querySelector('#savedSimulationsGrid');
  if(count)count.textContent=items.length+' guardadas';
  if(!items.length){grid.innerHTML='<div class="favorites-empty"><div class="big-heart">▤</div><h3>Aún no has guardado simulaciones</h3><p>Cuando hagas un cálculo en el simulador, pulsa «Guardar en mi cuenta» para conservar todos sus datos.</p><button class="apply-filters" onclick="showView(\'sim\')">Ir al simulador</button></div>';return;}
  grid.innerHTML=items.map(item=>{
   const summary=item.summary||{},date=item.created_at?new Date(item.created_at).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}):'';
   return '<article class="saved-simulation-card"><div class="saved-simulation-top"><span class="saved-simulation-icon">▤</span><span class="saved-simulation-date">'+esc(date)+'</span></div><h3>'+esc(item.title)+'</h3><p>'+esc(item.asset_name||'Rentabilidad manual')+'</p><div class="saved-simulation-metrics"><div><small>Capital neto real</small><b>'+euro(summary.final||0)+'</b></div><div><small>Plazo</small><b>'+fmt(summary.years||0)+' años</b></div><div><small>Rentabilidad</small><b>'+pct(summary.rate||0)+'</b></div></div><div class="saved-simulation-actions"><button type="button" class="primary" onclick="restoreSavedSimulation(\''+item.id+'\')">Abrir simulación</button><button type="button" class="saved-simulation-delete" onclick="deleteSavedSimulation(\''+item.id+'\')">Eliminar</button></div></article>';
  }).join('');
 }).catch(error=>{
  console.error('Inversora: no se pudieron cargar las simulaciones guardadas:',error);
  const grid=section.querySelector('#savedSimulationsGrid');if(grid)grid.innerHTML='<p class="net-sim-note">No se han podido cargar tus simulaciones. Recarga la página e inténtalo de nuevo.</p>';
 });
}
window.restoreSavedSimulation=async function(id){
 try{
  const items=await loadSavedSimulations(),item=items.find(x=>x.id===id);if(!item)return;
  const snapshot=item.snapshot||{};
  if(typeof showView==='function')showView('sim');
  renderMode('one');
  const assetName=snapshot.assetName||'__manual__';
  $('netAsset').value=assetName;
  loadAssetDefaults(findAsset(assetName));
  Object.entries(snapshot.form||{}).forEach(([id,value])=>{
   const el=$(id);if(!el)return;
   if(el.type==='checkbox')el.checked=!!value;else el.value=value;
  });
  selectedScenario=snapshot.scenario||'base';
  document.querySelectorAll('[data-net-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.netScenario===selectedScenario)));
  $('netAssetSearch').value=$('netAsset').value==='__manual__'?'Rentabilidad manual':$('netAsset').value;
  renderAssetPicker('',false);updateCostControls();updateTaxFieldControls();updateTaxControls();runNetSimulation();
  toast('Simulación recuperada.');
 }catch(error){console.error('Inversora: no se pudo recuperar la simulación:',error);toast('No se ha podido abrir la simulación.');}
};
window.deleteSavedSimulation=async function(id){
 if(!confirm('¿Quieres eliminar esta simulación guardada?'))return;
 try{
  const {error}=await invDb.from('saved_simulations').delete().eq('id',id).eq('user_id',invUser.id);
  if(error)throw error;
  savedSimulationsCache=(savedSimulationsCache||[]).filter(item=>item.id!==id);
  renderSavedSimulationsPanel();toast('Simulación eliminada.');
 }catch(error){console.error('Inversora: no se pudo eliminar la simulación:',error);toast('No se ha podido eliminar.');}
};
function installSavedSimulationsUI(){
 const actions=$('netSave')?.parentElement;
 if(actions&&!$('netSaveAccount')){
  const button=document.createElement('button');button.type='button';button.id='netSaveAccount';button.className='primary';button.textContent='Guardar en mi cuenta';
  actions.insertBefore(button,actions.firstChild);button.addEventListener('click',saveSimulationToAccount);
 }
 if(typeof window.renderFavorites==='function'&&!window.renderFavorites.__savedSimulationsWrapped){
  const original=window.renderFavorites;
  const wrapped=function(){original.apply(this,arguments);renderSavedSimulationsPanel();};
  wrapped.__savedSimulationsWrapped=true;window.renderFavorites=wrapped;
 }
 if(document.getElementById('favoritesWorkspace')&&invUser)renderSavedSimulationsPanel();
}

function printShell(title,content,extraCss=''){
 // Informe autónomo: no copiar reglas globales @media print que ocultan el documento.
 const logo=document.querySelector('.inv-header .logo');
 const logoHtml=logo?logo.outerHTML:'<span class="brand-word">Invers<span>ora</span></span>';
 const win=window.open('','_blank');
 if(!win){alert('Permite las ventanas emergentes para abrir la vista de impresión.');return null;}
 const safeTitle=String(title).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const css='@page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}html,body{min-height:100%;background:#fff!important;color:#101828!important}body{margin:0!important;padding:0!important;font-family:Arial,Helvetica,sans-serif!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.print-page{width:100%;max-width:190mm;margin:0 auto}.print-brand-header{display:flex;justify-content:flex-end;align-items:center;padding:0 0 5mm;margin:0 0 7mm;border-bottom:1px solid #d8e4f4}.print-brand-header .logo{display:inline-flex!important;align-items:center!important;gap:10px!important;padding:0!important;border:0!important;background:transparent!important;color:#101828!important;font-size:25px!important;font-weight:850!important;letter-spacing:-1px!important;white-space:nowrap!important}.print-brand-header .logo:before{content:""!important;background-image:url("/icon-192.svg")!important;background-size:cover!important;background-position:center!important;box-shadow:0 4px 12px #155eef25!important;width:36px!important;height:36px!important;flex:0 0 36px!important;border-radius:11px!important}.print-brand-header .brand-word{display:inline-flex;align-items:center;letter-spacing:-1px}.print-brand-header .brand-word>span{color:#155eef;margin-left:0}.print-actions{display:flex;gap:9px;margin:0 0 18px}.print-actions button{border:0;border-radius:10px;padding:10px 15px;background:#155eef;color:#fff;font-weight:750;cursor:pointer}.print-actions .secondary{background:#eef4ff;color:#1849a9}.print-report-title{margin:0 0 5px;font-size:25px;letter-spacing:-.7px;color:#142b50}.print-report-subtitle{margin:0;color:#667085;font-size:12px}.print-section{margin:18px 0 0}.print-section h2{font-size:14px;color:#142b50;margin:0 0 8px}.print-table{width:100%;border-collapse:collapse;border:1px solid #dfe7f2;border-radius:10px;overflow:hidden;background:#fff}.print-table th,.print-table td{padding:8px 10px;border-bottom:1px solid #e8edf5;font-size:11px;line-height:1.35}.print-table th{text-align:left;background:#f2f6fc;color:#526783;font-weight:750}.print-table td:last-child{text-align:right;font-weight:750;font-variant-numeric:tabular-nums;white-space:nowrap}.print-table tr:last-child td{border-bottom:0}.print-table .total-row td{background:#f2f6ff;color:#1849a9;font-weight:850}.print-table .final-row td{background:#142b50;color:#fff;font-weight:850}.print-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.print-fact{padding:9px 10px;border:1px solid #e2eaf4;border-radius:9px;background:#fbfcfe;break-inside:avoid}.print-fact small{display:block;color:#667085;font-size:9px;margin-bottom:4px}.print-fact b{display:block;color:#142b50;font-size:11px;overflow-wrap:anywhere}.print-note{margin:14px 0 0;padding:10px 12px;background:#f5f8fc;border:1px solid #e5edf7;border-radius:9px;color:#667085;font-size:9px;line-height:1.5}@media print{.print-actions{display:none!important}.print-page{max-width:none}.print-table tr{break-inside:avoid}}'+extraCss;
 win.document.open();
 win.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+safeTitle+'</title><style>'+css+'</style></head><body><div class="print-page"><div class="print-brand-header">'+logoHtml+'</div>'+content+'</div></body></html>');
 win.document.close();
 // No dependemos de load/fonts: el informe es autosuficiente y sus estilos son inline.
 // Los botones se habilitan inmediatamente (el listener load podía dispararse antes de registrarse).
 const printButton=win.document.querySelector('.print-actions button:not(.secondary)');
 const closeButton=win.document.querySelector('.print-actions button.secondary');
 if(printButton){printButton.disabled=false;printButton.removeAttribute('disabled');printButton.addEventListener('click',()=>{try{win.focus();win.print();}catch(err){console.error('Print summary:',err);}});}
 if(closeButton){closeButton.disabled=false;closeButton.addEventListener('click',()=>win.close());}
 try{win.focus();}catch(e){}
 return win;
}
function openNetSummary(){
 if(!currentResult||currentResult.error){toast('Primero completa una simulación válida.');return;}
 const r=currentResult,a=r.assumptions||{},tb=r.taxBreakdown||{},money=v=>euro(Number(v)||0),percent=v=>pct(Number(v)||0);
 const assetName=currentAsset?.name||'Rentabilidad manual';
 const scenarioName=({prudente:'Prudente',base:'Base',optimista:'Optimista',custom:'Manual'}[selectedScenario]||selectedScenario);
 const prudent=calculate(currentAsset,'prudente'),base=calculate(currentAsset,'base'),optimistic=calculate(currentAsset,'optimista');
 const fact=(label,value)=>'<div class="print-fact"><small>'+label+'</small><b>'+value+'</b></div>';
 const row=(label,value,cls='')=>'<tr class="'+cls+'"><td>'+label+'</td><td>'+value+'</td></tr>';
 const scenarioRows=(selectedScenario==='custom'?[['Prudente',prudent],['Manual',r],['Optimista',optimistic]]:[['Prudente',prudent],['Base',base],['Optimista',optimistic]]).map(([label,res])=>row(label,res.error?'—':money(res.realFinal),label.toLowerCase()===scenarioName.toLowerCase()?'total-row':'')).join('');
 const outputRows=[
  row('Total de capital aportado',money(r.contributedNominal)),
  row('Capital final bruto proyectado',money(r.grossFinal)),
  row('Rendimiento bruto generado',money(Number(r.grossFinal||0)-Number(r.contributedNominal||0))),
  row('Costes de entrada',money(r.costs?.entry)),
  row('Costes periódicos',money(r.costs?.recurring)),
  row('Costes de salida',money(r.costs?.exit)),
  row('Total de costes',money(r.costs?.total),'total-row'),
  row('Impuestos de adquisición',money(tb.acquisition)),
  row('Otros impuestos de entrada',money(tb.otherEntry)),
  row('Impuestos recurrentes',money(tb.recurring)),
  row('IRPF / Impuesto sobre Sociedades estimado',money(tb.income)),
  row('Plusvalía municipal estimada',money(tb.municipal)),
  row('Total de impuestos',money(r.taxes),'total-row'),
  row('Capital final neto nominal',money(r.netNominal)),
  row('Capital final neto real (euros de hoy)',money(r.realFinal),'final-row'),
  row('Ganancia / pérdida real estimada',money(r.realGain),'final-row')
 ].join('');
 const assumptions=[
  fact('Activo',assetName),fact('Escenario aplicado',scenarioName),fact('Capital inicial',money(a.capital)),
  fact('Aportación mensual',money(a.monthly)),fact('Plazo',String(a.years||0)+' años'),fact('Rentabilidad anual',percent(a.rate)),
  fact('Inflación anual',percent(a.inflation)),fact('Titular fiscal',$('netTaxSubject')?.value==='company'?'Sociedad':'Persona física'),
  fact('Vacancia anual',Number(a.vacancy||0)>0?percent(a.vacancy):'No aplicada')
 ].join('');
 const html='<div class="print-actions"><button disabled onclick="window.print()">Imprimir tabla / Guardar como PDF</button><button class="secondary" onclick="window.close()">Cerrar</button></div><h1 class="print-report-title">Resumen de la simulación</h1><p class="print-report-subtitle">'+assetName+' · Generado el '+new Date().toLocaleDateString('es-ES')+'</p><section class="print-section"><h2>Datos de la simulación</h2><div class="print-facts">'+assumptions+'</div></section><section class="print-section"><h2>Resultado por escenario · capital final real</h2><table class="print-table"><thead><tr><th>Escenario</th><th>Resultado</th></tr></thead><tbody>'+scenarioRows+'</tbody></table></section><section class="print-section"><h2>Desglose completo del resultado</h2><table class="print-table"><thead><tr><th>Concepto</th><th>Importe</th></tr></thead><tbody>'+outputRows+'</tbody></table></section><p class="print-note">Simulación orientativa basada en los datos introducidos. El capital final real está expresado en euros de hoy y descuenta el efecto estimado de la inflación. Los costes e impuestos solo se incluyen si se han activado y configurado manualmente. La fiscalidad es simplificada y no sustituye una liquidación fiscal ni el asesoramiento profesional.</p>';
 printShell('Resumen de la simulación · Inversora',html);
}
function openSimulationPrint(){
 if(!currentResult||currentResult.error){toast('Primero completa una simulación válida.');return;}
 // Abrimos la ventana de forma síncrona desde el clic para evitar bloqueadores de ventanas emergentes.
 const popup=window.open('about:blank','_blank');
 if(!popup){alert('Permite las ventanas emergentes para abrir la vista de impresión.');return;}
 const sourceHeader=document.querySelector('.inv-header'),sourceSim=document.getElementById('sim');
 if(!sourceHeader||!sourceSim){popup.close();toast('No se ha podido preparar la simulación para imprimir.');return;}
 const header=sourceHeader.cloneNode(true),sim=sourceSim.cloneNode(true);
 sim.classList.remove('hidden');
 // Copiar el estado real de los controles: cloneNode no conserva value/checked.
 const sourceFields=sourceSim.querySelectorAll('input,select,textarea'),targetFields=sim.querySelectorAll('input,select,textarea');
 sourceFields.forEach((field,index)=>{const target=targetFields[index];if(!target)return;if(field.type==='checkbox'||field.type==='radio')target.checked=field.checked;else target.value=field.value;});
 sourceSim.querySelectorAll('details').forEach((details,index)=>{const target=sim.querySelectorAll('details')[index];if(target)target.open=details.open;});
 header.querySelectorAll('.desktop-main-nav,.header-actions,.global-search-panel').forEach(el=>el.remove());
 const brand=header.querySelector('.header-brand-group');if(brand){brand.style.display='flex';brand.style.justifyContent='flex-end';brand.style.width='100%';}
 sim.querySelectorAll('.net-sim-actions,.net-sim-modebar,.net-asset-results,#netChartTooltip').forEach(el=>el.remove());
 const styles=[...document.querySelectorAll('style')].filter(el=>el.id!=='netSimulationPrintStyles').map(el=>'<style>'+el.textContent+'</style>').join('');
 const links=[...document.querySelectorAll('link[rel="stylesheet"]')].map(el=>'<link rel="stylesheet" href="'+el.href+'">').join('');
 // Algunas hojas globales de fichas aplican body * {visibility:hidden} al imprimir.
 // Como esta ventana contiene exclusivamente el simulador, forzamos su visibilidad al final de la cascada.
 const printCss='@page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}html,body{margin:0!important;padding:0!important;width:100%!important;min-height:0!important;height:auto!important;overflow:visible!important;background:#fff!important;color:#101828!important}body{font-family:Inter,Arial,sans-serif!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}body *{visibility:visible!important}.app{display:block!important;visibility:visible!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important}.inv-header{position:static!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;width:100%!important;max-width:none!important;margin:0 0 7mm!important;padding:0 0 4mm!important;border:0!important;border-bottom:1px solid #d8e4f4!important;border-radius:0!important;box-shadow:none!important;background:#fff!important;transform:none!important}.inv-header .header-brand-group{display:flex!important;justify-content:flex-end!important;width:100%!important}.inv-header .logo{display:inline-flex!important;align-items:center!important;padding:0!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important}#sim{display:block!important;position:static!important;visibility:visible!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;overflow:visible!important;background:#fff!important}#sim>.tool-page{display:block!important;visibility:visible!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important}#sim .tool-hero{margin:0 0 6mm!important;padding:0 0 4mm!important;box-shadow:none!important}#netModeOne{display:block!important;visibility:visible!important}#netModeTwo{display:none!important}.net-sim-shell{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:6mm!important;align-items:start!important}.net-sim-panel,.net-sim-output{display:block!important;visibility:visible!important;min-width:0!important;margin:0!important;box-shadow:none!important}.net-sim-output{margin-top:5mm!important}.net-sim-panel,.net-sim-card,.net-sim-result{padding:12px!important;border-radius:10px!important;break-inside:auto!important;page-break-inside:auto!important;box-shadow:none!important}.net-sim-stat,.net-sim-whatif-item{break-inside:avoid!important;page-break-inside:avoid!important}.net-sim-stats{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}.net-sim-whatif{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}#netGraph svg,#netInteractiveChart{display:block!important;visibility:visible!important;max-width:100%!important;height:auto!important}input,select,textarea{color:#101828!important;background:#fff!important;box-shadow:none!important;opacity:1!important}.net-sim-result{background:#142b50!important;color:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.net-sim-actions,.net-sim-modebar,.net-asset-results,.net-sim-reset,.print-screen-actions{display:none!important}.net-sim-advanced:not([open])>*:not(summary){display:none!important}.net-sim-advanced[open] .net-sim-sub-advanced:not([open])>*:not(summary){display:none!important}@media screen{body{background:#eef2f7!important;padding:20px!important}.app{max-width:900px!important;margin:0 auto!important;padding:20px!important;background:#fff!important;border-radius:14px!important;box-shadow:0 10px 40px #10182818!important}.print-screen-actions{display:flex!important;gap:10px!important;margin:0 0 16px!important}.print-screen-actions button{border:0;border-radius:9px;padding:10px 16px;background:#155eef;color:#fff;font-weight:700;cursor:pointer}.print-screen-actions .secondary{background:#eaf1ff;color:#1749a9}}@media print{html,body{display:block!important;visibility:visible!important;width:100%!important;height:auto!important;overflow:visible!important}body *{visibility:visible!important}.print-screen-actions{display:none!important}}';
 const doc='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="'+location.origin+'/"><title>Simulación · Inversora</title>'+links+styles+'<style>'+printCss+'</style></head><body><div class="app">'+header.outerHTML+'<div class="print-screen-actions"><button type="button" id="printNow">Imprimir</button><button type="button" class="secondary" id="closePrint">Cerrar</button></div>'+sim.outerHTML+'</div></body></html>';
 popup.document.open();popup.document.write(doc);popup.document.close();
 const printNow=()=>{try{popup.focus();popup.print();}catch(err){console.error('Print simulation:',err);}};
 popup.document.getElementById('printNow')?.addEventListener('click',printNow);
 popup.document.getElementById('closePrint')?.addEventListener('click',()=>popup.close());
 // Espera a las hojas enlazadas y a las fuentes; no depende del evento load de about:blank.
 const sheets=[...popup.document.querySelectorAll('link[rel="stylesheet"]')];
 const sheetReady=sheets.map(link=>link.sheet?Promise.resolve():new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;resolve();};link.addEventListener('load',finish,{once:true});link.addEventListener('error',finish,{once:true});popup.setTimeout(finish,7000);}));
 const fontsReady=popup.document.fonts?.ready||Promise.resolve();
 Promise.race([Promise.all([...sheetReady,fontsReady]),new Promise(resolve=>popup.setTimeout(resolve,8000))]).then(()=>popup.setTimeout(printNow,120));
}
function init(){
 installSavedSimulationsUI();
 $('netTaxProfileHint')?.remove();$('netAssetTaxAdvice')?.remove();
 // Los desplegables avanzados siempre comienzan cerrados, incluso si el navegador restaura su estado anterior.
 document.querySelectorAll('#netAdvanced, #netAdvanced > details').forEach(section=>{section.open=false;});
 fetch('fiscalidad-espana.json').then(r=>{if(!r.ok)throw new Error('No se pudo cargar la configuración fiscal');return r.json();}).then(c=>{fiscalConfig=c;populateAssetOptions();if(location.hash.includes('net-sim=')){loadShared();}else{const initialAsset=resolveCatalogAssetName('Fondos indexados')||assetList()[0]?.name||'__manual__';$('netAsset').value=initialAsset;loadAssetDefaults(findAsset(initialAsset));}$('netAssetSearch').value=$('netAsset').value==='__manual__'?'Rentabilidad manual':$('netAsset').value;renderAssetPicker('',false);setCompareOptions();}).catch(err=>{$('netSimError').textContent='No se ha podido cargar la configuración fiscal. Recarga la página o inténtalo más tarde.';$('netSimError').classList.remove('net-sim-hidden');console.error(err);});
 $('netAssetSearch').addEventListener('input',e=>{assetCategoryFilter='';populateAssetOptions(e.target.value,true);});
 $('netAssetSearch').addEventListener('focus',()=>{
  const input=$('netAssetSearch'),selected=$('netAsset').value;
  if(input.value===selected||(selected==='__manual__'&&input.value==='Rentabilidad manual')){
   renderAssetPicker('',false);input.select();return;
  }
  renderAssetPicker(input.value,true);
 });
 $('netAssetSearch').addEventListener('keydown',e=>{if(e.key==='Escape'){renderAssetPicker($('netAssetSearch').value,false);$('netAssetSearch').blur();}else if(e.key==='Enter'){const first=$('netAssetResults')?.querySelector('[data-net-asset-option]');if(first){e.preventDefault();chooseNetAsset(first.dataset.netAssetOption);}}});
 $('netAssetResults').addEventListener('click',e=>{const option=e.target.closest('[data-net-asset-option]'),category=e.target.closest('[data-net-asset-category]'),manual=e.target.closest('[data-net-asset-manual]');if(option)chooseNetAsset(option.dataset.netAssetOption);else if(category){assetCategoryFilter=category.dataset.netAssetCategory||'';$('netAssetSearch').value='';populateAssetOptions('',true);}else if(manual)chooseNetAsset('__manual__');});
 $('netAssetSearchClear').addEventListener('click',()=>{$('netAssetSearch').value='';populateAssetOptions('',true);$('netAssetSearch').focus();});
 document.addEventListener('click',e=>{if(!$('netAssetPicker')?.contains(e.target))renderAssetPicker($('netAssetSearch')?.value||'',false);});
 $('netAsset').addEventListener('change',()=>{loadAssetDefaults(findAsset($('netAsset').value));$('netAssetSearch').value=$('netAsset').value==='__manual__'?'Rentabilidad manual':$('netAsset').value;renderAssetPicker('',false);});
 ['netCapital','netMonthly','netYears','netEntryFee','netAnnualFee','netExitFee','netEntryCostEnabled','netAnnualCostEnabled','netExitCostEnabled','netInflation','netVacancy'].forEach(id=>$(id).addEventListener('input',()=>{updateCostControls();runNetSimulation();}));
 $('netManualRate').addEventListener('input',()=>{selectedScenario='custom';document.querySelectorAll('[data-net-scenario]').forEach(b=>b.setAttribute('aria-pressed','false'));runNetSimulation();});
 document.querySelectorAll('[data-net-scenario]').forEach(b=>b.addEventListener('click',()=>setScenario(b.dataset.netScenario)));
 document.querySelectorAll('[data-net-mode]').forEach(b=>b.addEventListener('click',()=>renderMode(b.dataset.netMode)));
 $('netResetAdvanced').addEventListener('click',()=>{
  $('netCapital').value='10000';$('netMonthly').value='300';$('netYears').value='15';$('netInflation').value='2';$('netVacancy').value='0';
  loadAssetDefaults(currentAsset);
  $('netWhatInflation').value='2';$('netWhatRate').value='1';$('netWhatMonthly').value='100';
  updateCostControls();updateTaxFieldControls();updateTaxControls();runNetSimulation();
 });
 ['netTaxSubject','netIncomeTaxEnabled','netIncomeTaxBase','netIncomeTaxRate','netIbiEnabled','netIbiAnnual','netAcquisitionTaxEnabled','netAcquisitionTaxType','netAcquisitionTaxRate','netAjdEnabled','netAjdRate','netMunicipalEnabled','netMunicipalExitTax','netOtherTaxEnabled','netOtherEntryTax','netOtherAnnualTax'].forEach(id=>$(id).addEventListener('input',()=>{updateTaxFieldControls();updateTaxControls();runNetSimulation();}));
 $('netIncomeTaxRate').addEventListener('change',()=>{updateTaxControls();runNetSimulation();});
 $('netIncomeTaxRate').addEventListener('blur',()=>{updateTaxControls();runNetSimulation();});
 $('netTaxSubject').addEventListener('change',()=>{if($('netTaxSubject').value==='company')$('netIncomeTaxRate').value='25';else $('netIncomeTaxRate').value='';$('netIncomeTaxTitle').textContent=$('netTaxSubject').value==='company'?'Impuesto sobre Sociedades':'IRPF';updateTaxControls();runNetSimulation();});
 $('netAcquisitionTaxType').addEventListener('change',()=>{const el=$('netAcquisitionTaxType');if(el.value==='iva'&&el.dataset.ivaRate)$('netAcquisitionTaxRate').value=el.dataset.ivaRate;else if(el.value==='itp'&&el.dataset.itpRate)$('netAcquisitionTaxRate').value=el.dataset.itpRate;else $('netAcquisitionTaxRate').value='';updateTaxControls();runNetSimulation();});
 $('netIncomeTaxBase').addEventListener('change',()=>{updateTaxControls();runNetSimulation();});
 ['netWhatInflation','netWhatRate','netWhatMonthly'].forEach(id=>$(id).addEventListener('input',()=>runWhatIf(currentResult)));
 [1,2,3,4].forEach(n=>$('netCompare'+n).addEventListener('change',renderComparison));
 $('netSave').addEventListener('click',saveLocal);$('netShare').addEventListener('click',shareLink);$('netSummaryTable').addEventListener('click',openNetSummary);$('netPrintSimulation').addEventListener('click',openSimulationPrint);
 $('netShareCommunity').addEventListener('click',()=>{if(typeof shareSimulationToCommunity==='function')shareSimulationToCommunity();});
 $('netCompareLaunch').addEventListener('click',simulateComparedAssets);
 const originalShow=window.showView;
 if(typeof originalShow==='function')window.showView=function(id){originalShow(id);if(id==='sim')runNetSimulation();};
 window.shareSimulationToCommunity=async function(){
 if(!invUser){showView('account');return alert('Inicia sesión para compartir una simulación.');}
 if(!window.invSimulationState)return;
 const body=prompt('Añade un comentario a tu simulación:','Comparto este escenario para conocer otros puntos de vista.');if(body===null)return;
 const snapshot={type:'net_real_simulation',...window.invSimulationState,assumptions:window.invSimulationState.assumptions,costs:window.invSimulationState.costs,taxes:window.invSimulationState.taxes};
 const {error}=await invDb.from('community_posts').insert({user_id:invUser.id,topic:'Simulación de dinero neto real',body:body.trim()||'Comparto mi simulación de inversión.',list_snapshot:snapshot});
 if(error)return alert('No se ha podido compartir la simulación: '+error.message);
 await renderCommunity();showView('community');if(typeof invNotice==='function')invNotice('Tu simulación se ha compartido en Comunidad.');
};
window.simulate=runNetSimulation;
 window.populateSimulatorInvestments=()=>populateAssetOptions();
 window.applyInvestmentAssumption=()=>loadAssetDefaults(findAsset($('netAsset').value));
 function openSingleAssetSimulator(name){
  const assetName=resolveCatalogAssetName(name)||'__manual__';
  const asset=findAsset(assetName);
  $('netAsset').value=assetName;
  $('netAssetSearch').value=assetName==='__manual__'?'Rentabilidad manual':assetName;
  loadAssetDefaults(asset);
  renderAssetPicker('',false);
  showView('sim');
  renderMode('one');
  runNetSimulation();
  showAssetTaxAdvice(asset);
 }
 window.simulateInvestment=openSingleAssetSimulator;
 window.simulateAssetFromDetail=openSingleAssetSimulator;
 window.openInvestmentReport=openNetSummary;
 window.simulateComparedAssets=simulateComparedAssets;
 }
function simulateComparedAssets(){
 const requested=typeof compareNames!=='undefined'&&Array.isArray(compareNames)?compareNames:[];
 const resolved=[...new Set(requested.map(resolveCatalogAssetName).filter(Boolean))].slice(0,4);
 const current=[1,2,3,4].map(n=>$('netCompare'+n)?.value).filter(Boolean);
 const selected=resolved.length?resolved:current;
 if(selected.length===1){
  const fallback=assetList().find(a=>a.name!==selected[0])?.name;
  if(fallback)selected.push(fallback);
 }
 [1,2,3,4].forEach((n,i)=>{$('netCompare'+n).value=selected[i]||'';});
 showView('sim');
 renderMode('two');
 renderComparison();
}
window.simulateComparedAssets=simulateComparedAssets;
window.renderNetSimulation=runNetSimulation;
document.addEventListener('DOMContentLoaded',init);
if(document.readyState!=='loading')init();
})();