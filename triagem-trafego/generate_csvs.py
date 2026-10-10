import os

os.makedirs('samples', exist_ok=True)

# 1. Normal Traffic
with open('samples/normal-traffic.csv', 'w') as f:
    f.write('"No.","Time","Source","Destination","Protocol","Length","Info"\n')
    f.write('"1","0.000","192.168.1.10","8.8.8.8","DNS","74","Standard query 0x1234 A example.com"\n')
    f.write('"2","0.050","8.8.8.8","192.168.1.10","DNS","90","Standard query response 0x1234 A 93.184.216.34"\n')
    f.write('"3","0.100","192.168.1.10","93.184.216.34","TCP","66","443 > 50000 [SYN] Seq=0 Win=65535"\n')
    f.write('"4","0.150","93.184.216.34","192.168.1.10","TCP","66","50000 > 443 [SYN, ACK] Seq=0 Ack=1 Win=65535"\n')
    f.write('"5","0.200","192.168.1.10","93.184.216.34","TCP","54","443 > 50000 [ACK] Seq=1 Ack=1 Win=65535"\n')
    f.write('"6","0.250","192.168.1.10","93.184.216.34","TLSv1.2","200","Client Hello"\n')
    f.write('"7","0.300","93.184.216.34","192.168.1.10","TLSv1.2","1500","Server Hello, Certificate"\n')
    f.write('"8","1.500","192.168.1.20","192.168.1.1","ARP","42","Who has 192.168.1.1? Tell 192.168.1.20"\n')
    f.write('"9","1.510","192.168.1.1","192.168.1.20","ARP","42","192.168.1.1 is at 00:11:22:33:44:55"\n')

# 2. High Volume Traffic
with open('samples/high-volume-traffic.csv', 'w') as f:
    f.write('"No.","Time","Source","Destination","Protocol","Length","Info"\n')
    f.write('"1","0.000","192.168.1.10","8.8.8.8","DNS","74","Standard query"\n')
    # Generate >50 packets from 192.168.1.50 (e.g. 60 packets downloading a file)
    for i in range(60):
        f.write(f'"{i+2}","0.{i:03d}","192.168.1.50","203.0.113.5","TCP","1500","[TCP segment of a reassembled PDU]"\n')

# 3. Mixed SOC Lab
with open('samples/mixed-soc-lab.csv', 'w') as f:
    f.write('"No.","Time","Source","Destination","Protocol","Length","Info"\n')
    packet_no = 1
    
    # Normal traffic
    for i in range(5):
        f.write(f'"{packet_no}","0.{i:03d}","10.0.0.5","10.0.0.1","TCP","60","Normal communication"\n')
        packet_no += 1
    
    # High volume (Rule 1) & Repeated Comm (Rule 6)
    for i in range(55):
        f.write(f'"{packet_no}","1.{i:03d}","172.16.0.100","172.16.0.200","TCP","1500","File transfer"\n')
        packet_no += 1
        
    # High ICMP (Rule 4)
    for i in range(35):
        f.write(f'"{packet_no}","2.{i:03d}","192.168.1.15","8.8.8.8","ICMP","74","Echo (ping) request"\n')
        packet_no += 1
        
    # Network Scan (Rule 2) - Host contacting many unique destinations
    for i in range(15):
        f.write(f'"{packet_no}","3.{i:03d}","192.168.1.25","10.0.0.{10+i}","TCP","60","443 > 80 [SYN]"\n')
        packet_no += 1
