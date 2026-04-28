import React, { useEffect, useState } from "react";
import axios from "../../Utilis/AxiosAPI";
import { toast } from "react-toastify";
import UserSidebar from "./UserSidebar";
import AxiosAPI from "../../Utilis/AxiosAPI";

const UploadWill = () => {
    const [title, setTitle] = useState("");
    const [policy, setPolicy] = useState("");
    const [attributes, setAttributes] = useState([]);
    const [nominees, setNominees] = useState([]);
    const [selectedNominees, setSelectedNominees] = useState([]);
    const [file, setFile] = useState(null);
    const LoginUserId = JSON.parse(localStorage.getItem("user"))


    useEffect(() => {
        const fetchNominees = async () => {
            try {
                const res = await AxiosAPI.get(`users/my-nominees/${LoginUserId._id}`);
                setNominees(res.data.data || []);
            } catch (err) {
                toast.error("Failed to fetch nominees");
            }
        };
        fetchNominees();
    }, []);

    const handleAttributeChange = (e, index) => {
        const updated = [...attributes];
        updated[index] = e.target.value;
        setAttributes(updated);
    };

    const addAttributeField = () => {
        setAttributes([...attributes, ""]);
    };

    const handleNomineeToggle = (id) => {
        setSelectedNominees((prev) =>
            prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return toast.warn("Please select a file to upload.");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("policy", policy);
        formData.append("attributes", JSON.stringify(attributes));
        formData.append("nomineeIds", JSON.stringify(selectedNominees));

        try {
            const res = await AxiosAPI.post("will/upload-will", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Will uploaded successfully!");
            // Optional: Reset form
            setTitle("");
            setPolicy("");
            setAttributes([]);
            setSelectedNominees([]);
            setFile(null);
        } catch (err) {
            console.error(err);
            toast.error("Upload failed");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
            <UserSidebar />
            <main className="flex-1 p-8">
                <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
                    <h1 className="text-2xl font-bold text-cyan-400 mb-6">Upload Will</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Policy Dropdown */}
                        <div>
                            <label className="block text-sm mb-1">Policy</label>
                            <select
                                value={policy}
                                onChange={(e) => setPolicy(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white"
                            >
                                <option value="">-- Select Policy --</option>
                                {[
                                    "Standard",
                                    "SecureStorage",
                                    "ApprovalBased",
                                    "MultiNominee",
                                    "TimeLocked",
                                    "AutoTransfer"
                                ].map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Attributes */}
                        <div>
                            <label className="block text-sm mb-1">Attributes (key:value)</label>
                            {attributes.map((attr, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={attr}
                                    onChange={(e) => handleAttributeChange(e, index)}
                                    className="w-full mb-2 px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white"
                                    placeholder="e.g., property:beach-house"
                                    required
                                />
                            ))}
                            <button
                                type="button"
                                onClick={addAttributeField}
                                className="text-cyan-400 text-sm hover:underline"
                            >
                                + Add Attribute
                            </button>
                        </div>

                        {/* Nominee Selection */}
                        {/* <div>
                            <label className="block text-sm mb-1">Select Nominees</label>
                            <div className="space-y-2">
                                {nominees.length === 0 ? (
                                    <p className="text-sm text-gray-400">No nominees found.</p>
                                ) : (
                                    nominees.map((nom) => (
                                        <label key={nom._id} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedNominees.includes(nom._id)}
                                                onChange={() => handleNomineeToggle(nom._id)}
                                                className="form-checkbox text-cyan-400"
                                            />
                                            {nom.fullname} ({nom.email})
                                        </label>
                                    ))
                                )}
                            </div>
                        </div> */}

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm mb-1">Upload File</label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="text-sm text-gray-400"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition"
                        >
                            Upload Will
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default UploadWill;
