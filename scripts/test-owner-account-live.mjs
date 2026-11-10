import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {loadEnv} from 'vite';
import {createClient} from '@supabase/supabase-js';
import {createBatch} from '../api/vigio-admin.js';
import {loadOwnedProducts,saveOwnedProfile} from '../src/lib/accountData.js';
import {loadPublicPlate} from '../src/lib/scanData.js';
const env={...loadEnv('development',process.cwd(),''),...process.env};
const url=env.SUPABASE_URL||env.VITE_SUPABASE_URL;
const options={auth:{persistSession:false,autoRefreshToken:false}};
const admin=createClient(url,env.SUPABASE_SERVICE_ROLE_KEY,options);
const client=()=>createClient(url,env.VITE_SUPABASE_ANON_KEY,options);
const first=client(),second=client(),anon=client();
const run=randomUUID(),batch='QA-ACCOUNT-'+run;
const users=[],plates=[];
const credentials={email:'vigio-qa-'+run+'@example.com',password:randomBytes(24).toString('base64url')};
try{
 for(const [index,c] of [[1,first],[2,second]]){
  const input=index===1?credentials:{email:'vigio-qa-other-'+run+'@example.com',password:randomBytes(24).toString('base64url')};
  const {data,error}=await c.auth.signUp({...input,options:{data:{vigio_account_qa:run}}});
  if(error)throw error;users.push(data.user);assert.ok(data.session);
 }
 const {error:wrongError,data:wrong}=await anon.auth.signInWithPassword({...credentials,password:'wrong-password'});
 assert.ok(wrongError);assert.ok(!wrong.session);
 console.log('Credenciales incorrectas: rechazadas sin crear sesión.');
 const rows=['mascotas','kids','restaurante'].map(category=>createBatch({quantity:1,category,batch})[0]);
 const {data:inserted,error:insertError}=await admin.from('placas_vigio').insert(rows).select('id,token');
 if(insertError)throw insertError;plates.push(...inserted);
 for(const row of rows){
  const {data,error}=await first.rpc('vigio_activar_placa',{p_token:row.token,p_pin:row.pin_activacion,p_perfil:{nombre:'Producto temporal '+row.tipo_producto,categoria:row.tipo_producto==='kids'?'nino':'mascota',nombre_contacto:'QA temporal',telefono_contacto:'+56000000000',whatsapp_contacto:'56000000000',estado_alerta:'safe'}});
  if(error)throw error;assert.equal(data.ok,true);
 }
 let products=await loadOwnedProducts(first);assert.equal(products.length,3);
 assert.ok(products.every(p=>!('pin_activacion'in p)));
 console.log('Activación y cuenta: los tres productos aparecen en la misma sesión, sin PIN expuestos.');
 const target=products[0];
 const update={...target.perfil,nombre:'Perfil temporal actualizado',estado_alerta:'safe'};
 await saveOwnedProfile(first,target.id,update);
 const publicCard=await loadPublicPlate(anon,target.token);
 assert.equal(publicCard.profile.nombre,update.nombre);assert.equal(publicCard.profile.alerta,'safe');
 console.log('Edición del dueño: guardada y visible en el QR/NFC público.');
 const others=await loadOwnedProducts(second);assert.equal(others.length,0);
 await assert.rejects(saveOwnedProfile(second,target.id,{...update,nombre:'No permitido'}));
 const {error:anonError}=await anon.rpc('vigio_mis_productos');assert.ok(anonError);
 const {error:activationError}=await anon.rpc('vigio_activar_placa',{p_token:rows[0].token,p_pin:rows[0].pin_activacion,p_perfil:{}});assert.ok(activationError);
 console.log('Aislamiento: otra cuenta y un visitante no pueden gestionar los productos del dueño.');
 await first.auth.signOut();assert.equal((await first.auth.getSession()).data.session,null);
 const {data:login,error:loginError}=await first.auth.signInWithPassword(credentials);if(loginError)throw loginError;
 assert.ok(login.session);products=await loadOwnedProducts(first);assert.equal(products.length,3);
 const restored=client();await restored.auth.setSession({access_token:login.session.access_token,refresh_token:login.session.refresh_token});
 assert.equal((await loadOwnedProducts(restored)).length,3);
 console.log('Cerrar sesión, volver a entrar y restaurar sesión: productos conservados sin segundo login.');
}finally{
 if(plates.length){
  const ids=plates.map(p=>p.id);
  const {error:profileError}=await admin.from('perfiles_vigio').delete().in('placa_id',ids);if(profileError)throw profileError;
  const {error}=await admin.from('placas_vigio').delete().eq('lote',batch).in('id',ids);if(error)throw error;
 }
 for(const fixture of users){
  const {data,error}=await admin.auth.admin.getUserById(fixture.id);
  if(error||data.user?.user_metadata?.vigio_account_qa!==run)throw new Error('No coincide la cuenta temporal; no se elimina.');
  const {error:deleteError}=await admin.auth.admin.deleteUser(fixture.id);if(deleteError)throw deleteError;
 }
 console.log('Limpieza completada: solo se eliminaron las cuentas y los productos temporales de esta prueba.');
}
