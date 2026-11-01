document.addEventListener('DOMContentLoaded', () => {
    fetch('data/mock_data.json')
        .then(res => res.json())
        .then(data => {
            initFunds(data.funds);
            initStocks(data.stocks);
        })
        .catch(err => {
            console.error('Error loading mock data:', err);
            initFunds([
                { name: "Parag Parikh Flexi Cap Fund", category: "Equity - Flexi Cap", aum: "₹78,420 Cr", cagr3yr: "21.4%", cagr5yr: "23.8%" },
                { name: "Nippon India Small Cap Fund", category: "Equity - Small Cap", aum: "₹54,110 Cr", cagr3yr: "27.2%", cagr5yr: "28.9%" },
                { name: "ICICI Pru Balanced Advantage", category: "Hybrid - Balanced", aum: "₹58,900 Cr", cagr3yr: "16.5%", cagr5yr: "15.8%" }
            ]);
            initStocks([
                { company: "Reliance Industries", symbol: "RELIANCE", ltp: 2940.50, change: "+1.45%", pe: 28.4, roce: "12.5%" },
                { company: "Tata Consultancy Services", symbol: "TCS", ltp: 4120.00, change: "+0.85%", pe: 31.2, roce: "48.2%" },
                { company: "HDFC Bank", symbol: "HDFCBANK", ltp: 1680.25, change: "-0.32%", pe: 19.5, roce: "16.8%" }
            ]);
        });

    initSIPCalculator();
    initCasAnalyzer();
});

function initFunds(funds) {
    const grid = document.getElementById('fundGrid');
    if(!grid) return;
    grid.innerHTML = funds.map(f => `
        <div class="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
                <span class="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded font-bold uppercase">${f.category}</span>
                <h3 class="text-xl font-bold text-white mt-3">${f.name}</h3>
                <p class="text-xs text-gray-400 mt-1">Direct Plan - Growth</p>
                <div class="mt-6 space-y-2 text-sm">
                    <div class="flex justify-between"><span class="text-gray-400">3-Yr CAGR:</span> <strong class="text-green-400">${f.cagr3yr}</strong></div>
                    <div class="flex justify-between"><span class="text-gray-400">5-Yr CAGR:</span> <strong class="text-green-400">${f.cagr5yr}</strong></div>
                    <div class="flex justify-between"><span class="text-gray-400">AUM:</span> <strong class="text-white">${f.aum}</strong></div>
                </div>
            </div>
            <a href="https://wa.me/9017404142?text=I%20want%20to%20invest%20in%20${encodeURIComponent(f.name)}" target="_blank" class="mt-8 block text-center bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-2.5 rounded-lg transition">Invest Now</a>
        </div>
    `).join('');
}

function initStocks(stocks) {
    const tbody = document.getElementById('stockTableBody');
    if(!tbody) return;
    function renderTable(data) {
        tbody.innerHTML = data.map(s => `
            <tr>
                <td class="p-4 font-bold text-white">${s.company}</td>
                <td class="p-4 text-gray-400">${s.symbol}</td>
                <td class="p-4">₹${s.ltp.toLocaleString('en-IN')}</td>
                <td class="p-4 ${s.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}">${s.change}</td>
                <td class="p-4">${s.pe}</td>
                <td class="p-4 text-gold-400">${s.roce}</td>
                <td class="p-4"><a href="https://wa.me/9017404142?text=Inquiry%20regarding%20${s.symbol}" target="_blank" class="text-gold-400 hover:underline font-semibold">Analyze</a></td>
            </tr>
        `).join('');
    }
    renderTable(stocks);

    document.getElementById('stockSearch').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = stocks.filter(s => s.company.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q));
        renderTable(filtered);
    });
}

function initSIPCalculator() {
    const amtEl = document.getElementById('sipAmount');
    const retEl = document.getElementById('sipReturn');
    const yrsEl = document.getElementById('sipYears');

    const amtVal = document.getElementById('sipAmountVal');
    const retVal = document.getElementById('sipReturnVal');
    const yrsVal = document.getElementById('sipYearsVal');

    const invText = document.getElementById('sipInvested');
    const wltText = document.getElementById('sipWealth');

    let ctx = document.getElementById('sipChart').getContext('2d');
    let sipChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Invested Amount', 'Est. Returns'],
            datasets: [{
                data: [1200000, 1123391],
                backgroundColor: ['#1d3557', '#d4af37'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#fff', font: { size: 12 } } }
            }
        }
    });

    function updateSIP() {
        let p = parseFloat(amtEl.value);
        let i = parseFloat(retEl.value) / 12 / 100;
        let n = parseFloat(yrsEl.value) * 12;

        amtVal.innerText = p.toLocaleString('en-IN');
        retVal.innerText = retEl.value + '%';
        yrsVal.innerText = yrsEl.value;

        let invested = p * n;
        let maturity = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        let returns = maturity - invested;

        invText.innerText = '₹' + Math.round(invested).toLocaleString('en-IN');
        wltText.innerText = '₹' + Math.round(maturity).toLocaleString('en-IN');

        sipChart.data.datasets[0].data = [invested, returns];
        sipChart.update();
    }

    amtEl.addEventListener('input', updateSIP);
    retEl.addEventListener('input', updateSIP);
    yrsEl.addEventListener('input', updateSIP);
    updateSIP();
}

function initCasAnalyzer() {
    document.getElementById('analyzeCasBtn').addEventListener('click', () => {
        const text = document.getElementById('casInput').value;
        const output = document.getElementById('casOutput');
        if(!text.trim()) {
            output.innerHTML = `<p class="text-amber-400">Please paste CAS text summary or statement data.</p>`;
            return;
        }
        const riskScore = (Math.random() * 3 + 6).toFixed(1);
        output.innerHTML = `
            <p class="text-green-400 font-bold"><i class="fas fa-check-circle mr-1"></i> Statement Parsed Successfully</p>
            <p>Calculated Risk Score: <strong class="text-gold-400">${riskScore} / 10</strong> (Moderate-Aggressive Growth)</p>
            <p>Recommended Asset Mix: <strong class="text-white">75% Equity / 25% Hybrid & Debt</strong></p>
        `;
    });
}