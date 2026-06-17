import React, { useState, useRef, useMemo } from 'react'
import { useFrame } from 'react-three-fiber'
import * as THREE from 'three'
import { loadData } from '../../chains'

// geometries
const octahedron = {
  "vertex":[[0,0,1],[1,0,0],[0,1.5,0],[-1,0,0],[0,-3,0],[0,0,-1]],
  "face":[[0,1,2],[0,2,3],[0,3,4],[0,4,1],[1,4,5],[1,5,2],[2,5,3],[3,5,4]]
}
const top = {
  "vertex":[
    [0,1.5,-0.05],[0,1.5,0.05],
    [0,1.65,-0.05],[0,1.65,0.05],
    [1.3,-0.45,-0.05],[1.3,-0.45,0.05],
    [1.4,-0.35,-0.05],[1.4,-0.35,0.05],
    [-1.3,-0.45,-0.05],[-1.3,-0.45,0.05],
    [-1.4,-0.35,-0.05],[-1.4,-0.35,0.05]
  ],
  "face":[
    [0,4,6],[6,2,0],
    [1,5,4],[4,0,1],
    [3,7,5],[5,1,3],
    [2,6,7],[7,3,2],
    [4,5,7],[7,6,4],
    [0,8,9],[9,1,0],
    [1,9,11],[11,3,1],
    [3,11,10],[10,2,3],
    [2,10,8],[8,0,2],
    [8,9,11],[11,10,8]
  ]
}
const middle = {
  "vertex":[
    [0,-0.05,1],[0,-0.05,1.5],[0,0.05,1.5],[0,0.05,1],
    [1,-0.05,0],[1.5,-0.05,0],[1.5,0.05,0],[1,0.05,0],
    [0,-0.05,-1],[0,-0.05,-1.5],[0,0.05,-1.5],[0,0.05,-1],
    [-1,-0.05,0],[-1.5,-0.05,0],[-1.5,0.05,0],[-1,0.05,0],
  ],
  "face":[
    [0,4,7],[7,3,0],[1,5,4],[4,0,1],[2,6,5],[5,1,2],[3,7,6],[6,2,3],
    [4,8,11],[11,7,4],[5,9,8],[8,4,5],[6,10,9],[9,5,6],[7,11,10],[10,6,7],
    [8,12,15],[15,11,8],[9,13,12],[12,8,9],[10,14,13],[13,9,10],[11,15,14],[14,10,11],
    [12,0,3],[3,15,12],[13,1,0],[0,12,13],[14,2,1],[1,13,14],[15,3,2],[2,14,15]
  ]
}
const bottom = {
  "name":"bottom",
  "vertex":[
    [-0.05,0,1],[0.05,0,1],[0.05,0,1.25],[-0.05,0,1.25],
    [-0.05,-3,0],[0.05,-3,0],[0.05,-3.15,0],[-0.05,-3.15,0],
    [-0.05,0,-1],[0.05,0,-1],[0.05,0,-1.25],[-0.05,0,-1.25]
  ],
  "face":[
    [0,1,2],[2,3,0],
    [0,4,5],[5,1,0],[1,5,6],[6,2,1],[2,6,7],[7,3,2],[3,7,4],[4,0,3],
    [4,8,9],[9,5,4],[5,9,10],[10,6,5],[6,10,11],[11,7,6],[7,11,8],[8,4,7],
    [8,9,10],[10,11,8]
  ]
}

const GvShape = new THREE.Shape()
.moveTo(0.7,0)
.absarc(0,0,0.7,0,Math.PI*0.5/2, true)
.lineTo(0,0)
.lineTo(0.7,0)
const GhShape = new THREE.Shape()
.moveTo(0,-0.65)
.absarc(0,0,0.65,-1*Math.PI/2,Math.PI/2)
.lineTo(0,-0.65)

export function AGT(props) {
  const {active, dispatch} = props

  // This reference will give us direct access to the mesh
  const mesh = useRef()

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)

  // Define geometry attributes with BufferGeometry flat position arrays
  const makePositionArray = (geom) => {
    const arr = [];
    for (const face of geom.face) {
      for (const idx of face) {
        arr.push(...geom.vertex[idx]);
      }
    }
    return new Float32Array(arr);
  };

  const octPositions = useMemo(() => makePositionArray(octahedron), []);
  const topPositions = useMemo(() => makePositionArray(top), []);
  const midPositions = useMemo(() => makePositionArray(middle), []);
  const botPositions = useMemo(() => makePositionArray(bottom), []);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    if (mesh.current && active) {mesh.current.rotation.y += 0.01}
  })

  return (
    <mesh
      {...props}
      ref={mesh}
      position={[0,0,0]}
      onClick={e => { e.stopPropagation(); dispatch(loadData()) }}
      onPointerOver={e => { e.stopPropagation(); setHover(true) }}
      onPointerOut={e => { e.stopPropagation(); setHover(false) }}
    >
      <mesh> {/* Octahedron */}
        <bufferGeometry attach="geometry" onUpdate={self => self.computeVertexNormals()}>
          <bufferAttribute attach="attributes-position" args={[octPositions, 3]} />
        </bufferGeometry>
        <meshStandardMaterial attach="material" color={hovered ? 'orange' : 'gray'} opacity={0.5} transparent/>
      </mesh>
      <mesh> {/* Sphere */}
        <sphereGeometry args={[0.6, 10, 10]} />
        <meshStandardMaterial attach="material" color='black' />
      </mesh>
      <mesh> {/* Top */}
        <bufferGeometry attach="geometry" onUpdate={self => self.computeVertexNormals()}>
          <bufferAttribute attach="attributes-position" args={[topPositions, 3]} />
        </bufferGeometry>
        <meshStandardMaterial attach="material" color="white"/>
      </mesh>
      <mesh> {/* Middle */}
        <bufferGeometry attach="geometry" onUpdate={self => self.computeVertexNormals()}>
          <bufferAttribute attach="attributes-position" args={[midPositions, 3]} />
        </bufferGeometry>
        <meshStandardMaterial attach="material" color="white"/>
      </mesh>
      <mesh> {/* Bottom */}
        <bufferGeometry attach="geometry" onUpdate={self => self.computeVertexNormals()}>
          <bufferAttribute attach="attributes-position" args={[botPositions, 3]} />
        </bufferGeometry>
        <meshStandardMaterial attach="material" color="white"/>
      </mesh>
      <mesh
        position={[0,0,-0.1]}
      > {/* Gv */}
        <extrudeGeometry attach="geometry" args={[GvShape, {depth: 0.2, bevelEnabled: false}]} />
        <meshStandardMaterial attach="material" color='red' />
      </mesh>
      <mesh
      rotation={[Math.PI/2,0,0]}
      > {/* Gh */}
        <extrudeGeometry attach="geometry" args={[GhShape,{depth: 0.2, bevelEnabled: false}]} />
        <meshStandardMaterial attach="material" color='red' />
      </mesh>
    </mesh>
  )
}
