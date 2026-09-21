
const GAS_URL = "__GAS_URL_HOLDER__";
const SECRET_CODE = "__SECRET_CODE__";

// 驗證身分
(function () {
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
    "原神": {
        chars: ["班尼特", "行秋", "香菱", "菲謝爾", "雲堇", "久岐忍", "九條裟羅", "砂糖", "五郎", "凝光", "北斗", "托馬", "早柚", "煙緋", "羅莎莉亞", "芭芭拉", "諾艾爾", "辛焱", "迪奧娜", "重雲", "雷澤", "鹿野院平藏", "柯萊", "多莉", "坎蒂絲", "萊依拉", "琺露珊", "瑤瑤", "米卡", "卡維", "綺良良", "琳妮特", "菲米尼", "夏洛蒂", "夏沃蕾", "嘉明", "賽索斯", "卡齊娜", "歐洛倫", "藍硯", "伊安珊", "伊法", "塔利雅", "愛諾", "雅珂達", "葉洛亞", "布倫妮", "阿羅夏", "麗莎", "安柏", "凱亞"],
        weapons: ["匣裡龍吟", "祭禮劍", "笛劍", "西風劍", "雨裁", "祭禮大劍", "鐘劍", "西風大劍", "西風長槍", "匣裡滅辰", "昭心", "祭禮殘章", "流浪樂章", "西風祕典", "弓藏", "祭禮弓", "絕弦", "西風獵弓", "其他"]
    },

    "崩鐵": {
        chars: ["三月七", "丹恆", "阿蘭", "艾絲妲", "黑塔", "希露瓦", "娜塔莎", "佩拉", "桑博", "虎克", "青雀", "停雲", "素裳", "馭空", "盧卡", "玲可", "桂乃芬", "寒鴨", "雪衣", "米沙", "加拉赫", "貊澤"],
        weapons: ["一場術後對話(娜塔莎)", "晚安與睡顏(佩拉)", "餘生的第一天(三月七)", "唯有沉默(丹恆)", "記憶中的模樣", "鼴鼠黨歡迎你(虎克)", "我的誕生(黑塔)", "同一種心情(克拉拉)", "獵物的視線(桑博)", "朗道的選擇(姊弟)", "論劍(素裳)", "與行星相會(艾絲妲)", "秘密誓心(阿蘭)", "別讓世界靜下來(希露瓦)", "此時恰好(羅剎)", "決心如汗珠般閃耀(盧卡)", "宇宙市場趨勢(托帕)", "按個追蹤吧(桂乃芬)", "舞舞舞(好耶)", "在藍天下(姊妹)", "天才們的休憩", "一場術後對話(娜塔莎)", "銘記於心的約定(米沙)", "兩個人的演唱會", "無邊曼舞", "諧樂靜默之後(星期日)", "芳華待灼(劍三月七)", "黑夜如影隨行(貊澤)", "夢的蒙太奇(導演)", "天才們的問候", "故事的下一頁(小昔漣)", "放個小假(珍珠)"]
    },
    "絕區零": {
        chars: ["安比", "比利", "妮可", "可琳", "安東", "本", "蒼角", "露西", "派派", "賽斯", "波可娜", "潘引壺", "真斗"],
        weapons: ["街頭巨星", "時光切片", "雨林饕客", "星輝引擎", "人為刀俎", "貴重骨核", "正版變身器", "雙生泣星", "兔能環", "幻變魔方", "喵運當頭", "德瑪拉電池II型", "聚寶箱", "居家服務員", "仿製星輝引擎", "旋鑽機", "比格汽缸", "含羞惡面", "好鬥的阿炮", "維序者特化型", "轟鳴座駕", "裁紙刀", "震元奇樞", "燔火朧夜"]
    }
};

let currentMode = 'single'; // 'single' 或 'multi'

window.onload = function () {
    const gameSelect = document.getElementById('gameName');
    const tabSingle = document.getElementById('tabSingle');
    const tabMulti = document.getElementById('tabMulti');
    const singleModeSection = document.getElementById('singleModeSection');
    const multiModeSection = document.getElementById('multiModeSection');
    const singleRarity = document.getElementById('singleRarity');

    const singleItemInput = document.getElementById('singleItemInput');
    const multiRowsContainer = document.getElementById('multiRowsContainer');
    const single4StarRadioBox = document.getElementById('single4StarRadioBox');
    const radioChar = document.getElementById('radioChar');
    const radioWeapon = document.getElementById('radioWeapon');
    const singleItemSelectChar = document.getElementById('singleItemSelectChar');
    const singleItemSelectWeapon = document.getElementById('singleItemSelectWeapon');

    // --- 1. 頁籤切換邏輯 ---
    tabSingle.addEventListener('click', () => {
        currentMode = 'single';
        tabSingle.classList.add('active');
        tabMulti.classList.remove('active');
        singleModeSection.classList.remove('hidden');
        multiModeSection.classList.add('hidden');

        updateSingleOptions();
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

        // 預設先隱藏所有輸入區，後面依條件開啟
        single4StarRadioBox.classList.add('hidden');
        singleItemSelectChar.classList.add('hidden');
        singleItemSelectWeapon.classList.add('hidden');
        singleItemInput.classList.add('hidden');

        if (rarity === '4星') {
            // 亮出 角色/武器 二選一 Radio Box
            single4StarRadioBox.classList.remove('hidden');

            if (radioChar.checked) {
                // A-1. 選角色：動態刷新並亮出 4 星角色選單
                singleItemSelectChar.classList.remove('hidden');
                if (singleItemSelectChar.innerHTML === "" || singleItemSelectChar.dataset.game !== game) {
                    singleItemSelectChar.dataset.game = game; // 記錄當前渲染的遊戲
                    singleItemSelectChar.innerHTML = '<option value="" disabled selected>請選擇 4 星角色...</option>';
                    (gachaData[game]?.chars || []).forEach(item => {
                        let opt = document.createElement('option'); opt.value = item; opt.textContent = item;
                        singleItemSelectChar.appendChild(opt);
                    });
                }
            } else if (radioWeapon.checked) {
                // A-2. 選武器：動態刷新並亮出 4 星武器選單
                singleItemSelectWeapon.classList.remove('hidden');
                if (singleItemSelectWeapon.innerHTML === "" || singleItemSelectWeapon.dataset.game !== game) {
                    singleItemSelectWeapon.dataset.game = game; // 記錄當前渲染的遊戲
                    singleItemSelectWeapon.innerHTML = '<option value="" disabled selected>請選擇 4 星武器/光錐...</option>';
                    (gachaData[game]?.weapons || []).forEach(item => {
                        let opt = document.createElement('option'); opt.value = item; opt.textContent = item;
                        singleItemSelectWeapon.appendChild(opt);
                    });
                }

                // 特殊邏輯：如果 4 星武器選單選到了「其他」，要加亮自由輸入框
                if (singleItemSelectWeapon.value === "其他") {
                    singleItemInput.classList.remove('hidden');
                    singleItemInput.placeholder = `請手動輸入不在名單內之 4 星武器`;
                }
            }
        } else if (rarity === '5星') {
            // B. 5星：直接顯示手動輸入框
            singleItemInput.classList.remove('hidden');
            singleItemInput.placeholder = `請輸入 ${game} 的 5 星名稱...`;
            // singleItemInput.value = "";
        } else {
            // C. 3星：簡化，不顯示任何東西
            // singleItemInput.value = "";
        }
    }
    singleRarity.addEventListener('change', updateSingleOptions);
    radioChar.addEventListener('change', updateSingleOptions);
    radioWeapon.addEventListener('change', updateSingleOptions);
    singleItemSelectWeapon.addEventListener('change', updateSingleOptions); // 武器選單改變時也要重新判定是否顯示「其他」
    gameSelect.addEventListener('change', () => {
        singleItemSelectChar.innerHTML = "";
        singleItemSelectWeapon.innerHTML = "";
        updateSingleOptions();
    });

    // --- 3. 十連抽動態列渲染 ---
    function renderMultiRows() {
        multiRowsContainer.innerHTML = "";
        const game = gameSelect.value;

        for (let i = 1; i <= 10; i++) {
            const row = document.createElement('div');
            row.className = `multi-row rarity-3 p-3 mb-2`; // 稍微加大內距以容納新元件
            row.innerHTML = `
                <div class="row g-2 align-items-center">
                    <div class="col-2 text-secondary fw-bold">#${i}</div>
                    <div class="col-3">
                        <select class="form-select form-select-sm multi-rarity" data-index="${i}">
                            <option value="3星" selected>3星</option>
                            <option value="4星">4星</option>
                            <option value="5星">5星</option>
                        </select>
                    </div>
                    <!-- 核心動態展示區 -->
                    <div class="col-7" id="multiItemBox_${i}">
                        <span class="text-muted small">3星武器/光錐</span>
                    </div>
                </div>
                <!-- 預留給 4星武器選「其他」時跳出來的第2行輸入框 -->
                <div class="row mt-2 g-2 hidden" id="multiOtherInputBox_${i}">
                    <div class="col-2"></div>
                    <div class="col-10">
                        <input type="text" class="form-control form-control-sm multi-other-input" placeholder="請手動輸入 4 星武器名稱...">
                    </div>
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
                const otherInputBox = document.getElementById(`multiOtherInputBox_${idx}`);
                const parentRow = this.closest('.multi-row');

                // 動態切換背景色
                parentRow.className = `multi-row rarity-${val.replace('星', '')} p-3 mb-2`;
                otherInputBox.classList.add('hidden'); // 預設先隱藏其他輸入框

                if (val === '4星') {
                    // 塞入 角色/武器 二選一與空白選單
                    itemBox.innerHTML = `
                        <div class="d-flex gap-1">
                            <select class="form-select form-select-sm multi-4star-type" data-index="${idx}" style="width: 40%;">
                                <option value="char">角色</option>
                                <option value="weapon">武器</option>
                            </select>
                            <select class="form-select form-select-sm multi-item-val" id="multiSelectSub_${idx}" data-index="${idx}">
                                <!-- 由下方的動態函式塞入項目 -->
                            </select>
                        </div>
                    `;

                    // 綁定剛生成出來的「角色/武器」二選一拉選單的監聽事件
                    const subTypeSelect = itemBox.querySelector('.multi-4star-type');
                    subTypeSelect.addEventListener('change', function () {
                        updateMultiSubOptions(idx, this.value);
                    });

                    // 初始觸發一次，預設帶入 4 星角色清單
                    updateMultiSubOptions(idx, 'char');

                } else {
                    // 只要這一列不是 4 星（改選 3星 或 5星），就把隱藏輸入框的必填限制徹底關掉
                    otherInputBox.classList.add('hidden');
                    otherInputBox.querySelector('input').value = ""; // 順便清空文字

                    if (val === '5星') {
                        itemBox.innerHTML = `<input type="text" class="form-control form-control-sm multi-item-val" placeholder="手動輸入5星角色/武器">`;
                    } else {
                        itemBox.innerHTML = `<span class="text-muted small">3星武器/光錐</span>`;
                    }
                }
            });
        });
    }

    // 輔助工具：處理十連抽中，某一列 4 星切換角色或武器時的名單刷新
    function updateMultiSubOptions(idx, type) {
        const game = gameSelect.value;
        const subSelect = document.getElementById(`multiSelectSub_${idx}`);
        const otherInputBox = document.getElementById(`multiOtherInputBox_${idx}`);

        subSelect.innerHTML = "";
        otherInputBox.classList.add('hidden');

        if (type === 'char') {
            subSelect.innerHTML = '選角色...';
            (gachaData[game]?.chars || []).forEach(item => {
                let opt = document.createElement('option'); opt.value = item; opt.textContent = item;
                subSelect.appendChild(opt);
            });
        }
        else if (type === 'weapon') {
            subSelect.innerHTML = '選武器...';
            (gachaData[game]?.weapons || []).forEach(item => {
                let opt = document.createElement('option'); opt.value = item; opt.textContent = item;
                subSelect.appendChild(opt);
            });

            // 監聽此武器選單，如果選到「其他」要亮出最下方的輸入框
            subSelect.addEventListener('change', function () {
                if (this.value === '其他') {
                    otherInputBox.classList.remove('hidden');
                } else {
                    otherInputBox.classList.add('hidden');
                }
            });
        }
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
            let finalName = "3星武器/光錐";
            rarity = singleRarity.value;
            if (rarity === '4星') {
                if (radioChar.checked) {
                    if (!singleItemSelectChar.value) { alert("⚠️ 請選擇抽到的 4 星角色！"); return; }
                    finalName = singleItemSelectChar.value;
                } else if (radioWeapon.checked) {
                    if (!singleItemSelectWeapon.value) { alert("⚠️ 請選擇抽到的 4 星武器！"); return; }
                    
                    if (singleItemSelectWeapon.value === "其他") {
                        if (!singleItemInput.value.trim()) { alert("⚠️ 請手動輸入 4 星武器名稱！"); return; }
                        finalName = singleItemInput.value.trim();
                    } else {
                        finalName = singleItemSelectWeapon.value;
                    }
                }
            } else if (rarity === '5星') {
                if (!singleItemInput.value.trim()) { alert("⚠️ 請手動輸入 5 星名稱！"); return; }
                finalName = singleItemInput.value;
            }
            recordsToSend.push({ ...commonData, rarity: singleRarity.value, itemName: finalName });
        } else {// 十連抽模式：撈取 1~10 列的資料
            for (let i = 1; i <= 10; i++) {
                const raritySelect = document.querySelector(`.multi-rarity[data-index="${i}"]`);
                const valElement = document.getElementById(`multiItemBox_${i}`).querySelector('.multi-item-val');
                const otherInput = document.getElementById(`multiOtherInputBox_${i}`).querySelector('input');
                
                let name = "3星武器/光錐";
                if (valElement) {
                    // 🌟 核心變更：如果這一列是 4 星且子選單選到了「其他」，抓取下方第 2 行輸入框的值
                    if (raritySelect.value === '4星' && valElement.value === '其他') {
                        name = otherInput.value || "未知名 4 星武器";
                    } else {
                        name = valElement.value;
                    }
                }
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
            singleItemSelectChar.value = "";
            singleItemSelectWeapon.value = "";
            updateSingleOptions();
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
    // 初始執行一次
    updateSingleOptions();
};