import { useContext } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../Utils/Toast";
import { AppContext } from "../Context/AppContext";
import Loader from "../Components/Loader";
import { useState } from "react";
import validator from "validator";


function Auth({ setIsLoggedIn }) {
    const { userData, setUserData, isSignUp, setIsSignUp } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, role } = userData;
        const payload = { email, password };


        if (!validator.isEmail(email)) {
            showError("Please enter a valid email address");
            return;
        }
        if (password.length < 8) {
            showError("Password must be at least 6 characters long");
            return;
        }
        if (isSignUp) {
            payload.name = name;
            payload.role = role;
        }

        try {
            setLoading(true);
            const URl = isSignUp
                ? `${baseUrl}/api/v1/signup`
                : `${baseUrl}/api/v1/login`;

            const res = await axios.post(URl, payload, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (isSignUp) {
                showSuccess(res.data.message);
                setLoading(false);
                // Navigate to verify email page with email as state
                navigate("/verify-email", { state: { email: email } });
                setUserData({ name: "", email: "", password: "", role: "" });
            } else {
                showSuccess("Login successful");
                setIsLoggedIn(true);
                setLoading(false);
                console.log("Login response:", res.data);
                localStorage.setItem("token", res.data.token)
                localStorage.setItem("userName", res.data.user.name)
                navigate("/");
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Something went wrong";
            if (errorMessage == "User not found please sign up") {
                setIsLoggedIn(false)
                setLoading(false)
            }
            console.log("err", errorMessage)
            if (errorMessage === "Email not verified. Please verify your email to log in.") {
                showError("Please verify your email before logging in.");
                navigate("/verify-email", { state: { email: email } });
            } else {
                showError(errorMessage);
            }

        }
    };
    if (loading) {
        return <Loader />;
    }
    return (
        <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 items-center justify-center p-4 relative overflow-hidden">
            {/* Subtle Background Design Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large circles */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>

                {/* Medium circles */}
                <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-gradient-to-tr from-purple-300/15 to-blue-300/15 rounded-full blur-xl"></div>

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}>
                </div>

                {/* Floating elements */}
                <div className="absolute top-20 left-20 w-4 h-4 bg-blue-300/40 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-40 w-3 h-3 bg-indigo-300/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-40 left-40 w-2 h-2 bg-purple-300/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 right-20 w-5 h-5 bg-blue-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="relative w-full max-w-[800px] h-[500px] bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden flex rounded-xl border border-blue-200/50 z-10">
                {/* Left Side */}
                <div className="w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
                    {/* Subtle pattern overlay on left side */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12"></div>
                        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/15 rounded-full transform -translate-y-1/2"></div>
                    </div>

                    <div className="relative z-10 text-left">
                        <h2 className="text-3xl font-bold mb-4">
                            {isSignUp ? 'Welcome Back!' : 'New Here?'}
                        </h2>
                        <p className="mb-6 text-left text-sm leading-relaxed text-blue-50">
                            {isSignUp
                                ? 'To stay connected with us, please login with your personal info.'
                                : 'Enter your details and start your journey with us.'}
                        </p>
                        <button
                            className="border-2 border-white px-8 py-3 rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105 hover:shadow-lg"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </div>

                {/* Right Side - Forms */}
                <div className="w-1/2 relative overflow-hidden bg-white/90 backdrop-blur-sm">
                    {/* Sign In Form */}
                    <div className={`absolute w-full h-full top-0 left-0 transition-transform duration-500 ease-in-out ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className="p-8 w-full h-full flex flex-col justify-center items-center">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign In</h2>
                            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    value={userData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white"
                                />
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium hover:scale-105 hover:shadow-lg">
                                    Sign In
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sign Up Form */}

                    <div className={`absolute w-full h-full top-0 left-full transition-transform duration-500 ease-in-out ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className="p-8 w-full h-full flex flex-col justify-center items-center">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Account</h2>
                            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    name="name"
                                    value={userData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    value={userData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white"
                                />
                                <select
                                    name="role"
                                    value={userData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"

                                >
                                    <option value="" disabled>Select role</option>
                                    <option value="manager">Manager</option>
                                    <option value="user">User</option>
                                </select>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium hover:scale-105 hover:shadow-lg">
                                    Sign Up
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth;