// const supabase = require('../config/supabase');

// const User = {
//   // Get all users
//   async getAll() {
//     const { data, error } = await supabase
//       .from('users')
//       .select('*');

//     if (error) throw error;

//     return data;
//   },

//   // Get user by ID
//   async getById(id) {
//     const { data, error } = await supabase
//       .from('users')
//       .select('*')
//       .eq('id', id)
//       .single();

//     if (error) throw error;

//     return data;
//   },

//   // Create user profile
//   async create(userData) {
//     const { data, error } = await supabase
//       .from('users')
//       .insert([userData])
//       .select();

//     if (error) throw error;

//     return data;
//   },

//   // Update user
//   async update(id, updatedData) {
//     const { data, error } = await supabase
//       .from('users')
//       .update(updatedData)
//       .eq('id', id)
//       .select();

//     if (error) throw error;

//     return data;
//   },

//   // Delete user
//   async delete(id) {
//     const { data, error } = await supabase
//       .from('users')
//       .delete()
//       .eq('id', id);

//     if (error) throw error;

//     return data;
//   }
// };

// module.exports = User;

// const supabase = require('../config/supabase');

// const User = {
//   // ==========================================
//   // ADD THIS: Get user by Email
//   // ==========================================
//   async getByEmail(email) {
//     const { data, error } = await supabase
//       .from('users') // ✅ CORRECT: Point only to your explicit table string name
//       .select('*')
//       .eq('email', email)
//       .maybeSingle(); // Prevents throwing errors if the email doesn't exist yet

//     if (error) throw error;
//     return data;
//   },

//   async create(userData) {
//     const { data, error } = await supabase
//       .from('users') // ✅ CORRECT: Must be 'users', not an absolute path string
//       .insert([userData])
//       .select()
//       .single();

//     if (error) throw error;
//     return data;
//   },

//   // Get all users
//   async getAll() {
//     const { data, error } = await supabase
//       .from('users')
//       .select('*');

//     if (error) throw error;
//     return data;
//   },

//   // Get user by ID
//   async getById(id) {
//     const { data, error } = await supabase
//       .from('users')
//       .select('*')
//       .eq('id', id)
//       .maybeSingle(); // Safer than .single() if user might be missing

//     if (error) throw error;
//     return data;
//   },

//   // Create user profile
//   async create(userData) {
//     const { data, error } = await supabase
//       .from('users')
//       .insert([userData])
//       .select()
//       .single(); // FIXED: Returns the created object directly instead of an array wrapper

//     if (error) throw error;
//     return data;
//   },

//   // Update user
//   async update(id, updatedData) {
//     const { data, error } = await supabase
//       .from('users')
//       .update(updatedData)
//       .eq('id', id)
//       .select()
//       .single(); // FIXED: Returns the updated object directly instead of an array wrapper

//     if (error) throw error;
//     return data;
//   },

//   // Delete user
//   async delete(id) {
//     const { data, error } = await supabase
//       .from('users')
//       .delete()
//       .eq('id', id)
//       .select()
//       .maybeSingle(); // FIXED: Captures the row information that was deleted so your controller knows it succeeded

//     if (error) throw error;
//     return data;
//   }
// };

// module.exports = User;


const supabase = require('../config/supabase');

const User = {
  // Get user by Email
  async getByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // Safely returns null instead of throwing an exception if email is new

    if (error) throw error;
    return data;
  },

  // Get all users
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;
    return data;
  },

  // Get user by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Create user profile
  async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single(); // Returns the object directly to match controller expectations

    if (error) throw error;
    return data;
  },

  // Update user parameters
  async update(id, updatedData) {
    const { data, error } = await supabase
      .from('users')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete user record
  async delete(id) {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};

module.exports = User;