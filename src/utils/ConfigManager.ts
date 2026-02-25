import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { winstonLogger as logger } from '../utils/logger';

export interface SystemConfig {
    x: {
        username: string;
        auth_token: string;
        ct0: string;
        daily_post_limit: number;
        daily_reply_limit: number;
    };
    llm: {
        provider: 'openai' | 'anthropic';
        model: string;
        temperature: number;
    };
    thresholds: {
        min_hype_score: number;
        min_velocity: number;
        max_repetition_similarity: number;
    };
    safety: {
        max_similarity_threshold: number;
    };
}

export class ConfigManager {
    private config: SystemConfig;

    constructor(configPath: string = 'config/default.yaml') {
        const absolutePath = path.resolve(configPath);
        if (!fs.existsSync(absolutePath)) {
            logger.warn(`Config file not found at ${absolutePath}. Using environment variables only.`);
            this.config = this.loadFromEnv();
        } else {
            const fileContents = fs.readFileSync(absolutePath, 'utf8');
            this.config = yaml.load(fileContents) as SystemConfig;
        }
    }

    private loadFromEnv(): SystemConfig {
        return {
            x: {
                username: process.env.X_USERNAME || '',
                auth_token: process.env.X_AUTH_TOKEN || '',
                ct0: process.env.X_CT0 || '',
                daily_post_limit: parseInt(process.env.X_POST_LIMIT || '5'),
                daily_reply_limit: parseInt(process.env.X_REPLY_LIMIT || '150'),
            },
            llm: {
                provider: (process.env.LLM_PROVIDER as any) || 'openai',
                model: process.env.LLM_MODEL || 'gpt-4o',
                temperature: parseFloat(process.env.LLM_TEMP || '0.7'),
            },
            thresholds: {
                min_hype_score: parseInt(process.env.MIN_HYPE_SCORE || '70'),
                min_velocity: parseInt(process.env.MIN_VELOCITY || '100'),
                max_repetition_similarity: parseFloat(process.env.MAX_SIMILARITY || '0.8'),
            },
            safety: {
                max_similarity_threshold: parseFloat(process.env.MAX_SIMILARITY_THRESHOLD || '0.80')
            }
        };
    }

    public get(): SystemConfig {
        return this.config;
    }

    public update(newConfig: SystemConfig): void {
        this.config = newConfig;
        logger.info('ConfigManager: Live configuration updated in memory.');
    }
}
