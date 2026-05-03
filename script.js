console.log("--- Sorter Script Start ---");

// 変数の宣言
let songData = []; 
let lstMember = [];
let parent = [];
let equal = [];
let rec = [];
let cmp1, cmp2, head1, head2, nrec, numQuestion, finishFlag;

// 1. ページ読み込み完了時に実行
window.onload = function() {
    console.log("Window loaded. Starting loadSongs...");
    loadSongs();
};

// 2. 楽曲データの読み込み
async function loadSongs() {
    try {
        // キャッシュを避けるためにタイムスタンプを付与
        const response = await fetch('songs.json?' + new Date().getTime());
        if (!response.ok) throw new Error('songs.jsonが見つかりません');
        
        const data = await response.json();
        console.log("JSON読み込み完了:", data);

        // 配列であることを確認して、中身があれば開始
        if (data && Array.isArray(data) && data.length > 0) {
            songData = data;
            // 確実にデータが入った「後」で初期化を呼ぶ
            initSort(); 
        } else {
            throw new Error('データが空、または形式が正しくありません');
        }
    } catch (error) {
        console.error("エラー詳細:", error);
        document.getElementById("counter").innerText = "エラー発生";
        document.getElementById("left-btn").innerText = "ファイル確認失敗";
        document.getElementById("right-btn").innerText = error.message;
    }
}

// 3. ソートの初期化
function initSort() {
    // 読み込んだ songData をリストにコピー
    lstMember = songData.slice(); 
    console.log("ソート対象件数:", lstMember.length);

    parent = [];
    equal = [];
    rec = [];
    numQuestion = 1;
    finishFlag = 0;

    // 初期化ループ（ここが重要：lstMember.length に基づいて計算）
    for (let i = 0; i <= lstMember.length * 2; i++) {
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

    // 準備ができたら画面を表示
    showUI();
}

// 4. UIの表示更新
function showUI() {
    document.getElementById("counter").innerText = "質問 " + numQuestion;

    // インデックスを取得
    const idx1 = parent[head1][cmp1];
    const idx2 = parent[head2][cmp2];

    // 曲名を取得（もし取得できなければ「不明」と表示）
    const name1 = lstMember[idx1] !== undefined ? lstMember[idx1] : "不明(" + idx1 + ")";
    const name2 = lstMember[idx2] !== undefined ? lstMember[idx2] : "不明(" + idx2 + ")";

    document.getElementById("left-btn").innerText = name1;
    document.getElementById("right-btn").innerText = name2;
    
    // 進捗（概算）
    let totalQuestions = lstMember.length * Math.log2(lstMember.length || 1);
    let progress = Math.min(Math.floor((numQuestion / totalQuestions) * 100), 99);
    document.getElementById("progress").style.width = progress + "%";
}

// 5. ボタンクリック時の処理
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

// 6. 結果の表示
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