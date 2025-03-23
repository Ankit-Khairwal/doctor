import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500">
      <div className="absolute inset-0">
        <svg className="absolute right-0 top-0 h-full w-full transform translate-x-1/2" fill="none">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M0 0h1v1H0V0z" fill="rgba(255,255,255,0.1)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Get Started?
              <span className="block mt-1 text-cyan-100">
                Join Our Healthcare Community
              </span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-cyan-100 max-w-2xl mx-auto lg:mx-0">
              Connect with over 100+ trusted healthcare professionals and take control of your health journey today.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => {
                  navigate("/login");
                  scrollTo(0, 0);
                }}
                className="inline-flex items-center px-8 py-3.5 rounded-full bg-white text-blue-600 font-semibold shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                Create Account
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </button>
              <button 
                onClick={() => {
                  navigate("/doctors");
                  scrollTo(0, 0);
                }}
                className="inline-flex items-center px-8 py-3.5 rounded-full bg-blue-700/20 text-white font-semibold backdrop-blur-sm hover:bg-blue-700/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                Browse Doctors
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-3xl transform rotate-3"></div>
            <img
              className="relative max-w-lg mx-auto transform -rotate-3 hover:rotate-0 transition-transform duration-500"
              src={assets.appointment_img}
              alt="Doctor appointment illustration"
            />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
    </div>
  );
};

export default Banner;
