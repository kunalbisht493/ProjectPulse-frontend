import { useContext, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../Utils/Toast";
import { AppContext } from "../Context/AppContext";
import Loader from "../Components/Loader";
import validator from "validator";
import { Activity, Mail, Lock, User, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Shield } from "lucide-react";

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
        <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
            {/* Subtle Ambient Light Elements */}
            <div className="absolute top-0 -left-40 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 -right-40 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-violet-200/30 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Auth Container Card */}
            <div className="relative w-full max-w-4xl bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row z-10">
                {/* Left Side: Branding / Showcase */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-50/90 via-slate-50 to-violet-50/80 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80 relative">
                    <div className="space-y-6">
                        {/* Brand */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                                <Activity className="w-5 h-5 text-white stroke-[2.5]" />
                            </div>
                            <div className="flex items-center tracking-tight">
                                <span className="font-extrabold text-slate-900 text-lg">PROJECT</span>
                                <span className="font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent text-lg ml-1">PULSE</span>
                            </div>
                        </div>

                        {/* Banner Copy */}
                        <div className="space-y-2 pt-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/70 text-indigo-700 text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Modern Workspace</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {isSignUp ? "Create Workspace" : "Welcome Back"}
                            </h2>
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                {isSignUp
                                    ? "Set up your account to manage deliverables, assign tasks, and track team velocity."
                                    : "Sign in to access your projects, Kanban boards, and real-time updates."}
                            </p>
                        </div>

                        {/* Feature bullets */}
                        <div className="space-y-3 pt-2 hidden sm:block">
                            <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs flex items-center gap-2.5 text-xs text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-medium">Real-time Kanban board updates</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs flex items-center gap-2.5 text-xs text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span className="font-medium">Visual metrics & team performance</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs flex items-center gap-2.5 text-xs text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
                                <span className="font-medium">Instant task notifications & comments</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Security Note */}
                    <div className="pt-6 border-t border-slate-200/70 mt-6 flex items-center gap-2 text-xs text-slate-500">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span>Protected by secure session authentication</span>
                    </div>
                </div>

                {/* Right Side: Interactive Light Form */}
                <div className="w-full md:w-7/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
                    <div className="max-w-sm w-full mx-auto space-y-6">
                        {/* Tab Selector */}
                        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(false);
                                    setUserData({ name: "", email: "", password: "", role: "" });
                                }}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    !isSignUp
                                        ? 'bg-white text-indigo-600 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(true);
                                    setUserData({ name: "", email: "", password: "", role: "" });
                                }}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    isSignUp
                                        ? 'bg-white text-indigo-600 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Register
                            </button>
                        </div>

                        <div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                {isSignUp ? "Register an account" : "Sign in to your account"}
                            </h3>
                            <p className="text-slate-500 text-xs mt-1">
                                {isSignUp ? "Fill in the details below to join Project Pulse" : "Enter your email and password to continue"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isSignUp && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Jane Doe"
                                            name="name"
                                            value={userData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition-all duration-200 outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition-all duration-200 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="At least 8 characters"
                                        name="password"
                                        value={userData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition-all duration-200 outline-none"
                                    />
                                </div>
                            </div>

                            {isSignUp && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Role</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <select
                                            name="role"
                                            value={userData.role}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-xl text-slate-900 text-sm transition-all duration-200 outline-none cursor-pointer"
                                        >
                                            <option value="" disabled className="text-slate-400">Select your role</option>
                                            <option value="manager">Manager (Create & Manage Projects)</option>
                                            <option value="user">User (Team Member & Task Assignee)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full mt-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
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