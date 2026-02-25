import OpenAI from 'openai';
import { AngleType, ContentPiece, ScoredEvent } from '../types';
import { winstonLogger as logger } from '../utils/logger';

export class ContentFactory {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    public async createContent(event: ScoredEvent, angle: { type: AngleType; content: string; score?: number }): Promise<ContentPiece | null> {
        logger.info(`ContentFactory: Forging payload for angle: ${angle.type}`);

        try {
            const systemPrompt = `
You are the world's most aggressive and insightful X (Twitter) growth engine.
Your task is to craft a tweet or reply based on the provided ANGLE.
Hard Constraints:
1. MAX 280 Characters.
2. HOOK: First sentence must instantly stop the scroll.
3. INSIGHT: Minimum fluff, maximum technical or market signal.
4. NO hashtags, NO emojis, NO generic marketing language.
5. Tone: Confident, direct.
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                temperature: 0.7,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `EVENT TOPIC: ${event.topic}\nANGLE TO EXECUTE: ${angle.content}\nCreate the final payload.` }
                ]
            });

            const text = response.choices[0].message.content?.trim() || '';

            if (text.length === 0) throw new Error("Generated content is empty.");
            if (text.length > 290) throw new Error("Generated content exceeded character limit.");

            // SECTION 5: VISUAL DECISION LOGIC (Now rigorous, not simulated)
            // Rules: Only attach visual if Hype Score is massive OR if LLM explicitly predicted virality > 0.90
            let hasVisual = false;
            let visualPrompt = '';

            if (event.hypeScore > 90 || (angle.score && angle.score >= 0.90)) {
                hasVisual = true;
                visualPrompt = `Abstract, high-contrast, dark-mode minimalist visualization representing: ${event.topic.substring(0, 50)}. No text or words in the image. Premium sleek aesthetic.`;
                logger.info(`ContentFactory: Visual generation requested. Hook: "${visualPrompt}"`);
            }

            return {
                id: `cont-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                event_id: event.id,
                category: angle.type,
                text,
                format: 'tweet', // Default format, can be overridden by ReplySwarm
                hasVisual,
                visualPrompt,
                scheduledAt: new Date().toISOString()
            };
        } catch (error) {
            logger.error('ContentFactory: Payload forging failed. Dropping event.', error);
            return null;
        }
    }
}
