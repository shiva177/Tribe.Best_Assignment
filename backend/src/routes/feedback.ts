import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { OpenAI } from 'openai';

const router = Router();

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Save feedback to DB
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { user_id, input_type, input_value, feedback_json } = req.body;

    const result = await pool.query(
      'INSERT INTO feedback (user_id, input_type, input_value, feedback_json) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, input_type, input_value, feedback_json]
    );

    return res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Generate AI feedback using OpenAI
router.post('/generate-feedback', async (req: Request, res: Response) => {
  const { input_value } = req.body;

  if (!input_value) {
    return res.status(400).json({ error: 'Input is required' });
  }

  try {
    const prompt = `
You are an expert UI/UX reviewer. Please analyze the following website or image and provide:
1. Specific UI improvement suggestions.
2. Specific UX improvement suggestions.

Respond strictly in JSON format as:
{
  "ui": "Your UI suggestions...",
  "ux": "Your UX suggestions..."
}

Input: ${input_value}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // ya gpt-4o agar access hai
      messages: [{ role: 'user', content: prompt }],
    });

    const feedbackText = completion.choices[0]?.message?.content || '{}';
    const feedbackJSON = JSON.parse(feedbackText);

    res.json({ feedback: feedbackJSON });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
});

// History Route
router.get('/history/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM feedback WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    return res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
