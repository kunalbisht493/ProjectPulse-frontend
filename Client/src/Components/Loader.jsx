export default function Loader() {
    return (
        <div className="w-full h-full min-h-[60vh] flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3.5">
                <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-3 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                    <div className="w-4 h-4 rounded-full bg-indigo-600/20 absolute animate-ping"></div>
                </div>
                <p className="text-slate-500 font-medium text-xs tracking-wider uppercase animate-pulse">Loading Workspace...</p>
            </div>
        </div>
    );
}