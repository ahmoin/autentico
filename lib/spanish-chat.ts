export type Difficulty = "easy" | "medium" | "hard";

export type Scenario = {
	id: string;
	name: string;
	icon: string;
	description: string;
	defaultUserRole: string;
	defaultAiRole: string;
	altUserRole: string;
	altAiRole: string;
};

export type DifficultyConfig = {
	maxMessages: number;
	guidanceLevel: "high" | "medium" | "none";
	vocabulary: "basic" | "intermediate" | "advanced";
	errorTolerance: "very_high" | "high" | "medium" | "low";
	detailLevel: number;
};

export type ChatConfig = {
	scenario: Scenario;
	userRole: string;
	aiRole: string;
	difficulty: Difficulty;
	difficultyConfig: DifficultyConfig;
	aiStarts: boolean;
};

export const SCENARIOS: Scenario[] = [
	{
		id: "restaurant",
		name: "At the Restaurant",
		icon: "🍽️",
		description: "Order food and chat with the waiter",
		defaultUserRole: "Customer",
		defaultAiRole: "Waiter",
		altUserRole: "Waiter",
		altAiRole: "Customer",
	},
	{
		id: "birthday",
		name: "Planning a Party",
		icon: "🎂",
		description: "Organize a birthday party with a friend",
		defaultUserRole: "Organizer",
		defaultAiRole: "Friend",
		altUserRole: "Friend",
		altAiRole: "Organizer",
	},
	{
		id: "doctor",
		name: "At the Doctor",
		icon: "🏥",
		description: "Describe your symptoms and get a diagnosis",
		defaultUserRole: "Patient",
		defaultAiRole: "Doctor",
		altUserRole: "Doctor",
		altAiRole: "Patient",
	},
	{
		id: "hotel",
		name: "At the Hotel",
		icon: "🏨",
		description: "Check in and ask about hotel services",
		defaultUserRole: "Guest",
		defaultAiRole: "Receptionist",
		altUserRole: "Receptionist",
		altAiRole: "Guest",
	},
	{
		id: "market",
		name: "At the Market",
		icon: "🛒",
		description: "Buy fruits and vegetables, negotiate prices",
		defaultUserRole: "Buyer",
		defaultAiRole: "Vendor",
		altUserRole: "Vendor",
		altAiRole: "Buyer",
	},
	{
		id: "directions",
		name: "Asking for Directions",
		icon: "🗺️",
		description: "Ask and give directions to a place",
		defaultUserRole: "Tourist",
		defaultAiRole: "Local",
		altUserRole: "Local",
		altAiRole: "Tourist",
	},
];

export const DEFAULT_CONFIGS: Record<Difficulty, DifficultyConfig> = {
	easy: {
		maxMessages: 10,
		guidanceLevel: "high",
		vocabulary: "basic",
		errorTolerance: "very_high",
		detailLevel: 1,
	},
	medium: {
		maxMessages: 20,
		guidanceLevel: "medium",
		vocabulary: "intermediate",
		errorTolerance: "medium",
		detailLevel: 3,
	},
	hard: {
		maxMessages: 30,
		guidanceLevel: "none",
		vocabulary: "advanced",
		errorTolerance: "low",
		detailLevel: 5,
	},
};

export const DIFFICULTY_META: Record<
	Difficulty,
	{ name: string; description: string }
> = {
	easy: {
		name: "Easy",
		description: "Basic vocabulary, AI guides and corrects your errors",
	},
	medium: {
		name: "Medium",
		description: "Intermediate level, AI guides when you get stuck",
	},
	hard: {
		name: "Hard",
		description: "Raw conversation, no help, full detailed responses required",
	},
};

export const ERROR_OPTS = ["very_high", "high", "medium", "low"] as const;
export const GUIDANCE_OPTS = ["high", "medium", "none"] as const;
export const VOCAB_OPTS = ["basic", "intermediate", "advanced"] as const;

export const ERROR_LABELS = ["Very Lenient", "Lenient", "Moderate", "Strict"];
export const GUIDANCE_LABELS = [
	"Full Guidance",
	"Some Guidance",
	"No Guidance",
];
export const VOCAB_LABELS = ["Basic", "Intermediate", "Advanced"];
export const DETAIL_LABELS = [
	"Yes/No OK",
	"Short OK",
	"Some Detail",
	"Detailed",
	"Very Detailed",
];

export type SettingsState = {
	difficulty: Difficulty;
	errorTolerance: number;
	guidance: number;
	vocabulary: number;
	maxMessages: number;
	detailLevel: number;
	aiStarts: boolean;
};

export const DEFAULT_SETTINGS: SettingsState = {
	difficulty: "medium",
	errorTolerance: 2,
	guidance: 2,
	vocabulary: 2,
	maxMessages: 20,
	detailLevel: 3,
	aiStarts: true,
};

export function buildDifficultyConfig(s: SettingsState): DifficultyConfig {
	return {
		maxMessages: s.maxMessages,
		guidanceLevel: GUIDANCE_OPTS[s.guidance - 1],
		vocabulary: VOCAB_OPTS[s.vocabulary - 1],
		errorTolerance: ERROR_OPTS[s.errorTolerance - 1],
		detailLevel: s.detailLevel,
	};
}

export function settingsFromPreset(
	d: Difficulty,
	aiStarts: boolean,
): SettingsState {
	const p = DEFAULT_CONFIGS[d];
	return {
		difficulty: d,
		errorTolerance: ERROR_OPTS.indexOf(p.errorTolerance) + 1,
		guidance: GUIDANCE_OPTS.indexOf(p.guidanceLevel) + 1,
		vocabulary: VOCAB_OPTS.indexOf(p.vocabulary) + 1,
		maxMessages: p.maxMessages,
		detailLevel: p.detailLevel,
		aiStarts,
	};
}

export function buildSystemPrompt(config: ChatConfig): string {
	const { scenario, userRole, aiRole, difficulty, difficultyConfig } = config;

	const guidanceMap = {
		high: "Corrige errores suavemente y ofrece la frase correcta. Da opciones cuando sea posible. Sé muy paciente y alentador.",
		medium:
			"Guía al usuario si parece perdido, pero no des las respuestas. Corrige solo errores importantes.",
		none: "NO ayudes al usuario aunque tenga dificultades. Conversación natural y desafiante. Rechaza respuestas demasiado simples.",
	};

	const vocabMap = {
		basic: "Usa vocabulario básico y frases simples. Habla despacio.",
		intermediate:
			"Usa vocabulario intermedio con algunas expresiones coloquiales.",
		advanced:
			"Habla naturalmente con vocabulario avanzado, modismos y expresiones regionales.",
	};

	const toleranceMap = {
		very_high:
			"Acepta cualquier intento de comunicación, incluso con muchos errores.",
		high: "Acepta respuestas con errores menores sin mencionarlos.",
		medium: "Señala errores importantes de gramática o vocabulario.",
		low: "Sé estricto con gramática y vocabulario. Exige corrección.",
	};

	return `Eres un asistente de práctica de conversación en español.

ESCENARIO: ${scenario.description}
TU ROL: ${aiRole}
ROL DEL USUARIO: ${userRole}

REGLA CRÍTICA: SIEMPRE responde ÚNICAMENTE en español. Nunca uses inglés.

FORMATO OBLIGATORIO: Comienza CADA respuesta con {{score:N}} donde N es un entero entre -10 y +15.
Evalúa la ÚLTIMA respuesta del usuario:
- +12 a +15: Excelente — correcta, apropiada, detallada
- +7 a +11: Buena — errores menores, respuesta apropiada
- +3 a +6: Aceptable — errores notables o muy corta
- 0 a +2: Pobre — mínima o muchos errores
- -5 a -1: Muy pobre — errores graves o fuera de contexto
- -10 a -6: Inaceptable — sin esfuerzo, en inglés o irrelevante
Si es tu PRIMER mensaje, usa {{score:0}}.
Si recibes "INICIAR_CONVERSACION", comienza el escenario naturalmente como ${aiRole} y usa {{score:0}}.

LONGITUD DE TUS RESPUESTAS (regla estricta):
${
	difficulty === "easy"
		? "- Máximo 1 oración + 1 pregunta corta opcional. Nunca más."
		: difficulty === "medium"
			? "- Máximo 2 oraciones en total. Una puede ser pregunta."
			: "- Máximo 3 oraciones en total. Una puede ser pregunta."
}
- Haz SOLO 1 pregunta o introduce SOLO 1 tema por mensaje. Nunca hagas varias preguntas a la vez.

NIVEL: ${difficulty.toUpperCase()}
- ${guidanceMap[difficultyConfig.guidanceLevel]}
- ${vocabMap[difficultyConfig.vocabulary]}
- ${toleranceMap[difficultyConfig.errorTolerance]}
- Máximo de intercambios: ${difficultyConfig.maxMessages}
${
	difficultyConfig.detailLevel === 1
		? "- Acepta respuestas de sí/no y respuestas muy cortas."
		: difficultyConfig.detailLevel === 2
			? "- Prefiere respuestas de al menos una oración completa."
			: difficultyConfig.detailLevel === 3
				? "- Espera respuestas de 2-3 oraciones. Rechaza respuestas de sí/no."
				: difficultyConfig.detailLevel === 4
					? "- Exige respuestas de al menos un párrafo. Rechaza respuestas cortas."
					: "- Exige respuestas muy elaboradas y detalladas. Rechaza todo lo que no sea completo y desarrollado."
}

Mantén la conversación natural, realista y apropiada para el escenario.`;
}

export function extractScore(text: string): {
	score: number;
	cleanText: string;
} {
	const match = text.match(/\{\{score:(-?\d+)\}\}\s*/);
	if (match) {
		return {
			score: parseInt(match[1], 10),
			cleanText: text.replace(/\{\{score:(-?\d+)\}\}\s*/, ""),
		};
	}
	return { score: 0, cleanText: text };
}
