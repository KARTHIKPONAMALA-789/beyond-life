import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import AxiosAPI from "../../Utilis/AxiosAPI";
import { toast } from "react-toastify";

const NomineeApprovalPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await AxiosAPI.get("will/admin/requests");
                setRequests(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching nominee requests", err);
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const approveRequest = async (requestId) => {
        try {
            setApprovingId(requestId);
            await AxiosAPI.put(`/will/admin/approve-request/${requestId}`);
            setRequests((prev) =>
                prev.map((req) =>
                    req._id === requestId ? { ...req, status: "Approved" } : req
                )
            );
            toast.success("Nominee request approved");
        } catch (err) {
            console.error("Approval failed", err);
        } finally {
            setApprovingId(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 p-6">
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">Nominee Access Requests</h2>

                {loading ? (
                    <div className="text-cyan-300">Loading requests...</div>
                ) : (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-auto">
                        <table className="min-w-full table-auto divide-y divide-gray-700">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Request ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Nominee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Will Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {requests.map((req) => (
                                    <tr key={req._id} className="hover:bg-gray-700/50 transition-all">
                                        <td className="px-6 py-4 text-sm text-gray-200">{req._id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-200">{req.nomineeId?.fullname || "N/A"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{req.nomineeId?.email || "N/A"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-200">{req.willId?.title || "N/A"}</td>
                                        <td className="px-6 py-4 text-sm text-cyan-400">{req.status}</td>
                                        <td className="px-6 py-4 text-sm space-x-2 flex items-center">
                                            {req.deathCertificate ? (
                                                <img
                                                    src={`${req.deathCertificate}`}
                                                    alt="Death Certificate"
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            ) : (
                                                <span className="text-gray-500 text-xs">No Certificate</span>
                                            )}

                                            <button
                                                className={`px-3 py-1 text-xs rounded text-white ${req.status === "Approved"
                                                    ? "bg-gray-500 cursor-not-allowed"
                                                    : "bg-green-600 hover:bg-green-500"
                                                    }`}
                                                disabled={req.status === "Approved" || approvingId === req._id}
                                                onClick={() => approveRequest(req._id)}
                                            >
                                                {approvingId === req._id ? "Approving..." : "Approve"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
};

export default NomineeApprovalPage;
