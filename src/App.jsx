import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Doctors from "./pages/Doctors";
import Appointment from "./pages/Appointment";
import MyAppointments from "./pages/MyAppointments";
import MyProfile from "./pages/MyProfile";
import Contact from "./pages/Contact";
import AppContextProvider from "./context/AppContext";

function App() {
  return (
    <AppContextProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Navbar />
            <main className="py-8 flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctors/:speciality" element={<Doctors />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/appointment/:docId" element={<Appointment />} />
                <Route path="/my-appointments" element={<MyAppointments />} />
                <Route path="/my-profile" element={<MyProfile />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </Router>
    </AppContextProvider>
  );
}

export default App;
