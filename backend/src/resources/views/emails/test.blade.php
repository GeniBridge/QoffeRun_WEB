<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Email QoffeRun</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            color: #ff6b35;
            border-bottom: 2px solid #ff6b35;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .content {
            text-align: center;
        }
        .success {
            color: #28a745;
            font-size: 18px;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🟠 QoffeRun</h1>
            <h2>Test Configurazione Email</h2>
        </div>
        
        <div class="content">
            <p class="success">✅ Email inviata con successo!</p>
            <p><strong>Messaggio:</strong> {{ $message_content }}</p>
            <p><strong>Data/Ora:</strong> {{ now()->format('d/m/Y H:i:s') }}</p>
            <p><strong>Server:</strong> {{ config('app.env') }}</p>
        </div>
        
        <div class="footer">
            <p>Questa è una email di test per verificare la configurazione SMTP di Aruba.</p>
            <p><strong>QoffeRun</strong> - La tua pausa caffè digitale</p>
            <p>📧 info@qofferun.com | 🌐 qofferun.com</p>
        </div>
    </div>
</body>
</html>