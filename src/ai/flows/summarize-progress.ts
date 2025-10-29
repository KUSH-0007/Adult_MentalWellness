 'use server';
/**
 * @fileOverview Summarizes the user's progress over the past week.
 *
 * - summarizeProgress - A function that summarizes the progress.
 * - SummarizeProgressInput - The input type for the summarizeProgress function.
 * - SummarizeProgressOutput - The return type for the summarizeProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeProgressInputSchema = z.object({
  pastWeekEntries: z
    .string()
    .describe("The user's journal entries for the past week."),
});
export type SummarizeProgressInput = z.infer<typeof SummarizeProgressInputSchema>;

const SummarizeProgressOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\u2019s progress over the past week.'),
});
export type SummarizeProgressOutput = z.infer<typeof SummarizeProgressOutputSchema>;

export async function summarizeProgress(input: SummarizeProgressInput): Promise<SummarizeProgressOutput> {
  return summarizeProgressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProgressPrompt',
  input: {schema: SummarizeProgressInputSchema},
  output: {schema: SummarizeProgressOutputSchema},
  prompt: `You are a mental health assistant. You will receive the user\'s journal entries for the past week and will summarize their progress.

Journal entries: {{{pastWeekEntries}}}`,
});

const summarizeProgressFlow = ai.defineFlow(
  {
    name: 'summarizeProgressFlow',
    inputSchema: SummarizeProgressInputSchema,
    outputSchema: SummarizeProgressOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
