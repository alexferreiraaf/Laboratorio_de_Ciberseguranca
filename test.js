const text = `De: "Equipe de Contas Microsoft" <security-alert@micros0ft-support.example>
Responder para: helpdesk.recovery@mail-recovery.invalid
Para: victim@example.com
Assunto: URGENTE: Sua conta será suspensa em até 24 horas
Authentication-Results: mx.example.com;
 spf=fail (o IP do remetente é 192.0.2.45) smtp.mailfrom=micros0ft-support.example;
 dkim=fail header.d=micros0ft-support.example;
 dmarc=fail action=none header.from=micros0ft-support.example
Data: Sex, 09 Out 2026 08:15:00 -0300

Prezado Cliente,

Detectamos uma atividade de login incomum na sua conta. Sua conta será suspensa e encerrada permanentemente em até 24 horas, a menos que você verifique sua identidade imediatamente.

Clique no link abaixo para confirmar sua senha e evitar a perda de acesso:

http://192.0.2.45/login/verify-account

Ou use este link encurtado: http://bit.ly/verify-now-example

Por favor, responda com sua senha e com o código de verificação de 6 dígitos que enviamos para o seu celular, para que possamos restaurar sua conta.

Também anexamos uma fatura em aberto (Fatura nº 88213) para a sua análise. Abra o anexo e clique em "Ativar Macros" para visualizá-la:

Anexo: Invoice_88213.pdf.exe

A falta de ação imediata resultará na perda de todos os seus dados.

Atenciosamente,
Equipe de Segurança da Microsoft`;

const rules = [
    {
        id: 'urgency',
        name: 'Linguagem de Urgência ou Ameaça',
        regex: /(urgente|imediatamente|ação exigida|conta será suspensa|deletada|cancelada|bloqueada|perderá todo o acesso|último aviso|faça isso agora|urgent|immediately|action required|suspended|permanently closed|lose access|losing access|final warning)/i,
        points: 20
    },
    {
        id: 'credentials',
        name: 'Solicitação de Credenciais ou MFA',
        regex: /(sua senha|código sms|código de verificação|token|revalidar seus métodos de Autenticação|valide seus dados|inserindo sua senha|your password|verification code|verify your identity)/i,
        points: 30
    },
    {
        id: 'suspicious_link',
        name: 'Link Suspeito (IP Direto ou Encurtador)',
        regex: /(http:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|bit\.ly|tinyurl\.com|goo\.gl|ow\.ly)/i,
        points: 25
    },
    {
        id: 'impersonation_domain',
        name: 'Domínio de Remetente Suspeito',
        regex: /(micosoft|micros0ft|emrpesa|banco-falso|mail-gratuito-suspeito|gmail\.com|hotmail\.com|yahoo\.com)/i,
        points: 15
    },
    {
        id: 'dangerous_attachment',
        name: 'Anexo Potencialmente Perigoso',
        regex: /\.([a-zA-Z0-9_]+\.(exe|scr|vbs|bat|cmd|js|wsf))/i,
        points: 35
    },
    {
        id: 'reply_to_mismatch',
        name: 'Divergência de Remetente (Reply-To)',
        regex: /Reply-To:/i,
        points: 15,
        customCheck: (text) => {
            const fromMatch = text.match(/(?:From|De):\s*.*<(.+?)>/i) || text.match(/(?:From|De):\s*(.+)/i);
            const replyToMatch = text.match(/(?:Reply-To|Responder para):\s*.*<(.+?)>/i) || text.match(/(?:Reply-To|Responder para):\s*(.+)/i);
            
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
        points: 5
    }
];

let totalScore = 0;
const findings = [];

rules.forEach(rule => {
    let matched = false;
    if (rule.customCheck) {
        matched = rule.customCheck(text);
    } else if (rule.regex) {
        matched = rule.regex.test(text);
    }

    if (matched) {
        totalScore += rule.points;
        findings.push(rule.id);
    }
});

console.log("Score:", totalScore);
console.log("Findings:", findings);
