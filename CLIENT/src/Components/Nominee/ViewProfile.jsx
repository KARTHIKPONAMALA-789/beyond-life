import React, { useEffect, useState } from "react";
import NomineeSidebar from "./NomineeSidebar";
import AxiosAPI from "../../Utilis/AxiosAPI";
import {
  FiEdit, FiUser, FiMail, FiPhone, FiCalendar,
  FiMapPin, FiSave, FiX
} from "react-icons/fi";
import { FaTransgender, FaCity, FaGlobeAmericas } from "react-icons/fa";
import { IoMdHome } from "react-icons/io";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(userData?.role || "");

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await AxiosAPI.get("users/me");
        setProfile(response.data);
        setEditedProfile(response.data);
        setErrorMessage("");
      } catch (err) {
        console.error("Error fetching profile:", err);
        const message =
          err.response?.data?.msg === "Invalid role"
            ? "You don't have permission to access this profile."
            : "Failed to load profile. Please try again.";
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditClick = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editedProfile.fullname || !editedProfile.email) {
      toast.error("Full Name and Email are required");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editedProfile.fullname);
      formData.append("email", editedProfile.email);
      if (editedProfile.mobile) formData.append("mobile", editedProfile.mobile);
      if (editedProfile.address) formData.append("address", editedProfile.address);
      if (editedProfile.street) formData.append("street", editedProfile.street);
      if (editedProfile.city) formData.append("city", editedProfile.city);
      if (editedProfile.state) formData.append("state", editedProfile.state);
      if (editedProfile.zip_code) formData.append("zip_code", editedProfile.zip_code);
      if (editedProfile.country) formData.append("country", editedProfile.country);
      if (editedProfile.password) formData.append("password", editedProfile.password);
      if (photoFile) formData.append("photo", photoFile);

      // Add role
      formData.append("role", userRole);

      const response = await AxiosAPI.put(`users/${profile._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(response.data.updatedUser);
      setEditedProfile(response.data.updatedUser);
      setIsEditing(false);
      setPhotoPreview(null);
      setPhotoFile(null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      const message =
        error.response?.data?.msg === "Invalid role"
          ? "You don't have permission to update this profile."
          : error.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileField = (icon, label, fieldName, value, isEditable = false) => (
    <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
      <div className="text-blue-400 text-lg p-2 bg-gray-700 rounded-full">{icon}</div>
      <div className="flex-1">
        <label className="text-sm text-gray-400">{label}</label>
        {isEditing && isEditable ? (
          fieldName === "role" ? (
            userRole === "admin" ? (
              <select
                name="role"
                value={editedProfile.role || ""}
                onChange={handleInputChange}
                className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="nominee">Nominee</option>
                <option value="user">User</option>
              </select>
            ) : (
              <p className="text-white font-medium">{value || "Not provided"}</p>
            )
          ) : (
            <input
              type={fieldName === "password" ? "password" : "text"}
              name={fieldName}
              value={editedProfile[fieldName] || ""}
              onChange={handleInputChange}
              className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              required={fieldName === "fullname" || fieldName === "email"}
            />
          )
        ) : (
          <p className="text-white font-medium">{value || "Not provided"}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <NomineeSidebar />
      <div className="flex-1 p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              My Profile
            </h1>
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-5 py-2.5 rounded-lg text-white text-sm transition-all duration-200"
              >
                <FiEdit />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 px-5 py-2.5 rounded-lg text-white text-sm"
                >
                  <FiX />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-5 py-2.5 rounded-lg text-white text-sm disabled:opacity-50"
                >
                  <FiSave />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {isLoading && !isEditing ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-yellow-400 text-lg flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                Loading profile details...
              </div>
            </div>
          ) : errorMessage ? (
            <div className="p-6 bg-red-900/30 border border-red-700 rounded-xl text-red-300 text-center">
              {errorMessage}
            </div>
          ) : profile ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <img
                        src={photoPreview || profile.photo || "https://via.placeholder.com/150?text=No+Photo"}
                        alt="Profile"
                        className="w-28 h-28 rounded-full border-4 border-blue-500/30 object-cover"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=Photo+Not+Found")}
                      />
                    </div>
                    {isEditing ? (
                      <>
                        <input type="file" id="profile-photo" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        <label htmlFor="profile-photo" className="text-blue-400 hover:text-blue-300 cursor-pointer text-sm mb-4">
                          Change Profile Photo
                        </label>
                        <input type="text" name="fullname" value={editedProfile.fullname || ""} onChange={handleInputChange}
                          className="text-xl font-bold text-center bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full" />
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-center">{profile.fullname}</h2>
                        <p className="text-gray-400 text-sm mt-1">{profile.username}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
                    <FiUser /> Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderProfileField(<FiMail />, "Email", "email", profile.email, true)}
                    {renderProfileField(<FiPhone />, "Mobile", "mobile", profile.mobile, true)}
                    {renderProfileField(<FiCalendar />, "Date of Birth", "date_of_birth",
                      profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : null)}
                    {renderProfileField(<FaTransgender />, "Gender", "gender", profile.gender)}
                    {renderProfileField(<FiUser />, "Role", "role", profile.role, true)}
                    {isEditing && renderProfileField(<FiCalendar />, "New Password", "password", "", true)}
                  </div>

                  <h2 className="text-lg font-semibold mt-6 mb-4 text-blue-400 flex items-center gap-2">
                    <IoMdHome /> Address Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderProfileField(<FiMapPin />, "Address", "address", profile.address, true)}
                    {renderProfileField(<IoMdHome />, "Street", "street", profile.street, true)}
                    {renderProfileField(<FaCity />, "City", "city", profile.city, true)}
                    {renderProfileField(<FiMapPin />, "State", "state", profile.state, true)}
                    {renderProfileField(<FiMapPin />, "Zip Code", "zip_code", profile.zip_code, true)}
                    {renderProfileField(<FaGlobeAmericas />, "Country", "country", profile.country, true)}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-700">
                    {renderProfileField(<FiCalendar />, "Member Since", "createdAt",
                      profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : null)}
                    {renderProfileField(<FiUser />, "Relation", "relation", profile.relation)}
                    {renderProfileField(<FiUser />, "Registered By", "registeredBy", profile.registeredBy)}
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl text-center">
              <p className="text-gray-400">No profile data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
