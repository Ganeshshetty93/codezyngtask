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