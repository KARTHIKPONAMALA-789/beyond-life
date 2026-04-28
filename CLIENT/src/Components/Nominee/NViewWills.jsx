import React, { useEffect, useState } from "react";
import { FileText, Eye, Download, LockOpen } from "lucide-react";
import AxiosAPI from "../../Utilis/AxiosAPI";
import NomineeSidebar from "./NomineeSidebar";

const NViewWills = () => {
  const [wills, setWills] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedWill, setSelectedWill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const LoginUserId = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchWills = async () => {
      try {
        const res = await AxiosAPI.get(
          `will/nominee/getUserWillByNomineeId/${LoginUserId._id}`
        );
        setWills(res.data || []);
      } catch (error) {
        console.error("Error fetching wills:", error);
      }
    };

    fetchWills();
  }, []);

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRequestSeen = (will) => {
    setSelectedWill(will);
    setShowModal(true);
  };

  const submitAccessRequest = async (formData) => {
    try {
      const res = await AxiosAPI.post("will/nominee/request-access", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Request submitted successfully!");
      setShowModal(false);
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("❌ Failed to submit access request");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <NomineeSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Assigned Wills
        </h1>

        {wills.length === 0 ? (
          <p className="text-gray-400">No wills assigned to you yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {wills.map((will, index) => {
              const isExpanded = expandedCards[will._id];
              const uploader = will.userId || {};

              return (
                <div
                  key={index}
                  className="bg-gray-800/60 border border-gray-700 rounded-xl p-5 hover:border-green-400 transition-all"
                >
                  <div className="flex items-center mb-4 space-x-3">
                    <FileText className="text-green-400 w-6 h-6" />
                    <h2 className="text-lg font-semibold truncate">
                      {will.title || will.filename || "Untitled Will"}
                    </h2>
                  </div>

                  <p className="text-sm text-gray-400 mb-1">
                    Uploaded by:{" "}
                    <span className="text-white font-medium">
                      {uploader.fullname || "Unknown"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400 mb-2">
                    Date: {new Date(will.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400 mb-3">
                    Attributes:{" "}
                    <span className="text-white">
                      {Array.isArray(will.attributes)
                        ? will.attributes.join(", ")
                        : "None"}
                    </span>
                  </p>

                  {isExpanded && (
                    <div className="text-sm text-gray-400 mb-4 space-y-1">
                      <p>
                        <span className="text-gray-500">Policy:</span>{" "}
                        {will.policy || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-500">File Type:</span>{" "}
                        {will.fileType || "N/A"}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => toggleCard(will._id)}
                      className="px-3 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-all"
                    >
                      {isExpanded ? "See Less" : "See More"}
                    </button>

                    {/* <a
                      href={will.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                    >
                      <Eye size={16} /> View
                    </a> */}
                    {/* 
                    <a
                      href={will.fileUrl}
                      download
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                    >
                      <Download size={16} /> Download
                    </a> */}

                    <button
                      onClick={() => handleRequestSeen(will)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
                    >
                      <LockOpen size={16} /> Req for Seen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedWill && (
        <RequestAccessModal
          will={selectedWill}
          onClose={() => setShowModal(false)}
          onSubmit={submitAccessRequest}
        />
      )}
    </div>
  );
};

const RequestAccessModal = ({ onClose, onSubmit, will }) => {
  const [secretKey, setSecretKey] = useState("");
  const [proof, setProof] = useState("");
  const [deathCertificate, setDeathCertificate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!secretKey) {
      alert("Secret key is required");
      return;
    }

    const formData = new FormData();
    formData.append("nomineeId", JSON.parse(localStorage.getItem("user"))._id);
    formData.append("willId", will._id);
    formData.append("secretKey", secretKey);
    formData.append("proof", proof);
    if (deathCertificate) {
      formData.append("deathCertificate", deathCertificate);
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-xl">
        <h2 className="text-lg font-semibold text-green-400 mb-4">
          Request Access - {will.title}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Secret Key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            required
          />
          <textarea
            placeholder="Proof of relationship or claim (optional)"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setDeathCertificate(e.target.files[0])}
            className="w-full mt-5 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500 transition-all duration-200"

          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NViewWills;
