// Script para verificar las tablas de grupos en Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co'; // Reemplaza con tu URL
const supabaseKey = 'your-anon-key'; // Reemplaza con tu clave

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGroupsTables() {
  console.log('🔍 Verificando tablas de grupos...');
  
  try {
    // Verificar si la tabla groups existe
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .limit(1);
    
    if (groupsError) {
      console.error('❌ Error al acceder a la tabla groups:', groupsError);
    } else {
      console.log('✅ Tabla groups existe');
    }
    
    // Verificar si la tabla group_members existe
    const { data: membersData, error: membersError } = await supabase
      .from('group_members')
      .select('*')
      .limit(1);
    
    if (membersError) {
      console.error('❌ Error al acceder a la tabla group_members:', membersError);
    } else {
      console.log('✅ Tabla group_members existe');
    }
    
    // Verificar políticas RLS
    console.log('🔍 Verificando políticas RLS...');
    
    // Intentar crear un grupo de prueba
    const { data: testGroup, error: testError } = await supabase
      .from('groups')
      .insert({
        name: 'Test Group',
        description: 'Test Description',
        is_public: true,
        max_members: 10,
        created_by: '00000000-0000-0000-0000-000000000000' // UUID de prueba
      })
      .select()
      .single();
    
    if (testError) {
      console.error('❌ Error al crear grupo de prueba:', testError);
    } else {
      console.log('✅ Grupo de prueba creado exitosamente');
      
      // Limpiar el grupo de prueba
      await supabase
        .from('groups')
        .delete()
        .eq('id', testGroup.id);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkGroupsTables();
