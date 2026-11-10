import { createClient } from '@supabase/supabase-js';

const clean=value=>String(value||'').replace(/^\uFEFF/,'').trim();
const fail=(status,message)=>Object.assign(new Error(message),{status});

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  if(req.method!=='POST'){res.setHeader('Allow','POST');throw fail(405,'Método no permitido.');}
  const auth=req.headers.authorization||'';const jwt=auth.startsWith('Bearer ')?auth.slice(7):'';
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(body.action!=='delete-account'||typeof body.password!=='string'||!jwt)throw fail(400,'Solicitud no válida.');
  const url=clean(process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL);const serviceKey=clean(process.env.SUPABASE_SERVICE_ROLE_KEY);const anonKey=clean(process.env.VITE_SUPABASE_ANON_KEY);
  if(!url||!serviceKey||!anonKey)throw fail(503,'El servicio no está configurado.');
  const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await admin.auth.getUser(jwt);if(userError||!userData.user)throw fail(401,'Tu sesión ya no es válida. Inicia sesión nuevamente.');
  const verifier=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error:passwordError}=await verifier.auth.signInWithPassword({email:userData.user.email,password:body.password});if(passwordError)throw fail(401,'La contraseña actual no es correcta.');
  const {data:result,error:dbError}=await admin.rpc('vigio_bloquear_cuenta_y_productos',{p_user_id:userData.user.id});if(dbError||!result?.ok)throw fail(500,'No se pudieron borrar los datos de la cuenta.');
  const {error:deleteError}=await admin.auth.admin.deleteUser(userData.user.id);if(deleteError)throw fail(500,'Los productos fueron bloqueados, pero no se pudo eliminar la cuenta. Contacta a Vigio.');
  return res.status(200).json({ok:true});
 }catch(error){return res.status(error.status||500).json({error:error.status?error.message:'Error del servidor. Intenta nuevamente.'});}
}
