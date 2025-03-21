import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const { appointments, cancelAppointment, loading } = useContext(AppContext);
  const navigate = useNavigate();

  const handleCancelAppointment = async (appointmentId) => {
    const result = await cancelAppointment(appointmentId);
    if (result.success) {
      // The appointment will be automatically removed from the list
      // due to state update in AppContext
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No appointments found</p>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-4 text-primary hover:underline"
          >
            Book an appointment
          </button>
        </div>
      ) : (
        <div className="">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={appointment.doctorInfo.image}
                  alt={appointment.doctorInfo.name}
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">
                  {appointment.doctorInfo.name}
                </p>
                <p>{appointment.doctorInfo.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">
                  {appointment.doctorInfo.address.line1}
                </p>
                <p className="text-xs">
                  {appointment.doctorInfo.address.line2}
                </p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Date & Time:
                  </span>{" "}
                  {appointment.date.replace(/_/g, "/")} | {appointment.time}
                </p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Status:
                  </span>{" "}
                  <span
                    className={`${
                      appointment.status === "pending"
                        ? "text-yellow-600"
                        : appointment.status === "confirmed"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </span>
                </p>
              </div>
              <div></div>
              <div className="flex flex-col gap-2 justify-end">
                {appointment.status === "pending" && (
                  <>
                    <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">
                      Pay Online
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      Cancel appointment
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
