let songData = []; 
let lstMember = [];
let parent = [];
let equal = [];
let rec = [];
let cmp1, cmp2, head1, head2, nrec, numQuestion, finishFlag;

async function loadSongs() {
    try {
        const response = await fetch('songs.json?' + new Date().getTime());
        if (!response.ok) throw new Error('songs.jsonが見つかりません');
        
        const data = await response.json();
        
        // 【重要】ここで中身をチェック
        if (data && Array.isArray(data) && data.length > 0) {
            songData = data;
            console.log("データ読み込み完了:", songData.length, "件");
            
            // データが確実に入った後に、ソートの初期化を呼ぶ
            initSort(); 
        } else {
            throw new Error('データが空か、正しく読み込めませんでした');
        }
    } catch (error) {
        console.error("エラー詳細:", error);
        document.getElementById("counter").innerText = "エラー発生";
        document.getElementById("left-btn").innerText = "ファイル確認失敗";
        document.getElementById("right-btn").innerText = error.message;
    }
}

function initSort() {
    // songDataが正しくコピーされているか確認
    lstMember = [...songData]; 
    
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

function showUI() {
    document.getElementById("counter").innerText = "質問 " + numQuestion;

    // インデックス番号（0, 1, 2...）を取得
    const idx1 = parent[head1][cmp1];
    const idx2 = parent[head2][cmp2];

    // 名前を取り出す。もし空なら「No.番号」を出すように強制変更
    const name1 = lstMember[idx1] || `曲名不明(Index:${idx1})`;
    const name2 = lstMember[idx2] || `曲名不明(Index:${idx2})`;

    document.getElementById("left-btn").innerText = name1;
    document.getElementById("right-btn").innerText = name2;
    
    let progress = Math.min(Math.floor((numQuestion / (lstMember.length * 11)) * 100), 99);
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
        const name = lstMember[finalOrder[i]] || "不明";
        html += `<li><span class="rank">${i + 1}位</span> ${name}</li>`;
    }
    html += "</ul>";
    rankingDiv.innerHTML = html;
}

window.onload = function() {
    loadSongs();
};