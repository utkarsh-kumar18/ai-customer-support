# 🤖 AI-Powered Customer Support Assistant

An AI-powered customer support assistant built with **Next.js, React, and Google Gemini**.

The application understands natural-language customer questions, retrieves relevant information from a support knowledge base using **embeddings and cosine similarity**, and uses Gemini to generate grounded responses.

If the system cannot find sufficiently relevant information, it automatically triggers a **support-ticket workflow** and returns a ticket ID.

---

## 📌 Project Overview

Traditional customer-support systems often require users to search through FAQs or wait for a support representative.

This project demonstrates an AI-assisted support workflow where the system can:

- Understand natural-language questions
- Search a support knowledge base semantically
- Generate concise AI responses
- Reduce hallucinations by grounding responses in retrieved information
- Detect low-confidence queries
- Automatically create a support ticket when relevant information is unavailable
- Return a unique ticket ID and ticket status

The project was designed as a **time-constrained AI + Full-Stack engineering prototype**.

---

## 🎯 Problem Statement

Customer support teams receive many repetitive questions related to:

- Order tracking
- Returns
- Order cancellation
- Damaged products
- Customer support
- Delivery issues

A support assistant should be able to answer common questions automatically while avoiding unsupported answers.

For questions that cannot be reliably answered from the available support documentation, the system should provide a path toward human assistance.

---

## 💡 Solution

The application combines:

1. **React / Next.js frontend**
2. **Next.js backend API routes**
3. **Gemini embeddings**
4. **Semantic retrieval**
5. **Cosine similarity**
6. **Gemini LLM**
7. **Confidence-based decision making**
8. **Support-ticket creation workflow**

The overall workflow is:

```text
                     User
                       |
                       v
              React / Next.js UI
                       |
                       v
                 /api/ask
                       |
                       v
              Generate Embedding
                       |
                       v
             Semantic Retrieval
                       |
                       v
              Cosine Similarity
                       |
                       v
                Decision Layer
                 /           \
                /             \
        Relevant FAQ       Low Confidence
             |                  |
             v                  v
        Gemini LLM         Ticket API
             |                  |
             v                  v
        AI Response         Ticket ID


## Arcitecture
┌──────────────────────────────┐
│            User              │
└──────────────┬───────────────┘
               │
               │ Question
               ▼
┌──────────────────────────────┐
│       Next.js Frontend       │
│          React UI            │
└──────────────┬───────────────┘
               │
               │ POST /api/ask
               ▼
┌──────────────────────────────┐
│       Next.js Backend        │
│        /api/ask              │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    Gemini Embedding API      │
│    gemini-embedding-001      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    Semantic Retrieval        │
│                              │
│    Cosine Similarity         │
└──────────────┬───────────────┘
               │
               ▼
        ┌───────────────┐
        │ Decision Layer│
        └───────┬───────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
   Relevant          Low Confidence
        │                │
        ▼                ▼
  Gemini 3.6 Flash    /api/ticket
        │                │
        ▼                ▼
   AI Response        Ticket ID

## Project Structure
ai-customer-support/
│
├── app/
│   │
│   ├── api/
│   │   │
│   │   ├── ask/
│   │   │   └── route.js
│   │   │
│   │   └── ticket/
│   │       └── route.js
│   │
│   ├── page.js
│   ├── layout.js
│   └── globals.css
│
├── data/
│   └── faqs.json
│
├── public/
│
├── .env.local
├── .gitignore
├── package.json
├── package-lock.json
└── README.md