import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Signup = () => {
  const navigate = useNavigate();
  const { signUpWithEmail, loading, error, clearError, user } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [showLoginLink, setShowLoginLink] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      clearError();
      setLocalError("");
    };
  }, [clearError]);

  // Check if the error contains "already registered" to show login link
  useEffect(() => {
    if (error && error.includes("already registered")) {
      setShowLoginLink(true);
    } else {
      setShowLoginLink(false);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLocalError("");
      clearError();
      
      if (!email || !password || !confirmPassword) {
        setLocalError("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters long");
        return;
      }

      await signUpWithEmail(email, password);
    } catch (error) {
      console.error("Signup error:", error);
      // Local error handling is not needed since AppContext now handles the specific errors
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        {displayError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-sm text-red-700">{displayError}</p>
            {showLoginLink && (
              <div className="mt-2">
                <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Go to login page
                </Link>
              </div>
            )}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              id="email-address"
              type="email"
              required
              className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              id="password"
              type="password"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              id="confirm-password"
              type="password"
              required
              className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <div className="text-sm text-center mt-6">
          Already have an account? {" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
