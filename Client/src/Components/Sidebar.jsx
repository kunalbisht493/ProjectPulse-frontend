
import { File, LayoutDashboard, Trash, Bell } from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {

    return (
        <>
            <div className="flex h-screen">
                {/* SIDEBAR MENU */}
                <nav className="flex flex-col items-start md:w-40 lg:w-52  bg-gradient-to-b from-gray-50 to-gray-100 pt-8 px-4 shadow-lg border-r border-gray-200">
                    <div className="w-full">
                        <div className="mb-8">
                            <h2 className="text-gray-600 text-sm font-medium uppercase tracking-wide px-3">Menu</h2>
                        </div>

                        <NavLink to="/dashboard" className="flex items-center mb-3 px-3 py-3 rounded-lg transition-all duration-200 group hover:bg-blue-50 hover:shadow-sm cursor-pointer">
                            <LayoutDashboard className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                            <div className="text-gray-700 font-medium pl-3 group-hover:text-blue-600 transition-colors duration-200">Dashboard</div>
                        </NavLink>

                        <NavLink to="/project" className="flex items-center mb-3 px-3 py-3 rounded-lg transition-all duration-200 group hover:bg-blue-50 hover:shadow-sm cursor-pointer">
                            <File className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                            <div className="text-gray-700 font-medium pl-3 group-hover:text-blue-600 transition-colors duration-200">Project</div>
                        </NavLink>
                        <NavLink to="/notification" className="flex items-center mb-3 px-3 py-3 rounded-lg transition-all duration-200 group hover:bg-blue-50 hover:shadow-sm cursor-pointer">
                            <Bell className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                            <div className="text-gray-700 font-medium pl-3 group-hover:text-blue-600 transition-colors duration-200">Notifications</div>
                        </NavLink>
                        <NavLink to="/trash" className="flex items-center mb-3 px-3 py-3 rounded-lg transition-all duration-200 group hover:bg-red-50 hover:shadow-sm cursor-pointer">
                            <Trash className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                            <div className="text-gray-700 font-medium pl-3 group-hover:text-red-600 transition-colors duration-200">Trash</div>
                        </NavLink>
                    </div>
                </nav>
            </div>
        </>
    )
}

export default Sidebar;