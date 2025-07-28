'use client';

import { useState, useRef } from "react";
import { wizardQuestions } from "../utils/wizardQuestions";
import jsPDF from "jspdf";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: wizardQuestions[0].question, qIdx: 0 }
  ]);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showFaq, setShowFaq] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  // Respuestas automáticas por pregunta
  const autoReplies: Record<string, string> = {
    nombre: "¡Encantado de conocerte!",
    email: "¡Perfecto, te contactaremos por ese correo!",
    telefono: "¡Gracias, tomamos nota de tu teléfono!",
    ci: "Cédula registrada.",
    emprendimiento: "¡Suena interesante!",
    descripcion: "Gracias por la descripción.",
    etapa: "Entendido, etapa registrada.",
    vinculoUCU: "Gracias por la información.",
    tipoVinculoUCU: "Vínculo registrado.",
    equipo: "¡Buen equipo!",
    problema: "Problema registrado.",
    valor: "Propuesta de valor anotada.",
    apoyoPrevio: "Gracias por compartirlo.",
    motivoPostulacion: "¡Gran motivación!"
  };

  const faqs = [
    {
      q: "¿Qué es el Centro Ithaka?",
      a: "Somos Institución Patrocinadora de Emprendimientos (IPE) frente a la ANII y ANDE. Articulamos iniciativas para promover la innovación y el emprendimiento en la comunidad universitaria, logrando que Ithaka sea una referencia internacional en innovación de modelo universitario."
    },
    {
      q: "¿Qué hacemos?",
      a: "Hacemos talleres, eventos, dictamos cursos curriculares y no curriculares y facilitamos experiencias que acercan a nuestra comunidad universitaria al ecosistema de emprendedurismo e innovación."
    }
  ];

  const currentQ = wizardQuestions[step];

  // Cambia el flujo inicial: muestra bienvenida y opciones
  function handleStartWizard() {
    setShowWelcome(false);
    setShowFaq(false);
    setMessages([
      { id: 1, role: "assistant", content: wizardQuestions[0].question, qIdx: 0 }
    ]);
    setStep(0);
    setInput("");
  }
  function handleShowFaq() {
    setShowFaq(true);
  }

  // Al enviar la primera respuesta, ocultar FAQ
  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    if (currentQ.required && !input.trim()) {
      setError("Este campo es obligatorio");
      return;
    }
    if (currentQ.validate) {
      const err = currentQ.validate(input, answers);
      if (err) {
        setError(err);
        return;
      }
    }
    setError(null);
    if (showFaq) setShowFaq(false);
    // Guardar respuesta
    const userMsg = { id: Date.now(), role: "user", content: input };
    setMessages(msgs => [...msgs, userMsg]);
    setAnswers(ans => ({ ...ans, [currentQ.id]: input }));
    setInput("");
    setTimeout(() => {
      // Buscar próxima pregunta condicional
      let nextStep = step + 1;
      while (nextStep < wizardQuestions.length) {
        const q = wizardQuestions[nextStep];
        if (!q.condition || q.condition({ ...answers, [currentQ.id]: input })) break;
        nextStep++;
      }
      // Respuesta automática
      setMessages(msgs => [
        ...msgs,
        { id: Date.now() + 10, role: "assistant", content: autoReplies[currentQ.id] || "Respuesta registrada." }
      ]);
      if (nextStep < wizardQuestions.length) {
        setTimeout(() => {
          setStep(nextStep);
          setMessages(msgs => [
            ...msgs,
            { id: Date.now() + 20, role: "assistant", content: wizardQuestions[nextStep].question, qIdx: nextStep }
          ]);
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 700);
      } else {
        setTimeout(() => {
          setShowSummary(true);
          setMessages(msgs => [
            ...msgs,
            { id: Date.now() + 30, role: "assistant", content: "¡Gracias por completar la postulación! Aquí tienes un resumen de tus respuestas:" }
          ]);
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 700);
      }
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 600);
  }

  // Permitir editar respuestas desde el resumen
  function handleEdit(qIdx: number) {
    setEditingIdx(qIdx);
    setInput(answers[wizardQuestions[qIdx].id] || "");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
  }
  function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    const q = wizardQuestions[editingIdx!];
    if (q.required && !input.trim()) {
      setError("Este campo es obligatorio");
      return;
    }
    if (q.validate) {
      const err = q.validate(input, answers);
      if (err) {
        setError(err);
        return;
      }
    }
    setError(null);
    setAnswers(ans => ({ ...ans, [q.id]: input }));
    setEditingIdx(null);
    setInput("");
  }

  function downloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Resumen de Postulación", 10, 15);
    doc.setFontSize(12);
    let y = 30;
    wizardQuestions.forEach(q => {
      doc.text(q.question, 10, y);
      y += 7;
      doc.text(answers[q.id] || "-", 15, y);
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("postulacion_resumen.pdf");
  }

  // Render input según tipo de pregunta
  function renderInput() {
    if (!currentQ) return null;
    if (currentQ.type === "select" || currentQ.type === "yesno") {
      const opts = currentQ.type === "yesno" ? ["sí", "no"] : currentQ.options || [];
      return (
        <select
          className="flex-1 px-4 py-2 rounded-bl-2xl focus:outline-none text-gray-800 border"
          value={input}
          onChange={e => setInput(e.target.value)}
        >
          <option value="">Selecciona una opción</option>
          {opts.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    return (
      <input
        className="flex-1 px-4 py-2 rounded-bl-2xl focus:outline-none text-gray-800"
        type={currentQ.type === "number" ? "number" : currentQ.type === "email" ? "email" : "text"}
        placeholder="Escribe tu respuesta..."
        value={input}
        onChange={e => setInput(e.target.value)}
        autoFocus
      />
    );
  }

  // Solo permitir enviar si hay pregunta activa
  const isWizardDone = step >= wizardQuestions.length;

  return (
    <div>
      <button
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 shadow-lg flex items-center justify-center text-3xl focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir chat"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-28 right-8 z-50 w-[540px] max-w-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col" style={{ maxHeight: 800 }}>
          <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-2xl flex items-center justify-between sticky top-0 z-10" style={{boxShadow: '0 2px 8px #0001'}}>
            <span className="font-bold text-blue-800 text-lg">Popup Assistant</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-5 pt-8 space-y-5 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 bg-white" style={{ maxHeight: 650, scrollBehavior: 'smooth', borderRadius: '0 0 1rem 1rem' }}>
            {showWelcome && (
              <div className="mb-6 bg-blue-50 rounded-2xl p-6 shadow flex flex-col items-center text-center border border-blue-100">
                <div className="font-bold text-2xl text-blue-800 mb-2">¡Hola! Soy el asistente de Ithaka</div>
                <div className="text-gray-700 mb-6 text-base">¿En qué puedo ayudarte hoy? Puedes consultar nuestras preguntas frecuentes o comenzar tu postulación.</div>
                <div className="flex gap-4">
                  <button onClick={handleStartWizard} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-base shadow">Comenzar postulación</button>
                  <button onClick={handleShowFaq} className="px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-bold text-base shadow">Ver preguntas frecuentes</button>
                </div>
              </div>
            )}
            {showFaq && (
              <div className="mb-6 bg-purple-50 rounded-2xl p-6 shadow border border-purple-100">
                <div className="font-bold text-xl text-purple-800 mb-3">Preguntas Frecuentes</div>
                <ul className="space-y-4">
                  {faqs.map((faq, i) => (
                    <li key={i}>
                      <div className="font-semibold text-blue-700 text-lg mb-1">{faq.q}</div>
                      <div className="text-gray-700 text-base">{faq.a}</div>
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-gray-400 mt-4">Puedes comenzar la postulación cuando quieras.</div>
                <button onClick={handleStartWizard} className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-base shadow">Comenzar postulación</button>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-2 rounded-xl text-sm shadow ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {showSummary && (
              <div className="bg-blue-50 rounded-xl p-3 mt-2 text-sm text-gray-700">
                <div className="font-bold mb-2">Resumen de tus respuestas:</div>
                <ul className="list-disc pl-5 space-y-2">
                  {wizardQuestions.map((q, idx) => (
                    <li key={q.id} className="mb-1">
                      <span className="font-semibold">{q.question}</span><br/>
                      {editingIdx === idx ? (
                        <form onSubmit={handleEditSave} className="flex gap-2 items-center mt-1">
                          {q.type === "select" || q.type === "yesno" ? (
                            <select
                              className="px-2 py-1 rounded border"
                              value={input}
                              onChange={e => setInput(e.target.value)}
                            >
                              <option value="">Selecciona una opción</option>
                              {(q.type === "yesno" ? ["sí", "no"] : q.options || []).map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className="px-2 py-1 rounded border"
                              type={q.type === "number" ? "number" : q.type === "email" ? "email" : "text"}
                              value={input}
                              onChange={e => setInput(e.target.value)}
                              autoFocus
                            />
                          )}
                          <button type="submit" className="px-2 py-1 bg-blue-600 text-white rounded">Guardar</button>
                          <button type="button" onClick={() => { setEditingIdx(null); setInput(""); }} className="px-2 py-1 bg-gray-200 rounded">Cancelar</button>
                        </form>
                      ) : (
                        <>
                          <span className="inline-block bg-white rounded px-2 py-1 shadow border border-gray-200 mr-2">{answers[q.id] || <span className='text-gray-400'>-</span>}</span>
                          <button onClick={() => handleEdit(idx)} className="text-xs text-blue-600 hover:underline ml-1">Editar</button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <button onClick={downloadPDF} className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold">Descargar PDF</button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {!isWizardDone && (
            <form onSubmit={handleSend} className="flex border-t border-gray-100">
              {renderInput()}
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-br-2xl font-bold">Enviar</button>
            </form>
          )}
          {error && <div className="text-red-500 text-xs px-5 pb-2">{error}</div>}
        </div>
      )}
    </div>
  );
} 