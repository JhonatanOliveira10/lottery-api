import { decode, encode } from "gpt-3-encoder";
import Groq from "groq-sdk";
import { NextApiRequest, NextApiResponse } from "next";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Função para ajustar o texto ao limite de tokens
const trimMessageToFit = (text: string, maxTokens: number): string => {
  let encoded = encode(text);
  if (encoded.length <= maxTokens) {
    return text;
  }

  let trimmedEncoded = encoded.slice(0, maxTokens);
  let trimmedText = decode(trimmedEncoded);

  return trimmedText;
};

// Estrutura para armazenar dados de loteria
type LotteryData = {
  number: number;
  occurrences: number;
};

// Dados de probabilidade para Mega-Sena e Lotofácil
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

// Função para obter dados de probabilidade baseados no tipo de jogo
const getProbabilityData = (currentLevel: string): LotteryData[] => {
  switch (currentLevel) {
    case "Mega-Sena":
      return megaSenaData;
    case "Lotofacil":
      return lotofacilData;
    default:
      return [];
  }
};

// Definição dos quadrantes para Lotomania
const quadrants = {
  firstQuadrant: [
    [1, 2, 3, 4, 5],
    [11, 12, 13, 14, 15],
    [21, 22, 23, 24, 25],
    [31, 32, 33, 34, 35],
    [41, 42, 43, 44, 45],
  ],
  secondQuadrant: [
    [6, 7, 8, 9, 10],
    [16, 17, 18, 19, 20],
    [26, 27, 28, 29, 30],
    [36, 37, 38, 39, 40],
    [46, 47, 48, 49, 50],
  ],
  thirdQuadrant: [
    [51, 52, 53, 54, 55],
    [61, 62, 63, 64, 65],
    [71, 72, 73, 74, 75],
    [81, 82, 83, 84, 85],
    [91, 92, 93, 94, 95],
  ],
  fourthQuadrant: [
    [56, 57, 58, 59, 60],
    [66, 67, 68, 69, 70],
    [76, 77, 78, 79, 80],
    [86, 87, 88, 89, 90],
    [96, 97, 98, 99, 0],
  ],
};

// Função para obter números aleatórios de uma linha
const getRandomFromLine = (line: number[], count: number): number[] => {
  const shuffled = line.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Função para selecionar números de quadrantes
const getQuadrantNumbers = (
  quadrant: number[][],
  numOdd: number,
  numEven: number
): number[] => {
  const oddNumbers: number[] = [];
  const evenNumbers: number[] = [];

  for (let line of quadrant) {
    const oddInLine = line.filter((num) => num % 2 !== 0);
    const evenInLine = line.filter((num) => num % 2 === 0);

    oddNumbers.push(...getRandomFromLine(oddInLine, Math.min(5, numOdd)));
    evenNumbers.push(...getRandomFromLine(evenInLine, Math.min(5, numEven)));
  }

  return [...oddNumbers.slice(0, numOdd), ...evenNumbers.slice(0, numEven)];
};

// Função para gerar combinações da Lotomania
const generateLotomaniaCombinations = (numGames: number): number[][] => {
  const games: number[][] = [];

  for (let i = 0; i < numGames; i++) {
    const game: number[] = [];

    game.push(...getQuadrantNumbers(quadrants.firstQuadrant, 7, 6));
    game.push(...getQuadrantNumbers(quadrants.secondQuadrant, 6, 6));
    game.push(...getQuadrantNumbers(quadrants.thirdQuadrant, 7, 6));
    game.push(...getQuadrantNumbers(quadrants.fourthQuadrant, 6, 6));

    games.push([...new Set(game)].sort(() => Math.random() - 0.5));
  }

  return games;
};

// Handler para a API
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { currentLevel, currentStack, technologies } = req.body;

    if (currentLevel === "Lotomania") {
      const numGames = technologies || 1;
      const lotomaniaCombinations = generateLotomaniaCombinations(numGames);
      res.status(200).json({
        analysis: `As combinações geradas para Lotomania são: ${JSON.stringify(
          lotomaniaCombinations
        )}`,
      });
      return;
    }
    if (currentLevel === "Mega-Sena" || currentLevel === "Lotofacil") {
      const probabilityData = getProbabilityData(currentLevel);

      const probabilityString = probabilityData
        .map((data) => `Número ${data.number}: ${data.occurrences} vezes`)
        .join(", ");

      const userPrompt = [
        "Você é um assistente que ajuda a gerar combinações para jogos de loteria com base em regras específicas.",
        `O tipo do jogo é: ${currentLevel || "Mega-Sena"}.`,
        `A quantidade de números por jogo é: ${currentStack || 6}.`,
        `A quantidade de jogos é: ${technologies || 1}.`,
        // Regras específicas para Lotomania...
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

        res.status(200).json({
          analysis: response.choices[0].message.content,
        });
      } catch (error) {
        res.status(500).json({ error: "Erro ao obter análise." });
      }
    } else {
      res.status(405).json({ error: "Método não permitido." });
    }
  }
}
