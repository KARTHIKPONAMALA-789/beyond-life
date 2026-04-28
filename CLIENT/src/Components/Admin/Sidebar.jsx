import React from "react";
import {
  Home,
  Users,
  FileText,
  Shield,
  Settings,
  HelpCircle,
  UserCheck,
  Lock
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: "Dashboard", path: "/admin/dashboard" },
    { icon: <Users className="w-5 h-5" />, label: "Customers", path: "/admin/customerspage" },
    { icon: <FileText className="w-5 h-5" />, label: "Documents", path: "/admin/documentspage" },
    { icon: <UserCheck className="w-5 h-5" />, label: "Nominees", path: "/admin/nominees" },
    { icon: <Shield className="w-5 h-5" />, label: "Requests", path: "/admin/nominee/request-access" },
    // { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/admin/settings" }
  ];
  
  const activeClass = () =>{
    toast.warn ("This feature is not available yet");
  }

  const supportItems = [
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help Center",   },
    { icon: <Lock className="w-5 h-5" />, label: "Privacy",  }
  ];

  return (
    <div className="w-64 h-screen bg-gray-800/80 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Shield className="w-7 h-7 text-cyan-400" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            BEYOND LIFE
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-3">Navigation</p>
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              to={item.path}
              key={index}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
                  : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              <span className={isActive ? "text-cyan-400" : "text-gray-400"}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Support Section */}
      <div className="p-4 border-t border-gray-700 space-y-1">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-3">Support</p>
        {supportItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            onClick={activeClass}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
          >
            <span className="text-gray-400">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-cyan-400/10 flex items-center justify-center">
            <span className="text-cyan-400 text-sm font-medium">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">admin@beyondlife.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
