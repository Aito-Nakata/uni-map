// Mock data - same as in our React Native app
const mockStores = [
    {
        id: '1',
        name: 'ゲームセンター東京',
        address: '東京都渋谷区渋谷1-1-1',
        location: {
            type: 'Point',
            coordinates: [139.7016, 35.6586], // [longitude, latitude]
        },
        businessHours: {
            monday: { open: '10:00', close: '22:00' },
            tuesday: { open: '10:00', close: '22:00' },
            wednesday: { open: '10:00', close: '22:00' },
            thursday: { open: '10:00', close: '22:00' },
            friday: { open: '10:00', close: '24:00' },
            saturday: { open: '10:00', close: '24:00' },
            sunday: { open: '10:00', close: '22:00' },
        },
        chunithmInfo: {
            cabinets: 4,
            versions: ['CHUNITHM SUN', 'CHUNITHM NEW!!'],
            facilities: ['PASELI', 'TOURNAMENT'],
        },
        specialNotice: '土日は混雑が予想されます',
        lastUpdated: new Date('2024-01-15'),
        updatedBy: 'admin',
        photos: [],
        distance: 1.2,
        isFavorite: false,
    },
    {
        id: '2',
        name: 'アミューズメント大阪',
        address: '大阪府大阪市中央区難波1-1-1',
        location: {
            type: 'Point',
            coordinates: [135.5006, 34.6669], // [longitude, latitude]
        },
        businessHours: {
            monday: { open: '11:00', close: '23:00' },
            tuesday: { open: '11:00', close: '23:00' },
            wednesday: { open: '11:00', close: '23:00' },
            thursday: { open: '11:00', close: '23:00' },
            friday: { open: '11:00', close: '25:00' },
            saturday: { open: '10:00', close: '25:00' },
            sunday: { open: '10:00', close: '23:00' },
        },
        chunithmInfo: {
            cabinets: 6,
            versions: ['CHUNITHM SUN', 'CHUNITHM NEW!!', 'CHUNITHM PARADISE'],
            facilities: ['PASELI', 'TOURNAMENT', 'LIVE'],
        },
        lastUpdated: new Date('2024-01-20'),
        updatedBy: 'user123',
        photos: [],
        distance: 2.5,
        isFavorite: true,
    },
    {
        id: '3',
        name: 'ゲームパーク横浜',
        address: '神奈川県横浜市西区みなとみらい1-1-1',
        location: {
            type: 'Point',
            coordinates: [139.6317, 35.4560],
        },
        businessHours: {
            monday: { open: '10:00', close: '22:00' },
            tuesday: { open: '10:00', close: '22:00' },
            wednesday: { open: '10:00', close: '22:00' },
            thursday: { open: '10:00', close: '22:00' },
            friday: { open: '10:00', close: '24:00' },
            saturday: { open: '10:00', close: '24:00' },
            sunday: { open: '10:00', close: '22:00' },
        },
        chunithmInfo: {
            cabinets: 8,
            versions: ['CHUNITHM SUN', 'CHUNITHM NEW!!', 'CHUNITHM PARADISE', 'CHUNITHM CRYSTAL'],
            facilities: ['PASELI', 'TOURNAMENT', 'LIVE', 'HEADPHONE'],
        },
        specialNotice: '新筐体入荷しました！',
        lastUpdated: new Date('2024-01-22'),
        updatedBy: 'admin',
        photos: [],
        distance: 0.8,
        isFavorite: false,
    },
    {
        id: '4',
        name: 'エンターテイメント名古屋',
        address: '愛知県名古屋市中村区名駅1-1-1',
        location: {
            type: 'Point',
            coordinates: [136.8816, 35.1707],
        },
        businessHours: {
            monday: { open: '10:00', close: '22:00' },
            tuesday: { open: '10:00', close: '22:00' },
            wednesday: { open: '10:00', close: '22:00' },
            thursday: { open: '10:00', close: '22:00' },
            friday: { open: '10:00', close: '23:00' },
            saturday: { open: '10:00', close: '23:00' },
            sunday: { open: '10:00', close: '22:00' },
        },
        chunithmInfo: {
            cabinets: 2,
            versions: ['CHUNITHM NEW!!', 'CHUNITHM PARADISE'],
            facilities: ['PASELI'],
        },
        lastUpdated: new Date('2024-01-18'),
        updatedBy: 'user456',
        photos: [],
        distance: 3.2,
        isFavorite: false,
    },
];

// Global variables
let map;
let markers = [];
let currentStore = null;
let isOnline = navigator.onLine;

// Initialize the app
function initApp() {
    initMap();
    loadStores();
    setupEventListeners();
    updateOnlineStatus();
}

// Initialize the map
function initMap() {
    // Default location (Tokyo)
    map = L.map('map').setView([35.6812, 139.7671], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 12);
                
                // Add user location marker
                L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<div style="background: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(map).bindPopup('現在地');
            },
            (error) => {
                console.log('Location access denied or failed:', error);
            }
        );
    }
}

