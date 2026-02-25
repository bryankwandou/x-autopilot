import { chromium, Browser, Page } from 'playwright';
import { HypeEvent } from '../types';
import { winstonLogger as logger } from '../utils/logger';

export class TrendScanner {
    private browser: Browser | null = null;

    constructor() { }

    public async scan(): Promise<HypeEvent[]> {
        logger.info('Scanning for Hype Events...');
        const events: HypeEvent[] = [];

        // Initialize browser for scraping if not using API
        this.browser = await chromium.launch({ headless: true });
        const context = await this.browser.newContext();
        const page = await context.newPage();

        try {
            // 1. Scan X Explore/Trends
            const xTrends = await this.getXTrendsBySelectors(page);
            events.push(...xTrends);

            // 2. Scan Specific Keywords for Velocity
            const viralTweets = await this.getViralTweetsByKeywords(page, ['AI', 'GPT', 'AGI']);
            events.push(...viralTweets);

        } catch (error) {
            logger.error('High-Fidelity Scan failed:', error);
        } finally {
            await this.browser.close();
        }

        return events;
    }

    private async getXTrendsBySelectors(page: Page): Promise<HypeEvent[]> {
        await page.goto('https://x.com/explore/tabs/trending');
        await page.waitForSelector('[data-testid="trend"]', { timeout: 10000 });

        const trends = await page.evaluate(() => {
            const trendNodes = document.querySelectorAll('[data-testid="trend"]');
            return Array.from(trendNodes).map(node => {
                const textNodes = node.querySelectorAll('div[dir="ltr"]');
                return {
                    topic: textNodes[1]?.textContent || 'Unknown',
                    volume: textNodes[2]?.textContent || '0'
                };
            });
        });

        return trends.map(t => ({
            id: `x-trend-${Date.now()}-${Math.random()}`,
            topic: t.topic,
            source: 'X Trends',
            velocity_score: parseInt(t.volume.replace(/[^0-9]/g, '')) || 100,
            emotion_score: 0.5,
            controversy_score: 0.5,
            estimated_half_life: 24,
            timestamp: new Date().toISOString(),
            metadata: { raw_volume: t.volume }
        }));
    }

    private async getViralTweetsByKeywords(page: Page, keywords: string[]): Promise<HypeEvent[]> {
        const results: HypeEvent[] = [];
        for (const kw of keywords) {
            await page.goto(`https://x.com/search?q=${encodeURIComponent(kw)}&src=typed_query&f=live`);
            await page.waitForTimeout(3000); // Wait for stream

            // Extract high-velocity signals from the top results
            const tweets = await page.evaluate(() => {
                const items = document.querySelectorAll('[data-testid="tweet"]');
                return Array.from(items).slice(0, 5).map(item => {
                    const text = item.querySelector('[data-testid="tweetText"]')?.textContent || '';
                    const stats = item.querySelectorAll('[data-testid="app-text-transition-container"]');
                    return {
                        text,
                        likes: stats[2]?.textContent || '0',
                        reposts: stats[1]?.textContent || '0'
                    };
                });
            });

            tweets.forEach(twe => {
                results.push({
                    id: `x-search-${Date.now()}-${Math.random()}`,
                    topic: twe.text.substring(0, 50),
                    source: 'X Search',
                    velocity_score: parseInt(twe.likes.replace(/[^0-9]/g, '')) || 0,
                    emotion_score: 0.5,
                    controversy_score: 0.8,
                    estimated_half_life: 12,
                    timestamp: new Date().toISOString(),
                    metadata: { full_text: twe.text }
                });
            });
        }
        return results;
    }
}
