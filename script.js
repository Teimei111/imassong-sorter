let songData = []; 
let lstMember = [];
let parent = [];
let equal = [];
let rec = [];
let cmp1, cmp2, head1, head2, nrec, numQuestion, finishFlag;

window.onload = function() {
    loadSongs();
};

async function loadSongs() {
    try {
        const response = await fetch('./songs.json?' + new Date().getTime());
        if (!response.ok) throw new Error('songs.jsonが見つかりません');
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
            songData = data;
            initSort(); 
        }
    } catch (error) {
        document.getElementById("counter").innerText = "エラー: " + error.message;
    }
}

function initSort() {
    lstMember = songData.slice();
    parent = [];
    equal = [];
    rec = [];
    numQuestion = 1;
    finishFlag = 0;

    // ソートの階層構造を作成
    let n = 0;
    let list = [[]];
    for (let i = 0; i < lstMember.length; i++) {
        list[0][i] = i;
    }

    parent[n] = list[0];
    n++;
    let mid;
    for (let i = 0; i < list.length; i++) {
        if (list[i].length > 1) {
            mid = Math.ceil(list[i].length / 2);
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

function showUI() {
    document.getElementById("counter").innerText = "質問 " + numQuestion;

    // 現在の比較対象となるインデックスを安全に取得
    const idx1 = (parent[head1] && parent[head1][cmp1] !== undefined) ? parent[head1][cmp1] : null;
    const idx2 = (parent[head2] && parent[head2][cmp2] !== undefined) ? parent[head2][cmp2] : null;

    // 画面に表示
    if (idx1 !== null && idx2 !== null) {
        document.getElementById("left-btn").innerText = songData[idx1];
        document.getElementById("right-btn").innerText = songData[idx2];
    } else {
        // 万が一取得できなかった場合のセーフティ
        document.getElementById("left-btn").innerText = "読み込み中...";
        document.getElementById("right-btn").innerText = "読み込み中...";
    }
    
    let progress = Math.min(Math.floor((numQuestion / (songData.length * 7)) * 100), 99);
    document.getElementById("progress").style.width = progress + "%";
}

function sortClick(result) {
    if (finishFlag) return;

    if (result === -1) { rec[nrec++] = parent[head1][cmp1++]; }
    else if (result === 1) { rec[nrec++] = parent[head2][cmp2++]; }
    else { 
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
        nrec = 0; rec = []; cmp1 = 0; cmp2 = 0;
        head1 -= 2; head2 -= 2;
        if (head1 < 0) { finishFlag = 1; showResult(); return; }
        numQuestion++;
    }
    showUI();
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