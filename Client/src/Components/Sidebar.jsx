import { File, LayoutDashboard, Trash, Bell } from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {

    return (
        <>
            <div className="flex h-screen">
                {/* SIDEBAR MENU */}
                <nav className="flex flex-col items-start w-16 sm:w-20 md:w-40 lg:w-52 bg-gradient-to-b from-gray-50 to-gray-100 pt-20 sm:pt-14 md:pt-8 px-2 sm:px-3 md:px-4 shadow-lg border-r border-gray-200">
                    <div className="w-full">
                        <div className="mb-4 sm:mb-6 md:mb-8">
                            <h2 className="text-gray-600 text-xs sm:text-sm font-medium uppercase tracking-wide px-1 sm:px-2 md:px-3 hidden md:block">Menu</h2>
                        </div>

                        <NavLink to="/dashboard" className={({ isActive }) =>
                            `flex items-center justify-center md:justify-start mb-2 sm:mb-3 px-1 sm:px-2 md:px-3 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-200 group cursor-pointer w-full ${isActive
                                ? 'bg-blue-100 shadow-lg'
                                : 'hover:bg-blue-50 hover:shadow-sm'
                            }`}>
                            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                            <div className="text-gray-700 font-medium pl-2 sm:pl-2.5 md:pl-3 group-hover:text-blue-600 transition-colors duration-200 hidden md:block text-sm md:text-base">Dashboard</div>
                        </NavLink>

                        <NavLink to="/project" className={({ isActive }) =>
                            `flex items-center justify-center md:justify-start mb-2 sm:mb-3 px-1 sm:px-2 md:px-3 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-200 group cursor-pointer w-full ${isActive
                                ? 'bg-blue-100 shadow-lg'
                                : 'hover:bg-blue-50 hover:shadow-sm'
                            }`}>
                            <File className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                            <div className="text-gray-700 font-medium pl-2 sm:pl-2.5 md:pl-3 group-hover:text-blue-600 transition-colors duration-200 hidden md:block text-sm md:text-base">Project</div>
                        </NavLink>

                        <NavLink to="/notification" className={({ isActive }) =>
                            `flex items-center justify-center md:justify-start mb-2 sm:mb-3 px-1 sm:px-2 md:px-3 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-200 group cursor-pointer w-full ${isActive
                                ? 'bg-blue-100 shadow-lg'
                                : 'hover:bg-blue-50 hover:shadow-sm'
                            }`}>
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                            <div className="text-gray-700 font-medium pl-2 sm:pl-2.5 md:pl-3 group-hover:text-blue-600 transition-colors duration-200 hidden md:block text-sm md:text-base">Notifications</div>
                        </NavLink>

                        <NavLink to="/trash" className={({ isActive }) => `flex items-center justify-center md:justify-start mb-2 sm:mb-3 px-1 sm:px-2 md:px-3 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-200 group cursor-pointer w-full ${isActive
                            ? 'bg-red-100 shadow-lg'
                            : ' hover:bg-red-50 hover:shadow-sm'
                            }`}>
                            <Trash className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                            <div className="text-gray-700 font-medium pl-2 sm:pl-2.5 md:pl-3 group-hover:text-red-600 transition-colors duration-200 hidden md:block text-sm md:text-base">Trash</div>
                        </NavLink>
                    </div>
                </nav >
            </div >
        </>
    )
}

export default Sidebar;