import OpenAI from 'openai';
import { ScoredEvent } from '../types';
import { winstonLogger as logger } from '../utils/logger';

export class BioGenerator {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    public async generateOptimizedBio(topEvents: ScoredEvent[]): Promise<string> {
        logger.info('BioGenerator: Generating hype-aligned bio...');

        const context = topEvents.map(e => e.topic).join(', ');

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an X growth expert. Write a short, punchy bio (max 160 chars) that positions the account as an AI Hype Oracle. Focus on speed and insight. No hashtags. Clear value for followers.'
                    },
                    {
                        role: 'user',
                        content: `CURRENT TRENDS: ${context}\nTASK: Generate an optimized bio that stops the scroll and converts visitors to followers.`
                    }
                ]
            });

            return response.choices[0].message.content?.trim() || "AI Hype Oracle | Spotting the top 5% of AI signals before they go viral. | 24/7 Autonomous.";
        } catch (error) {
            logger.error('BioGenerator: Failed to generate bio:', error);
            return "AI Hype Oracle | Spotting the top 5% of AI signals before they go viral. | 24/7 Autonomous.";
        }
    }
}
