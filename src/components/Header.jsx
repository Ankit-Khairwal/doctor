import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Your Health, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Our Priority
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
            Connect with trusted healthcare professionals and book appointments with ease.
            Your well-being is just a click away.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start mb-12">
            <a
              href="#speciality"
              className="inline-flex items-center px-8 py-3 rounded-full text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Book Appointment
              <img className="w-4 ml-2" src={assets.arrow_icon} alt="" />
            </a>
            
            <div className="flex items-center gap-4">
              <img 
                className="w-32 h-auto" 
                src={assets.group_profiles} 
                alt="Doctor profiles" 
              />
              <div className="text-sm text-gray-600">
                <span className="block font-semibold">1000+ Doctors</span>
                <span>Ready to help you</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-3xl transform rotate-3"></div>
          <img
            className="relative rounded-3xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500"
            src={assets.header_img}
            alt="Doctor consultation"
          />
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
    </div>
  );
};

export default Header;
