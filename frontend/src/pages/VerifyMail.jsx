import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const VerifyMail = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("failed");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const res = await axios.get("http://localhost:8001/user/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStatus("success");
        setMessage(res?.data?.message || "Email verified successfully.");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } catch (err) {
        setStatus("failed");
        setMessage(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Email verification failed."
        );
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-2">Email Verification</h2>
        <p
          className={
            status === "success"
              ? "text-green-600"
              : status === "failed"
                ? "text-red-600"
                : "text-gray-700"
          }
        >
          {message}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate("/home")}
            className="px-5 py-2 bg-white border rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyMail;