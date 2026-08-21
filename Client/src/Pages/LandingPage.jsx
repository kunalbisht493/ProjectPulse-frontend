import { useContext } from "react";
import { AppContext } from "../Context/AppContext";
import CreateProject from "./CreateProject";
import { Sparkles, Plus, Kanban, BarChart3, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
    const { showModal, setShowModal } = useContext(AppContext);
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center items-center w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 relative overflow-hidden py-12">
            {/* Background Ambient Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[550px] h-96 sm:h-[550px] bg-gradient-to-tr from-indigo-200/40 via-violet-200/30 to-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center z-10 max-w-3xl w-full mx-auto space-y-6 sm:space-y-8">
                {/* Feature pill badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs sm:text-sm font-semibold shadow-xs animate-fade-in">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Project Management Reimagined</span>
                </div>

                {/* Main Hero Header */}
                <div className="space-y-3">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
                        Organize, Track & <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                            Deliver Together
                        </span>
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
                        Start coordinating tasks with your team in real-time. Boost velocity, minimize friction, and hit every milestone.
                    </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                        <span>Create First Project</span>
                    </button>
                    <button
                        onClick={() => navigate('/project')}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer w-full sm:w-auto"
                    >
                        <span>View Projects</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Feature highlight mini-cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-8 text-left">
                    <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-xs">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2.5">
                            <Kanban className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">Dynamic Kanban</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Drag-and-drop workflow tracking across stages.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-xs">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">Visual Analytics</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Real-time completion rates and workload metrics.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-xs">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-2.5">
                            <Users className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">Instant Collaboration</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Comments, live notifications and role delegation.</p>
                    </div>
                </div>

                {showModal && (
                    <CreateProject onClose={() => setShowModal(false)} />
                )}
            </div>
        </div>
    );
}

export default LandingPage;