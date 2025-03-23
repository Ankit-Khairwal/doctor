import Header from "../components/Header";
import TopDoctors from "../components/TopDoctors";
import Banner from "../components/Banner";
import SpecialityMenu from "../components/SpecialityMenu";

const Home = () => {
  return (
    <div className="space-y-16">
      <section className="relative">
        <div className="absolute inset-0 bg-blue-50 opacity-50 -z-10 rounded-3xl"></div>
        <Header />
      </section>
      
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Our Medical Specialties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our wide range of medical specialists
          </p>
        </div>
        <SpecialityMenu />
      </section>

      <section className="py-12 bg-white rounded-3xl shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Top-Rated Doctors
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experienced healthcare professionals you can trust
          </p>
        </div>
        <TopDoctors />
      </section>

      <section className="py-12">
        <Banner />
      </section>
    </div>
  );
};

export default Home;
