<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password QoffeRun</title>
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
        .reset-info {
            background-color: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
        }
        .security-info {
            background-color: #f8d7da;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #dc3545;
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
            padding: 15px 30px;
            background-color: #dc3545;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            font-size: 1.1em;
        }
        .token-box {
            background-color: #f8f9fa;
            border: 2px dashed #6c757d;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            font-family: monospace;
            font-size: 1.2em;
            margin: 15px 0;
            word-break: break-all;
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
            <h1>Reset Password</h1>
        </div>

        <p>Gentile <strong>{{ $userName }}</strong>,</p>
        
        <p>abbiamo ricevuto una richiesta di reset della password per il suo account del pannello QoffeRun per il bar <strong>{{ $barName }}</strong>.</p>

        <div class="reset-info">
            <h3 style="color: #856404; margin: 0 0 15px 0;">🔑 Reset della password</h3>
            <p style="color: #856404; margin: 0 0 15px 0;">
                Per procedere con il reset della password, clicchi sul pulsante sottostante oppure copi il link nel suo browser.
            </p>
            <p style="color: #856404; margin: 0; font-size: 0.9em;">
                <strong>Questo link scadrà il:</strong> {{ $expiresAt }}
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $resetUrl }}" class="button">Cambia Password</a>
        </div>

        <p style="margin: 20px 0; font-size: 0.9em; color: #666;">
            Se il pulsante non funziona, copi e incolli questo link nel suo browser:
        </p>
        
        <div class="token-box">
            {{ $resetUrl }}
        </div>

        <div class="security-info">
            <h3 style="color: #721c24; margin: 0 0 10px 0;">⚠️ Importante</h3>
            <p style="color: #721c24; margin: 0; line-height: 1.5;">
                Se non ha richiesto lei questo reset, può ignorare questa email. La sua password rimarrà invariata. 
                Se ha dubbi sulla sicurezza del suo account, la preghiamo di contattare il nostro supporto.
            </p>
        </div>

        <div class="footer">
            <p style="margin: 8px 0;">Per assistenza tecnica: <a href="mailto:info@qofferun.com" style="color: #ff6b35;">info@qofferun.com</a></p>
            <p style="margin: 8px 0; color: #999;">Cordiali saluti,<br>Il Team QoffeRun</p>
            <p style="margin: 15px 0 0 0; color: #ccc; font-size: 0.8em;">© {{ date('Y') }} QoffeRun - Piattaforma digitale per bar e caffetterie</p>
        </div>
    </div>
</body>
</html>