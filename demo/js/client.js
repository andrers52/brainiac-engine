// Client class with demo controls
export function AdvancedInteractiveTestsClient() {
  console.log('Creating AdvancedInteractiveTestsClient...');

  this.start = function () {
    console.log('Advanced Interactive Tests client started');
    this.setupDemoControls();
  };

  this.setupDemoControls = function () {
    console.log('Setting up demo controls...');
    // Setup demo control buttons
    const buttons = document.querySelectorAll('.demo-controls button');
    console.log('Found buttons:', buttons.length);

    buttons.forEach((button) => {
      console.log(
        'Setting up button:',
        button.textContent,
        'demo:',
        button.dataset.demo,
      );
      button.addEventListener('click', (e) => {
        console.log('Button clicked:', e.target.dataset.demo);
        const demo = e.target.dataset.demo;

        // Update active button
        buttons.forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');

        // Trigger demo change (this would need to communicate with server)
        this.changeDemoMode(demo);
      });
    });
  };

  this.changeDemoMode = function (demo) {
    console.log('Changing demo mode to:', demo);
    console.log('window.serverInstance:', window.serverInstance);

    // In a real implementation, this would send a message to the server
    // For now, we'll update the info display
    const infoElement = document.getElementById('demo-info');
    if (infoElement) {
      let infoText = '';
      switch (demo) {
      case 'mixins':
        infoText = 'Visual Effects: Pulsate, Spin, and Fade mixins in action';
        // Trigger server demo change here
        console.log('Calling startMixinsDemo...');
        window.serverInstance?.startMixinsDemo();
        break;
      case 'sensing':
        infoText =
            'Collision & Sensing: Watch agents detect collisions and world boundaries';
        console.log('Calling startSensingDemo...');
        window.serverInstance?.startSensingDemo();
        break;
      case 'widgets':
        infoText = 'UI Widgets: Buttons, labels, and basic widgets';
        console.log('Calling startWidgetsDemo...');
        window.serverInstance?.startWidgetsDemo();
        break;
      case 'draggable':
        infoText = 'Draggable Objects: Click and drag the squares and bubble';
        console.log('Calling startDraggableDemo...');
        window.serverInstance?.startDraggableDemo();
        break;
      case 'containers':
        infoText =
            'Layout Containers: Horizontal and vertical layout management';
        console.log('Calling startContainersDemo...');
        window.serverInstance?.startContainersDemo();
        break;
      case 'raster':
        infoText =
            'Grid Movement: Raster mixin constrains movement to grid positions';
        console.log('Calling startRasterDemo...');
        window.serverInstance?.startRasterDemo();
        break;
      case 'clear':
        infoText = 'All demos cleared. Select another demo to continue.';
        console.log('Calling clearCurrentDemo...');
        window.serverInstance?.clearCurrentDemo();
        break;
      }

      infoElement.innerHTML = `<strong>Advanced Interactive Demo</strong><br>${infoText}`;
    }
  };

  this.getMediaAssets = function () {
    console.log('getMediaAssets called');
    return [
      'media/images/star.png',
      'media/images/blue_square.png',
      'media/images/blue_square.png',
      'media/images/bubble.png',
    ];
  };

  this.showInitialScreenAndReturnUserName = function () {
    console.log('showInitialScreenAndReturnUserName called');
    return Promise.resolve('Player');
  };
}
