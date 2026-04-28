import React, { useState, useEffect } from 'react';
import {
  FiUser, FiLock, FiMail, FiEye, FiEyeOff, FiArrowRight, FiPhone, FiCalendar,
  FiMapPin, FiHome, FiArrowLeft, FiImage
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosAPI from '../../Utilis/AxiosAPI';
import axios from 'axios';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullname: '',
    mobile: '',
    date_of_birth: '',
    gender: 'Male',
    zip_code: '',
    street: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    role: 'USER',
    photo: null,
    terms: false
  });

  const [otpDetails, setOtpDetails] = useState({
    email: '',
    role: 'USER',
    otp: '',
    newPassword: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

 const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await AxiosAPI.post('/users/login', {
        email: formData.email,
        password: formData.password,
        role: loginType
      });

      const { user, token } = response.data;

      // 🛑 Block login if user is not approved
      if (user.role === 'USER' && user.isApproved === false) {
        toast.warn('Your account is pending approval. Please wait for admin approval.');
        setIsSubmitting(false);
        return;
      }

      // ✅ Proceed if approved
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success(`Logged in as ${loginType}`);

      // 🚀 Redirect by role
      if (loginType === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (loginType === 'NOMINEE') {
        navigate('/nominee/dashboard');
      } else if (loginType === 'USER') {
        navigate('/user/dashboard');
      }
      else {
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };      


  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'photo' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      } else if (key !== 'terms') {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await AxiosAPI.post('/users/register', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Registration successful!');
      setIsLogin(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await AxiosAPI.post('/users/forgot-password', {
        email: otpDetails.email,
        role: otpDetails.role
      });
      toast.success(res.data.msg || 'OTP sent to your email');
      setOtpStage(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await AxiosAPI.post('/users/reset-password', {
        email: otpDetails.email,
        role: otpDetails.role,
        otp: otpDetails.otp,
        newPassword: otpDetails.newPassword
      });
      toast.success(res.data.msg || 'Password reset successfully');
      setIsForgotPassword(false);
      setOtpStage(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

const getLocation = async () => {
  setAddressLoading(true);

  try {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      setAddressLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
              lat: latitude,
              lon: longitude,
              format: 'json'
            }
          });

          const address = response.data.address;

          if (!address) {
            toast.warn('Unable to retrieve address from coordinates');
            return;
          }

          setFormData((prev) => ({
            ...prev,
            zip_code: address.postcode || prev.zip_code,
            city: address.city || address.town || address.village || prev.city,
            state: address.state || prev.state,
            country: address.country || 'India'
          }));

          toast.success('Location and address fetched successfully');
        } catch (apiErr) {
          console.error(apiErr);
          toast.error('Failed to fetch address from coordinates');
        } finally {
          setAddressLoading(false);
        }
      },
      (error) => {
        toast.error('Location permission denied or unavailable');
        setAddressLoading(false);
      }
    );
  } catch (err) {
    console.error(err);
    toast.error('Unexpected error getting location');
    setAddressLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center p-4">
      <div className={`w-full ${isLogin || isForgotPassword ? 'max-w-md' : 'max-w-2xl'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800">
            Beyond<span className="text-gray-700">Life</span>
            <span className="text-indigo-600">&</span>
            <span className="text-gray-800">Will</span>
          </h1>
          <p className="mt-2 text-gray-600">
            {isForgotPassword ? 'Enter details to reset your password' :
              isLogin ? 'Secure access to your legacy planning' :
                'Complete your profile to get started'}
          </p>
        </div>

        {isForgotPassword ? (
          <form onSubmit={otpStage ? handleResetPassword : handleForgotPassword} className="bg-white rounded-xl shadow-md overflow-hidden p-10">
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setOtpStage(false);
                setOtpDetails({ email: '', role: 'USER', otp: '', newPassword: '' });
              }}
              type="button"
              className="mb-6 text-indigo-600 text-sm flex items-center hover:text-indigo-500"
            >
              <FiArrowLeft className="mr-2" />
              Back to Login
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {otpStage ? 'Reset Password' : 'Forgot Password'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={otpDetails.email}
                onChange={(e) => setOtpDetails({ ...otpDetails, email: e.target.value })}
                required
                className="w-full border px-3 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Role</label>
              <select
                value={otpDetails.role}
                onChange={(e) => setOtpDetails({ ...otpDetails, role: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="NOMINEE">Nominee</option>
              </select>
            </div>

            {otpStage && (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-1">OTP</label>
                  <input
                    type="text"
                    value={otpDetails.otp}
                    onChange={(e) => setOtpDetails({ ...otpDetails, otp: e.target.value })}
                    required
                    className="w-full border px-3 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={otpDetails.newPassword}
                    onChange={(e) => setOtpDetails({ ...otpDetails, newPassword: e.target.value })}
                    required
                    className="w-full border px-3 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {isSubmitting
                ? 'Please wait...'
                : otpStage
                  ? 'Reset Password'
                  : 'Send OTP'}
            </button>
          </form>
        ) : (
          <>
            {/* Auth Toggle */}
            <div className="flex bg-white rounded-full p-1 shadow-sm mb-8">
              <button
                className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-colors ${isLogin ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-indigo-600'}`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-colors ${!isLogin ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-indigo-600'}`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            {/* Auth Form */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-10 relative">
              {/* Back Button */}
              <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <FiArrowLeft className="mr-2 h-5 w-5" />
                Back
              </button>

              {isLogin ? (
                <>
                  {/* Login Type Selector */}
                  <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                    {['USER', 'ADMIN', 'NOMINEE'].map((type) => (
                      <button
                        key={type}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-colors ${loginType === type ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:text-indigo-600'}`}
                        onClick={() => setLoginType(type)}
                      >
                        {type.toLowerCase()}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleLogin}>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder={`Your ${loginType.toLowerCase()} email`}
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter your password"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-indigo-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <FiEyeOff className="h-5 w-5" />
                            ) : (
                              <FiEye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-sm mb-4">
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-indigo-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? 'Signing In...' : 'Sign In'}
                      <FiArrowRight className="ml-2" />
                    </button>
                  </form>
                </>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>

                      <div>
                        <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
                          Profile Picture
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiImage className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        {formData.photo && (
                          <p className="text-sm text-gray-500 mt-1">Selected: {formData.photo.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Praveen1125"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="fullname"
                            name="fullname"
                            type="text"
                            required
                            value={formData.fullname}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Praveen Kumar"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="praveen1125@gmail.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiPhone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="mobile"
                            name="mobile"
                            type="tel"
                            required
                            value={formData.mobile}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="9876541230"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="date_of_birth"
                            name="date_of_birth"
                            type="date"
                            required
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="block w-full pl-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Address Information</h3>

                      <div>
                        <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="zip_code"
                            name="zip_code"
                            type="text"
                            required
                            value={formData.zip_code}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="500001"
                          />
                          <button
                            type="button"
                            onClick={getLocation}
                            className="absolute right-2 top-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded"
                          >
                            {addressLoading ? 'Loading...' : 'Use My Location'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                          Street
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="street"
                            name="street"
                            type="text"
                            required
                            value={formData.street}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="MG Road"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiHome className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="address"
                            name="address"
                            type="text"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="12, Lane 3, Sens Colony"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          className="block w-full pl-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Hyderabad"
                        />
                      </div>

                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          id="state"
                          name="state"
                          type="text"
                          required
                          value={formData.state}
                          onChange={handleChange}
                          className="block w-full pl-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Telangana"
                        />
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="block w-full pl-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Account Security</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiLock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={formData.password}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Create a password (min 8 chars)"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              className="text-gray-400 hover:text-indigo-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <FiEyeOff className="h-5 w-5" />
                              ) : (
                                <FiEye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                          Account Type
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="block w-full pl-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="USER">Standard User</option>
                          <option value="NOMINEE">Nominee</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      checked={formData.terms}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Terms of Service</a> and <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? 'Registering...' : 'Complete Registration'}
                    <FiArrowRight className="ml-2" />
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isLogin ? (
                  <>Need an account? <span className="font-semibold">Register</span></>
                ) : (
                  <>Already have an account? <span className="font-semibold">Sign in</span></>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;