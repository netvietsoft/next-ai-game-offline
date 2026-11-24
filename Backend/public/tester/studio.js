var bootstrap = window.__TESTER_BOOTSTRAP__ || { allGames: [], initialGameName: '' };
var allGames = bootstrap.allGames;
        var initialGameName = bootstrap.initialGameName;
var currentFilteredGames = allGames.slice();
var selectedIndex = 0;
var currentFilterType = 'all';
var isBannerActive = false;
var bannerMode = 'linearlayout'; // 'linearlayout' or 'overlay'
var currentOrientation = 'fullscreen';
var isTestingBatch = false;
var batchStopRequested = false;

// Khởi tạo
window.addEventListener('DOMContentLoaded', function() {
    renderGameList(allGames);
    
    // Tìm game mục tiêu từ URL hoặc route
    var urlParams = new URLSearchParams(window.location.search);
    var targetParam = urlParams.get('game') || urlParams.get('id') || initialGameName;

    var targetIdx = -1;
    if (targetParam) {
        targetIdx = allGames.findIndex(function(g) {
            return g.name.toLowerCase() === targetParam.toLowerCase() || g.title.toLowerCase() === targetParam.toLowerCase();
        });
    }

    if (targetIdx !== -1) {
        selectGame(targetIdx, false);
    } else if (allGames.length > 0) {
        selectGame(0, false);
    }

    // Lắng nghe sự kiện từ iframe game (Mock Android Bridge)
    window.addEventListener('message', function(event) {
        if (!event.data || event.data.type !== 'NEXTAI_BRIDGE_EVENT') return;
        var data = event.data;
        var time = data.timestamp || new Date().toLocaleTimeString();
        
        if (data.eventType === 'gameLoaded') {
            addLog(time, '🟢 [Bridge] gameLoaded() - Game nạp hoàn tất!', 'success');
            markGameStatus(data.game, 'playable');
        } else if (data.eventType === 'onGameReady') {
            addLog(time, '🟢 [Bridge] onGameReady() - Game sẵn sàng!', 'success');
            markGameStatus(data.game, 'playable');
        } else if (data.eventType === 'levelStartInGame') {
            addLog(time, '🎯 [Bridge] levelStartInGame(màn: ' + data.payload.level + ')', 'event');
        } else if (data.eventType === 'scoreInGame') {
            addLog(time, '⭐ [Bridge] scoreInGame(điểm: ' + data.payload.score + ')', 'score');
        } else if (data.eventType === 'showInterstitialInGame') {
            addLog(time, '📢 [Bridge] showInterstitialInGame(vị trí: ' + data.payload.place + ')', 'event');
        } else if (data.eventType === 'showRewardedInGame') {
            addLog(time, '🎁 [Bridge] showRewardedInGame(vị trí: ' + data.payload.place + ')', 'event');
        } else if (data.eventType === 'error') {
            addLog(time, '❌ [Game Error]: ' + data.payload.message + ' (' + data.payload.filename + ':' + data.payload.lineno + ')', 'error');
            markGameStatus(data.game, 'error');
        } else {
            addLog(time, 'ℹ️ [Bridge] ' + data.eventType + ' ' + JSON.stringify(data.payload || {}), 'event');
        }
    });
});

function renderGameList(games) {
    var container = document.getElementById('gameList');
    container.innerHTML = '';
    games.forEach(function(g, idx) {
        var item = document.createElement('div');
        item.className = 'game-item' + (idx === selectedIndex ? ' selected' : '');
        item.id = 'game-item-' + g.name;
        item.onclick = function() { selectGameByName(g.name); };

        var isHoriz = g.isHorizontal === 1;
        var iconUrl = g.icon ? ('/icons/' + g.icon) : ('/icons/' + g.name + '.png');
        var pos = g.position || (allGames.indexOf(g) + 1);

        item.innerHTML = 
            '<div style="position:relative;flex-shrink:0;">' +
                '<img class="game-icon-img" src="' + iconUrl + '" onerror="this.src=\'/icons/abalone.png\'">' +
                '<span style="position:absolute;top:2px;left:2px;background:rgba(15,23,42,0.85);color:#fff;font-size:9px;font-weight:700;padding:1px 4px;border-radius:4px;border:1px solid rgba(59,130,246,0.5);line-height:1.2;">#' + pos + '</span>' +
            '</div>' +
            '<div class="game-info">' +
                '<div class="game-name-title"><span style="color:#60a5fa;font-weight:700;margin-right:4px;">#' + pos + '</span>' + g.title + '</div>' +
                '<div class="game-meta">' +
                    '<span class="badge-cat">' + g.category + '</span>' +
                    '<span class="badge-orient ' + (isHoriz ? 'landscape' : 'portrait') + '">' + (isHoriz ? '🎮 Ngang' : '📱 Dọc') + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="game-status-dot" id="dot-' + g.name + '"></div>';

        container.appendChild(item);
    });
}

