/* Inversora · interfaz del simulador de dinero neto real */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const engine=window.InversoraNetEngine;
let fiscalConfig=null,selectedScenario='base',currentResult=null,currentAsset=null,compareResults=[];
const fmt=n=>Number(n||0).toLocaleString('es-ES',{minimumFractionDigits:0,maximumFractionDigits:2});
const euro=n=>Number(n||0).toLocaleString('es-ES',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:0});
const pct=n=>Number(n||0).toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:2})+' %';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=id=>engine.number($(id)?.value??'');
function toast(message){const old=$('netSimToast');if(old)old.remove();const el=document.createElement('div');el.id='netSimToast';el.className='net-sim-toast';el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),2600)}
function assetList(){return Array.isArray(window.investments)?window.investments:(typeof investments!=='undefined'?investments:[])}
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
function categoryOf(asset){return asset?.cat||'Otros'}
function subtypeOf(asset){return asset?.catalogSubtype||(typeof subtypeFor==='function'?subtypeFor(asset):'')||asset?.subtype||'Otros'}
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
 const q=String(query||'').trim().toLocaleLowerCase('es');
 input.setAttribute('aria-expanded',String(!!open));clear.hidden=!input.value;
 if(!open){panel.hidden=true;panel.innerHTML='';return;}
 const all=assetList().slice().sort((a,b)=>a.name.localeCompare(b.name,'es'));
 const matches=q?all.filter(a=>(a.name+' '+categoryOf(a)+' '+subtypeOf(a)).toLocaleLowerCase('es').includes(q)):all;
 const categories=[...new Set(all.map(categoryOf))].sort((a,b)=>a.localeCompare(b,'es'));
 const shown=matches.slice(0,12);
 let content='';
 if(!q){
  content+='<div class="net-asset-explore"><small>EXPLORAR POR CATEGORÍA</small><div>'+categories.map(c=>'<button type="button" data-net-asset-category="'+esc(c)+'">'+esc(c)+'</button>').join('')+'</div></div>';
  content+='<div class="net-asset-results-label">ACTIVOS DISPONIBLES <span>'+all.length+'</span></div>';
 }else content+='<div class="net-asset-results-label">RESULTADOS <span>'+matches.length+'</span></div>';
 let last='';
 shown.forEach(a=>{
  const cat=categoryOf(a);
  if(cat!==last){content+='<div class="net-asset-group-label">'+esc(cat)+'</div>';last=cat;}
  content+='<button type="button" class="net-asset-option'+(select.value===a.name?' is-selected':'')+'" role="option" aria-selected="'+(select.value===a.name)+'" data-net-asset-option="'+esc(a.name)+'"><span class="net-asset-option-mark">↗</span><span class="net-asset-option-copy"><b>'+esc(a.name)+'</b><small>'+esc(cat)+' · '+esc(subtypeOf(a))+'</small></span>'+(select.value===a.name?'<span class="net-asset-option-check">✓</span>':'<span class="net-asset-option-arrow">›</span>')+'</button>';
 });
 if(!matches.length)content+='<div class="net-asset-empty"><b>No encontramos ese activo</b><span>Prueba con otro nombre o categoría, o utiliza una rentabilidad manual.</span></div>';
 if(matches.length>12)content+='<div class="net-asset-more">Mostrando 12 de '+matches.length+'. Afina la búsqueda para ver menos resultados.</div>';
 content+='<button type="button" class="net-asset-manual-option" data-net-asset-manual="true">Usar rentabilidad manual</button>';
 panel.innerHTML=content;panel.hidden=false;
}
function chooseNetAsset(name){
 const select=$('netAsset'),input=$('netAssetSearch');
 if(!select)return;
 select.value=name||'__manual__';
 if(input)input.value=name&&name!=='__manual__'?name:'Rentabilidad manual';
 renderAssetPicker('',false);
 loadAssetDefaults(findAsset(select.value));
}

