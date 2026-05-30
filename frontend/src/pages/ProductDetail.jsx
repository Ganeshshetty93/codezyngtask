// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getProductById, addReview } from '../services/api.jsx';

// function ProductDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [review, setReview] = useState({ user: '', comment: '', rating: 5 });
//   const [reviewError, setReviewError] = useState('');

//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     fetchProduct();
//   }, [id]);

//   const fetchProduct = async () => {
//     try {
//       const response = await getProductById(id);
//       setProduct(response.data.product);
//     } catch (err) {
//       setError('Failed to load product');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReviewChange = (e) => {
//     setReview({ ...review, [e.target.name]: e.target.value });
//   };

//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
//     setReviewError('');

//     try {
//       await addReview(id, review);
//       setReview({ user: '', comment: '', rating: 5 });
//       fetchProduct();
//     } catch (err) {
//       setReviewError('Failed to add review');
//     }
//   };

//   if (loading) {
//     return <div className="container mx-auto px-4 py-12">Loading...</div>;
//   }

//   if (error || !product) {
//     return <div className="container mx-auto px-4 py-12 text-red-600">{error}</div>;
//   }

//   return (
//     <div className="container mx-auto px-4 py-12">
//       <button
//         onClick={() => navigate('/products')}
//         className="mb-6 text-blue-600 hover:underline"
//       >
//         ← Back to Products
//       </button>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* Product Image */}
//         <div>
//           <img
//             src={product.image}
//             alt={product.title}
//             className="w-full rounded-lg shadow-md"
//           />
//         </div>

//         {/* Product Info */}
//         <div>
//           <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
//           <div className="flex items-center mb-4">
//             <span className="text-yellow-500 text-2xl">★</span>
//             <span className="ml-2 text-lg">{product.rating || 0} / 5</span>
//           </div>

//           <p className="text-gray-600 mb-4">{product.description}</p>

//           <div className="bg-gray-100 p-4 rounded-lg mb-6">
//             <p className="text-3xl font-bold text-blue-600 mb-2">${product.price}</p>
//             <p className="text-gray-700">
//               Stock: <span className="font-bold">{product.stock}</span>
//             </p>
//             <p className="text-gray-700">
//               Category: <span className="font-bold">{product.category}</span>
//             </p>
//           </div>

//           <button
//             disabled={product.stock === 0}
//             className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
//           </button>
//         </div>
//       </div>

//       {/* Reviews Section */}
//       <div className="mt-12 border-t pt-8">
//         <h2 className="text-3xl font-bold mb-6">Reviews</h2>

//         {/* Add Review Form */}
//         {token ? (
//           <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
//             <h3 className="text-xl font-bold mb-4">Add Your Review</h3>

//             {reviewError && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//                 {reviewError}
//               </div>
//             )}

//             <div className="mb-4">
//               <label className="block text-gray-700 font-bold mb-2">Your Name</label>
//               <input
//                 type="text"
//                 name="user"
//                 value={review.user}
//                 onChange={handleReviewChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-700 font-bold mb-2">Rating</label>
//               <select
//                 name="rating"
//                 value={review.rating}
//                 onChange={handleReviewChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
//               >
//                 {[5, 4, 3, 2, 1].map((r) => (
//                   <option key={r} value={r}>
//                     {r} Stars
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-700 font-bold mb-2">Comment</label>
//               <textarea
//                 name="comment"
//                 value={review.comment}
//                 onChange={handleReviewChange}
//                 rows="4"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
//                 required
//               ></textarea>
//             </div>

//             <button
//               type="submit"
//               className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
//             >
//               Submit Review
//             </button>
//           </form>
//         ) : (
//           <p className="text-gray-600 mb-8">
//             <a href="/login" className="text-blue-600 hover:underline">
//               Login
//             </a>{' '}
//             to add a review
//           </p>
//         )}

//         {/* Reviews List */}
//         <div className="space-y-4">
//           {product.reviews && product.reviews.length > 0 ? (
//             product.reviews.map((review, index) => (
//               <div key={index} className="bg-white p-4 rounded-lg shadow-md">
//                 <div className="flex justify-between items-start mb-2">
//                   <h4 className="font-bold">{review.user}</h4>
//                   <div className="flex items-center">
//                     <span className="text-yellow-500">★</span>
//                     <span className="ml-1">{review.rating}</span>
//                   </div>
//                 </div>
//                 <p className="text-gray-600 mb-2">{review.comment}</p>
//                 <p className="text-xs text-gray-400">
//                   {new Date(review.date).toLocaleDateString()}
//                 </p>
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-600">No reviews yet. Be the first to review!</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProductDetail;
