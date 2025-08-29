import { useNavigate } from "react-router-dom";
import { showSuccess } from "../Utils/Toast";
import getInitials from "../Utils/getInitials";

function Header({ setIsLoggedIn }) {
    const navigate = useNavigate()
    const userName = localStorage.getItem("userName")
    const initials = getInitials(userName)

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName")
        setIsLoggedIn(false)
        showSuccess("Logout Successfully")
        navigate('/auth')
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-gradient-to-b from-blue-500 to-blue-600 h-18 px-4 sm:px-6 md:px-8 lg:px-14 shadow-lg">
            <div className="font-bold text-white text-lg sm:text-xl md:text-2xl">
                <span className="hidden sm:inline">PROJECT PULSE</span>
                <span className="sm:hidden">PULSE</span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                {/* User Avatar */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm sm:text-base md:text-lg">{initials}</span>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-md transition-colors duration-200 font-medium text-sm sm:text-base"
                >
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">Exit</span>
                </button>
            </div>
        </header>
    )
}

export default Header;