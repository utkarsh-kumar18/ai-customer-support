export async function POST(request) {
  try {
    const body = await request.json();

    const { question } = body;

    if (!question?.trim()) {
      return Response.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    // Generate a simple ticket ID
    const ticketId = `TKT-${Date.now()}`;

    return Response.json({
      success: true,
      ticketId,
      message: "Support ticket created successfully.",
      question: question.trim(),
      status: "Open",
    });
  } catch (error) {
    console.error("Ticket Error:", error);

    return Response.json(
      {
        error: "Unable to create support ticket.",
      },
      { status: 500 }
    );
  }
}