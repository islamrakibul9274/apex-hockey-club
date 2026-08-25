"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaPaperPlane, FaCheck } from "react-icons/fa6";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setPhone("");
        setMessage("");
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setErrorMsg(data.error || "Failed to send message.");
      }
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center space-y-3 my-8 py-8 border-dashed border-2 border-l-0 border-r-0 border-gray-200">
        <span className="badge badge-sm bg-red-100 text-[#FF4240] font-extrabold uppercase tracking-widest px-3 py-2">
          Concierge & Support
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Get In Touch
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Dit amet consectetur. Condimentum dignissim adipiscing aliquam turpis placerat <br className="hidden sm:inline" /> dolor. Purus urna in sit nullam proin.
        </p>
      </div>

      {/* Address Cards & Contact Form Container */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Info Cards */}
        <div className="p-6 sm:p-8 border-2 border-gray-100 rounded-3xl space-y-4 lg:w-[35%] flex flex-col justify-between bg-white shadow-sm">
          <div className="bg-[#dbf8ad]/60 p-6 space-y-2 rounded-2xl transition-all hover:scale-[1.02] border border-[#dbf8ad]">
            <Image
              src="/images/Group 1171275317.png"
              alt="Phone icon"
              width={44}
              height={44}
              className="w-11 h-11 object-contain"
            />
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Phone Number :</p>
            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900">(+62) 123-321-543</h3>
          </div>

          <div className="bg-[#fbefc1]/60 p-6 space-y-2 rounded-2xl transition-all hover:scale-[1.02] border border-[#fbefc1]">
            <Image
              src="/images/Group 1171275318.png"
              alt="Email icon"
              width={44}
              height={44}
              className="w-11 h-11 object-contain"
            />
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Email :</p>
            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900">hockeys@support.com</h3>
          </div>

          <div className="bg-[#b4cbec]/60 p-6 space-y-2 rounded-2xl transition-all hover:scale-[1.02] border border-[#b4cbec]">
            <Image
              src="/images/Group 1171275321.png"
              alt="Location icon"
              width={44}
              height={44}
              className="w-11 h-11 object-contain"
            />
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Location :</p>
            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900">152/1 Mohakhali Wireless Gate</h3>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:w-[65%] border-2 border-gray-100 rounded-3xl p-6 sm:p-8 bg-white shadow-sm flex flex-col justify-between">
          {success ? (
            <div className="my-auto py-12 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto shadow-inner">
                <FaCheck />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">Message Delivered!</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Thank you for contacting Apex Hockey Club. A training director or team representative will review your message and reach out shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {errorMsg && (
                <div className="alert alert-error text-xs text-white rounded-xl md:col-span-2">
                  {errorMsg}
                </div>
              )}

              <div className="form-control w-full">
                <label className="label text-xs font-bold text-gray-700">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input w-full bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label text-xs font-bold text-gray-700">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input w-full bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label text-xs font-bold text-gray-700">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Training camp inquiry, arena pass, etc."
                  className="input w-full bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label text-xs font-bold text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(+1) 555-0123"
                  className="input w-full bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                />
              </div>

              <div className="form-control w-full md:col-span-2">
                <label className="label text-xs font-bold text-gray-700">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="textarea w-full bg-gray-50 border border-gray-200 h-32 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                  placeholder="Describe your inquiry or program questions..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn text-white btn-block md:col-span-2 bg-[#FF4240] hover:bg-[#e03735] border-none text-base font-bold py-3 mt-2 rounded-xl shadow-lg shadow-red-500/20 flex items-center gap-2"
              >
                {loading ? "Sending..." : <><FaPaperPlane /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
