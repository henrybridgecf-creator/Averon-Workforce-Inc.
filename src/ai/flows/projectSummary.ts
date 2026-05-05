import { z } from 'genkit';
import { ai } from '../genkit';

export const projectSummaryFlow = ai.defineFlow(
  {
    name: 'projectSummary',
    inputSchema: z.object({
      title: z.string(),
      description: z.string(),
      status: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const response = await ai.generate({
      prompt: `Generate a concise summary for the following project:
      Title: ${input.title}
      Description: ${input.description}
      Status: ${input.status}
      
      Summary:`,
    });
    return response.text;
  }
);
