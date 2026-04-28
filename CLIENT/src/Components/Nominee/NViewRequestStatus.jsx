import React, { useEffect, useState } from "react";
import NomineeSidebar from "./NomineeSidebar";
import AxiosAPI from "../../Utilis/AxiosAPI";

const NViewRequestStatus = () => {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [secretKey, setSecretKey] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFileURL, setSelectedFileURL] = useState(null);
  const [selectedWillInfo, setSelectedWillInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const LoginUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await AxiosAPI.get(`will/nominee/requests/${LoginUser._id}`);
        setRequests(res.data || []);
      } catch (err) {
        console.error("Error fetching request statuses:", err);
        setErrorMessage("Failed to fetch requests. Please try again.");
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedFileURL) URL.revokeObjectURL(selectedFileURL);
    };
  }, [selectedFileURL]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-600 text-green-100";
      case "Rejected":
        return "bg-red-600 text-red-100";
      default:
        return "bg-yellow-600 text-yellow-100";
    }
  };

  const openModal = (req) => {
    setSelectedReq(req);
    setSecretKey("");
    setSignatureFile(null);
    setErrorMessage("");
    setShowModal(true);
  };

  const handleViewSubmit = async (e) => {
    e.preventDefault();
    if (!secretKey || !selectedReq || !signatureFile) {
      setErrorMessage("Please enter the secret key and select your signature.");
      return;
    }

    setIsLoading(true);
    setShowModal(false);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("nomineeId", LoginUser._id);
      formData.append("secretKey", secretKey);
      formData.append("signature", signatureFile);

      const response = await AxiosAPI.post(
        `will/nominee/view-will/${selectedReq.willId._id}${
          selectedReq.willId.fileType === "application/pdf" ? "" : "?download=true"
        }`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      const contentDisposition = response.headers["content-disposition"];
      let fileName = `${selectedReq.willId?.title || "Will"}_${selectedReq.willId?._id}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) fileName = match[1];
      }

      const file = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      if (file.size === 0) {
        throw new Error("Received empty file from server");
      }

      const fileURL = URL.createObjectURL(file);
      setSelectedFileURL(fileURL);

      setSelectedWillInfo({
        title: selectedReq.willId?.title || "Untitled Will",
        uploadedBy: selectedReq.willId?.userId?.fullname || "Unknown",
        uploadedOn: new Date(selectedReq.requestDate).toLocaleDateString(),
        fileName,
      });
    } catch (error) {
      console.error("Decryption/view error:", error);
      let message = "An error occurred while accessing the will.";
      if (error.response?.status === 401) {
        message = "Invalid secret key, signature, or no approved access.";
      } else if (error.response?.status === 404) {
        message = "Will or nominee not found.";
      } else if (error.response?.status === 400) {
        message = error.response.data.message || "Invalid request. Please check your inputs.";
      } else if (error.message === "Received empty file from server") {
        message = "The server returned an empty file. Please contact support.";
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <NomineeSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
          My Access Requests
        </h1>

        {requests.length === 0 ? (
          <p className="text-gray-400 text-lg">You have not submitted any requests yet.</p>
        ) : (
          <div className="grid gap-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <h2 className="text-xl font-semibold text-white">{req.willId?.title || "Untitled Will"}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Uploaded by: <span className="text-white">{req.willId?.userId?.fullname || "Unknown"}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Requested On: {new Date(req.requestDate).toLocaleDateString()}
                </p>
                <div
                  className={`mt-3 inline-block px-4 py-1.5 text-sm font-medium rounded-full ${getStatusColor(
                    req.status
                  )}`}
                >
                  Status: {req.status}
                </div>

                {req.status === "Approved" && (
                  <button
                    onClick={() => openModal(req)}
                    className="mt-4 ml-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white text-sm px-5 py-2 rounded-lg transition-all duration-200"
                  >
                    View Will
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal for Secret Key + Signature Upload */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-gray-800 rounded-xl p-8 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100">
              <h2 className="text-xl font-semibold text-green-400 mb-6">
                Enter Secret Key and Upload Signature
              </h2>
              <form onSubmit={handleViewSubmit}>
                <input
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
                  placeholder="Secret Key"
                  required
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSignatureFile(e.target.files[0])}
                  className="w-full mt-5 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500 transition-all duration-200"
                  required
                />

                {errorMessage && (
                  <p className="text-red-400 text-sm mt-3">{errorMessage}</p>
                )}

                <div className="flex justify-end mt-6 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-red-600 hover:bg-red-500 px-5 py-2.5 rounded-lg text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg text-white transition-all duration-200"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Will Info Display */}
        {selectedFileURL && selectedWillInfo && (
          <div className="mt-10 p-6 bg-gray-800 border border-gray-600 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold text-green-300 mb-4">Will Details</h2>
            <p className="text-gray-200"><strong>Title:</strong> {selectedWillInfo.title}</p>
            <p className="text-gray-200"><strong>Uploaded By:</strong> {selectedWillInfo.uploadedBy}</p>
            <p className="text-gray-200"><strong>Uploaded On:</strong> {selectedWillInfo.uploadedOn}</p>

            <div className="mt-4 flex gap-3">
              <a
                href={selectedFileURL}
                download={selectedWillInfo.fileName}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg transition-all duration-200"
              >
                Download Will
              </a>
              {selectedWillInfo.fileName.endsWith(".pdf") && (
                <a
                  href={selectedFileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-600 hover:bg-gray-500 text-white px-5 py-2.5 rounded-lg transition-all duration-200"
                >
                  View Will
                </a>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 text-yellow-400 text-sm flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Decrypting and loading file...
          </div>
        )}
        {errorMessage && !showModal && (
          <div className="mt-6 text-red-400 text-sm">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default NViewRequestStatus;