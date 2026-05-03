let songData = []; 
let parent = [];
let rec = [];
let cmp1, cmp2, head1, head2;
let numQuestion = 1;
let finishFlag = 0;

window.onload = function() {
    loadSongs();
};

async function loadSongs() {
    try {
        console.log("Fetching songs.json...");
        const response = await fetch('./songs.json?' + new Date().getTime());
        if (!response.ok) throw new Error('読み込み失敗');
        const data = await response.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
            songData = data;
            console.log("Data loaded:", songData.length, "songs");
            initSort(); 
        } else {
            console.error("Data format error:", data);
        }
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById("counter").innerText = "エラー: " + error.message;
    }
}

function initSort() {
    parent = [];
    let list = [];
    for (let i = 0; i < songData.length; i++) {
        list.push([i]);
    }
    parent = list;
    numQuestion = 1;
    finishFlag = 0;
    
    // 最初の比較準備
    prepareNextMerge();
}

function prepareNextMerge() {
    if (parent.length <= 1) {
        finishFlag = 1;
        showResult();
        return;
    }
    head1 = 0;
    head2 = 1;
    cmp1 = 0;
    cmp2 = 0;
    rec = [];
    showUI();
}

function showUI() {
    // データがまだ届いていない場合のセーフティ
    if (songData.length === 0) {
        console.log("Waiting for data...");
        setTimeout(showUI, 100);
        return;
    }

    if (finishFlag) return;

    document.getElementById("counter").innerText = "質問 " + numQuestion;

    // 現在のインデックスを取得
    const idx1 = parent[head1][cmp1];
    const idx2 = parent[head2][cmp2];

    // ボタンに曲名を表示（ここで確実にsongDataを参照する）
    if (songData[idx1] !== undefined && songData[idx2] !== undefined) {
        document.getElementById("left-btn").innerText = songData[idx1];
        document.getElementById("right-btn").innerText = songData[idx2];
    } else {
        document.getElementById("left-btn").innerText = "データ取得エラー(" + idx1 + ")";
        document.getElementById("right-btn").innerText = "データ取得エラー(" + idx2 + ")";
    }
    
    let progress = Math.min(Math.floor((numQuestion / (songData.length * 7)) * 100), 99);
    document.getElementById("progress").style.width = progress + "%";
}

function sortClick(result) {
    if (finishFlag) return;
    
    // 選択結果を保存
    if (result === -1) { 
        rec.push(parent[head1][cmp1++]); 
    } else if (result === 1) { 
        rec.push(parent[head2][cmp2++]); 
    } else { 
        rec.push(parent[head1][cmp1++]);
        rec.push(parent[head2][cmp2++]);
    }

    // 片方の束を使い切ったか
    if (cmp1 < parent[head1].length && cmp2 < parent[head2].length) {
        numQuestion++;
    } else {
        while (cmp1 < parent[head1].length) rec.push(parent[head1][cmp1++]);
        while (cmp2 < parent[head2].length) rec.push(parent[head2][cmp2++]);
        
        parent.push(rec); // 合体した束を末尾へ
        parent.splice(0, 2); // 使った2束を削除
        
        if (parent.length > 1) {
            numQuestion++;
            cmp1 = 0;
            cmp2 = 0;
            rec = [];
        }
    }

    if (parent.length <= 1) {
        finishFlag = 1;
        showResult();
    } else {
        showUI();
    }
}

function showResult() {
    document.getElementById("sorter-ui").style.display = "none";
    const resultList = document.getElementById("result-list");
    const rankingDiv = document.getElementById("ranking");
    resultList.style.display = "block";
    let html = "<ul>";
    let finalOrder = parent[0];
    for (let i = 0; i < finalOrder.length; i++) {
        html += `<li><span class="rank">${i + 1}位</span> ${songData[finalOrder[i]]}</li>`;
    }
    html += "</ul>";
    rankingDiv.innerHTML = html;
}