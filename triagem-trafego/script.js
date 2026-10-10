document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const statusMessage = document.getElementById('upload-status');
    
    // Configurações e estado
    let packets = [];
    
    // Tratamento de Arquivo
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    // Botões de Demonstração
    document.getElementById('btn-normal').addEventListener('click', () => loadSample('samples/normal-traffic.csv'));
    document.getElementById('btn-suspicious').addEventListener('click', () => loadSample('samples/high-volume-traffic.csv'));
    document.getElementById('btn-mixed').addEventListener('click', () => loadSample('samples/mixed-soc-lab.csv'));

    function handleFile(file) {
        if (!file.name.endsWith('.csv')) {
            showError("Por favor, carregue um arquivo .csv");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            document.getElementById('demo-label').classList.add('hidden');
            parseCSV(text, file.name);
        };
        reader.onerror = () => showError("Erro ao ler o arquivo");
        reader.readAsText(file);
    }

    async function loadSample(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error("Amostra não encontrada");
            const text = await response.text();
            document.getElementById('demo-label').classList.remove('hidden');
            parseCSV(text, path.split('/').pop());
        } catch (error) {
            showError("Erro ao carregar amostra: " + error.message);
        }
    }

    function showError(msg) {
        statusMessage.textContent = msg;
        statusMessage.className = 'status-message status-error';
    }

    function showSuccess(msg) {
        statusMessage.textContent = msg;
        statusMessage.className = 'status-message status-success';
    }

    function parseCSV(csvText, filename) {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            showError("O arquivo CSV parece estar vazio ou não tem dados.");
            return;
        }

        // Determinar índices das colunas
        const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/["']/g, '').trim());
        
        // Mapeamento tolerante
        const colMap = {
            source: headers.findIndex(h => h.includes('source') || h === 'src' || h === 'ip.src'),
            destination: headers.findIndex(h => h.includes('destination') || h === 'dst' || h === 'ip.dst' || h.includes('dest')),
            protocol: headers.findIndex(h => h.includes('protocol') || h === 'proto'),
            info: headers.findIndex(h => h.includes('info')),
            length: headers.findIndex(h => h.includes('length') || h === 'len')
        };

        let missing = [];
        if (colMap.source === -1) missing.push("Origem");
        if (colMap.destination === -1) missing.push("Destino");
        if (colMap.protocol === -1) missing.push("Protocolo");

        if (missing.length > 0) {
            showError(`Campos obrigatórios ausentes: ${missing.join(', ')}. Certifique-se de que é uma exportação CSV válida do Wireshark.`);
            return;
        }

        packets = [];
        for (let i = 1; i < lines.length; i++) {
            // Separação de CSV considerando aspas simples (não suporta vírgulas perfeitamente dentro de aspas mas serve para Wireshark padrão)
            const rowStr = lines[i];
            const cleanRow = rowStr.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());

            if (cleanRow.length <= Math.max(colMap.source, colMap.destination, colMap.protocol)) continue;

            packets.push({
                source: cleanRow[colMap.source],
                destination: cleanRow[colMap.destination],
                protocol: cleanRow[colMap.protocol],
                info: colMap.info !== -1 ? (cleanRow[colMap.info] || '') : '',
                length: colMap.length !== -1 ? parseInt(cleanRow[colMap.length]) || 0 : 0
            });
        }

        showSuccess(`Analisado com sucesso: ${filename} (${packets.length} pacotes carregados)`);
        
        document.getElementById('dashboard').classList.remove('hidden');
        
        updateDashboardBasic();
    }

    function escapeHtml(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function updateDashboardBasic() {
        document.getElementById('total-packets').textContent = packets.length;
        
        const sources = new Set();
        const destinations = new Set();
        const protocols = {};

        packets.forEach(p => {
            if (p.source) sources.add(p.source);
            if (p.destination) destinations.add(p.destination);
            
            if (p.protocol) {
                protocols[p.protocol] = (protocols[p.protocol] || 0) + 1;
            }
        });

        document.getElementById('unique-sources').textContent = sources.size;
        document.getElementById('unique-destinations').textContent = destinations.size;

        // Distribuição de protocolos
        const protoList = document.getElementById('protocol-distribution');
        protoList.innerHTML = '';
        Object.entries(protocols)
            .sort((a, b) => b[1] - a[1])
            .forEach(([proto, count]) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${escapeHtml(proto)}</span> <span>${count}</span>`;
                protoList.appendChild(li);
            });
            
        // Fase 1: Limpar listas de tops enquanto não implementamos a lógica
        document.getElementById('top-sources').innerHTML = '';
        document.getElementById('top-destinations').innerHTML = '';
        document.getElementById('alerts-container').innerHTML = '<p style="color:var(--text-color);">Nenhum alerta ainda. As regras serão implementadas a seguir.</p>';
    }
});
