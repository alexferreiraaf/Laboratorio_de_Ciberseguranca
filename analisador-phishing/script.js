document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email-input');
    const btnAnalyze = document.getElementById('btn-analyze');
    const btnClear = document.getElementById('btn-clear');
    const resultsSection = document.getElementById('results-section');
    const scoreValue = document.getElementById('score-value');
    const riskClassification = document.getElementById('risk-classification');
    const riskDescription = document.getElementById('risk-description');
    const findingsList = document.getElementById('findings-list');
    const recommendationsList = document.getElementById('recommendations-list');
    const scoreContainer = document.querySelector('.score-container');

    // Mapear botões de demonstração
    document.querySelectorAll('.btn-demo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sampleKey = e.target.getAttribute('data-sample');
            if (emailSamples && emailSamples[sampleKey]) {
                emailInput.value = emailSamples[sampleKey];
                resultsSection.classList.add('hidden'); // Ocultar resultados anteriores
            }
        });
    });

    btnClear.addEventListener('click', () => {
        emailInput.value = '';
        resultsSection.classList.add('hidden');
    });

    btnAnalyze.addEventListener('click', analyzeEmail);

    // Dicionário de regras de detecção (Suporte PT/EN)
    const rules = [
        {
            id: 'urgency',
            name: 'Linguagem de Urgência ou Ameaça',
            regex: /(urgente|imediatamente|ação exigida|conta será suspensa|deletada|cancelada|bloqueada|perderá todo o acesso|último aviso|faça isso agora|urgent|immediately|action required|suspended|permanently closed|lose access|losing access|final warning)/i,
            points: 20,
            desc: 'O e-mail tenta criar um falso senso de urgência para forçar você a agir sem pensar.'
        },
        {
            id: 'credentials',
            name: 'Solicitação de Credenciais ou MFA',
            regex: /(sua senha|código sms|código de verificação|token|revalidar seus métodos de Autenticação|valide seus dados|inserindo sua senha|your password|verification code|verify your identity)/i,
            points: 30,
            desc: 'Organizações legítimas raramente pedem que você forneça sua senha ou código MFA diretamente por e-mail ou em links não solicitados.'
        },
        {
            id: 'payment',
            name: 'Solicitação de Pagamento Inesperada',
            regex: /(pagar a taxa|taxa alfandegária|transferência urgente|cartões-presente|gift cards|dados bancários|processar o pagamento da fatura|unpaid invoice|pay the fee|bank details)/i,
            points: 25,
            desc: 'Pedidos repentinos de transferência bancária, pagamento de taxas ou cartões-presente são táticas muito comuns em golpes.'
        },
        {
            id: 'suspicious_link',
            name: 'Link Suspeito (IP Direto ou Encurtador)',
            regex: /(http:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|bit\.ly|tinyurl\.com|goo\.gl|ow\.ly)/i,
            points: 25,
            desc: 'O e-mail contém um link usando um endereço IP direto ou um encurtador de URL, muitas vezes usado para esconder o verdadeiro destino malicioso.'
        },
        {
            id: 'impersonation_domain',
            name: 'Domínio de Remetente Suspeito',
            regex: /(micosoft|micros0ft|emrpesa|banco-falso|mail-gratuito-suspeito|gmail\.com|hotmail\.com|yahoo\.com)/i,
            points: 15,
            desc: 'O e-mail vem de um provedor de e-mail gratuito (ex: Gmail) enquanto alega ser de uma empresa, ou usa erros ortográficos propositais para imitar domínios reais.'
        },
        {
            id: 'dangerous_attachment',
            name: 'Anexo Potencialmente Perigoso',
            regex: /\.([a-zA-Z0-9_]+\.(exe|scr|vbs|bat|cmd|js|wsf))/i,
            points: 35,
            desc: 'O texto menciona ou contém anexos de arquivos executáveis ou scripts, que são extremamente perigosos e frequentemente usados para espalhar malware.'
        },
        {
            id: 'reply_to_mismatch',
            name: 'Divergência de Remetente (Reply-To)',
            regex: /Reply-To:/i,
            points: 15,
            desc: 'O e-mail especifica um endereço de "Responder Para" (Reply-To). Em alguns ataques, os golpistas mascaram o rementente oficial, mas configuram a resposta para ir para a caixa de e-mail deles.',
            customCheck: (text) => {
                const fromMatch = text.match(/From:\s*.*<(.+?)>/i) || text.match(/From:\s*(.+)/i);
                const replyToMatch = text.match(/Reply-To:\s*.*<(.+?)>/i) || text.match(/Reply-To:\s*(.+)/i);
                
                if (fromMatch && replyToMatch) {
                    const fromEmail = fromMatch[1].trim();
                    const replyEmail = replyToMatch[1].trim();
                    if (fromEmail.toLowerCase() !== replyEmail.toLowerCase()) {
                        return true;
                    }
                }
                return false;
            }
        },
        {
            id: 'impersonal_greeting',
            name: 'Saudação Genérica',
            regex: /(Prezado Cliente|Prezado Usuario|Olá Cliente|Dear Customer|Dear User)/i,
            points: 5,
            desc: 'Phishings em massa costumam usar saudações genéricas em vez do seu nome verdadeiro.'
        }
    ];

    function analyzeEmail() {
        const text = emailInput.value;
        if (!text.trim()) {
            alert('Por favor, cole um e-mail para analisar.');
            return;
        }

        let totalScore = 0;
        const findings = [];

        // Rodar regras
        rules.forEach(rule => {
            let matched = false;
            
            if (rule.customCheck) {
                matched = rule.customCheck(text);
            } else if (rule.regex) {
                matched = rule.regex.test(text);
            }

            if (matched) {
                totalScore += rule.points;
                findings.push(rule);
            }
        });

        // Limitar a pontuação máxima a 100
        if (totalScore > 100) totalScore = 100;

        renderResults(totalScore, findings);
    }

    function renderResults(score, findings) {
        // Atualizar pontuação
        scoreValue.textContent = score;

        // Limpar listas
        findingsList.innerHTML = '';
        recommendationsList.innerHTML = '';

        // Definir Risco
        let classification = '';
        let desc = '';
        let colorVar = '';

        if (score === 0) {
            classification = 'Risco Baixo';
            desc = 'Nenhum indicador óbvio de phishing foi detectado nesta análise de texto. No entanto, continue alerta.';
            colorVar = 'var(--risk-low)';
            scoreContainer.style.borderColor = colorVar;
        } else if (score < 40) {
            classification = 'Suspeito';
            desc = 'O e-mail contém alguns padrões incomuns. Exige cuidado e verificação extra.';
            colorVar = 'var(--risk-medium)';
            scoreContainer.style.borderColor = colorVar;
        } else {
            classification = 'Risco Alto';
            desc = 'Múltiplos e fortes indicadores de engenharia social detectados. Altamente provável ser malicioso.';
            colorVar = 'var(--risk-high)';
            if (score >= 80) colorVar = 'var(--risk-critical)';
            scoreContainer.style.borderColor = colorVar;
        }

        riskClassification.textContent = classification;
        riskClassification.style.color = colorVar;
        riskDescription.textContent = desc;

        // Preencher descobertas
        if (findings.length === 0) {
            findingsList.innerHTML = '<li style="color:var(--risk-low); text-align:center;">Nenhum sinal de alerta detectado pelo motor de regras.</li>';
        } else {
            findings.forEach(f => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="finding-header">
                        <span class="finding-title">${f.name}</span>
                        <span class="finding-points">+${f.points} pontos</span>
                    </div>
                    <div class="finding-desc">${f.desc}</div>
                `;
                findingsList.appendChild(li);
            });
        }

        // Recomendações Dinâmicas
        const recs = [
            'Não clique em nenhum link contido neste e-mail.',
            'Não baixe nem abra anexos.',
            'Se a mensagem alegar ser do seu banco ou de um serviço que você usa, digite o endereço do site manualmente no seu navegador.'
        ];

        if (findings.some(f => f.id === 'payment')) {
            recs.push('Se a solicitação financeira vier de um colega de trabalho ou chefe (CEO), entre em contato com eles imediatamente por telefone para confirmar, pois o e-mail deles pode ter sido forjado (ataque BEC).');
        }

        if (findings.some(f => f.id === 'credentials')) {
            recs.push('A equipe de suporte de TI nunca enviará um formulário de login por e-mail para validar dados. Repasse o e-mail para o departamento de segurança da sua empresa.');
        }

        recs.forEach(r => {
            const li = document.createElement('li');
            li.textContent = r;
            recommendationsList.appendChild(li);
        });

        // Mostrar painel de resultados
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
});
