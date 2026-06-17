import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { isCollapse, getNode, toggle} from './tooltipSlices';
import { getCatalogue } from '../startup/startupSlice';
import styles from './Tooltip.module.css';

// import img_logo from '../../img/logo/png';
const img_glyph_0 = '/PORTALSYMBOL.0.png';
const img_glyph_2 = '/PORTALSYMBOL.2.png';
const img_glyph_5 = '/PORTALSYMBOL.5.png';
const img_glyph_9 = '/PORTALSYMBOL.9.png';
const img_glyph_A = '/PORTALSYMBOL.A.png';
const img_glyph_C = '/PORTALSYMBOL.C.png';
const img_glyph_D = '/PORTALSYMBOL.D.png';
const img_glyph_E = '/PORTALSYMBOL.E.png';
const img_glyph_F = '/PORTALSYMBOL.F.png';

const img_white = '/star_white.png';
const img_yellow = '/star_yellow.png';
const img_red = '/star_red.png';
const img_green = '/star_green.png';
const img_blue = '/star_blue.png';

const img_gek = '/RACE.GEK.png';
const img_korvax = '/RACE.KORVAX.png';
const img_vykeen = '/RACE.VYKEEN.png';
const img_traveller = '/RACE.TRAVELLER.png';
const img_anomaly = '/RACE.ANOMALY.png';
const img_materials = '/ECONOMY.FUSION.png';
const img_technology = '/ECONOMY.HIGHTECH.png';
const img_manufacturing = '/ECONOMY.MANUFACTURING.png';
const img_mining = '/ECONOMY.MINING.png';
const img_power = '/ECONOMY.POWERGENERATION.png';
const img_scientific = '/ECONOMY.SCIENTIFIC.png';
const img_trading = '/ECONOMY.TRADING.png';
const img_conflict_0 = '/CONFLICT.NULL.png';
const img_conflict_1 = '/CONFLICT.LOW.png';
const img_conflict_2 = '/CONFLICT.MEDIUM.png';
const img_conflict_3 = '/CONFLICT.HIGH.png';
const img_tguild = '/STANDING.TGUILD.NULL.png';
const img_community = '/SAVE.COMMUNITY.png';
const img_creative = '/SAVE.CREATIVE.png';
const img_system = '/STARSYSTEM.png';
const img_planet = '/PLANET.png';
const img_units = '/Units.png';

