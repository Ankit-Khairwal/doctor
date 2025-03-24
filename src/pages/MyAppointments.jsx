import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const { user, loading: contextLoading } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch appointments directly from Firestore
  useEffect(() => {
    const fetchUserAppointments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get Firebase dependencies from context
        const { db } = await import("../firebase");
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        
        // Query appointments for the current user
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        // Process results
        const appointmentsList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          appointmentsList.push({
            id: doc.id,
            ...data,
          });
        });
        
        console.log("Fetched appointments:", appointmentsList);
        setAppointments(appointmentsList);
        setError(null);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAppointments();
  }, [user]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      
      // Get Firebase dependencies
      const { db } = await import("../firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      
      // Update the appointment status
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, { status: "cancelled" });
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt
        )
      );
      
      alert("Appointment cancelled successfully");
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (contextLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-600">Please log in to view your appointments</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Log In
        </button>
      </div>
    );
  }

  // Empty appointments state
  if (appointments.length === 0) {
    return (
      <div className="min-h-[60vh]">
        <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
          My appointments
        </p>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">You don't have any appointments yet</p>
          <button
            onClick={() => navigate("/doctors")}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Book an appointment
          </button>
        </div>
      </div>
    );
  }

  // Render appointments
  return (
    <div className="min-h-[60vh]">
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments ({appointments.length})
      </p>

      <div className="mt-6 space-y-6">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <div>
                <p className="font-medium">
                  Dr. {appointment.doctorInfo?.name || "Doctor"}
                </p>
                <p className="text-sm text-gray-500">
                  {appointment.doctorInfo?.speciality || "Specialist"}
                </p>
              </div>
              <div>
                <span 
                  className={`px-3 py-1 text-sm rounded-full ${{
                    'pending': 'bg-yellow-100 text-yellow-800',
                    'confirmed': 'bg-green-100 text-green-800',
                    'cancelled': 'bg-red-100 text-red-800',
                  }[appointment.status] || 'bg-gray-100 text-gray-800'}`}
                >
                  {appointment.status 
                    ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) 
                    : "Pending"}
                </span>
              </div>
            </div>
            
            <div className="p-4 grid md:grid-cols-[1fr_2fr] gap-4">
              <div>
                {appointment.doctorInfo?.image ? (
                  <img
                    className="w-full rounded bg-indigo-50 max-w-[200px]"
                    src={appointment.doctorInfo.image}
                    alt={appointment.doctorInfo.name || "Doctor"}
                  />
                ) : (
                  <div className="w-full h-40 bg-indigo-100 rounded flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-300">DR</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-gray-700 font-medium">Appointment Details</p>
                  <p className="text-sm">
                    <span className="font-medium">Date & Time:</span>{" "}
                    {appointment.appointmentDate}{" "}
                    {appointment.appointmentTime}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-700 font-medium">Location</p>
                  <p className="text-sm">
                    {appointment.doctorInfo?.address?.line1 || ""}
                    {appointment.doctorInfo?.address?.line2 
                      ? `, ${appointment.doctorInfo.address.line2}` 
                      : ""}
                  </p>
                </div>
                
                {appointment.status === "pending" && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90">
                      Pay Online
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50"
                    >
                      Cancel appointment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
