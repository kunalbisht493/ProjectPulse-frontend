import { useNavigate } from "react-router-dom";
import { showSuccess } from "../Utils/Toast";
import getInitials from "../Utils/getInitials";
import { LogOut, Activity, Sparkles } from "lucide-react";

function Header({ setIsLoggedIn }) {
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName") || "User";
    const initials = getInitials(userName);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.setItem("logout-event", Date.now().toString());
        setIsLoggedIn(false);
        showSuccess("Logout Successfully");
        navigate('/auth');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white/85 backdrop-blur-md h-16 px-4 sm:px-6 md:px-8 border-b border-slate-200/80 transition-all duration-200">
            {/* Logo and Brand */}
            <div 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                    <Activity className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <div className="flex items-center tracking-tight">
                    <span className="font-extrabold text-slate-900 text-lg sm:text-xl">PROJECT</span>
                    <span className="font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent text-lg sm:text-xl ml-1">PULSE</span>
                </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* User Pill / Profile */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/70">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-xs ring-2 ring-white">
                        {initials}
                    </div>
                    <span className="hidden md:inline-block font-semibold text-xs sm:text-sm text-slate-700 max-w-[120px] truncate">
                        {userName}
                    </span>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
                    title="Log out of your account"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}

export default Header;