import { useState, useMemo, useRef, useEffect } from "react";
import { Home, Building, Wrench, Plus, Trash2, ChevronDown, ChevronUp, Calculator, AlertCircle, Info, Check, Sparkles, ArrowRight, RotateCcw, Download, Layers } from "lucide-react";
import logoImg from "./assets/tpe-logo.png";

// ============ BRAND ============
// Matches the palette actually used on thrivepropertyeducation.co.uk
const C = {
  green: '#263e3a',    // --dark (hero/section backgrounds)
  navBg: '#1a2e2a',    // --nav-bg (header/footer bars specifically)
  dark2: '#1d3330',    // --dark2
  gold: '#d4af37',
  goldHover: '#e0bc3e',
  sage: '#4e7e73',      // --mid
  mint: '#edf8f5',      // --mint-pale (very light tint, used for subtle panel backgrounds)
  cream: '#f9f7f2',
  ink: '#2a2a2a',
  muted: '#6b6b6b',
};

// ============ LOGO ============
const LogoFull = ({ height = 44 }) => (
  <img src={logoImg} alt="Thrive Property Education" style={{ height: `${height}px`, width: 'auto', display: 'block', objectFit: 'contain' }} />
);

// ============ PRICING (from The Renovation Roadmap, 2026) ============
const PRICING = {
  extensions: {
    'single-rear': { name: 'Single Storey Rear Extension', icon: 'home', perM2: { basic: 1800, mid: 2300, premium: 2900 }, note: 'Typical 3-5m depth' },
    'double-rear': { name: 'Double Storey Rear Extension', icon: 'building', perM2: { basic: 2200, mid: 2700, premium: 3200 }, note: 'Two floors of additional space' },
    'side-return': { name: 'Side Return Extension', icon: 'return', perM2: { basic: 2000, mid: 2450, premium: 2900 }, note: 'Single storey side infill' },
    'wrap-around': { name: 'Wrap-around Extension', icon: 'wrap', perM2: { basic: 2300, mid: 2750, premium: 3200 }, note: 'Side + rear combined' },
  },
  loft: { perM2: { basic: 1500, mid: 2000, premium: 2500 }, note: 'Includes structure, stairs, insulation, electrics' },
  basement: {
    basic: { perM2: { basic: 3000, mid: 3800, premium: 4500 }, name: 'Basement (Standard)' },
    premium: { perM2: { basic: 5000, mid: 6200, premium: 7500 }, name: 'Basement (High Spec)' },
  },
  refurb: {
    stripOut: { basic: 15, mid: 45, premium: 80 },
    plasterboard: { basic: 35, mid: 40, premium: 45 },
    plastering: { basic: 23, mid: 29, premium: 35 },
    painting: { basic: 10, mid: 13, premium: 17 },
    skirting: { basic: 14, mid: 18, premium: 25 },
    floorCarpet: { basic: 18, mid: 24, premium: 32 },
    floorLaminate: { basic: 20, mid: 28, premium: 35 },
    floorEngineered: { basic: 40, mid: 52, premium: 65 },
    floorTile: { basic: 40, mid: 52, premium: 65 },
    radiator: { basic: 130, mid: 265, premium: 400 },
    rewirePerPoint: 105,
    extractorFan: 160,
  },
  kitchen: {
    units: { basic: 1300, mid: 3000, premium: 5000 },
    worktopPerLm: { basic: 80, mid: 200, premium: 310 },
    appliances: { basic: 800, mid: 1800, premium: 3500 },
  },
  bathroom: {
    suite: { basic: 700, mid: 1500, premium: 2300 },
    shower: { basic: 600, mid: 1200, premium: 1800 },
    tilingPerM2: { basic: 40, mid: 52, premium: 65 },
  },
  windows: { basic: 400, mid: 575, premium: 750 },
  bifold: { basic: 2500, mid: 4000, premium: 6500 },
  velux: { basic: 600, mid: 900, premium: 1400 },
  doorInternal: { basic: 80, mid: 140, premium: 200 },
  doorExternal: { basic: 350, mid: 575, premium: 800 },
  boiler: { basic: 1300, mid: 2400, premium: 3500 },
  prelims: {
    architect: { basic: 2500, mid: 4250, premium: 6000 },
    structEng: { basic: 800, mid: 1400, premium: 2000 },
    partyWall: { basic: 800, mid: 1900, premium: 3000 },
    planning: { basic: 250, mid: 400, premium: 600 },
    buildingControl: { basic: 400, mid: 600, premium: 900 },
    scaffolding: { basic: 700, mid: 1300, premium: 1900 },
    skipWaste: { basic: 300, mid: 500, premium: 700 },
    siteInsurance: { basic: 300, mid: 500, premium: 800 },
  },
};

const QUALITY_LABELS = {
  basic: { label: 'Basic', desc: 'Functional, budget-friendly', tier: 1 },
  mid: { label: 'Mid-range', desc: 'Quality finish, balanced', tier: 2 },
  premium: { label: 'Premium', desc: 'High-end specification', tier: 3 },
};

const FLOOR_LABELS = { none: 'None', carpet: 'Carpet', laminate: 'Laminate', engineered: 'Wood', tiles: 'Tiles' };

// A "point" = one socket, switch, light fitting, or other electrical outlet/fixture.
const ELECTRIC_POINT_GUIDE = {
  kitchen: { range: '10-16', note: 'sockets for appliances/worktop, under-cabinet lights, ceiling spots, extractor connection' },
  bathroom: { range: '4-7', note: 'shaver socket, extractor, lights, heated towel rail/underfloor heating connection' },
  bedroom: { range: '6-9', note: 'sockets each side of bed, USB points, ceiling/wall lights, TV point' },
  living: { range: '8-12', note: 'sockets, TV/media points, lighting circuits, occasional floor sockets' },
};

const fmt = (n) => `£${Math.round(n).toLocaleString('en-GB')}`;
const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const newRoom = (i) => ({
  id: Date.now() + Math.random(),
  name: `Room ${i}`,
  width: 3, length: 4, height: 2.5,
  type: 'bedroom',
  stripOut: false, replaster: false, paint: true,
  floorType: 'laminate',
  skirting: true,
  newDoor: false, doorCount: 1,
  electricPoints: 0, radiator: 1,
  extractorFan: false, extractorCount: 1,
});

