import L from 'leaflet';

// SVG base64 icons
const serverIcon = new L.Icon({
    iconUrl:
        'data:image/svg+xml;base64,' + btoa(`<svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="8" width="20" height="25" rx="4" fill="#EF4444" stroke="#991B1B" stroke-width="2"/><rect x="10" y="13" width="12" height="15" rx="2" fill="#FFF"/><circle cx="16" cy="31" r="2" fill="#991B1B"/></svg>`),
    iconSize: [32, 41],
    iconAnchor: [16, 41],
    popupAnchor: [0, -41],
});

const boxIcon = new L.Icon({
    iconUrl:
        'data:image/svg+xml;base64,' + btoa(`<svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="12" width="20" height="17" rx="4" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/><rect x="10" y="17" width="12" height="7" rx="2" fill="#FFF"/><circle cx="16" cy="31" r="2" fill="#1E3A8A"/></svg>`),
    iconSize: [32, 41],
    iconAnchor: [16, 41],
    popupAnchor: [0, -41],
});

const userIcon = new L.Icon({
    iconUrl:
        'data:image/svg+xml;base64,' + btoa(`<svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="18" r="7" fill="#22C55E" stroke="#166534" stroke-width="2"/><rect x="8" y="27" width="16" height="7" rx="3.5" fill="#FFF"/><circle cx="16" cy="31" r="2" fill="#166534"/></svg>`),
    iconSize: [32, 41],
    iconAnchor: [16, 41],
    popupAnchor: [0, -41],
});

const onuIcon = (status) => {
    let color = '#22C55E'; // online
    let stroke = '#166534';
    if (status === 'isolir') {
        color = '#F59E42'; // kuning
        stroke = '#B45309';
    } else if (status === 'offline') {
        color = '#EF4444'; // merah
        stroke = '#991B1B';
    }
    return new L.Icon({
        iconUrl:
            'data:image/svg+xml;base64,' + btoa(`<svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="18" r="7" fill="${color}" stroke="${stroke}" stroke-width="2"/><rect x="8" y="27" width="16" height="7" rx="3.5" fill="#FFF"/><circle cx="16" cy="31" r="2" fill="${stroke}"/></svg>`),
        iconSize: [32, 41],
        iconAnchor: [16, 41],
        popupAnchor: [0, -41],
    });
};

export { serverIcon, boxIcon, userIcon, onuIcon };
