const test = require('node:test');
const assert = require('node:assert/strict');
require('../simulator-engine.js');
const engine = global.InversoraNetEngine;
const fiscal = require('../fiscalidad-espana.json');
const near = (actual, expected, tolerance=0.01) => assert.ok(Math.abs(actual-expected)<=tolerance, actual+' no coincide con '+expected);
test('depósito sin costes, impuestos ni inflación',()=>{
 const r=engine.calculate({capital:10000,monthly:0,years:1,rate:0,entryFee:0,annualFee:0,exitFee:0,taxRate:0,inflation:0},fiscal);
 near(r.realFinal,10000);near(r.taxes,0);near(r.costs.total,0);
});
test('depósito con impuesto estimado al 19 %',()=>{
 const r=engine.calculate({capital:10000,monthly:0,years:1,rate:5,entryFee:0,annualFee:0,exitFee:0,taxRate:19,inflation:0},fiscal);
 near(r.grossFinal,10500);near(r.taxes,95);near(r.realFinal,10405);
});
test('ahorro mensual sin rentabilidad',()=>{
 const r=engine.calculate({capital:0,monthly:100,years:1,rate:0,entryFee:0,annualFee:0,exitFee:0,taxRate:0,inflation:0},fiscal);
 near(r.contributedNominal,1200);near(r.netNominal,1200);near(r.realFinal,1200);
});
test('rentabilidad negativa no genera impuesto',()=>{
 const r=engine.calculate({capital:1000,monthly:0,years:1,rate:-10,entryFee:0,annualFee:0,exitFee:0,taxRate:19,inflation:0},fiscal);
 near(r.netNominal,900);near(r.taxes,0);
});
test('inflación cero: nominal y real coinciden',()=>{
 const r=engine.calculate({capital:1000,monthly:0,years:1,rate:10,entryFee:0,annualFee:0,exitFee:0,taxRate:0,inflation:0},fiscal);
 near(r.realFinal,r.netNominal);near(r.realFinal,1100);
});
test('inmueble con gastos, vacancia y costes de entrada/salida',()=>{
 const r=engine.calculate({capital:100000,monthly:0,years:1,rate:5,entryFee:2,annualFee:1,exitFee:3,taxRate:0,inflation:0,vacancy:10},fiscal);
 assert.ok(r.costs.entry>0&&r.costs.recurring>0&&r.costs.exit>0);
 assert.ok(r.realFinal<r.grossFinal);
 near(r.assumptions.rate,4.5);
});
test('cero años no produce NaN ni infinito',()=>{
 const r=engine.calculate({capital:5000,monthly:300,years:0,rate:8,entryFee:0,annualFee:0,exitFee:0,taxRate:0,inflation:2},fiscal);
 near(r.realFinal,5000);near(r.contributedNominal,5000);assert.ok(Number.isFinite(r.realAnnualRate));
});
test('cero capital y aportaciones periódicas funciona',()=>{
 const r=engine.calculate({capital:0,monthly:100,years:2,rate:0,entryFee:0,annualFee:0,exitFee:0,taxRate:0,inflation:0},fiscal);
 near(r.realFinal,2400);near(r.contributedNominal,2400);
});
test('números españoles con coma y miles se interpretan correctamente',()=>{
 near(engine.number('1.234,56'),1234.56);near(engine.number('1,234.56'),1234.56);
});
test('valores inválidos devuelven error legible',()=>{
 const r=engine.calculate({capital:-1,monthly:0,years:1,rate:5},fiscal);
 assert.equal(typeof r.error,'string');
});

test('escala progresiva de la base del ahorro',()=>{
 near(engine.progressiveTax(7000,fiscal.savingsTaxBrackets),1350);
});
