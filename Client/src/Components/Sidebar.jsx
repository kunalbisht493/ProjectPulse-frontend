import { FolderKanban, LayoutDashboard, Trash2, Bell, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {
    const navItems = [
        {
            to: "/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            activeColor: "text-indigo-600 bg-indigo-50 border-indigo-200/80 shadow-xs font-semibold",
            hoverColor: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
            iconColor: "text-indigo-500",
        },
        {
            to: "/project",
            label: "Projects",
            icon: FolderKanban,
            activeColor: "text-indigo-600 bg-indigo-50 border-indigo-200/80 shadow-xs font-semibold",
            hoverColor: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
            iconColor: "text-indigo-500",
        },
        {
            to: "/notification",
            label: "Notifications",
            icon: Bell,
            activeColor: "text-indigo-600 bg-indigo-50 border-indigo-200/80 shadow-xs font-semibold",
            hoverColor: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
            iconColor: "text-indigo-500",
        },
        {
            to: "/trash",
            label: "Trash",
            icon: Trash2,
            activeColor: "text-rose-600 bg-rose-50 border-rose-200/80 shadow-xs font-semibold",
            hoverColor: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
            iconColor: "text-rose-500",
        }
    ];

    return (
        <aside className="w-16 sm:w-20 md:w-56 lg:w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/80 p-2 sm:p-3 md:p-4 flex flex-col justify-between shrink-0 h-full select-none transition-all duration-200">
            <div className="w-full space-y-4">
                <div className="hidden md:block px-3 pt-2 pb-1">
                    <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Navigation</h2>
                </div>

                <nav className="space-y-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center justify-center md:justify-start px-2.5 sm:px-3 py-2.5 rounded-xl border transition-all duration-200 group cursor-pointer w-full text-sm ${
                                        isActive
                                            ? `${item.activeColor}`
                                            : `border-transparent ${item.hoverColor}`
                                    }`
                                }
                                title={item.label}
                            >
                                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                                <span className="ml-3 hidden md:inline-block font-medium tracking-tight">
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Quick Workspace Badge on desktop */}
            <div className="hidden md:block p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/60 via-slate-50 to-violet-50/60 border border-indigo-100/60 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">Project Pulse Pro</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    Collaborate and track deliverables in real-time.
                </p>
            </div>
        </aside>
    );
}

export default Sidebar;