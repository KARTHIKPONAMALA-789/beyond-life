import React, { useEffect, useState } from "react";
import AxiosAPI from "../../Utilis/AxiosAPI";
import UserSidebar from "./UserSidebar";
import { toast } from "react-toastify";

const ViewNominees = () => {
  const [nominees, setNominees] = useState([]);
  const loginUser = JSON.parse(localStorage.getItem("user"));

  const fetchNominees = async () => {
    try {
      const res = await AxiosAPI.get(`/users/my-nominees/${loginUser._id}`);
      setNominees(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch nominees");
    }
  };

  useEffect(() => {
    fetchNominees();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <UserSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-cyan-400 mb-6">My Nominees</h1>

        {nominees.length === 0 ? (
          <p className="text-gray-400">No nominees found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nominees.map((nominee) => (
              <div
                key={nominee._id}
                className="bg-gray-800 rounded-lg p-5 border border-gray-700 shadow"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={nominee.photo}
                    alt="Nominee"
                    className="w-16 h-16 rounded-full border border-cyan-500 object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-cyan-300">
                      {nominee.fullname}
                    </h2>
                    <p className="text-sm text-gray-400">{nominee.relation}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>
                    📧 <span className="text-gray-400">{nominee.email}</span>
                  </p>
                  <p>
                    📱 <span className="text-gray-400">{nominee.mobile}</span>
                  </p>
                  <p>
                    🏠{" "}
                    <span className="text-gray-400">
                      {nominee.street}, {nominee.city}, {nominee.state},{" "}
                      {nominee.zip_code}, {nominee.country}
                    </span>
                  </p>
                  <p>
                    🎂{" "}
                    <span className="text-gray-400">
                      {new Date(nominee.date_of_birth).toLocaleDateString()}
                    </span>
                  </p>
                  <p>👤 Gender: {nominee.gender}</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-1">Signature:</p>
                  <img
                    src={nominee.signatureUrl}
                    alt="Signature"
                    className="h-10 border border-gray-600 object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewNominees;
