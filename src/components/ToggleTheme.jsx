"use client"

import { useEffect, useState } from "react"

const ThemeToggle = ({ theme, setTheme }) => {
  const [isLight, setIsLight] = useState(() => {
    return theme === "light"
  })

  useEffect(() => {
    setIsLight(theme === "light")
  }, [theme])

  const handleToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return (
    <button
      onClick={handleToggle}
      className="relative w-14 h-8 flex items-center bg-white/10 border border-white/20 rounded-full px-1 transition-all duration-300 hover:shadow-inner hover:scale-110"
      title="Toggle Theme"
    >
      <div
        className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-300 transform flex items-center justify-center ${
          isLight ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isLight ? (
          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </div>
    </button>
  )
}

export default ThemeToggle
