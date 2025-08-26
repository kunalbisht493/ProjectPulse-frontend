import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from 'axios';
import { showError, showSuccess } from "../Utils/Toast";
import Loader from "../Components/Loader";

function VerifyEmail() {
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Get email from navigation state
    const email = location.state?.email;
    // Get token from URL params (when user clicks email link)
    const token = searchParams.get('token');

    useEffect(() => {
        // If no email provided, redirect to auth
        if (!email && !token) {
            navigate("/auth");
        }
    }, [email, token, navigate]);

    useEffect(() => {
        // If there's a token in URL, verify automatically
        if (token) {
            handleTokenVerification();
        }
    }, [token]);

    useEffect(() => {
        // Countdown timer for resend button
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleTokenVerification = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:4000/api/v1/verify-email?token=${encodeURIComponent(token)}`, {
                token: token
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            console.log('verify',res.data)

            showSuccess("Email verified successfully! Redirecting to login...");
            setIsVerified(true);
            setLoading(false);

            // Redirect to auth page after a brief delay
            setTimeout(() => {
                navigate("/auth");
            }, 2000);

        } catch (err) {
            showError(err.response?.data?.message || "Verification failed");
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResendLoading(true);
            await axios.post("http://localhost:4000/api/v1/resend-verification", {
                email: email
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            showSuccess("Verification link sent successfully!");
            setResendLoading(false);
            setCountdown(60); // 60 second countdown

        } catch (err) {
            showError(err.response?.data?.message || "Failed to resend link");
            setResendLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-gradient-to-tr from-purple-300/15 to-blue-300/15 rounded-full blur-xl"></div>

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}>
                </div>

                {/* Floating elements */}
                <div className="absolute top-20 left-20 w-4 h-4 bg-blue-300/40 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-40 w-3 h-3 bg-indigo-300/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-40 left-40 w-2 h-2 bg-purple-300/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 right-20 w-5 h-5 bg-blue-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="relative w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-xl border border-blue-200/50 z-10 p-8">
                {isVerified ? (
                    // Success state when verified through link
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h1>
                        <p className="text-gray-600 text-sm">
                            Your email has been successfully verified. Redirecting to login...
                        </p>
                    </div>
                ) : (
                    // Waiting for verification state
                    <>
                        <div className="text-center mb-8">
                            {/* Email verification icon */}
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h1>
                            <p className="text-gray-600 text-sm mb-2">
                                We've sent a verification link to
                            </p>
                            <p className="text-blue-600 font-medium text-sm mb-4">
                                {email}
                            </p>
                            <p className="text-gray-500 text-xs">
                                Click the link in your email to verify your account
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="text-xs text-blue-700">
                                        <p className="font-medium mb-1">Check your email</p>
                                        <p>Click the verification link we sent to complete your registration</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600 text-sm mb-3">
                                Didn't receive the email?
                            </p>

                            {countdown > 0 ? (
                                <p className="text-gray-500 text-sm">
                                    Resend available in {countdown} seconds
                                </p>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    disabled={resendLoading || countdown > 0}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resendLoading ? "Sending..." : "Resend Link"}
                                </button>
                            )}
                        </div>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => navigate("/auth")}
                                className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;