// Load and display stores
function loadStores() {
    clearMarkers();
    
    mockStores.forEach(store => {
        addStoreMarker(store);
    });
}

// Add a store marker to the map
function addStoreMarker(store) {
    const [lng, lat] = store.location.coordinates;
    const cabinetCount = store.chunithmInfo.cabinets;
    
    // Determine marker color based on cabinet count
    let markerClass = 'few-cabinets';
    if (cabinetCount >= 6) {
        markerClass = 'many-cabinets';
    } else if (cabinetCount >= 4) {
        markerClass = 'medium-cabinets';
    }
    
    // Create custom marker
    const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="store-marker ${markerClass}">
                <span style="font-size: 10px;">${cabinetCount}</span>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
    
    const marker = L.marker([lat, lng], { icon: markerIcon })
        .addTo(map)
        .on('click', () => showStoreInfo(store));
    
    markers.push(marker);
}

// Clear all markers
function clearMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
}

// Show store information modal
function showStoreInfo(store) {
    currentStore = store;
    
    document.getElementById('storeName').textContent = store.name;
    document.getElementById('storeAddress').textContent = store.address;
    
    const modalBody = document.getElementById('storeModalBody');
    modalBody.innerHTML = generateStoreInfoHTML(store);
    
    document.getElementById('storeModal').classList.add('show');
}

// Generate store info HTML
function generateStoreInfoHTML(store) {
    const today = new Date().getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayHours = store.businessHours[days[today]];
    
    let html = `
        <div class="info-row">
            <span class="material-icons">videogame_asset</span>
            <span>筐体数: ${store.chunithmInfo.cabinets}台</span>
        </div>
        
        <div class="info-row">
            <span class="material-icons">location_on</span>
            <span>距離: ${store.distance ? store.distance + 'km' : '不明'}</span>
        </div>
        
        <div class="info-row">
            <span class="material-icons">access_time</span>
            <span>本日: ${todayHours.open} - ${todayHours.close}</span>
        </div>
        
        <div class="section-title">対応バージョン</div>
        <div class="chips">
    `;
    
    store.chunithmInfo.versions.forEach(version => {
        html += `<span class="chip version">${version}</span>`;
    });
    
    html += `
        </div>
        
        <div class="section-title">設備・機能</div>
        <div class="chips">
    `;
    
    store.chunithmInfo.facilities.forEach(facility => {
        html += `<span class="chip">${facility}</span>`;
    });
    
    html += '</div>';
    
    if (store.specialNotice) {
        html += `
            <div class="notice-box">
                <div class="notice-title">
                    <span class="material-icons">info</span>
                    お知らせ
                </div>
                <div>${store.specialNotice}</div>
            </div>
        `;
    }
    
    return html;
}

// Close store modal
function closeStoreModal() {
    document.getElementById('storeModal').classList.remove('show');
    currentStore = null;
}

// Show store detail (placeholder)
function showStoreDetail() {
    if (currentStore) {
        alert(`${currentStore.name}の詳細画面を表示します。\n(実装予定)`);
    }
}

// Show filter modal (placeholder)
function showFilterModal() {
    alert('フィルター機能を表示します。\n(実装予定)');
}

// Go to current location
function goToCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 14);
            },
            (error) => {
                alert('位置情報を取得できませんでした。\n設定で位置情報サービスが有効になっているかご確認ください。');
            }
        );
    } else {
        alert('このブラウザは位置情報サービスに対応していません。');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
    
    // Online/offline status
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Close modal when clicking outside
    document.getElementById('storeModal').addEventListener('click', (e) => {
        if (e.target.id === 'storeModal') {
            closeStoreModal();
        }
    });
    
    // Tab clicks
    document.querySelectorAll('.tab').forEach((tab, index) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show placeholder messages for other tabs
            if (index !== 0) {
                const tabNames = ['マップ', 'リスト', 'お気に入り', '設定'];
                alert(`${tabNames[index]}画面を表示します。\n(実装予定)`);
            }
        });
    });
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (query.length === 0) {
        loadStores();
        return;
    }
    
    clearMarkers();
    
    const filteredStores = mockStores.filter(store => 
        store.name.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query)
    );
    
    filteredStores.forEach(store => {
        addStoreMarker(store);
    });
    
    // Focus on first result if available
    if (filteredStores.length > 0) {
        const [lng, lat] = filteredStores[0].location.coordinates;
        map.setView([lat, lng], 14);
    }
}

// Update online status
function updateOnlineStatus() {
    isOnline = navigator.onLine;
    const offlineNotice = document.getElementById('offlineNotice');
    
    if (isOnline) {
        offlineNotice.classList.remove('show');
    } else {
        offlineNotice.classList.add('show');
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', initApp);