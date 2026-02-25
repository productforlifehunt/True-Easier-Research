import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yekarqanirdkdckimpna.supabase.co';
const supabaseServiceKey = 'sbp_7c53cc8ccddecb6dbc756f7e29fbf91ee7e12d45';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'guowei.jiang.work@gmail.com',
      password: 'J4913836j',
      email_confirm: true
    });

    if (authError) {
      console.log('Auth error (might already exist):', authError.message);
      // Try to get existing user
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find(u => u.email === 'guowei.jiang.work@gmail.com');
      
      if (existingUser) {
        console.log('User already exists with ID:', existingUser.id);
        
        // Check if profile exists
        const { data: profile } = await supabase
          .schema('care_connector')
          .from('profiles')
          .select('*')
          .eq('id', existingUser.id)
          .single();
          
        if (!profile) {
          // Create profile
          const { error: profileError } = await supabase
            .schema('care_connector')
            .from('profiles')
            .insert([{
              id: existingUser.id,
              email: 'guowei.jiang.work@gmail.com',
              first_name: 'Test',
              last_name: 'User',
              role: 'client',
              full_name: 'Test User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
            
          if (profileError) {
            console.log('Profile creation error:', profileError);
          } else {
            console.log('Profile created successfully');
          }
        } else {
          console.log('Profile already exists');
        }
        
        return;
      }
    }

    if (authData?.user) {
      console.log('User created with ID:', authData.user.id);
      
      // Create profile
      const { error: profileError } = await supabase
        .schema('care_connector')
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email: 'guowei.jiang.work@gmail.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'client',
          full_name: 'Test User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        
      if (profileError) {
        console.log('Profile creation error:', profileError);
      } else {
        console.log('Profile created successfully');
      }
    }
    
    console.log('Test user setup complete');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
