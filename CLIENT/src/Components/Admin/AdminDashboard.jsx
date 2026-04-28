import React, { useEffect, useState } from "react";
import { LogOut, Users, FileText, Shield, LifeBuoy, Upload, Download, UserCheck } from "lucide-react";
import Sidebar from "./Sidebar";
import AxiosAPI from "../../Utilis/AxiosAPI";

const AdminDashboard = () => {
  const [customerCount, setCustomerCount] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [documentsUploaded, setDocumentsUploaded] = useState(0);
  const [nomineesVerified, setNomineesVerified] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch customers
        const customersRes = await AxiosAPI.get("/users/clients");
        const customers = customersRes.data.customers || [];
        setCustomerCount(customers.length); // Total registered users

        // 2. Fetch will requests
        const requestsRes = await AxiosAPI.get("/will/admin/requests");
        const requests = requestsRes.data.data || [];

        // Approved will requests
        const approvedCount = requests.filter(req => req.status === "Approved").length;
        setActiveCustomers(approvedCount);

        // Documents uploaded (death certificates)
        const docCount = requests.filter(req => req.deathCertificate).length;
        setDocumentsUploaded(((docCount / requests.length) * 100).toFixed(0));

        // Verified nominees = approved status
        setNomineesVerified(((approvedCount / requests.length) * 100).toFixed(0));

        // Update last refresh time
        setLastUpdated(new Date().toLocaleTimeString());

      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  //logout remove all cookies and localstroage and navigate to login page
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    toast .success('Logged out successfully');
  }



  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 p-6 overflow-x-hidden">
        <div className="flex justify-between items-center mb-10 border-b border-cyan-400 pb-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              BEYOND LIFE ADMIN
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-cyan-400 text-cyan-400 px-4 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-400/20">
              <LifeBuoy size={18} /> Support
            </button>
            <button onClick={ handleLogout} className="flex items-center gap-2 bg-red-900/50 hover:bg-red-900 border border-red-500 text-red-400 px-4 py-2 rounded-lg transition-all">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <DashboardCard
            title="Total Customers"
            value={customerCount}
            subtitle="Registered accounts"
            icon={<Users className="w-6 h-6 text-cyan-400" />}
            color="cyan"
            bar={Math.min(100, customerCount / 100)}
          />

          <DashboardCard
            title="REQUEST WILLS"
            value={activeCustomers}
            subtitle="All request wills"
            icon={<UserCheck className="w-6 h-6 text-purple-400" />}
            color="purple"
            bar={Math.min(100, activeCustomers / 50)}
          />

          <DashboardCard
            title="Documents Uploaded"
            value={`${documentsUploaded}%`}
            subtitle="Completion rate"
            icon={<Upload className="w-6 h-6 text-green-400" />}
            color="green"
            bar={documentsUploaded}
          />

          <DashboardCard
            title="Nominees Verified"
            value={`${nomineesVerified}%`}
            subtitle="Verification complete"
            icon={<FileText className="w-6 h-6 text-yellow-400" />}
            color="yellow"
            bar={nomineesVerified}
          />
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800/30 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-cyan-400">Recent Customer Activity</h2>
              <span className="text-xs text-gray-400">Updated: {lastUpdated}</span>
            </div>
            <div className="space-y-4">
              {[
                { name: "John D.", action: "Uploaded will document", time: "2 mins ago", status: "Completed", color: "bg-green-400" },
                { name: "Sarah M.", action: "Updated nominee", time: "5 mins ago", status: "Pending Review", color: "bg-yellow-400" },
                { name: "Alex K.", action: "Completed verification", time: "12 mins ago", status: "Approved", color: "bg-blue-400" },
                { name: "Emma R.", action: "Initiated transfer", time: "18 mins ago", status: "Processing", color: "bg-purple-400" },
                { name: "Michael T.", action: "Signed agreement", time: "25 mins ago", status: "Completed", color: "bg-green-400" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-all">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${activity.color}`}></div>
                    <span className="font-medium">{activity.name}</span>
                  </div>
                  <div className="flex-1 px-4">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                  <span className={`text-sm ${activity.status === "Completed" ? "text-green-400" :
                      activity.status === "Pending Review" ? "text-yellow-400" :
                        activity.status === "Approved" ? "text-blue-400" : "text-purple-400"
                    }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-purple-400 mb-6">Management Tools</h2>
            <div className="space-y-3">
              <QuickAction icon={<Users className="w-5 h-5 text-cyan-400" />} label="Customer Management" shortcut="Ctrl+C" color="cyan" />
              <QuickAction icon={<FileText className="w-5 h-5 text-purple-400" />} label="Document Review" shortcut="Ctrl+D" color="purple" />
              <QuickAction icon={<UserCheck className="w-5 h-5 text-yellow-400" />} label="Nominee Verification" shortcut="Ctrl+N" color="yellow" />
              <QuickAction icon={<Download className="w-5 h-5 text-red-400" />} label="Generate Reports" shortcut="Ctrl+R" color="red" />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          <p>BEYOND LIFE ADMIN v2.1.0 | Secure Connection Established | Last Synced: {lastUpdated}</p>
          <p className="mt-1">© {new Date().getFullYear()} Beyond Life. All rights reserved.</p>
        </div> */}
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, subtitle, icon, color, bar }) => (
  <div className={`bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-${color}-400 transition-all hover:shadow-lg hover:shadow-${color}-400/10`}>
    <div className="flex justify-between items-start">
      <div>
        <h2 className={`text-sm uppercase tracking-wider text-${color}-400 mb-1`}>{title}</h2>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      </div>
      <div className={`bg-${color}-400/10 p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full bg-${color}-400 rounded-full`} style={{ width: `${bar}%` }}></div>
    </div>
  </div>
);

const QuickAction = ({ icon, label, shortcut, color }) => (
  <button className="w-full flex items-center justify-between p-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg transition-all hover:border-cyan-400 group">
    <div className="flex items-center space-x-3">
      <div className={`p-2 bg-${color}-400/10 rounded-lg group-hover:bg-${color}-400/20`}>
        {icon}
      </div>
      <span>{label}</span>
    </div>
    <span className="text-xs text-gray-400">{shortcut}</span>
  </button>
);

export default AdminDashboard;
