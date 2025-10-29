'use server';

/**
 * @fileOverview A flow to get video recommendations based on the user's emotion.
 *
 * - getVideoRecommendations - A function that handles the video recommendation process.
 * - GetVideoRecommendationsInput - The input type for the getVideoRecommendations function.
 * - GetVideoRecommendationsOutput - The return type for the getVideoRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { allRecommendations } from '@/lib/data';
import type { VideoRecommendation } from '@/lib/definitions';

const GetVideoRecommendationsInputSchema = z.object({
  emotion: z.string().describe('The primary emotion detected in the user\'s input.'),
  userInput: z.string().describe('The full text of the user\'s journal entry.'),
});
export type GetVideoRecommendationsInput = z.infer<typeof GetVideoRecommendationsInputSchema>;

const VideoRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  link: z.string(),
  reason: z.string(),
  videoId: z.string().optional(),
  tags: z.array(z.string()),
});

const GetVideoRecommendationsOutputSchema = z.object({
  recommendations: z.array(VideoRecommendationSchema).describe('A list of 3-4 video recommendations.'),
});
export type GetVideoRecommendationsOutput = z.infer<typeof GetVideoRecommendationsOutputSchema>;

// Tool to get available videos from our library
const getAvailableVideos = ai.defineTool(
  {
    name: 'getAvailableVideos',
    description: 'Get a list of all available YouTube video recommendations that can be suggested to the user.',
    inputSchema: z.object({
      searchTag: z.string().optional().describe('A tag to filter videos by, such as "anxiety", "stress", or "meditation".'),
    }),
    outputSchema: z.array(VideoRecommendationSchema),
  },
  async ({ searchTag }) => {
    if (searchTag) {
      return allRecommendations.filter(rec => rec.tags.includes(searchTag.toLowerCase()));
    }
    return allRecommendations;
  }
);

export async function getVideoRecommendations(
  input: GetVideoRecommendationsInput
): Promise<GetVideoRecommendationsOutput> {
  return getVideoRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getVideoRecommendationsPrompt',
  input: { schema: GetVideoRecommendationsInputSchema },
  output: { schema: GetVideoRecommendationsOutputSchema },
  tools: [getAvailableVideos],
  prompt: `You are a recommendation engine for a mental wellness app. Your goal is to suggest relevant YouTube videos to a user based on their journal entry.

1.  Analyze the user's emotion and input text.
2.  Use the 'getAvailableVideos' tool to find suitable videos. You can search by a relevant tag (e.g., "stress", "anxiety", "sadness", "motivation").
3.  Select 3 videos that are most relevant to the user's situation.
4.  For each selected video, slightly customize the "reason" to make it more personal and directly related to the user's input, but keep it very brief (10-15 words).

User Emotion: {{{emotion}}}
User Input: "{{{userInput}}}"

Provide your response in the specified JSON format.`,
});

const getVideoRecommendationsFlow = ai.defineFlow(
  {
    name: 'getVideoRecommendationsFlow',
    inputSchema: GetVideoRecommendationsInputSchema,
    outputSchema: GetVideoRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { recommendations: [] };
    }
    // Ensure we don't return more than 3 recommendations
    output.recommendations = output.recommendations.slice(0, 3);
    return output;
  }
);
