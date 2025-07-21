"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"
import { requestNotificationPermission } from "../utils/notify"
import { checkAndSendReminders } from "../utils/reminderChecker"
import ToggleTheme from "./ToggleTheme"

const Dashboard = ({ role }) => {
  const navigate = useNavigate()

  // Initialize theme from localStorage or default to light
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light"
    }
    return "light"
  })

  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [visibleCards, setVisibleCards] = useState(new Set())
  const cardRefs = useRef([])

  // Apply theme to document on mount and theme change
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest(".notification-container")) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showNotifications])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate("/login")
    } else {
      console.error("Logout failed:", error.message)
    }
  }

  const studentOptions = [
    {
      label: "📤 Upload Notes",
      path: "/notes/upload",
      description: "Upload, organize and manage your study notes efficiently",
      icon: "📋",
    },
    {
      label: "📚 View Notes",
      path: "/notes/view",
      description: "Access and review all your uploaded notes in one place",
      icon: "📊",
    },
    {
      label: "🤖 Chatbot / AI Assistant",
      path: "/chatbot",
      description: "Get instant help and answers from our AI assistant",
      icon: "⚡",
    },
    {
      label: "🔗 Save Links",
      path: "/links",
      description: "Save and organize important links and resources",
      icon: "🎯",
    },
    { label: "📝 To-Do List", path: "/todo", description: "Keep track of your tasks and stay organized", icon: "✅" },
    {
      label: "⏱️ Set Timer",
      path: "/timer",
      description: "Use Pomodoro technique and time management tools",
      icon: "⏰",
    },
    {
      label: "🗓️ Academic Calendar",
      path: "/calendar",
      description: "Manage your academic schedule and deadlines",
      icon: "📅",
    },
  ]

  const teacherOptions = [
    {
      label: "🗓️ Academic Calendar",
      path: "/calendar",
      description: "Manage academic schedules and important dates",
      icon: "📅",
    },
  ]

  const options = role === "authority" ? teacherOptions : studentOptions

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.dataset.index)
            setVisibleCards((prev) => new Set([...prev, index]))
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let interval
    const setupNotifications = async () => {
      if (role === "authority") return
      const granted = await requestNotificationPermission()
      if (!granted) {
        console.warn("🚫 Notification permission denied")
        return
      } else {
        console.log("✅ Notification permission granted")
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        interval = setInterval(() => {
          checkAndSendReminders(user.id)
        }, 60000)
      }
    }
    setupNotifications()
    return () => clearInterval(interval)
  }, [role])

  useEffect(() => {
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
      if (!error) {
        setNotifications(data)
      } else {
        console.error("🔔 Notification fetch failed:", error.message)
      }
    }
    fetchNotifications()
  }, [])

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(8px) rotate(-1deg); }
          66% { transform: translateY(-6px) rotate(1deg); }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        .float-animation-reverse {
          animation: floatReverse 8s ease-in-out infinite;
        }
        
        .slide-in-up {
          animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .card-hidden {
          opacity: 0;
          transform: translateY(60px) scale(0.95);
        }
        
        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        
        .floating-shape {
          position: absolute;
          border-radius: 50%;
        }
        
        .shape-1 {
          width: 80px;
          height: 80px;
          top: 20%;
          left: 10%;
          background: linear-gradient(45deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15));
          animation: float 8s ease-in-out infinite;
        }
        
        .shape-2 {
          width: 120px;
          height: 120px;
          top: 60%;
          right: 15%;
          background: linear-gradient(45deg, rgba(139, 92, 246, 0.12), rgba(168, 85, 247, 0.12));
          animation: floatReverse 10s ease-in-out infinite;
        }
        
        .shape-3 {
          width: 60px;
          height: 60px;
          top: 40%;
          left: 80%;
          background: linear-gradient(45deg, rgba(196, 181, 253, 0.18), rgba(221, 214, 254, 0.18));
          animation: float 7s ease-in-out infinite;
        }
        
        .shape-4 {
          width: 100px;
          height: 100px;
          top: 10%;
          right: 40%;
          background: linear-gradient(45deg, rgba(167, 139, 250, 0.14), rgba(196, 181, 253, 0.14));
          animation: floatReverse 9s ease-in-out infinite;
        }
        
        .shape-5 {
          width: 90px;
          height: 90px;
          top: 70%;
          left: 30%;
          background: linear-gradient(45deg, rgba(221, 214, 254, 0.16), rgba(233, 213, 255, 0.16));
          animation: float 11s ease-in-out infinite;
        }
        
        .shape-6 {
          width: 70px;
          height: 70px;
          top: 15%;
          left: 60%;
          background: linear-gradient(45deg, rgba(233, 213, 255, 0.13), rgba(243, 232, 255, 0.13));
          animation: floatReverse 6s ease-in-out infinite;
        }
      `}</style>

      <div
        className={`min-h-screen transition-colors duration-500 ${
          theme === "dark" ? "dark bg-gray-900" : "bg-gradient-to-br from-violet-50 via-white to-purple-50"
        }`}
      >
        {/* ===================== 🔝 Header with Dynamic Theme Colors ===================== */}
        <header
          className={`relative flex justify-between items-center px-6 py-4 shadow-2xl overflow-hidden transition-all duration-500 ${
            theme === "dark"
              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700"
              : "bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400"
          }`}
        >
          {/* Floating Background Shapes */}
          <div className="floating-shapes">
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
            <div className="floating-shape shape-4"></div>
            <div className="floating-shape shape-5"></div>
            <div className="floating-shape shape-6"></div>
          </div>

          {/* 📌 Left Side - Logo, Title and Controls */}
          <div className="flex items-center space-x-6 relative z-10">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-lg shadow-lg">
                D
              </div>
              <span className="text-white font-bold text-xl">Dashboard</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-4">
              {/* 🌗 Theme Toggle */}
              <ToggleTheme theme={theme} setTheme={setTheme} />

              {/* 🔔 Notifications Button */}
              <div className="relative notification-container">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-white relative hover:text-gray-200 p-2 rounded-lg transition-all duration-300 hover:scale-110"
                  title="Notifications"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C8.67 6.165 8 7.388 8 8.75v5.408c0 .538-.214 1.055-.595 1.437L6 17h9z"
                    />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* 🔽 Notification Dropdown - Repositioned */}
                {showNotifications && (
                  <div
                    className={`absolute left-0 mt-2 w-80 shadow-2xl rounded-xl border slide-in-up ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white/95 backdrop-blur-sm border-violet-200"
                    }`}
                    style={{
                      zIndex: 99999,
                      position: "fixed",
                      top: "70px",
                      left: "200px",
                    }}
                  >
                    <div
                      className={`p-4 font-semibold border-b ${
                        theme === "dark" ? "text-gray-200 border-gray-700" : "text-violet-900 border-violet-200"
                      }`}
                    >
                      Notifications
                    </div>
                    {notifications.length > 0 ? (
                      <ul className="max-h-64 overflow-y-auto">
                        {notifications.map((note) => (
                          <li
                            key={note.id}
                            className={`px-4 py-3 text-sm cursor-pointer border-b last:border-b-0 transition-colors duration-200 ${
                              theme === "dark"
                                ? "text-gray-300 hover:bg-gray-700 border-gray-700"
                                : "text-violet-800 hover:bg-violet-50 border-violet-100"
                            }`}
                          >
                            {note.message}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div
                        className={`px-4 py-6 text-sm text-center ${
                          theme === "dark" ? "text-gray-400" : "text-violet-500"
                        }`}
                      >
                        No new notifications
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ⚙️ Settings Button */}
              <button
                onClick={() => navigate("/reminder-settings")}
                title="Reminder Preferences"
                className="text-white hover:text-gray-200 p-2 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 📌 Right Side - Logout Button */}
          <div className="flex items-center relative z-10 mr-8">
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Logout
            </button>
          </div>
        </header>

         {/* ===================== 💬 Hero Section with Enhanced Light Theme ===================== */}
        <div
          className={`relative text-center py-20 px-4 md:px-12 transition-colors duration-500 overflow-hidden ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 text-gray-200"
              : "bg-gradient-to-br from-violet-50 via-white to-purple-50 text-violet-900"
          }`}
        >
          {/* Enhanced Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-violet-300/20 to-purple-300/20 rounded-full float-animation"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-indigo-300/20 to-violet-300/20 rounded-full float-animation-reverse"></div>
            <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full float-animation"></div>
            <div className="absolute bottom-32 right-1/3 w-28 h-28 bg-gradient-to-r from-violet-400/20 to-indigo-400/20 rounded-full float-animation-reverse"></div>
            <div className="absolute top-60 left-1/2 w-16 h-16 bg-gradient-to-r from-purple-200/25 to-violet-200/25 rounded-full float-animation"></div>
            <div className="absolute bottom-40 right-10 w-36 h-36 bg-gradient-to-r from-indigo-200/15 to-purple-200/15 rounded-full float-animation-reverse"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to your Dashboard
            </h1>
            <p
              className={`text-xl md:text-2xl max-w-4xl mx-auto ${
                theme === "dark" ? "text-gray-400" : "text-violet-700"
              }`}
            >
              Manage your tasks, track your progress, and stay organized with our powerful dashboard tools.
            </p>
          </div>
        </div>

        {/* ===================== 🧩 Enhanced Options Grid ===================== */}
        <div
          className={`max-w-7xl mx-auto px-6 pb-20 pt-10 transition-colors duration-500 ${
            theme === "dark" ? "bg-gray-900" : "bg-gradient-to-b from-white to-violet-50"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {options.map((opt, index) => (
              <div
                key={opt.path}
                ref={(el) => (cardRefs.current[index] = el)}
                data-index={index}
                className={`transition-all duration-700 ease-out ${
                  visibleCards.has(index) ? "slide-in-up" : "card-hidden"
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <button
                  onClick={() => navigate(opt.path)}
                  className={`group relative border rounded-3xl p-8 text-left transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 min-h-[320px] flex flex-col w-full ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-purple-500"
                      : "bg-white/80 backdrop-blur-sm border-violet-200 hover:bg-white hover:border-purple-400 shadow-lg hover:shadow-violet-200/50"
                  }`}
                >
                  {/* 🎨 Enhanced Gradient Overlay */}
                  <div
                    className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-purple-500/5 to-pink-500/5"
                        : "bg-gradient-to-br from-violet-500/5 to-purple-500/5"
                    }`}
                  />

                  {/* 🎬 Animation Space - Top Section */}
                  <div className="relative mb-6 flex-shrink-0">
                    <div
                      className={`w-full h-36 rounded-2xl flex items-center justify-center overflow-hidden group-hover:shadow-lg transition-shadow duration-300 ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-gray-700 to-gray-600"
                          : "bg-gradient-to-br from-violet-100 to-purple-100"
                      }`}
                    >
                      <div
                        className={`w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                          index % 4 === 0
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : index % 4 === 1
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                              : index % 4 === 2
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : "bg-gradient-to-r from-orange-500 to-red-500"
                        }`}
                      >
                        <span className="filter drop-shadow-lg">
                          {opt.icon ||
                            (index % 4 === 0 ? "📋" : index % 4 === 1 ? "📊" : index % 4 === 2 ? "⚡" : "🎯")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 🧾 Content Section */}
                  <div className="relative flex-grow flex flex-col justify-between">
                    <div>
                      <h3
                        className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                          theme === "dark"
                            ? "text-gray-200 group-hover:text-purple-400"
                            : "text-violet-900 group-hover:text-purple-600"
                        }`}
                      >
                        {opt.label}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed transition-colors duration-300 ${
                          theme === "dark"
                            ? "text-gray-400 group-hover:text-gray-300"
                            : "text-violet-700 group-hover:text-violet-800"
                        }`}
                      >
                        {opt.description}
                      </p>
                    </div>

                    {/* ➡️ Arrow Icon with Animation */}
                    <div className="flex justify-end mt-6">
                      <div
                        className={`transition-all duration-300 group-hover:translate-x-2 ${
                          theme === "dark"
                            ? "text-gray-500 group-hover:text-purple-400"
                            : "text-violet-400 group-hover:text-purple-600"
                        }`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ===================== 🦶 Enhanced Footer Section ===================== */}
        <footer
          className={`border-t transition-colors duration-500 ${
            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white/90 backdrop-blur-sm border-violet-200"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                    D
                  </div>
                  <span className={`text-xl font-bold ${theme === "dark" ? "text-gray-200" : "text-violet-900"}`}>
                    Dashboard
                  </span>
                </div>
                <p className={`mb-4 max-w-md ${theme === "dark" ? "text-gray-400" : "text-violet-700"}`}>
                  Your all-in-one academic companion. Manage notes, track progress, and achieve your goals with our
                  powerful dashboard tools.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className={`transition-colors duration-300 hover:scale-110 ${
                      theme === "dark" ? "text-gray-400 hover:text-purple-400" : "text-violet-400 hover:text-purple-600"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className={`transition-colors duration-300 hover:scale-110 ${
                      theme === "dark" ? "text-gray-400 hover:text-purple-400" : "text-violet-400 hover:text-purple-600"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className={`transition-colors duration-300 hover:scale-110 ${
                      theme === "dark" ? "text-gray-400 hover:text-purple-400" : "text-violet-400 hover:text-purple-600"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3
                  className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                    theme === "dark" ? "text-gray-200" : "text-violet-900"
                  }`}
                >
                  Quick Links
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className={`transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-purple-400"
                          : "text-violet-600 hover:text-purple-600"
                      }`}
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={`transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-purple-400"
                          : "text-violet-600 hover:text-purple-600"
                      }`}
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={`transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-purple-400"
                          : "text-violet-600 hover:text-purple-600"
                      }`}
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={`transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-purple-400"
                          : "text-violet-600 hover:text-purple-600"
                      }`}
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3
                  className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                    theme === "dark" ? "text-gray-200" : "text-violet-900"
                  }`}
                >
                  Support
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className={`transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-purple-400"
                          : "text-violet-600 hover:text-purple-600"
                      }`}
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={`transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-purple-400"
                          : "text-violet-600 hover:text-purple-600"
                      }`}
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={`transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-purple-400"
                          : "text-violet-600 hover:text-purple-600"
                      }`}
                    >
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={`transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-purple-400"
                          : "text-violet-600 hover:text-purple-600"
                      }`}
                    >
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Footer */}
            <div
              className={`border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center ${
                theme === "dark" ? "border-gray-700" : "border-violet-200"
              }`}
            >
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-violet-600"}`}>
                © 2024 Dashboard. All rights reserved.
              </p>
              <p className={`text-sm mt-2 md:mt-0 ${theme === "dark" ? "text-gray-400" : "text-violet-600"}`}>
                Made with ❤️ for students everywhere
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default Dashboard
