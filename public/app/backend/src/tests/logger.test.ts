import { Logger } from '../utils/logger';

describe('Logger Tests', () => {
    let logger: Logger;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        logger = new Logger('TestContext');
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'debug').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('devrait logger les messages info avec le contexte', () => {
        const message = 'Test message';
        logger.info(message);
        expect(console.log).toHaveBeenCalledWith('[TestContext] INFO: Test message', '');
    });

    it('devrait logger les erreurs avec le contexte', () => {
        const error = new Error('Test error');
        logger.error('Error message', error);
        expect(console.error).toHaveBeenCalledWith('[TestContext] ERROR: Error message', error);
    });

    it('devrait logger les avertissements avec le contexte', () => {
        logger.warn('Warning message');
        expect(console.warn).toHaveBeenCalledWith('[TestContext] WARN: Warning message', '');
    });

    it('devrait logger les messages debug avec le contexte', () => {
        const meta = { key: 'value' };
        logger.debug('Debug message', meta);
        expect(console.debug).toHaveBeenCalledWith('[TestContext] DEBUG: Debug message', meta);
    });

    it('devrait gérer les métadonnées undefined', () => {
        logger.info('Test message');
        expect(console.log).toHaveBeenCalledWith('[TestContext] INFO: Test message', '');
    });
}); 