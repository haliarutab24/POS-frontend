import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    role: "user",
    password: "",
    confirm: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    if (
      !form.name ||
      !form.username ||
      !form.email ||
      !form.role ||
      !form.password ||
      !form.confirm
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!form.agree) {
      toast.error("You must agree to the terms and privacy policy.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        {
          username: form.username,
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }
      );
      console.log(response.data.user);
      toast.success("Signup successful!");
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Signup failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white px-6 py-12">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold mb-2">
            Logo
          </div>
          <h2 className="text-2xl font-semibold mb-2">Sign Up</h2>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Jiangyu"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="johnkevine4362"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="example@gmail.com"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirm Password"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              className="mr-2"
              required
            />
            <span className="text-xs text-gray-600">
              By creating an account you agree to the{" "}
              <a href="#" className="text-indigo-600 underline">terms of use</a> and our{" "}
              <a href="#" className="text-indigo-600 underline">privacy policy</a>.
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-newPrimary hover:bg-secondary text-white py-2 rounded-md font-semibold transition-all"
          >
            {loading ? "Signing up..." : "Create account"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-700">
          Already have an account?{" "}
          <Link to="/" className="text-secondary hover:text-secondary/80 font-medium">
            Log in
          </Link>
        </div>
      </div>
      {/* Right: Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gray-50 items-center justify-center">
        <img
          src="/images/login.avif"
          alt="Signup Illustration"
          className="max-w-[80%] h-auto"
        />
      </div>
    </div>
  );
};

export default Signup;
