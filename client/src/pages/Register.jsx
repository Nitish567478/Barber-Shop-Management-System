import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    shopName: '',
    experience: '',
    specialization: '',
    location: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const isBarber = formData.role === 'barber';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      };

      if (isBarber) {
        payload.shopName = formData.shopName;
        payload.experience = Number(formData.experience) || 0;
        payload.specialization = formData.specialization;
        payload.location = formData.location;
        payload.bio = formData.bio;
      }

      await register(payload);
      navigate('/login', {
        state: {
          message: isBarber
            ? 'Barber account created successfully. Log in to set up your services and manage bookings.'
            : 'Registration successful! Please log in with your credentials.',
        },
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed';
      setError(errorMsg);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-page flex items-center justify-center px-6 py-10">
      <div className="theme-card w-full max-w-2xl">
        <p className="theme-subtitle text-center">Create Account</p>
        <h1 className="mt-4 text-center text-3xl font-semibold text-white">
          Join Barber Shop
        </h1>
        <p className="mt-3 text-center text-sm text-slate-300">
          Create a customer account or onboard as a barber and start managing your shop from one dashboard.
        </p>

        {error && (
          <div className="alert alert-error mb-4">
            <div>
              {error}
            </div>
            {error.includes('already registered') && (
              <div className="text-sm mt-2 space-y-1">
                <div>
                  <Link to="/login" className="underline hover:text-blue-600">
                    Log in instead
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="theme-input"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">I am a:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="theme-select"
              required
            >
              <option value="customer">Customer</option>
              <option value="barber">Barber Owner</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`theme-input ${error.includes('email') || error.includes('already registered') ? 'border-red-500' : ''}`}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="theme-input"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="theme-input pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-300 hover:bg-white/10"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isBarber && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Shop Name</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="theme-input"
                  placeholder="Fade House Studio"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Experience (years)</label>
                <input
                  type="number"
                  min="0"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="theme-input"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="theme-input"
                  placeholder="fade, beard styling, grooming"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="theme-input"
                  placeholder="Kolkata, West Bengal"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="theme-input"
                  rows="4"
                  placeholder="Tell customers about your style, experience, and signature services."
                ></textarea>
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="theme-primary-btn w-full"
            >
              {loading ? 'Registering...' : isBarber ? 'Create Barber Account' : 'Register'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-300 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
