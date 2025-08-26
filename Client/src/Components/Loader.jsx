export default function Loader() {
    return (
        <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Loading ...</p>
            </div>
        </div>
    )

}