function readInputs(asset,rateOverride){
 return {
  capital:num('netCapital'),monthly:num('netMonthly'),years:num('netYears'),
  rate:rateOverride??(asset?scenarioRate(asset):num('netManualRate')),
  entryFee:0,entryFixed:num('netEntryFee'),annualFee:0,annualFixed:num('netAnnualFee'),exitFee:0,exitFixed:num('netExitFee'),
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
 $('netManualRate').value=asset?scenarioRate(asset,'base').toFixed(2):'5';
 selectedScenario='base';
 document.querySelectorAll('[data-net-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.netScenario==='base')));
 $('netVacancyWrap').classList.toggle('net-sim-hidden',!isRentalAsset(asset));
 if(!isRentalAsset(asset))$('netVacancy').value='0';
 $('netTaxSubject').value=hasIrpf?'individual':(hasIs?'company':'individual');
 $('netIncomeTaxEnabled').checked=hasIrpf||hasIs;
 $('netIncomeTaxTitle').textContent=$('netTaxSubject').value==='company'?'Impuesto sobre Sociedades':'IRPF';
 $('netIncomeTaxBase').value=general?'general':(savings?'savings':'general');
 $('netIncomeTaxRate').value=$('netTaxSubject').value==='company'?'25':'';
 $('netIbiEnabled').checked=hasIbi;$('netIbiAnnual').value='0';
 $('netAcquisitionTaxEnabled').checked=hasIva||hasItp;
 $('netAcquisitionTaxType').value=hasIva&&!hasItp?'iva':(hasItp&&!hasIva?'itp':'none');
 const ivaMatch=fiscalText.match(/iva[^.\n]{0,55}?(\d+(?:[.,]\d+)?)\s*%/i);
 const itpHasRange=/itp[^.\n]{0,55}\d+\s*%?\s*(?:-|–|a)\s*\d+/i.test(fiscalText);
 const itpMatch=itpHasRange?null:fiscalText.match(/itp[^.\n]{0,55}?(\d+(?:[.,]\d+)?)\s*%/i);
 const ajdMatch=fiscalText.match(/ajd[^.\n]{0,55}?(\d+(?:[.,]\d+)?)\s*%/i);
 $('netAcquisitionTaxType').dataset.ivaRate=ivaMatch?ivaMatch[1].replace(',','.'):'';
 $('netAcquisitionTaxType').dataset.itpRate=itpMatch?itpMatch[1].replace(',','.'):'';
 $('netAcquisitionTaxRate').value=$('netAcquisitionTaxType').value==='iva'&&ivaMatch?ivaMatch[1].replace(',','.'):($('netAcquisitionTaxType').value==='itp'&&itpMatch?itpMatch[1].replace(',','.'):'');
 $('netAjdEnabled').checked=hasAjd;$('netAjdRate').value=ajdMatch?ajdMatch[1].replace(',','.'):'';
 $('netMunicipalEnabled').checked=hasPlusvalia;$('netMunicipalExitTax').value='0';
 $('netOtherTaxEnabled').checked=false;$('netOtherTaxName').value='';$('netOtherEntryTax').value='0';$('netOtherAnnualTax').value='0';
 $('netTaxProfileHint').textContent=asset
  ?'Detección desde la ficha: '+[hasIrpf?'IRPF':null,hasIs?'Impuesto sobre Sociedades (alternativa según titular)':null,hasIbi?'IBI':null,hasIva?'IVA':null,hasItp?'ITP':null,hasAjd?'AJD':null,hasPlusvalia?'plusvalía municipal':null].filter(Boolean).join(' · ')||'La ficha no identifica impuestos concretos. Revisa los aplicables a tu caso.'
  :'Sin activo de catálogo: configura manualmente los impuestos que correspondan.';
 $('netIncomeTaxHint').textContent=savings?'Se propone la escala del ahorro, calculada progresivamente sobre la ganancia positiva al final.':'La ficha apunta a rentas de base general o actividad. Introduce tu tipo marginal aproximado; no se presupone un porcentaje personal.';
 // La visibilidad del tipo se gestiona de forma centralizada en updateTaxControls().
 $('netIncomeTaxTitle').textContent=$('netTaxSubject').value==='company'?'Impuesto sobre Sociedades':'IRPF';
 $('netCostHint').textContent=d.known?'Se han detectado porcentajes en los costes descritos en la ficha. Comprueba que corresponden a tu operación concreta.':'La ficha no contiene porcentajes de costes verificables. Se parte de 0 % y puedes introducirlos manualmente.';
 $('netManualRateWrap').classList.remove('net-sim-hidden');
 updateTaxControls();
 runNetSimulation();
}
function updateTaxControls(){
 const company=$('netTaxSubject').value==='company',savings=$('netIncomeTaxBase').value==='savings',enabled=$('netIncomeTaxEnabled').checked;
 $('netIncomeTaxTitle').textContent=company?'Impuesto sobre Sociedades':'IRPF';
 // El porcentaje del IS debe seguir visible y editable; solo ocultamos el selector de base del IRPF.
 $('netIrpfFields').classList.remove('net-sim-hidden');
 $('netIncomeTaxBaseWrap').classList.toggle('net-sim-hidden',company);
 $('netIncomeTaxRateWrap').classList.toggle('net-sim-hidden',!company&&savings);
 $('netIncomeTaxRate').disabled=!company&&savings;
 $('netIncomeTaxRateLabel').textContent=company?'Tipo del Impuesto sobre Sociedades':'Tipo marginal estimado';
 if(company)$('netIncomeTaxHint').textContent='Se aplica el porcentaje introducido sobre la ganancia imponible estimada. Se propone el 25 % como tipo general, pero puedes cambiarlo (por ejemplo, al 15 % si cumples los requisitos u otro tipo aplicable).';
 else if(!enabled)$('netIncomeTaxHint').textContent='Activa la casilla IRPF para incluir este impuesto en el cálculo.';
 else $('netIncomeTaxHint').textContent=savings?'En la base del ahorro no se utiliza un porcentaje manual: el simulador aplica automáticamente los tramos progresivos configurados. Si quieres introducir tu propio tipo, selecciona «Base general».':'El porcentaje que introduzcas se aplica a la ganancia imponible estimada. Al modificarlo, se recalculan el impuesto y el capital neto final. Es una aproximación: tu tipo marginal real depende del conjunto de tus rentas.';
 // El tipo del IS y el tipo marginal de base general se pueden editar; la casilla solo activa o desactiva el impuesto.
 $('netIncomeTaxRate').disabled=!company&&savings;
}
function buildWaterfall(result){
 const rows=[
  {label:'Capital final bruto',value:result.grossFinal,desc:'Antes de descontar costes.'},
  {label:'Costes totales',value:-result.costs.total,desc:'Entrada, gastos recurrentes y salida.',deduction:true},
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
 $('netGraph').innerHTML='<div class="net-sim-chart-legend"><span><i class="net-sim-legend-dot"></i>Capital neto real (€ de hoy)</span><span><i class="net-sim-legend-dot gray"></i>Dinero aportado (€ de hoy)</span><span>Franja: prudente–optimista</span></div><div id="netChartWrap" style="position:relative;touch-action:pan-y"><svg id="netInteractiveChart" class="net-sim-chart" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Gráfico interactivo: toca o mueve el cursor para consultar cada año."><g stroke="#e7edf5" stroke-dasharray="4 5"><line x1="'+pad+'" y1="'+y(max)+'" x2="'+(w-pad)+'" y2="'+y(max)+'"/><line x1="'+pad+'" y1="'+y((max+min)/2)+'" x2="'+(w-pad)+'" y2="'+y((max+min)/2)+'"/><line x1="'+pad+'" y1="'+y(min)+'" x2="'+(w-pad)+'" y2="'+y(min)+'"/></g><path d="'+band+'" fill="#155eef" opacity=".12"/><path d="'+path(contributed)+'" fill="none" stroke="#98a2b3" stroke-width="2" stroke-dasharray="5 5"/><path d="'+path(base.points)+'" fill="none" stroke="#155eef" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><g id="netChartMarker" style="pointer-events:none"><line id="netChartGuide" x1="'+pad+'" y1="'+pad+'" x2="'+pad+'" y2="'+(h-pad)+'" stroke="#155eef" stroke-dasharray="3 4" opacity="0"/><circle id="netChartDot" cx="'+pad+'" cy="'+y(base.points[0].real)+'" r="5" fill="#155eef" stroke="#fff" stroke-width="2" opacity="0"/></g><g fill="#667085" font-size="11" text-anchor="middle">'+ticks.map(i=>'<text x="'+x(i)+'" y="'+(h-5)+'">'+fmt(base.points[i]?.year||0)+' años</text>').join('')+'</g></svg><div id="netChartTooltip" role="status" aria-live="polite" style="display:none;position:absolute;z-index:2;top:8px;left:8px;max-width:min(260px,90%);padding:10px 12px;background:#10294e;color:#fff;border-radius:10px;box-shadow:0 6px 20px #10294e33;font-size:12px;line-height:1.55;pointer-events:none"></div></div><p class="net-sim-hint">Mueve el cursor o desliza el dedo sobre el gráfico para consultar cada año.</p><details><summary style="cursor:pointer;font-size:12px;color:#475467">Ver tabla de datos del gráfico</summary><div class="net-sim-table-wrap"><table class="net-sim-chart-table"><thead><tr><th>Año</th><th>Capital neto real</th><th>Aportado en euros de hoy</th><th>Ganancia real</th></tr></thead><tbody>'+table+'</tbody></table></div></details>';
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
 const selected=[1,2,3,4].map(n=>$('netCompare'+n).value).filter(Boolean);
 const unique=[...new Set(selected)].slice(0,4);
 compareResults=unique.map(name=>{const asset=findAsset(name),d=assetDefaults(asset),rate=scenarioRate(asset);const res=engine.calculate({...readInputs(asset,rate),entryFee:d.entryFee,annualFee:d.annualFee,exitFee:d.exitFee},fiscalConfig);return {asset,result:res};}).filter(x=>!x.result.error);
 if(!compareResults.length){$('netCompareOutput').innerHTML='<p class="net-sim-note">Elige al menos un activo para comparar.</p>';return;}
 const rows=[
  ['Capital final real',x=>x.result.realFinal,'high',euro],
  ['Ganancia real',x=>x.result.realGain,'high',euro],
  ['Costes totales',x=>x.result.costs.total,'low',euro],
  ['Impuestos estimados',x=>x.result.taxes,'low',euro],
  ['Liquidez (ficha)',x=>Number(x.asset.liq),'high',v=>Number.isFinite(v)?fmt(v)+'/10':'—'],
  ['Gestión (h/mes)',x=>Number(x.asset.management),'low',v=>Number.isFinite(v)?fmt(v)+' h':'No indicada'],
  ['Riesgo (ficha)',x=>Number(x.asset.risk),'low',v=>Number.isFinite(v)?fmt(v)+'/10':'—'],
  ['Ganancia real por hora',x=>{const h=Number(x.asset.management);return Number.isFinite(h)&&h>0?x.result.realGain/(h*12*num('netYears')):NaN;},'high',v=>Number.isFinite(v)?euro(v)+'/h':'No disponible']
 ];
 const best=(row)=>{const vals=compareResults.map(row[1]).filter(Number.isFinite);if(!vals.length)return null;return row[2]==='high'?Math.max(...vals):Math.min(...vals)};
 const head='<thead><tr><th>Indicador</th>'+compareResults.map(x=>'<th>'+esc(x.asset.name)+'</th>').join('')+'</tr></thead>';
 const body='<tbody>'+rows.map(row=>{const win=best(row);return '<tr><th>'+row[0]+'</th>'+compareResults.map(x=>{const raw=row[1](x),isBest=Number.isFinite(raw)&&win!==null&&raw===win;return '<td class="'+(isBest?'best':'')+'">'+(Number.isFinite(raw)?row[3](raw):'—')+'</td>';}).join('')+'</tr>';}).join('')+'</tbody>';
 $('netCompareOutput').innerHTML='<div class="net-sim-table-wrap"><table class="net-sim-compare-table">'+head+body+'</table></div><p class="net-sim-compare-summary">'+comparisonSentence(compareResults)+'</p><p class="net-sim-note">La ganancia por hora es orientativa: utiliza las horas mensuales indicadas en la ficha y no valora el tiempo de trabajo de forma económica. Liquidez y riesgo son puntuaciones del catálogo, no plazos ni garantías.</p>';
}
function comparisonSentence(items){
 if(items.length<2)return 'Añade al menos dos activos para describir sus diferencias.';
 const sorted=items.slice().sort((a,b)=>b.result.realFinal-a.result.realFinal),a=sorted[0],b=sorted[1],diff=a.result.realFinal-b.result.realFinal;
 const la=Number(a.asset.liq),lb=Number(b.asset.liq);
 let extra='';
 if(Number.isFinite(la)&&Number.isFinite(lb)&&la!==lb)extra=' La ficha asigna a '+a.asset.name+' una liquidez de '+fmt(la)+'/10 y a '+b.asset.name+' '+fmt(lb)+'/10.';
 return 'Con el mismo dinero, '+a.asset.name+' dejaría '+euro(diff)+' más que '+b.asset.name+' en este escenario.'+extra+' Son resultados hipotéticos, no una recomendación.';
}
function setCompareOptions(){
 const list=assetList().slice().sort((a,b)=>a.name.localeCompare(b.name,'es'));
 [1,2,3,4].forEach(n=>{const s=$('netCompare'+n);if(!s)return;const old=s.value;s.innerHTML='<option value="">Seleccionar activo…</option>'+list.map(a=>'<option value="'+esc(a.name)+'">'+esc(a.name)+'</option>').join('');if(old)s.value=old;});
 const first=currentAsset?.name||'Fondos indexados',second=list.find(a=>a.name!==first)?.name||'';
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
function openNetReport(){
 if(!currentResult)return;
 const r=currentResult,s=window.invSimulationState;
 const win=window.open('','_blank');if(!win){alert('Permite las ventanas emergentes para abrir el informe.');return;}
 const tb=r.taxBreakdown||{};const rows=[['Activo',s.assetName],['Capital inicial',euro(s.capital)],['Aportación mensual',euro(s.monthly)],['Plazo',s.years+' años'],['Rentabilidad',pct(s.rate)],['Inflación',pct(num('netInflation'))],['Costes de entrada',euro(r.costs.entry)],['Costes recurrentes',euro(r.costs.recurring)],['Costes de salida',euro(r.costs.exit)],['IVA/ITP y AJD estimados',euro((tb.acquisition||0))],['Otros impuestos de entrada',euro(tb.otherEntry||0)],['IBI y otros impuestos anuales',euro(tb.recurring||0)],['IRPF/IS estimado',euro(tb.income||0)],['Plusvalía municipal',euro(tb.municipal||0)],['Total impuestos',euro(r.taxes)],['Capital final bruto',euro(r.grossFinal)],['Capital final neto',euro(r.netNominal)],['Capital final real',euro(r.realFinal)],['Dinero aportado (euros de hoy)',euro(r.contributedReal)],['Ganancia real',euro(r.realGain)]];
 win.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe de simulación · Inversora</title><style>body{font:14px Inter,Arial,sans-serif;color:#0f172a;max-width:850px;margin:40px auto;padding:0 24px}h1{color:#155eef}p{color:#475467;line-height:1.5}table{width:100%;border-collapse:collapse;margin:24px 0}td{padding:12px;border-bottom:1px solid #e2e8f0}td:last-child{text-align:right;font-weight:700}.notice{background:#f4f6fb;padding:14px;border-radius:12px;font-size:12px}@media print{button{display:none}}</style></head><body><h1>Inversora · Informe de simulación</h1><p>Dinero neto real estimado · '+new Date().toLocaleDateString('es-ES')+'</p><table>'+rows.map(x=>'<tr><td>'+esc(x[0])+'</td><td>'+esc(x[1])+'</td></tr>').join('')+'</table><p class="notice">Simulación educativa con supuestos editables. No es una previsión ni asesoramiento financiero o fiscal. Los impuestos se estiman según los supuestos introducidos. Los impuestos sobre beneficios se aproximan al final del horizonte; los tributos autonómicos y municipales requieren verificación y no se sustituye una liquidación fiscal.</p><button onclick="window.print()">Imprimir / Guardar como PDF</button></body></html>');
 win.document.close();
}
function init(){
 // Los desplegables avanzados siempre comienzan cerrados, incluso si el navegador restaura su estado anterior.
 document.querySelectorAll('#netAdvanced, #netAdvanced > details').forEach(section=>{section.open=false;});
 fetch('fiscalidad-espana.json').then(r=>{if(!r.ok)throw new Error('No se pudo cargar la configuración fiscal');return r.json();}).then(c=>{fiscalConfig=c;populateAssetOptions();if(location.hash.includes('net-sim=')){loadShared();}else{$('netAsset').value=findAsset('Fondos indexados')?'Fondos indexados':(assetList()[0]?.name||'__manual__');loadAssetDefaults(findAsset($('netAsset').value));}$('netAssetSearch').value=$('netAsset').value==='__manual__'?'Rentabilidad manual':$('netAsset').value;renderAssetPicker('',false);setCompareOptions();}).catch(err=>{$('netSimError').textContent='No se ha podido cargar la configuración fiscal. Recarga la página o inténtalo más tarde.';$('netSimError').classList.remove('net-sim-hidden');console.error(err);});
 $('netAssetSearch').addEventListener('input',e=>populateAssetOptions(e.target.value,true));
 $('netAssetSearch').addEventListener('focus',()=>{if($('netAssetSearch').value===$('netAsset').value||$('netAssetSearch').value==='Rentabilidad manual')$('netAssetSearch').value='';renderAssetPicker($('netAssetSearch').value,true);});
 $('netAssetSearch').addEventListener('keydown',e=>{if(e.key==='Escape'){renderAssetPicker($('netAssetSearch').value,false);$('netAssetSearch').blur();}else if(e.key==='Enter'){const first=$('netAssetResults')?.querySelector('[data-net-asset-option]');if(first){e.preventDefault();chooseNetAsset(first.dataset.netAssetOption);}}});
 $('netAssetResults').addEventListener('click',e=>{const option=e.target.closest('[data-net-asset-option]'),category=e.target.closest('[data-net-asset-category]'),manual=e.target.closest('[data-net-asset-manual]');if(option)chooseNetAsset(option.dataset.netAssetOption);else if(category){$('netAssetSearch').value=category.dataset.netAssetCategory;populateAssetOptions(category.dataset.netAssetCategory,true);}else if(manual)chooseNetAsset('__manual__');});
 $('netAssetSearchClear').addEventListener('click',()=>{$('netAssetSearch').value='';populateAssetOptions('',true);$('netAssetSearch').focus();});
 document.addEventListener('click',e=>{if(!$('netAssetPicker')?.contains(e.target))renderAssetPicker($('netAssetSearch')?.value||'',false);});
 $('netAsset').addEventListener('change',()=>{loadAssetDefaults(findAsset($('netAsset').value));$('netAssetSearch').value=$('netAsset').value==='__manual__'?'Rentabilidad manual':$('netAsset').value;renderAssetPicker('',false);});
 ['netCapital','netMonthly','netYears','netEntryFee','netAnnualFee','netExitFee','netInflation','netVacancy'].forEach(id=>$(id).addEventListener('input',()=>runNetSimulation()));
 $('netManualRate').addEventListener('input',()=>{selectedScenario='custom';document.querySelectorAll('[data-net-scenario]').forEach(b=>b.setAttribute('aria-pressed','false'));runNetSimulation();});
 document.querySelectorAll('[data-net-scenario]').forEach(b=>b.addEventListener('click',()=>setScenario(b.dataset.netScenario)));
 document.querySelectorAll('[data-net-mode]').forEach(b=>b.addEventListener('click',()=>renderMode(b.dataset.netMode)));
 $('netResetAdvanced').addEventListener('click',()=>{loadAssetDefaults(currentAsset);$('netEntryFee').value='0';$('netAnnualFee').value='0';$('netExitFee').value='0';$('netInflation').value='2';$('netVacancy').value='0';runNetSimulation();});
 ['netTaxSubject','netIncomeTaxEnabled','netIncomeTaxBase','netIncomeTaxRate','netIbiEnabled','netIbiAnnual','netAcquisitionTaxEnabled','netAcquisitionTaxType','netAcquisitionTaxRate','netAjdEnabled','netAjdRate','netMunicipalEnabled','netMunicipalExitTax','netOtherTaxEnabled','netOtherEntryTax','netOtherAnnualTax'].forEach(id=>$(id).addEventListener('input',()=>{updateTaxControls();runNetSimulation();}));
 $('netIncomeTaxRate').addEventListener('change',()=>{updateTaxControls();runNetSimulation();});
 $('netIncomeTaxRate').addEventListener('blur',()=>{updateTaxControls();runNetSimulation();});
 $('netTaxSubject').addEventListener('change',()=>{if($('netTaxSubject').value==='company')$('netIncomeTaxRate').value='25';else $('netIncomeTaxRate').value='';$('netIncomeTaxTitle').textContent=$('netTaxSubject').value==='company'?'Impuesto sobre Sociedades':'IRPF';updateTaxControls();runNetSimulation();});
 $('netAcquisitionTaxType').addEventListener('change',()=>{const el=$('netAcquisitionTaxType');if(el.value==='iva'&&el.dataset.ivaRate)$('netAcquisitionTaxRate').value=el.dataset.ivaRate;else if(el.value==='itp'&&el.dataset.itpRate)$('netAcquisitionTaxRate').value=el.dataset.itpRate;else $('netAcquisitionTaxRate').value='';updateTaxControls();runNetSimulation();});
 $('netIncomeTaxBase').addEventListener('change',()=>{updateTaxControls();runNetSimulation();});
 ['netWhatInflation','netWhatRate','netWhatMonthly'].forEach(id=>$(id).addEventListener('input',()=>runWhatIf(currentResult)));
 [1,2,3,4].forEach(n=>$('netCompare'+n).addEventListener('change',renderComparison));
 $('netSave').addEventListener('click',saveLocal);$('netShare').addEventListener('click',shareLink);$('netPdf').addEventListener('click',openNetReport);
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
 window.simulateInvestment=function(name){$('netAsset').value=name||'__manual__';$('netAssetSearch').value=name||'Rentabilidad manual';loadAssetDefaults(findAsset(name));renderAssetPicker('',false);showView('sim');};
 window.openInvestmentReport=openNetReport;
 window.simulateComparedAssets=simulateComparedAssets;
 }
function simulateComparedAssets(){
 renderMode('two');
 const names=typeof compareNames!=='undefined'?compareNames:[];
 [1,2,3,4].forEach((n,i)=>{if(names[i])$('netCompare'+(i+1)).value=names[i];});
 renderComparison();
 showView('sim');
 renderMode('two');
}
window.simulateComparedAssets=simulateComparedAssets;
window.renderNetSimulation=runNetSimulation;
document.addEventListener('DOMContentLoaded',init);
if(document.readyState!=='loading')init();
})();