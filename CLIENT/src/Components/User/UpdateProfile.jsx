import React, { useEffect, useState } from "react";
import AxiosAPI from "../../Utilis/AxiosAPI";
import UserSidebar from "./UserSidebar";
import { toast } from "react-toastify";
import { Pencil, Save } from "lucide-react";

const UpdateProfile = () => {
    const [userData, setUserData] = useState({});
    const [editable, setEditable] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [userId, setUserId] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [userRole, setUserRole] = useState("");

    const fetchUser = async () => {
        try {
            const res = await AxiosAPI.get("/users/me");
            const user = res.data;
            setUserData(user);
            setUserId(user._id);
            setPhotoPreview(user.photo);

            // Get user role from localStorage safely
            const storedUser = localStorage.getItem("User");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserRole(parsedUser.role || "");
            }
        } catch (error) {
            toast.error("Failed to fetch profile");
            console.error("Error fetching user:", error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // Append all user data fields
        Object.entries(userData).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                formData.append(key, val);
            }
        });

        // Include the user role in the update
        if (userRole) {
            formData.append("role", userRole);
        }

        if (photo) formData.append("photo", photo);

        try {
            await AxiosAPI.put(`/users/${userId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Profile updated successfully");
            setEditable(false);
            fetchUser(); // Refresh user data
        } catch (error) {
            toast.error("Failed to update profile");
            console.error("Update error:", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-950 text-gray-100">
            <UserSidebar />
            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-cyan-400">Profile Settings</h1>
                        {!editable ? (
                            <button
                                onClick={() => setEditable(true)}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                            >
                                <Pencil size={16} /> Edit
                            </button>
                        ) : (
                            <button
                                onClick={handleUpdate}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                                <Save size={16} /> Save
                            </button>
                        )}
                    </div>

                    {/* Display user role if available */}
                    {userRole && (
                        <div className="mb-4">
                            <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs">
                                {userRole}
                            </span>
                        </div>
                    )}

                    {/* Profile Photo */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-cyan-500">
                            <img
                                src={
                                    photo
                                        ? URL.createObjectURL(photo)
                                        : photoPreview || "/default-profile.png"
                                }
                                alt="Profile"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {editable && (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files[0])}
                                className="mt-3 text-sm text-gray-400"
                            />
                        )}
                    </div>

                    {/* Profile Form */}
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            ["Username", "username", "text"],
                            ["Full Name", "fullname", "text"],
                            ["Email", "email", "email"],
                            ["Mobile", "mobile", "text"],
                            ["Date of Birth", "date_of_birth", "date"],
                            ["Gender", "gender", "text"],
                            ["Street", "street", "text"],
                            ["City", "city", "text"],
                            ["State", "state", "text"],
                            ["Zip Code", "zip_code", "text"],
                            ["Country", "country", "text"],
                        ].map(([label, name, type]) => (
                            <div key={name}>
                                <label className="block text-sm mb-1 text-gray-300">{label}</label>
                                <input
                                    type={type}
                                    name={name}
                                    value={userData[name] || ""}
                                    onChange={handleChange}
                                    readOnly={!editable}
                                    className={`w-full px-3 py-2 bg-gray-900 border ${editable ? "border-cyan-500" : "border-gray-600"
                                        } rounded-md text-white`}
                                />
                            </div>
                        ))}

                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1 text-gray-300">Address</label>
                            <textarea
                                name="address"
                                value={userData.address || ""}
                                onChange={handleChange}
                                readOnly={!editable}
                                rows="3"
                                className={`w-full px-3 py-2 bg-gray-900 border ${editable ? "border-cyan-500" : "border-gray-600"
                                    } rounded-md text-white`}
                            />
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default UpdateProfile;













