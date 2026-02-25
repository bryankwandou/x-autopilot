import { HypeEvent, ScoredEvent, ContentPiece, ExecutionReceipt } from './types';
import { winstonLogger as logger } from './utils/logger';
import { TrendScanner } from './modules/TrendScanner';
import { AngleGenerator } from './modules/AngleGenerator';
import { ContentFactory } from './modules/ContentFactory';
import { ExecutionEngine } from './modules/ExecutionEngine';
import { ReplySwarmEngine } from './modules/ReplySwarmEngine';
import { RiskMitigationModule } from './modules/RiskMitigation';
import { ConfigManager, SystemConfig } from './utils/ConfigManager';
import { BioGenerator } from './modules/BioGenerator';
import { ImageGenerator } from './modules/ImageGenerator';

export class AutopilotEngine {
    private isRunning: boolean = false;
    private trendScanner: TrendScanner;
    private angleGenerator: AngleGenerator;
    private contentFactory: ContentFactory;
    private executionEngine: ExecutionEngine;
    private replySwarm: ReplySwarmEngine;
    private riskMitigation: RiskMitigationModule;
    private bioGenerator: BioGenerator;
    private imageGenerator: ImageGenerator;
    private configManager: ConfigManager;
    private config: SystemConfig;

    constructor() {
        logger.info('Initializing X-Autopilot-Assistant Engine...');
        this.configManager = new ConfigManager();
        this.config = this.configManager.get();

        this.trendScanner = new TrendScanner();
        this.angleGenerator = new AngleGenerator();
        this.contentFactory = new ContentFactory();
        this.executionEngine = new ExecutionEngine(this.configManager);
        this.replySwarm = new ReplySwarmEngine(this.executionEngine, this.contentFactory);
        this.riskMitigation = new RiskMitigationModule();
        this.bioGenerator = new BioGenerator();
        this.imageGenerator = new ImageGenerator();
    }

    public async start() {
        this.isRunning = true;
        logger.info('Engine started. Entering Autonomous Loop...');

        await this.executionEngine.initialize();

        while (this.isRunning) {
            try {
                await this.runIteration();
            } catch (error) {
                logger.error('Critical Loop Error:', error);
                await this.handleCriticalFailure(error);
            }

            // Randomized heartbeat delay (3-10 minutes for safety) from config logic
            const delay = Math.floor(Math.random() * (600000 - 180000 + 1) + 180000);
            logger.info(`Sleeping for ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    private async runIteration() {
        logger.info('--- New Iteration Start ---');

        // 1. Detect Hype Events
        const events: HypeEvent[] = await this.trendScanner.scan();

        // Convert to ScoredEvents
        const scoredEvents: ScoredEvent[] = events.map(e => this.calculateHypeScore(e));

        // 2. High-Velocity Replies (Reply Swarm)
        await this.replySwarm.processPotentialReplies(scoredEvents);

        // 3. Original Content Generation
        for (const scoredEvent of scoredEvents) {
            if (scoredEvent.hypeScore < this.config.thresholds.min_hype_score) continue;

            const angleSet = await this.angleGenerator.generateAngles(scoredEvent);
            if (!angleSet || angleSet.angles.length === 0) continue;

            const bestAngle = this.angleGenerator.selectBestAngle(angleSet);
            const content = await this.contentFactory.createContent(scoredEvent, bestAngle);

            if (!content) continue;

            // SECTION 5: VISUAL DECISION LOGIC (Final Execution)
            if (content.hasVisual && content.visualPrompt) {
                const visualUrl = await this.imageGenerator.generateVisual(content.visualPrompt);
                content.visualUrl = visualUrl || undefined;
            }

            // 4. Risk Mitigation Check
            if (!this.riskMitigation.validateContent(content)) continue;

            logger.info(`Valid Content Ready: ${content.text.substring(0, 50)}...`);

            // 5. Execution
            const receipt = await this.executionEngine.execute(content);

            if (receipt.status === 'success') {
                logger.info(`Action Executed Successfully: Content ID ${content.id}`);
            }
        }

        // 6. Performance Maintenance
        await this.performMaintenance();
    }

    private calculateHypeScore(event: HypeEvent): ScoredEvent {
        const { velocity_score, emotion_score, controversy_score, estimated_half_life } = event;
        const vScore = Math.min((velocity_score / 500) * 100, 100) * 0.40;
        const sScore = Math.abs(emotion_score) * 100 * 0.20;
        const cScore = controversy_score * 100 * 0.30;
        const nScore = (estimated_half_life / 24) * 100 * 0.10;

        return { ...event, hypeScore: vScore + sScore + cScore + nScore };
    }

    private async performMaintenance() {
        // SECTION 7: FOLLOWER CONVERSION (Bio Optimization)
        if (Math.random() < 0.1) {
            const topEvents = (await this.trendScanner.scan()).slice(0, 3).map(e => this.calculateHypeScore(e));
            const newBio = await this.bioGenerator.generateOptimizedBio(topEvents);
            await this.executionEngine.updateBio(newBio);
        }

        // SECTION 10: RATE CONTROL (Peak Hour Check)
        const hour = new Date().getHours();
        if (hour >= 1 && hour <= 5) { // UTC Sleep hours (1 AM to 5 AM)
            logger.info('Peak Hour Control: Entering low-activity mode for target sleeping hours.');
            // (Optional: Adjust delay or skip iteration)
        }

        this.riskMitigation.monitorEngagement(10, 500);
        logger.info('Iteration cleanup and maintenance complete.');
    }

    private async handleCriticalFailure(error: any) {
        logger.warn('Triggering Fail-Safe Mode...');
        this.riskMitigation.setFailSafe(true);
    }

    public async stop() {
        this.isRunning = false;
        await this.executionEngine.close();
        logger.info('Engine stopped.');
    }
}
