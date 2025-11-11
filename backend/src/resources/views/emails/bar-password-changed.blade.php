<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Modificata - QoffeRun</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            margin-bottom: 25px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        .logo-icon {
            width: 60px;
            height: 70px;
            display: inline-block;
            vertical-align: middle;
            background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="70" viewBox="0 0 60 70"><defs><linearGradient id="orange" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23EF7A37"/><stop offset="100%" style="stop-color:%23E65A2B"/></linearGradient></defs><path d="M20 8 Q22 4 20 0 M25 8 Q27 4 25 0 M30 8 Q32 4 30 0" stroke="%23EF7A37" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="15" y="20" width="30" height="8" rx="4" fill="url(%23orange)"/><path d="M12 25 Q8 25 8 35 Q8 45 12 45" stroke="%23EF7A37" stroke-width="3" fill="none"/><rect x="15" y="28" width="30" height="35" rx="8" ry="8" fill="url(%23orange)"/><circle cx="30" cy="45" r="12" fill="white" stroke="%23EF7A37" stroke-width="3"/><line x1="30" y1="37" x2="30" y2="42" stroke="%23EF7A37" stroke-width="2" stroke-linecap="round"/><line x1="30" y1="45" x2="35" y2="50" stroke="%23EF7A37" stroke-width="2" stroke-linecap="round"/><path d="m48 45 8 0 -4 -4 4 4 -4 4" fill="%23EF7A37"/></svg>') no-repeat center center;
            background-size: contain;
        }
        .logo-text {
            font-size: 2.2em;
            font-weight: bold;
            color: #000000;
            font-family: 'Arial', sans-serif;
            letter-spacing: -1px;
            vertical-align: middle;
            margin: 0;
        }
        .success-info {
            background-color: #d4edda;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
            margin: 20px 0;
        }
        .change-info {
            background-color: #f0f8ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
            margin: 20px 0;
        }
        .security-info {
            background-color: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 40px;
            color: #666;
            font-size: 0.9em;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .info-row {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .info-label {
            font-weight: bold;
            display: inline-block;
            min-width: 120px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="logo-icon"></span>
                <span class="logo-text">QoffeRun</span>
            </div>
            <h1>Password Modificata</h1>
        </div>

        <p>Gentile <strong>{{ $userName }}</strong>,</p>
        
        <p>la informiamo che la password per l'accesso al pannello QoffeRun del bar <strong>{{ $barName }}</strong> è stata modificata con successo.</p>

        <div class="success-info">
            <h3 style="color: #155724; margin: 0 0 10px 0;">✅ Password aggiornata</h3>
            <p style="color: #155724; margin: 0; line-height: 1.5;">
                La sua password è stata cambiata correttamente. Ora può utilizzare la nuova password per accedere al pannello di gestione.
            </p>
        </div>

        <div class="change-info">
            <h3 style="color: #0056b3; margin: 0 0 15px 0;">📋 Dettagli modifica</h3>
            <div class="info-row">
                <span class="info-label">📧 Account:</span>
                <span>{{ $userEmail }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">🕐 Data e ora:</span>
                <span>{{ $changeTime }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">🌐 Indirizzo IP:</span>
                <span>{{ $ipAddress }}</span>
            </div>
        </div>

        <div class="security-info">
            <h3 style="color: #856404; margin: 0 0 10px 0;">🔒 Sicurezza account</h3>
            <p style="color: #856404; margin: 0; line-height: 1.5;">
                Se non ha effettuato lei questa modifica, la preghiamo di contattare immediatamente il nostro supporto tecnico. 
                Il suo account potrebbe essere compromesso.
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="https://bar.qofferun.com" class="button">Accedi al Pannello</a>
        </div>

        <div class="footer">
            <p style="margin: 8px 0;">Per assistenza tecnica: <a href="mailto:info@qofferun.com" style="color: #ff6b35;">info@qofferun.com</a></p>
            <p style="margin: 8px 0; color: #999;">Cordiali saluti,<br>Il Team QoffeRun</p>
            <p style="margin: 15px 0 0 0; color: #ccc; font-size: 0.8em;">© {{ date('Y') }} QoffeRun - Piattaforma digitale per bar e caffetterie</p>
        </div>
    </div>
</body>
</html>