// ============ GA4 / GTM TRACKING ============
function pushDataLayerEvent(eventName) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName });
}

// ============ MAIN APP ============
export default function App() {
  const [projectType, setProjectType] = useState('extension');
  const [quality, setQuality] = useState('mid');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Extension state
  const [extType, setExtType] = useState('single-rear');
  const [extWidth, setExtWidth] = useState(4);
  const [extLength, setExtLength] = useState(4);
  const [extBifold, setExtBifold] = useState(true);
  const [extSkylights, setExtSkylights] = useState(2);
  const [extKitchen, setExtKitchen] = useState(true);
  const [extKitchenLm, setExtKitchenLm] = useState(4);
  const [extPartyWall, setExtPartyWall] = useState(true);

  // Loft state (also used by the combined Loft + Whole House project)
  const [loftWidth, setLoftWidth] = useState(5);
  const [loftLength, setLoftLength] = useState(6);
  const [loftDormer, setLoftDormer] = useState(true);
  const [loftBathroom, setLoftBathroom] = useState(true);
  const [loftVelux, setLoftVelux] = useState(2);

  // Refurbishment state (also used by the combined project)
  const [rooms, setRooms] = useState([
    { ...newRoom(1), name: 'Kitchen', width: 4, length: 5, type: 'kitchen', stripOut: true, replaster: true, electricPoints: 12, floorType: 'tiles' },
  ]);
  const [refurbBoiler, setRefurbBoiler] = useState(false);
  const [refurbRewirePoints, setRefurbRewirePoints] = useState(0);
  const [refurbWindows, setRefurbWindows] = useState(0);
  const [refurbDoorsExt, setRefurbDoorsExt] = useState(0);

  // ============ CALCULATIONS ============
  const extensionCalc = useMemo(() => {
    const area = extWidth * extLength;
    const baseRate = PRICING.extensions[extType].perM2[quality];
    const construction = area * baseRate;
    const bifold = extBifold ? PRICING.bifold[quality] : 0;
    const skylights = extSkylights * PRICING.velux[quality];
    const kitchen = extKitchen ? (PRICING.kitchen.units[quality] + extKitchenLm * PRICING.kitchen.worktopPerLm[quality] + PRICING.kitchen.appliances[quality]) : 0;
    const prelims = PRICING.prelims.architect[quality] + PRICING.prelims.structEng[quality] +
                    (extPartyWall ? PRICING.prelims.partyWall[quality] : 0) +
                    PRICING.prelims.planning[quality] + PRICING.prelims.buildingControl[quality] +
                    PRICING.prelims.scaffolding[quality] + PRICING.prelims.skipWaste[quality] +
                    PRICING.prelims.siteInsurance[quality];
    const subtotal = construction + bifold + skylights + kitchen + prelims;
    return { area, subtotal,
      breakdown: [
        { label: `Main construction (${area.toFixed(1)} m² x ${fmt(baseRate)}/m²)`, value: construction },
        ...(extBifold ? [{ label: 'Bi-fold doors', value: bifold }] : []),
        ...(extSkylights > 0 ? [{ label: `Skylights (${extSkylights}x)`, value: skylights }] : []),
        ...(extKitchen ? [{ label: `Kitchen fit-out (${extKitchenLm}m worktop)`, value: kitchen }] : []),
        { label: 'Professional fees & site prelims', value: prelims, subItems: [
          { label: 'Architect', value: PRICING.prelims.architect[quality] },
          { label: 'Structural engineer', value: PRICING.prelims.structEng[quality] },
          ...(extPartyWall ? [{ label: 'Party wall agreement', value: PRICING.prelims.partyWall[quality] }] : []),
          { label: 'Planning application', value: PRICING.prelims.planning[quality] },
          { label: 'Building control', value: PRICING.prelims.buildingControl[quality] },
          { label: 'Scaffolding', value: PRICING.prelims.scaffolding[quality] },
          { label: 'Skip & waste removal', value: PRICING.prelims.skipWaste[quality] },
          { label: 'Site insurance', value: PRICING.prelims.siteInsurance[quality] },
        ] },
      ]
    };
  }, [extType, extWidth, extLength, quality, extBifold, extSkylights, extKitchen, extKitchenLm, extPartyWall]);

  const loftCalc = useMemo(() => {
    const area = loftWidth * loftLength;
    const baseRate = PRICING.loft.perM2[quality];
    const dormerUplift = loftDormer ? area * 250 : 0;
    const construction = area * baseRate + dormerUplift;
    const bathroom = loftBathroom ? (PRICING.bathroom.suite[quality] + PRICING.bathroom.shower[quality] + 6 * PRICING.bathroom.tilingPerM2[quality]) : 0;
    const velux = loftVelux * PRICING.velux[quality];
    const prelims = PRICING.prelims.architect[quality] + PRICING.prelims.structEng[quality] +
                    PRICING.prelims.partyWall[quality] + PRICING.prelims.planning[quality] +
                    PRICING.prelims.buildingControl[quality] + PRICING.prelims.scaffolding[quality] +
                    PRICING.prelims.skipWaste[quality] + PRICING.prelims.siteInsurance[quality];
    const subtotal = construction + bathroom + velux + prelims;
    return { area, subtotal,
      breakdown: [
        { label: `Loft construction (${area.toFixed(1)} m²)${loftDormer ? ' inc. dormer' : ''}`, value: construction },
        ...(loftBathroom ? [{ label: 'Loft bathroom suite', value: bathroom }] : []),
        ...(loftVelux > 0 ? [{ label: `Velux windows (${loftVelux}x)`, value: velux }] : []),
        { label: 'Professional fees & site prelims', value: prelims, subItems: [
          { label: 'Architect', value: PRICING.prelims.architect[quality] },
          { label: 'Structural engineer', value: PRICING.prelims.structEng[quality] },
          { label: 'Party wall agreement', value: PRICING.prelims.partyWall[quality] },
          { label: 'Planning application', value: PRICING.prelims.planning[quality] },
          { label: 'Building control', value: PRICING.prelims.buildingControl[quality] },
          { label: 'Scaffolding', value: PRICING.prelims.scaffolding[quality] },
          { label: 'Skip & waste removal', value: PRICING.prelims.skipWaste[quality] },
          { label: 'Site insurance', value: PRICING.prelims.siteInsurance[quality] },
        ] },
      ]
    };
  }, [loftWidth, loftLength, quality, loftDormer, loftBathroom, loftVelux]);

  const computeRoomTotals = (roomList) => roomList.map(r => {
    const area = r.width * r.length;
    const perimeter = 2 * (r.width + r.length);
    const wallArea = perimeter * r.height;
    let total = 0;
    const items = [];
    if (r.stripOut) { const c = area * PRICING.refurb.stripOut[quality]; total += c; items.push({ label: 'Strip out existing', value: c }); }
    if (r.replaster) {
      const pb = wallArea * PRICING.refurb.plasterboard[quality];
      const pl = wallArea * PRICING.refurb.plastering[quality];
      total += pb + pl; items.push({ label: `Plasterboard + plaster (${wallArea.toFixed(1)} m² wall)`, value: pb + pl });
    }
    if (r.paint) { const c = (wallArea + area) * PRICING.refurb.painting[quality]; total += c; items.push({ label: 'Painting - walls + ceiling', value: c }); }
    if (r.skirting) { const c = perimeter * PRICING.refurb.skirting[quality]; total += c; items.push({ label: `Skirting boards (${perimeter.toFixed(1)} lm)`, value: c }); }
    if (r.floorType !== 'none') {
      const rateMap = { tiles: PRICING.refurb.floorTile, engineered: PRICING.refurb.floorEngineered, laminate: PRICING.refurb.floorLaminate, carpet: PRICING.refurb.floorCarpet };
      const rate = rateMap[r.floorType][quality];
      const c = area * rate; total += c; items.push({ label: `Flooring - ${FLOOR_LABELS[r.floorType]} (${area.toFixed(1)} m²)`, value: c });
    }
    if (r.newDoor) { const c = r.doorCount * PRICING.doorInternal[quality]; total += c; items.push({ label: `New internal door${r.doorCount > 1 ? 's' : ''} (${r.doorCount}x)`, value: c }); }
    if (r.extractorFan) { const c = r.extractorCount * PRICING.refurb.extractorFan; total += c; items.push({ label: `Extractor fan${r.extractorCount > 1 ? 's' : ''} (${r.extractorCount}x @ £160)`, value: c }); }
    if (r.electricPoints > 0) { const c = r.electricPoints * PRICING.refurb.rewirePerPoint; total += c; items.push({ label: `Electrical points (${r.electricPoints}x @ £105)`, value: c }); }
    if (r.radiator > 0) { const c = r.radiator * PRICING.refurb.radiator[quality]; total += c; items.push({ label: `Radiators (${r.radiator}x)`, value: c }); }
    if (r.type === 'kitchen') {
      const c = PRICING.kitchen.units[quality] + Math.max(perimeter * 0.4, 3) * PRICING.kitchen.worktopPerLm[quality] + PRICING.kitchen.appliances[quality];
      total += c; items.push({ label: 'Kitchen units + worktop + appliances', value: c });
    }
    if (r.type === 'bathroom') {
      const c = PRICING.bathroom.suite[quality] + PRICING.bathroom.shower[quality] + wallArea * 0.5 * PRICING.bathroom.tilingPerM2[quality];
      total += c; items.push({ label: 'Bathroom suite + shower + tiling', value: c });
    }
    return { ...r, area, perimeter, total, items };
  });

  const refurbCalc = useMemo(() => {
    const roomTotals = computeRoomTotals(rooms);
    const roomsTotal = roomTotals.reduce((s, r) => s + r.total, 0);
    const extras = (refurbBoiler ? PRICING.boiler[quality] : 0) +
                   refurbRewirePoints * PRICING.refurb.rewirePerPoint +
                   refurbWindows * PRICING.windows[quality] +
                   refurbDoorsExt * PRICING.doorExternal[quality];
    const prelims = PRICING.prelims.skipWaste[quality] + PRICING.prelims.siteInsurance[quality] + PRICING.prelims.architect[quality] * 0.3;
    const subtotal = roomsTotal + extras + prelims;
    return { roomTotals, subtotal,
      breakdown: [
        ...roomTotals.map(r => ({ label: `${r.name} - ${r.type} (${r.width}x${r.length}x${r.height}m, ${r.area.toFixed(1)} m²)`, value: r.total, subItems: r.items })),
        ...(refurbBoiler ? [{ label: 'New boiler', value: PRICING.boiler[quality] }] : []),
        ...(refurbRewirePoints > 0 ? [{ label: `Rewiring (${refurbRewirePoints} points @ £105)`, value: refurbRewirePoints * PRICING.refurb.rewirePerPoint }] : []),
        ...(refurbWindows > 0 ? [{ label: `New windows (${refurbWindows}x)`, value: refurbWindows * PRICING.windows[quality] }] : []),
        ...(refurbDoorsExt > 0 ? [{ label: `External doors (${refurbDoorsExt}x)`, value: refurbDoorsExt * PRICING.doorExternal[quality] }] : []),
        { label: 'Site prelims & basic design fees', value: prelims },
      ]
    };
  }, [rooms, quality, refurbBoiler, refurbRewirePoints, refurbWindows, refurbDoorsExt]);

  // Combined: Loft conversion + whole house refurbishment in one project
  const loftRefurbCalc = useMemo(() => {
    const subtotal = loftCalc.subtotal + refurbCalc.subtotal;
    return { subtotal,
      breakdown: [
        { label: '- LOFT CONVERSION -', value: loftCalc.subtotal, isSection: true },
        ...loftCalc.breakdown,
        { label: '- WHOLE HOUSE REFURBISHMENT -', value: refurbCalc.subtotal, isSection: true },
        ...refurbCalc.breakdown,
      ]
    };
  }, [loftCalc, refurbCalc]);

  // Combined: Extension (rear/side/wrap-around) + whole house refurbishment in one project
  const extensionRefurbCalc = useMemo(() => {
    const subtotal = extensionCalc.subtotal + refurbCalc.subtotal;
    return { subtotal,
      breakdown: [
        { label: `- ${PRICING.extensions[extType].name.toUpperCase()} -`, value: extensionCalc.subtotal, isSection: true },
        ...extensionCalc.breakdown,
        { label: '- WHOLE HOUSE REFURBISHMENT -', value: refurbCalc.subtotal, isSection: true },
        ...refurbCalc.breakdown,
      ]
    };
  }, [extensionCalc, refurbCalc, extType]);

  const calcs = { extension: extensionCalc, loft: loftCalc, refurb: refurbCalc, loftRefurb: loftRefurbCalc, extensionRefurb: extensionRefurbCalc };
  const active = calcs[projectType];
  const subtotal = active.subtotal;
  const contingency15 = subtotal * 0.15;
  const total = subtotal + contingency15;
  const vat = total * 0.20;
  const totalIncVat = total + vat;

  // Fire a one-time GA4 (via GTM dataLayer) event the first time the user changes
  // any input that feeds a recalculation. Skips the initial mount so we only
  // count genuine user interaction, not the default calculation on page load.
  const hasMountedRef = useRef(false);
  const hasFiredFirstInteractionRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (!hasFiredFirstInteractionRef.current) {
      hasFiredFirstInteractionRef.current = true;
      pushDataLayerEvent('tool_first_interaction');
    }
  }, [subtotal]);

  const PROJECT_LABELS = {
    extension: 'Extension',
    loft: 'Loft Conversion',
    refurb: 'Whole-Room Refurbishment',
    loftRefurb: 'Loft Conversion + Whole House Refurbishment',
    extensionRefurb: `${PRICING.extensions[extType].name} + Whole House Refurbishment`,
  };

  const addRoom = () => setRooms([...rooms, newRoom(rooms.length + 1)]);
  const updateRoom = (id, key, val) => setRooms(rooms.map(r => r.id === id ? { ...r, [key]: val } : r));
  const removeRoom = (id) => setRooms(rooms.filter(r => r.id !== id));

  const resetAll = () => {
    setExtType('single-rear'); setExtWidth(4); setExtLength(4); setExtBifold(true); setExtSkylights(2); setExtKitchen(true); setExtKitchenLm(4); setExtPartyWall(true);
    setLoftWidth(5); setLoftLength(6); setLoftDormer(true); setLoftBathroom(true); setLoftVelux(2);
    setRooms([{ ...newRoom(1), name: 'Kitchen', width: 4, length: 5, type: 'kitchen', stripOut: true, replaster: true, electricPoints: 12, floorType: 'tiles' }]);
    setRefurbBoiler(false); setRefurbRewirePoints(0); setRefurbWindows(0); setRefurbDoorsExt(0);
  };

  // Results stay hidden behind an email capture until the Kajabi gate form
  // below is submitted - see the SUMMARY section for the blurred/overlay UI.
  const [resultsUnlocked, setResultsUnlocked] = useState(false);

  // Kajabi's embed script renders via document.write, which is a no-op once
  // the host document has finished loading (as it has by the time this effect
  // runs in a React SPA). Loading it inside a freshly-opened iframe document
  // keeps document.write working, then the iframe is resized to fit its content.
  const kajabiFormRef = useRef(null);
  useEffect(() => {
    const container = kajabiFormRef.current;
    if (!container) return;
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    container.appendChild(iframe);
    const doc = iframe.contentDocument;
    doc.open();
    // Style tag rides along in the same write call so it lands right after the
    // Kajabi form markup and overrides the default (off-brand) Kajabi styling.
    doc.write(`
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
      <script src="https://thrivepropertyeducation.mykajabi.com/forms/2149632374/embed.js"></script>
      <style>
        body { margin: 0; font-family: 'DM Sans', sans-serif; }
        .kajabi-form__title, .kajabi-form__subtitle { display: none; }
        fieldset { border: none !important; padding: 0 !important; margin: 0 !important; display: flex !important; flex-direction: column !important; gap: 10px !important; }
        .kajabi-form__form-item { margin: 0 !important; }
        .kajabi-form__form-item input {
          width: 100% !important; box-sizing: border-box !important;
          background: white !important; border: 2px solid #e5e7eb !important;
          color: ${C.green} !important; font-family: 'DM Sans', sans-serif !important;
          font-size: 14px !important; padding: 12px 14px !important; border-radius: 8px !important;
          outline: none !important; box-shadow: none !important; height: auto !important;
        }
        .kajabi-form__form-item input:focus { border-color: ${C.sage} !important; }
        .kajabi-form__btn {
          width: 100% !important; margin-top: 2px !important;
          background: ${C.gold} !important; color: ${C.green} !important;
          font-family: 'Oswald', sans-serif !important; font-size: 13px !important; font-weight: 700 !important;
          letter-spacing: 1.5px !important; text-transform: uppercase !important;
          padding: 13px 24px !important; border: none !important; border-radius: 8px !important;
          cursor: pointer !important; transition: background 0.2s !important;
        }
        .kajabi-form__btn:hover { background: ${C.goldHover} !important; }
      </style>
    `);
    doc.close();
    let renamedButton = false;
    const resize = () => {
      if (doc.body) iframe.style.height = `${doc.body.scrollHeight}px`;
      // Kajabi's own button label ("Subscribe") is set in the Kajabi dashboard
      // and reads oddly on a results gate - retarget the text only, once the
      // form has actually rendered (it lands a beat after doc.close() returns).
      // The underlying submit behaviour/tagging in Kajabi is untouched.
      if (!renamedButton) {
        const btn = doc.querySelector('.kajabi-form__btn');
        if (btn) { btn.textContent = 'Get My Budget'; renamedButton = true; }
      }
    };
    const resizeTimer = setInterval(resize, 300);
    const stopResizing = setTimeout(() => clearInterval(resizeTimer), 5000);
    // The form's required email field blocks the browser's native 'submit'
    // event from firing until it passes validation, so seeing it fire is a
    // reliable signal the visitor entered something email-shaped - unlock
    // straight away rather than trying to parse Kajabi's own AJAX response.
    const handleSubmit = () => setTimeout(() => setResultsUnlocked(true), 400);
    doc.addEventListener('submit', handleSubmit, true);
    return () => {
      clearInterval(resizeTimer);
      clearTimeout(stopResizing);
      doc.removeEventListener('submit', handleSubmit, true);
    };
  }, []);

  const printRef = useRef(null);

  const handleDownloadPdf = () => {
    if (!printRef.current) return;
    const contentHtml = printRef.current.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Thrive Renovation Budget Summary</title>
<style>
  @page { margin: 16mm; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: ${C.green}; background: #fff; }
  table { width: 100%; border-collapse: collapse; }
  @media print {
    .print-hint { display: none; }
  }
</style>
</head>
<body>
  <div class="print-hint" style="background:${C.mint};color:${C.green};padding:10px 16px;font-size:13px;font-family:Arial,sans-serif;">
    This is your renovation budget summary. Use your browser's Print option (Ctrl/Cmd + P) and choose "Save as PDF" to keep a copy.
  </div>
  <div style="padding:24px;">${contentHtml}</div>
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thrive-renovation-budget-summary-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const showRooms = projectType === 'refurb' || projectType === 'loftRefurb' || projectType === 'extensionRefurb';
  const showLoft = projectType === 'loft' || projectType === 'loftRefurb';
  const showExtensionDetails = projectType === 'extension' || projectType === 'extensionRefurb';

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: C.cream, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #print-summary { display: block !important; }
          body { background: white !important; }
        }
        #print-summary { display: none; }
      `}</style>

      {/* HEADER */}
      <header className="no-print sticky top-0 z-20 shadow-md" style={{ backgroundColor: C.navBg }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <LogoFull />
          <button onClick={resetAll} className="p-2 rounded-lg hover:bg-white/10 transition" title="Reset">
            <RotateCcw size={18} color={C.gold} />
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <h1 className="text-white text-xl sm:text-2xl font-black tracking-tight">Renovation Budget Calculator</h1>
          <p className="text-xs sm:text-sm" style={{ color: C.mint }}>Estimate your project cost in minutes - based on 2026 London pricing</p>
        </div>
      </header>

      <main className="no-print max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* PROJECT TYPE */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: C.gold }}>1</div>
            <h2 className="font-bold" style={{ color: C.green }}>What are you building?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'extension', label: 'Extension', Icon: Home },
              { id: 'loft', label: 'Loft', Icon: Building },
              { id: 'refurb', label: 'Refurbish', Icon: Wrench },
              { id: 'loftRefurb', label: 'Loft + Refurb', Icon: Layers },
              { id: 'extensionRefurb', label: 'Extension + Refurb', Icon: Layers },
            ].map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setProjectType(id)}
                className="p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5"
                style={{
                  backgroundColor: projectType === id ? C.green : 'white',
                  borderColor: projectType === id ? C.gold : '#e5e7eb',
                  color: projectType === id ? 'white' : C.green,
                }}>
                <Icon size={20} color={projectType === id ? C.gold : C.sage} />
                <span className="text-xs sm:text-sm font-semibold text-center">{label}</span>
              </button>
            ))}
          </div>
          {projectType === 'loftRefurb' && (
            <p className="text-xs mt-3 leading-relaxed" style={{ color: C.sage }}>
              Converting your loft and refurbishing the rest of the house at the same time? This combines a full loft conversion with a room-by-room refurbishment of your existing floors - so you get one total project budget.
            </p>
          )}
          {projectType === 'extensionRefurb' && (
            <p className="text-xs mt-3 leading-relaxed" style={{ color: C.sage }}>
              Building an extension and refurbishing the rest of the house at the same time? This combines your chosen extension type with a room-by-room refurbishment of your existing floors - so you get one total project budget.
            </p>
          )}
        </section>

        {/* QUALITY */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: C.gold }}>2</div>
            <h2 className="font-bold" style={{ color: C.green }}>Finish quality</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(QUALITY_LABELS).map(([key, { label, desc }]) => (
              <button key={key} onClick={() => setQuality(key)}
                className="p-3 rounded-xl border-2 transition-all text-left"
                style={{ backgroundColor: quality === key ? C.mint : 'white', borderColor: quality === key ? C.sage : '#e5e7eb' }}>
                <div className="font-bold text-sm" style={{ color: C.green }}>{label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: C.sage }}>{desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* DETAILS */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: C.gold }}>3</div>
            <h2 className="font-bold" style={{ color: C.green }}>Project details</h2>
          </div>

          {/* EXTENSION (shown for 'extension' and 'extensionRefurb') */}
          {showExtensionDetails && (
            <div className="space-y-4">
              {projectType === 'extensionRefurb' && <h3 className="font-bold text-sm" style={{ color: C.green }}>Extension</h3>}
              <div>
                <Label>Extension type</Label>
                <select value={extType} onChange={e => setExtType(e.target.value)}
                  className="w-full p-3 rounded-lg border-2 text-sm font-medium" style={{ borderColor: '#e5e7eb', color: C.green }}>
                  {Object.entries(PRICING.extensions).map(([k, v]) => (<option key={k} value={k}>{v.name}</option>))}
                </select>
                <p className="text-xs mt-1" style={{ color: C.sage }}>{PRICING.extensions[extType].note}</p>
              </div>
              <DimensionGrid>
                <DimInput label="Width (m)" value={extWidth} onChange={setExtWidth} />
                <DimInput label="Length (m)" value={extLength} onChange={setExtLength} />
              </DimensionGrid>
              <AreaDisplay area={extWidth * extLength} />
              <Toggle label="Bi-fold or sliding doors" checked={extBifold} onChange={setExtBifold} />
              <NumberInput label="Skylights / roof windows" value={extSkylights} onChange={setExtSkylights} max={6} />
              <Toggle label="Include new kitchen fit-out" checked={extKitchen} onChange={setExtKitchen} />
              {extKitchen && <DimInput label="Kitchen worktop length (m)" value={extKitchenLm} onChange={setExtKitchenLm} step={0.5} />}
              <Toggle label="Party wall agreement needed" checked={extPartyWall} onChange={setExtPartyWall} />
            </div>
          )}

          {/* LOFT (shown for 'loft' and 'loftRefurb') */}
          {showLoft && (
            <div className="space-y-4">
              {projectType === 'loftRefurb' && <h3 className="font-bold text-sm" style={{ color: C.green }}>Loft conversion</h3>}
              <DimensionGrid>
                <DimInput label="Width (m)" value={loftWidth} onChange={setLoftWidth} />
                <DimInput label="Length (m)" value={loftLength} onChange={setLoftLength} />
              </DimensionGrid>
              <AreaDisplay area={loftWidth * loftLength} />
              <Toggle label="Dormer extension" checked={loftDormer} onChange={setLoftDormer} />
              <Toggle label="Include en-suite bathroom" checked={loftBathroom} onChange={setLoftBathroom} />
              <NumberInput label="Velux windows" value={loftVelux} onChange={setLoftVelux} max={8} />
            </div>
          )}

          {/* REFURB (shown for 'refurb' and 'loftRefurb') */}
          {showRooms && (
            <div className={`space-y-4 ${projectType !== 'refurb' ? 'mt-5 pt-5 border-t' : ''}`} style={projectType !== 'refurb' ? { borderColor: '#e5e7eb' } : {}}>
              {projectType !== 'refurb' && <h3 className="font-bold text-sm" style={{ color: C.green }}>Whole house refurbishment - existing rooms</h3>}
              <div className="space-y-3">
                {rooms.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed p-4 text-center text-sm" style={{ borderColor: '#e5e7eb', color: C.sage }}>
                    No rooms added yet. Add the rooms you want to refurbish below.
                  </div>
                )}
                {rooms.map((r, i) => (
                  <RoomCard key={r.id} room={r} index={i} canDelete={true}
                    onUpdate={(k, v) => updateRoom(r.id, k, v)} onRemove={() => removeRoom(r.id)} />
                ))}
              </div>
              <button onClick={addRoom} className="w-full p-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition hover:bg-gray-50"
                style={{ borderColor: C.sage, color: C.sage }}>
                <Plus size={16} /> <span className="font-semibold text-sm">{rooms.length === 0 ? 'Add a room' : 'Add another room'}</span>
              </button>

              <div className="pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                <h3 className="font-bold text-sm mb-3" style={{ color: C.green }}>Whole-house upgrades</h3>
                <div className="space-y-2">
                  <Toggle label="New boiler" checked={refurbBoiler} onChange={setRefurbBoiler} />
                  <NumberInput label="Rewiring points (£105/point)" value={refurbRewirePoints} onChange={setRefurbRewirePoints} max={60} />
                  <NumberInput label="New windows (count)" value={refurbWindows} onChange={setRefurbWindows} max={20} />
                  <NumberInput label="New external doors" value={refurbDoorsExt} onChange={setRefurbDoorsExt} max={5} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SUMMARY */}
        <section className="rounded-2xl p-4 shadow-md" style={{ backgroundColor: C.green }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator size={20} color={C.gold} />
              <h2 className="font-bold text-white">Your budget estimate</h2>
            </div>
          </div>

          <div className="relative">
            <div className={resultsUnlocked ? '' : 'blur-sm pointer-events-none select-none'} aria-hidden={!resultsUnlocked}>
              <div className="bg-white/5 rounded-xl p-4 mb-3">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: C.mint }}>Build subtotal</div>
                <div className="text-2xl sm:text-3xl font-black text-white">{fmt(subtotal)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: C.mint }}>+ Contingency 15%</div>
                  <div className="text-sm font-bold text-white">{fmt(contingency15)}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: C.mint }}>+ VAT estimate (20%)</div>
                  <div className="text-sm font-bold text-white">{fmt(vat)}</div>
                </div>
              </div>

              <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: C.gold }}>
                <div className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: C.green }}>Working budget (recommended)</div>
                <div className="text-2xl sm:text-3xl font-black" style={{ color: C.green }}>{fmt(totalIncVat)}</div>
                <div className="text-[11px] mt-1 font-medium" style={{ color: C.green }}>Subtotal + 15% contingency + VAT</div>
              </div>

              <button onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full p-3 rounded-xl bg-white/10 text-white text-sm font-semibold flex items-center justify-between">
                <span>See detailed breakdown</span>
                {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showBreakdown && (
                <div className="mt-3 bg-white rounded-xl p-3 space-y-1">
                  {active.breakdown.map((item, i) => (
                    item.isSection ? (
                      <div key={i} className="pt-3 pb-1 text-xs font-black uppercase tracking-wider" style={{ color: C.sage }}>{item.label}</div>
                    ) : (
                      <div key={i} className="py-1.5 border-b last:border-0" style={{ borderColor: '#f0f0f0' }}>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold" style={{ color: C.green }}>{item.label}</span>
                          <span className="font-semibold" style={{ color: C.green }}>{fmt(item.value)}</span>
                        </div>
                        {item.subItems && item.subItems.length > 0 && (
                          <div className="mt-1 ml-3 space-y-0.5">
                            {item.subItems.map((sub, j) => (
                              <div key={j} className="flex justify-between text-xs">
                                <span style={{ color: C.sage }}>- {sub.label}</span>
                                <span style={{ color: C.sage }}>{fmt(sub.value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  ))}
                  <div className="flex justify-between text-sm pt-3 font-bold" style={{ color: C.green }}>
                    <span>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                </div>
              )}

              <button onClick={handleDownloadPdf}
                className="w-full mt-3 p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
                style={{ backgroundColor: C.gold, color: C.green }}>
                <Download size={16} /> Download summary (open & print to PDF)
              </button>
            </div>

            {!resultsUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <div className="bg-white rounded-2xl p-4 w-full max-w-sm text-center shadow-lg">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.green }}>Your budget is ready</p>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: C.sage }}>Enter your email to reveal your working budget and full cost breakdown.</p>
                  <div ref={kajabiFormRef} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SIMON'S NOTE */}
        <section className="rounded-2xl p-4" style={{ backgroundColor: C.gold }}>
          <button onClick={() => setShowTips(!showTips)} className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={18} color={C.green} />
              <h3 className="font-bold" style={{ color: C.green }}>Simon's tips for your budget</h3>
            </div>
            {showTips ? <ChevronUp size={16} color={C.green} /> : <ChevronDown size={16} color={C.green} />}
          </button>
          {showTips && (
            <div className="space-y-2 text-sm" style={{ color: C.green }}>
              <Tip>Get a contractor estimate as early as possible - even rough - then add 20% as your working budget.</Tip>
              <Tip>Never start a project without at least 10% contingency. We recommend 15-20%.</Tip>
              <Tip>Finishes and fixtures (kitchen, bathroom, tiles, flooring) typically account for 20% of total spend - homeowners massively underestimate this.</Tip>
              <Tip>Order bi-fold doors, bespoke kitchens, and structural steels on Day 1 of the build - 8-14 week lead times are common.</Tip>
              <Tip>Keep 2-5% retention back for 4 weeks after practical completion to ensure snagging is resolved.</Tip>
              {projectType === 'loftRefurb' && (
                <Tip>Running a loft conversion and a whole-house refurb together saves on shared scaffolding, skips and site prelims - but sequence trades carefully so the loft structure is watertight before first-fix begins downstairs.</Tip>
              )}
            </div>
          )}
        </section>

        {/* DISCLAIMER */}
        <section className="bg-white rounded-2xl p-4 text-xs" style={{ color: C.sage }}>
          <div className="flex gap-2">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <p>This estimate is a guide based on average 2026 London pricing from The Renovation Roadmap. Actual costs vary by region (15-25% lower outside London), property condition, and specification choices. Always obtain three formal quotes against an agreed Scope of Works before committing.</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="no-print py-6 mt-4" style={{ backgroundColor: C.navBg }}>
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center gap-2">
          <LogoFull />
          <p className="text-[10px] mt-2 text-center" style={{ color: C.mint }}>
            © Thrive Property Education - Based on <em>The Renovation Roadmap</em> by Simon Bawden
          </p>
        </div>
      </footer>

      {/* STICKY BOTTOM TOTAL (mobile) */}
      <div className="no-print fixed bottom-0 left-0 right-0 shadow-2xl z-10 sm:hidden" style={{ backgroundColor: C.navBg, borderTop: `3px solid ${C.gold}` }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.mint }}>Working budget</div>
            {resultsUnlocked ? (
              <div className="text-xl font-black" style={{ color: C.gold }}>{fmt(totalIncVat)}</div>
            ) : (
              <div className="text-xl font-black blur-sm select-none" style={{ color: C.gold }}>{fmt(totalIncVat)}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-[10px]" style={{ color: C.mint }}>{QUALITY_LABELS[quality].label} finish</div>
            <div className="text-[10px]" style={{ color: C.mint }}>{resultsUnlocked ? 'inc. 15% contingency + VAT' : 'Enter email to reveal'}</div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY SUMMARY (used for "Download as PDF" via browser print) */}
      <div id="print-summary" ref={printRef} style={{ padding: '24px', fontFamily: 'Arial, sans-serif', color: C.green }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `3px solid ${C.gold}`, paddingBottom: '12px', marginBottom: '16px' }}>
          <LogoFull />
          <div style={{ fontSize: '11px' }}>{today()}</div>
        </div>
        <h1 style={{ fontSize: '18px', margin: '0 0 4px' }}>Renovation Budget Summary</h1>
        <p style={{ fontSize: '12px', margin: '0 0 16px', color: C.sage }}>{PROJECT_LABELS[projectType]} - {QUALITY_LABELS[quality].label} finish</p>

        {showExtensionDetails && (
          <p style={{ fontSize: '11px', margin: '0 0 12px' }}>{PRICING.extensions[extType].name}: {(extWidth * extLength).toFixed(1)} m² ({extWidth}m x {extLength}m){extBifold ? ', bi-fold/sliding doors' : ''}{extKitchen ? ', new kitchen fit-out' : ''}</p>
        )}
        {showLoft && (
          <p style={{ fontSize: '11px', margin: '0 0 12px' }}>Loft area: {(loftWidth * loftLength).toFixed(1)} m² ({loftWidth}m x {loftLength}m){loftDormer ? ', with dormer' : ''}{loftBathroom ? ', en-suite bathroom included' : ''}</p>
        )}
        {showRooms && rooms.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '16px' }}>
            <thead>
              <tr style={{ backgroundColor: C.mint }}>
                <th style={{ textAlign: 'left', padding: '6px' }}>Room</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Dimensions</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Floor finish</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Skirting</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>New door(s)</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>{r.name} ({r.type})</td>
                  <td style={{ padding: '6px' }}>{r.width}m x {r.length}m x {r.height}m ({(r.width * r.length).toFixed(1)} m²)</td>
                  <td style={{ padding: '6px' }}>{FLOOR_LABELS[r.floorType]}</td>
                  <td style={{ padding: '6px' }}>{r.skirting ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '6px' }}>{r.newDoor ? `Yes (${r.doorCount})` : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 style={{ fontSize: '13px', margin: '16px 0 8px' }}>Cost breakdown</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <tbody>
            {active.breakdown.map((item, i) => (
              item.isSection ? (
                <tr key={i}><td colSpan={2} style={{ padding: '10px 0 4px', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', color: C.sage }}>{item.label}</td></tr>
              ) : (
                <>
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '4px 0', fontWeight: 600 }}>{item.label}</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{fmt(item.value)}</td>
                  </tr>
                  {item.subItems && item.subItems.map((sub, j) => (
                    <tr key={`${i}-${j}`}>
                      <td style={{ padding: '1px 0 1px 16px', color: C.sage }}>- {sub.label}</td>
                      <td style={{ padding: '1px 0', textAlign: 'right', color: C.sage }}>{fmt(sub.value)}</td>
                    </tr>
                  ))}
                </>
              )
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `2px solid ${C.green}`, fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>Contingency (15%)</span><span>{fmt(contingency15)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>VAT estimate (20%)</span><span>{fmt(vat)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 900, fontSize: '15px', borderTop: '1px solid #e5e7eb', marginTop: '4px' }}>
            <span>Working budget</span><span>{fmt(totalIncVat)}</span>
          </div>
        </div>

        <p style={{ fontSize: '9px', color: C.sage, marginTop: '20px', lineHeight: 1.5 }}>
          This estimate is a guide based on average 2026 London pricing from The Renovation Roadmap by Simon Bawden. Actual costs vary by region (15-25% lower outside London), property condition, and specification choices. Always obtain three formal quotes against an agreed Scope of Works before committing. © Thrive Property Education.
        </p>
      </div>
    </div>
  );
}

// ============ COMPONENTS ============
const Label = ({ children }) => (
  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: C.sage }}>{children}</label>
);

const DimensionGrid = ({ children }) => (<div className="grid grid-cols-2 gap-3">{children}</div>);

const DimInput = ({ label, value, onChange, step = 0.1 }) => (
  <div>
    <Label>{label}</Label>
    <input type="number" inputMode="decimal" min="0" step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full p-3 rounded-lg border-2 text-base font-semibold"
      style={{ borderColor: '#e5e7eb', color: C.green }} />
  </div>
);

const NumberInput = ({ label, value, onChange, max = 99 }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border-2" style={{ borderColor: '#e5e7eb' }}>
    <span className="text-sm font-medium" style={{ color: C.green }}>{label}</span>
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: C.sage }}>-</button>
      <span className="w-8 text-center font-bold" style={{ color: C.green }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: C.sage }}>+</button>
    </div>
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <button onClick={() => onChange(!checked)}
    className="w-full p-3 rounded-lg border-2 flex items-center justify-between transition"
    style={{ borderColor: checked ? C.sage : '#e5e7eb', backgroundColor: checked ? C.mint : 'white' }}>
    <span className="text-sm font-medium text-left" style={{ color: C.green }}>{label}</span>
    <div className="w-10 h-6 rounded-full relative transition" style={{ backgroundColor: checked ? C.green : '#d1d5db' }}>
      <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow" style={{ left: checked ? '18px' : '2px' }}>
        {checked && <Check size={12} className="absolute top-1 left-1" color={C.green} strokeWidth={3} />}
      </div>
    </div>
  </button>
);

const AreaDisplay = ({ area }) => (
  <div className="rounded-lg p-3 flex items-center justify-between" style={{ backgroundColor: C.mint }}>
    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Floor area</span>
    <span className="text-lg font-black" style={{ color: C.green }}>{area.toFixed(1)} m²</span>
  </div>
);

const Tip = ({ children }) => (
  <div className="flex gap-2 text-sm">
    <ArrowRight size={14} className="flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

function RoomCard({ room, index, canDelete, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(true);
  const area = room.width * room.length;
  return (
    <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: C.sage }}>
      <div className="p-3 flex items-center justify-between" style={{ backgroundColor: C.mint }}>
        <input value={room.name} onChange={e => onUpdate('name', e.target.value)}
          className="bg-transparent font-bold text-sm flex-1 outline-none" style={{ color: C.green }} />
        <span className="text-xs mr-2" style={{ color: C.green }}>{area.toFixed(1)} m²</span>
        <button onClick={() => setExpanded(!expanded)} className="p-1">
          {expanded ? <ChevronUp size={16} color={C.green} /> : <ChevronDown size={16} color={C.green} />}
        </button>
        {canDelete && (<button onClick={onRemove} className="p-1 ml-1"><Trash2 size={14} color="#dc2626" /></button>)}
      </div>
      {expanded && (
        <div className="p-3 space-y-3 bg-white">
          <div>
            <Label>Room type</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {['kitchen', 'bathroom', 'bedroom', 'living'].map(t => (
                <button key={t} onClick={() => onUpdate('type', t)}
                  className="p-2 rounded-lg text-xs font-semibold capitalize transition border-2"
                  style={{ backgroundColor: room.type === t ? C.green : 'white', color: room.type === t ? 'white' : C.green, borderColor: room.type === t ? C.gold : '#e5e7eb' }}>{t}</button>
              ))}
            </div>
          </div>

          <Label>Room measurements</Label>
          <div className="grid grid-cols-3 gap-2">
            <DimInput label="Width (m)" value={room.width} onChange={v => onUpdate('width', v)} />
            <DimInput label="Length (m)" value={room.length} onChange={v => onUpdate('length', v)} />
            <DimInput label="Height (m)" value={room.height} onChange={v => onUpdate('height', v)} />
          </div>

          <div>
            <Label>Floor finish</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {Object.entries(FLOOR_LABELS).map(([id, l]) => (
                <button key={id} onClick={() => onUpdate('floorType', id)}
                  className="p-2 rounded-lg text-xs font-semibold transition border-2"
                  style={{ backgroundColor: room.floorType === id ? C.green : 'white', color: room.floorType === id ? 'white' : C.green, borderColor: room.floorType === id ? C.gold : '#e5e7eb' }}>{l}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Toggle label="Strip out existing" checked={room.stripOut} onChange={v => onUpdate('stripOut', v)} />
            <Toggle label="Re-plaster walls" checked={room.replaster} onChange={v => onUpdate('replaster', v)} />
            <Toggle label="Paint walls + ceiling" checked={room.paint} onChange={v => onUpdate('paint', v)} />
            <Toggle label="New skirting boards" checked={room.skirting} onChange={v => onUpdate('skirting', v)} />
            <Toggle label="New door(s)" checked={room.newDoor} onChange={v => onUpdate('newDoor', v)} />
            {room.newDoor && <NumberInput label="Number of new doors" value={room.doorCount} onChange={v => onUpdate('doorCount', v)} max={6} />}
            <Toggle label="Extractor fan (£160 each)" checked={room.extractorFan} onChange={v => onUpdate('extractorFan', v)} />
            {room.extractorFan && <NumberInput label="Number of extractor fans" value={room.extractorCount} onChange={v => onUpdate('extractorCount', v)} max={4} />}
            <div>
              <NumberInput label="Electrical points (£105/point)" value={room.electricPoints} onChange={v => onUpdate('electricPoints', v)} max={30} />
              {ELECTRIC_POINT_GUIDE[room.type] && (
                <p className="text-[11px] mt-1 px-1 leading-snug" style={{ color: C.sage }}>
                  Typical {room.type}: {ELECTRIC_POINT_GUIDE[room.type].range} points - {ELECTRIC_POINT_GUIDE[room.type].note}. Count up your own sockets, switches and light fittings and enter the total.
                </p>
              )}
            </div>
            <NumberInput label="Radiators" value={room.radiator} onChange={v => onUpdate('radiator', v)} max={4} />
          </div>
        </div>
      )}
    </div>
  );
}
