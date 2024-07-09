// メンバーの定義
const members = ['俺', 'B', 'C'];

// 初期のスケジュールデータ
const dates = getWeekDates();

// 週の日付を取得する関数
function getWeekDates() {
    const dates = [];
    const today = new Date();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayName = dayNames[date.getDay()];
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} (${dayName})`;
        dates.push(formattedDate);
    }
    return dates;
}

// スケジュールを作成する関数
function createSchedule() {
    const container = document.getElementById('schedule');
    const table = document.createElement('table');
    table.className = 'schedule-table';

    // ヘッダー行の作成
    const headerRow = document.createElement('tr');
    const emptyHeaderCell = document.createElement('th');
    headerRow.appendChild(emptyHeaderCell);

    // メンバーごとの列を作成
    members.forEach(member => {
        const headerCell = document.createElement('th');
        headerCell.textContent = member;
        headerRow.appendChild(headerCell);
    });

    // 活動列のヘッダーを追加
    const activityHeaderCell = document.createElement('th');
    activityHeaderCell.textContent = '活動';
    headerRow.appendChild(activityHeaderCell);

    table.appendChild(headerRow);

    // 各日付ごとの行を作成
    dates.forEach(date => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        dateCell.textContent = date;
        row.appendChild(dateCell);

        // 各メンバーごとのセレクトボックスを作成
        members.forEach(member => {
            const inputCell = document.createElement('td');
            inputCell.innerHTML = `
                <select name="${date}-${member}" class="schedule-select">
                    <option value="">未入力</option>
                    <option value="◎">◎</option>
                    <option value="〇">〇</option>
                    <option value="△">△</option>
                    <option value="×">×</option>
                </select>
            `;
            row.appendChild(inputCell);
        });

        // 活動セルを作成
        const activityCell = document.createElement('td');
        activityCell.className = 'activity-cell';
        activityCell.setAttribute('data-date', date);
        row.appendChild(activityCell);

        table.appendChild(row);
    });

    container.appendChild(table);
}

// スケジュールを送信する関数
async function submitSchedule() {
    const schedule = dates.map(date => {
        const entry = { date };
        members.forEach(member => {
            const select = document.querySelector(`select[name="${date}-${member}"]`);
            entry[member] = select ? select.value : '未入力';
        });
        return entry;
    });

    // ローカルストレージから保存されているデータを取得
    let savedSchedule = JSON.parse(localStorage.getItem('schedule')) || [];

    // 新しいスケジュールを既存のデータに追加
    savedSchedule = savedSchedule.concat(schedule);

    // ローカルストレージに保存
    localStorage.setItem('schedule', JSON.stringify(savedSchedule));

    alert('スケジュールが保存されました！');
    fetchResults();
}

// 結果を取得する関数
function fetchResults() {
    const savedSchedule = JSON.parse(localStorage.getItem('schedule'));
    if (savedSchedule) {
        savedSchedule.forEach(result => {
            const date = result.date;
            let allValues = [];
            let hasEmpty = false;

            members.forEach(member => {
                const select = document.querySelector(`select[name="${date}-${member}"]`);
                if (select) {
                    select.value = result[member];
                    allValues.push(result[member]);
                    if (result[member] === '未入力' || result[member] === '') {
                        hasEmpty = true;
                    }
                }
            });

            const activityCell = document.querySelector(`td.activity-cell[data-date="${date}"]`);
            if (activityCell) {
                const minValue = calculateMinValue(allValues);
                activityCell.textContent = hasEmpty ? `${minValue} (未入力の人がいます)` : minValue;
            }
        });
    }
}

// 優先度を計算する関数
function calculateMinValue(values) {
    const priority = { '◎': 1, '〇': 2, '△': 3, '×': 4, '': 5, '未入力': 5 };
    values.sort((a, b) => priority[a] - priority[b]);
    return values[0];
}

// ページロード時の処理
window.onload = function() {
    const savedSchedule = JSON.parse(localStorage.getItem('schedule')) || [];

    if (savedSchedule.length > 0) {
        createSchedule();
        fetchResults();
    } else {
        createSchedule();
    }
};
