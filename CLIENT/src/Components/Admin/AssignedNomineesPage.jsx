import React, { useEffect, useState } from "react";
import AxiosAPI from "../../Utilis/AxiosAPI";
import Sidebar from "./Sidebar";

const AssignedNomineesPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await AxiosAPI.get("/will/admin/requests");
        setRequests(res.data.data || []);
      } catch (error) {
        console.error("Error fetching nominee requests", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssigned();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Assigned Nominees & Will Details</h2>

        {loading ? (
          <div className="text-cyan-300">Loading data...</div>
        ) : requests.length === 0 ? (
          <div className="text-gray-400">No nominee assignments found.</div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-auto">
            <table className="min-w-full table-auto divide-y divide-gray-700">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Request ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Will Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Nominee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Nominee Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Certificate</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-700/50 transition-all">
                    <td className="px-6 py-4 text-sm">{req._id}</td>
                    <td className="px-6 py-4 text-sm">{req.willId?.title || "N/A"}</td>
                    <td className="px-6 py-4 text-sm">{req.nomineeId?.fullname || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{req.nomineeId?.email || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-cyan-300">{req.status}</td>
                    <td className="px-6 py-4 text-sm">
                      {req.deathCertificate ? (
                        <a
                          href={`${req.deathCertificate}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline text-xs"
                        >
                          View Certificate
                        </a>
                      ) : (
                        <span className="text-gray-500 text-xs">No Certificate</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedNomineesPage;
