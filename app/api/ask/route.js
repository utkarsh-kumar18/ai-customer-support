import { GoogleGenAI } from "@google/genai";
import faqs from "@/data/faqs.json";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Cache FAQ embeddings in memory
let faqEmbeddings = null;

function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

async function createEmbedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  return response.embeddings[0].values;
}

async function getFaqEmbeddings() {
  if (faqEmbeddings) {
    return faqEmbeddings;
  }

  faqEmbeddings = await Promise.all(
    faqs.map(async (faq) => {
      const text = `${faq.question}\n${faq.answer}`;

      const embedding = await createEmbedding(text);

      return {
        ...faq,
        embedding,
      };
    })
  );

  return faqEmbeddings;
}

async function generateWithRetry(prompt, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      return response;
    } catch (error) {
      const status = error?.status;

      if (status !== 503 || attempt === retries - 1) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt);

      console.log(
        `Gemini temporarily unavailable. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Create a support ticket through our ticket API
async function createSupportTicket(request, question) {
  const ticketUrl = new URL("/api/ticket", request.url);

  const response = await fetch(ticketUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create support ticket.");
  }

  return response.json();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const question = body.question?.trim();

    if (!question) {
      return Response.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    // Create embedding for the user's question
    const questionEmbedding = await createEmbedding(question);

    // Get cached FAQ embeddings
    const faqData = await getFaqEmbeddings();

    // Calculate semantic similarity
    const faqResults = faqData.map((faq) => {
      const similarity = cosineSimilarity(
        questionEmbedding,
        faq.embedding
      );

      return {
        question: faq.question,
        answer: faq.answer,
        similarity,
      };
    });

    // Sort by similarity
    faqResults.sort((a, b) => b.similarity - a.similarity);

    const bestMatch = faqResults[0];

    // If no relevant FAQ is found,
    // route the request to the support-ticket workflow.
    
    const answerUnavailable = 
        bestMatch?.answer
            ?.toLowerCase()
            .includes("not specified") ||
        bestMatch?.answer
            ?.toLowerCase()
            .includes("not available");

    console.log("Best Match:", bestMatch);
   console.log("Answer Unavailable:", answerUnavailable);

    if (!bestMatch || bestMatch.similarity < 0.60) {
      const ticket = await createSupportTicket(request, question);

      return Response.json({
        answer:
          "I could not find a relevant answer in the support documentation, so I created a support ticket for you.",
        action: "CREATE_TICKET",
        ticketId: ticket.ticketId,
        status: ticket.status,
      });
    };

    // Grounded AI response
    const prompt = `
    You are an AI customer support assistant.

    Answer the customer's question using ONLY the provided support information.

    Do not invent policies, prices, dates, procedures, or other information.

    If the information does not answer the customer's question,
    clearly state that the information is not available.

    Support information:
    ${bestMatch.question}
    ${bestMatch.answer}

    Customer question:
    ${question}

    Give a concise, helpful and professional answer.
    `;

    const response = await generateWithRetry(prompt);

    return Response.json({
      answer: response.text,
      action: "ANSWER",
      similarity: Number(bestMatch.similarity.toFixed(3)),
    });
  } catch (error) {
    console.error("AI Error:", error);

    return Response.json(
      {
        error: "Unable to process your request. Please try again.",
      },
      { status: 500 }
    );
  }
}