
const GAS_URL = "__GAS_URL_HOLDER__";
const SECRET_CODE = "__SECRET_CODE__"; 

// 驗證身分
(function() {
    let sessionAuth = sessionStorage.getItem("gacha_auth");
    
    while (sessionAuth !== SECRET_CODE) {
        let userInput = prompt("請輸入密碼以驗證身分：");
        
        // 如果使用者點擊取消或關閉視窗， userInput 會是 null，直接強迫網頁空白並中斷執行
        if (userInput === null) {
            document.body.innerHTML = `<div class="container text-center" style="margin-top:100px;"><h3 class="text-danger">拒絕存取：您必須輸入密碼才能使用此系統。</h3></div>`;
            throw new Error("驗證被取消"); 
        }
        
        if (userInput === SECRET_CODE) {
            // 驗證成功，將權限記在當前分頁的記憶體中（關閉分頁才會消失）
            sessionStorage.setItem("gacha_auth", userInput);
            break;
        } else {
            alert("密碼錯誤！請重新輸入。");
        }
    }
})();

// 在這裡定義每款遊戲的 4 星選單內容（您可以自由增減）
const gachaData = {
    "原神": [
        "班尼特", "行秋", "香菱", "菲謝爾", "雲堇", "久岐忍", "九條裟羅", "砂糖", "五郎", "凝光", "北斗", "托馬", "早柚", "煙緋", "羅莎莉亞", "芭芭拉", "諾艾爾", "辛焱", "迪奧娜", "重雲", "雷澤", "鹿野院平藏", "柯萊", "多莉", "坎蒂絲", "萊依拉", "琺露珊", "瑤瑤", "米卡", "卡維", "綺良良", "琳妮特", "菲米尼", "夏洛蒂", "夏沃蕾", "嘉明", "賽索斯", "卡齊娜", "歐洛倫", "藍硯", "伊安珊", "伊法", "塔利雅", "愛諾", "雅珂達", "葉洛亞", "布倫妮", "阿羅夏", "麗莎", "安柏", "凱亞", "匣裡龍吟", "祭禮劍", "笛劍", "西風劍", "雨裁", "祭禮大劍", "鐘劍", "西風大劍", "西風長槍", "匣裡滅辰", "昭心", "祭禮殘章", "流浪樂章", "西風祕典", "弓藏", "祭禮弓", "絕弦", "西風獵弓"
    ],
    "崩鐵": [
        "三月七", "丹恆","阿蘭","艾絲妲","黑塔","希露瓦","娜塔莎", "佩拉","桑博","虎克", "青雀","停雲","素裳","馭空","盧卡", "玲可","桂乃芬","寒鴨","雪衣","米沙", "加拉赫","貊澤", "一場術後對話(娜塔莎)", "晚安與睡顏(佩拉)", "餘生的第一天(三月七)", "唯有沉默(丹恆)", "記憶中的模樣", "鼴鼠黨歡迎你(虎克)", "我的誕生(黑塔)", "同一種心情(克拉拉)", "獵物的視線(桑博)", "朗道的選擇(姊弟)", "論劍(素裳)", "與行星相會(艾絲妲)", "秘密誓心(阿蘭)", "別讓世界靜下來(希露瓦)", "此時恰好(羅剎)", "決心如汗珠般閃耀(盧卡)", "宇宙市場趨勢(托帕)", "按個追蹤吧(桂乃芬)", "舞舞舞(好耶)", "在藍天下(姊妹)", "天才們的休憩", "一場術後對話(娜塔莎)", "銘記於心的約定(米沙)", "兩個人的演唱會", "無邊曼舞", "諧樂靜默之後(星期日)", "芳華待灼(劍三月七)", "黑夜如影隨行(貊澤)", "夢的蒙太奇(導演)", "天才們的問候", "故事的下一頁(小昔漣)", "放個小假(珍珠)"
    ],
    "絕區零": [
        "安比","比利","妮可", "可琳","安東", "本", "蒼角", "露西", "派派", "賽斯","波可娜","潘引壺","真斗","街頭巨星","時光切片","雨林饕客","星輝引擎","人為刀俎","貴重骨核","正版變身器","雙生泣星","兔能環","幻變魔方","喵運當頭","德瑪拉電池II型","聚寶箱","居家服務員","仿製星輝引擎","旋鑽機","比格汽缸","含羞惡面","好鬥的阿炮","維序者特化型","轟鳴座駕","裁紙刀","震元奇樞","燔火朧夜"
    ]
};

let currentMode = 'single'; // 'single' 或 'multi'

