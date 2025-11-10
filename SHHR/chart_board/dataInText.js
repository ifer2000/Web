import { DUMMY_DATA } from './dummyData.js';

const startInput = document.getElementById('startData');
const endInput = document.getElementById('endData');
const itemSelect = document.getElementById('item_select');
const machineSelect = document.getElementById('machine_select');

const totalProdEl = document.getElementById('totalProdValue');
const totalDefectEl = document.getElementById('totalDefectValue');
const defectRateEl = document.getElementById('defectRateValue');

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

function updateTextBoxes() {
    const filteredData = applyFilters();
    const totalProduction = filteredData.reduce((sum, item) => sum + item["생산량"], 0);
    const totalDefects = filteredData.reduce((sum, item) => sum + item["불량수량"], 0);
    
    let defectRate = 0;
    if (totalProduction > 0) {
        defectRate = (totalDefects / totalProduction) * 100;
    }

    totalProdEl.textContent = totalProduction.toLocaleString();
    totalDefectEl.textContent = totalDefects.toLocaleString();
    defectRateEl.textContent = `${defectRate.toFixed(2)}%`;
}

function handleTextFilterChange() {
    filters.startDate = startInput.value;
    filters.endDate = endInput.value;
    filters.item = itemSelect.value;
    filters.machine = machineSelect.value;

    updateTextBoxes();
}

window.addEventListener('load', () => {

    updateTextBoxes();
    startInput.addEventListener('change', handleTextFilterChange);
    endInput.addEventListener('change', handleTextFilterChange);
    itemSelect.addEventListener('change', handleTextFilterChange);
    machineSelect.addEventListener('change', handleTextFilterChange);
});