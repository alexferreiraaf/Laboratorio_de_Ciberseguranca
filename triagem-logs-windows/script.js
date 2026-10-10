document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const statusMessage = document.getElementById('upload-status');
    const dashboard = document.getElementById('dashboard');
    
    // UI Elements
    const statTotal = document.getElementById('stat-total-events');
    const statSuccess = document.getElementById('stat-logon-success');
    const statFail = document.getElementById('stat-logon-fail');
    const statCreated = document.getElementById('stat-account-created');
    const statCleared = document.getElementById('stat-logs-cleared');
    const alertsContainer = document.getElementById('alerts-container');
    const bruteLimitInput = document.getElementById('setting-brute-limit');

    let parsedEvents = [];
    let generatedAlerts = [];

    // --- Tratamento de Upload ---
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    // --- Botões de Demo ---
    document.querySelectorAll('.btn-demo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.getAttribute('data-sample');
            loadSample(`samples/${type}-windows-events.csv`);
        });
    });

    function handleFile(file) {
        if (!file.name.endsWith('.csv')) {
            showError("Por favor, carregue um arquivo .csv exportado do Visualizador de Eventos.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('demo-label').classList.add('hidden');
            parseCSV(e.target.result);
        };
        reader.onerror = () => showError("Erro ao ler o arquivo");
        reader.readAsText(file);
    }

    async function loadSample(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error("Amostra não encontrada. Execute o script de geração de amostras.");
            const text = await response.text();
            document.getElementById('demo-label').classList.remove('hidden');
            parseCSV(text);
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

    // --- CSV Parser Tolerante ---
    function parseCSV(csvText) {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            showError("Arquivo CSV vazio ou inválido.");
            return;
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/["']/g, '').trim());
        
        // Procurar por colunas relevantes
        const colMap = {
            eventId: headers.findIndex(h => h.includes('event id') || h === 'eventid' || h.includes('id do evento')),
            date: headers.findIndex(h => h.includes('date') || h.includes('time') || h.includes('data')),
            source: headers.findIndex(h => h === 'source' || h === 'origem'),
            user: headers.findIndex(h => h.includes('user') || h.includes('account') || h.includes('usuário')),
            computer: headers.findIndex(h => h.includes('computer') || h.includes('computador')),
            task: headers.findIndex(h => h.includes('task') || h.includes('categoria'))
        };

        if (colMap.eventId === -1) {
            showError("Coluna 'Event ID' não encontrada. Verifique se o formato de exportação está correto.");
            return;
        }

        parsedEvents = [];
        
        for (let i = 1; i < lines.length; i++) {
            // Regex básico para CSV ignorando aspas
            const rowStr = lines[i];
            const rowMatch = rowStr.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            let cleanRow = [];
            
            if (rowMatch) {
                cleanRow = rowMatch.map(cell => cell.replace(/^"|"$/g, '').trim());
            } else {
                cleanRow = rowStr.split(',').map(c => c.replace(/^"|"$/g, '').trim());
            }

            const eIdStr = cleanRow[colMap.eventId] || '';
            const eIdMatch = eIdStr.match(/\d+/); // Extrai apenas números caso venha sujo
            
            if (!eIdMatch) continue;

            parsedEvents.push({
                id: parseInt(eIdMatch[0]),
                date: colMap.date !== -1 ? (cleanRow[colMap.date] || 'Desconhecido') : 'Desconhecido',
                user: colMap.user !== -1 ? (cleanRow[colMap.user] || 'N/A') : 'N/A',
                computer: colMap.computer !== -1 ? (cleanRow[colMap.computer] || 'N/A') : 'N/A'
            });
        }

        showSuccess(`${parsedEvents.length} eventos processados com sucesso.`);
        analyzeEvents();
    }

    // --- Motor de Análise e Correlação ---
    function analyzeEvents() {
        // Estatísticas básicas
        let count4624 = 0;
        let count4625 = 0;
        let count4720 = 0;
        let count1102 = 0;

        // Agrupar por usuário
        const userActivity = {};
        
        parsedEvents.forEach(ev => {
            if (ev.id === 4624) count4624++;
            if (ev.id === 4625) count4625++;
            if (ev.id === 4720) count4720++;
            if (ev.id === 1102) count1102++;

            if (ev.user && ev.user !== 'N/A' && !ev.user.toLowerCase().includes('system') && !ev.user.toLowerCase().includes('serviço local')) {
                if (!userActivity[ev.user]) userActivity[ev.user] = [];
                userActivity[ev.user].push(ev);
            }
        });

        // Atualizar Dashboard
        statTotal.textContent = parsedEvents.length;
        statSuccess.textContent = count4624;
        statFail.textContent = count4625;
        statCreated.textContent = count4720;
        statCleared.textContent = count1102;

        generatedAlerts = [];
        const bruteLimit = parseInt(bruteLimitInput.value) || 5;

        // Regra 4: Log de Segurança Limpo (Global)
        if (count1102 > 0) {
            generatedAlerts.push({
                title: 'Log de Auditoria de Segurança Limpo',
                severity: 'Alta',
                account: 'Sistema / Administrador',
                events: '1102',
                activity: `O log de segurança foi limpo ${count1102} vezes.`,
                why: 'Isso pode acontecer durante manutenção, mas atacantes limpam logs para apagar rastros. Quase sempre exige verificação.',
                benign: 'Manutenção agendada, scripts de limpeza ou o log atingiu seu tamanho máximo e foi redefinido por um administrador.',
                investigation: [
                    'Identifique qual administrador executou a ação.',
                    'Verifique se a política da empresa permite limpeza manual de logs.',
                    'Correlacione com outros eventos que ocorreram logo antes da limpeza.'
                ]
            });
        }

        // Analisar por Usuário (Regras 1, 2, 3)
        Object.keys(userActivity).forEach(user => {
            const events = userActivity[user];
            let userFails = 0;
            let successAfterFail = false;
            let accountCreated = false;
            let privEscalated = false;

            events.forEach(ev => {
                if (ev.id === 4625) userFails++;
                if (ev.id === 4624 && userFails >= bruteLimit) successAfterFail = true;
                if (ev.id === 4720) accountCreated = true;
                if (ev.id === 4732 || ev.id === 4728) privEscalated = true;
            });

            // Regra 2: Falhas seguidas de sucesso
            if (successAfterFail) {
                generatedAlerts.push({
                    title: 'Possível Adivinhação de Senha Seguida de Sucesso',
                    severity: 'Alta',
                    account: user,
                    events: '4625 → 4624',
                    activity: `A conta falhou o login ${userFails} vezes e em seguida obteve um login de sucesso.`,
                    why: 'Pode indicar que um ataque de força bruta eventualmente adivinhou a senha correta.',
                    benign: 'O usuário pode simplesmente ter esquecido a senha, errado várias vezes e finalmente lembrado a correta.',
                    investigation: [
                        'Verifique a localização (IP/Computador) da origem.',
                        'Revisar as ações desta conta *após* o evento 4624.',
                        'Confirmar com o usuário se ele estava tentando fazer login neste momento.'
                    ]
                });
            } 
            // Regra 1: Apenas Falhas
            else if (userFails >= bruteLimit) {
                generatedAlerts.push({
                    title: 'Falhas de Logon Repetidas',
                    severity: 'Média',
                    account: user,
                    events: '4625',
                    activity: `Foram detectadas ${userFails} falhas de login consecutivas.`,
                    why: 'Pode ser uma tentativa de adivinhação de senha, pulverização (password spraying) ou erro persistente de um serviço.',
                    benign: 'Credenciais expiradas armazenadas no cache de um celular ou serviço rodando em background.',
                    investigation: [
                        'Identificar a estação de origem.',
                        'Verificar se outras contas estão sofrendo o mesmo problema.',
                        'Atualizar as senhas nos serviços dependentes, se necessário.'
                    ]
                });
            }

            // Regra 3: Conta criada e privilégios concedidos
            if (accountCreated && privEscalated) {
                generatedAlerts.push({
                    title: 'Nova Conta com Privilégios Concedidos',
                    severity: 'Alta',
                    account: user,
                    events: '4720, 4732/4728',
                    activity: 'A conta foi criada e, pouco depois, adicionada a um grupo de segurança.',
                    why: 'Isso é uma tática comum para estabelecer persistência na rede (criar conta de backdoor).',
                    benign: 'Criação normal de conta para um novo funcionário ou administrador de TI.',
                    investigation: [
                        'Verificar com a equipe de RH/TI se a criação desta conta estava agendada (ex: um ticket no Jira/ServiceNow).',
                        'Revisar qual grupo de segurança foi atribuído (ex: Administrators, Domain Admins).',
                        'Acompanhar a atividade desta nova conta.'
                    ]
                });
            }
        });

        // Caso não haja alertas de alta/média prioridade e existam eventos:
        if (generatedAlerts.length === 0 && parsedEvents.length > 0) {
            generatedAlerts.push({
                title: 'Tráfego Normal',
                severity: 'Informativa',
                account: 'N/A',
                events: 'Vários',
                activity: 'Apenas eventos normais de auditoria foram encontrados.',
                why: 'Eventos como 4624 (logon sucesso) isolados são esperados e benignos.',
                benign: 'Operação padrão de rede.',
                investigation: ['Nenhuma ação necessária baseada nesses logs limitados.']
            });
        }

        renderAlerts();
        dashboard.classList.remove('hidden');
        dashboard.scrollIntoView({ behavior: 'smooth' });
    }

    function renderAlerts() {
        alertsContainer.innerHTML = '';
        
        // Filter values
        const sevFilter = document.getElementById('filter-severity').value;
        const accFilter = document.getElementById('filter-account').value.toLowerCase();

        let filteredAlerts = generatedAlerts.filter(a => {
            if (sevFilter !== 'all' && a.severity !== sevFilter) return false;
            if (accFilter && !a.account.toLowerCase().includes(accFilter)) return false;
            return true;
        });

        if (filteredAlerts.length === 0) {
            alertsContainer.innerHTML = '<p>Nenhum alerta corresponde aos filtros.</p>';
            return;
        }

        filteredAlerts.sort((a, b) => {
            const sevScore = { 'Alta': 3, 'Média': 2, 'Baixa': 1, 'Informativa': 0 };
            return sevScore[b.severity] - sevScore[a.severity];
        });

        filteredAlerts.forEach(a => {
            const item = document.createElement('div');
            item.className = 'alert-item';
            
            // Build Investigation list
            const invHtml = a.investigation.map(i => `<li>${i}</li>`).join('');

            item.innerHTML = `
                <div class="alert-header">
                    <div class="alert-title">${a.title}</div>
                    <div class="alert-sev-badge sev-${a.severity}">Severidade: ${a.severity}</div>
                </div>
                <div class="alert-details">
                    <div class="detail-row"><span class="detail-label">Conta Alvo:</span> ${escapeHtml(a.account)}</div>
                    <div class="detail-row"><span class="detail-label">IDs de Eventos:</span> ${a.events}</div>
                </div>
                <div class="alert-text-block">
                    <h5>Atividade Observada:</h5>
                    ${a.activity}
                </div>
                <div class="alert-text-block">
                    <h5>Por que isso importa?</h5>
                    ${a.why}
                </div>
                <div class="alert-text-block">
                    <h5>Possível Explicação Benigna:</h5>
                    ${a.benign}
                </div>
                <div class="alert-text-block" style="border-top:1px dashed var(--border-color); padding-top:10px;">
                    <h5>Investigação Sugerida (Mentalidade SOC):</h5>
                    <ul style="margin:5px 0 0 0; padding-left:20px; font-size:0.9em; color:#c9d1d9;">${invHtml}</ul>
                </div>
            `;
            alertsContainer.appendChild(item);
        });
    }

    function escapeHtml(unsafe) {
        return (unsafe || '').toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    document.getElementById('filter-severity').addEventListener('change', renderAlerts);
    document.getElementById('filter-account').addEventListener('input', renderAlerts);
    document.getElementById('btn-reset-settings').addEventListener('click', () => {
        bruteLimitInput.value = 5;
        if (parsedEvents.length > 0) analyzeEvents();
    });
    bruteLimitInput.addEventListener('change', () => {
        if (parsedEvents.length > 0) analyzeEvents();
    });
});
