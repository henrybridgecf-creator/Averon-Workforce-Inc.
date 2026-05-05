import { z } from 'genkit';
import { ai } from '../genkit';

export const disputeAnalysisFlow = ai.defineFlow(
  {
    name: 'disputeAnalysis',
    inputSchema: z.object({
      projectTitle: z.string(),
      description: z.string(),
      submissionUrl: z.string().optional().nullable(),
      declineReason: z.string().optional().nullable(),
      userFeedback: z.string().optional().nullable(),
    }),
    outputSchema: z.object({
      analysis: z.string(),
      recommendation: z.enum(['approve', 'reject', 'request_edits']),
      confidence: z.number(),
    }),
  },
  async (input) => {
    const response = await ai.generate({
      prompt: `Act as a senior dispute resolution specialist for a project platform. 
      Your task is to analyze a dispute between a freelancer and the platform staff regarding a rejected project submission.

      PROJECT DETAILS:
      - Title: ${input.projectTitle}
      - Original Description/Requirements: ${input.description}
      - Submission URL: ${input.submissionUrl || 'Not provided'}
      
      DISPUTE CONTEXT:
      - Platform Rejection Reason: ${input.declineReason || 'Not stated'}
      - Freelancer Feedback/Defense: ${input.userFeedback || 'No feedback provided'}

      INSTRUCTIONS:
      1. Carefully evaluate if the freelancer's work (as described) meets the project requirements.
      2. Assess if the platform's rejection reason is objective and supported by the requirements.
      3. Consider the freelancer's feedback.
      4. Provide a clear, unbiased analysis of the situation.
      5. Recommend an action: 
         - 'approve' if the work is clearly satisfactory.
         - 'reject' if the work fundamentally fails to meet requirements.
         - 'request_edits' if the work is close but requires specific technical fixes or clarifications.

      RESPONSE FORMAT:
      You must return a JSON object with:
      - analysis: A detailed explanation of your reasoning.
      - recommendation: Exactly one of 'approve', 'reject', or 'request_edits'.
      - confidence: A numerical score between 0 and 1 representing your certainty in this recommendation.`,
      output: { format: 'json' }
    });
    
    return response.output as any;
  }
);
