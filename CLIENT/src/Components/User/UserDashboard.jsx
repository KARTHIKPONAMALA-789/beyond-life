import React, { useEffect, useState } from "react";
import { FilePlus, UserCircle2, ShieldCheck, MessageSquareText, LogOut } from "lucide-react";
import AxiosAPI from "../../Utilis/AxiosAPI";
import UserSidebar from "./UserSidebar";
import { toast } from "react-toastify";

const UserDashboard = () => {
  const [wills, setWills] = useState([]);
  const [nomineeStatus, setNomineeStatus] = useState("Active");
  const [lastUpdate, setLastUpdate] = useState("Just now");

  const loginUser = JSON.parse(localStorage.getItem("user"));
  const userName = loginUser?.name || "User";

  useEffect(() => {
    fetchWills();
  }, []);

  const fetchWills = async () => {
    try {
      const res = await AxiosAPI.get(`/will/user-wills/${loginUser._id}`);
      setWills(res.data.data || []);
      setLastUpdate(new Date().toLocaleString());
    } catch (err) {
      toast.error("Failed to fetch will data");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <UserSidebar />

      <div className="flex-1 p-6 overflow-x-hidden">
        <div className="flex justify-between items-center mb-10 border-b border-cyan-400 pb-6">
          <div className="flex items-center space-x-3">
            <UserCircle2 className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text">
              Welcome, {userName}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-900/50 hover:bg-red-900 border border-red-500 text-red-400 px-4 py-2 rounded-lg transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <UserCard title="Will Document" value={wills.length} icon={<FilePlus className="text-green-400 w-6 h-6" />} color="green" />
          <UserCard title="Nominee Status" value={nomineeStatus} icon={<ShieldCheck className="text-yellow-400 w-6 h-6" />} color="yellow" />
          <UserCard title="Support" value="24/7 Available" icon={<MessageSquareText className="text-blue-400 w-6 h-6" />} color="blue" />
        </div>

        <div className="text-sm text-gray-400 text-right">Last synced at: {lastUpdate}</div>
      </div>
    </div>
  );
};

const UserCard = ({ title, value, icon, color }) => {
  const colorMap = {
    green: {
      border: "border-green-400",
      text: "text-green-400",
      bg: "bg-green-400/10",
      shadow: "hover:shadow-green-400/20",
    },
    yellow: {
      border: "border-yellow-400",
      text: "text-yellow-400",
      bg: "bg-yellow-400/10",
      shadow: "hover:shadow-yellow-400/20",
    },
    blue: {
      border: "border-blue-400",
      text: "text-blue-400",
      bg: "bg-blue-400/10",
      shadow: "hover:shadow-blue-400/20",
    },
  };

  const styles = colorMap[color];

  return (
    <div className={`bg-gray-800/50 border ${styles.border} rounded-xl p-6 transition-all hover:shadow-lg ${styles.shadow}`}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className={`text-sm uppercase ${styles.text} mb-1`}>{title}</h2>
          <p className="text-xl font-bold">{value}</p>
        </div>
        <div className={`${styles.bg} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