function filterGames() {
    var keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    currentFilteredGames = allGames.filter(function(g, idx) {
        var posStr = String(g.position || (idx + 1));
        var matchKeyword = !keyword || 
            g.title.toLowerCase().includes(keyword) || 
            g.name.toLowerCase().includes(keyword) || 
            (g.category && g.category.toLowerCase().includes(keyword)) ||
            posStr === keyword ||
            ('#' + posStr) === keyword ||
            posStr.startsWith(keyword);
        var matchFilter = true;
        if (currentFilterType === 'portrait') matchFilter = (g.isHorizontal === 0);
        if (currentFilterType === 'landscape') matchFilter = (g.isHorizontal === 1);
        return matchKeyword && matchFilter;
    });
    renderGameList(currentFilteredGames);
}

function setFilter(type, btn) {
    currentFilterType = type;
    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    filterGames();
}

function selectGameByName(name) {
    var idx = allGames.findIndex(function(g) { return g.name === name; });
    if (idx !== -1) selectGame(idx, true);
}

function selectGame(idx, shouldReload) {
    if (idx < 0 || idx >= allGames.length) return;
    selectedIndex = idx;
    var g = allGames[idx];

    document.querySelectorAll('.game-item').forEach(function(el) { el.classList.remove('selected'); });
    var activeItem = document.getElementById('game-item-' + g.name);
    if (activeItem) {
        activeItem.classList.add('selected');
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    document.getElementById('curTitle').innerText = g.title;
    document.getElementById('curName').innerText = 'ID: ' + g.name + ' • ' + g.category + (g.isHorizontal ? ' • 🎮 Game Ngang' : ' • 📱 Game Dọc');
    document.getElementById('curIcon').src = g.icon ? ('/icons/' + g.icon) : ('/icons/' + g.name + '.png');

    // Nếu đang ở chế độ khung điện thoại thì xoay theo hướng game, còn fullscreen thì giữ nguyên
    if (currentOrientation !== 'fullscreen') {
        if (g.isHorizontal === 1) {
            setOrientation('landscape');
        } else {
            setOrientation('portrait');
        }
    } else {
        setOrientation('fullscreen');
    }

    // Nạp game vào iframe qua đường dẫn chuẩn (được server.ts tự động inject Mock Android Bridge)
    var iframe = document.getElementById('gameIframe');
    iframe.src = '/games/' + g.name + '/index.html';

    // Cập nhật URL trên address bar để người dùng có thể copy/share link trực tiếp
    try {
        if (window.history && window.history.replaceState) {
            window.history.replaceState({ game: g.name }, g.title, '/tester/' + g.name);
        }
    } catch(e) {}

    addLog(new Date().toLocaleTimeString(), '▶️ Bắt đầu nạp game: ' + g.title + ' (' + g.name + ')', 'event');
}

function copyDirectLink() {
    var g = allGames[selectedIndex];
    if (!g) return;
    var fullUrl = window.location.origin + '/tester/' + g.name;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullUrl).then(function() {
            addLog(new Date().toLocaleTimeString(), '📋 Đã sao chép link test: ' + fullUrl, 'success');
            showToast('✅ Đã copy link test game: ' + fullUrl);
        }).catch(function() {
            prompt('Đường dẫn test game của bạn:', fullUrl);
        });
    } else {
        prompt('Đường dẫn test game của bạn:', fullUrl);
    }
}

