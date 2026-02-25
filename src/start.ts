import { AutopilotEngine } from './index';
import { winstonLogger as logger } from './utils/logger';

async function main() {
    const engine = new AutopilotEngine();

    // Handle shutdown signals
    process.on('SIGINT', async () => {
        logger.info('Shutting down engine...');
        await engine.stop();
        process.exit(0);
    });

    try {
        await engine.start();
    } catch (error) {
        logger.error('Fatal Engine Failure:', error);
        process.exit(1);
    }
}

main();
