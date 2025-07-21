// export default function Chatbot() {
//   return <h2>Chatbot Organizer Page</h2>
// }
export default function Chatbot() {
  return (
    <div style={{ height: "100vh", width: "100%", border: "none" }}>
      <iframe
        src="https://edubot-ysvm.onrender.com"
        title="EduBot Chatbot"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        allow="microphone; clipboard-read; clipboard-write"
      ></iframe>
    </div>
  );
}
