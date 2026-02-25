import { PerformanceMetrics } from '../types';
import { winstonLogger as logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class PerformanceAnalyzer {
    private history: PerformanceMetrics[] = [];
    private dbPath: string;

    constructor() {
        this.dbPath = path.join(process.cwd(), 'data', 'metrics.json');
        this.loadHistory();
    }

    private loadHistory() {
        try {
            if (fs.existsSync(this.dbPath)) {
                this.history = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
            } else {
                if (!fs.existsSync(path.dirname(this.dbPath))) {
                    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
                }
                fs.writeFileSync(this.dbPath, JSON.stringify([]));
            }
        } catch (error) {
            logger.error('PerformanceAnalyzer: DB Load Error', error);
        }
    }

    private saveHistory() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.history, null, 2));
        } catch (error) {
            logger.error('PerformanceAnalyzer: DB Save Error', error);
        }
    }

    public logMetrics(metrics: PerformanceMetrics) {
        this.history.push(metrics);
        // Retain only last 1000 records to prevent memory bloat
        if (this.history.length > 1000) this.history.shift();
        this.saveHistory();

        logger.info(`PerformanceAnalyzer: Metrics committed for Payload ID: ${metrics.contentId} | Impressions: ${metrics.impressions}`);
    }

    public getOptimizationSignals() {
        if (this.history.length < 10) {
            logger.debug('PerformanceAnalyzer: Insufficient data (<10 payloads) for optimization derivation.');
            return null;
        }

        const sorted = [...this.history].sort((a, b) => b.impressions - a.impressions);
        const top20 = sorted.slice(0, Math.ceil(sorted.length * 0.2));
        const bottom20 = sorted.slice(-Math.ceil(sorted.length * 0.2));

        const avgEngagement = this.history.reduce((acc, m) => acc + (m.likes + m.replies), 0) / this.history.length;

        logger.info(`PerformanceAnalyzer: Optimization signals synthesized. Top 20% floor: ${top20[top20.length - 1].impressions} impressions.`);

        return {
            topHooks: top20.map(m => m.contentId),
            killHooks: bottom20.map(m => m.contentId),
            avgEngagement
        };
    }
}
