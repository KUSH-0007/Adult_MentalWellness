import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: 'AIzaSyBVYnIEYdosZ4dh7DMpUdmAsdJpjJ6vSo4',
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
