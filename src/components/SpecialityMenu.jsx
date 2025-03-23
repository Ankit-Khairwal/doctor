import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";

const SpecialityMenu = () => {
  return (
    <div id="speciality" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {specialityData.map((item, index) => (
          <Link
            to={`/doctors/${item.speciality}`}
            onClick={() => scrollTo(0, 0)}
            key={index}
            className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            
            {/* Content */}
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-xl bg-white p-3 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <img 
                  className="w-full h-full object-contain" 
                  src={item.image} 
                  alt={item.speciality}
                />
              </div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 text-center group-hover:text-blue-600 transition-colors duration-200">
                {item.speciality}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
