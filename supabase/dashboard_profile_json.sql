BEGIN;
CREATE OR REPLACE FUNCTION public.vigio_mis_productos()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'token',p.token,'estado',p.estado,'tipo_producto',p.tipo_producto,'datos_perfil',p.datos_perfil,
   'fecha_activacion',p.fecha_activacion,'perfil',coalesce(to_jsonb(pr)-'owner_id',jsonb_build_object('nombre','Sin datos','estado_alerta','safe')))
   ORDER BY p.fecha_activacion DESC NULLS LAST),'[]'::jsonb)
 FROM public.placas_vigio p LEFT JOIN public.perfiles_vigio pr ON pr.placa_id=p.id
 WHERE auth.uid() IS NOT NULL AND p.owner_id=auth.uid() AND (pr.owner_id IS NULL OR pr.owner_id=auth.uid());
$$;
NOTIFY pgrst,'reload schema';
COMMIT;
