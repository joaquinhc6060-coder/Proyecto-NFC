import fs from 'node:fs/promises';
import {loadEnv} from 'vite';
const env={...loadEnv('development',process.cwd(),''),...process.env};
const ref=new URL(env.SUPABASE_URL||env.VITE_SUPABASE_URL).hostname.split('.')[0];
async function query(sql,read_only=false){
 const r=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query:sql,read_only})});
 const data=await r.json();if(!r.ok)throw new Error('No se pudo completar la operación: '+(data.message||r.status));return data;
}
const backup=await query(`SELECT to_jsonb(p) AS placa,to_jsonb(pr) AS perfil FROM public.placas_vigio p JOIN public.perfiles_vigio pr ON pr.placa_id=p.id WHERE p.token='vg8k94m2' AND p.owner_id IS NULL AND pr.owner_id IS NULL AND pr.nombre='Benjamin Carvajal'`,true);
if(backup.length!==1)throw new Error('No coincide exactamente el registro de prueba sin dueño. No se elimina nada.');
await fs.mkdir('backups.local',{recursive:true});
await fs.writeFile(`backups.local/removed-test-vg8k94m2-${Date.now()}.json`,JSON.stringify(backup,null,2));
await query(`BEGIN;
DO $$ DECLARE target uuid;
BEGIN
 SELECT p.id INTO target FROM public.placas_vigio p JOIN public.perfiles_vigio pr ON pr.placa_id=p.id
 WHERE p.token='vg8k94m2' AND p.owner_id IS NULL AND pr.owner_id IS NULL AND pr.nombre='Benjamin Carvajal' FOR UPDATE OF p,pr;
 IF target IS NULL THEN RAISE EXCEPTION 'El registro cambió; no se elimina.'; END IF;
 DELETE FROM public.perfiles_vigio WHERE placa_id=target AND owner_id IS NULL;
 DELETE FROM public.placas_vigio WHERE id=target AND token='vg8k94m2' AND owner_id IS NULL;
END $$;
COMMIT;`);
console.log('Placa de prueba vg8k94m2 y su perfil eliminados. Copia local guardada en backups.local.');
