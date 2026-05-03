/**
 * 楽曲データの読み込みとソート実行
 */

let songData = []; // ここにJSONから読み込んだ曲名が入る
let lstMember = [];
let parent = [];
let equal = [];
let rec = [];
let cmp1, cmp2, head1, head2, nrec, numQuestion, finishFlag;

// 1. JSONファイルを読み込む関数
async function loadSongs() {
    try {
        // GitHub上の同じフォルダにある songs.json を取得
        const response = await fetch('songs.json');
        if (!response.ok) throw new Error('Network response was not ok');
        
        songData = await response.json();
        
        // データが読み込めたらソートを初期化
        initSort();
    } catch (error) {
        console.error("データの読み込みエラー:", error);
        document.getElementById("left-btn").innerText = "読み込み失敗";
    }
}

// 2. ソートの初期設定
function initSort() {
    if (songData.length === 0) return;
    
    lstMember = songData.slice();
    parent = [];
    equal = [];
    rec = [];
    numQuestion = 1;
    finishFlag = 0;

    for (let i = 0; i <= lstMember.length; i++) {
        parent[i] = 0;
        equal[i] = -1;
    }

    let n = 0;
    let list = [[]];
    for (let i = 0; i < lstMember.length; i++) {
        list[0][i] = i;
    }

    parent[n] = list[0];
    n++;
    for (let i = 0; i < list.length; i++) {
        if (list[i].length > 1) {
            let mid = Math.ceil(list[i].length / 2);
            list[n] = list[i].slice(0, mid);
            parent[n] = i;
            n++;
            list[n] = list[i].slice(mid);
            parent[n] = i;
            n++;
        }
    }

    head1 = list.length - 2;
    head2 = list.length - 1;
    cmp1 = 0;
    cmp2 = 0;
    nrec = 0;

    showUI();
}

// 3. UIの更新
function showUI() {
    document.getElementById("counter").innerText = "質問 " + numQuestion;
    document.getElementById("left-btn").innerText = lstMember[parent[head1][cmp1]];
    document.getElementById("right-btn").innerText = lstMember[parent[head2][cmp2]];
    
    // 進捗バー（1,900項目の場合、概算で最大20,000回程度として計算）
    // 厳密な進捗は難しいので、ここでは質問数ベースで表示
    let progress = Math.min(Math.floor((numQuestion / (lstMember.length * 11)) * 100), 99);
    document.getElementById("progress").style.width = progress + "%";
}

// 4. 選択ボタンが押された時の処理
function sortClick(result) {
    if (finishFlag) return;

    if (result === -1) { 
        rec[nrec++] = parent[head1][cmp1++];
    } else if (result === 1) { 
        rec[nrec++] = parent[head2][cmp2++];
    } else { 
        rec[nrec++] = parent[head1][cmp1];
        equal[parent[head1][cmp1]] = parent[head2][cmp2];
        rec[nrec++] = parent[head2][cmp2++];
        cmp1++;
    }

    if (cmp1 < parent[head1].length && cmp2 < parent[head2].length) {
        numQuestion++;
    } else {
        while (cmp1 < parent[head1].length) rec[nrec++] = parent[head1][cmp1++];
        while (cmp2 < parent[head2].length) rec[nrec++] = parent[head2][cmp2++];

        parent[parent[head1]] = rec;
        nrec = 0;
        rec = [];
        cmp1 = 0;
        cmp2 = 0;
        head1 -= 2;
        head2 -= 2;

        if (head1 < 0) {
            finishFlag = 1;
            showResult();
            return;
        }
        numQuestion++;
    }
    showUI();
}

// 5. 結果表示
function showResult() {
    document.getElementById("sorter-ui").style.display = "none";
    document.getElementById("progress-container").style.display = "none";
    
    const resultList = document.getElementById("result-list");
    const rankingDiv = document.getElementById("ranking");
    resultList.style.display = "block";

    let html = "<ul>";
    let finalOrder = parent[0];
    for (let i = 0; i < finalOrder.length; i++) {
        html += `<li><span class="rank">${i + 1}位</span> ${lstMember[finalOrder[i]]}</li>`;
    }
    html += "</ul>";
    rankingDiv.innerHTML = html;
}

// 起動時に実行
window.onload = loadSongs;