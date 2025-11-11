<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benvenuto su QoffeRun</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
        .welcome-text {
            font-size: 1.2em;
            color: #666;
            margin-bottom: 30px;
        }
        .bar-info {
            background-color: #fff5f3;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ff6b35;
            margin: 20px 0;
        }
        .next-steps {
            background-color: #f0f8ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
            margin: 20px 0;
        }
        .step {
            margin: 10px 0;
            padding-left: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 0.9em;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ff6b35;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
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
            <h1>Benvenuto su QoffeRun</h1>
        </div>

                <div class="welcome-text">
            Gentile <strong>{{ $gestoreName }}</strong>,<br>
            <br>
            la ringraziamo per aver scelto QoffeRun. La registrazione del locale <strong>{{ $barName }}</strong> è stata completata con successo.
        </div>

        <div class="bar-info">
            <h2 style="color: #333; font-size: 1.2em; margin-bottom: 15px;">📍 Riepilogo registrazione</h2>
            <p><strong>Locale:</strong> {{ $barName }}</p>
            <p><strong>Località:</strong> {{ $barCity }}</p>
            <p><strong>Data registrazione:</strong> {{ date('d/m/Y H:i') }}</p>
        </div>

        <div class="next-steps">
            <h2 style="color: #333; font-size: 1.2em; margin-bottom: 15px;">� Attivazione del servizio</h2>
            <p style="margin-bottom: 20px;">Per rendere operativo il suo locale sulla piattaforma QoffeRun, è necessario completare i seguenti passaggi:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <div class="step">1. Configurazione pagamenti Stripe</div>
                <div class="step">2. Impostazione sistema di fatturazione</div>
                <div class="step">3. Inserimento orari di apertura del locale</div>
                <div class="step">4. Caricamento catalogo prodotti (minimo 5 articoli)</div>
            </div>
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 25px 0;">
            <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 1.1em;">⚠️ Nota importante</h3>
            <p style="color: #856404; margin: 0; line-height: 1.5;">
                Il locale sarà visibile nell'applicazione QoffeRun solo dopo aver completato tutti i passaggi di configurazione sopra elencati.
            </p>
        </div>

        <div style="text-align: center; margin: 35px 0;">
            <p style="margin-bottom: 20px; color: #555;">Acceda al pannello di gestione per iniziare la configurazione:</p>
            <a href="https://bar.qofferun.com" class="button" style="font-weight: 600;">Accedi al Pannello Gestionale</a>
        </div>

        <div class="footer" style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px;">
            <p style="margin: 8px 0; font-size: 0.9em;">Per assistenza tecnica: <a href="mailto:info@qofferun.com" style="color: #ff6b35;">info@qofferun.com</a></p>
            <p style="margin: 8px 0; color: #999; font-size: 0.85em;">Cordiali saluti,<br>Il Team QoffeRun</p>
            <p style="margin: 15px 0 0 0; color: #ccc; font-size: 0.8em;">© {{ date('Y') }} QoffeRun - Piattaforma digitale per bar e caffetterie</p>
        </div>
    </div>
</body>
</html>