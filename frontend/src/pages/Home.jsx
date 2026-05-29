import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 mb-12">
        <h1 className="text-5xl font-bold mb-4">Welcome to Codezyng</h1>
        <p className="text-xl mb-8">
          Your premium fullstack e-commerce platform for quality products
        </p>
        <Link
          to="/products"
          className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition inline-block"
        >
          Start Shopping
        </Link>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">🛍️</div>
          <h3 className="text-2xl font-bold mb-2">Wide Selection</h3>
          <p className="text-gray-600">
            Browse thousands of products across multiple categories
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold mb-2">Fast Delivery</h3>
          <p className="text-gray-600">
            Quick and reliable shipping to your doorstep
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-2xl font-bold mb-2">Best Prices</h3>
          <p className="text-gray-600">
            Competitive pricing and regular discounts
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 p-12 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to join?</h2>
        <p className="text-gray-600 mb-8">
          Create an account to enjoy personalized shopping experience
        </p>
        <Link
          to="/register"
          className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
        >
          Sign Up Now
        </Link>
      </div>
    </div>
  );
}

export default Home;
