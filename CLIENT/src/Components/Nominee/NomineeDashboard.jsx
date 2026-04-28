import React, { useEffect, useState } from "react";
import {
  FileText,
  Users,
  Megaphone,
  LogOut,
  UserCircle2
} from "lucide-react";
import AxiosAPI from "../../Utilis/AxiosAPI";
import NomineeSidebar from "./NomineeSidebar";

const NomineeDashboard = () => {
  const [assignedCount, setAssignedCount] = useState(0);
  const [sentRequestsCount, setSentRequestsCount] = useState(0);
  const [acceptedRequestsCount, setAcceptedRequestsCount] = useState(0);
  const [promotionText, setPromotionText] = useState(
    "Secure your future, verify your identity today."
  );
  const [nomineeName, setNomineeName] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  const LoginUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchNomineeStats = async () => {
      try {
        // Assigned wills
        const assignedRes = await AxiosAPI.get(
          `will/nominee/getUserWillByNomineeId/${LoginUser._id}`
        );
        setAssignedCount(assignedRes.data.length || 0);

        // Sent requests and accepted
        const requestRes = await AxiosAPI.get(
          `will/nominee/requests/${LoginUser._id}`
        );
        const requests = requestRes.data || [];

        const totalSent = requests.length;
        const accepted = requests.filter(req => req.status === "Approved").length;

        setSentRequestsCount(totalSent);
        setAcceptedRequestsCount(accepted);

        // Update sync time
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    fetchNomineeStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <NomineeSidebar />

      <div className="flex-1 p-6 overflow-x-hidden">
        <div className="flex justify-between items-center mb-10 border-b border-green-400 pb-6">
          <div className="flex items-center space-x-3">
            <UserCircle2 className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text">
              Welcome, {LoginUser.name || "Nominee"}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-900/50 hover:bg-red-900 border border-red-500 text-red-400 px-4 py-2 rounded-lg transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* New Section: Heading + Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-green-300 mb-2">Your Nominee Dashboard</h2>
          <p className="text-gray-400">
            Monitor the wills assigned to you, track your access requests, and stay informed with real-time updates.
            This dashboard helps ensure secure and transparent communication between you and the testators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <NomineeCard
            title="Assigned Wills"
            value={assignedCount}
            icon={<FileText className="text-blue-400 w-6 h-6" />}
            color="blue"
          />
          <NomineeCard
            title="Requests Sent"
            value={sentRequestsCount}
            icon={<Users className="text-yellow-400 w-6 h-6" />}
            color="yellow"
          />
          <NomineeCard
            title="Access Approved"
            value={acceptedRequestsCount}
            icon={<FileText className="text-green-400 w-6 h-6" />}
            color="green"
          />
          <NomineeCard
            title="Promotion"
            value={promotionText}
            icon={<Megaphone className="text-purple-400 w-6 h-6" />}
            color="purple"
          />
        </div>

        <div className="text-sm text-gray-400 text-right">
          Last synced at: {lastUpdate}
        </div>
      </div>
    </div>
  );
};

const NomineeCard = ({ title, value, icon, color }) => (
  <div
    className={`bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-${color}-400 transition-all hover:shadow-lg hover:shadow-${color}-400/20`}
  >
    <div className="flex justify-between items-start">
      <div>
        <h2 className={`text-sm uppercase text-${color}-400 mb-1`}>{title}</h2>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <div className={`bg-${color}-400/10 p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default NomineeDashboard;
