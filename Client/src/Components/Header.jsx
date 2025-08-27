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
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-gradient-to-b from-blue-500 to-blue-600 h-18 px-14 shadow-lg">
            <div className="font-bold text-white text-2xl">PROJECT PULSE</div>

            <div className="flex items-center space-x-4">
                {/* User Avatar */}
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">{initials}</span>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium"
                >
                    Logout
                </button>
            </div>
        </header>
    )
}

export default Header;