export function Tooltip() {
  const dispatch = useDispatch()
  const node = useSelector(getNode)
  const collapsed = useSelector(isCollapse)
  const catalogue = useSelector(getCatalogue)

  let img_color = img_white
  let img_race = img_traveller
  let img_eco = img_creative
  let img_war = img_conflict_0
  let img_wealth = img_tguild

  if (node) {
    // Define star
    switch (node.starColor) {
      case 'Yellow':
        img_color = img_yellow
        break;
      case 'Red':
        img_color = img_red
        break;
      case 'Green':
        img_color = img_green
        break;
      case 'Blue':
        img_color = img_blue
        break;
      default:
        img_color = img_white
        break;
    }

    // Define race
    switch (node.faction) {
      case 'Korvax':
        img_race = img_korvax
        break;
      case 'Gek':
        img_race = img_gek
        break;
      case 'Vy\'keen':
        img_race = img_vykeen
        break;
      case 'Vy\'Keen':
        img_race = img_vykeen
        break;
      default:
        img_race = img_traveller
        break;
    }
    // Define economy
    switch (node.economyLevel) {
      case 'Trading':
        img_eco = img_trading
        break;
      case 'Advanced Materials':
        img_eco = img_materials
        break;
      case 'Scientific':
        img_eco = img_scientific
        break;
      case 'Mining':
        img_eco = img_mining
        break;
      case 'Manufacturing':
        img_eco = img_manufacturing
        break;
      case 'Technology':
        img_eco = img_technology
        break;
      case 'Power Generation':
        img_eco = img_power
        break;
      default:
        img_eco = img_creative
        break;
    }
    // Define conflict tier
    switch (node.conflictLevel) {
      case '1':
        img_war = img_conflict_1
        break;
      case '2':
        img_war = img_conflict_2
        break;
      case '3':
        img_war = img_conflict_3
        break;
      default:
        img_war = img_conflict_0
        break;
    }
    // Define wealth tier
    switch (node.wealthLevel) {
      case '1':
      case '2':
      case '3':
      default:
        img_wealth = img_tguild
        break;
    }
  }

  const getStarIcon = () => {
    if (node && node.starColor === 'Purple') {
      return (
        <span
          style={{
            display: 'inline-block',
            width: '24px',
            height: '24px',
            backgroundColor: '#df20ff',
            maskImage: `url(${img_white})`,
            WebkitMaskImage: `url(${img_white})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            margin: '3px'
          }}
          aria-label="neon purple star icon"
        />
      );
    }
    return <img src={img_color} alt="star color" />;
  };

  const getStarColorText = () => {
    if (!node || !node.starColor) return null;
    const colorMap = {
      Yellow: '#ffff33',
      Red: '#e41a1c',
      Green: '#4daf4a',
      Blue: '#377eb8',
      Purple: '#df20ff'
    };
    const textColor = colorMap[node.starColor] || '#ffffff';
    return <span style={{ color: textColor }}>{node.starColor}</span>;
  };

  let regionPriority = node?.regionPriority;
  if (!regionPriority && node && catalogue) {
    const gID = node.galaxyID || 1;
    const rID = node.regionID || (node.glyphs ? node.glyphs.slice(4) : null);
    if (rID && catalogue[gID] && catalogue[gID].regions[rID]) {
      regionPriority = catalogue[gID].regions[rID].priority || '';
    }
  }

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
        <img src={img_community} alt="region"/>
        Region:&nbsp;
        <span style={
          (regionPriority && {
            'Low': 'rgb(17,115,75)',
            'Medium': 'rgb(255,225,0)',
            'High': 'rgb(255,147,0)'
          }[regionPriority]) 
            ? { color: {
                'Low': 'rgb(17,115,75)',
                'Medium': 'rgb(255,225,0)',
                'High': 'rgb(255,147,0)'
              }[regionPriority] }
            : undefined
        }>
          {node?.regionName || ''}
        </span>
      </div>
      <div><img src={img_glyph_2} alt="original"/>Original: {node?.originalName || '[unknown]'} </div>
      <div><img src={img_system} alt="system"/>System: {node?.name || '[unknown]'}</div>
      <div><img src={img_glyph_A} alt="coords" />Coords: {node?.coordinates || ''}</div>
      <div><img src={img_glyph_0} alt="glyphs" />Glyphs: {node?.glyphs || ''}</div>
      <div><img src={img_glyph_5} alt="light year" />LY: {node?.regionLY || ''} - Water: {node?.water || ''}</div>
      <div>{getStarIcon()}Stars: {node?.starCount || ''} - {node?.starClass || ''} ({getStarColorText()})</div>
      <div><img src={img_planet} alt="planets" />{node?.planetCount || 0} Planet - {node?.moonCount || 0} Moon</div>
      <div><img src={img_race} alt="race" />Faction: {node?.faction || ''}</div>
      <div><img src={img_eco} alt="economy" />Economy: {node?.economy || ''}</div>
      <div><img src={img_wealth} alt="wealth" />Wealth: {node?.wealth || ''} ({node?.wealthLevel || ''})</div>
      <div><img src={img_units} alt="units"/>Buy: {node?.buy || ''}% - Sell: {node?.sell || ''}%</div>
      <div><img src={img_war} alt="conflict" />Confict: {node?.conflict || ''} ({node?.conflictLevel || ''})</div>
      <div><span style={{ display: 'inline-block', width: '24px', height: '24px', margin: '3px' }} />Dissonant: {node?.dissonant || ''}</div>
      <div><span style={{ display: 'inline-block', width: '24px', height: '24px', margin: '3px' }} />Giant: {node?.giant || ''}</div>
      <div><img src={img_anomaly} alt="discovered" />Discovered by {node?.discoveredBy || '?'}</div>
      <div><img src={img_glyph_D} alt="discovered" />Discovered on {node?.discoveryDate || '?'}</div>
      <div><img src={img_anomaly} alt="survey" />Surveyed by {node?.surveyedBy || '?'}</div>
      <div><img src={img_glyph_D} alt="survey" />Surveyed on {node?.surveyDate || '?'}</div>
      <div><img src={img_glyph_E} alt="release" />Release: {node?.release || ''}</div>
      <div>
        <img src={img_glyph_C} alt="civ" />
        Civ: <span style={
          (node?.civilized === "Alliance of Galactic Travellers" || node?.civilized?.endsWith("Travellers Foundation"))
            ? { color: '#FFB451' }
            : undefined
        }>
          {node?.civilized || ''}
        </span>
      </div>
      <div>
        <img src={img_glyph_F} alt="wiki" />
        Wiki:&nbsp;{node?.wikiUrl ? (
          <a href={node.wikiUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00a2ff', textDecoration: 'underline' }}>
            LINK
          </a>
        ) : ''}
      </div>
    </div>
  )
}
