export type WizardQuestion = {
  id: string;
  question: string;
  type: "text" | "email" | "phone" | "ci" | "select" | "textarea" | "number" | "yesno";
  required?: boolean;
  options?: string[];
  validate?: (value: string, allAnswers: Record<string, string>) => string | null;
  condition?: (allAnswers: Record<string, string>) => boolean;
};

export const wizardQuestions: WizardQuestion[] = [
  {
    id: "nombre",
    question: "¿Cuál es tu nombre completo?",
    type: "text",
    required: true,
    validate: v => v.trim().length < 3 ? "El nombre es demasiado corto" : null,
  },
  {
    id: "email",
    question: "¿Cuál es tu correo electrónico?",
    type: "email",
    required: true,
    validate: v =>
      !/^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,})$/.test(v)
        ? "Correo inválido"
        : null,
  },
  {
    id: "telefono",
    question: "¿Cuál es tu teléfono de contacto?",
    type: "phone",
    required: true,
    validate: v =>
      !/^\d{8,12}$/.test(v) ? "Debe tener entre 8 y 12 dígitos" : null,
  },
  {
    id: "ci",
    question: "¿Cuál es tu cédula de identidad?",
    type: "ci",
    required: true,
    validate: v => validateUruguayanCI(v),
  },
  {
    id: "emprendimiento",
    question: "¿Cómo se llama tu emprendimiento?",
    type: "text",
    required: true,
    validate: v => v.trim().length < 3 ? "Nombre muy corto" : null,
  },
  {
    id: "descripcion",
    question: "Describe brevemente tu emprendimiento.",
    type: "textarea",
    required: true,
    validate: v => v.trim().length < 10 ? "Descripción muy corta" : null,
  },
  {
    id: "etapa",
    question: "¿En qué etapa está tu emprendimiento?",
    type: "select",
    required: true,
    options: [
      "Idea",
      "Prototipo",
      "Ventas iniciales",
      "Crecimiento",
      "Otro",
    ],
  },
  {
    id: "vinculoUCU",
    question: "¿Tienes algún vínculo con la UCU?",
    type: "yesno",
    required: true,
  },
  {
    id: "tipoVinculoUCU",
    question: "¿Cuál es tu vínculo con la UCU?",
    type: "select",
    required: true,
    options: ["Estudiante", "Egresado/a", "Docente", "Funcionario/a", "Otro"],
    condition: answers => answers["vinculoUCU"] === "sí",
  },
  {
    id: "equipo",
    question: "¿Cuántas personas integran el equipo?",
    type: "number",
    required: true,
    validate: v => isNaN(Number(v)) || Number(v) < 1 ? "Debe ser un número válido" : null,
  },
  {
    id: "problema",
    question: "¿Qué problema resuelve tu emprendimiento?",
    type: "textarea",
    required: true,
    validate: v => v.trim().length < 10 ? "Respuesta muy corta" : null,
  },
  {
    id: "valor",
    question: "¿Cuál es tu propuesta de valor?",
    type: "textarea",
    required: true,
    validate: v => v.trim().length < 10 ? "Respuesta muy corta" : null,
  },
  {
    id: "apoyoPrevio",
    question: "¿Has recibido apoyo previo de incubadoras o aceleradoras?",
    type: "yesno",
    required: true,
  },
  {
    id: "motivoPostulacion",
    question: "¿Por qué quieres postularte a Ithaka?",
    type: "textarea",
    required: true,
    validate: v => v.trim().length < 10 ? "Respuesta muy corta" : null,
  },
];

// Validación de cédula uruguaya (dígito verificador)
function validateUruguayanCI(ci: string): string | null {
  ci = ci.replace(/\D/g, "");
  if (ci.length < 7 || ci.length > 8) return "Cédula inválida";
  let a = 0, i = 0;
  if (ci.length === 7) ci = "0" + ci;
  for (i = 0; i < 7; i++) a += (parseInt("2987634"[i]) * parseInt(ci[i])) % 10;
  let check = a % 10 === 0 ? 0 : 10 - (a % 10);
  return check === parseInt(ci[7]) ? null : "Cédula inválida";
} 