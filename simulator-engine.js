/* Inversora · motor independiente de simulación neta real. Sin dependencias de interfaz. */
(function(root){
  'use strict';
  function number(value){
    if(typeof value==='number') return Number.isFinite(value)?value:NaN;
    let s=String(value??'').trim().replace(/[ €%\s]/g,'');
    if(!s)return NaN;
    const comma=s.lastIndexOf(','),dot=s.lastIndexOf('.');
    if(comma>-1&&dot>-1){s=comma>dot?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');}
    else if(comma>-1)s=s.replace(/,/g,'.');
    else if((s.match(/\./g)||[]).length>1){const last=s.lastIndexOf('.');s=s.slice(0,last).replace(/\./g,'')+s.slice(last);}
    const n=Number(s);return Number.isFinite(n)?n:NaN;
  }
  function progressiveTax(base,brackets){
    let remaining=Math.max(0,base),lower=0,tax=0;
    for(const tier of (brackets||[])){
      if(remaining<=0)break;
      const width=tier.upTo==null?remaining:Math.max(0,Math.min(remaining,tier.upTo-lower));
      tax+=width*(tier.rate/100);remaining-=width;
      if(tier.upTo!=null)lower=tier.upTo;
    }
    return tax;
  }
  function monthlyIrr(cashflows){
    if(!cashflows||cashflows.length<2)return 0;
    const npv=r=>cashflows.reduce((sum,cf,i)=>sum+cf/Math.pow(1+r,i),0);
    let lo=-0.999,hi=1,fl=npv(lo),fh=npv(hi),guard=0;
    while(fl*fh>0&&hi<1e6&&guard++<30){hi=hi*2+0.1;fh=npv(hi);}
    if(!Number.isFinite(fl)||!Number.isFinite(fh)||fl*fh>0)return null;
    for(let i=0;i<180;i++){const mid=(lo+hi)/2,fm=npv(mid);if(Math.abs(fm)<1e-8)return mid;if(fl*fm<=0){hi=mid;fh=fm;}else{lo=mid;fl=fm;}}
    return (lo+hi)/2;
  }
  function calculate(input,config){
    const p={...input};
    const capital=number(p.capital),monthly=number(p.monthly),years=number(p.years),rate=number(p.rate);
    const entryFee=number(p.entryFee??0),annualFee=number(p.annualFee??0),exitFee=number(p.exitFee??0);
    const entryFixed=number(p.entryFixed??0),annualFixed=number(p.annualFixed??0),exitFixed=number(p.exitFixed??0);
    const inflation=number(p.inflation??2),vacancy=number(p.vacancy??0);
    const incomeTaxEnabled=!!p.incomeTaxEnabled,incomeTaxType=p.incomeTaxType||'irpf',incomeTaxBase=p.incomeTaxBase||'savings';
    const incomeTaxRate=p.incomeTaxRate===''||p.incomeTaxRate==null?null:number(p.incomeTaxRate);
    const acquisitionTaxRate=number(p.acquisitionTaxRate??0),ajdRate=number(p.ajdRate??0);
    const ibiAnnual=number(p.ibiAnnual??0),municipalExitTax=number(p.municipalExitTax??0),otherAnnualTax=number(p.otherAnnualTax??0),otherEntryTax=number(p.otherEntryTax??0);
    const values=[capital,monthly,years,rate,entryFee,annualFee,exitFee,entryFixed,annualFixed,exitFixed,inflation,vacancy,acquisitionTaxRate,ajdRate,ibiAnnual,municipalExitTax,otherAnnualTax,otherEntryTax];
    if(incomeTaxRate!==null)values.push(incomeTaxRate);
    if(values.some(v=>!Number.isFinite(v)))return {error:'Revisa los campos: introduce cifras válidas.'};
    if(capital<0||monthly<0)return {error:'El dinero inicial y la aportación no pueden ser negativos.'};
    if(years<0||years>60)return {error:'El plazo debe estar entre 0 y 60 años.'};
    if(rate< -100||rate>1000)return {error:'La rentabilidad debe estar entre -100 % y 1.000 %.'};
    if([entryFee,annualFee,exitFee,vacancy].some(v=>v<0||v>100))return {error:'Los costes porcentuales y la vacancia deben estar entre 0 % y 100 %.'};
    if([entryFixed,annualFixed,exitFixed].some(v=>v<0||v>1e12))return {error:'Los costes fijos deben ser importes positivos dentro del límite admitido.'};
    if(inflation< -20||inflation>100)return {error:'La inflación debe estar entre -20 % y 100 %.'};
    if([acquisitionTaxRate,ajdRate].some(v=>v<0||v>100)||[ibiAnnual,municipalExitTax,otherAnnualTax,otherEntryTax].some(v=>v<0||v>1e12))return {error:'Revisa los importes y porcentajes de impuestos.'};
    if(incomeTaxRate!==null&&(!Number.isFinite(incomeTaxRate)||incomeTaxRate<0||incomeTaxRate>100))return {error:'El tipo de IRPF/IS debe estar entre 0 % y 100 %.'};
    const months=Math.round(years*12),contributed=capital+monthly*months;
    if(!Number.isFinite(contributed)||contributed>1e15)return {error:'El importe total supera el límite admitido por la simulación.'};
    const adjustedRate=rate*(1-vacancy/100);
    const annualFactor=Math.max(0,1+adjustedRate/100);
    const monthlyRate=months?Math.pow(annualFactor,1/12)-1:0;
    const monthlyFeeFactor=Math.pow(Math.max(0,1-annualFee/100),1/12);
    const acquisitionTax=capital*(acquisitionTaxRate+ajdRate)/100+otherEntryTax;
    let gross=capital,entryFixedApplied=Math.min(capital,entryFixed),net=Math.max(0,capital*(1-entryFee/100)-entryFixedApplied-acquisitionTax),entryCosts=capital*entryFee/100+entryFixedApplied,recurringCosts=0,recurringTaxes=0;
    const points=[{month:0,year:0,real:net,contributedReal:capital}];
    const realCashflows=[-capital];
    let contributedReal=capital;
    for(let m=1;m<=months;m++){
      gross=gross*(1+monthlyRate)+monthly;
      const beforeFee=net*(1+monthlyRate);
      const afterPercentFee=beforeFee*monthlyFeeFactor;
      // Los importes introducidos como €/año se prorratean en 12 cuotas mensuales.
      // El total acumulado en 12 meses equivale exactamente a una cuota anual, no a 12 cuotas anuales.
      const fixedMonthly=annualFixed/12;
      const monthlyTax=(ibiAnnual+otherAnnualTax)/12;
      net=Math.max(0,afterPercentFee-fixedMonthly-monthlyTax);
      // Se registra el gasto/impuesto íntegro aunque el valor del activo no alcance para cubrirlo.
      recurringCosts+=beforeFee-afterPercentFee+fixedMonthly;
      recurringTaxes+=monthlyTax;
      const deposit=monthly*(1-entryFee/100);
      net+=deposit;
      entryCosts+=monthly*entryFee/100;
      const deflator=Math.pow(1+inflation/100,m/12);
      const realDeposit=monthly/deflator;
      contributedReal+=realDeposit;
      realCashflows.push(-realDeposit);
      if(m%12===0||m===months){
        points.push({month:m,year:m/12,real:net/deflator,contributedReal});
      }
      if(!Number.isFinite(gross)||!Number.isFinite(net)||Math.abs(gross)>1e15||Math.abs(net)>1e15)return {error:'El resultado supera el límite de cálculo. Reduce el importe, plazo o rentabilidad.'};
    }
    const variableExit=net*exitFee/100;
    const fixedExit=Math.min(Math.max(0,net-variableExit),exitFixed);
    const exitCosts=variableExit+fixedExit;
    const afterExit=Math.max(0,net-exitCosts);
    const taxableGain=Math.max(0,afterExit-contributed+acquisitionTax);
    const brackets=config?.savingsTaxBrackets||[];
    let incomeTax=0;
    if(incomeTaxEnabled&&taxableGain>0){
      if(incomeTaxType==='is')incomeTax=taxableGain*(incomeTaxRate??25)/100;
      else if(incomeTaxBase==='savings'&&incomeTaxRate===null)incomeTax=progressiveTax(taxableGain,brackets);
      else if(incomeTaxRate!==null)incomeTax=taxableGain*incomeTaxRate/100;
    }
    const taxes={acquisition:capital*(acquisitionTaxRate+ajdRate)/100,otherEntry:otherEntryTax,recurring:recurringTaxes,income:incomeTax,municipal:municipalExitTax,total:acquisitionTax+recurringTaxes+incomeTax+municipalExitTax};
    const tax=incomeTax+municipalExitTax;
    const netNominal=Math.max(0,afterExit-tax);
    const realFinal=netNominal/Math.pow(1+inflation/100,years);
    const directCosts=entryCosts+recurringCosts+exitCosts;
    const totalCosts=directCosts;
    const realGain=realFinal-contributedReal;
    const annualized=years>0?monthlyIrr([...realCashflows,realFinal]):0;
    const realAnnualRate=annualized===null?null:(Math.pow(1+annualized,12)-1)*100;
    if(![gross,netNominal,realFinal,totalCosts,tax,contributedReal].every(Number.isFinite))return {error:'No se ha podido calcular este escenario. Comprueba los valores.'};
    return {
      grossFinal:gross,costs:{entry:entryCosts,recurring:recurringCosts,exit:exitCosts,directTotal:directCosts,total:totalCosts},
      taxes:tax+acquisitionTax+recurringTaxes,taxBreakdown:taxes,netNominal,realFinal,contributedNominal:contributed,contributedReal,
      realGain,realAnnualRate,points,months,adjustedRate,taxableGain,
      assumptions:{...p,rate:adjustedRate},taxMethod:incomeTaxEnabled?(incomeTaxType==='is'?'Impuesto sobre Sociedades estimado sobre ganancia final':incomeTaxBase==='savings'?'IRPF: escala del ahorro simplificada':'IRPF: tipo marginal introducido'):'Sin impuesto sobre beneficio seleccionado'
    };
  }
  root.InversoraNetEngine={number,progressiveTax,calculate};
})(typeof window!=='undefined'?window:globalThis);
