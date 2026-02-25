import OpenAI from 'openai';
import { ScoredEvent, AngleSet, AngleType } from '../types';
import { winstonLogger as logger } from '../utils/logger';

export class AngleGenerator {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    public async generateAngles(event: ScoredEvent): Promise<AngleSet | null> {
        logger.info(`AngleGenerator: Synthesizing vectors for event: ${event.topic}`);

        try {
            const systemPrompt = `
You are a Senior AI System Architect and Hype Oracle operating on X (Twitter).
Your task is to generate EXACTLY three diverse narrative angles for a high-velocity event.
Hard Constraints:
- No emojis.
- No hashtags.
- No corporate marketing speak.
- Must be sharp, insightful, and slightly edgy.
- Must evaluate your own predicted engagement probability (0.0 to 1.0).

Output ONLY valid JSON matching this schema:
{
  "angles": [
    { "type": "provocative", "content": "The contrarian take here...", "predictionScore": 0.92 },
    { "type": "insight", "content": "The 2nd-order effect is...", "predictionScore": 0.85 },
    { "type": "controversial", "content": "This kills X but saves Y...", "predictionScore": 0.88 }
  ]
}
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                temperature: 0.8, // Slightly elevated for creativity
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: `EVENT SUMMARY: ${event.topic} | VELOCITY SCORE: ${event.velocity_score} | SOURCE: ${event.source}`
                    }
                ],
                response_format: { type: 'json_object' }
            });

            const responseContent = response.choices[0].message.content;
            if (!responseContent) throw new Error("Null response from LLM");

            const result = JSON.parse(responseContent);

            // SECTION 7: REDUNDANCY AVOIDANCE & REJECTION CRITERIA
            if (!result.angles || result.angles.length !== 3) {
                throw new Error("Validation Failure: LLM did not generate exactly 3 angles.");
            }

            return {
                eventId: event.id,
                angles: result.angles
            };
        } catch (error) {
            logger.error('AngleGenerator: Generation failed. Circuit breaker tripped.', error);
            return null;
        }
    }

    public selectBestAngle(angleSet: AngleSet): { type: AngleType; content: string; score: number } {
        // Find highest predicted engagement probability
        const best = angleSet.angles.reduce((prev, current) =>
            (prev.predictionScore > current.predictionScore) ? prev : current
        );

        logger.info(`AngleGenerator: Selected "${best.type}" angle. Target prediction score: ${best.predictionScore}`);
        return { type: best.type as AngleType, content: best.content, score: best.predictionScore };
    }
}
