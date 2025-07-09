import React from "react";

export default function Timer() {
  return (
    <div className="p-4 h-screen overflow-hidden">
      <iframe
        src="/pomo.html"
        title="Pomodoro Timer"
        className="w-full h-full rounded-xl shadow-xl border-2 border-yellow-800"
      />
    </div>
  );
}