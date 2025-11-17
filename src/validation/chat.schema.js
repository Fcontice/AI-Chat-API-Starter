const { z } = require('zod');

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().trim().min(1, 'Message content cannot be empty').max(4000)
});

const chatSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'groq', 'ollama']),
  model: z.string().trim().min(1).max(100).optional(),
  messages: z.array(messageSchema).nonempty('messages must contain at least one message'),
  systemPrompt: z.string().trim().max(4000).optional(),
  stream: z.boolean().optional().default(false),
  metadata: z.record(z.any()).optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().int().positive().optional()
});

module.exports = { chatSchema };
