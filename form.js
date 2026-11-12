import { gachaData, standard5Stars } from './wishData.js';
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
    const singleItemSelect5Char = document.getElementById('singleItemSelect5Char');

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
        singleItemSelect5Char.classList.add('hidden')

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
            // B. 5星：顯示角色選單
            singleItemSelect5Char.classList.remove('hidden');
            if(singleItemSelect5Char.innerHTML === "" || singleItemSelect5Char.dataset.game !== game){
                singleItemSelect5Char.dataset.game = game;
                singleItemSelect5Char.innerHTML = '<option value="" disabled selected>請選擇 5 星角色...</option>';
                (standard5Stars[game] || []).forEach(item => {
                    let opt = document.createElement('option'); opt.value = item; opt.textContent = item;
                    singleItemSelect5Char.appendChild(opt);
                });
            }
            if (singleItemSelect5Char.value === "其他") {
                singleItemInput.classList.remove('hidden');
                singleItemInput.placeholder = `請輸入 ${game} 的 5 星名稱...`;
            }
            // singleItemInput.classList.remove('hidden');
            // singleItemInput.placeholder = `請輸入 ${game} 的 5 星名稱...`;
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
    singleItemSelect5Char.addEventListener('change', updateSingleOptions);
    gameSelect.addEventListener('change', () => {
        singleItemSelectChar.innerHTML = "";
        singleItemSelectWeapon.innerHTML = "";
        singleItemSelect5Char.innerHTML = "";
        updateSingleOptions();
    });

    // --- 3. 十連抽動態列渲染 ---
    function renderMultiRows() {
        multiRowsContainer.innerHTML = "";

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
                        <input type="text" class="form-control form-control-sm multi-other-input" placeholder="請手動輸入角色/武器名稱...">
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

                } else if(val === '5星'){ //從這裡開始改!!!!!(戰術性躺平)
                    // 1. 先取得對應遊戲的角色陣列，並直接轉換成一長串 <option> HTML 字串
                    const game = gameSelect.value;
                    const optionsHtml = (standard5Stars[game] || [])
                        .map(char => `<option value="${char}">${char}</option>`)
                        .join('');

                    // 2. 直接將轉換好的字串變數塞進你的 template literal 裡
                    itemBox.innerHTML = `
                        <div class="d-flex gap-1">
                            <select class="form-select form-select-sm multi-item-val" id="multiSelectSub_${idx}" data-index="${idx}">
                                <option value="" disabled selected>請選擇角色...</option>
                                ${optionsHtml}
                            </select>
                        </div>
                    `;
                    // 3. 抓取剛剛生出來的這個選單
                    const selectEl = document.getElementById(`multiSelectSub_${idx}`);

                    // 4. 監聽選單變化：只要選到 "其他"，就顯示輸入框
                    selectEl.addEventListener('change', function() {
                        if (this.value === '其他') {
                            otherInputBox.classList.remove('hidden');
                        } else {
                            otherInputBox.classList.add('hidden');
                            otherInputBox.classList.add('hidden');
                            otherInputBox.querySelector('input').value = ""; // 順便清空文字
                        }
                    });
                } else{ // 3星
                    // 只要這一列是 3星，就把隱藏輸入框的必填限制徹底關掉
                    otherInputBox.classList.add('hidden');
                    otherInputBox.querySelector('input').value = ""; // 順便清空文字
                    itemBox.innerHTML = `<span class="text-muted small">3星武器/光錐</span>`;
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
            const rarity = singleRarity.value;
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
                if (!singleItemSelect5Char.value.trim()) { alert("⚠️ 請手動輸入 5 星名稱！"); return; }
                if(singleItemSelect5Char.value === "其他"){
                    if (!singleItemInput.value.trim()) { alert("⚠️ 請手動輸入 5 星名稱！other"); return; }
                    finalName = singleItemInput.value;
                } else{
                    finalName = singleItemSelect5Char.value;
                }
                
            }
            recordsToSend.push({ ...commonData, rarity: singleRarity.value, itemName: finalName });
        } else {// 十連抽模式：撈取 1~10 列的資料
            for (let i = 1; i <= 10; i++) {
                const raritySelect = document.querySelector(`.multi-rarity[data-index="${i}"]`);
                const valElement = document.getElementById(`multiItemBox_${i}`).querySelector('.multi-item-val');
                const otherInput = document.getElementById(`multiOtherInputBox_${i}`).querySelector('input');
                
                let name = "3星武器/光錐";
                if (valElement) {
                    // 子選單選到了「其他」，抓取下方第 2 行輸入框的值
                    if (valElement.value === '其他') {
                        name = otherInput.value || "未知名物品";
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
            singleItemSelect5Char.value = "";
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