'use client';

import { useState } from "react";
import { wizardQuestions, WizardQuestion } from "../utils/wizardQuestions";
import { useChat } from "../context/ChatContext";

export default function Wizard() {
  const { state, dispatch } = useChat();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  // Filtrar preguntas condicionales
  const visibleQuestions = wizardQuestions.filter(
    q => !q.condition || q.condition(answers)
  );
  const current = visibleQuestions[step];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setAnswers({ ...answers, [current.id]: e.target.value });
    setError(null);
  }

  function validateAndNext() {
    if (current.required && !answers[current.id]) {
      setError("Este campo es obligatorio");
      return;
    }
    if (current.validate) {
      const err = current.validate(answers[current.id] || "", answers);
      if (err) {
        setError(err);
        return;
      }
    }
    setError(null);
    if (step < visibleQuestions.length - 1) {
      setStep(step + 1);
    } else {
      // Finalizar wizard: aquí podrías despachar al contexto o mostrar resumen
      alert("¡Postulación completada! (solo frontend)");
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function renderInput(q: WizardQuestion) {
    const baseClass =
      "w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 bg-white/90 text-gray-800";
    switch (q.type) {
      case "textarea":
        return (
          <textarea
            className={baseClass + " resize-none min-h-[80px]"}
            value={answers[q.id] || ""}
            onChange={handleChange}
            rows={3}
          />
        );
      case "select":
        return (
          <select
            className={baseClass}
            value={answers[q.id] || ""}
            onChange={handleChange}
          >
            <option value="">Selecciona una opción</option>
            {q.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case "yesno":
        return (
          <select
            className={baseClass}
            value={answers[q.id] || ""}
            onChange={handleChange}
          >
            <option value="">Selecciona una opción</option>
            <option value="sí">Sí</option>
            <option value="no">No</option>
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            className={baseClass}
            value={answers[q.id] || ""}
            onChange={handleChange}
          />
        );
      case "email":
        return (
          <input
            type="email"
            className={baseClass}
            value={answers[q.id] || ""}
            onChange={handleChange}
          />
        );
      case "phone":
        return (
          <input
            type="tel"
            className={baseClass}
            value={answers[q.id] || ""}
            onChange={handleChange}
          />
        );
      case "ci":
        return (
          <input
            type="text"
            className={baseClass}
            value={answers[q.id] || ""}
            onChange={handleChange}
            maxLength={8}
          />
        );
      default:
        return (
          <input
            type="text"
            className={baseClass}
            value={answers[q.id] || ""}
            onChange={handleChange}
          />
        );
    }
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl shadow-lg p-7 mt-8 bg-gradient-to-br from-white via-purple-50 to-blue-50 border border-gray-100">
      <h2 className="text-xl font-bold mb-3 text-purple-800 text-center tracking-tight">Asistente de Postulación</h2>
      <div className="mb-4">
        <div className="font-semibold mb-2 text-gray-700 text-base">{current.question}</div>
        {renderInput(current)}
        {error && <div className="text-red-500 mt-2 text-xs animate-pulse">{error}</div>}
      </div>
      <div className="flex justify-between mt-5">
        <button
          className="px-4 py-2 bg-gray-200 rounded-lg font-semibold text-gray-500 hover:bg-gray-300 transition-all duration-150 disabled:opacity-50"
          onClick={handleBack}
          disabled={step === 0}
        >
          Volver
        </button>
        <button
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-purple-600 transition-all duration-150"
          onClick={validateAndNext}
        >
          {step < visibleQuestions.length - 1 ? "Siguiente" : "Finalizar"}
        </button>
      </div>
      <div className="text-xs text-gray-400 text-center mt-5">
        Pregunta {step + 1} de {visibleQuestions.length}
      </div>
    </div>
  );
} 