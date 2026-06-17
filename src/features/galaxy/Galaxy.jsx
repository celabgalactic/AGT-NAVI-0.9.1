import React, { useEffect, useRef }from 'react'
import { useDispatch, useSelector } from 'react-redux';
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from '../../three-bundle'
import { circle } from '../../data/assets';

import { getRegionClusters } from './galaxySlice';
import { collapseInfo, setNode } from '../galaxyinfo/GalaxyInfoSlice';
import { collapseMenu } from '../menu/menuSlice';

// Ploting every region with sprite scale = 10 required coord factor = 10 
// as a consequence the galaxy is too large and cannot be display on the screen

export function Galaxy() {
  const dispatch = useDispatch()
  const clusters = useSelector(getRegionClusters)
  const scale = 10
  const distance = 120
  
  // Scale the coordinates
  const nodes = clusters.map(d => { return {...d, fx: d.x*scale, fy: d.y*scale, fz: d.z*scale, size: 1}} )
  // Fix galaxy center size
  const center = nodes.filter(n => n.name.startsWith('Galaxy'))[0]
  center.size = 3

  // console.log('Galaxy / nodes:', nodes)

  const links = []
  
  // Create Object
  function objectHandler(n) {
    // use a sphere as a drag handle
    const obj = new THREE.Mesh(
        new THREE.SphereGeometry(7),
        new THREE.MeshBasicMaterial({
          depthWrite: false,
          transparent: true,
          opacity: 0
        })
      );
  
    // add img sprite as child
    const material = new THREE.SpriteMaterial(
      { 
        color: n.color || '#ffffff',
        map: circle
      }
    );
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(n.size * scale * 0.25, n.size * scale * 0.25);
    obj.add(sprite);
  
    return obj;
  }

  function onClickHandler(n, ref) {
    // console.log('onClick:', n)
    // Display info
    dispatch(setNode(clusters.filter(d => d.id === n.id)[0]))
  }

   // Move toward node
   function onRightClickHandler(n, ref) {
    // console.log('onRightClickHandler')

    // Aim at node from outside it
    const distRatio = 1 + distance/Math.hypot(n.x, n.y, n.z);
  
    ref.current.cameraPosition(
      { x: n.x * distRatio, y: n.y * distRatio, z: n.z * distRatio }, // new position
      n, // lookAt ({ x, y, z })
      3000  // ms transition duration
    );
  }


  // Graph
  const Graph = () => {
    const ref = useRef();
    useEffect(() => {
      // // Bloom pass
      const bloomPass = new THREE.UnrealBloomPass();
      bloomPass.strength = 0.02;
      bloomPass.radius = 1;
      bloomPass.threshold = 0.1;
      ref.current.postProcessingComposer().addPass(bloomPass);

      // Forces
      // NA

      // Find extremes of the galaxy nodes to adjust the zoom dynamically
      const xCoords = nodes.map(n => n.fx);
      const yCoords = nodes.map(n => n.fy);
      const zCoords = nodes.map(n => n.fz);
      
      const xMin = Math.min(...xCoords);
      const xMax = Math.max(...xCoords);
      const yMin = Math.min(...yCoords);
      const yMax = Math.max(...yCoords);
      const zMin = Math.min(...zCoords);
      const zMax = Math.max(...zCoords);

      const xCenter = (xMin + xMax) / 2;
      const yCenter = (yMin + yMax) / 2;
      const zCenter = (zMin + zMax) / 2;

      const xSpan = xMax - xMin;
      const ySpan = yMax - yMin;
      const zSpan = zMax - zMin;
      const maxSpan = Math.max(xSpan, ySpan, zSpan) || 100;

      // Fit the extremes within the width of the screen.
      // Adjust camera distance so it covers the wide galaxy nicely.
      const cameraDistance = Math.max(maxSpan * 1.1, 250);

      // We look at the center of the bounding box. We place the camera at an angle.
      ref.current.cameraPosition(
        { x: xCenter, y: yCenter - cameraDistance * 0.4, z: zCenter + cameraDistance }, // new position
        { x: xCenter, y: yCenter, z: zCenter }, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );

      // Continuously monitor camera distance & adjust bloom intensity dynamically
      let active = true;
      function updateBloom() {
        if (!active) return;
        if (ref.current) {
          const camera = ref.current.camera();
          if (camera && bloomPass) {
            const dx = camera.position.x - xCenter;
            const dy = camera.position.y - yCenter;
            const dz = camera.position.z - zCenter;
            const currentDist = Math.hypot(dx, dy, dz);

            // Interpolate bloom strength smoothly based on how close camera is to center.
            const minStrength = 0.002;
            const maxStrength = 0.02;
            // Normalize the factor relative to the initial cameraDistance scale.
            const factor = Math.max(0, Math.min(1, currentDist / cameraDistance));
            bloomPass.strength = minStrength + (maxStrength - minStrength) * factor;
          }
        }
        requestAnimationFrame(updateBloom);
      }
      requestAnimationFrame(updateBloom);

      return () => {
        active = false;
      };
      
    }, [])

    return <ForceGraph3D
      ref={ref}
      backgroundColor="#000000"
      graphData={{
        nodes: nodes,
        links: links
      }}
      // autoPauseRedraw={false}
      nodeThreeObject={n => objectHandler(n)}
      enableNodeDrag={false}
      nodeLabel={n => n.name || '[unknown]'}
      onNodeClick={n => onClickHandler(n, ref)}
      onNodeRightClick={n => onRightClickHandler(n, ref)}
      onBackgroundClick={() => {
        dispatch(collapseMenu());
        dispatch(collapseInfo());
      } }
    />
  }

  return (
    <Graph/>
  )
}
