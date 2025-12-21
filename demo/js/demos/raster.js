import { createAgent, Draggable, Raster } from 'brainiac-engine';

export function startRasterDemo(server) {
  server.clearCurrentDemo();
  server.currentDemo = 'raster';
  console.log('Starting Grid Movement Demo...');

  try {
    // Create a raster-based agent
    const rasterAgent = createAgent(
      server.beServer,
      'media/images/blue_square.png',
      50,
      50,
      false,
      200,
      200,
    );

    Raster.call(rasterAgent);
    Draggable.call(rasterAgent, true, true);
    server.demoAgents.push(rasterAgent);

    // Create multiple raster agents in a grid
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const gridAgent = createAgent(
          server.beServer,
          'media/images/blue_square.png',
          30,
          30,
          false,
          400 + x * 60,
          150 + y * 60,
        );

        Raster.call(gridAgent);
        server.demoAgents.push(gridAgent);
      }
    }

    server.updateDemoInfo(
      'Grid Movement: Raster mixin constrains movement to grid positions',
    );
  } catch (error) {
    console.error('Error in raster demo:', error);
  }
}
