import test from 'node:test';
import assert from 'node:assert/strict';
import {safeAccountReturn,plateActivationPath,profilePayload,productCategory,loadOwnedProducts} from '../src/lib/accountData.js';
import {loadPublicPlate,whatsappNumber} from '../src/lib/scanData.js';
test('login only returns to internal account and plate routes',()=>{
 assert.equal(safeAccountReturn('/panel?producto=123'),'/panel?producto=123');
 for(const value of ['https://evil.test','//evil.test','/\\evil.test','javascript:alert(1)','/admin-master'])assert.equal(safeAccountReturn(value),'/panel');
});
test('portal activation opens the same PIN-protected plate flow without changing token case',()=>{
 assert.equal(plateActivationPath('vgAb123xyz'),'/p/vgAb123xyz');
 assert.equal(plateActivationPath('https://vigio.cl/p/vgAb123xyz'),'/p/vgAb123xyz');
 assert.throws(()=>plateActivationPath('https://evil.test/p/vgAb123xyz'));
 assert.throws(()=>plateActivationPath('bad input'));
});
test('profile updates exclude ownership, category, token and injected fields',()=>{
 const data=profilePayload({nombre:' Luna ',nombre_contacto:'Owner',telefono_contacto:'123',estado_alerta:'safe',owner_id:'other',token:'stolen',categoria:'admin'});
 assert.equal(data.nombre,'Luna');assert.ok(!('owner_id'in data));assert.ok(!('token'in data));assert.ok(!('categoria'in data));
 assert.throws(()=>profilePayload({...data,nombre:''}));assert.throws(()=>profilePayload({...data,estado_alerta:'admin'}));
});
test('all real product types appear in the account without roles guessed from email',()=>{
 assert.equal(productCategory({tipo_producto:'kids'}),'personas');assert.equal(productCategory({perfil:{categoria:'persona'}}),'personas');assert.equal(productCategory({perfil:{categoria:'objeto'}}),'objetos');assert.equal(productCategory({tipo_producto:'mascota_circular'}),'mascotas');
});
test('failed account query stays an error instead of falling back to demo data',async()=>{
 await assert.rejects(loadOwnedProducts({rpc:async()=>({error:{message:'offline'}})}));
});
test('unknown public tokens never produce sample profiles or activation forms',async()=>{
 const query={select(){return this;},eq(){return this;},async maybeSingle(){return {data:null,error:null};}};
 await assert.rejects(loadPublicPlate({from:()=>query},'unknown123'));
});
test('Chilean mobile WhatsApp contacts include the country prefix',()=>{
 assert.equal(whatsappNumber('9 8345 6250'),'56983456250');assert.equal(whatsappNumber('+56 9 8345 6250'),'56983456250');
});
