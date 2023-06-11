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
    Quaternion,
    Entity,
    SampledPositionProperty,
    JulianDate,
    Cartographic,
    ConstantPositionProperty,
    Label,
    HorizontalOrigin, VerticalOrigin, Cartesian2, DistanceDisplayCondition, Cartesian4 as pinBuilder, EllipsoidGeodesic
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
import {Color} from "three";
import {func} from "three/nodes";

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

const goalPosition = Cartesian3.fromDegrees(-73.019, 41.6912, 1000);

// add point
function createPoint() {
    const pin = viewer.entities.add({
        position: goalPosition,
        billboard: {
            image: "http://localhost:3000/images/pin.png",
            scale: 0.1,
            verticalOrigin: VerticalOrigin.BOTTOM
        }
    });
}

// add label
const statLabel = document.getElementById("statLabel");
function updateStats(position, speed) {
    // Your code to calculate or retrieve statistics goes here
    const position1 = goalPosition;
    const position2 = position._value;

    const distance = Cartesian3.distance(position1, position2) / 1000;
    const cartographic = Cartographic.fromCartesian(goalPosition);

    const statistics = 'Destination: ' + Math.toDegrees(cartographic.longitude) + ' ' + Math.toDegrees(cartographic.latitude) + '\nDistance in km: ' + distance +
    '\nSpeed: ' + speed;

    statLabel.innerText = statistics;
}

var pathLine;

// add line
function createLine(pos) {
    const cartographic = Cartographic.fromCartesian(pos._value);
    const longitude = Math.toDegrees(cartographic.longitude);
    const latitude = Math.toDegrees(cartographic.latitude);
    const height = cartographic.height;

    const cartographic2 = Cartographic.fromCartesian(goalPosition);
    const longitude2 = Math.toDegrees(cartographic2.longitude);
    const latitude2 = Math.toDegrees(cartographic2.latitude);
    const line = viewer.entities.add({
        name: "line",
        polyline: {
            positions: Cartesian3.fromDegreesArray([longitude, latitude, longitude2, latitude2]),
            width: 10,
            clampToGround: true
        },
    });
   // const time = JulianDate.now();
   // const position = Cartesian3.fromDegreesArray([longitude, latitude, 125, 35]);
   // line.polyline.positions.addSample(time, position);
    pathLine = line;
    return line;
}

// function getEntityByName(name) {
//     const entities = viewer.entities.values;
//     for (let i = 0; i < entities.length; i++) {
//         if (entities[i].name === name) {
//             return entities[i];
//         }
//     }
//     return undefined;
// }
//
// function updateLine(pos) {
//    // const line = getEntityByName("line");
//     const line = pathLine;
//     const cartographic = Cartographic.fromCartesian(pos._value);
//     const longitude = Math.toDegrees(cartographic.longitude);
//     const latitude = Math.toDegrees(cartographic.latitude);
//     const height = cartographic.height;
//
//     const p = Cartesian3.fromDegreesArray([longitude, latitude, 125, 35]);
//
//     if (line) {
//        // console.log(line.polyline.positions);
//         //line.polyline.positions = Cartesian3.fromDegreesArray([longitude, latitude, 125, 35]);
//         //line.polyline.positions
//         const positionsProperty = line.polyline.positions;
//
//         // Clear the existing samples
//         //positionsProperty.removeSamples(JulianDate.now());
//
//         // Add the new sample at the current time
//         const time = JulianDate.now();
//         const position = Cartesian3.fromDegrees(longitude, latitude);
//
//
//         const constantPosition = new ConstantPositionProperty(Cartesian3.fromDegrees(longitude, latitude, height));
//
//         line.polyline.positions = constantPosition;
//         // positionsProperty.addSample(time, position);
//        // console.log(line.polyline.positions);
//         // Perform any necessary updates to the redLine entity here
//     } else {
//         console.log("Red line entity not found.");
//     }
// }

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
    createLine(entity.position);
    //createLabel("XD", -10, -10);
    createPoint();
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
const cartographic = Cartographic.fromCartesian(position._value);
const longitude = Math.toDegrees(cartographic.longitude);
const latitude = Math.toDegrees(cartographic.latitude);
const height = cartographic.height;

console.log("Longitude:", longitude);
console.log("Latitude:", latitude);
console.log("Height:", height);


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
let headingRotationSpeed = 0.02 / 60; // Rotation speed value\
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
    updateStats(position, speed);

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
