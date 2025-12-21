import { BEClient, BEServer } from 'brainiac-engine';
import { AdvancedInteractiveTestsClient } from './client.js';
import { AdvancedInteractiveTestsServer } from './server.js';

console.log('Starting advanced interactive tests...');

// Simple test function to verify JavaScript execution
window.testFunction = function () {
  console.log('TEST BUTTON CLICKED!');
  alert('Test button works! JavaScript is running.');
  if (window.serverInstance) {
    console.log('Server instance available, calling startMixinsDemo...');
    window.serverInstance.startMixinsDemo();
  } else {
    console.log('Server instance not available yet');
  }
};

// Main initialization
try {
  console.log('Creating server and client instances...');

  // Create and start server
  const beServer = new BEServer();

  const server = new AdvancedInteractiveTestsServer(beServer);
  window.serverInstance = server; // Make available for demo controls
  beServer.startApp('advanced-interaction-tests', server);
  console.log('Server started successfully');

  // Create and start client
  const clientInstance = new AdvancedInteractiveTestsClient();

  function startClient() {
    console.log('Starting client...');
    try {
      const beClient = new BEClient();
      beClient.start(clientInstance);
      console.log('Client started successfully');

      // Add a direct mouse event listener to test if DOM events work
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          console.log('Adding direct mousedown listener to canvas...');
          canvas.addEventListener('mousedown', (e) => {
            console.log('DIRECT CANVAS MOUSEDOWN EVENT DETECTED!', e);
          });
        }
      }, 1000);

      // Ensure client setup is called after the engine starts
      setTimeout(() => {
        console.log('Calling clientInstance.start()...');
        clientInstance.start();
      }, 500);
    } catch (error) {
      console.error('Error starting client:', error);
    }
  }

  // Enhanced DOM ready check
  function waitForDOMAndStart() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startClient);
    } else {
      startClient();
    }
  }

  waitForDOMAndStart();
} catch (error) {
  console.error('Error in main initialization:', error);
}