window.onload = function () {
    const gameSelect = document.getElementById('gameName');
    const tabSingle = document.getElementById('tabSingle');
    const tabMulti = document.getElementById('tabMulti');
    const singleModeSection = document.getElementById('singleModeSection');
    const multiModeSection = document.getElementById('multiModeSection');
    const singleRarity = document.getElementById('singleRarity');
    const singleItemSelect = document.getElementById('singleItemSelect');
    const singleItemInput = document.getElementById('singleItemInput');
    const multiRowsContainer = document.getElementById('multiRowsContainer');

    // --- 1. 頁籤切換邏輯 ---
    tabSingle.addEventListener('click', () => {
        currentMode = 'single';
        tabSingle.classList.add('active');
        tabMulti.classList.remove('active');
        singleModeSection.classList.remove('hidden');
        multiModeSection.classList.add('hidden');
    });

    tabMulti.addEventListener('click', () => {
        currentMode = 'multi';
        tabMulti.classList.add('active');
        tabSingle.classList.remove('active');
        multiModeSection.classList.remove('hidden');
        singleModeSection.classList.add('hidden');
        renderMultiRows(); // 切換到十連抽時，動態渲染
    });

    // --- 2. 單抽連動邏輯 ---
    function updateSingleOptions() {
        const game = gameSelect.value;
        const rarity = singleRarity.value;

        if (rarity === '4星') {
            singleItemSelect.classList.remove('hidden');
            singleItemInput.classList.add('hidden');
            singleItemSelect.innerHTML = '<option value="" disabled selected>請選擇 4 星...</option>';
            (gachaData[game] || []).forEach(item => {
                let opt = document.createElement('option'); opt.value = item; opt.textContent = item;
                singleItemSelect.appendChild(opt);
            });
        } else if (rarity === '5星') {
            singleItemSelect.classList.add('hidden');
            singleItemInput.classList.remove('hidden');
            singleItemInput.placeholder = `請輸入 ${game} 的 5 星名稱...`;
        } else {
            // 3星簡化：直接隱藏輸入與選單，預設值帶入固定字串
            singleItemSelect.classList.add('hidden');
            singleItemInput.classList.add('hidden');
        }
    }
    singleRarity.addEventListener('change', updateSingleOptions);
    gameSelect.addEventListener('change', () => {
        updateSingleOptions();
        if (currentMode === 'multi') renderMultiRows(); // 如果在十抽模式，換遊戲也一起重刷
    });

    // --- 3. 十連抽動態列渲染 ---
    function renderMultiRows() {
        multiRowsContainer.innerHTML = "";
        const game = gameSelect.value;

        for (let i = 1; i <= 10; i++) {
            const row = document.createElement('div');
            row.className = `multi-row rarity-3 row g-2 align-items-center`;
            row.innerHTML = `
                    <div class="col-2 text-secondary fw-bold">#${i}</div>
                    <div class="col-4">
                        <select class="form-select form-select-sm multi-rarity" data-index="${i}">
                            <option value="3星" selected>3星</option>
                            <option value="4星">4星</option>
                            <option value="5星">5星</option>
                        </select>
                    </div>
                    <div class="col-6" id="multiItemBox_${i}">
                        <span class="text-muted small">3星武器/光錐</span>
                    </div>
                `;
            multiRowsContainer.appendChild(row);
        }

        // 為 10 個星等下拉選單綁定連動事件
        document.querySelectorAll('.multi-rarity').forEach(select => {
            select.addEventListener('change', function () {
                const idx = this.dataset.index;
                const val = this.value;
                const itemBox = document.getElementById(`multiItemBox_${idx}`);
                const parentRow = this.closest('.multi-row');

                // 改變外觀顏色方便視覺辨識
                parentRow.className = `multi-row rarity-${val.replace('星', '')} row g-2 align-items-center`;

                if (val === '4星') {
                    let selectHtml = `<select class="form-select form-select-sm multi-item-val" required><option value="" disabled selected>選4星...</option>`;
                    (gachaData[game] || []).forEach(item => { selectHtml += `<option value="${item}">${item}</option>`; });
                    selectHtml += `</select>`;
                    itemBox.innerHTML = selectHtml;
                } else if (val === '5星') {
                    itemBox.innerHTML = `<input type="text" class="form-control form-control-sm multi-item-val" placeholder="手動輸入5星" required>`;
                } else {
                    itemBox.innerHTML = `<span class="text-muted small">3星武器/光錐</span>`;
                }
            });
        });
    }

    // 初始初始化
    updateSingleOptions();

    // --- 4. 表單打包送出 ---
    document.getElementById('gachaForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        const statusMessage = document.getElementById('statusMessage');
        submitBtn.disabled = true; submitBtn.innerText = "正在批次寫入資料庫...";
        statusMessage.innerText = "";
        const commonData = {
            playerName: document.getElementById('playerName').value,
            gameName: gameSelect.value,
            bannerType: document.getElementById('bannerType').value
        };

        // 準備一個陣列存放這次要送出的所有抽卡紀錄
        let recordsToSend = [];
        if (currentMode === 'single') {
            let name = "";
            if (singleRarity.value === '4星')
                name = singleItemSelect.value;
            else if (singleRarity.value === '5星')
                name = singleItemInput.value;
            else name = "3星武器/光錐";
            recordsToSend.push({ ...commonData, rarity: singleRarity.value, itemName: name });
        } else {// 十連抽模式：撈取 1~10 列的資料
            for (let i = 1; i <= 10; i++) {
                const raritySelect = document.querySelector(`.multi-rarity[data-index="${i}"]`);
                const valElement = document.getElementById(`multiItemBox_${i}`).querySelector('.multi-item-val');
                let name = "3星武器/光錐";
                if (valElement) name = valElement.value;
                recordsToSend.push({ ...commonData, rarity: raritySelect.value, itemName: name });
            }
        }

        // 重要改動：我們一次把「整組陣列」用 POST 傳給 Google GAS 後端
        fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isBatch: true, data: recordsToSend })
        }).then(() => {
            statusMessage.className = "mt-3 text-center fw-bold text-success";
            statusMessage.innerText = `🎉 成功新增 ${recordsToSend.length} 筆抽卡紀錄至試算表！`;
            // 成功後重設輸入
            singleItemInput.value = "";
            if (currentMode === 'multi')
                renderMultiRows();
        }).catch(error => {
            statusMessage.className = "mt-3 text-center fw-bold text-danger";
            statusMessage.innerText = "❌ 傳送失敗，請檢查網路或 GAS 設定。";
            console.error(error);
        }).finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerText = "送出紀錄";
        });
    });
};