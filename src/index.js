import {
    Ion,
    Viewer,
    createWorldTerrain,
    createOsmBuildings,
    Cartesian3,
    Math,
    GoogleMaps,
    Transforms,
    Matrix3,
    HeadingPitchRoll,
    Cartographic,
    VerticalOrigin,
    CallbackProperty
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
import {Color} from "three";
import {func} from "three/nodes";

const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MmNhZjFkMi1hZjljLTQ5ZTEtOGIxZi1iMTc2MGI0YTcwYzgiLCJpZCI6MTM5ODcxLCJpYXQiOjE2ODQ0ODE5NTB9.mnZxaWR_9ighSvgIKlUs63rrCmPChtDo80vf7xuUuYg';
Ion.defaultAccessToken = key;
const apiKey = 'AIzaSyDey2NY3Aq7IEjgeE4bjh0WDQRPZA3OcGA';
GoogleMaps.defaultApiKey = apiKey;


// Create view
const viewer = new Viewer('cesiumContainer', {
   imageryProvider: false,
  terrainProvider: createWorldTerrain({
    requestWaterMask: true, // water effects
    requestVertexNormals: true,
    infoBox: false,
    selectionIndicator: false,
    shadows: true,
    shouldAnimate: true,
  })
});

/*
    Add Cesium OSM Buildings, a global 3D buildings layer
*/
viewer.scene.primitives.add(createOsmBuildings());

/*
    Set the initial camera
*/
viewer.scene.camera.setView({
    destination: Cartesian3.fromDegrees(-74.019, 40.6912, 1000),
    orientation: {
        heading: 0,
        pitch: 0,
    },
});

/*
    Set goal position
*/
const goalPosition = Cartesian3.fromDegrees(-73.019, 41.6912, 1000);

/*
    Add a point
*/
function createPoint() {
    const pin = viewer.entities.add({
        id: "goal",
        position: goalPosition,
        billboard: {
            image: "http://localhost:3000/images/pin.png",
            scale: 0.1,
            verticalOrigin: VerticalOrigin.BOTTOM
        }
    });
    return pin;
}

/*
    Add label for statistics
*/
const statLabel = document.getElementById("statLabel");
function updateStats(position, speed) {

    const position1 = goalPosition;
    const position2 = position._value;

    // Calculate distance between model and destination
    const distance = Cartesian3.distance(position1, position2) / 1000;
    // Retrieve information about catrographic propreties of destination
    const cartographic = Cartographic.fromCartesian(goalPosition);

    const statistics = 'Destination: ' + Math.toDegrees(cartographic.longitude) + ' ' + Math.toDegrees(cartographic.latitude) + '\nDistance in km: ' + distance +
    '\nSpeed: ' + speed;

    statLabel.innerText = statistics;
}

/*
    Add line
*/
function createLine() {
    const line = viewer.entities.add({
        name: "line",
        polyline: {
            // Make a line follow already existing properties
            positions: new CallbackProperty(() => {
                // Retrieve the current positions of the model
                const planePosition = viewer.entities.getById('plane').position.getValue(viewer.clock.currentTime);
                // Retrieve the current positions of the goal
                const goalPosition = viewer.entities.getById('goal').position.getValue(viewer.clock.currentTime);
    
                // Return an array containing the plane's position and the goal's position
                return [planePosition, goalPosition];
            }, false),
            // Set line's width
            width: 10
        }
    });
    return line;
}

/*
    Add model
*/
function createModel(url, pos, scale) {
    viewer.entities.removeAll();
    const hpr = new HeadingPitchRoll(0, 0, 0);
    const orientation = Transforms.headingPitchRollQuaternion(pos, hpr);
    // Plane entity
    const entity = viewer.entities.add({
        id: "plane",
        name: "Model",
        position: pos,
        orientation: orientation,
        model: {
            uri: url,
            scale: scale,
            minimumPixelSize: 128,
            maximumScale: 20000,
        },
    });
    // Make the model a tracked object
    viewer.trackedEntity = entity;
    // Create navigation path
    createLine();
    // Create a goal pin
    createPoint();
    return entity;
}

/*
    Initial position for a model
*/
const pos = Cartesian3.fromDegrees(
    -74.019,
    40.6912,
    1000.0
);

/*
    Create a model, point and line entities
*/
let entity = createModel("http://localhost:3000/images/Cesium_Air.glb", pos);

/*
    Select different model
*/
const modelSelect = document.getElementById("modelSelect");
modelSelect.addEventListener("change", function () {
    const selectedValue = modelSelect.value;
    let position;
    switch (selectedValue) {
        case "aircraft":
            position = entity.position.getValue(viewer.clock.currentTime, new Cartesian3())
            entity = createModel("http://localhost:3000/images/Cesium_Air.glb", position, 1);
            entity.name = selectedValue;
            break;
        case "passenger_plane":
            position = entity.position.getValue(viewer.clock.currentTime, new Cartesian3())
            entity = createModel("http://localhost:3000/images/Airplane.glb", position, 1);
            entity.name = selectedValue;
            break;
        case "ww1":
            position = entity.position.getValue(viewer.clock.currentTime, new Cartesian3())
            entity = createModel("http://localhost:3000/images/ww1.glb", position, 1);
            entity.name = selectedValue;
            break;
        case "falcon":
            position = entity.position.getValue(viewer.clock.currentTime, new Cartesian3())
            entity = createModel("http://localhost:3000/images/falcon.glb", position, 0.1);
            entity.name = selectedValue;
            break;
    }
});

let speed = 0.1; // Initial speed value
let headingRotationSpeed = 0.02 / 60; // Rotation speed value\
let pitchRotationSpeed = 0.2; // Rotation speed value
let rollRotationSpeed = 0.2; // Rotation speed value
let acceleration = 0.01; // Speed increment value
let headingOffset = 0;
let pitchOffset = 0;
let rollOffset = 0;
let minimalSpeed = 0.1

/*
    Change flight control parameters based on chosen model of a plane
*/
switch(entity.name){
    case "falcon":
        speed = 0.69; // Initial speed value
        headingRotationSpeed = 0.2/60; // Rotation speed value\
        pitchRotationSpeed = 0.5; // Rotation speed value
        rollRotationSpeed = 0.5; // Rotation speed value
        acceleration = 0.069; // Speed increment value
        break;
    case "ww1":
        speed = 0.35; // Initial speed value
        headingRotationSpeed = 0.3/60; // Rotation speed value\
        pitchRotationSpeed = 0.5; // Rotation speed value
        rollRotationSpeed = 0.5; // Rotation speed value
        acceleration = 0.04; // Speed increment value
        break;
    case "passenger_plane":
        speed = 0.1; // Initial speed value
        headingRotationSpeed = 0.02/60; // Rotation speed value\
        pitchRotationSpeed = 0.1; // Rotation speed value
        rollRotationSpeed = 0.1; // Rotation speed value
        acceleration = 0.01; // Speed increment value
        break;
    case "aircraft":
        speed = 0.25; // Initial speed value
        headingRotationSpeed = 0.02/60; // Rotation speed value\
        pitchRotationSpeed = 0.2; // Rotation speed value
        rollRotationSpeed = 0.2; // Rotation speed value
        acceleration = 0.05; // Speed increment value
        break;
    default:
        speed = 0.25; // Initial speed value
        headingRotationSpeed = 0.02/60; // Rotation speed value\
        pitchRotationSpeed = 0.2; // Rotation speed value
        rollRotationSpeed = 0.2; // Rotation speed value
        acceleration = 0.05; // Speed increment value
        break;
}

/*
    Per frame mechanism for updating plane's position according to its orientation 
    and update statistics
*/
viewer.clock.onTick.addEventListener(function (clock) {
    const currentPosition = entity.position.getValue(clock.currentTime, new Cartesian3());
    const orientation = entity.orientation.getValue(viewer.clock.currentTime, new HeadingPitchRoll());
    // Automatiacally turn left if model is lening left
    if(rollOffset < 0){
        // Turning angle depends on strenght of the lean and movement speed
        headingOffset -= headingRotationSpeed * (-rollOffset) * speed;
    }
    // Automatially turn right if model is leaning right
    if(rollOffset > 0){
        // Turning angle depends on strenght of the lean and movement speed
        headingOffset += headingRotationSpeed * (rollOffset) * speed;
    }
    // Update visual orientation of the model
    var hpr = new HeadingPitchRoll(headingOffset, pitchOffset, rollOffset);    
    entity.orientation = Transforms.headingPitchRollQuaternion(currentPosition, hpr);
    orientation.roll = rollOffset;
    orientation.heading = headingOffset;
    orientation.pitch = pitchOffset;
    const forwardVector = new Cartesian3();
    const quaternion = Transforms.headingPitchRollQuaternion(entity.position.getValue(clock.currentTime, new Cartesian3()), orientation);
    Matrix3.multiplyByVector(Matrix3.fromQuaternion(quaternion), Cartesian3.UNIT_X, forwardVector);
    Cartesian3.normalize(forwardVector, forwardVector);
    const movement = Cartesian3.multiplyByScalar(forwardVector, speed, new Cartesian3());
    // Update model's position according to current movement speed
    const newPosition = Cartesian3.add(currentPosition, movement, new Cartesian3());
    entity.position._value = newPosition;
    // Update flight statistics
    updateStats(entity.position, speed);
});

/*
    A control mechanism for model's control from keyboard

    Left arrow -> roll to the left
    Right arrow -> roll to the right
    Up arrow -> pitch down
    Down arrow -> pitch up
    Spacebar -> speed up
    Control -> slow down
*/
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 38: // Up arrow
            var currentPosition = entity.position.getValue(viewer.clock.currentTime, new Cartesian3());
            var heading = headingOffset;
            var pitch = pitchOffset;
            var roll = rollOffset;
            // Udpate model's pitch when an arrow up is pressed
            pitch -= Math.toRadians(pitchRotationSpeed);
            pitchOffset = pitch;
            var hpr = new HeadingPitchRoll(heading, pitch, roll);
            // Change model's orientation according to change in pitch
            entity.orientation = Transforms.headingPitchRollQuaternion(currentPosition, hpr);
            break;
        case 40: // Down arrow
            var currentPosition = entity.position.getValue(viewer.clock.currentTime, new Cartesian3());
            var heading = headingOffset;
            var pitch = pitchOffset;
            var roll = rollOffset;
            // Udpate model's pitch when an arrow down is pressed
            pitch += Math.toRadians(pitchRotationSpeed);
            pitchOffset = pitch;
            var hpr = new HeadingPitchRoll(heading, pitch, roll);
            // Change model's orientation according to change in pitch
            entity.orientation = Transforms.headingPitchRollQuaternion(currentPosition, hpr);
            break;
        case 37: // Left arrow
            var currentPosition = entity.position.getValue(viewer.clock.currentTime, new Cartesian3());
            var heading = headingOffset;
            var pitch = pitchOffset;
            var roll = rollOffset;
            // Udpate model's roll when an arrow left is pressed
            rollOffset -= Math.toRadians(rollRotationSpeed);
            roll = rollOffset;
            var hpr = new HeadingPitchRoll(heading, pitch, roll);
            // Change model's orientation according to change in roll
            entity.orientation = Transforms.headingPitchRollQuaternion(currentPosition, hpr);
            break;
        case 39: // Right arrow
            var currentPosition = entity.position.getValue(viewer.clock.currentTime, new Cartesian3());
            var heading = headingOffset;
            var pitch = pitchOffset;
            var roll = rollOffset;
            // Udpate model's roll when an arrow left is pressed
            rollOffset += Math.toRadians(rollRotationSpeed);
            roll = rollOffset;
            var hpr = new HeadingPitchRoll(heading, pitch, roll);
            // Change model's orientation according to change in roll
            entity.orientation = Transforms.headingPitchRollQuaternion(currentPosition, hpr);
            break;
        case 32: // Space bar
            // Make model move faster when spacebar is pressed
            speed += acceleration;
            break;
        case 17: // Ctrl
            // Make model move slower when control is pressed
            speed -= acceleration;
            // Limit the speed to a minimum of 0.01
            speed = (speed > minimalSpeed) ? speed : minimalSpeed;
            break;
    }
});
