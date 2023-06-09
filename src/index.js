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
    Matrix4,
    Model, 
    HeadingPitchRoll,
    Quaternion 
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"

const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MmNhZjFkMi1hZjljLTQ5ZTEtOGIxZi1iMTc2MGI0YTcwYzgiLCJpZCI6MTM5ODcxLCJpYXQiOjE2ODQ0ODE5NTB9.mnZxaWR_9ighSvgIKlUs63rrCmPChtDo80vf7xuUuYg';
Ion.defaultAccessToken = key;
const apiKey = 'AIzaSyDey2NY3Aq7IEjgeE4bjh0WDQRPZA3OcGA';
GoogleMaps.defaultApiKey = apiKey;


// create view
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

// photorealistic buildings and terrain - not sure if it looks nice
// const tileset = viewer.scene.primitives.add(new Cesium3DTileset({
//    url: "https://tile.googleapis.com/v1/3dtiles/root.json?key=" + apiKey,
//    showCreditsOnScreen: false,
// }));

// Add Cesium OSM Buildings, a global 3D buildings layer.
viewer.scene.primitives.add(createOsmBuildings());

// set the initial camera
viewer.scene.camera.setView({
    destination: Cartesian3.fromDegrees(-74.019, 40.6912, 1000),
    orientation: {
        heading: 0,
        pitch: 0,
    },
});

// add model
function createModel(url, pos, scale) {
    viewer.entities.removeAll();

    const position = pos;

    const heading = Math.toRadians(0);
    const pitch = 0;
    const roll = 0;
    const hpr = new HeadingPitchRoll(heading, pitch, roll);
    const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

    // plane
    const entity = viewer.entities.add({
        name: "Model",
        position: position,
        orientation: orientation,
        model: {
            uri: url,
            scale: scale,
            minimumPixelSize: 128,
            maximumScale: 20000,
        },
    });
    viewer.trackedEntity = entity;
    return entity;
}

// initial model is airplane
const pos = Cartesian3.fromDegrees(
    -74.019,
    40.6912,
    1000.0
);
let entity = createModel("http://localhost:3000/images/Cesium_Air.glb", pos);
let position = entity.position;

console.log(position)

// select different model
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

position = entity.position;

let speed = 0.1; // Initial speed value
let headingRotationSpeed = 0.02/60; // Rotation speed value\
let pitchRotationSpeed = 0.2; // Rotation speed value
let rollRotationSpeed = 0.2; // Rotation speed value
let acceleration = 0.01; // Speed increment value
let headingOffset = 0;
let pitchOffset = 0;
let rollOffset = 0;
let minimalSpeed = 0.1

switch(entity.name){//change flight control params based on chosen model
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

viewer.clock.onTick.addEventListener(function (clock) {
    const currentPosition = position.getValue(clock.currentTime, new Cartesian3());
    const orientation = entity.orientation.getValue(viewer.clock.currentTime, new HeadingPitchRoll());
    if(rollOffset < 0){            
        headingOffset -= headingRotationSpeed * (-rollOffset);
    }
    if(rollOffset > 0){
        headingOffset += headingRotationSpeed * (rollOffset);
    }
    var hpr = new HeadingPitchRoll(headingOffset, pitchOffset, rollOffset);
    entity.orientation = Transforms.headingPitchRollQuaternion(currentPosition, hpr);
    orientation.roll = rollOffset;
    orientation.heading = headingOffset;
    orientation.pitch = pitchOffset;
    const forwardVector = new Cartesian3();
    const quaternion = Transforms.headingPitchRollQuaternion(position.getValue(clock.currentTime, new Cartesian3()), orientation);
    Matrix3.multiplyByVector(Matrix3.fromQuaternion(quaternion), Cartesian3.UNIT_X, forwardVector);
    Cartesian3.normalize(forwardVector, forwardVector);

    const movement = Cartesian3.multiplyByScalar(forwardVector, speed, new Cartesian3());

    const newPosition = Cartesian3.add(currentPosition, movement, new Cartesian3());
    position._value = newPosition;

    entity.position = position;
});

document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 38: // up arrow
            var currentPosition = entity.position.getValue(viewer.clock.currentTime, new Cartesian3());
            var heading = headingOffset;
            var pitch = pitchOffset;
            var roll = rollOffset;
            pitch -= Math.toRadians(pitchRotationSpeed);
            pitchOffset = pitch;
            var hpr = new HeadingPitchRoll(heading, pitch, roll);
            entity.orientation = Transforms.headingPitchRollQuaternion(currentPosition, hpr);
            break;
        case 40: // down arrow
            var currentPosition = entity.position.getValue(viewer.clock.currentTime, new Cartesian3());
            var heading = headingOffset;
            var pitch = pitchOffset;
            var roll = rollOffset;
            pitch += Math.toRadians(pitchRotationSpeed);
            pitchOffset = pitch;
            var hpr = new HeadingPitchRoll(heading, pitch, roll);
            entity.orientation = Transforms.headingPitchRollQuaternion(currentPosition, hpr);
            break;  
        case 37: // left arrow
            var currentPosition = entity.position.getValue(viewer.clock.currentTime, new Cartesian3());
            var heading = headingOffset;
            var pitch = pitchOffset;
            var roll = rollOffset;
            rollOffset -= Math.toRadians(rollRotationSpeed);
            roll = rollOffset;
            var hpr = new HeadingPitchRoll(heading, pitch, roll);
            entity.orientation = Transforms.headingPitchRollQuaternion(currentPosition, hpr);
            break;
        case 39: // right arrow
            var currentPosition = entity.position.getValue(viewer.clock.currentTime, new Cartesian3());
            var heading = headingOffset;
            var pitch = pitchOffset;
            var roll = rollOffset;
            rollOffset += Math.toRadians(rollRotationSpeed);
            roll = rollOffset;
            var hpr = new HeadingPitchRoll(heading, pitch, roll);
            entity.orientation = Transforms.headingPitchRollQuaternion(currentPosition, hpr);
            break;
        case 32: // space bar
            speed += acceleration;
            break;
        case 17: // ctrl
            speed -= acceleration;
            // Limit the speed to a minimum of 0.01
            speed = (speed > minimalSpeed) ? speed : minimalSpeed;
            break;
    }
});
