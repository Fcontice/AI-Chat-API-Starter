const { z } = require('zod');

const roleEnum = z.enum(['system', 'user', 'assistant']);

const messageSchema = z.object({
  role: roleEnum,
  content: z.string().min(1, 'Message content cannot be empty')
});

const chatSchema = z.object({
  provider: z.string().optional(),
  model: z.string().optional(),
  systemPrompt: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  stream: z.boolean().optional().default(false),
  temperature: z.number().optional(),
  max_tokens: z.number().int().positive().optional(),
  messages: z
    .array(messageSchema)
    .min(1, 'At least one message is required')
});

module.exports = { chatSchema };