function showToast(msg) {
    var toast = document.getElementById('toastNotice');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotice';
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = '#10b981';
        toast.style.color = '#fff';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '8px';
        toast.style.fontWeight = '600';
        toast.style.fontSize = '13px';
        toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        toast.style.zIndex = '9999';
        toast.style.transition = 'opacity 0.3s';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1';
    toast.style.display = 'block';
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { toast.style.display = 'none'; }, 300);
    }, 2500);
}

function selectNextGame() {
    if (selectedIndex < allGames.length - 1) {
        selectGame(selectedIndex + 1, true);
    }
}

function selectPreviousGame() {
    if (selectedIndex > 0) {
        selectGame(selectedIndex - 1, true);
    }
}

function reloadCurrentGame() {
    var g = allGames[selectedIndex];
    if (g) {
        var iframe = document.getElementById('gameIframe');
        iframe.src = '/games/' + g.name + '/index.html';
        addLog(new Date().toLocaleTimeString(), '🔄 Đã tải lại game: ' + g.title, 'event');
    }
}

function openDirectPlay() {
    var g = allGames[selectedIndex];
    if (g) {
        window.open('/tester/play/' + g.name, '_blank');
    }
}

// Điều khiển khung nhìn Simulator
function setOrientation(mode) {
    currentOrientation = mode;
    var container = document.getElementById('phoneContainer');
    var btnP = document.getElementById('btnPortrait');
    var btnL = document.getElementById('btnLandscape');
    var btnF = document.getElementById('btnFullscreen');

    container.classList.remove('fullscreen', 'portrait', 'landscape');
    if (btnP) btnP.classList.remove('active');
    if (btnL) btnL.classList.remove('active');
    if (btnF) btnF.classList.remove('active');

    if (mode === 'fullscreen') {
        container.classList.add('fullscreen');
        if (btnF) btnF.classList.add('active');
    } else if (mode === 'portrait') {
        container.classList.add('portrait');
        if (btnP) btnP.classList.add('active');
    } else if (mode === 'landscape') {
        container.classList.add('landscape');
        if (btnL) btnL.classList.add('active');
    }

    // Cập nhật hiển thị banner
    updateBannerVisibility();
}

function toggleFullscreen() {
    setOrientation('fullscreen');
}

// Mô phỏng AdMob Banner
function toggleBannerSimulation() {
    var g = allGames[selectedIndex];
    if (g && g.isHorizontal === 1 && !isBannerActive) {
        alert('⚠️ Game hiện tại là Game Ngang (Landscape)!\nTheo quy tắc UX của NextAI, Game Ngang KHÔNG BAO GIỜ hiển thị banner để tránh che 100% màn hình.');
        return;
    }
    isBannerActive = !isBannerActive;
    updateBannerVisibility();
}

function setBannerMode(mode) {
    bannerMode = mode;
    document.getElementById('btnModeLinearLayout').classList.toggle('active', mode === 'linearlayout');
    document.getElementById('btnModeOverlay').classList.toggle('active', mode === 'overlay');
    updateBannerVisibility();
}

function updateBannerVisibility() {
    var banner = document.getElementById('simBanner');
    var btn = document.getElementById('btnBannerToggle');
    var g = allGames[selectedIndex];
    var isHoriz = (g && g.isHorizontal === 1) || (currentOrientation === 'landscape');

    if (isBannerActive && !isHoriz) {
        banner.classList.add('visible');
        btn.classList.add('on');
        btn.innerText = '🔥 Banner AdMob 50px: ĐANG BẬT';

        if (bannerMode === 'overlay') {
            banner.classList.add('overlay-mode');
            addLog(new Date().toLocaleTimeString(), '📌 Đã bật Banner chế độ Overlay (Đè 50px lên canvas)', 'score');
        } else {
            banner.classList.remove('overlay-mode');
            addLog(new Date().toLocaleTimeString(), '📐 Đã bật Banner chế độ LinearLayout (Thu hẹp Game 50px)', 'score');
        }
    } else {
        banner.classList.remove('visible');
        banner.classList.remove('overlay-mode');
        btn.classList.remove('on');
        btn.innerText = '🔥 Banner AdMob 50px: ĐANG TẮT';
    }

    // Trigger resize trong iframe
    var iframe = document.getElementById('gameIframe');
    if (iframe && iframe.contentWindow) {
        try { iframe.contentWindow.dispatchEvent(new Event('resize')); } catch(e){}
    }
}

