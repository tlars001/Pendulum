var scene, camera, mouse;
var geometry, material, renderer;
var pendulumGroup, baseMesh, shaftMesh, ballMesh;
var isMobile = false;
var gui = new dat.GUI({
  width : 125
});

class RungeKutta
{
  
  constructor( g, pendulumLength, initialAngle, angularVelocity, maxTimeDelta )
  {
  
    this.g = g;
    this.pendulumLength = pendulumLength;
    this.theta = initialAngle;
    this.omega = angularVelocity;
    this.maxTimeDelta = maxTimeDelta || 0.1;
    
  }
  
  updatePosition( t )
  {
  
    let self = this;
  
    function omegaDot(theta)
    {
      return -( self.g / self.pendulumLength ) * Math.sin( theta );
    }

    function thetaDot(omega)
    {
      return omega;
    }   

    // If the browser tab becomes inactive, then there will be a large
    // time delta, which will disrupt the RungeKutta algorithm.  If more
    // than max allowed seconds has lapsed, then reset the timer.
    if (self.maxTimeDelta < t)
    {
      t = self.maxTimeDelta;
    }
    
    let aomega = omegaDot( self.theta );
    let atheta = thetaDot( self.omega );
    let bomega = omegaDot( self.theta + 0.5 * t * atheta );
    let btheta = thetaDot( self.omega + 0.5 * t * aomega );
    let comega = omegaDot( self.theta + 0.5 * t * btheta );
    let ctheta = thetaDot( self.omega + 0.5 * t * bomega );
    let domega = omegaDot( self.theta + t * ctheta );
    let dtheta = thetaDot( self.omega + t * comega );

    self.omega = self.omega + ( t / 6 ) * ( aomega + 2 * bomega + 2 * comega + domega );
    self.theta = self.theta + ( t / 6 ) * ( atheta + 2 * btheta + 2 * ctheta + dtheta );

    return self;
    
  }
}

var pendulumState = new RungeKutta( 9.81, 1, -Math.PI / 2, 0, 0.1);

var currentTime = performance.now();
var currentTimeLag = currentTime;

init();
animate();

//======================================================================================================================
function init()
{
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50000);
    mouse = new THREE.Vector2();
    scene = new THREE.Scene();

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 150;

    //console.log("TESTING");
  
    // Resize when the orientation changes on mobile
    window.addEventListener("orientationchange", function()
    {
      setTimeout(changeOrientation, 250); // Adds a delay for chrome
    });
  
    // Check if user is on a mobile device
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    {
        document.getElementById('soundIcon').style.width = '40px';
        document.getElementById('infoWindow').style.height = '100%';
        document.getElementById('elementName').style.bottom = '-28px';
        isMobile = true;
  
        // Check if it is landscape or portrait mode
        if (window.innerHeight > window.innerWidth)
        {
            if (/iPad/i.test(navigator.userAgent))
            {
            document.getElementById('settingsWindow').style.width = '40%';
            }
            else
            {
            document.getElementById('settingsWindow').style.width = '70%';
            }
        }
        else
        {
            document.getElementById('settingsWindow').style.width = '40%';
        }
    }

    buildObjects();

    gui.add(pendulumGroup.rotation, 'z', 0, Math.PI * 2);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
  
    document.body.appendChild(renderer.domElement);
  }

//======================================================================================================================
function buildObjects()
{
    // Ball
    geometry = new THREE.SphereGeometry(10.0, 32, 32);
    material = new THREE.MeshBasicMaterial({ color: 0x5a5a5a });
    ballMesh = new THREE.Mesh(geometry, material);
    ballMesh.position.y = -50;
    ballMesh.position.z = 0;

    // Shaft
    geometry = new THREE.BoxGeometry(1, 50, 1);
    material = new THREE.MeshBasicMaterial({ color: 0xd3d3d3 });
    shaftMesh = new THREE.Mesh(geometry, material);
    shaftMesh.position.y = -25;
    shaftMesh.position.z = 0;

    // Base
    geometry = new THREE.SphereGeometry(2.0, 15, 15);
    material = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    baseMesh = new THREE.Mesh(geometry, material);
    baseMesh.position.y = 43;
    baseMesh.position.z = 22;

    // Merge the ball and shaft
    pendulumGroup = new THREE.Group();
    pendulumGroup.add(shaftMesh);
    pendulumGroup.add(ballMesh);

    pendulumGroup.position.y = 50;

    scene.add(baseMesh);
    scene.add(pendulumGroup);
}

//======================================================================================================================
function animate()
{
    requestAnimationFrame(animate);

    currentTime = performance.now();
    pendulumState.updatePosition((currentTime - currentTimeLag) / 1000);
    currentTimeLag = currentTime;

    pendulumGroup.rotation.z = pendulumState.theta;

    renderer.render(scene, camera);
}