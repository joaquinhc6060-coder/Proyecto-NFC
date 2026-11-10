import {loadEnv} from 'vite';
const env={...loadEnv('development',process.cwd(),''),...process.env};
const ref=new URL(env.SUPABASE_URL||env.VITE_SUPABASE_URL).hostname.split('.')[0];
const query=`SELECT count(*) AS perfiles,
 count(*) FILTER (WHERE p.owner_id IS NULL AND pr.owner_id IS NULL) AS sin_dueno,
 count(*) FILTER (WHERE p.owner_id IS NOT NULL AND pr.owner_id IS NOT NULL AND p.owner_id<>pr.owner_id) AS duenos_inconsistentes,
 jsonb_agg(jsonb_build_object('token',p.token,'nombre',pr.nombre)) FILTER (WHERE p.owner_id IS NULL AND pr.owner_id IS NULL) AS productos_sin_dueno
 FROM public.perfiles_vigio pr JOIN public.placas_vigio p ON p.id=pr.placa_id;`;
const response=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query,read_only:true})});
if(!response.ok)throw new Error('No se pudo comprobar la vinculación: '+response.status);
console.log(JSON.stringify(await response.json()));
