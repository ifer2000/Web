import { DUMMY_DATA } from './dummyData.js';

const startInput = document.getElementById('startData');
const endInput = document.getElementById('endData');
const itemSelect = document.getElementById('item_select');
const machineSelect = document.getElementById('machine_select');

let chartInstance;
const filters = {
    startDate: startInput.value,
    endDate: endInput.value,
    item: itemSelect.value,
    machine: machineSelect.value
};

function ValuesByKey(data, key) {
  return data.map(item => item[key]);
}

function sortByDate(data) {
  return [...data].sort((a, b) => Number(a["생산일자"]) - Number(b["생산일자"]));
}

function getUniqueValues(data, key) {
    const uniqueSet = new Set(data.map(item => item[key]));
    return [...uniqueSet];
}

function populateDropdowns() {
    const uniqueItems = getUniqueValues(DUMMY_DATA, "품목명");
    const uniqueMachines = getUniqueValues(DUMMY_DATA, "작업설비");

    uniqueItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        itemSelect.appendChild(option);
    });

    uniqueMachines.forEach(machine => {
        const option = document.createElement('option');
        option.value = machine;
        option.textContent = machine;
        machineSelect.appendChild(option);
    });
}

function applyFilters() {
    const [sy, sm, sd] = filters.startDate.split('-').map(Number);
    const [ey, em, ed] = filters.endDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    const dateFiltered = DUMMY_DATA.filter(item => {
      const [iy, im, id] = item["생산일자"]
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

function updateChart() {
    const filtered = applyFilters();
    const sortedData = sortByDate(filtered);

    const labels = ValuesByKey(sortedData, "생산일자");
    const targetProd = ValuesByKey(sortedData, "목표 불량수");
    const predictedProd = ValuesByKey(sortedData, "예측 불량수");

    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = targetProd;
    chartInstance.data.datasets[1].data = predictedProd;
    chartInstance.update();
}

function handleFilterChange() {
    filters.startDate = startInput.value;
    filters.endDate = endInput.value;
    filters.item = itemSelect.value;
    filters.machine = machineSelect.value;

    updateChart();
}

function initializeChart() {
    const filtered = applyFilters();
    const sortedData = sortByDate(filtered);
        
    const labels = ValuesByKey(sortedData, "생산일자");
    const targetProd = ValuesByKey(sortedData, "목표 불량수");
    const predictedProd = ValuesByKey(sortedData, "예측 불량수");

    const ctx = document.getElementById('chartli2');
    
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '목표 불량수',
            data: targetProd,
            borderColor: 'rgba(27, 198, 61, 1)',
            backgroundColor: 'rgba(48, 224, 83, 0.3)',
            tension: 0,
            borderWidth: 3,
            fill: false,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(190, 255, 203, 1)',
          },
          {
            label: '예측 불량수',
            data: predictedProd,
            borderColor: 'rgba(177, 181, 50, 1)',
            backgroundColor: 'rgba(163, 172, 64, 0.3)',
            tension: 0,
            borderWidth: 3,
            fill: false,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(253, 255, 191, 1)',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top',
              labels: {
              font: {
                size: 15,
                weight: 'bold'
              },
              color: '#000000ff'
            }
           },
          title: { display: true, text: '불량수 목표 및 예측 그래프', font:{size: 30}, color: '#000000ff'},
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
        scales: { y: { beginAtZero: true,
          ticks: {
            font: {
              size: 15
            },
            color: '#000000ff'
          }
         },
        x: {
            ticks: {
              font: {
                size: 15
              },
              color: '#000000ff'
            }
          } }
      }
    });
}

window.addEventListener('load', () => {
    populateDropdowns();
    initializeChart();

    startInput.addEventListener('change', handleFilterChange);
    endInput.addEventListener('change', handleFilterChange);
    itemSelect.addEventListener('change', handleFilterChange);
    machineSelect.addEventListener('change', handleFilterChange);
});