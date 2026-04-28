import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import UserSidebar from "./UserSidebar";
import AxiosAPI from "../../Utilis/AxiosAPI";

const AddNominee = () => {
  const [form, setForm] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    date_of_birth: "",
    gender: "",
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    relation: "",
    role:"NOMINEE"
  });
  const [photo, setPhoto] = useState(null);
  const [nomineeSign, setNomineeSign] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signPreview, setSignPreview] = useState(null);

  const loginUser = JSON.parse(localStorage.getItem("user"));

  // Validation rules
  const validateField = (name, value) => {
    const validators = {
      username: () => value.length < 3 ? "Username must be at least 3 characters" : "",
      fullname: () => value.length < 2 ? "Full name must be at least 2 characters" : "",
      email: () => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email format" : "",
      password: () => {
        if (value.length < 5) return "Password must be at least 5 characters";
        if (!/[A-Z]/.test(value)) return "Password must contain an uppercase letter";
        if (!/[0-9]/.test(value)) return "Password must contain a number";
        return "";
      },
      mobile: () => !/^\d{10}$/.test(value) ? "Mobile must be 10 digits" : "",
      date_of_birth: () => !value ? "Date of birth is required" : "",
      gender: () => !value ? "Gender is required" : "",
      zip_code: () => !/^\d{6}$/.test(value) ? "Zip code must be 5 digits" : "",
    };
    return validators[name]?.() || "";
  };

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      const newErrors = {};
      Object.entries(form).forEach(([key, value]) => {
        const error = validateField(key, value);
        if (error) newErrors[key] = error;
      });
      setErrors(newErrors);
    }, 300);
    return () => clearTimeout(timer);
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0 || !photo || !nomineeSign) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("registeredBy", loginUser._id);
    if (photo) data.append("photo", photo);
    if (nomineeSign) data.append("nomineeSign", nomineeSign);

    try {
      await AxiosAPI.post("/users/register", data);
      toast.success("Nominee added successfully");
      setForm({
        username: "",
        fullname: "",
        email: "",
        password: "",
        mobile: "",
        address: "",
        date_of_birth: "",
        gender: "",
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "",
        relation: "",
        role:NOMINEE
      });
      setPhoto(null);
      setNomineeSign(null);
      setPhotoPreview(null);
      setSignPreview(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add nominee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <UserSidebar />
      <div className="flex-1 p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Add Nominee</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
          {[
            { name: "username", type: "text", placeholder: "Enter username" },
            { name: "fullname", type: "text", placeholder: "Enter full name" },
            { name: "email", type: "email", placeholder: "Enter email" },
            { name: "password", type: "password", placeholder: "Enter password" },
            { name: "mobile", type: "tel", placeholder: "Enter mobile number" },
            { name: "address", type: "text", placeholder: "Enter address" },
            { name: "date_of_birth", type: "date" },
            { 
              name: "gender", 
              type: "select",
              options: [
                { value: "", label: "Select gender" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "other", label: "Other" }
              ]
            },
            { name: "street", type: "text", placeholder: "Enter street" },
            { name: "city", type: "text", placeholder: "Enter city" },
            { name: "state", type: "text", placeholder: "Enter state" },
            { name: "zip_code", type: "text", placeholder: "Enter zip code" },
            { name: "country", type: "text", placeholder: "Enter country" },
            { name: "relation", type: "text", placeholder: "Enter relation" },
          ].map((field) => (
            <div key={field.name} className="relative">
              <label className="block text-sm mb-1 capitalize text-gray-300">
                {field.name.replace(/_/g, " ")}
              </label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required
                  className={`w-full px-3 py-2 bg-gray-900 border ${
                    errors[field.name] ? "border-red-500" : "border-gray-600"
                  } rounded-md text-white focus:outline-none focus:border-cyan-500 transition-colors`}
                />
              )}
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <label className="block text-sm mb-1 text-gray-300">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setPhoto, setPhotoPreview)}
              required
              className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
            {photoPreview && (
              <img src={photoPreview} alt="Photo preview" className="w-32 h-32 object-cover rounded-md mt-2" />
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm mb-1 text-gray-300">Nominee Signature</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setNomineeSign, setSignPreview)}
              required
              className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
            {signPreview && (
              <img src={signPreview} alt="Signature preview" className="w-32 h-16 object-contain rounded-md mt-2" />
            )}
          </div>

          <div className="col-span-full flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className={`bg-cyan-600 text-white px-8 py-2 rounded-md transition-all ${
                isSubmitting || Object.keys(errors).length > 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-cyan-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNominee;