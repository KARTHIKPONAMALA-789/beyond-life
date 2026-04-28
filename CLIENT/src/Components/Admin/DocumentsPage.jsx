import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import AxiosAPI from "../../Utilis/AxiosAPI";

const DocumentsPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await AxiosAPI.get("WILL/view-wills");
                setDocuments(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 p-6 overflow-x-auto">
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">All Documents</h2>

                {loading ? (
                    <div className="text-center text-cyan-300">Loading documents...</div>
                ) : (
                    <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-auto">
                        <table className="min-w-full table-auto divide-y divide-gray-700">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Document ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {documents.map((doc) => (
                                    <tr key={doc._id} className="hover:bg-gray-700/50 transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doc._id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doc.userId?.fullname || "N/A"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{doc.userId?.email || "N/A"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => setSelectedDoc(doc)}
                                                className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded"
                                            >
                                                See More
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedDoc && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-gray-800 text-gray-100 p-6 rounded-lg shadow-lg max-w-xl w-full relative">
                            <button
                                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                onClick={() => setSelectedDoc(null)}
                            >
                                ✕
                            </button>
                            <h3 className="text-xl font-bold text-cyan-400 mb-4">Document Details</h3>
                            <p><strong>ID:</strong> {selectedDoc._id}</p>
                            <p><strong>Title:</strong> {selectedDoc.title}</p>
                            <p><strong>Owner Name:</strong> {selectedDoc.userId?.fullname}</p>
                            <p><strong>Email:</strong> {selectedDoc.userId?.email}</p>
                            <p><strong>File Type:</strong> {selectedDoc.fileType}</p>
                            <p><strong>Policy:</strong> {selectedDoc.policy}</p>
                            <p><strong>Attributes:</strong> {Array.isArray(selectedDoc.attributes) ? selectedDoc.attributes.join(", ") : "N/A"}</p>
                            <p><strong>Uploaded At:</strong> {new Date(selectedDoc.uploadedAt).toLocaleString()}</p>
                            <p><strong>Nominees:</strong> {selectedDoc.nomineeIds?.length || 0}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentsPage;
