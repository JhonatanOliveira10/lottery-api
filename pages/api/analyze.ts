import { decode, encode } from "gpt-3-encoder";
import Groq from "groq-sdk";
import { NextApiRequest, NextApiResponse } from "next";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const trimMessageToFit = (text: string, maxTokens: number): string => {
  let encoded = encode(text);
  if (encoded.length <= maxTokens) {
    return text;
  }

  let trimmedEncoded = encoded.slice(0, maxTokens);
  let trimmedText = decode(trimmedEncoded);

  return trimmedText;
};

type LotteryData = {
  number: number;
  occurrences: number;
};

const megaSenaData: LotteryData[] = [
  { number: 10, occurrences: 318 },
  { number: 53, occurrences: 311 },
  { number: 5, occurrences: 299 },
  { number: 23, occurrences: 294 },
  { number: 34, occurrences: 293 },
  { number: 42, occurrences: 292 },
  { number: 30, occurrences: 291 },
  { number: 37, occurrences: 291 },
  { number: 33, occurrences: 290 },
  { number: 35, occurrences: 290 },
  { number: 41, occurrences: 289 },
  { number: 4, occurrences: 288 },
  { number: 17, occurrences: 286 },
  { number: 32, occurrences: 286 },
  { number: 38, occurrences: 285 },
  { number: 44, occurrences: 285 },
  { number: 11, occurrences: 284 },
  { number: 27, occurrences: 284 },
  { number: 28, occurrences: 284 },
  { number: 16, occurrences: 283 },
  { number: 56, occurrences: 283 },
  { number: 43, occurrences: 282 },
  { number: 54, occurrences: 281 },
  { number: 29, occurrences: 280 },
  { number: 13, occurrences: 279 },
  { number: 46, occurrences: 279 },
  { number: 36, occurrences: 277 },
  { number: 49, occurrences: 277 },
  { number: 51, occurrences: 275 },
  { number: 6, occurrences: 273 },
  { number: 8, occurrences: 272 },
  { number: 2, occurrences: 271 },
  { number: 24, occurrences: 271 },
  { number: 52, occurrences: 271 },
  { number: 45, occurrences: 268 },
  { number: 20, occurrences: 267 },
  { number: 58, occurrences: 266 },
  { number: 25, occurrences: 265 },
  { number: 50, occurrences: 264 },
  { number: 59, occurrences: 263 },
  { number: 14, occurrences: 262 },
  { number: 18, occurrences: 262 },
  { number: 12, occurrences: 260 },
  { number: 1, occurrences: 259 },
  { number: 39, occurrences: 259 },
  { number: 57, occurrences: 259 },
  { number: 7, occurrences: 258 },
  { number: 9, occurrences: 258 },
  { number: 19, occurrences: 257 },
  { number: 47, occurrences: 257 },
  { number: 60, occurrences: 257 },
  { number: 40, occurrences: 254 },
  { number: 3, occurrences: 253 },
  { number: 31, occurrences: 253 },
  { number: 48, occurrences: 252 },
  { number: 22, occurrences: 247 },
  { number: 15, occurrences: 235 },
  { number: 55, occurrences: 230 },
  { number: 26, occurrences: 228 },
  { number: 21, occurrences: 227 },
];

const lotofacilData: LotteryData[] = [
  { number: 20, occurrences: 1993 },
  { number: 10, occurrences: 1982 },
  { number: 25, occurrences: 1965 },
  { number: 11, occurrences: 1944 },
  { number: 14, occurrences: 1937 },
  { number: 13, occurrences: 1935 },
  { number: 24, occurrences: 1928 },
  { number: 3, occurrences: 1925 },
  { number: 5, occurrences: 1919 },
  { number: 12, occurrences: 1918 },
  { number: 4, occurrences: 1917 },
  { number: 1, occurrences: 1914 },
  { number: 2, occurrences: 1911 },
  { number: 9, occurrences: 1909 },
  { number: 18, occurrences: 1901 },
  { number: 22, occurrences: 1898 },
  { number: 21, occurrences: 1891 },
  { number: 19, occurrences: 1890 },
  { number: 15, occurrences: 1889 },
  { number: 17, occurrences: 1879 },
  { number: 7, occurrences: 1878 },
  { number: 23, occurrences: 1862 },
  { number: 6, occurrences: 1854 },
  { number: 8, occurrences: 1849 },
  { number: 16, occurrences: 1812 },
];

const getProbabilityData = (currentLevel: string): LotteryData[] => {
  if (currentLevel === "Mega-Sena") {
    return megaSenaData;
  } else if (currentLevel === "Lotofacil") {
    return lotofacilData;
  }
  return [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { currentLevel, currentStack, technologies } = req.body;

    const probabilityData = getProbabilityData(currentLevel);

    const probabilityString = probabilityData
      .map((data) => `Número ${data.number}: ${data.occurrences} vezes`)
      .join(", ");

    const userPrompt = [
      "Você é um assistente útil com o intuito de ajudar jogadores a montarem as melhores combinações de jogos baseando nas informações de probabilidade.",
      currentLevel ? `O tipo do jogo é: ${currentLevel}.` : "Mega-Sena",
      currentStack
        ? `A quantidade de numeros por jogo é: ${currentStack}.`
        : "A quantidade de numeros por jogo é 6.",
      technologies
        ? `A quantidade de jogos é: ${technologies}.`
        : "A quantidade de jogos é 1.",
      `Probabilidades baseadas nos dados disponíveis: ${probabilityString}.`,
      `Por favor, gere combinações de ${
        currentStack || 6
      } números para cada um dos ${
        technologies || 1
      } jogos, sem repetir jogos e maximizando as chances de acerto.`,
    ]
      .filter(Boolean)
      .join(" ");

    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: "system", content: userPrompt }],
        model: process.env.MODEL_AI ?? "llama3-8b-8192",
        temperature: parseFloat(process.env.TEMPERATURE_AI ?? "0.5"),
        max_tokens: parseInt(process.env.MAX_TOKENS_AI ?? "8192"),
        top_p: 1,
        stop: null,
        stream: false,
      });

      res.status(200).json({ analysis: response.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: "Erro ao obter análise." });
    }
  } else {
    res.status(405).json({ error: "Método não permitido." });
  }
}
