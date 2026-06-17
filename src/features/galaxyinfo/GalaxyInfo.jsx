import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { changeRegion } from '../../chains.js';
import { isCollapse, getNode, toggle} from './GalaxyInfoSlice';
import styles from './GalaxyInfo.module.css';

const img_glyph_9 = '/PORTALSYMBOL.9.png';
const img_glyph_A = '/PORTALSYMBOL.A.png';
const img_community = '/SAVE.COMMUNITY.png';

export function GalaxyInfo() {
  const dispatch = useDispatch()
  const node = useSelector(getNode)
  const collapsed = useSelector(isCollapse)

  return (
    <div
      className={[styles.sidenav, styles.tronbox, styles.content].join(" ")}
      style={{
        position: 'absolute',
        top: '20px',
        bottom: '20px',
        right: '25px',
        width: collapsed ? '30px' : '320px',
        maxWidth: 'calc(100vw - 40px)',
        transition: 'width .5s, max-width .5s',
        paddingRight: collapsed ? undefined : '36px',
        height: 'calc(100% - 40px)',
        zIndex: 20,
        display: !node ? 'none' : 'flex'
      }}
      onClick={collapsed ? (e => dispatch(toggle())) : undefined}
      >
      {!collapsed && (
        <button
          className={styles.closeBtn}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggle());
          }}
          title="Close Panel"
        >
          <X size={16} />
        </button>
      )}
      <div><img src={img_glyph_9} alt="galaxy"/>Galaxy: {node?.galaxyName || ''}</div>
      <div>
        <img src={img_glyph_A} alt="cluster"/>
        Cluster:&nbsp;
        <span style={node?.color ? { color: node.color } : undefined}>
          {node?.name || ''}
        </span>
      </div>
      <div><img src={img_community} alt="region"/>Region list: </div>
      <div className={styles.choices}
      style={{
        display: node && node.regions.length > 0 ? 'block' : 'none'
      }}>
        <ul>
        {node && node.regions 
          ? node.regions.map(r => {
            const PRIORITY_COLORS = {
              'Low': 'rgb(17,115,75)',
              'Medium': 'rgb(255,225,0)',
              'High': 'rgb(255,147,0)'
            };
            const rColor = r.priority ? PRIORITY_COLORS[r.priority] : undefined;
            return (
              <li 
                key={r.id} 
                onClick={e => { e.stopPropagation(); dispatch(changeRegion(r)); }}
                style={rColor ? { color: rColor } : undefined}
              >
                {r.name} ({r.systemCount}) [{r.id}]
              </li>
            );
          })
          : null
        }
        </ul>
      </div>
    </div>
  )
}
