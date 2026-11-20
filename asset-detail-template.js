
/* Inversora · plantilla única de ficha de activo. Piloto: Cuentas remuneradas. */
(function(){
'use strict';
const svg={
 back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/><path d="M20 12H9"/></svg>',
 play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>',
 heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>',
 compare:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3 4 7l4 4M4 7h12a4 4 0 0 1 4 4v1M16 21l4-4-4-4m4 4H8a4 4 0 0 1-4-4v-1"/></svg>',
 print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>'
};
const data={
 name:'Cuentas remuneradas',category:'Mercados financieros',subcategory:'Liquidez y ahorro bancario',
 phrase:'Ideal para el fondo de emergencia y el dinero que quieres mantener disponible.',
 capital:'Desde ~1 €',capitalValue:1,income:'Intereses mensuales o trimestrales, según entidad',management:0.1,
 yield:{min:0.5,max:3,base:'bruta',note:'Rango orientativo heredado del catálogo; no representa una oferta vigente y debe contrastarse con cada entidad. El tipo puede ser promocional, variable o sujeto a un saldo máximo.'},
 metrics:{risk:0.5,liquidity:5,periodicIncome:1.5,potential:1,passive:4.5,ease:4.5,complexity:0.5,leverage:0},
 returnType:'Intereses',scoreBasis:'Calculada con los seis criterios de la metodología actual de Inversora.',
 summary:'Una cuenta remunerada paga intereses por el saldo que mantienes en ella. Permite conservar disponibilidad del dinero, aunque el tipo puede cambiar y la remuneración puede estar limitada por saldo, plazo o requisitos.',
 how:'La entidad aplica un tipo de interés al saldo remunerable. Los intereses se calculan según el saldo y el periodo establecido en el contrato y se abonan con la periodicidad indicada. En ocasiones, el tipo más alto solo se aplica durante una promoción o hasta un límite de saldo.',
 periodic:'Sí. Lo habitual es que los intereses se abonen mensualmente o trimestralmente; algunas entidades pueden hacerlo con otra periodicidad.',
 parties:'Intervienen el titular de la cuenta y la entidad de crédito. El Fondo de Garantía de Depósitos puede cubrir los depósitos elegibles si la entidad está adherida y se cumplen los requisitos legales.',
 steps:['Compara la TAE, no solo el TIN, y revisa durante cuánto tiempo se aplica.','Comprueba el saldo máximo remunerado, los requisitos y si exige domiciliar ingresos o recibos.','Revisa la disponibilidad, las comisiones y la entidad que recibe el depósito.','Conserva las condiciones contractuales y revisa los cambios de tipo.'],
 pros:['Dinero normalmente disponible sin esperar a un vencimiento.','Puede remunerar el saldo que mantendrías en una cuenta corriente.','Gestión sencilla y sin necesidad de vender activos en mercado.','Los depósitos elegibles pueden estar cubiertos por el FGD hasta el límite legal.'],
 cons:['El banco puede modificar el tipo si el contrato lo permite.','Las ofertas promocionales suelen tener duración o saldo máximo.','La rentabilidad puede quedar por debajo de la inflación.','Algunas cuentas exigen vinculación, domiciliar ingresos o cumplir condiciones.'],
 fit:'Necesitas liquidez, quieres separar el fondo de emergencia y priorizas estabilidad nominal frente a crecimiento.',
 avoid:'Buscas crecimiento del capital a largo plazo o necesitas una rentabilidad real garantizada por encima de la inflación.',
 costs:{capital:'Desde ~1 €',recurring:'Normalmente 0 € si se cumplen las condiciones de la cuenta; comprueba posibles comisiones de mantenimiento o administración.',oneoff:'No suelen existir costes de apertura; pueden aplicarse cargos por servicios adicionales.',entry:'Transferencias ordinarias normalmente sin coste, según entidad y condiciones. Revisa límites, transferencias inmediatas y posibles comisiones.'},
 tax:'Los intereses tributan en el IRPF como rendimientos del capital mobiliario, dentro de la base del ahorro. La entidad española suele practicar una retención a cuenta del 19 %. La cuota final depende del conjunto de la base del ahorro y de la normativa aplicable.',
 taxDetail:'Para residentes fiscales en España, los intereses se integran en la base imponible del ahorro del IRPF. La escala estatal y autonómica vigente para la base del ahorro se aplica por tramos: 19 % hasta 6.000 €; 21 % entre 6.000 y 50.000 €; 23 % entre 50.000 y 200.000 €; 27 % entre 200.000 y 300.000 €; y 30 % sobre el exceso de 300.000 €. La retención del 19 % es un pago a cuenta, no necesariamente el impuesto definitivo. Puede haber particularidades para no residentes, cuentas extranjeras o contribuyentes con circunstancias especiales.',
 risks:['El tipo de interés puede bajar o dejar de ser promocional.','El saldo remunerado puede estar limitado y el exceso no generar intereses.','La inflación puede superar el interés neto recibido.','La cobertura del FGD depende de la entidad, la elegibilidad del depósito y el límite por titular y entidad.'],
 protection:'En entidades adheridas, el FGD cubre generalmente hasta 100.000 € por titular y entidad. Comprueba qué sistema de garantía cubre la cuenta, especialmente si la entidad opera desde otro país.',
 barrier:{level:'Baja',money:'Mínimo normalmente bajo; algunas entidades no exigen saldo mínimo.',knowledge:'Conocimientos básicos para comparar TAE, condiciones, límites y requisitos.',access:'Apertura online o en oficina, sujeta a identificación y criterios de admisión de la entidad.'},
 horizon:{profile:'Conservador',term:'0–2 años',exit:'Normalmente inmediato',penalty:'Sin penalización por retirada en cuentas a la vista; verificar condiciones específicas.'},
 reviewed:'2026-11'
};
const arg=v=>JSON.stringify(v).replace(/\"/g,'&quot;');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Number(v).toLocaleString('es-ES',{maximumFractionDigits:2});
const bar=(label,value,sub,risk=false)=>'<article class="asset-v2-panel"><span class="asset-v2-label">'+esc(label)+'</span><div class="asset-v2-stars-row"><strong>'+num(value)+'/5</strong></div><div class="asset-v2-meter '+(risk?'risk':'')+'"><i style="width:'+Math.max(0,Math.min(5,Number(value)))*20+'%"></i></div><p>'+esc(sub)+'</p></article>';
const panel=(label,value,desc,cls='')=>'<article class="asset-v2-panel '+cls+'"><span class="asset-v2-label">'+esc(label)+'</span><strong>'+esc(value)+'</strong><p>'+esc(desc)+'</p></article>';
const list=(items,kind)=>'<ul class="asset-v2-bullets '+kind+'">'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
function ratingMarkup(name){
 const score=Math.round(Number(scoreFormula(investments.find(x=>x.name===name)))/2*10)/10;const scoreStars=Math.round(score);
 const count=Number(invReviewCounts?.[name]||0),avg=Number(invReviewAverages?.[name]||0);
 const community=count>=5?'<div class="asset-v2-rating-main"><span id="asset-v2-community-score-stars" class="asset-v2-stars" role="img" aria-label="'+num(avg)+' de 5 estrellas">'+('★'.repeat(Math.round(avg))+'☆'.repeat(5-Math.round(avg)))+'</span><strong id="asset-v2-community-average">'+num(avg)+'/5</strong></div><small id="asset-v2-community-count">'+count+' valoraciones</small>':'<div class="asset-v2-rating-main"><strong id="asset-v2-community-average">Pocas valoraciones aún</strong></div><small id="asset-v2-community-count">'+count+' '+(count===1?'valoración':'valoraciones')+'</small>';
 return '<div class="asset-v2-rating"><div class="asset-v2-rating-head">Valoración de Inversora <button type="button" class="asset-v2-help" aria-label="Cómo se calcula la valoración de Inversora" title="Cómo se calcula la valoración de Inversora" onclick="showScoreBreakdown('+arg(name)+')">?</button></div><div class="asset-v2-rating-main"><span class="asset-v2-stars" role="img" aria-label="'+num(score)+' de 5 estrellas">'+('★'.repeat(scoreStars)+'☆'.repeat(5-scoreStars))+'</span><strong>'+num(score)+'/5</strong></div><small>Nota editorial calculada con los criterios de Inversora.</small></div><div class="asset-v2-rating"><div class="asset-v2-rating-head">Valoración de la comunidad</div>'+community+'<div class="asset-v2-community-stars" aria-label="Valorar este activo; abre el formulario de valoración">'+[1,2,3,4,5].map(n=>'<button type="button" aria-label="Valorar '+n+' de 5 estrellas" onclick="invOpenCommunityModal('+arg(name)+')">☆</button>').join('')+'</div><small>Tu valoración se registra desde el formulario de la comunidad.</small></div>';
}


function assetSheetSpecifics(i){
 const sub=typeof subtypeFor==='function'?subtypeFor(i):(i.catalogSubtype||'');
 const n=String(i.name||'').toLowerCase();
 const commonSteps=['Identifica el vehículo jurídico y quién emite, gestiona o custodia el activo.','Contrasta documentación, riesgos, costes totales, fiscalidad y condiciones de salida.','Calcula el resultado neto con hipótesis prudentes y un escenario desfavorable.','Comprueba la regulación aplicable y conserva contratos, justificantes y fuentes.'];
 const specs={
 'Liquidez y ahorro bancario':{
  summary:'El dinero permanece en una cuenta o depósito bancario. La remuneración, disponibilidad y protección dependen del contrato, la entidad y el sistema de garantía aplicable.',
  how:'Se mantiene un saldo a la vista o se entrega dinero a una entidad durante un plazo. La entidad puede pagar intereses según el saldo, el tipo, la duración y los requisitos; algunos productos permiten retirar en cualquier momento y otros limitan la disponibilidad.',
  income:'Intereses sobre el saldo o el depósito cuando existe remuneración. Una cuenta corriente o el efectivo pueden no generar ingresos; los depósitos a plazo suelen tener vencimiento y condiciones de cancelación.',
  costs:'Comisiones de mantenimiento, administración, transferencias, servicios adicionales y cambio de divisa. En depósitos, revisa también la posible penalización o pérdida de intereses por cancelación anticipada.',
  tax:'Los intereses de cuentas y depósitos tributan en España como rendimientos del capital mobiliario en la base del ahorro del IRPF. El saldo propio no tributa por el mero hecho de mantenerse en cuenta.',
  taxDetail:'La entidad puede practicar retención a cuenta sobre los intereses. La cuota final depende del conjunto de rentas del ahorro y de la residencia fiscal. En cuentas extranjeras pueden existir retenciones en origen, obligaciones informativas y reglas para evitar doble imposición. Verifica el tratamiento y los tipos vigentes con AEAT.',
  steps:['Distingue cuenta a la vista, cuenta remunerada y depósito a plazo; no ofrecen la misma disponibilidad.','Compara TAE, duración promocional, saldo máximo remunerado y requisitos de vinculación.','Comprueba comisiones, cancelación anticipada, entidad depositaria y sistema de garantía.','Calcula el interés neto de impuestos y compáralo con la inflación.'],
  fit:'Dinero que necesitas mantener disponible o con vencimiento conocido, priorizando estabilidad nominal y sencillez.',
  avoid:'No lo confundas con una inversión de crecimiento: el interés puede cambiar y el rendimiento neto puede no compensar la inflación.',
  barrier:'La barrera suele ser baja; lo importante es comparar condiciones contractuales, solvencia y cobertura de depósitos.',
  protection:'Los depósitos elegibles pueden estar cubiertos por el sistema de garantía correspondiente hasta su límite legal. La cobertura no se aplica automáticamente a cualquier saldo, entidad o producto; verifica titular, entidad y país.',
  term:'A la vista o hasta el vencimiento pactado, según cuenta o depósito.',
  exit:'En cuentas a la vista suele haber disponibilidad inmediata; en depósitos a plazo puede haber restricciones o pérdida de intereses.'
 },
 'Mercado monetario':{
  summary:'Agrupa instrumentos de deuda y liquidez de corto plazo. El rendimiento procede de intereses, descuentos o repos y depende de tipos, emisor y calidad crediticia.',
  how:'El capital se coloca en instrumentos de vencimiento corto, como deuda negociable, repos o certificados. En fondos monetarios, el resultado se refleja en el valor liquidativo; no es lo mismo que un depósito bancario.',
  income:'Rendimiento de instrumentos de corto plazo, normalmente incorporado al valor liquidativo o recibido como interés/descuento según el producto.',
  costs:'TER o comisión de gestión en fondos, intermediación, custodia, diferenciales de compra y venta, y posibles comisiones de suscripción o reembolso.',
  tax:'En fondos monetarios, la ganancia o pérdida suele aflorar al reembolsar participaciones; otros instrumentos pueden generar intereses o rendimientos por descuento.',
  taxDetail:'Los fondos de inversión elegibles pueden permitir diferimiento fiscal en traspasos conforme a los requisitos del IRPF; no debe asumirse que repos, certificados o papel comercial tengan el mismo tratamiento. Identifica el instrumento exacto y consulta su documentación y AEAT.',
  steps:['Identifica si compras un fondo, un repo, papel comercial o un certificado; sus riesgos y protección son distintos.','Revisa vencimientos, emisores, calidad crediticia, diversificación y liquidez de la cartera.','Compara TER, diferenciales, custodia y condiciones de reembolso.','Comprueba si existe garantía de depósitos: los fondos y valores negociables no son depósitos garantizados.'],
  fit:'Gestión de liquidez con horizonte corto y tolerancia limitada a fluctuaciones, entendiendo que puede existir riesgo de mercado o crédito.',
  avoid:'No lo trates como efectivo garantizado ni como sustituto automático de una cuenta cubierta por un fondo de garantía.',
  barrier:'Acceso generalmente sencillo mediante fondos o intermediarios; exige distinguir instrumentos y riesgo de emisor.',
  protection:'Un fondo monetario no tiene garantía de depósitos ni garantiza el capital. La protección depende de la estructura, depositario, emisor y normativa del instrumento.',
  term:'Corto plazo; revisa duración de cartera, vencimientos y ventanas de reembolso.',
  exit:'La salida depende del mercado, del horario de negociación y de las reglas del fondo o instrumento.'
 },
 'Renta fija':{
  summary:'El inversor presta dinero a un emisor o compra un título de deuda. El retorno puede proceder de cupones, descuento o variación del precio, y depende de crédito, tipos y vencimiento.',
  how:'El emisor recibe financiación y se compromete a pagar intereses o devolver el principal según las condiciones del título. Si vendes antes del vencimiento, el precio puede ser superior o inferior al de compra.',
  income:'Cupones periódicos, intereses o diferencia entre precio de compra y reembolso. La frecuencia y el importe dependen de la emisión; no todos los títulos pagan cupón.',
  costs:'Comisiones de compraventa y custodia, diferencial, cambio de divisa y posibles costes de amortización o intermediación.',
  tax:'Los cupones suelen tributar como rendimientos del capital mobiliario; la transmisión o amortización puede generar rendimientos o ganancias/pérdidas según el instrumento.',
  taxDetail:'El tratamiento depende de si se trata de cupón, rendimiento implícito, transmisión, amortización, deuda pública o privada y de la residencia del emisor. Pueden existir retenciones y reglas específicas para activos extranjeros. Verifica el folleto y la normativa vigente.',
  steps:['Lee las condiciones de emisión: emisor, cupón, vencimiento, moneda, prelación y garantías.','Valora solvencia, duración, sensibilidad a tipos, inflación y riesgo de reinversión.','Compara rentabilidad a vencimiento con precio, comisiones y diferencial.','Simula impago, venta anticipada y subida de tipos; no confundas cupón con rentabilidad total.'],
  fit:'Inversores que buscan flujos o vencimientos definidos y comprenden el riesgo de crédito y la fluctuación del precio.',
  avoid:'No encaja si necesitas capital garantizado antes del vencimiento o no puedes asumir pérdidas por impago o venta anticipada.',
  barrier:'La compra puede ser sencilla, pero analizar solvencia, duración, prelación y precio exige conocimientos de renta fija.',
  protection:'La deuda no está cubierta por el fondo de garantía de depósitos. La recuperación depende del emisor, garantías, prelación y procedimiento concursal.',
  term:'Hasta vencimiento o durante el horizonte que permita soportar fluctuaciones de precio.',
  exit:'La venta anticipada depende de compradores y liquidez; puede exigir aceptar un descuento o pérdida.'
 },
 'Renta variable':{
  summary:'Representa una participación en el capital de una empresa. El retorno procede de la evolución del precio y, si se aprueban, de los dividendos.',
  how:'Se adquieren acciones y se participa económicamente en la empresa. El precio refleja expectativas de beneficios, tipos, competencia y condiciones de mercado; los dividendos dependen de decisiones corporativas.',
  income:'Dividendos cuando la compañía los declara y paga. No son obligatorios ni estables; el retorno también puede proceder de la revalorización o incluir pérdidas.',
  costs:'Comisiones de compraventa y custodia, diferencial, cambio de divisa, tasas de mercado y posibles costes de cobro de dividendos extranjeros.',
  tax:'Los dividendos suelen tributar como rendimientos del capital mobiliario y las ganancias o pérdidas por venta como ganancias/pérdidas patrimoniales en la base del ahorro.',
  taxDetail:'En acciones internacionales puede haber retención en origen y mecanismos para evitar doble imposición. La venta genera una ganancia o pérdida calculada con el valor de adquisición y transmisión, aplicando las reglas fiscales vigentes. Consulta AEAT y la documentación del intermediario.',
  steps:['Analiza negocio, ingresos, márgenes, deuda, ventaja competitiva y valoración.','Diversifica por empresas, sectores, países y divisas; evita concentraciones no intencionadas.','Revisa política de dividendos, liquidez, gobierno corporativo y calendario de resultados.','Incluye comisiones, impuestos y un escenario de caída importante del precio.'],
  fit:'Horizonte largo, capacidad de soportar volatilidad y voluntad de analizar empresas o mantener una cartera diversificada.',
  avoid:'No encaja con dinero que puedas necesitar pronto ni con una estrategia que dependa de dividendos garantizados.',
  barrier:'Acceso sencillo en mercados cotizados; la barrera real está en valorar empresas y controlar concentración y volatilidad.',
  protection:'La propiedad de acciones y la custodia están sujetas a normativa e intermediarios, pero no existe garantía del capital ni cobertura frente a caídas bursátiles.',
  term:'Normalmente medio o largo plazo; el horizonte debe tolerar ciclos de mercado.',
  exit:'Puede negociarse en mercado abierto si hay liquidez, pero el precio de venta no está garantizado.'
 },
 'Fondos de inversión':{
  summary:'Reúnen el dinero de varios partícipes para invertir en una cartera gestionada según una política definida. El resultado depende de los activos, estrategia y costes.',
  how:'El inversor compra participaciones y el fondo invierte siguiendo un mandato. Puede replicar un índice o seleccionar activos activamente; las ganancias se reflejan en el valor liquidativo o en distribuciones.',
  income:'En clases de acumulación, los rendimientos se reinvierten en el fondo; en clases de reparto pueden abonarse distribuciones. El resultado total depende del valor liquidativo.',
  costs:'Comisión de gestión y depositaría, TER, posibles comisiones de suscripción o reembolso y costes internos de transacción.',
  tax:'La venta o reembolso suele generar una ganancia o pérdida patrimonial. Los traspasos entre fondos que cumplen los requisitos legales pueden diferir la tributación.',
  taxDetail:'El régimen de traspasos del IRPF no se aplica de forma universal a cualquier vehículo ni a ETF. Comprueba la forma jurídica, comercialización en España, clase de participación y requisitos del artículo 94 LIRPF. Las distribuciones pueden tener tributación distinta del fondo de acumulación.',
  steps:['Lee folleto y documento de datos fundamentales: objetivo, índice, cartera y riesgo.','Compara TER, costes de transacción, tracking error o consistencia de la gestión.','Comprueba clase de acumulación/reparto, divisa, depositario y condiciones de reembolso.','Revisa si puede acogerse al régimen de traspasos y si encaja en tu horizonte.'],
  fit:'Quien busca diversificación y gestión delegada mediante una cartera colectiva, con un horizonte acorde a los activos del fondo.',
  avoid:'No elijas solo por rentabilidad pasada o estrellas; revisa estrategia, costes, riesgo y fiscalidad.',
  barrier:'Acceso habitualmente sencillo; exige comprender política de inversión, costes, clase y riesgo de la cartera.',
  protection:'El patrimonio del fondo está separado conforme a su estructura y supervisión, pero el valor liquidativo puede caer y no existe garantía general del capital.',
  term:'Depende de la cartera: monetarios y renta fija corta pueden ser distintos de fondos de renta variable.',
  exit:'El reembolso sigue los plazos y ventanas del folleto; el precio se calcula según valor liquidativo.'
 },
 'ETF y ETC':{
  summary:'Son vehículos negociados en bolsa que ofrecen exposición a índices, bonos, sectores o materias primas. El precio de mercado puede diferir temporalmente del valor de referencia.',
  how:'Se compran y venden como valores durante la sesión. El vehículo replica un índice o exposición mediante tenencia física, derivados u otra estructura; revisa metodología, colateral y tracking difference.',
  income:'Puede proceder de dividendos o cupones distribuidos; en clases de acumulación se reinvierte. Los ETC pueden seguir materias primas y no equivalen necesariamente a un fondo diversificado.',
  costs:'TER, comisión del bróker, diferencial, custodia, cambio de divisa y posibles costes de réplica, swap o roll-over.',
  tax:'Las distribuciones pueden tributar como rendimientos del capital mobiliario y la venta como ganancia o pérdida patrimonial. El régimen de traspasos de fondos no se aplica automáticamente a ETF.',
  taxDetail:'El tratamiento depende de la forma jurídica del ETF/ETC, domicilio, distribución o acumulación y residencia fiscal. Comprueba retenciones extranjeras, documentación fiscal y si el producto es un fondo, nota o título de deuda.',
  steps:['Identifica índice, exposición, metodología, réplica física o sintética y colateral.','Compara TER, tracking difference, spread, volumen y tamaño del vehículo.','Comprueba divisa, política de distribución, domicilio y estructura jurídica.','Usa órdenes adecuadas y evita operar cuando el spread sea anormalmente amplio.'],
  fit:'Inversores que quieren exposición cotizada, diversificación y control de costes, y entienden el riesgo del subyacente.',
  avoid:'No lo trates como un fondo bancario garantizado ni ignores apalancamiento, divisa o estructura de ETC.',
  barrier:'Acceso sencillo mediante bróker; la selección requiere comprender índice, réplica, liquidez y estructura.',
  protection:'La negociación en bolsa no garantiza el capital. Revisa la estructura del vehículo, depositario, colateral y riesgo de contraparte.',
  term:'Depende del subyacente y de la estrategia; evita asumir que todo ETF es adecuado para largo plazo.',
  exit:'Se vende en mercado durante la sesión, sujeto a liquidez, spread, volatilidad y disponibilidad de contrapartida.'
 },
 'Derivados':{
  summary:'Contratos cuyo valor depende de un subyacente. Pueden utilizarse para cobertura o especulación y suelen incorporar vencimientos, garantías y apalancamiento.',
  how:'El resultado depende de la evolución del subyacente y de las condiciones del contrato: tamaño, multiplicador, strike, vencimiento, liquidación y margen. Una pequeña variación del subyacente puede causar grandes cambios en el valor del derivado.',
  income:'No generan rentas pasivas por sí mismos. El resultado procede de la liquidación o venta del contrato y puede incluir costes de financiación o ajustes.',
  costs:'Spread, comisiones, margen, financiación overnight, rollover, ejercicio, liquidación y posibles costes por falta de garantías.',
  tax:'La tributación depende del contrato y de si se liquida, vende, ejerce o compensa. No apliques automáticamente el tratamiento de dividendos o intereses.',
  taxDetail:'Conserva extractos y liquidaciones de cada operación. La calificación fiscal puede variar entre futuros, opciones, warrants, turbos y CFDs, así como por residencia y mercado. Verifica las reglas vigentes con AEAT y asesoramiento especializado.',
  steps:['Comprende payoff, multiplicador, vencimiento, liquidación y pérdida máxima posible.','Calcula margen, apalancamiento, escenarios de gap y posibilidad de margin call.','Revisa contraparte, garantías, costes de financiación y reglas de cierre.','Opera solo con límites de pérdida definidos y sin utilizar dinero necesario.'],
  fit:'Usuarios experimentados que buscan cobertura o exposición táctica y comprenden contratos, garantías y pérdidas potenciales.',
  avoid:'No es apropiado para principiantes, ahorro esencial ni quien no pueda soportar pérdidas rápidas o superiores al desembolso inicial.',
  barrier:'La operativa exige conocimientos técnicos, autorización del intermediario y capacidad para aportar garantías.',
  protection:'La protección depende del mercado, contraparte y garantías. Los mecanismos de compensación no cubren pérdidas de mercado ni eliminan el riesgo de apalancamiento.',
  term:'Vinculado al vencimiento del contrato; algunos productos tienen barreras o liquidación anticipada.',
  exit:'Puede cerrarse antes del vencimiento si existe mercado, pero el spread y la volatilidad pueden ser elevados.'
 },
 'Productos estructurados y gestión alternativa':{
  summary:'Incluye productos con pagos condicionados a fórmulas o subyacentes y estrategias alternativas agrupadas en vehículos especializados. La estructura legal y el emisor son determinantes.',
  how:'Un estructurado combina deuda y derivados para definir un pago sujeto a escenarios, barreras o fechas. Un hedge fund aplica estrategias alternativas con reglas propias, posible apalancamiento y restricciones de liquidez.',
  income:'El retorno puede ser cupón condicionado, reembolso vinculado a un subyacente o resultado de una estrategia. No debe confundirse cupón anunciado con rentabilidad efectiva.',
  costs:'Costes de estructuración y distribución, gestión, depositaría, incentivos, derivados, spreads y penalizaciones por salida anticipada.',
  tax:'La tributación depende de la estructura jurídica y de si los cobros son intereses, rendimientos, dividendos o ganancias patrimoniales.',
  taxDetail:'Revisa folleto, emisor, forma de reembolso, retenciones, condiciones de barrera y posibles pérdidas. Los fondos alternativos y notas estructuradas pueden tener tratamientos distintos; no existe una regla fiscal única.',
  steps:['Lee el payoff completo y simula escenarios favorables, neutros y adversos.','Identifica emisor, contraparte, subordinación, colateral y riesgo de insolvencia.','Comprueba comisiones implícitas, liquidez secundaria, vencimiento y barreras.','Evalúa si entiendes cómo y cuándo puedes perder capital.'],
  fit:'Inversores con experiencia que comprenden la estructura y pueden inmovilizar capital según las condiciones.',
  avoid:'Evítalo si el mecanismo de pago, emisor, comisiones o escenarios de pérdida no son transparentes.',
  barrier:'La barrera es media o alta por la complejidad contractual y la necesidad de analizar el emisor y los escenarios.',
  protection:'La protección depende de la forma jurídica, emisor, garantías y supervisión. El capital puede estar expuesto al riesgo de crédito y de mercado.',
  term:'Suele depender de vencimientos, periodos de bloqueo o ventanas de reembolso.',
  exit:'La salida anticipada puede no estar disponible o realizarse con un descuento significativo.'
 },
 'Gestión delegada':{
  summary:'El inversor delega la selección y el ajuste de una cartera en un gestor o servicio automatizado según un perfil de riesgo y un mandato.',
  how:'Se define un objetivo y perfil; el proveedor asigna activos y realiza rebalanceos o cambios conforme al mandato. El resultado depende de la cartera subyacente, costes y disciplina de gestión.',
  income:'Puede acumular rendimientos o distribuir intereses y dividendos según los activos y la política del servicio.',
  costs:'Comisión de gestión o asesoramiento, custodia, costes de los fondos subyacentes, transacción y posibles costes de cambio de cartera.',
  tax:'La tributación depende de los activos y operaciones realizadas. En carteras de fondos, los traspasos entre fondos elegibles pueden tener diferimiento; no se aplica a todos los vehículos.',
  taxDetail:'Comprueba si el servicio mantiene fondos, ETF, acciones u otros productos y quién ejecuta las operaciones. Los rebalanceos y ventas pueden generar hechos imponibles; revisa informes fiscales y régimen de traspasos.',
  steps:['Define objetivo, plazo, necesidad de liquidez y pérdida asumible.','Compara mandato, cartera, diversificación, comisiones totales y conflictos de interés.','Comprueba custodia, entidad, supervisión, rebalanceos y política de retirada.','Revisa periódicamente que el perfil siga siendo adecuado.'],
  fit:'Quien desea delegar decisiones y mantener una estrategia diversificada con reglas y costes transparentes.',
  avoid:'No delegues sin entender mandato, costes, custodia y riesgo; la gestión delegada no garantiza resultados.',
  barrier:'Barrera de acceso baja o media; exige comparar proveedor, mandato, costes y adecuación del perfil.',
  protection:'La custodia y protección dependen de los activos y entidades. La delegación no protege frente a pérdidas de mercado.',
  term:'Medio o largo plazo según la cartera y el objetivo.',
  exit:'La retirada depende de los activos subyacentes y de los plazos de liquidación del proveedor.'
 },
 'Previsión y seguros de ahorro':{
  summary:'Son productos de previsión o seguros que canalizan ahorro a largo plazo mediante aportaciones y reglas específicas de disponibilidad, garantía y prestación.',
  how:'Se realizan aportaciones a un plan o póliza. El capital puede invertirse en una cartera o quedar sujeto a condiciones aseguradoras; el resultado depende de garantías, costes, plazo y modalidad de cobro.',
  income:'Normalmente acumulación durante la fase de ahorro; en la prestación puede recibirse capital o renta, según el producto y contrato.',
  costs:'Comisiones de gestión y depositaría, gastos de póliza, primas de riesgo, costes de los fondos vinculados y posibles penalizaciones de rescate.',
  tax:'El tratamiento varía mucho: algunos planes permiten reducir base imponible bajo límites y las prestaciones tributan como rendimientos del trabajo; PIAS y SIALP tienen requisitos propios.',
  taxDetail:'No extrapoles el régimen de un plan de pensiones a PPA, PIAS, SIALP, unit linked o rentas vitalicias. Revisa límites de aportación, contingencias, antigüedad, rescate, beneficiarios y forma de cobro en la normativa y contrato vigentes.',
  steps:['Identifica si es plan de pensiones, seguro, PIAS, SIALP, PPA o unit linked.','Revisa disponibilidad, contingencias, garantías, costes y política de inversión.','Compara fiscalidad de aportaciones y prestaciones, no solo el incentivo inicial.','Comprueba solvencia del asegurador, beneficiarios y condiciones de rescate.'],
  fit:'Ahorro previsional de largo plazo cuando las condiciones de disponibilidad y tributación encajan con el objetivo.',
  avoid:'No lo contrates solo por una ventaja fiscal o una garantía anunciada sin comprender costes, rescate y tributación final.',
  barrier:'Acceso relativamente sencillo, pero el contrato, las restricciones de liquidez y la fiscalidad requieren revisión cuidadosa.',
  protection:'Las garantías, si existen, dependen del contrato y solvencia del asegurador. No todos los productos tienen garantía de capital ni cobertura de depósitos.',
  term:'Largo plazo o hasta la contingencia, vencimiento o antigüedad exigida por el producto.',
  exit:'Puede haber restricciones, supuestos legales de rescate, penalizaciones o impacto fiscal al retirar.'
 },
 'Inmueble directo':{
  summary:'Consiste en adquirir o explotar directamente un inmueble. El resultado puede combinar alquileres, uso económico y variación del valor, menos vacantes y gastos.',
  how:'Se compra un derecho sobre el inmueble y se obtiene rendimiento mediante alquiler, explotación o venta. La ubicación, estado, ocupación, normativa, financiación y gestión determinan el flujo neto.',
  income:'Alquiler o explotación si existe demanda y ocupación. Los ingresos brutos deben reducirse por vacantes, impagos, comunidad, IBI, seguros, mantenimiento, gestión y financiación.',
  costs:'IBI, comunidad, seguro, reparaciones, mantenimiento, administración, suministros no repercutidos y financiación.',
  tax:'La compra puede tributar por IVA o ITP según inmueble y operación; el alquiler y la venta tienen tratamientos distintos en IRPF o IS. Pueden existir tributos locales.',
  taxDetail:'Distingue vivienda habitual, alquiler residencial, temporada, turístico, local, garaje, suelo y actividad empresarial. Comprueba IVA/ITP/AJD, gastos deducibles, amortización, retenciones, plusvalía municipal y normativa autonómica/local.',
  steps:['Analiza ubicación, demanda de alquiler, comparables, ocupación y precio real de cierre.','Revisa nota simple, cargas, titularidad, licencias, estado técnico y normativa de uso.','Calcula impuestos y gastos de compra, reforma, financiación, mantenimiento y periodos vacíos.','Estima rentabilidad neta y flujo de caja con escenarios de tipos, impago y reparaciones.'],
  fit:'Inversor con capital, horizonte largo y capacidad para asumir gestión, concentración y gastos imprevistos.',
  avoid:'No encaja si necesitas liquidez inmediata, no puedes cubrir vacantes o no has verificado uso legal y coste total.',
  barrier:'La compra directa suele exigir capital elevado, análisis legal y técnico, financiación y capacidad de gestión.',
  protection:'La titularidad registral y los contratos ofrecen derechos legales, pero no garantizan valor ni rentas. Comprueba cargas, licencias, seguros y solvencia del arrendatario.',
  term:'Medio o largo plazo; depende del uso, ciclo inmobiliario y estrategia de salida.',
  exit:'La venta puede tardar y conlleva agencia, impuestos, notaría y posibles descuentos para lograr liquidez.'
 },
 'REITs y SOCIMI':{
  summary:'Son sociedades inmobiliarias cotizadas o vehículos equivalentes que poseen, gestionan o financian inmuebles y pueden repartir parte de sus rentas.',
  how:'Se adquieren acciones de una sociedad inmobiliaria. Su valor depende de alquileres, ocupación, calidad de activos, deuda, tipos de interés, gestión y cotización.',
  income:'Dividendos o distribuciones cuando se aprueban; no están garantizados y pueden cambiar según resultados, deuda y política de reparto.',
  costs:'Comisión de bróker, custodia, diferencial, cambio de divisa y costes de gestión inmobiliaria que soporta la sociedad.',
  tax:'Los dividendos y ganancias por venta suelen tributar en la base del ahorro del IRPF. En vehículos extranjeros puede existir retención en origen.',
  taxDetail:'Comprueba el régimen de la SOCIMI/REIT, país de residencia, retenciones, convenios de doble imposición y documentación fiscal del intermediario. La fiscalidad de la sociedad no sustituye la del accionista.',
  steps:['Analiza cartera de inmuebles, zonas, segmentos, ocupación y calidad de inquilinos.','Revisa deuda, vencimientos, LTV, coste financiero, NAV y descuento o prima bursátil.','Compara dividendos sostenibles con flujo de caja y necesidades de inversión.','Valora liquidez bursátil, comisiones, fiscalidad y concentración.'],
  fit:'Quien busca exposición inmobiliaria cotizada y liquidez de mercado sin gestionar inmuebles directamente.',
  avoid:'No lo confundas con alquiler directo ni asumas que el dividendo o el precio de la acción son estables.',
  barrier:'Acceso similar a una acción cotizada; requiere analizar deuda, cartera inmobiliaria y sostenibilidad de dividendos.',
  protection:'La cotización y la regulación no garantizan el capital. El accionista asume riesgo empresarial, inmobiliario y de mercado.',
  term:'Medio o largo plazo, aunque cotiza diariamente.',
  exit:'Puede venderse en mercado si hay volumen; el precio puede cotizar con descuento respecto al valor de los inmuebles.'
 },
 'Fondos inmobiliarios':{
  summary:'Permiten invertir en una cartera de inmuebles o compañías inmobiliarias a través de un vehículo colectivo o cotizado.',
  how:'El vehículo reúne capital para comprar, financiar o mantener activos inmobiliarios. El resultado depende de alquileres, valoraciones, deuda, gestión, costes y liquidez del vehículo.',
  income:'Rentas o distribuciones si el vehículo las genera; también puede acumular ingresos en el valor liquidativo.',
  costs:'Comisiones de gestión y depositaría, TER, valoración, administración, suscripción/reembolso y, en ETF, bróker y spread.',
  tax:'La tributación depende de la forma jurídica: fondo, ETF, sociedad o vehículo extranjero. Puede haber ganancias por reembolso, dividendos o distribuciones.',
  taxDetail:'Comprueba si el producto es un fondo de inversión elegible para traspasos, un ETF o una sociedad. Revisa retenciones, distribución, domicilio y reglas fiscales del vehículo concreto.',
  steps:['Identifica activos, ubicación, segmentos y porcentaje de inversión directa o cotizada.','Revisa liquidez, ventanas de reembolso, apalancamiento, tasaciones y concentración.','Compara comisiones, valor liquidativo, política de distribución y deuda.','Analiza el riesgo inmobiliario y del gestor; no presupongas liquidez diaria.'],
  fit:'Quien quiere diversificar exposición inmobiliaria con menos capital y sin gestión directa.',
  avoid:'No encaja si necesitas salida inmediata en un vehículo con ventanas, suspensiones o mercado secundario limitado.',
  barrier:'Barrera de capital normalmente menor que la compra directa, pero exige revisar vehículo, comisiones y liquidez.',
  protection:'La segregación y supervisión dependen de la estructura. El valor puede caer y los reembolsos pueden limitarse.',
  term:'Medio o largo plazo, especialmente en vehículos con activos ilíquidos.',
  exit:'Depende del vehículo: negociación bursátil, reembolso periódico o ventanas sujetas a liquidez.'
 },
 'Crowdfunding inmobiliario':{
  summary:'Permite participar en proyectos inmobiliarios mediante préstamos o aportaciones de capital a través de una plataforma.',
  how:'El inversor financia un promotor o proyecto. En deuda recibe intereses y devolución si se paga; en capital participa en resultados o plusvalía. El plazo y riesgo dependen del proyecto.',
  income:'Intereses contractuales o participación en beneficios/venta. Puede haber retrasos, impagos, ampliaciones de plazo o pérdida de capital.',
  costs:'Comisión de plataforma, estructuración, administración, asesoramiento legal, cobro y posibles gastos de recuperación.',
  tax:'Los intereses pueden tributar como rendimientos del capital mobiliario; las ganancias de una participación pueden tener otra calificación.',
  taxDetail:'Identifica si la inversión es préstamo, valor negociable, participación societaria o copropiedad. Revisa retenciones, pérdidas por impago, gastos deducibles y obligaciones de información. La plataforma no determina por sí sola el tratamiento fiscal.',
  steps:['Analiza promotor, experiencia, licencias, tasación, presupuesto y viabilidad del proyecto.','Revisa estructura jurídica, garantías, prelación, LTV, calendario y escenarios de retraso.','Comprueba autorización o registro de la plataforma y segregación de fondos.','Diversifica por proyectos y asume que el capital puede quedar bloqueado.'],
  fit:'Inversor que acepta inmovilizar importes pequeños en proyectos concretos y puede asumir impagos o retrasos.',
  avoid:'Evítalo si necesitas liquidez, no comprendes la estructura o dependes de la devolución en una fecha exacta.',
  barrier:'Importe mínimo a veces reducido, pero la evaluación del promotor, garantías y documentación es exigente.',
  protection:'La supervisión de una plataforma no garantiza el proyecto ni la devolución. Las garantías solo valen según su rango, ejecución y solvencia.',
  term:'Hasta el vencimiento del préstamo o finalización y venta del proyecto.',
  exit:'Normalmente limitada; puede no existir mercado secundario ni reembolso anticipado.'
 },
 'Terrenos':{
  summary:'La inversión se basa en adquirir suelo o derechos sobre él esperando explotación, desarrollo o revalorización futura.',
  how:'El valor depende de clasificación urbanística, planeamiento, acceso, servicios, cargas, permisos y demanda. Muchos terrenos no generan rentas mientras no se desarrollen o arrienden.',
  income:'Generalmente no genera ingresos periódicos por sí solo; puede producirlos mediante explotación agrícola, arrendamiento o desarrollo autorizado.',
  costs:'IBI, mantenimiento, limpieza, seguros, vigilancia, estudios técnicos, gestión y posibles gastos de conservación.',
  tax:'La adquisición puede tributar por ITP o IVA/AJD según vendedor y naturaleza del suelo; la tenencia y venta pueden generar tributos estatales y locales.',
  taxDetail:'Verifica clasificación urbanística, uso permitido, condición de solar, cargas, afecciones y normativa local. El tratamiento fiscal cambia entre suelo urbano, urbanizable, rústico y fincas explotadas. Consulta normativa autonómica y municipal.',
  steps:['Solicita nota simple, catastro, planeamiento y certificados urbanísticos actualizados.','Comprueba cargas, servidumbres, acceso, suministros, riesgos ambientales y deslindes.','Analiza demanda real, plazos de desarrollo y costes de urbanización o explotación.','Calcula impuestos, IBI, mantenimiento y escenarios de venta sin cambio urbanístico.'],
  fit:'Inversor paciente con conocimiento urbanístico o agrícola y capacidad para inmovilizar capital.',
  avoid:'No encaja si dependes de una recalificación futura o no puedes asumir años sin ingresos.',
  barrier:'Barrera alta por capital, análisis registral y urbanístico, permisos y horizonte incierto.',
  protection:'La inscripción registral acredita derechos, no la posibilidad de edificar ni una revalorización. Comprueba planeamiento, cargas y restricciones.',
  term:'Largo plazo y sujeto a planeamiento, permisos y ciclo inmobiliario.',
  exit:'Liquidez normalmente baja; el comprador exigirá documentación y precio acorde al uso permitido.'
 },
 'Negocio propio':{
  summary:'Consiste en crear u operar una actividad económica y obtener valor del margen entre ventas y costes, además de una posible venta futura del negocio.',
  how:'El propietario invierte capital y trabajo para ofrecer productos o servicios. La rentabilidad depende de demanda, precio, margen, costes fijos, equipo, operaciones y capacidad de generar caja.',
  income:'Ventas y cobros de clientes; el beneficio real se obtiene después de compras, personal, alquiler, impuestos, financiación y circulante.',
  costs:'Personal, alquiler, suministros, compras, seguros, marketing, licencias, software, mantenimiento, gestoría y financiación.',
  tax:'La tributación depende de la forma jurídica y actividad: IRPF o Impuesto sobre Sociedades, IVA, retenciones, cotizaciones y tributos locales.',
  taxDetail:'Define si operas como autónomo o sociedad y revisa alta censal, IVA aplicable, deducibilidad, amortizaciones, nóminas, retenciones, obligaciones laborales y licencias. No existe un tipo fiscal único para todos los negocios.',
  steps:['Valida clientes, demanda, competencia y precio antes de comprometer inversión.','Calcula margen bruto, punto de equilibrio, caja, circulante y capacidad de cubrir costes fijos.','Comprueba licencias, contrato de local, proveedores, personal y obligaciones legales.','Prueba un escenario con ventas menores, costes mayores y retraso en cobros.'],
  fit:'Emprendedor operador con tiempo, conocimientos del sector y capacidad para asumir riesgo comercial.',
  avoid:'No es una inversión pasiva: evita comprometer dinero que no puedas perder o depender de ventas optimistas.',
  barrier:'Barrera alta por dedicación, capital circulante, permisos, gestión y validación comercial.',
  protection:'No hay garantía de capital. La responsabilidad depende de la forma jurídica, contratos, garantías personales y estructura de deuda.',
  term:'Medio o largo plazo; la consolidación puede requerir años.',
  exit:'La venta depende de resultados, equipo, contratos, activos y existencia de un comprador.'
 },
 'Negocios digitales':{
  summary:'Agrupa activos digitales que monetizan audiencia, comercio, software, contenido o servicios online mediante ventas, suscripciones, publicidad o licencias.',
  how:'Se crea o adquiere un activo digital y se monetiza con tráfico, clientes, usuarios o suscriptores. La rentabilidad depende de adquisición, conversión, retención, márgenes y dependencia de plataformas.',
  income:'Ventas online, suscripciones, publicidad, afiliación, licencias o patrocinios; los ingresos pueden ser recurrentes pero no están garantizados.',
  costs:'Hosting, dominio, software, pasarelas de pago, comisiones de marketplace, publicidad, creación de contenido, soporte, ciberseguridad y personal.',
  tax:'Los ingresos tributan como actividad económica o societaria según estructura. La venta online y los servicios digitales pueden generar obligaciones de IVA en distintos territorios.',
  taxDetail:'Revisa IVA, reglas de localización de servicios, OSS/IOSS cuando proceda, facturación, retenciones, propiedad intelectual, protección de datos y contratos con plataformas. El tratamiento depende del modelo, cliente y país.',
  steps:['Valida demanda, tráfico cualificado, conversión, retención y margen por cliente.','Comprueba titularidad de dominio, código, marca, contenidos, datos y cuentas publicitarias.','Calcula coste de adquisición, churn, comisiones, hosting y dependencia de terceros.','Diversifica canales y documenta procesos para que el negocio no dependa de una sola persona o plataforma.'],
  fit:'Quien entiende producto, marketing y operaciones digitales y puede mantener el activo o contratar esa gestión.',
  avoid:'No lo valores solo por visitas o facturación; evita activos dependientes de un algoritmo o cliente único.',
  barrier:'Capital inicial variable; la barrera principal suele ser conseguir demanda rentable y mantener tecnología y operaciones.',
  protection:'La propiedad de dominios, código, marca y datos debe acreditarse. No existe garantía de ingresos; revisa derechos, licencias y condiciones de plataformas.',
  term:'Medio plazo para validar y largo plazo para construir ingresos sostenibles.',
  exit:'La venta requiere acreditar tráfico, ingresos, propiedad de activos, estabilidad y transferibilidad de cuentas.'
 },
 'Participaciones empresariales':{
  summary:'Consiste en adquirir una parte del capital de una empresa no cotizada y asumir sus derechos, obligaciones y riesgos como socio.',
  how:'El inversor aporta capital a cambio de participaciones o acciones. El retorno puede proceder de dividendos, recompra o venta de la participación; depende de resultados y acuerdos societarios.',
  income:'Dividendos si se aprueban y existe beneficio distribuible; normalmente el retorno depende de una venta o evento de liquidez.',
  costs:'Due diligence, valoración, asesoramiento legal y financiero, formalización, administración y posibles ampliaciones de capital.',
  tax:'Los dividendos y ganancias por transmisión suelen tributar en IRPF o IS según el titular y la estructura.',
  taxDetail:'Revisa pacto de socios, derechos económicos, restricciones de transmisión, valoración, retenciones y posibles regímenes especiales. La fiscalidad puede variar si se invierte mediante sociedad o vehículo.',
  steps:['Analiza cuentas, deuda, caja, clientes, márgenes, equipo y contingencias.','Revisa estatutos, pacto de socios, derechos de voto, preferencia, arrastre y acompañamiento.','Comprueba valoración, dilución, futuras rondas y escenarios de salida.','Formaliza garantías, información periódica y mecanismos de resolución de conflictos.'],
  fit:'Inversor capaz de analizar empresas privadas y mantener capital inmovilizado durante años.',
  avoid:'Evítalo si no tienes acceso a información suficiente o no puedes asumir pérdida total e iliquidez.',
  barrier:'Barrera alta por acceso a oportunidades, análisis financiero, negociación y documentación legal.',
  protection:'Los derechos dependen de la clase de participación, estatutos y pactos. No existe garantía de recuperación del capital.',
  term:'Largo plazo, con salida dependiente de dividendos, recompra o venta a un tercero.',
  exit:'Muy limitada; puede requerir consentimiento de socios o comprador y aceptar descuento.'
 },
 'Venture Capital':{
  summary:'Financia empresas emergentes en fases tempranas a cambio de participación, buscando crecimiento elevado y una futura salida.',
  how:'El capital se aporta en rondas para desarrollar producto, contratar equipo y escalar. La valoración cambia con hitos y nuevas rondas; la participación puede diluirse.',
  income:'Normalmente no hay ingresos periódicos; el retorno depende de una venta, salida a bolsa o distribución extraordinaria.',
  costs:'Comisiones de vehículo o plataforma, gastos legales, due diligence, administración y carried interest cuando se invierte mediante fondo.',
  tax:'El resultado fiscal depende de si se invierte directamente, mediante fondo o sociedad y de cómo se materializa la salida.',
  taxDetail:'Revisa titularidad, vehículo, posibles incentivos fiscales sujetos a requisitos, pérdidas, plusvalías y retenciones. No presupongas que toda inversión en startups tiene beneficios fiscales.',
  steps:['Analiza equipo fundador, mercado, producto, tracción, unit economics y runway.','Revisa valoración, cap table, preferencias de liquidación, convertibles y derechos de información.','Modela dilución, nuevas rondas, fracaso y distintos escenarios de salida.','Diversifica y limita el importe a capital que puedas mantener y perder.'],
  fit:'Inversor sofisticado con horizonte largo y capacidad para asumir alta dispersión de resultados.',
  avoid:'No encaja con objetivos de liquidez ni con quien necesita preservar capital.',
  barrier:'Barrera alta por acceso, análisis especializado, mínimos de inversión y plazos largos.',
  protection:'La participación no garantiza recuperación. Revisa derechos, prioridad de liquidación, custodia y estructura del vehículo.',
  term:'Muy largo plazo; las salidas pueden tardar muchos años o no producirse.',
  exit:'Iliquidez elevada; depende de venta de empresa, recompra, mercado secundario o vencimiento del fondo.'
 },
 'Private Equity':{
  summary:'Invierte en empresas privadas más maduras mediante adquisiciones o participaciones, buscando mejorar su valor y venderlas posteriormente.',
  how:'El vehículo adquiere participaciones, a veces con financiación, e intenta mejorar operaciones, márgenes, gobierno o estructura de capital antes de una salida.',
  income:'Puede haber dividendos o distribuciones, pero el retorno suele depender de la venta de la participación al final de la inversión.',
  costs:'Comisiones de gestión, carried interest, due diligence, financiación, asesoramiento, administración y costes de transacción.',
  tax:'La tributación depende de la estructura del fondo o sociedad y del tipo de distribución o plusvalía recibida.',
  taxDetail:'Revisa residencia y forma jurídica del vehículo, tratamiento de distribuciones, retenciones, carried interest y posibles regímenes especiales. La fiscalidad del fondo y del inversor son niveles distintos.',
  steps:['Analiza calidad de beneficios, deuda, flujo de caja, equipo y posición competitiva.','Revisa precio de adquisición, apalancamiento, covenants y plan de creación de valor.','Comprueba comisiones, horizonte del fondo, llamadas de capital y distribución de retornos.','Evalúa escenarios de salida y sensibilidad a tipos, múltiplos y ciclo económico.'],
  fit:'Inversor profesional o cualificado con capital elevado, diversificación y horizonte largo.',
  avoid:'Evítalo si no puedes atender compromisos de capital o soportar iliquidez y pérdidas.',
  barrier:'Barrera alta por mínimos, elegibilidad, due diligence y complejidad de estructura.',
  protection:'Los derechos y riesgos dependen del vehículo, pactos y estructura de deuda; no hay garantía de capital.',
  term:'Largo plazo, normalmente con vida del fondo y extensiones previstas en su documentación.',
  exit:'La salida suele depender de venta de empresa o participación; no suele ser inmediata.'
 },
 'Intangibles y capital humano':{
  summary:'Incluye derechos de propiedad intelectual, licencias, marcas, dominios y capacidades que pueden generar ingresos o aumentar el valor de un negocio.',
  how:'El valor se obtiene mediante licencias, royalties, cesión de derechos, explotación comercial o mejora de productividad. La demanda, protección legal y capacidad de monetización son esenciales.',
  income:'Royalties, licencias, cesiones, ventas o ingresos profesionales. La formación y el desarrollo profesional suelen generar retorno indirecto mediante mayores ingresos laborales o empresariales.',
  costs:'Registro y renovación de derechos, asesoramiento legal, defensa frente a infracciones, mantenimiento de dominios, plataformas, formación y actualización.',
  tax:'Los royalties y licencias pueden tributar como rendimientos del capital mobiliario o actividad económica según origen; la formación y servicios pueden tener otros tratamientos.',
  taxDetail:'Distingue cesión de derechos, prestación de servicios, actividad profesional, licencia empresarial y venta definitiva. Revisa IVA, retenciones, convenios internacionales y titularidad de la propiedad intelectual.',
  steps:['Comprueba titularidad, registro, alcance territorial, duración y derechos cedidos.','Valida demanda, compradores, licenciatarios y capacidad real de monetización.','Revisa contratos, exclusividad, royalties, protección y costes de defensa.','Calcula obsolescencia, mantenimiento y tiempo necesario para obtener ingresos.'],
  fit:'Quien dispone de derechos o capacidades diferenciadas y puede demostrar demanda y titularidad.',
  avoid:'No lo valores por ingresos hipotéticos o por una marca/dominio sin compradores identificables.',
  barrier:'Capital inicial variable; la barrera principal es acreditar derechos, demanda y capacidad de explotación.',
  protection:'La protección depende del registro, contrato, jurisdicción y prueba de titularidad. Los ingresos no están garantizados.',
  term:'Medio o largo plazo; puede depender de licencias, duración de derechos y obsolescencia.',
  exit:'La transmisión requiere acreditar titularidad y transferibilidad; el mercado secundario puede ser reducido.'
 },
 'Materias primas físicas':{
  summary:'Ofrecen exposición a precios de recursos físicos como metales, energía o productos agrícolas, directamente o mediante vehículos financieros.',
  how:'El retorno depende del precio spot, demanda y oferta, inventarios, divisa y vehículo. La tenencia física añade custodia y transporte; los futuros y ETC incorporan riesgos de estructura y renovación.',
  income:'La materia prima física no genera intereses ni dividendos por sí misma. El retorno procede de la variación del precio o de instrumentos vinculados.',
  costs:'Prima de compra, diferencial, almacenamiento, seguro, transporte, autenticación, custodia y costes de roll-over en derivados.',
  tax:'La tributación depende de si se posee el bien físico, un ETC, fondo, derivado o participación en una sociedad.',
  taxDetail:'Comprueba IVA, ITP u otros impuestos indirectos según metal, producto y vendedor; la venta puede generar ganancias patrimoniales. Los vehículos financieros tienen reglas distintas de la tenencia física.',
  steps:['Decide entre exposición física y financiera; no tienen los mismos costes ni riesgos.','Comprueba pureza, peso, certificación, almacenamiento y contraparte si es físico.','Analiza oferta, demanda, ciclos, divisa y volatilidad del producto.','Incluye prima, spread, seguro, transporte, custodia y fiscalidad en el precio de salida.'],
  fit:'Inversor que busca exposición diversificadora y comprende que el activo no genera flujo intrínseco.',
  avoid:'No encaja si buscas rentas periódicas o no puedes asumir volatilidad y costes de custodia.',
  barrier:'Acceso financiero puede ser sencillo; la tenencia física exige conocimiento, autenticación y almacenamiento.',
  protection:'La propiedad física exige verificar autenticidad y custodia; los ETC y derivados añaden riesgo de emisor o contraparte. No hay garantía de capital.',
  term:'Variable; la ausencia de flujo propio puede hacer costoso mantenerlo durante largos periodos.',
  exit:'Depende de mercado, pureza, formato, spread, comprador y costes de entrega o liquidación.'
 },
 'Criptoactivos':{
  summary:'Son activos digitales registrados en redes o sistemas criptográficos. Su valor y utilidad dependen del protocolo, adopción, liquidez, seguridad y regulación.',
  how:'Se adquieren tokens o se participa en protocolos. El retorno puede proceder de variación de precio, staking o servicios DeFi; cada mecanismo añade riesgos tecnológicos, de custodia y contraparte.',
  income:'La tenencia simple no genera ingresos. Staking, lending o minería pueden producir recompensas, pero incorporan bloqueo, slashing, costes, contraparte y riesgo de protocolo.',
  costs:'Comisiones de exchange, spread, red, custodia, retirada, conversión, validadores y costes de hardware o electricidad en minería.',
  tax:'Las ventas o permutas pueden generar ganancias o pérdidas patrimoniales; staking, minería y otras recompensas pueden tener calificación fiscal distinta.',
  taxDetail:'Conserva registros de compras, ventas, permutas, comisiones, recompensas y transferencias entre wallets. Revisa obligaciones informativas sobre activos en el extranjero y normativa vigente de AEAT. No asumas que todas las operaciones tienen el mismo tratamiento.',
  steps:['Comprende el protocolo, tokenomics, utilidad, concentración y riesgos de gobernanza.','Elige custodia: plataforma o wallet propia; protege claves y copias de seguridad.','Verifica liquidez, redes, contratos inteligentes, auditorías y riesgos de contraparte.','Calcula comisiones, fiscalidad y pérdida potencial total; evita apalancamiento innecesario.'],
  fit:'Solo para quien entiende tecnología y volatilidad y puede asumir la pérdida total del importe destinado.',
  avoid:'No encaja con ahorro esencial, objetivos cercanos ni quien no puede gestionar custodia y seguridad.',
  barrier:'Comprar puede ser fácil; custodiar, verificar redes y evaluar protocolos exige conocimientos y controles de seguridad.',
  protection:'No existe garantía de depósitos ni protección uniforme frente a pérdidas, hackeos, fallos de protocolo o insolvencia de plataformas.',
  term:'Muy variable y dependiente del protocolo; no hay vencimiento ni valor fundamental común a todos los tokens.',
  exit:'La venta depende de liquidez de mercado, red, plataforma y capacidad de retirar a moneda fiduciaria.'
 },
 'Deuda privada':{
  summary:'El inversor presta capital a empresas o particulares, o financia facturas y créditos, a cambio de intereses o descuento.',
  how:'Se concede financiación directamente o mediante plataforma. El retorno depende de la capacidad de pago, garantías, vencimiento, prelación y recuperación en caso de impago.',
  income:'Intereses, descuento de facturas o devolución del principal. Los pagos pueden retrasarse, reestructurarse o no recuperarse.',
  costs:'Comisiones de plataforma, originación, administración, análisis, asesoramiento legal, cobro y ejecución de garantías.',
  tax:'Los intereses suelen tributar como rendimientos del capital mobiliario; el factoring y otras estructuras pueden tener tratamiento diferente.',
  taxDetail:'Identifica prestamista, prestatario, cesión de crédito, garantía, retención y forma de remuneración. Revisa el tratamiento de impagos, pérdidas y recuperaciones con la normativa vigente.',
  steps:['Analiza prestatario, estados financieros, capacidad de pago y destino del préstamo.','Revisa garantías, rango, vencimiento, covenants y posibilidad de ejecución.','Comprueba plataforma, originador, concentración, comisiones y procedimientos de recobro.','Diversifica y simula retrasos, impago parcial y pérdida total.'],
  fit:'Inversor que busca intereses y comprende el riesgo de crédito y la iliquidez.',
  avoid:'Evítalo si necesitas disponibilidad inmediata o confundes tipo de interés alto con seguridad.',
  barrier:'La inversión mínima puede ser reducida en plataformas, pero el análisis de crédito y garantías es esencial.',
  protection:'Una garantía no asegura recuperar el capital; importa su valor, rango, validez y posibilidad real de ejecución.',
  term:'Hasta vencimiento o recuperación del crédito; los retrasos pueden alargarlo.',
  exit:'Normalmente limitada; la cesión del préstamo puede estar restringida o no tener mercado.'
 },
 'Arte':{
  summary:'La inversión en arte depende de la autenticidad, procedencia, estado, relevancia del artista y demanda de coleccionistas.',
  how:'Se adquiere una obra esperando conservarla o venderla en el futuro. El precio se forma en galerías, ferias o subastas y puede variar mucho entre operaciones comparables.',
  income:'La obra no genera ingresos por sí misma salvo préstamo, exposición, licencia o explotación específica. El retorno habitual depende de la venta.',
  costs:'Comisiones de compra y subasta, autenticación, tasación, seguro, almacenamiento, conservación, transporte y restauración.',
  tax:'La venta puede generar ganancia patrimonial; IVA o ITP pueden aplicar según vendedor, operación y condición de profesional o particular.',
  taxDetail:'Conserva factura, procedencia, certificados, tasaciones y gastos de conservación. Revisa regímenes especiales de bienes usados/arte, IVA, ITP y reglas de ganancias patrimoniales según el caso.',
  steps:['Verifica autoría, procedencia, certificados, historial y estado de conservación.','Compara ventas reales de obras equivalentes y liquidez del mercado del artista.','Calcula comisión de compra y venta, seguro, almacenamiento y restauración.','Asegura documentación y plan de custodia antes de adquirir.'],
  fit:'Coleccionista informado con horizonte largo, espacio/custodia y capacidad para asumir valoración subjetiva.',
  avoid:'No encaja si necesitas liquidez, no puedes autenticar la obra o dependes de una revalorización rápida.',
  barrier:'Requiere conocimiento especializado, capital variable, autenticación y acceso a canales de compraventa.',
  protection:'La factura y procedencia ayudan a acreditar propiedad, pero no garantizan autenticidad ni precio. Comprueba seguros y condiciones de custodia.',
  term:'Largo plazo; el ciclo de demanda artística puede ser irregular.',
  exit:'Mercado secundario especializado, con comisiones elevadas y plazos inciertos.'
 },
 'Coleccionables':{
  summary:'Son bienes singulares cuyo valor depende de rareza, estado, autenticidad, procedencia y demanda de coleccionistas.',
  how:'Se compra una pieza para conservarla y venderla posteriormente. La valoración es menos transparente que en mercados financieros y depende de comparables, certificación y canal de venta.',
  income:'Normalmente no genera ingresos periódicos. El retorno depende de la venta y puede verse reducido por conservación, seguro y comisiones.',
  costs:'Autenticación, certificación, almacenamiento, seguro, mantenimiento, restauración, transporte, subastas y comisiones de intermediación.',
  tax:'La venta puede generar ganancia patrimonial; IVA o ITP pueden aplicar según bien, vendedor y régimen de la operación.',
  taxDetail:'Conserva facturas, certificados, procedencia, fotografías y gastos asociados. El tratamiento cambia según se trate de bien usado, antigüedad, joya, vehículo, vino u objeto de colección y según vendedor profesional o particular.',
  steps:['Verifica autenticidad, procedencia, estado, rareza y documentación.','Compara precios de ventas cerradas, no solo anuncios o valoraciones de vendedores.','Calcula almacenamiento, conservación, seguro, certificación y comisiones de venta.','Comprueba demanda y liquidez antes de comprometer capital.'],
  fit:'Coleccionista con conocimiento del segmento y capacidad para conservar el bien durante años.',
  avoid:'Evítalo si no puedes autenticar, custodiar o vender el objeto sin aceptar descuentos relevantes.',
  barrier:'La barrera depende de la pieza; suele requerir conocimiento especializado, autenticación y custodia adecuada.',
  protection:'La titularidad y autenticidad deben acreditarse. No existe garantía de precio, demanda ni recuperación del capital.',
  term:'Largo plazo y dependiente de ciclos de demanda y conservación.',
  exit:'Liquidez baja o irregular; puede requerir subasta, intermediario o comprador especializado.'
 }
 };
 const c=specs[sub]||null;
 if(!c)return null;
 let focus='';
 if(/dep[oó]sito/.test(n))focus=' En depósitos a plazo, comprueba vencimiento, cancelación anticipada y si el tipo es fijo o variable.';
 else if(/cuenta remunerada/.test(n))focus=' En cuentas remuneradas, revisa saldo máximo, TAE promocional, vinculación y cambios de tipo.';
 else if(/divisa/.test(n))focus=' En divisa extranjera añade riesgo de tipo de cambio y costes de conversión.';
 else if(/bonos ligados a la inflación/.test(n))focus=' En deuda ligada a inflación, revisa índice de referencia, desfase de actualización y rendimiento real.';
 else if(/convertible/.test(n))focus=' En convertibles, analiza el precio de conversión, dilución potencial y riesgo de crédito del emisor.';
 else if(/preferentes/.test(n))focus=' En preferentes, revisa subordinación, perpetuidad, posibilidad de cancelar cupones y prelación concursal.';
 else if(/acciones de dividendos/.test(n))focus=' En acciones de dividendos, analiza cobertura del dividendo por caja y deuda; una rentabilidad alta puede anticipar recortes.';
 else if(/pequeña capitalización/.test(n))focus=' En small caps, presta especial atención a volumen negociado, concentración, financiación y spreads.';
 else if(/fondo mixto/.test(n))focus=' En fondos mixtos, comprueba rangos de exposición a renta variable y fija y cómo cambia el riesgo con el ciclo.';
 else if(/retorno absoluto|hedge fund/.test(n))focus=' En retorno absoluto o hedge funds, revisa estrategia, apalancamiento, liquidez, custodia y comisiones de éxito.';
 else if(/opciones/.test(n))focus=' En opciones, entiende prima, strike, vencimiento, volatilidad implícita y ejercicio; el vendedor puede asumir pérdidas muy elevadas.';
 else if(/futuros/.test(n))focus=' En futuros, revisa multiplicador, garantías diarias, vencimiento y posible entrega o liquidación por diferencias.';
 else if(/cfd/.test(n))focus=' En CFDs, comprueba apalancamiento, financiación overnight, cierre automático y riesgo de contraparte.';
 else if(/nuda propiedad/.test(n))focus=' En nuda propiedad, analiza usufructo, edad y derechos del usufructuario, gastos asumidos y plazo incierto de disponibilidad.';
 else if(/tur[ií]stic|temporada/.test(n))focus=' En alquiler turístico o de temporada, verifica licencias, normativa local, ocupación estacional, limpieza y gestión.';
 else if(/garaje/.test(n))focus=' En plazas de garaje, comprueba acceso, dimensiones, maniobrabilidad, comunidad, seguridad y demanda de la zona.';
 else if(/trastero/.test(n))focus=' En trasteros, revisa acceso, humedad, seguridad, ventilación, uso permitido y costes de comunidad.';
 else if(/factoring/.test(n))focus=' En factoring, analiza solvencia del deudor de la factura, recurso o sin recurso, dilución y plazo de cobro.';
 else if(/confirming/.test(n))focus=' En confirming, identifica quién asume el riesgo de pago, condiciones de anticipo y comisiones.';
 else if(/bitcoin/.test(n))focus=' En Bitcoin, revisa custodia, autocustodia, comisiones de red, liquidez y concentración; no produce flujo de caja intrínseco.';
 else if(/ethereum/.test(n))focus=' En Ethereum, además del precio, analiza actividad de red, staking, validadores, actualizaciones y riesgos de contratos inteligentes.';
 else if(/stablecoin/.test(n))focus=' En stablecoins, verifica reservas, derecho de reembolso, emisor, auditorías y riesgo de desvinculación.';
 else if(/staking/.test(n))focus=' En staking y DeFi, añade bloqueo, slashing, contratos inteligentes, oráculos y riesgo de protocolo o contraparte.';
 else if(/miner[ií]a/.test(n))focus=' En minería, calcula hardware, electricidad, dificultad, recompensas, mantenimiento y obsolescencia del equipo.';
 else if(/vino|whisky|licores/.test(n))focus=' En vino y destilados, verifica procedencia, añada/lote, almacenamiento, autenticidad, impuestos especiales y costes de transporte.';
 else if(/reloj/.test(n))focus=' En relojes, comprueba número de serie, piezas originales, historial de servicio, caja, documentación y mercado secundario.';
 else if(/coche/.test(n))focus=' En coches clásicos, revisa historial, originalidad, restauración, homologación, almacenamiento, seguro y mantenimiento.';
 else if(/joyas|diamantes/.test(n))focus=' En joyas y diamantes, exige certificación gemológica, peso, calidad, procedencia y valoración independiente.';
 else if(/cartas coleccionables/.test(n))focus=' En cartas, comprueba edición, rareza, graduación, estado, falsificaciones y liquidez de la comunidad.';
 else if(/dominios/.test(n))focus=' En dominios, revisa titularidad registral, historial, marca, renovaciones, tráfico y posibles conflictos de derechos.';
 else if(/patentes|licencias/.test(n))focus=' En patentes y licencias, revisa titularidad, alcance territorial, duración, exclusividad, mantenimiento y libertad de operación.';
 return {...c,how:c.how+focus,summary:String(i.name)+': '+c.summary,phrase:String(i.name)+' · '+c.summary};
}

function buildSheetData(i){
 if(i.name===data.name)return {...data,metrics:{...data.metrics,complex:data.metrics.complexity},managementText:num(data.management)+' h/mes',sourceNote:'Ficha específica de cuenta remunerada. Comprueba siempre las condiciones vigentes de cada entidad.',barrier:{...data.barrier,summary:'La apertura suele ser sencilla si cumples los criterios de la entidad. Comprueba identificación, requisitos, límites y cobertura del depósito.'},costs:{...data.costs,recurringValue:'Normalmente 0 €',oneoffValue:'Según servicios',entryValue:'Según condiciones'},taxLabel:'IRPF · base del ahorro'};
 const category=i.cat||'Otros',subcategory=typeof subtypeFor==='function'?subtypeFor(i):(i.catalogSubtype||i.sub||'Activo de inversión');
 const generated=String(i.how||'').startsWith('El resultado depende del precio de adquisición');
 const specific=generated?assetSheetSpecifics(i):null;
 const range=String(i.ret||(typeof catalogReturnRange==='function'?catalogReturnRange(i.name,category,subcategory):'No disponible'));
 const nums=[...range.matchAll(/(\d+(?:[.,]\d+)?)/g)].map(x=>Number(x[1].replace(',','.')));
 const income=String(generated&&specific?specific.income:(i.income||'Los ingresos dependen del vehículo y de la operación concreta.'));
 const how=String(i.how||i.desc||'El resultado depende del precio de entrada, los flujos, los costes y las condiciones de salida.');
 const periodic=/renta|alquiler|dividend|inter[eé]s|cup[oó]n|distribu|reparto|cash flow|beneficio|ventas|royalt|suscripci[oó]n/i.test(income)&&!/inexistente|sin ingresos|no genera|no hay cobros/i.test(income);
 const growth=Number(i.grow||0)>0||/revaloriz|crecimiento|plusval|apreciaci|venta del activo/i.test(how+' '+String(i.desc||''));
 const returnType=periodic&&growth?'Ingresos periódicos + revalorización':periodic?'Ingresos o flujos periódicos':growth?'Revalorización o crecimiento':'Resultado dependiente de la operación';
 const barrierInfoData=typeof barrierInfo==='function'?barrierInfo(i):{level:'Variable',summary:'La dificultad depende del activo y sus condiciones.',factors:[]};
 const managementText=Number.isFinite(Number(i.management))&&String(i.management??'').trim()!==''?Number(i.management).toLocaleString('es-ES',{maximumFractionDigits:1})+' h/mes (estimación)':String(i.management||'Dedicación variable según activo y gestión contratada.');
 const metrics={risk:Math.max(0,Math.min(5,Number(i.risk||0)/2)),liquidity:Math.max(0,Math.min(5,Number(i.liq||0)/2)),periodicIncome:Math.max(0,Math.min(5,Number(i.cash||0)/2)),potential:Math.max(0,Math.min(5,Number(i.return||0)/2)),passive:Math.max(0,Math.min(5,Number(i.passive||0)/2)),ease:Math.max(0,Math.min(5,Number(i.effort||0)/2)),complex:Math.max(0,Math.min(5,Number(i.complex||0)/2)),leverage:Math.max(0,Math.min(5,Number(i.leverage||0)/2))};
 const parties=category==='Mercados financieros'?'Pueden intervenir el emisor, gestora o depositaria, intermediario y titular. En derivados puede existir contraparte y exigencia de garantías.':category==='Inmobiliario'?'Pueden intervenir propietario o promotor, inversor, arrendatarios, administradores, financiadores y proveedores de mantenimiento.':category==='Empresas y negocios'?'Intervienen propietario o inversor, clientes, proveedores, trabajadores, socios y administraciones. En participaciones privadas importan los derechos del socio y el gobierno corporativo.':'Pueden intervenir emisor, vendedor, plataforma, custodio, intermediario o contraparte. Identifica quién mantiene el activo y quién responde ante incidencias.';
 const stepsBase=category==='Mercados financieros'?['Identifica instrumento, emisor, índice o subyacente y distingue rentabilidad total de cobros.','Revisa folleto, documentación, vencimiento, garantías y riesgos específicos.','Compara comisiones, diferencial, custodia, fiscalidad y condiciones del intermediario.','Define importe, horizonte y escenarios adversos antes de operar.']:category==='Inmobiliario'?['Define el uso y la estrategia: alquiler, explotación, revalorización o inversión colectiva.','Analiza ubicación, demanda, estado, titularidad, cargas, normativa y documentación.','Calcula compra, impuestos, financiación, mantenimiento, vacantes y gestión.','Estima flujo neto, rentabilidad sobre el capital y una salida realista.']:category==='Empresas y negocios'?['Valida demanda, clientes, competencia y modelo de ingresos.','Analiza ventas, márgenes, caja, deuda y dependencia de personas clave.','Presupuesta inversión inicial, circulante, costes fijos, impuestos y tiempo de gestión.','Define indicadores, responsabilidades, derechos de propiedad y opciones de salida.']:['Verifica autenticidad, titularidad, custodia, plataforma y contraparte.','Comprende cómo se forma el precio y qué demanda existe en el mercado secundario.','Incluye almacenamiento, seguro, conservación, comisiones, fiscalidad y venta.','Limita la exposición y comprueba cómo recuperarías el capital en un escenario desfavorable.'];
 const protectionBase=category==='Mercados financieros'?'La protección depende del instrumento, emisor, intermediario y jurisdicción. La garantía de depósitos solo cubre depósitos elegibles dentro de sus límites; no protege frente a pérdidas de mercado.':category==='Inmobiliario'?'No existe garantía general del capital. Comprueba titularidad registral, cargas, licencias, contratos, seguros y solvencia de las partes. En vehículos colectivos, revisa estructura jurídica y supervisión.':category==='Empresas y negocios'?'El capital empresarial no está garantizado. Revisa forma jurídica, pactos de socios, derechos económicos y políticos, responsabilidades y prioridad de cobro en caso de insolvencia.':'No existe protección uniforme para todos los activos alternativos. Verifica autenticidad, custodia, titularidad, regulación de la plataforma y riesgos de contraparte.';
 const termBase=metrics.liquidity>=4?'Corto plazo o flexible, sujeto al producto':metrics.liquidity>=3?'Corto o medio plazo; revisa ventanas y condiciones':'Medio o largo plazo; la salida puede requerir tiempo y descuento';
 const exitBase=metrics.liquidity>=4?'Puede existir salida frecuente, pero depende del mercado y proveedor.':metrics.liquidity>=3?'La venta o reembolso puede depender de ventanas, compradores y volumen disponible.':'La salida puede ser lenta, costosa o depender de encontrar comprador; no presupongas liquidez inmediata.';
 const risks=[...(Array.isArray(i.cons)?i.cons:[])];
 const extraRisk=category==='Mercados financieros'?'Considera mercado, emisor, tipos, divisa, contraparte y apalancamiento según instrumento.':category==='Inmobiliario'?'Considera vacantes, impagos, mantenimiento, concentración geográfica, regulación y costes de transmisión.':category==='Empresas y negocios'?'Considera riesgo operativo, comercial, financiación y dependencia de clientes o personas clave.':'Considera autenticidad, custodia, fraude, valoración subjetiva, contraparte y liquidez secundaria.';
 if(!risks.some(x=>String(x).toLowerCase().includes('riesgo')))risks.push(extraRisk);
 const steps=generated&&specific?specific.steps:stepsBase;
 const protection=generated&&specific?specific.protection:protectionBase;
 const term=generated&&specific?specific.term:termBase;
 const exit=generated&&specific?specific.exit:exitBase;
 return {name:i.name,category,subcategory,phrase:String(generated&&specific?specific.phrase:(i.desc||assetDefinition(i))),capital:String(i.capital||'Variable según activo, proveedor y operación.'),capitalValue:nums[0]||0,income,management:Number.isFinite(Number(i.management))?Number(i.management):0,managementText,yield:{min:nums.length?Math.min(...nums):0,max:nums.length?Math.max(...nums):0,base:'orientativa',display:range,note:'Rango orientativo del catálogo; no es una oferta vigente ni una rentabilidad garantizada.'},metrics,returnType,summary:generated&&specific?specific.summary:(typeof assetDefinition==='function'?assetDefinition(i):String(i.desc||'Alternativa de inversión; analiza vehículo, costes, riesgos y salida.')),how,periodic:income,parties,steps,pros:Array.isArray(i.pros)&&i.pros.length?i.pros:['Puede cumplir una función concreta dentro de una estrategia diversificada.','Su atractivo depende de precio, costes, riesgo y horizonte.'],cons:Array.isArray(i.cons)&&i.cons.length?i.cons:['El capital puede perder valor y el resultado no está garantizado.','Costes, impuestos y condiciones de salida pueden reducir el rendimiento neto.'],fit:String(generated&&specific?specific.fit:(i.profile||'El encaje depende del objetivo, horizonte, conocimientos, liquidez y tolerancia al riesgo.')),avoid:generated&&specific?specific.avoid:metrics.risk>=4?'No es adecuado para quien no pueda asumir pérdidas relevantes o necesite recuperar el capital pronto.':metrics.liquidity<2.5?'Evítalo si necesitas disponibilidad inmediata o no puedes inmovilizar el capital.':'No encaja si no comprendes el vehículo, sus costes, riesgos y condiciones de salida.',costs:{capital:String(i.capital||'Variable según activo y proveedor.'),recurring:String(generated&&specific?specific.costs:(i.costs||'Comprueba gestión, custodia, mantenimiento, administración o costes operativos.')),oneoff:String(i.costsextra||'Comprueba costes extraordinarios, certificaciones, reformas o incidencias.'),entry:String(i.entrycosts||'Revisa comisiones de compra, diferenciales, formalización, transmisión y salida.'),recurringValue:'Según activo',oneoffValue:'Según operación',entryValue:'Según vehículo'},taxLabel:'Según instrumento',tax:String(generated&&specific?specific.tax:(i.tax||'Fiscalidad dependiente del vehículo, operación y residencia fiscal.')),taxDetail:String(generated&&specific?specific.taxDetail:(i.taxdetail||'Identifica el instrumento jurídico y el hecho imponible. Contrasta normativa e instrucciones oficiales vigentes.')),risks,protection,barrier:{level:barrierInfoData.level||'Variable',summary:generated&&specific?specific.barrier:(barrierInfoData.summary||'La barrera depende del activo y del proveedor.'),money:String(i.capital||barrierInfoData.capital||'Variable'),knowledge:(barrierInfoData.factors||[]).join(' '),access:(barrierInfoData.factors||[]).join(' ')||'Comprueba requisitos, intermediarios y condiciones de acceso.'},horizon:{profile:String(generated&&specific?specific.fit:(i.profile||'Depende del objetivo y del riesgo.')),term,exit,penalty:String(i.entrycosts||i.costsextra||'Comprueba penalizaciones, costes y restricciones antes de entrar.')},reviewed:'2026-11',sourceNote:'Información orientativa basada en la tipología del activo y los datos del catálogo. Verifica condiciones, documentación y fuentes oficiales del producto concreto antes de invertir.'};
}

function render(name){
 const i=investments.find(x=>x.name===name);if(!i)return;
 const data=buildSheetData(i);
 const fav=isFavorite(name),yieldText=data.yield.display||((num(data.yield.min)+' % – '+num(data.yield.max)+' %'));
 const prev=investments[(investments.findIndex(x=>x.name===name)-1+investments.length)%investments.length];
 const next=investments[(investments.findIndex(x=>x.name===name)+1)%investments.length];
 const html='<article class="asset-v2">'+
 '<div class="asset-v2-top"><button class="back" type="button" onclick="showView(\'explore\')">'+svg.back+' Volver a explorar</button><div class="asset-v2-brand" aria-label="Inversora"><img class="asset-v2-mark" src="/icon-192.svg" alt=""><span class="asset-v2-wordmark">Invers<span>ora</span></span></div><div class="asset-v2-crumb">'+esc(data.category)+' › '+esc(data.subcategory)+' › <b>'+esc(data.name)+'</b></div></div>'+
 '<header class="asset-v2-hero"><div><span class="asset-v2-kicker">'+esc(data.subcategory)+'</span><h1>'+esc(data.name)+'</h1><p class="asset-v2-lead">'+esc(data.phrase)+'</p><div class="asset-v2-chips"><span>Capital: '+esc(data.capital)+'</span><span>Ingresos: '+esc(data.income)+'</span><span>Gestión: '+esc(data.managementText)+'</span></div><div class="asset-v2-actions"><button type="button" class="asset-v2-btn primary" onclick="simulateInvestment('+arg(name)+')">'+svg.play+' Simular esta inversión</button><button type="button" class="asset-v2-btn" onclick="toggleFavorite('+arg(name)+',true)">'+svg.heart+' '+(fav?'Guardado':'Guardar en favoritos')+'</button><button type="button" class="asset-v2-btn" onclick="startCompare([...new Set([...(compareNames||[]),'+arg(name)+'])])">'+svg.compare+' Comparar</button></div></div><div class="asset-v2-ratings">'+ratingMarkup(name)+'</div></header>'+
 '<nav class="asset-v2-index" aria-label="Acceso rápido a secciones">'+['Resumen','Funcionamiento','Pros y contras','Costes y fiscalidad','Riesgos','Barreras','Plazo y liquidez'].map((x,n)=>'<a href="#asset-v2-'+(n+1)+'">'+String(n+1).padStart(2,'0')+' '+x+'</a>').join('')+'</nav>'+
 '<section class="asset-v2-section" id="asset-v2-1"><span class="asset-v2-section-no">01</span><h2>Resumen</h2><p class="asset-v2-section-intro">Lo importante de un vistazo.</p><div class="asset-v2-grid two"><div class="asset-v2-panel"><span class="asset-v2-label">Idea clave</span><p>'+esc(data.summary)+'</p></div><div class="asset-v2-panel blue asset-v2-return"><span class="asset-v2-label">Rentabilidad indicada · '+esc(data.yield.base==='bruta'?'base bruta':data.yield.base==='neta'?'base neta':'rango orientativo')+'</span><strong>'+yieldText+'</strong><small>Dato orientativo. No está garantizado.</small></div></div><div class="asset-v2-grid four" style="margin-top:9px">'+panel('Riesgo',num(data.metrics.risk)+'/5','Nivel relativo de exposición a pérdidas; más puntuación significa más riesgo.')+panel('Liquidez',num(data.metrics.liquidity)+'/5','Facilidad orientativa para recuperar el capital; depende del mercado y del vehículo.')+panel('Ingresos periódicos',num(data.metrics.periodicIncome)+'/5','Capacidad potencial de generar cobros; no implica que estén garantizados.')+panel('Tipo de retorno',data.returnType,'Puede combinar cobros, revalorización o resultados operativos.')+'</div></section>'+
 '<section class="asset-v2-section" id="asset-v2-2"><span class="asset-v2-section-no">02</span><h2>Funcionamiento</h2><p class="asset-v2-section-intro">De dónde sale el dinero y qué tienes que hacer.</p><div class="asset-v2-grid two">'+panel('¿Cómo se gana dinero?',data.returnType,data.how)+panel('¿Genera ingresos periódicos?',data.periodic,'La existencia, cuantía y frecuencia de los cobros dependen del activo y sus condiciones.')+panel('¿Quién interviene?','Participantes',data.parties)+ '<article class="asset-v2-panel"><span class="asset-v2-label">Pasos para empezar</span>'+list(data.steps,'good')+'</article></div></section>'+
 '<section class="asset-v2-section" id="asset-v2-3"><span class="asset-v2-section-no">03</span><h2>Ventajas y desventajas</h2><p class="asset-v2-section-intro">Los dos lados antes de decidir.</p><div class="asset-v2-grid two"><article class="asset-v2-panel green"><strong>Ventajas</strong>'+list(data.pros,'good')+'</article><article class="asset-v2-panel amber"><strong>Inconvenientes</strong>'+list(data.cons,'bad')+'</article></div><p class="asset-v2-inline-note"><b>Encaja si:</b> '+esc(data.fit)+'<br><b>Mejor evitarlo si:</b> '+esc(data.avoid)+'</p></section>'+
 '<section class="asset-v2-section" id="asset-v2-4"><span class="asset-v2-section-no">04</span><h2>Capital, costes y fiscalidad</h2><p class="asset-v2-section-intro">Cuánto necesitas, qué pagas y qué impuestos hay.</p><div class="asset-v2-grid three">'+panel('Capital inicial',data.costs.capital,'Importe mínimo y capital total según activo y operación.')+panel('Costes recurrentes',data.costs.recurringValue,data.costs.recurring)+panel('Costes puntuales',data.costs.oneoffValue,data.costs.oneoff)+panel('Entrada y salida',data.costs.entryValue,data.costs.entry)+panel('Fiscalidad en España',data.taxLabel,data.tax)+panel('Tiempo de gestión',data.managementText,'Dedicación orientativa; puede variar según proveedor, estrategia y operación.')+'</div><div class="asset-v2-panel asset-v2-tax" style="margin-top:9px"><details><summary>Ver explicación fiscal detallada</summary><p>'+esc(data.taxDetail)+'</p></details></div></section>'+
 '<section class="asset-v2-section" id="asset-v2-5"><span class="asset-v2-section-no">05</span><h2>Riesgos y características</h2><p class="asset-v2-section-intro">Para entender qué puede influir en el resultado.</p><div class="asset-v2-grid three">'+bar('Liquidez',data.metrics.liquidity,'Facilidad de salida; no equivale a disponibilidad garantizada.')+bar('Potencial de rentabilidad',data.metrics.potential,'Estimación comparativa, no predicción de resultados.')+bar('Ingresos pasivos',data.metrics.passive,'Posibilidad de cobros sin gestión diaria.')+bar('Facilidad de gestión',data.metrics.ease,'Más puntuación significa menor dedicación estimada.')+bar('Complejidad',data.metrics.complex,'Más puntuación significa mayor complejidad.',true)+bar('Apalancamiento',data.metrics.leverage,'Uso potencial de deuda o exposición apalancada; amplifica ganancias y pérdidas.')+'</div><div class="asset-v2-grid two" style="margin-top:9px"><article class="asset-v2-panel"><strong>Principales riesgos</strong>'+list(data.risks,'bad')+'</article><article class="asset-v2-panel blue"><strong>Protección y garantías</strong><p>'+esc(data.protection)+'</p></article></div></section>'+
 '<section class="asset-v2-section" id="asset-v2-6"><span class="asset-v2-section-no">06</span><h2>Barreras de entrada</h2><p class="asset-v2-section-intro">Qué puede dificultar empezar.</p><div class="asset-v2-grid four"><article class="asset-v2-panel green"><span class="asset-v2-label">Barrera orientativa</span><strong class="asset-v2-barrier">'+esc(data.barrier.level)+'</strong><p>'+esc(data.barrier.summary)+'</p></article>'+panel('Capital inicial',data.capital,data.barrier.money)+panel('Conocimientos',data.barrier.level,data.barrier.knowledge)+panel('Acceso y requisitos','Según vehículo',data.barrier.access)+'</div><p class="asset-v2-inline-note"><b>Antes de invertir, comprueba:</b> documentación, proveedor, costes totales, riesgos, fiscalidad, liquidez y condiciones de salida.</p></section>'+
 '<section class="asset-v2-section" id="asset-v2-7"><span class="asset-v2-section-no">07</span><h2>Horizonte y liquidez</h2><p class="asset-v2-section-intro">Cuánto tiempo conviene mantenerla y qué tal es salir.</p><div class="asset-v2-grid four">'+panel('Perfil',data.horizon.profile,'Analiza si coincide con tus objetivos y tolerancia al riesgo.')+panel('Horizonte',data.horizon.term,'Plazo orientativo; puede variar según vehículo y ciclo de mercado.')+panel('Plazo de salida',data.horizon.exit,'No presupongas que podrás vender o recuperar el capital de inmediato.')+panel('Penalizaciones y costes',data.horizon.penalty,'Comprueba restricciones, descuentos, comisiones y gastos de salida.')+'</div><div style="margin-top:10px"><span class="asset-v2-label">Indicador orientativo de liquidez</span><div class="asset-v2-meter"><i style="width:'+Math.max(0,Math.min(5,Number(data.metrics.liquidity)))*20+'%"></i></div></div></section>'+
 '<section class="asset-v2-bottom"><div class="asset-v2-brand" style="justify-content:center;color:#fff;margin-bottom:8px"><img class="asset-v2-mark" src="/icon-192.svg" alt=""><span class="asset-v2-wordmark">Invers<span>ora</span></span></div><h2>¿Te encaja? Pruébalo con tus números</h2><p>Simula cuánto podría rendirte, guárdala o compárala con otros activos.</p><div class="asset-v2-actions"><button type="button" class="asset-v2-btn primary" onclick="simulateInvestment('+arg(name)+')">'+svg.play+' Simular esta inversión</button><button type="button" class="asset-v2-btn" onclick="toggleFavorite('+arg(name)+',true)">'+svg.heart+' Guardar en favoritos</button><button type="button" class="asset-v2-btn" onclick="invOpenCommunityModal('+arg(name)+')">★ Valorar este activo</button><button type="button" class="asset-v2-btn" onclick="printAssetSheet()">'+svg.print+' Imprimir ficha</button></div></section>'+
 '<nav class="asset-v2-prevnext" aria-label="Navegación entre activos"><button type="button" onclick="openDetail('+arg(prev.name)+')"><small>← ANTERIOR</small><strong>'+esc(prev.name)+'</strong></button><button type="button" onclick="openDetail('+arg(next.name)+')"><small>SIGUIENTE →</small><strong>'+esc(next.name)+'</strong></button></nav>'+
 '<p class="asset-v2-legal"><b>Inversora</b> · Datos orientativos, no asesoramiento financiero ni fiscal. Rentabilidades no garantizadas. Revisión de catálogo: '+esc(data.reviewed.slice(5)+'/'+data.reviewed.slice(0,4))+'. '+esc(data.sourceNote)+'</p><section class="asset-print-sheet"><header class="asset-print-head"><div class="asset-print-brand"><img src="/icon-192.svg" alt=""><span class="asset-v2-wordmark">Invers<span>ora</span></span></div><span>FICHA DE INVERSIÓN · '+esc(data.category)+'</span></header><h1>'+esc(data.name)+'</h1><p class="asset-print-lead">'+esc(data.phrase)+'</p><div class="asset-print-metrics"><div><small>Rentabilidad indicada</small><b>'+yieldText+'</b></div><div><small>Riesgo</small><b>'+num(data.metrics.risk)+'/5</b></div><div><small>Liquidez</small><b>'+num(data.metrics.liquidity)+'/5</b></div><div><small>Capital inicial</small><b>'+esc(data.capital)+'</b></div></div><div class="asset-print-grid"><section><h2>Funcionamiento</h2><p>'+esc(data.how)+'</p><p><b>Ingresos:</b> '+esc(data.periodic)+'</p><p><b>Gestión:</b> '+esc(data.managementText)+'</p></section><section><h2>Costes y fiscalidad</h2><p><b>Costes recurrentes:</b> '+esc(data.costs.recurring)+'</p><p><b>Costes puntuales:</b> '+esc(data.costs.oneoff)+'</p><p><b>Fiscalidad:</b> '+esc(data.tax)+'</p><p class="asset-print-small">'+esc(data.taxDetail)+'</p></section><section><h2>Ventajas y desventajas</h2><div class="asset-print-columns"><div><b>Ventajas</b><ul>'+data.pros.slice(0,3).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><div><b>Riesgos</b><ul>'+data.cons.slice(0,3).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div></div></section><section><h2>Riesgos y protección</h2><ul>'+data.risks.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><p>'+esc(data.protection)+'</p></section></div><footer><img src="/icon-192.svg" alt=""> Inversora · Ficha educativa · Datos orientativos, no asesoramiento financiero ni fiscal · Revisado '+esc(data.reviewed)+'</footer></section></article>';
 document.getElementById('detail').innerHTML='<section class="section">'+html+'</section>';
 if(typeof invSetPageTitle==='function')invSetPageTitle(name);
 const sectionNav=document.querySelector('.asset-v2-index');
 if(sectionNav&&!sectionNav.dataset.offsetReady){
  sectionNav.dataset.offsetReady='1';
  sectionNav.addEventListener('click',function(event){
   const link=event.target.closest('a[href^="#asset-v2-"]');
   if(!link)return;
   const target=document.getElementById(link.getAttribute('href').slice(1));
   const hero=document.querySelector('.asset-v2-hero');
   if(!target||!hero)return;
   event.preventDefault();
   const stickyTop=parseFloat(getComputedStyle(hero).top)||0;
   const offset=hero.getBoundingClientRect().height+stickyTop+18;
   const top=target.getBoundingClientRect().top+window.scrollY-offset;
   history.replaceState(null,'',link.getAttribute('href'));
   window.scrollTo({top:Math.max(0,top),behavior:'smooth'});
  });
 }
 showView('detail');
 if(typeof invLoadAssetReviews==='function')invLoadAssetReviews(name);
}
const originalReviews=window.invRenderAssetReviews;
if(typeof originalReviews==='function'){
 window.invRenderAssetReviews=function(name,reviews,profiles){
  const out=originalReviews.apply(this,arguments);
  if(document.getElementById('asset-v2-community-average')){
   const rows=Array.isArray(reviews)?reviews:[],count=rows.length;
   const avg=count?Number((rows.reduce((sum,r)=>sum+(typeof invReviewWeightedScore==='function'?invReviewWeightedScore(r):0),0)/count).toFixed(1)):0;
   const value=document.getElementById('asset-v2-community-average');
   const countNode=document.getElementById('asset-v2-community-count');
   const stars=document.getElementById('asset-v2-community-score-stars');
   if(value)value.textContent=count>=5?num(avg)+'/5':'Pocas valoraciones aún';
   if(countNode)countNode.textContent=count+' '+(count===1?'valoración':'valoraciones');
   if(stars){stars.textContent=count>=5?'★'.repeat(Math.round(avg))+'☆'.repeat(5-Math.round(avg)):'☆☆☆☆☆';stars.setAttribute('aria-label',count>=5?num(avg)+' de 5 estrellas':'Aún no hay suficientes valoraciones para mostrar una media');}
  }
  return out;
 };
}
const original=window.openDetail;
window.openDetail=function(name){
 // Cuentas remuneradas tiene una ficha propia en index.html. No debe pasar por la plantilla genérica.
 if(name==='Cuentas remuneradas')return typeof original==='function'?original(name):undefined;
 if(investments.some(x=>x.name===name)){render(name);return}
 return typeof original==='function'?original(name):undefined;
};
})();
