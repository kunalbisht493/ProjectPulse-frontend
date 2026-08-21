import { useContext, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../Utils/Toast";
import { AppContext } from "../Context/AppContext";
import Loader from "../Components/Loader";
import validator from "validator";
import { Activity, Mail, Lock, User, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

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
        const nameRegex = /^[A-Za-z\s]+$/;

        const { name, email, password, role } = userData;
        const payload = { email, password };

        if (!validator.isEmail(email)) {
            showError("Please enter a valid email");
            return;
        }
        if (password.length < 8) {
            showError("Password must be at least 8 characters long");
            return;
        }
        if (isSignUp && !nameRegex.test(name)) {
            showError("Name can only contain letters and spaces");
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
                showSuccess(res.data?.message || "Account created successfully! Please sign in.");
                setLoading(false);
                setIsSignUp(false);
                setUserData({ name: "", email: "", password: "", role: "" });
            } else {
                const userRole = res.data.user.role;

                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userName", res.data.user.name);
                setIsLoggedIn(true);
                showSuccess("Login successful");

                // Redirect based on role
                if (userRole === 'manager' || userRole === 'admin') {
                    navigate('/');
                } else {
                    navigate('/project');
                }
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Something went wrong";
            if (errorMessage === "User not found please sign up") {
                setIsLoggedIn(false);
                setLoading(false);
            }
            console.log("err", errorMessage);
            if (errorMessage === "Invalid credentials") {
                setLoading(false);
                navigate('/auth');
            }
            showError(errorMessage);
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex min-h-screen w-full bg-slate-950 items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 -left-40 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 -right-40 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Auth Container Card */}
            <div className="relative w-full max-w-4xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10">
                {/* Left Side: Branding / Intro Banner */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-indigo-950 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        {/* Brand */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Activity className="w-5 h-5 text-white stroke-[2.5]" />
                            </div>
                            <div className="flex items-center tracking-tight">
                                <span className="font-extrabold text-white text-lg">PROJECT</span>
                                <span className="font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent text-lg ml-1">PULSE</span>
                            </div>
                        </div>

                        {/* Banner Copy */}
                        <div className="space-y-2 pt-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                {isSignUp ? "Join the Workspace" : "Welcome Back"}
                            </h2>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                {isSignUp
                                    ? "Create your account to organize tasks, track milestones, and collaborate seamlessly."
                                    : "Sign in to access your projects, Kanban boards, and team workflows."}
                            </p>
                        </div>

                        {/* Feature bullets */}
                        <div className="space-y-2.5 pt-2 hidden sm:block">
                            <div className="flex items-center gap-2.5 text-xs text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Real-time Kanban collaboration</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                                <span>Interactive progress tracking</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                                <span>Role-based team permissions</span>
                            </div>
                        </div>
                    </div>

                    {/* Toggle Prompt */}
                    <div className="relative z-10 pt-6 border-t border-slate-800/80 mt-6">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-400">
                                {isSignUp ? "Already have an account?" : "Need an account?"}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <span>{isSignUp ? "Sign In" : "Sign Up"}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Interactive Forms */}
                <div className="w-full md:w-7/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-slate-900/60">
                    <div className="max-w-sm w-full mx-auto space-y-6">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                {isSignUp ? "Create an account" : "Sign in to your account"}
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">
                                {isSignUp ? "Enter your information below to register" : "Enter your credentials to continue"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isSignUp && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Jane Doe"
                                            name="name"
                                            value={userData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white placeholder-slate-500 text-sm transition-all duration-200 outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white placeholder-slate-500 text-sm transition-all duration-200 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        name="password"
                                        value={userData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white placeholder-slate-500 text-sm transition-all duration-200 outline-none"
                                    />
                                </div>
                            </div>

                            {isSignUp && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Role</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <select
                                            name="role"
                                            value={userData.role}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white text-sm transition-all duration-200 outline-none cursor-pointer"
                                        >
                                            <option value="" disabled className="bg-slate-900 text-slate-400">Select your role</option>
                                            <option value="manager" className="bg-slate-900 text-white">Manager (Manage Projects)</option>
                                            <option value="user" className="bg-slate-900 text-white">User (Team Member)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full mt-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                            >
                                {isSignUp ? "Create Account" : "Sign In"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;