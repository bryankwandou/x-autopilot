import { ContentPiece, ScoredEvent, AngleType, AngleSet } from '../types';
import { winstonLogger as logger } from '../utils/logger';
import { ExecutionEngine } from './ExecutionEngine';
import { ContentFactory } from './ContentFactory';

export class ReplySwarmEngine {
    private replyCountToday: number = 0;
    private readonly MAX_REPLIES = 150;
    private recentRepliedTargets: Map<string, number> = new Map();

    constructor(
        private executionEngine: ExecutionEngine,
        private contentFactory: ContentFactory,
        private configManager?: any // Decoupled config injection
    ) { }

    public async processPotentialReplies(events: ScoredEvent[]) {
        logger.info(`ReplySwarm: Evaluating ${events.length} events for high-velocity engagement.`);

        for (const event of events) {
            if (this.replyCountToday >= this.MAX_REPLIES) {
                logger.warn('ReplySwarm: Maximum daily quota reached (150). Halting swarm.');
                break;
            }

            // SECTION 9: TARGET SELECTION LOGIC
            // Only engage if velocity is extreme and lifespan is early
            if (event.velocity_score >= 80 && event.estimated_half_life >= 6) {

                // Cooldown Rules (Section 9): Avoid spamming the same target
                const targetHost = event.source;
                const lastRepliedTime = this.recentRepliedTargets.get(targetHost);
                if (lastRepliedTime && (Date.now() - lastRepliedTime) < 12 * 60 * 60 * 1000) {
                    logger.info(`ReplySwarm: Skipping ${targetHost} - cooldown active (< 12h).`);
                    continue;
                }

                await this.executeReply(event);
            } else {
                logger.debug(`ReplySwarm: Event ${event.id} velocity too low for swarm.`);
            }
        }
    }

    private async executeReply(event: ScoredEvent) {
        logger.info(`ReplySwarm: Tactical engagement locked on ${event.source} | Topic: ${event.topic}`);

        // SECTION 9: REPLY DIVERSITY STRATEGY
        const styles: Array<{ type: AngleType, prompt: string }> = [
            { type: 'insight', prompt: "Add value: Expand on the technical implication." },
            { type: 'provocative', prompt: "Smart disagreement: Pivot the argument intelligently." },
            { type: 'insight', prompt: "Second-order prediction: What happens in 6 months because of this?" }
        ];

        // Randomly select style to avoid pattern detection
        const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

        const replyAngle = {
            type: selectedStyle.type,
            content: `Engage with target using strategy: ${selectedStyle.prompt}. Keep it under 2 sentences. No emojis.`
        };

        const content = await this.contentFactory.createContent(event, replyAngle as any);
        if (!content) {
            logger.error(`ReplySwarm: Content generation failed for ${event.id}`);
            return;
        }

        content.format = 'reply';

        // Ensure < 90s response latency by setting high priority in Execution Engine
        content.priority = 'HIGH';

        const receipt = await this.executionEngine.execute(content);

        if (receipt.status === 'success') {
            this.replyCountToday++;
            this.recentRepliedTargets.set(event.source, Date.now());
            logger.info(`ReplySwarm: Strike successful. Latency metrics logged. Total today: ${this.replyCountToday}`);
        } else {
            logger.warn(`ReplySwarm: Strike failed on target ${event.source}. Reason: ${receipt.error}`);
        }
    }

    public resetDailyCount() {
        this.replyCountToday = 0;
        // Clean up memory map of old targets to prevent memory leaks
        for (const [key, timestamp] of this.recentRepliedTargets.entries()) {
            if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
                this.recentRepliedTargets.delete(key);
            }
        }
        logger.info('ReplySwarm: Daily metrics and memory caches reset.');
    }
}
