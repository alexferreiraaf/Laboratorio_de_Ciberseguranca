import os

os.makedirs('samples', exist_ok=True)

header = '"Level","Date and Time","Source","Event ID","Task Category","User","Computer"\n'

# 1. Normal (Amostra Normal)
with open('samples/normal-windows-events.csv', 'w', encoding='utf-8') as f:
    f.write(header)
    f.write('"Information","10/10/2026 09:00:00","Microsoft-Windows-Security-Auditing","4624","Logon","ALEX-PC\alex","ALEX-PC"\n')
    f.write('"Information","10/10/2026 09:05:00","Microsoft-Windows-Security-Auditing","4688","Process Creation","ALEX-PC\alex","ALEX-PC"\n')
    f.write('"Information","10/10/2026 14:00:00","Microsoft-Windows-Security-Auditing","4624","Logon","ALEX-PC\maria","ALEX-PC"\n')

# 2. Brute Force (Adivinhação de Senha e Falhas)
with open('samples/bruteforce-windows-events.csv', 'w', encoding='utf-8') as f:
    f.write(header)
    # 6 failures
    for i in range(6):
        f.write(f'"Information","10/10/2026 11:0{i}:00","Microsoft-Windows-Security-Auditing","4625","Logon","jsmith","SRV-01"\n')
    # 1 success
    f.write('"Information","10/10/2026 11:06:30","Microsoft-Windows-Security-Auditing","4624","Logon","jsmith","SRV-01"\n')

# 3. Persistence (Criação de Conta e Privilégios)
with open('samples/persistence-windows-events.csv', 'w', encoding='utf-8') as f:
    f.write(header)
    f.write('"Information","10/10/2026 02:00:00","Microsoft-Windows-Security-Auditing","4624","Logon","AdminMaster","SRV-DC"\n')
    f.write('"Information","10/10/2026 02:01:00","Microsoft-Windows-Security-Auditing","4720","User Account Management","temp_service_admin","SRV-DC"\n')
    f.write('"Information","10/10/2026 02:02:00","Microsoft-Windows-Security-Auditing","4732","Security Group Management","temp_service_admin","SRV-DC"\n')

# 4. Mixed SOC Lab (Múltiplas anomalias incluindo log limpo)
with open('samples/mixed-windows-events.csv', 'w', encoding='utf-8') as f:
    f.write(header)
    f.write('"Information","10/10/2026 10:00:00","Microsoft-Windows-Security-Auditing","4624","Logon","jdoe","SRV-02"\n')
    for i in range(4):
        f.write(f'"Information","10/10/2026 10:1{i}:00","Microsoft-Windows-Security-Auditing","4625","Logon","hacker","SRV-02"\n')
    f.write('"Information","10/10/2026 10:15:00","Microsoft-Windows-Security-Auditing","1102","Event Processing","SYSTEM","SRV-02"\n')
