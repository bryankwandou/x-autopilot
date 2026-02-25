import OpenAI from 'openai';
import { winstonLogger as logger } from '../utils/logger';

export class ImageGenerator {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    public async generateVisual(prompt: string): Promise<string | null> {
        logger.info(`ImageGenerator: Forging high-contrast visual payload. Prompt vector length: ${prompt.length}`);

        try {
            // Strict Section 5 visual rules execution
            const enhancedPrompt = `${prompt}. High contrast, dark-mode friendly, sleek minimalist cyberpunk aesthetic, zero textual elements or clutter. Premium digital art.`;

            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: enhancedPrompt,
                n: 1,
                size: "1024x1024",
                quality: "standard"
            });

            if (response.data && response.data[0] && response.data[0].url) {
                logger.info('ImageGenerator: Visual rendering completed and URL extracted.');
                return response.data[0].url;
            } else {
                throw new Error("Dall-E 3 API returned an empty data structure.");
            }
        } catch (error: any) {
            logger.error(`ImageGenerator: Visual generation failed abruptly. Reason: ${error.message || error}`);
            return null; // Graceful degradation - system posts text only
        }
    }
}
