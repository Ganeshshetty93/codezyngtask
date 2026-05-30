// const supabase = require('../config/supabase');

// const Product = {
//   // Get all products
//   async getAll() {
//     const { data, error } = await supabase
//       .from('products')
//       .select('*');

//     if (error) throw error;

//     return data;
//   },

//   // Get product by ID
//   async getById(id) {
//     const { data, error } = await supabase
//       .from('products')
//       .select('*')
//       .eq('id', id)
//       .single();

//     if (error) throw error;

//     return data;
//   },

//   // Create product
//   async create(productData) {
//     const { data, error } = await supabase
//       .from('products')
//       .insert([productData])
//       .select();

//     if (error) throw error;

//     return data;
//   },

//   // Update product
//   async update(id, updatedData) {
//     const { data, error } = await supabase
//       .from('products')
//       .update(updatedData)
//       .eq('id', id)
//       .select();

//     if (error) throw error;

//     return data;
//   },

//   // Delete product
//   async delete(id) {
//     const { data, error } = await supabase
//       .from('products')
//       .delete()
//       .eq('id', id);

//     if (error) throw error;

//     return data;
//   }
// };

// module.exports = Product;