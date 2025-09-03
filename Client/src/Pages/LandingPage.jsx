import { useContext, useEffect, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";
import CreateProject from "./CreateProject";

function LandingPage() {
    const { showModal, setShowModal } = useContext(AppContext);
 
    return (
        <div className="flex flex-col justify-center items-center w-full min-h-screen px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-4 right-4 sm:top-10 sm:right-10 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-blue-100 rounded-full opacity-20"></div>
            <div className="absolute bottom-8 left-4 sm:bottom-20 sm:left-10 w-12 h-12 sm:w-18 sm:h-18 lg:w-24 lg:h-24 bg-blue-200 rounded-full opacity-15"></div>

            <div className="text-center z-10 max-w-4xl w-full">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                    Build Your Project
                </h1>
                <p className="text-gray-500 text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 lg:mb-12 max-w-md mx-auto px-4">
                    Start creating something amazing today. Your next great project is just one click away.
                </p>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 sm:px-8 sm:py-3 lg:px-12 lg:py-4 text-base sm:text-lg lg:text-xl font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer w-full sm:w-auto max-w-xs sm:max-w-none"
                >
                    Create Project
                </button>

                {showModal && (
                    <CreateProject onClose={() => setShowModal(false)} />
                )}
            </div>
        </div>
    );
}

export default LandingPage;