import React, { useEffect, useState } from "react";
import AxiosAPI from "../../Utilis/AxiosAPI";
import UserSidebar from "./UserSidebar";
import { Trash2, Edit, Download } from "lucide-react";
import { toast } from "react-toastify";

const ViewWills = () => {
  const [wills, setWills] = useState([]);
  const [allNominees, setAllNominees] = useState([]);
  const [editingWillId, setEditingWillId] = useState(null);
  const [selectedNominee, setSelectedNominee] = useState(null);

  const loginUser = JSON.parse(localStorage.getItem("user"));

  const fetchWills = async () => {
    try {
      const res = await AxiosAPI.get(`/will/user-wills/${loginUser._id}`);
      setWills(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch will data");
    }
  };

  const fetchNominees = async () => {
    try {
      const res = await AxiosAPI.get(`users/my-nominees/${loginUser._id}`);
      setAllNominees(res.data.data || []);
    } catch {
      toast.error("Failed to fetch nominees");
    }
  };

  const handleDelete = async (id) => {
    try {
      await AxiosAPI.delete(`will/delete-will/${id}`, {
        data: { userId: loginUser._id },
      });
      toast.success("Will deleted successfully");
      fetchWills();
    } catch (err) {
      toast.error("Failed to delete will");
    }
  };

  const handleAssignNominee = async (willId, nomineeId) => {
    if (!nomineeId) return;

    try {
      await AxiosAPI.put(`will/add-nominee/${willId}`, { nomineeId });
      toast.success("Nominee added to will");
      fetchWills(); // Refresh UI
      setEditingWillId(null);
      setSelectedNominee(null);
    } catch (err) {
      toast.error("Failed to assign nominee");
    }
  };

  useEffect(() => {
    fetchWills();
    fetchNominees();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <UserSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-cyan-400 mb-6">View & Manage Wills</h1>

        {wills.length === 0 ? (
          <p className="text-gray-400">No wills found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {wills.map((will) => (
              <div
                key={will._id}
                className="bg-gray-800 rounded-xl p-5 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-cyan-300">{will.title}</h2>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Policy:</span>{" "}
                      {will.policy}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Uploaded:</span>{" "}
                      {new Date(will.uploadedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingWillId(will._id);
                        setSelectedNominee(null);
                      }}
                      className={`${
                        editingWillId === will._id
                          ? "text-green-400 hover:text-green-300"
                          : "text-yellow-400 hover:text-yellow-300"
                      }`}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(will._id)}
                      className="text-red-500 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    {will.encryptedFilePath ? (
                      <a
                        href={`/files/${will.encryptedFilePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <Download size={18} />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">No file</span>
                    )}
                  </div>
                </div>

                {/* Attributes */}
                <div className="mb-3">
                  <p className="font-medium text-sm text-gray-300">Attributes:</p>
                  <ul className="list-disc ml-5 text-gray-400 text-sm">
                    {will.attributes?.filter(Boolean).map((attr, i) => (
                      <li key={i}>{attr}</li>
                    ))}
                  </ul>
                </div>

                {/* Nominees */}
                <div>
                  <p className="font-medium text-sm text-gray-300 mb-1">Nominees:</p>
                  {will.nomineeIds.length === 0 ? (
                    <p className="text-sm text-gray-400">No nominees added.</p>
                  ) : (
                    will.nomineeIds.map((nom, index) => (
                      <div
                        key={index}
                        className="border border-gray-600 rounded-lg p-3 mb-2 text-sm text-gray-300"
                      >
                        <p>
                          👤 <strong>{nom.fullname}</strong> ({nom.relation})
                        </p>
                        <p>📧 {nom.email}</p>
                        <p>📱 {nom.mobile}</p>
                        <p>
                          🏠 {nom.city}, {nom.state}, {nom.country}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Conditional Nominee Form */}
                {editingWillId === will._id && (
                  <div className="mt-4">
                    <label className="block text-sm text-gray-300 mb-1">
                      Select Nominee to Add
                    </label>
                    <div className="flex gap-2 items-center">
                      <select
                        value={selectedNominee || ""}
                        onChange={(e) => setSelectedNominee(e.target.value)}
                        className="bg-gray-900 text-white border border-gray-600 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="" disabled>
                          -- Select Nominee --
                        </option>
                        {allNominees.map((nom) => (
                          <option key={nom._id} value={nom._id}>
                            {nom.fullname} ({nom.relation})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() =>
                          handleAssignNominee(will._id, selectedNominee)
                        }
                        disabled={!selectedNominee}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm transition disabled:opacity-50"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewWills;
