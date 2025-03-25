import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { doctors, currencySymbol, user, bookAppointment, error, loading } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingStatus, setBookingStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const fetchDocInfo = () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    if (!docInfo) {
      setBookingStatus({
        loading: false,
        error: "Doctor not found",
        success: false,
      });
      return;
    }
    setDocInfo(docInfo);
  };

  const getAvailableSlots = () => {
    setDocSlots([]);
    let slots = [];
    
   
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      
      if (date.getDay() === 0) continue;
      
      const timeSlots = [];
      let startHour = date.getDate() === today.getDate() ? 
        Math.max(10, date.getHours() + 1) : 10;
      
     
      for (let hour = startHour; hour < 19; hour++) {
        for (let minute of [0, 30]) {
        
          if (date.getDate() === today.getDate() && 
              hour === today.getHours() && 
              minute <= today.getMinutes()) {
            continue;
          }
          
          const slotTime = new Date(date);
          slotTime.setHours(hour, minute, 0, 0);
          
          timeSlots.push({
            datetime: slotTime,
            time: slotTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            date: slotTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }),
          });
        }
      }
      
      if (timeSlots.length > 0) {
        slots.push({
          date: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          slots: timeSlots,
        });
      }
    }
    
    setDocSlots(slots);
  };

  const handleBookAppointment = async () => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      if (!selectedDate || !selectedTime) {
        setBookingStatus({
          loading: false,
          error: "Please select both date and time for your appointment",
          success: false,
        });
        return;
      }

      setBookingStatus({ loading: true, error: null, success: false });

     
      const doctorData = {
        name: docInfo.name,
        speciality: docInfo.speciality,
        image: docInfo.image,
        fees: docInfo.fees,
        address: docInfo.address || { line1: "", line2: "" },
      };

      const appointmentData = {
        doctorInfo: doctorData,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        patientInfo: {
          name: user.displayName || "Anonymous",
          email: user.email,
          userId: user.uid,
        },
      };

      console.log("Booking appointment with data:", appointmentData);
      await bookAppointment(docId, appointmentData);
      
      setBookingStatus({
        loading: false,
        error: null,
        success: true,
      });
      
     
      navigate("/my-appointments");
    } catch (error) {
      console.error("Appointment booking error:", error);
      setBookingStatus({
        loading: false,
        error: error.message || "Failed to book appointment",
        success: false,
      });
    }
  };

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo();
    }
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  if (loading || bookingStatus.loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return docInfo ? (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Doctor Details */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <img
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            src={docInfo.image}
            alt={docInfo.name}
          />
        </div>

        <div className="md:w-2/3 space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{docInfo.name}</h1>
            <img className="w-6 h-6" src={assets.verified_icon} alt="Verified" />
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <span className="px-3 py-1 bg-blue-50 rounded-full">{docInfo.degree}</span>
            <span className="px-3 py-1 bg-blue-50 rounded-full">{docInfo.speciality}</span>
            <span className="px-3 py-1 bg-blue-50 rounded-full">{docInfo.experience}</span>
          </div>

          <p className="text-gray-600">{docInfo.about}</p>

          <div className="text-lg font-semibold">
            Consultation Fee: {currencySymbol}{docInfo.fees}
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Select Appointment Time</h2>
        
        {(error || bookingStatus.error) && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error || bookingStatus.error}
          </div>
        )}

        {/* Date Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Available Dates</h3>
          <div className="flex flex-wrap gap-2">
            {docSlots.map((dateSlot, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(dateSlot.date)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedDate === dateSlot.date
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:border-blue-600"
                }`}
              >
                {dateSlot.date}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Available Times</h3>
            <div className="flex flex-wrap gap-2">
              {docSlots
                .find((dateSlot) => dateSlot.date === selectedDate)
                ?.slots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedTime === slot.time
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:border-blue-600"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Book Button */}
        <button
          onClick={handleBookAppointment}
          disabled={loading || bookingStatus.loading || !selectedDate || !selectedTime}
          className={`w-full md:w-auto px-8 py-3 rounded-lg text-white font-medium transition-colors ${
            loading || bookingStatus.loading || !selectedDate || !selectedTime
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading || bookingStatus.loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Booking...
            </span>
          ) : (
            "Book Appointment"
          )}
        </button>
      </div>

      {/* Related Doctors */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Similar Doctors</h2>
        <RelatedDoctors
          speciality={docInfo.speciality}
          docId={docInfo._id}
        />
      </div>
    </div>
  ) : (
    <div className="min-h-[80vh] flex items-center justify-center">
      <p className="text-gray-500">Doctor not found</p>
    </div>
  );
};

export default Appointment;
