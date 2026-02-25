import { ContentPiece } from '../types';
import { winstonLogger as logger } from '../utils/logger';
import { ConfigManager } from '../utils/ConfigManager';

export class RiskMitigationModule {
    private recentContents: string[] = [];
    private isFailSafeActive: boolean = false;
    private maxSimilarityThreshold: number;

    constructor(configManager?: ConfigManager) {
        this.maxSimilarityThreshold = configManager?.get()?.safety?.max_similarity_threshold || 0.80;
    }

    public validateContent(content: ContentPiece): boolean {
        if (this.isFailSafeActive) {
            logger.warn('RiskMitigation: Fail-Safe Mode Active. Blocking non-critical outbound payloads.');
            return false;
        }

        // 1. Repetition Check via Levenshtein Distance
        if (this.isDuplicate(content.text)) {
            logger.warn('RiskMitigation: Content blocked due to high similarity with recent payload outputs.');
            return false;
        }

        // 2. Policy/Structure Architecture Check
        if (content.text.length > 280) {
            logger.warn('RiskMitigation: Content blocked (exceeds 280 chars).');
            return false;
        }

        // We do not just warn, we actively strip hashtags to evade spam algorithms
        if (content.text.includes('#')) {
            logger.warn('RiskMitigation: Hashtag detected. Stripping immediately to evade algorithmic penalization.');
            content.text = content.text.replace(/#\w+/g, '').replace(/\s{2,}/g, ' ').trim();
        }

        this.recentContents.push(content.text);
        if (this.recentContents.length > 50) this.recentContents.shift();

        return true;
    }

    private isDuplicate(text: string): boolean {
        for (const recent of this.recentContents) {
            const similarity = this.calculateSimilarity(text, recent);
            if (similarity >= this.maxSimilarityThreshold) {
                return true;
            }
        }
        return false;
    }

    // Exact Levenshtein Distance Calculation for 100% strict matching
    private calculateSimilarity(s1: string, s2: string): number {
        let costs = new Array();
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        const maxLen = Math.max(s1.length, s2.length);
        if (maxLen === 0) return 1.0;
        return (maxLen - costs[s2.length]) / maxLen;
    }

    public setFailSafe(active: boolean) {
        this.isFailSafeActive = active;
        if (active) logger.info('RiskMitigation: Fail-Safe Mode ENABLED. Engine restricted.');
        else logger.info('RiskMitigation: Fail-Safe Mode DISABLED. Engine unleashed.');
    }

    public monitorEngagement(followerDelta: number, impressionVelocity: number) {
        // 3. Shadowban Detection Logic
        if (impressionVelocity < 100 && followerDelta < -5) {
            logger.error('RiskMitigation: Possible Shadowban Detected via metrics anomaly. Triggering Fail-Safe Circuit Breaker.');
            this.setFailSafe(true);
        }
    }
}
