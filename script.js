// Inicializar array de juegos desde LocalStorage o vacío
let games = JSON.parse(localStorage.getItem('platinumGames')) || [];

// Función para guardar en LocalStorage
function saveToSystem() {
    localStorage.setItem('platinumGames', JSON.stringify(games));
    renderGames();
}

// Función para añadir juego
async function addGame() {
    const nameInput = document.getElementById('gameName');
    const platformInput = document.getElementById('platform');
    const btn = document.getElementById('addBtn');

    const name = nameInput.value.trim();
    const platform = platformInput.value.trim();
    const apiKey = document.getElementById('api-key').value.trim();

    if (name === '' || platform === '') {
        alert('ERROR: DATOS INCOMPLETOS. ABORTANDO.');
        return;
    }

    btn.innerText = "SCANNING DATABASE...";
    btn.disabled = true;

    let gameData = {
        image: '',
        genres: 'UNKNOWN',
        playtime: '??',
        difficulty: 'N/A',
        metacritic: 'N/A'
    };

    // Intentar buscar en la API si hay Key
    if (apiKey) {
        try {
            const response = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(name)}&page_size=1`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                gameData.image = result.background_image;
                gameData.genres = result.genres.map(g => g.name).join(', ') || 'GENERIC';
                gameData.playtime = result.playtime > 0 ? result.playtime + 'H' : 'VARIES';
                gameData.metacritic = result.metacritic || 'N/A';
                
                // "IA" para calcular dificultad basada en rating y tiempo
                if (result.playtime > 50) gameData.difficulty = "HARDCORE";
                else if (result.playtime > 20) gameData.difficulty = "MODERATE";
                else if (result.playtime > 0) gameData.difficulty = "CASUAL";
                else gameData.difficulty = "UNKNOWN";
            }
        } catch (error) {
            console.error("API Error", error);
            alert("WARNING: CONNECTION TO DATABASE FAILED. USING MANUAL MODE.");
        }
    }

    const newGame = {
        id: Date.now(),
        name: name,
        platform: platform,
        date: new Date().toLocaleDateString(),
        ...gameData
    };

    games.unshift(newGame); // Añadir al principio
    saveToSystem();

    // Limpiar inputs
    nameInput.value = '';
    platformInput.value = '';
    nameInput.focus();
    btn.innerText = "INITIALIZE UPLOAD";
    btn.disabled = false;
}

// Función para borrar juego
function deleteGame(id) {
    if(confirm('WARNING: ¿ELIMINAR REGISTRO DE LA BASE DE DATOS?')) {
        games = games.filter(game => game.id !== id);
        saveToSystem();
    }
}

// Función de seguridad para que no te cuelen scripts raros (Sanitize)
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Función para renderizar la lista
function renderGames() {
    const list = document.getElementById('gameList');
    const countLabel = document.getElementById('total-count');
    
    if (!list) return;

    list.innerHTML = '';
    
    // Actualizar contador con ceros a la izquierda
    const count = games.length.toString().padStart(2, '0');
    countLabel.innerText = `TOTAL PLATINUMS: ${count}`;
    updateRank(games.length);

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        if(game.image) {
            card.style.backgroundImage = `url('${game.image}')`;
        }
        card.innerHTML = `
            <div class="game-info">
                <h3>${escapeHtml(game.name)}</h3>
                <div class="game-meta">
                    <span class="platform-tag">${escapeHtml(game.platform.toUpperCase())}</span>
                    <span class="meta-item">📂 ${escapeHtml(game.genres)}</span>
                    <span class="meta-item">⏱️ ${escapeHtml(game.playtime)}</span>
                    <span class="meta-item">💀 ${escapeHtml(game.difficulty)}</span>
                    <span class="meta-item">Ⓜ️ ${escapeHtml(game.metacritic || 'N/A')}</span>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteGame(${game.id})">PURGE</button>
        `;
        list.appendChild(card);
    });
}

// Sistema de Rangos
function updateRank(count) {
    const rankEl = document.getElementById('player-rank');
    if (!rankEl) return;

    let rank = "NEON ROOKIE";
    let color = "#ffffff";

    if (count >= 50) { rank = "OMNI-GOD"; color = "#ff0000"; } // Rojo
    else if (count >= 25) { rank = "TITANIUM LEGEND"; color = "#ffd700"; } // Dorado
    else if (count >= 10) { rank = "PHANTOM ELITE"; color = "#c0c0c0"; } // Plata
    else if (count >= 5) { rank = "CYBER HUNTER"; color = "#00f3ff"; } // Cian
    else { rank = "NEON ROOKIE"; color = "#ffffff"; } // Blanco

    rankEl.innerText = `RANK: ${rank}`;
    rankEl.style.color = "var(--neon-cyan)"; /* Forzar color neutro */
    rankEl.style.textShadow = "none";
}

// Relojes Mundiales
function updateClocks() {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    
    if(document.getElementById('clock-esp')) {
        document.getElementById('clock-esp').innerText = now.toLocaleTimeString('es-ES', { ...options, timeZone: 'Europe/Madrid' });
        document.getElementById('clock-som').innerText = now.toLocaleTimeString('en-US', { ...options, timeZone: 'Africa/Mogadishu' });
        document.getElementById('clock-usa').innerText = now.toLocaleTimeString('en-US', { ...options, timeZone: 'America/New_York' });
        document.getElementById('clock-sa').innerText = now.toLocaleTimeString('en-US', { ...options, timeZone: 'Asia/Riyadh' });
        document.getElementById('clock-ma').innerText = now.toLocaleTimeString('en-US', { ...options, timeZone: 'Africa/Casablanca' });
        document.getElementById('clock-vn').innerText = now.toLocaleTimeString('en-US', { ...options, timeZone: 'Asia/Ho_Chi_Minh' });
        document.getElementById('clock-bd').innerText = now.toLocaleTimeString('en-US', { ...options, timeZone: 'Asia/Dhaka' });
        document.getElementById('clock-ke').innerText = now.toLocaleTimeString('en-US', { ...options, timeZone: 'Africa/Nairobi' });
        document.getElementById('clock-in').innerText = now.toLocaleTimeString('en-US', { ...options, timeZone: 'Asia/Kolkata' });
        document.getElementById('clock-meme').innerText = now.toLocaleTimeString('en-US', { ...options, timeZone: 'America/New_York' });
    }
}

// --- SISTEMA DE CONFIGURACIÓN DE COLORES ---
const defaultColors = { primary: '#00f3ff', secondary: '#ff00ff', bg: '#050505', apiKey: '' };

function toggleConfig() {
    document.getElementById('configPanel').classList.toggle('active');
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyColors(primary, secondary, bg, apiKey) {
    const root = document.documentElement;
    root.style.setProperty('--neon-cyan', primary);
    root.style.setProperty('--neon-pink', secondary);
    root.style.setProperty('--bg-color', bg);
    
    // Actualizar colores derivados (transparencias)
    root.style.setProperty('--panel-bg', hexToRgba(primary, 0.05));
    root.style.setProperty('--grid-color', hexToRgba(primary, 0.1));

    // Guardar preferencias
    localStorage.setItem('platinumConfig', JSON.stringify({ primary, secondary, bg, apiKey }));
}

function loadColors() {
    const saved = JSON.parse(localStorage.getItem('platinumConfig'));
    const p = saved ? saved.primary : defaultColors.primary;
    const s = saved ? saved.secondary : defaultColors.secondary;
    const b = saved ? saved.bg : defaultColors.bg;
    const k = saved ? saved.apiKey : '';

    if(document.getElementById('col-primary')) {
        document.getElementById('col-primary').value = p;
        document.getElementById('col-secondary').value = s;
        document.getElementById('col-bg').value = b;
        document.getElementById('api-key').value = k;
    }
    applyColors(p, s, b, k);
}

function resetColors() {
    document.getElementById('col-primary').value = defaultColors.primary;
    document.getElementById('col-secondary').value = defaultColors.secondary;
    document.getElementById('col-bg').value = defaultColors.bg;
    document.getElementById('api-key').value = '';
    applyColors(defaultColors.primary, defaultColors.secondary, defaultColors.bg, '');
}

// --- SISTEMA DE PERFILES ---
let currentProfileId = 1;
const defaultProfile = { platform: '', name: 'LINK ACCOUNT', level: 'OFFLINE', avatar: '', url: '' };

function loadProfiles() {
    const p1 = JSON.parse(localStorage.getItem('profile1')) || defaultProfile;
    const p2 = JSON.parse(localStorage.getItem('profile2')) || defaultProfile;
    renderProfile(1, p1);
    renderProfile(2, p2);
}

function renderProfile(id, data) {
    const nameEl = document.getElementById(`p${id}-name`);
    if(!nameEl) return;

    nameEl.innerText = data.name === 'LINK ACCOUNT' ? `LINK ACCOUNT 0${id}` : data.name;
    document.getElementById(`p${id}-level`).innerText = data.platform ? `${data.platform} // ${data.level}` : 'OFFLINE';
    
    const avatarEl = document.getElementById(`p${id}-avatar`);
    if (data.avatar) {
        avatarEl.style.backgroundImage = `url('${data.avatar}')`;
    } else {
        avatarEl.style.backgroundImage = 'none';
    }
}

function openProfileEditor(id) {
    currentProfileId = id;
    const saved = JSON.parse(localStorage.getItem(`profile${id}`)) || defaultProfile;
    
    document.getElementById('edit-platform').value = saved.platform || '';
    document.getElementById('edit-name').value = saved.name === 'LINK ACCOUNT' ? '' : saved.name;
    document.getElementById('edit-level').value = saved.level === 'OFFLINE' ? '' : saved.level;
    document.getElementById('edit-avatar').value = saved.avatar || '';
    document.getElementById('edit-url').value = saved.url || '';
    
    document.getElementById('profileEditor').style.display = 'block';
}

function closeProfileEditor() {
    document.getElementById('profileEditor').style.display = 'none';
}

function saveProfile() {
    const data = {
        platform: document.getElementById('edit-platform').value.toUpperCase(),
        name: document.getElementById('edit-name').value,
        level: document.getElementById('edit-level').value,
        avatar: document.getElementById('edit-avatar').value,
        url: document.getElementById('edit-url').value
    };

    if(!data.name) data.name = 'LINK ACCOUNT';

    localStorage.setItem(`profile${currentProfileId}`, JSON.stringify(data));
    renderProfile(currentProfileId, data);
    closeProfileEditor();
}

function visitProfile(id) {
    const saved = JSON.parse(localStorage.getItem(`profile${id}`));
    if (saved && saved.url) {
        window.open(saved.url, '_blank');
    } else {
        openProfileEditor(id);
    }
}

// Navegación
function enterSystem() {
    const menu = document.getElementById('mainMenu');
    menu.style.transition = "opacity 0.8s ease-out";
    menu.style.opacity = "0";
    setTimeout(() => {
        window.location.href = 'hub.html';
    }, 800);
}

function openApp(page) {
    window.location.href = page;
}

function closeApp() {
    window.location.href = 'hub.html';
}

// --- AUDIO DE SISTEMA (LO-FI) ---
function connectSystemAudio() {
    const frame = document.getElementById('sys-audio-frame');
    // Mix Lo-Fi Hip Hop (10 Horas) - Sin vídeo, solo audio
    frame.innerHTML = '<iframe width="1" height="1" src="https://www.youtube.com/embed/n61ULEU7CO0?autoplay=1&loop=1&playlist=n61ULEU7CO0" title="Lo-Fi Radio" frameborder="0" allow="autoplay" allowfullscreen></iframe>';
    
    document.getElementById('sys-controls').style.display = 'none';
    document.getElementById('sys-visualizer').style.display = 'flex';
}

// --- SISTEMA DE EXPORTACIÓN / IMPORTACIÓN ---
function exportData() {
    const data = {
        games: games,
        profile1: JSON.parse(localStorage.getItem('profile1')),
        profile2: JSON.parse(localStorage.getItem('profile2')),
        config: JSON.parse(localStorage.getItem('platinumConfig'))
    };
    // Codificar a Base64 manejando caracteres especiales (utf-8)
    const dataStr = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    
    navigator.clipboard.writeText(dataStr).then(() => {
        alert('✅ CÓDIGO COPIADO AL PORTAPAPELES.\n\nPásale este código a tu novia por WhatsApp. Ella solo tiene que entrar a la web, darle a "CARGAR DATOS" y pegar esto.');
    });
}

function importData() {
    const code = prompt("PEGA EL CÓDIGO QUE TE HAN PASADO:");
    if (code) {
        try {
            const jsonStr = decodeURIComponent(escape(atob(code)));
            const data = JSON.parse(jsonStr);
            
            if (data.games) {
                games = data.games;
                localStorage.setItem('platinumGames', JSON.stringify(games));
            }
            if (data.profile1) localStorage.setItem('profile1', JSON.stringify(data.profile1));
            if (data.profile2) localStorage.setItem('profile2', JSON.stringify(data.profile2));
            if (data.config) localStorage.setItem('platinumConfig', JSON.stringify(data.config));
            
            alert('✅ DATOS SINCRONIZADOS CORRECTAMENTE.\nREINICIANDO SISTEMA...');
            location.reload();
        } catch (e) {
            console.error(e);
            alert('❌ ERROR: EL CÓDIGO NO ES VÁLIDO O ESTÁ CORRUPTO.');
        }
    }
}

// Inicialización al cargar
document.addEventListener('DOMContentLoaded', () => {
    loadColors();
    loadProfiles();
    setInterval(updateClocks, 1000);
    updateClocks();

    // Listeners para cambios de color en tiempo real
    const colorInputs = ['col-primary', 'col-secondary', 'col-bg', 'api-key'];
    colorInputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', () => {
                applyColors(
                    document.getElementById('col-primary').value,
                    document.getElementById('col-secondary').value,
                    document.getElementById('col-bg').value,
                    document.getElementById('api-key').value
                );
            });
        }
    });

    // Si estamos en la página de juegos
    if(document.getElementById('gameList')) {
        renderGames();
        // Permitir añadir con la tecla Enter
        const pInput = document.getElementById('platform');
        if(pInput) {
            pInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    addGame();
                }
            });
        }
    }
});
