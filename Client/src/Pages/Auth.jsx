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
        <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
            {/* Subtle Background Design Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large circles */}
                <div className="absolute -top-16 -right-16 sm:-top-24 sm:-right-24 md:-top-32 md:-right-32 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-2xl sm:blur-3xl"></div>
                <div className="absolute -bottom-16 -left-16 sm:-bottom-24 sm:-left-24 md:-bottom-32 md:-left-32 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl sm:blur-3xl"></div>

                {/* Medium circles */}
                <div className="absolute top-1/4 right-1/4 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-full blur-xl sm:blur-2xl"></div>
                <div className="absolute bottom-1/4 left-1/4 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-tr from-purple-300/15 to-blue-300/15 rounded-full blur-lg sm:blur-xl"></div>

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}>
                </div>

                {/* Floating elements */}
                <div className="absolute top-12 left-12 sm:top-20 sm:left-20 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-blue-300/40 rounded-full animate-pulse"></div>
                <div className="absolute top-20 right-20 sm:top-32 sm:right-32 md:top-40 md:right-40 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-indigo-300/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-20 left-20 sm:bottom-32 sm:left-32 md:bottom-40 md:left-40 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-300/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-12 right-12 sm:bottom-20 sm:right-20 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-blue-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[800px] h-auto min-h-[400px] sm:min-h-[450px] md:h-[500px] bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden flex flex-col md:flex-row rounded-xl border border-blue-200/50 z-10">
                {/* Left Side */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden min-h-[200px] md:min-h-full">
                    {/* Subtle pattern overlay on left side */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/20 rounded-full -translate-x-8 -translate-y-8 sm:-translate-x-12 sm:-translate-y-12 md:-translate-x-16 md:-translate-y-16"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-18 sm:h-18 md:w-24 md:h-24 bg-white/10 rounded-full translate-x-6 translate-y-6 sm:translate-x-9 sm:translate-y-9 md:translate-x-12 md:translate-y-12"></div>
                        <div className="absolute top-1/2 left-1/4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white/15 rounded-full transform -translate-y-1/2"></div>
                    </div>

                    <div className="relative z-10 text-center md:text-left">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4">
                            {isSignUp ? 'Welcome Back!' : 'New Here?'}
                        </h2>
                        <p className="mb-4 sm:mb-5 md:mb-6 text-center md:text-left text-xs sm:text-sm leading-relaxed text-blue-50 px-2 md:px-0">
                            {isSignUp
                                ? 'To stay connected with us, please login with your personal info.'
                                : 'Enter your details and start your journey with us.'}
                        </p>
                        <button
                            className="border-2 border-white px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105 hover:shadow-lg text-sm sm:text-base"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </div>

                {/* Right Side - Forms */}
                <div className="w-full md:w-1/2 relative overflow-hidden bg-white/90 backdrop-blur-sm min-h-[400px] md:min-h-full">
                    {/* Sign In Form */}
                    <div className={`absolute w-full h-full top-0 left-0 transition-transform duration-500 ease-in-out ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className="p-4 sm:p-6 md:p-8 w-full h-full flex flex-col justify-center items-center">
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 md:mb-6 text-gray-800">Sign In</h2>
                            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 w-full max-w-[280px] sm:max-w-xs">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2.5 sm:p-3 border border-gray-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white text-sm sm:text-base"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    value={userData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2.5 sm:p-3 border border-gray-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white text-sm sm:text-base"
                                />
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg transition-all duration-200 font-medium hover:scale-105 hover:shadow-lg text-sm sm:text-base">
                                    Sign In
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sign Up Form */}

                    <div className={`absolute w-full h-full top-0 left-full transition-transform duration-500 ease-in-out ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className="p-4 sm:p-4  md:p-6 w-full h-full flex flex-col justify-center items-center">
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 md:mb-6 text-gray-800">Create Account</h2>
                            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 w-full max-w-[280px] sm:max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    name="name"
                                    value={userData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2.5 sm:p-3 border border-gray-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white text-sm sm:text-base"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2.5 sm:p-3 border border-gray-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white text-sm sm:text-base"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    value={userData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2.5 sm:p-3 border border-gray-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm hover:bg-white focus:bg-white text-sm sm:text-base"
                                />
                                <select
                                    name="role"
                                    value={userData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2.5 sm:p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 text-sm sm:text-base"

                                >
                                    <option value="" disabled>Select role</option>
                                    <option value="manager">Manager</option>
                                    <option value="user">User</option>
                                </select>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg transition-all duration-200 font-medium hover:scale-105 hover:shadow-lg text-sm sm:text-base">
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