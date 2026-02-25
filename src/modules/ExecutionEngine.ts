import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { ContentPiece, ExecutionReceipt } from '../types';
import { winstonLogger as logger } from '../utils/logger';
import { ConfigManager, SystemConfig } from '../utils/ConfigManager';

export class ExecutionEngine {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private config: SystemConfig;

    constructor(configManager: ConfigManager) {
        this.config = configManager.get();
    }

    public async initialize() {
        this.browser = await chromium.launch({ headless: false });
        const context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        // High-Fidelity Injection: Inject Auth Cookies if provided
        if (this.config.x.auth_token && this.config.x.ct0) {
            await context.addCookies([
                { name: 'auth_token', value: this.config.x.auth_token, domain: '.x.com', path: '/' },
                { name: 'ct0', value: this.config.x.ct0, domain: '.x.com', path: '/' }
            ]);
            logger.info('ExecutionEngine: Auth cookies injected.');
        }

        this.page = await context.newPage();
    }

    public async execute(content: ContentPiece): Promise<ExecutionReceipt> {
        if (!this.page) throw new Error('ExecutionEngine not initialized');

        try {
            logger.info(`Executing ${content.format}: ${content.id}`);

            await this.simulateHumanWait(3000, 8000);
            await this.page.goto('https://x.com/home');
            await this.page.waitForLoadState('networkidle');

            // Check if logged in
            if (await this.page.isVisible('[data-testid="loginButton"]')) {
                logger.error('ExecutionEngine: Not logged in. Action failed.');
                return { contentId: content.id, platformId: '', timestamp: new Date().toISOString(), status: 'failed' };
            }

            await this.simulateNaturalBrowsing();

            if (content.format === 'tweet') {
                await this.postTweet(content.text);
            }

            return {
                contentId: content.id,
                platformId: 'TWEET_ID_' + Date.now(),
                timestamp: new Date().toISOString(),
                status: 'success'
            };
        } catch (error) {
            logger.error(`Execution failed for ${content.id}:`, error);
            return { contentId: content.id, platformId: '', timestamp: new Date().toISOString(), status: 'failed' };
        }
    }

    private async postTweet(text: string) {
        if (!this.page) return;

        await this.page.click('[data-testid="SideNav_NewTweet_Button"]');
        await this.simulateHumanWait(1000, 2500);

        const tweetBox = this.page.locator('[data-testid="tweetTextarea_0"]');
        await tweetBox.click();

        // Human-like typing with variable speed and errors (backspace simulation)
        for (const char of text) {
            await tweetBox.type(char, { delay: Math.random() * 80 + 40 });
            if (Math.random() < 0.02) { // 2% chance of "thinking" pause
                await this.simulateHumanWait(500, 2000);
            }
        }

        await this.simulateHumanWait(1500, 4000);
        await this.page.click('[data-testid="tweetButton"]');
        await this.simulateHumanWait(2000, 5000);
    }

    public async updateBio(newBio: string) {
        if (!this.page) return;
        logger.info(`ExecutionEngine: Updating bio to: ${newBio}`);

        await this.page.goto(`https://x.com/${this.config.x.username}`);
        await this.page.waitForSelector('[data-testid="editProfileButton"]');
        await this.page.click('[data-testid="editProfileButton"]');
        await this.simulateHumanWait(1000, 3000);

        const bioInput = this.page.locator('textarea[name="description"]');
        await bioInput.fill(newBio);
        await this.simulateHumanWait(2000, 4000);

        await this.page.click('[data-testid="Profile_Save_Button"]');
        await this.simulateHumanWait(2000, 5000);
    }

    private async simulateNaturalBrowsing() {
        if (!this.page) return;
        logger.info('ExecutionEngine: Simulating natural browsing...');

        for (let i = 0; i < 2; i++) {
            const scrollY = Math.floor(Math.random() * 400) + 100;
            await this.page.mouse.wheel(0, scrollY);
            await this.simulateHumanWait(1500, 4000);

            // Small mouse moves to simulate reading
            await this.page.mouse.move(Math.random() * 500, Math.random() * 500);
        }
    }

    private async simulateHumanWait(min: number, max: number) {
        const delay = Math.floor(Math.random() * (max - min + 1) + min);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    public async close() {
        if (this.browser) await this.browser.close();
    }
}
