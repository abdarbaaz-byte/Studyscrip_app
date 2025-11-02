
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  // Log chunks in streaming responses
  logLevel: 'debug',
  // Manually disable OpenTelemetry so that we can manage it ourselves
  enableOpenTelemetry: false,
});
