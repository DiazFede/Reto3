'use client';

// import { CopilotChat } from "@copilotkit/react-ui";
import { useChat } from "../context/ChatContext";

export default function ChatWidget() {
  const { state } = useChat();

  return (
    <section className="w-full max-w-md mx-auto rounded-2xl shadow-lg p-7 mt-10 bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-gray-100">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 shadow">
          <span className="text-4xl text-blue-500">💬</span>
        </div>
        <h2 className="text-xl font-bold mb-1 text-blue-800 text-center tracking-tight">Ithaka AI – Chat (Demo Visual)</h2>
        <div className="text-gray-600 text-center mb-3 text-base">
          Aquí irá el chat asistido por IA.<br />
          <span className="text-xs text-purple-400">(Integración CopilotKit disponible en la siguiente fase)</span>
        </div>
        {state.messages.length === 0 && (
          <div className="text-gray-400 text-center mt-1 italic">No hay mensajes aún. ¡Comienza la conversación!</div>
        )}
      </div>
    </section>
  );
} 