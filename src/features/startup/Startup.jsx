import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Canvas } from 'react-three-fiber'
// import { loadData } from '../../chains'
import { getStatus } from './startupSlice'
import styles from './Startup.module.css'

import { Menu } from '../menu/Menu'
import { Galaxy } from '../galaxy/Galaxy'
import { Region } from '../region/Region'
import { Tooltip } from '../tooltip/Tooltip'
import { GalaxyInfo } from '../galaxyinfo/GalaxyInfo'
import { AGT } from '../three/AGT'

function Loadmsg() {
  return (
    <div 
      className={styles.msg}
      style={{
        color: '#FFB451',
        borderColor: '#FF0500',
        boxShadow: '0 0 5px rgba(255, 5, 0, 0.4), inset 0 0 5px rgba(255, 5, 0, 0.4)'
      }}
    >
      Click the AGT Icon to Start Data Sync
    </div>
  )
}

function Waitmsg() {
  return null; // The centered syncing progress panel contains the "SYNCING DATA" label already, so we hide the generic message.
}

function Menumsg() {
  return (
    <div className={styles.msg}>
      Click on the left menu to navigate through galaxies
    </div>
  )
}

export function Startup() {
  const status = useSelector(getStatus)
  const dispatch = useDispatch()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (status === 'Loading') {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return prev + (98 - prev) * 0.08
          }
          return prev + Math.floor(Math.random() * 8) + 4
        })
      }, 150)
      return () => clearInterval(interval)
    } else if (status === 'Full' || status === 'Galaxy' || status === 'Region') {
      setProgress(100)
    } else {
      setProgress(0)
    }
  }, [status])

  return (
    <div className={styles.container} >
      {/* THREE Content */}
      { status === "NoData" | status === "Loading" 
        ? <Canvas style={{ background: '#000000' }}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <AGT position={[0,0,0]} dispatch={dispatch} active={status === "Loading"} />
          </Canvas> 
        : null
      }
      { status === "Full" || status === "Galaxy" ? <Galaxy/> : null }
      { status === "Region" ? <Region/> : null }
      
      {/* Top Header Overlay for Region or Galaxy Star Map */}
      {status === "Region" || status === "Galaxy" ? (
        <div 
          id={`star-map-${status.toLowerCase()}-header`}
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#FFB451',
            fontSize: '20px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            zIndex: 10,
            fontFamily: 'sans-serif',
            textShadow: '0 0 10px rgba(255, 180, 81, 0.5)'
          }}
        >
          {status}
        </div>
      ) : null}      
      {/* HTML Overlay */}
      {status === "Loading" ? (
        <div 
          className="absolute rounded bg-black/80 border flex flex-col gap-1.5 w-64 z-10 font-sans pointer-events-none p-3 shadow-[0_0_10px_rgba(255,5,0,0.4)]"
          style={{
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderColor: '#FF0500'
          }}
        >
          <div className="flex justify-between text-[11px] font-semibold tracking-wider">
            <span style={{ color: '#FFB451' }}>SYNCING DATA</span>
            <span style={{ color: '#FFB451' }}>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-150 ease-out" 
              style={{ 
                width: `${progress}%`,
                backgroundColor: '#E25530',
                boxShadow: '0 0 8px #E25530'
              }}
            ></div>
          </div>
        </div>
      ) : (
        status !== "Region" && status !== "Galaxy" && (
          <div 
            className={styles.status}
            style={status === "NoData" ? { color: "#FFB451" } : undefined}
          >
            {status === "NoData" ? "Data Sync Required" : status}
          </div>
        )
      )}
      {status === "NoData" ? <Loadmsg/> : null}
      {status === "Loading" ? <Waitmsg/> : null}
      {status === "Full" ? <Menumsg/> : null}
      {status === "Full" || status === "Galaxy" || status === "Region" ? <Menu/> : null}
      {status === "Full" || status === "Galaxy" ? <GalaxyInfo /> : null}
      {status === "Region" ? <Tooltip /> : null}
    </div>
  )
}