const emailSamples = {
    legitimate: `From: suporte@sua-empresa-real.com.br
To: funcionario@sua-empresa-real.com.br
Subject: Atualização dos Termos do Plano de Saúde
Date: Wed, 15 Nov 2026 14:30:00 -0300

Olá equipe,

Gostaríamos de informar que o manual de benefícios do plano de saúde foi atualizado para o ano de 2027. 
Você pode consultar as novas regras no portal interno do RH:
https://intranet.sua-empresa-real.com.br/beneficios

Não é necessário realizar nenhuma ação no momento. Em caso de dúvidas, procure o RH.

Atenciosamente,
Equipe de Recursos Humanos`,

    obvious: `From: "ADMINISTRADOR DO SISTEMA" <hacker_1234_anon@mail-gratuito-suspeito.net>
To: usuario@empresa.com
Subject: URGENTE: SUA CONTA SERÁ DELETADA IMEDIATAMENTE!!!

Prezado Usuario,

Detectamos acesso não autorizado. Sua conta foi bloqueada e será DELETADA em 24 horas se você não agir imediatamente!
Nós exigimos que você valide seus dados.

Clique aqui para cancelar a suspensão:
http://192.168.1.150/login.php?update=true

Ou baixe o formulário de recuperação em anexo: formulario_recuperacao.exe

Se não fizer isso, você perderá todo o acesso.

A Gerência.`,

    sophisticated: `From: "Equipe de Segurança de TI" <it-support@emrpesa.com> 
Reply-To: it-support-external@gmail.com
Subject: Ação Necessária: Verificação de Segurança (MFA)
Date: Mon, 20 Nov 2026 09:15:00 -0300

Olá,

Como parte da nossa nova política de segurança cibernética, todos os funcionários devem revalidar seus métodos de Autenticação Multifator (MFA) até o final da semana.

Por favor, faça login no portal de segurança para confirmar seu token:
https://portal-seguranca-verificacao-online.com/auth/login

Para completar a validação, o sistema solicitará sua senha atual e o código SMS.

Agradecemos a colaboração.
Equipe de Suporte de TI`,

    microsoft: `From: "Microsoft 365 Alert" <noreply@micosoft-security-alerts.com>
Subject: 3 Emails retidos na quarentena - Ação Exigida

Você tem (3) mensagens de entrada retidas pelo filtro de spam.
Essas mensagens serão excluídas automaticamente amanhã.

Revise suas mensagens pendentes aqui:
https://bit.ly/m365-quarantine-review

Se você confia no remetente, você pode liberar as mensagens inserindo sua senha de e-mail na página a seguir.

Microsoft 365 Defender`,

    delivery: `From: "Correios Expresso" <tracking-info@logistica-express-br.com>
Subject: Falha na entrega da sua encomenda - Taxa pendente

Olá Cliente,

Sua encomenda nº BR9485739284 não pôde ser entregue hoje porque há uma taxa alfandegária pendente de R$ 15,90.

Para liberar o pacote para entrega amanhã, por favor, pague a taxa no link abaixo usando seu cartão de crédito:
http://pagamentos-correios-taxa.net/liberar-pacote

O pacote retornará ao remetente se a taxa não for paga em 48 horas.

Obrigado por usar nossos serviços.`,

    bec: `From: "Carlos Silva (CEO)" <carlos.silva.ceo.executive@gmail.com>
To: "Financeiro" <financeiro@sua-empresa-real.com.br>
Subject: Transferência urgente para novo fornecedor

Oi,

Estou em uma reunião o dia todo e não consigo acessar o sistema do banco.
Precisamos processar o pagamento de uma fatura de R$ 45.000,00 para o nosso novo consultor até o meio-dia de hoje para garantir o contrato.

Por favor, faça a transferência imediatamente para os seguintes dados bancários:
Banco: Banco Internacional S.A.
Conta: 938475-1
Titular: Consultoria Global Ltda.

Confirme para mim assim que o pagamento for realizado. É muito urgente.

Abraços,
Carlos
Enviado do meu iPhone`
};