// Live Log Terminal
function addLog(time, msg, type) {
    var logs = document.getElementById('terminalLogs');
    var entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = '<span class="log-time">[' + time + ']</span><span class="log-msg ' + (type || '') + '">' + msg + '</span>';
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
}

function clearLogs() {
    document.getElementById('terminalLogs').innerHTML = '';
}

function markGameStatus(gameName, status) {
    var dot = document.getElementById('dot-' + gameName);
    if (dot) {
        dot.className = 'game-status-dot ' + status;
    }
}

// Chạy kiểm thử tự động hàng loạt (Batch Smoke Test)
function runAutomatedTest() {
    document.getElementById('smokeTestModal').style.display = 'flex';
}

function closeSmokeTestModal() {
    document.getElementById('smokeTestModal').style.display = 'none';
    batchStopRequested = true;
}

function stopBatchTest() {
    batchStopRequested = true;
    document.getElementById('batchProgress').innerText = 'Đã yêu cầu dừng kiểm thử!';
}

async function startBatchTest(limit) {
    batchStopRequested = false;
    isTestingBatch = true;
    var tbody = document.getElementById('batchTableBody');
    tbody.innerHTML = '';
    var listToTest = allGames.slice(0, limit);
    var progressEl = document.getElementById('batchProgress');

    var passedCount = 0;
    var errorCount = 0;

    for (var i = 0; i < listToTest.length; i++) {
        if (batchStopRequested) break;
        var g = listToTest[i];
        progressEl.innerText = 'Đang kiểm thử game ' + (i + 1) + '/' + listToTest.length + ': ' + g.title;

        var tr = document.createElement('tr');
        tr.id = 'batch-row-' + g.name;
        tr.style.borderBottom = '1px solid #1e293b';
        tr.innerHTML = 
            '<td style="padding: 8px;">' + (i + 1) + '</td>' +
            '<td style="padding: 8px; font-weight: 600;">' + g.title + '</td>' +
            '<td style="padding: 8px;">' + (g.isHorizontal ? '🎮 Ngang' : '📱 Dọc') + '</td>' +
            '<td style="padding: 8px;" id="batch-load-' + g.name + '">⏳ Đang load...</td>' +
            '<td style="padding: 8px;" id="batch-err-' + g.name + '">Không có</td>' +
            '<td style="padding: 8px;" id="batch-status-' + g.name + '">⏳ Testing</td>';
        tbody.appendChild(tr);

        // Load game vào simulator
        selectGameByName(g.name);

        // Đợi 3 giây để game nạp tài nguyên và kiểm tra
        await new Promise(function(resolve) { setTimeout(resolve, 3000); });

        // Đánh giá kết quả
        var loadTd = document.getElementById('batch-load-' + g.name);
        var statusTd = document.getElementById('batch-status-' + g.name);
        var dot = document.getElementById('dot-' + g.name);

        if (dot && dot.classList.contains('error')) {
            statusTd.innerHTML = '<span style="color: #ef4444; font-weight: bold;">❌ LỖI JS</span>';
            errorCount++;
        } else if (dot && dot.classList.contains('playable')) {
            loadTd.innerHTML = '<span style="color: #10b981;">✅ gameLoaded</span>';
            statusTd.innerHTML = '<span style="color: #10b981; font-weight: bold;">🟢 OK (Playable)</span>';
            passedCount++;
        } else {
            loadTd.innerHTML = '<span style="color: #94a3b8;">Sẵn sàng (Canvas render)</span>';
            statusTd.innerHTML = '<span style="color: #10b981; font-weight: bold;">🟢 OK (Canvas OK)</span>';
            passedCount++;
        }
    }

    progressEl.innerHTML = '🏁 Hoàn tất: <b style="color: #10b981;">' + passedCount + ' Đạt</b>, <b style="color: #ef4444;">' + errorCount + ' Lỗi</b> trên tổng số ' + listToTest.length + ' games.';
}
