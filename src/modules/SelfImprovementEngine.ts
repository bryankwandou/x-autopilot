import { PerformanceAnalyzer } from './PerformanceAnalyzer';
import { winstonLogger as logger } from '../utils/logger';
import { ConfigManager } from '../utils/ConfigManager';
import * as fs from 'fs';
import * as path from 'path';

export class SelfImprovementEngine {
    private denylistPath: string;

    constructor(
        private analyzer: PerformanceAnalyzer,
        private configManager: ConfigManager
    ) {
        this.denylistPath = path.join(process.cwd(), 'config', 'format_denylist.json');
        if (!fs.existsSync(this.denylistPath)) {
            fs.writeFileSync(this.denylistPath, JSON.stringify({ dead_formats: [] }));
        }
    }

    public evolveStrategy() {
        const signals = this.analyzer.getOptimizationSignals();
        if (!signals) return;

        logger.info('SelfImprovement: Triggering nightly logic-based evolution cycle.');
        const currentConfig = this.configManager.get();

        // 1. Identify winning hooks
        if (signals.topHooks.length > 0) {
            logger.info(`SelfImprovement: ALPHA formats detected: ${signals.topHooks.join(', ')}`);
            // Instructing the Execution Engine implicitly by logging alphas to analytics DB.
        }

        // 2. Kill low-performing formats
        if (signals.killHooks.length > 0) {
            logger.warn(`SelfImprovement: DEAD formats detected and execution halted: ${signals.killHooks.join(', ')}`);
            this.addToDenylist(signals.killHooks);
        }

        // 3. Adjust Hype Thresholds dynamically based on global engagement
        if (signals.avgEngagement < 0.05) {
            logger.info('SelfImprovement: Engagement metric baseline breached. Tightening Hype Score algorithm parameter by +5.');

            if (currentConfig.thresholds && currentConfig.thresholds.min_hype_score) {
                // Mutating live config to force the system to accept only higher-quality events
                currentConfig.thresholds.min_hype_score = Math.min(currentConfig.thresholds.min_hype_score + 5, 95);
                this.configManager.update(currentConfig);
            }
        }
    }

    private addToDenylist(hooks: string[]) {
        try {
            const fileData = JSON.parse(fs.readFileSync(this.denylistPath, 'utf8'));
            const currentList = new Set(fileData.dead_formats);

            hooks.forEach(h => currentList.add(h));
            fs.writeFileSync(this.denylistPath, JSON.stringify({ dead_formats: Array.from(currentList) }, null, 2));
            logger.info('SelfImprovement: Denylist successfully updated on disk.');
        } catch (error) {
            logger.error('SelfImprovement: Failed to write to denylist.', error);
        }
    }
}
