import { DUMMY_DATA } from './dummyData.js';

const startInput = document.getElementById('startData');
const endInput = document.getElementById('endData');
const itemSelect = document.getElementById('item_select');
const machineSelect = document.getElementById('machine_select');

let chartBInstance;
const filters = {
    startDate: startInput.value,
    endDate: endInput.value,
    item: itemSelect.value,
    machine: machineSelect.value
};

function applyFilters() {
    const [sy, sm, sd] = filters.startDate.split('-').map(Number);
    const [ey, em, ed] = filters.endDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    const dateFiltered = DUMMY_DATA.filter(item => {
      const dateStr = String(item["생산일자"]); 
      const [iy, im, id] = dateStr
        .match(/(\d{4})(\d{2})(\d{2})/)
        .slice(1)
        .map(Number);
      const itemDate = new Date(iy, im - 1, id);
      return itemDate >= start && itemDate <= end;
    });

    return dateFiltered.filter(item => {
        const itemMatch = (filters.item === 'all' || item["품목명"] === filters.item);
        const machineMatch = (filters.machine === 'all' || item["작업설비"] === filters.machine);
        return itemMatch && machineMatch;
    });
}

function aggregateDefects(data) {
    const defectMap = new Map();

    data.forEach(item => {
        const cause = item["불량원인"];
        const quantity = item["불량수량"];
        defectMap.set(cause, (defectMap.get(cause) || 0) + quantity);
    });

    const sortedEntries = [...defectMap.entries()].sort((a, b) => b[1] - a[1]);

    return {
        labels: sortedEntries.map(entry => entry[0]),
        data: sortedEntries.map(entry => entry[1])
    };
}

function updateChartB() {
    const filtered = applyFilters();
    const { labels, data } = aggregateDefects(filtered);

    chartBInstance.data.labels = labels;
    chartBInstance.data.datasets[0].data = data;
    chartBInstance.update();
}

function handleFilterChangeB() {
    filters.startDate = startInput.value;
    filters.endDate = endInput.value;
    filters.item = itemSelect.value;
    filters.machine = machineSelect.value;

    updateChartB();
}

function initializeChartB() {
const filtered = applyFilters();
const { labels, data } = aggregateDefects(filtered);
const ctx = document.getElementById('chartB').getContext('2d');

chartBInstance = new Chart(ctx, {
type: 'bar',
data: {
    labels: labels,
    datasets: [
    {
    label: '총 불량수량',
    data: data,
    backgroundColor: [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
    ],
    borderColor: [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
    ],
    borderWidth: 1
        }
    ]},
    options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { 
            display: false,
        },
        title: { 
            display: true, 
            text: '불량 원인별 수량', font:{size: 30}, color: '#000000ff'
        },
        tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
            size: 15,
            weight: 'bold'
        },
        bodyColor: '#ffffffff',
        bodyFont: {
        size: 15
        },
        },
    },
    scales: { 
    y: { 
        beginAtZero: true,
        ticks: {
            font: {
                size: 15,
                weight: 'bold'
            },
            color: '#000000ff'
        }
    },
    x: {
        ticks: {
        autoSkip: false,
        font: {size: 20},
        color: '#000000ff'
        }
    }
}
}
});
}

window.addEventListener('load', () => {
    initializeChartB();
    startInput.addEventListener('change', handleFilterChangeB);
    endInput.addEventListener('change', handleFilterChangeB);
    itemSelect.addEventListener('change', handleFilterChangeB);
    machineSelect.addEventListener('change', handleFilterChangeB);
});