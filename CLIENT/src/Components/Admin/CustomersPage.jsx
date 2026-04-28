import React, { useEffect, useState, useMemo } from "react";
import {
    Search,
    ChevronDown,
    ChevronUp,
    Mail,
    MoreVertical,
    Eye
} from "lucide-react";
import Sidebar from "./Sidebar";
import AxiosAPI from "../../Utilis/AxiosAPI";

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await AxiosAPI.get("users/clients");
                setCustomers(response.data.customers);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch customers:", error);
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedCustomers = useMemo(() => {
        let sortableItems = [...customers];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [customers, sortConfig]);

    const filteredCustomers = sortedCustomers.filter((customer) =>
        customer.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleApproval = async (id, currentStatus) => {
        try {
            setUpdating(true);
            const response = await AxiosAPI.put(`users/admin/users/${id}`, {
                isApproved: !currentStatus,

            });
            
            setCustomers(prev => prev.map(user => user._id === id ? { ...user, isApproved: !currentStatus } : user));
            if (selectedCustomer && selectedCustomer._id === id) {
                setSelectedCustomer({ ...selectedCustomer, isApproved: !currentStatus });
            }
        } catch (err) {
            console.error("Error updating approval status", err);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 p-6 overflow-x-hidden">
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">Customer Management</h2>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customers by name or email..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-cyan-300 mt-10">Loading customers...</div>
                ) : (
                    <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800/50">
                                    <tr>
                                        <th onClick={() => requestSort('fullname')} className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider cursor-pointer">
                                            <div className="flex items-center">
                                                Name
                                                {sortConfig.key === 'fullname' ? (
                                                    sortConfig.direction === 'ascending' ?
                                                        <ChevronUp className="ml-1 w-4 h-4" /> :
                                                        <ChevronDown className="ml-1 w-4 h-4" />
                                                ) : <ChevronDown className="ml-1 w-4 h-4 opacity-0" />}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Mobile</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Gender</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase">Location</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-cyan-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer._id} className="hover:bg-gray-700/50 transition-all">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={customer.photo}
                                                        alt={customer.fullname}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-100">{customer.fullname}</div>
                                                        <div className="text-sm text-gray-400">{customer.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {customer.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {customer.mobile}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {customer.gender}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {customer.city}, {customer.state}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => setSelectedCustomer(customer)}
                                                        className="text-cyan-400 hover:text-cyan-300"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedCustomer && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-cyan-400">Customer Details</h3>
                                <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div><strong>Name:</strong> {selectedCustomer.fullname}</div>
                                <div><strong>Username:</strong> {selectedCustomer.username}</div>
                                <div><strong>Email:</strong> {selectedCustomer.email}</div>
                                <div><strong>Mobile:</strong> {selectedCustomer.mobile}</div>
                                <div><strong>Gender:</strong> {selectedCustomer.gender}</div>
                                <div><strong>Date of Birth:</strong> {new Date(selectedCustomer.date_of_birth).toLocaleDateString()}</div>
                                <div><strong>Address:</strong> {selectedCustomer.address}</div>
                                <div><strong>Street:</strong> {selectedCustomer.street}</div>
                                <div><strong>City:</strong> {selectedCustomer.city}</div>
                                <div><strong>State:</strong> {selectedCustomer.state}</div>
                                <div><strong>ZIP:</strong> {selectedCustomer.zip_code}</div>
                                <div><strong>Country:</strong> {selectedCustomer.country}</div>
                                <div>
                                    <strong>Approved:</strong>
                                    <button
                                        disabled={updating}
                                        onClick={() => toggleApproval(selectedCustomer._id, selectedCustomer.isApproved)}
                                        className={`ml-2 px-3 py-1 text-xs rounded ${selectedCustomer.isApproved ? 'bg-green-500' : 'bg-red-500'} text-white`}
                                    >
                                        {selectedCustomer.isApproved ? 'Approved' : 'Not Approved'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomersPage;
