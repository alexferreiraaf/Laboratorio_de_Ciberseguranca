# Windows Security Event Log Triage Tool

## Propósito do Projeto
Esta é uma aplicação web de triagem educacional (focada em simular a análise SOC) que recebe exportações CSV do Visualizador de Eventos do Windows (Windows Event Viewer) e analisa as linhas buscando atividades relevantes de segurança, aplicando regras de correlação simples.

O objetivo é ensinar estudantes de cibersegurança a identificar e correlacionar eventos importantes em logs do Windows, sem a necessidade de um EDR ou SIEM caro, operando 100% offline no navegador para garantir a privacidade.

## O que são Logs de Eventos do Windows?
O Windows registra quase tudo o que acontece no sistema nos bastidores. A categoria "Security" (Segurança) audita logins, criações de processos, alterações de conta e privilégios. Estes logs são vitais para investigações e Resposta a Incidentes (IR).

## O que significa Triagem SOC?
SOC significa Security Operations Center. A "Triagem" é a fase onde os analistas de segurança olham para os alertas brutos e tomam uma decisão rápida inicial para categorizar a prioridade do alerta: se é um falso positivo comum ou se requer uma investigação de incidente mais profunda. 

## Como Executar Localmente
Esta aplicação não requer banco de dados ou backend. Para executá-la:
1. Abra o arquivo `index.html` diretamente em qualquer navegador moderno.
2. (Opcional) Hospede o diretório com `python -m http.server 8000` ou use a extensão Live Server do VS Code.

## Como Exportar Dados (CSV)
Para usar com seus próprios logs:
1. Pressione `Win + R` e digite `eventvwr.msc` para abrir o Visualizador de Eventos.
2. Expanda **Logs do Windows** -> **Segurança**.
3. No painel direito, clique em **Filtrar Log Atual...** e selecione apenas os Event IDs suportados (veja abaixo) para evitar que o arquivo fique gigante.
4. Clique com o botão direito nos logs filtrados -> **Salvar Todos os Eventos Filtrados Como...**
5. Escolha o tipo "CSV (Valores Separados por Vírgula)".
6. Carregue o CSV nesta ferramenta.

## Event IDs Suportados na Versão 1
* **4624**: Logon bem-sucedido
* **4625**: Falha de logon
* **4688**: Criação de processo (Requer política de auditoria ativada)
* **4720**: Conta de usuário criada
* **4726**: Conta de usuário excluída
* **4728 / 4732**: Adição de membro a grupos de segurança
* **1102**: Log de Segurança limpo
* **4104**: Execução de script PowerShell (Se operacionais estiverem incluídos)

## Regras de Correlação
Em vez de focar em eventos isolados, a ferramenta foca em:
1. **Falhas Repetidas:** Mais de X tentativas com falha da mesma conta (Padrão: 5).
2. **Sucesso após Falha:** Falhas repetidas seguidas de um login bem-sucedido na mesma conta (indício de adivinhação).
3. **Escalonamento:** Criação de conta seguida de alteração de grupo de segurança no mesmo usuário.
4. **Log Limpo:** Sinalização imediata do ID 1102 como atividade crítica.

## Limitações e Falsos Positivos
1. **Falso Positivo:** Falhas seguidas de sucesso muitas vezes são causadas apenas pelo próprio usuário esquecendo sua senha real e errando três vezes antes de acertar. A ferramenta sinaliza isso como **Alto Risco** educacionalmente, para forçar o analista a avaliar o IP e a hora.
2. **Ausência de IP:** Nem toda política de auditoria exporta o IP corretamente para todas as falhas. 
3. **Não substitui ferramentas reais:** Esta ferramenta faz cruzamentos estáticos simples. Um SIEM (como Splunk ou Sentinel) e um EDR (como CrowdStrike ou Defender for Endpoint) são fundamentais em operações reais.

## Arquitetura de Privacidade
O parser CSV foi escrito usando Vanilla JavaScript nativo (`FileReader`). O código não possui instâncias de `fetch` enviando seu CSV e não carrega dependências CDN externas analíticas. O processamento dura os milissegundos correspondentes à RAM do seu navegador.

## Ideias para Melhorias Futuras (Não implementadas)
* Suporte para arquivos `.evtx` brutos via parser binário em JS (como `evtx.js`).
* Suporte nativo ao Sysmon (Event ID 1, 3, etc).
* Análise de linha de tempo visual com gráficos.
* Mapeamento direto de regras ao Framework MITRE ATT&CK.
