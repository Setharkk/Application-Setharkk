require('@testing-library/jest-dom');

// Configuration globale pour Jest
beforeAll(() => {
  // Setup global test environment
});

afterAll(() => {
  // Cleanup after all tests
});

// Ajout d'extensions personnalisées pour les tests
expect.extend({
  toBeValidService(received) {
    const pass = received && 
                typeof received.id === 'string' &&
                typeof received.name === 'string' &&
                typeof received.initialize === 'function' &&
                typeof received.terminate === 'function';
    
    return {
      pass,
      message: () => pass
        ? `Expected ${received} not to be a valid service`
        : `Expected ${received} to be a valid service`
    };
  }
}); 