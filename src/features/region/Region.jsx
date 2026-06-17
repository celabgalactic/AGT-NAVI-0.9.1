import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from '../../three-bundle'
import * as d3 from '../../d3-bundle'
import { COLORS } from '../../data/categories'
import { getNeighbourRegionDistancesList, getNeighbourRegionSystemList, setSystems } from './regionSlice';
import { collapseMenu, getCategory, getRegionID } from '../menu/menuSlice';
import { circle } from '../../data/assets';
import { collapseTooltip, setNode } from '../tooltip/tooltipSlices'

export function Region() {
  const dispatch = useDispatch()
  const regionID = useSelector(getRegionID)
  const category = useSelector(getCategory)
  const spriteScale = 2.5
  const focusDistance = 120
  const linkDistanceRatio = 2

  // Get systems data
  const systems = useSelector(getNeighbourRegionSystemList)
  const nodes = systems.map(d => { return {...d, id: d.glyphs}} )

  useEffect(() => {
    dispatch(setSystems(systems))
  }, [dispatch, systems])

  const distances = useSelector(getNeighbourRegionDistancesList)
  const links = distances.map(d => { return {...d, visible: false} })
  
  // Create Object
  function objectHandler(n) {
    // console.log('objectHandler',n['PC']['Normal'].name, '-', n.region, '<>',region, '-', n.region === region ? n[category] || 'uncharted' : 'outRegion',)
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
        color: n.regionID === regionID ? COLORS[n[category]] || '#ffffff' : '#cccccc',
        map: circle
      }
    );
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(spriteScale, spriteScale);
    obj.add(sprite);
  
    return obj;
  }

  // Display tooltip
  function onClickHandler(n, ref) {
    // Display tooltip
    dispatch(setNode(systems.filter(d => d.glyphs === n.glyphs)[0]))

    // Display links
    links.forEach(l => {
      l.visible = (n.glyphs == l.source.glyphs) || (n.glyphs == l.target.glyphs)
    })

    // Redraw
    ref.current.refresh()
  }

  // Move toward node
  function onRightClickHandler(n, ref) {
    // console.log('onRightClickHandler')

    // Aim at node from outside it
    const distRatio = 1 + focusDistance/Math.hypot(n.x, n.y, n.z);
  
    ref.current.cameraPosition(
      { x: n.x * distRatio, y: n.y * distRatio, z: n.z * distRatio }, // new position
      n, // lookAt ({ x, y, z })
      3000  // ms transition duration
    );
  }

  // function onHoverHandler(n, ref) {
  //   console.log('onHoverHandler')
  // }

  // Graph
  const Graph = () => {
    const ref = useRef();

    useEffect(() => {
      // Bloom pass
      const bloomPass = new THREE.UnrealBloomPass();
      bloomPass.strength = 0.02;
      bloomPass.radius = 1;
      bloomPass.threshold = 0.1;
      ref.current.postProcessingComposer().addPass(bloomPass);

      // Three forces are included by default: 
      // 'link' (based on forceLink), 
      ref.current.d3Force('link').distance(n => n.distance * linkDistanceRatio).strength(1);
      // 'charge' (based on forceManyBody) 
      ref.current.d3Force('charge').strength(0);
      // 'center' (based on forceCenter).
      ref.current.d3Force('center').strength(0);
      ref.current.d3Force('x', d3.forceX(n => n.cx*1000*linkDistanceRatio).strength(0.005));
      ref.current.d3Force('y', d3.forceY(n => n.cy*1000*linkDistanceRatio).strength(0.005));
      ref.current.d3Force('z', d3.forceZ(n => n.cz*1000*linkDistanceRatio).strength(0.005));

      // Find extremes of the region's systems to adjust the zoom dynamically
      const factor = 1000 * linkDistanceRatio;
      const xCoords = nodes.map(n => (n.cx || 0) * factor);
      const yCoords = nodes.map(n => (n.cy || 0) * factor);
      const zCoords = nodes.map(n => (n.cz || 0) * factor);

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
      const maxSpan = Math.max(xSpan, ySpan, zSpan) || (focusDistance * spriteScale);

      // Fit the extremes within the width of the screen.
      // Adjust camera distance so it covers the whole region nicely across the screen.
      const cameraDistance = Math.max(maxSpan * 1.1, 1500);

      // Set the camera position with a smooth transitions or immediate positioning
      ref.current.cameraPosition(
        { x: xCenter, y: yCenter - cameraDistance * 0.4, z: zCenter + cameraDistance }, // new position
        { x: xCenter, y: yCenter, z: zCenter }, // lookAt ({ x, y, z })
        2000  // ms transition length for extremely smooth entry
      );
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
      linkVisibility={l => l.visible}
      linkWidth={1}
      linkDirectionalParticles={4}
      linkDirectionalParticleWidth={2}
      nodeLabel={n => n.name || n.originalName || '[unknown]' }
      // onNodeHover={n => onHoverHandler(n, ref)}
      onNodeClick={n => onClickHandler(n, ref)}
      onNodeRightClick={n => onRightClickHandler(n, ref)}
      onBackgroundClick={() => {
        dispatch(collapseMenu());
        dispatch(collapseTooltip());
      } }
    />
  }

  return (
    <Graph/>
  )
}
