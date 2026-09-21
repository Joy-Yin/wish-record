
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3lwbeUfEjntM2K3rgTI_8puNPDDCOBex97U6BCXfj-scvPYLqbDctl-HzL92_HyAcCNKg_D4KRlrP/pub?gid=0&single=true&output=csv";
let allRawRecords = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentFilteredData = [];

window.addEventListener('DOMContentLoaded', function () {
    const historyTableBody = document.getElementById('historyTableBody');
    const refreshBtn = document.getElementById('refreshBtn');
    const filterPlayer = document.getElementById('filterPlayer');
    const filterGame = document.getElementById('filterGame');
    const filterBanner = document.getElementById('filterBanner');
    const filterRarity = document.getElementById('filterRarity');
    const filterCount = document.getElementById('filterCount');
    const statsBox = document.getElementById('statsBox');
    const statsTotalPulls = document.getElementById('statsTotalPulls');
    const statsAvgPulls = document.getElementById('statsAvgPulls');
    const thPullsCount = document.getElementById('thPullsCount');
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const txtPageNum = document.getElementById('txtPageNum');

    // 直接改讀公開 CSV
    function fetchHistory() {
        refreshBtn.disabled = true; refreshBtn.innerText = "讀取中...";

        fetch(CSV_URL)
            .then(response => response.text()) // 注意：這裡改取文字檔 (CSV)
            .then(csvText => {
                allRawRecords = parseCSVToJSON(csvText); // 解析 CSV 轉成原本的物件格式
                calculateAndFilterData();
            })
            .catch(error => {
                console.error("抓取資料失敗:", error);
                historyTableBody.innerHTML = `<tr><td colspan="7" class="text-danger py-3">❌ 無法載入歷史紀錄，請檢查發布設定。</td></tr>`;
            })
            .finally(() => {
                refreshBtn.disabled = false; refreshBtn.innerText = "重新載入";
            });
    }

    // CSV 解析
    function parseCSVToJSON(csvText) {
        // 將 CSV 依行切開，並過濾空行
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length <= 1) return []; // 只有標題列或沒資料

        const records = [];

        // 從第 2 行開始跑（跳過第一行標題）
        for (let i = 1; i < lines.length; i++) {
            // 簡單處理逗號切分（若資料本身含有逗號需要精密解析，這裡目前針對你的抽卡格式已足夠）
            const row = lines[i].split(",");
            if (row.length < 6) continue;

            // 格式化時間 (將 Google 產出的 ISO 時間轉成美觀格式)
            let formattedDate = row[0].replace(/"/g, '').trim();
            if (formattedDate.includes(':')) {
                const parts = formattedDate.split(':');
                if (parts.length === 3) {
                    // 如果有三個部分 (時:分:秒)，就只保留到 (時:分)
                    formattedDate = parts[0] + ':' + parts[1];
                }
            }
            

            records.push({
                time: formattedDate,
                playerName: row[1],
                gameName: row[2],
                bannerType: row[3],
                rarity: row[4],
                itemName: row[5]
            });
        }

        // 為了符合你原本的邏輯（最新到最舊），我們需要將順序反轉
        return records.reverse();
    }

    function calculateAndFilterData() {
        const targetPlayer = filterPlayer.value;
        const targetGame = filterGame.value;
        const targetBanner = filterBanner.value;
        const targetRarity = filterRarity.value;

        const isStrictPoolSelected = (targetPlayer !== 'ALL' && targetGame !== 'ALL' && targetBanner !== 'ALL');

        const poolSequence = [...allRawRecords].reverse().filter(item => {
            return (targetPlayer === 'ALL' || item.playerName === targetPlayer) &&
                (targetGame === 'ALL' || item.gameName === targetGame) &&
                (targetBanner === 'ALL' || item.bannerType === targetBanner);
        });

        let currentPullsCount = 0;
        let fiveStarCount = 0;
        let totalFiveStarCostPulls = 0;

        poolSequence.forEach(item => {
            currentPullsCount++;
            if (item.rarity === '5星') {
                item.computedPulls = currentPullsCount;
                totalFiveStarCostPulls += currentPullsCount;
                fiveStarCount++;
                currentPullsCount = 0;
            } else {
                item.computedPulls = null;
            }
        });

        currentFilteredData = poolSequence.filter(item => {
            return (targetRarity === 'ALL' || item.rarity === targetRarity);
        });

        currentFilteredData.reverse();

        if (isStrictPoolSelected) {
            statsBox.classList.remove('hidden');
            statsTotalPulls.innerText = `目前累積已墊: ${currentPullsCount} 抽 (未出五星)`;
            if (fiveStarCount > 0) {
                const avg = (totalFiveStarCostPulls / fiveStarCount).toFixed(1);
                statsAvgPulls.innerText = `平均五星產出: ${avg} 抽/隻 (共 ${fiveStarCount} 隻)`;
            } else {
                statsAvgPulls.innerText = `平均五星產出: 尚未出過貨`;
            }
            thPullsCount.className = (targetRarity === '5星') ? 'fw-bold text-warning' : 'hidden';
        } else {
            if (targetRarity === '5星') {
                statsBox.classList.remove('hidden');
                thPullsCount.classList.add('hidden');
                statsTotalPulls.innerText = "⚠️ 提示";
                statsAvgPulls.innerText = "請同時鎖定特定的「玩家、遊戲、卡池」才能精準計算墊抽數！";
            } else {
                statsBox.classList.add('hidden');
                thPullsCount.classList.add('hidden');
            }
        }

        currentPage = 1;
        renderHistoryTable();
    }

    function renderHistoryTable() {
        const totalRecords = currentFilteredData.length;
        const maxPage = Math.ceil(totalRecords / rowsPerPage) || 1;

        if (currentPage > maxPage) currentPage = maxPage;
        if (currentPage < 1) currentPage = 1;

        txtPageNum.innerText = currentPage;
        btnPrevPage.classList.toggle('disabled', currentPage === 1);
        btnNextPage.classList.toggle('disabled', currentPage === maxPage);

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
        const pageData = currentFilteredData.slice(startIndex, endIndex);

        historyTableBody.innerHTML = "";

        if (totalRecords === 0) {
            historyTableBody.innerHTML = `<tr><td colspan="7" class="text-muted py-4">沒有符合條件的紀錄喔！</td></tr>`;
            filterCount.innerText = "顯示第 0 到 0 筆 / 共 0 筆";
            return;
        }

        const targetPlayer = filterPlayer.value;
        const targetRarity = filterRarity.value;
        const isStrictPoolSelected = (targetPlayer !== 'ALL' && filterGame.value !== 'ALL' && filterBanner.value !== 'ALL');

        pageData.forEach(item => {
            const tr = document.createElement('tr');
            if (item.rarity === '5星') tr.className = 'table-rarity-5';
            else if (item.rarity === '4星') tr.className = 'table-rarity-4';

            let rowHtml = `
                <td class="small">${item.time}</td>
                <td>${item.playerName}</td>
                <td>${item.gameName}</td>
                <td>${item.bannerType}</td>
                <td><span class="badge ${item.rarity === '5星' ? 'bg-warning text-dark' : (item.rarity === '4星' ? 'bg-primary' : 'bg-secondary')}">${item.rarity}</span></td>
                <td>${item.itemName}</td>
            `;

            if (targetRarity === '5星' && isStrictPoolSelected) {
                rowHtml += `<td class="fw-bold text-danger">${item.computedPulls} 抽</td>`;
            }

            tr.innerHTML = rowHtml;
            historyTableBody.appendChild(tr);
        });

        filterCount.innerText = `顯示第 ${startIndex + 1} 到 ${endIndex} 筆 / 共 ${totalRecords} 筆`;
    }

    btnPrevPage.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentPage > 1) { currentPage--; renderHistoryTable(); }
    });

    btnNextPage.addEventListener('click', function (e) {
        e.preventDefault();
        const maxPage = Math.ceil(currentFilteredData.length / rowsPerPage) || 1;
        if (currentPage < maxPage) { currentPage++; renderHistoryTable(); }
    });

    filterPlayer.addEventListener('change', calculateAndFilterData);
    filterGame.addEventListener('change', calculateAndFilterData);
    filterBanner.addEventListener('change', calculateAndFilterData);
    filterRarity.addEventListener('change', calculateAndFilterData);
    refreshBtn.addEventListener('click', fetchHistory);

    fetchHistory();
});
