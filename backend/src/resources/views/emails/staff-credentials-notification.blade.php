<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benvenuto in QoffeRun</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header .subtitle {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-section {
            text-align: center;
            margin-bottom: 35px;
        }
        .welcome-section h2 {
            color: #f97316;
            font-size: 24px;
            margin: 0 0 10px 0;
        }
        .role-badge {
            display: inline-block;
            background: #f97316;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin: 10px 0;
        }
        .info-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #f97316;
        }
        .info-card h3 {
            margin: 0 0 15px 0;
            color: #2d3748;
            font-size: 18px;
            display: flex;
            align-items: center;
        }
        .info-card h3::before {
            content: attr(data-icon);
            margin-right: 8px;
            font-size: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #4a5568;
        }
        .info-value {
            color: #2d3748;
            text-align: right;
            max-width: 60%;
            word-break: break-word;
        }
        .credentials-box {
            background: #2d3748;
            color: white;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        .credentials-box h3 {
            margin: 0 0 20px 0;
            color: #f97316;
        }
        .credential-item {
            margin: 15px 0;
            padding: 12px;
            background: rgba(255,255,255,0.1);
            border-radius: 6px;
        }
        .credential-label {
            font-size: 12px;
            text-transform: uppercase;
            opacity: 0.8;
            margin-bottom: 5px;
        }
        .credential-value {
            font-size: 18px;
            font-weight: 700;
            font-family: monospace;
            color: #f97316;
        }
        .cta-button {
            display: block;
            width: fit-content;
            margin: 30px auto;
            padding: 15px 30px;
            background: #f97316;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background: #ea580c;
        }
        .permissions-list {
            background: #f0f9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .permissions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 8px;
            margin-top: 15px;
        }
        .permission-item {
            padding: 8px 12px;
            background: white;
            border-radius: 6px;
            font-size: 14px;
            color: #2d3748;
            border-left: 3px solid #f97316;
        }
        .footer {
            background: #2d3748;
            color: white;
            padding: 25px;
            text-align: center;
            font-size: 14px;
        }
        .footer a {
            color: #f97316;
            text-decoration: none;
        }
        .security-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .security-note strong {
            color: #856404;
        }
        @media (max-width: 600px) {
            .content {
                padding: 20px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-value {
                text-align: left;
                max-width: 100%;
                margin-top: 5px;
            }
            .permissions-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🍕 QoffeRun</h1>
            <p class="subtitle">Benvenuto nel team!</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Welcome Section -->
            <div class="welcome-section">
                <h2>Ciao {{ $staffName }}!</h2>
                <p>Sei stato aggiunto come <strong>{{ $roleName }}</strong> presso:</p>
                <div class="role-badge">{{ $roleName }}</div>
            </div>

            <!-- Branch Information -->
            <div class="info-card">
                <h3 data-icon="🏪">Informazioni Filiale</h3>
                <div class="info-row">
                    <span class="info-label">Nome Filiale:</span>
                    <span class="info-value">{{ $branchName }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Catena:</span>
                    <span class="info-value">{{ $chainName }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Indirizzo:</span>
                    <span class="info-value">{{ $branchAddress }}</span>
                </div>
                @if($branchPhone !== 'Non specificato')
                <div class="info-row">
                    <span class="info-label">Telefono:</span>
                    <span class="info-value">{{ $branchPhone }}</span>
                </div>
                @endif
                @if($branchEmail !== 'Non specificato')
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ $branchEmail }}</span>
                </div>
                @endif
            </div>

            <!-- Login Credentials -->
            <div class="credentials-box">
                <h3>🔑 I tuoi dati di accesso</h3>
                <p>Utilizza queste credenziali per accedere al pannello di gestione:</p>
                
                <div class="credential-item">
                    <div class="credential-label">Email</div>
                    <div class="credential-value">{{ $email }}</div>
                </div>
                
                <div class="credential-item">
                    <div class="credential-label">Password</div>
                    <div class="credential-value">{{ $password }}</div>
                </div>
                
                @if($employeeCode !== 'Non assegnato')
                <div class="credential-item">
                    <div class="credential-label">Codice Dipendente</div>
                    <div class="credential-value">{{ $employeeCode }}</div>
                </div>
                @endif
            </div>

            <!-- Access Button -->
            <a href="{{ $loginUrl }}" class="cta-button">
                🚀 Accedi al Pannello Bar
            </a>

            <!-- Permissions -->
            @if(count($permissions) > 0)
            <div class="permissions-list">
                <h3>✅ I tuoi permessi</h3>
                <p>Come <strong>{{ $roleName }}</strong>, hai accesso alle seguenti funzionalità:</p>
                <div class="permissions-grid">
                    @foreach($permissions as $permission)
                    <div class="permission-item">{{ $permission }}</div>
                    @endforeach
                </div>
            </div>
            @endif

            <!-- Security Note -->
            <div class="security-note">
                <strong>⚠️ Importante per la sicurezza:</strong><br>
                Ti consigliamo di cambiare la password al primo accesso. Vai su "Profilo" → "Sicurezza" → "Cambia Password" dopo aver effettuato il login.
            </div>

            <!-- Support -->
            <div class="info-card">
                <h3 data-icon="💬">Hai bisogno di aiuto?</h3>
                <p>Se hai domande o problemi con l'accesso, non esitare a contattarci:</p>
                <div class="info-row">
                    <span class="info-label">Email Supporto:</span>
                    <span class="info-value">
                        <a href="mailto:{{ $supportEmail }}" style="color: #f97316; text-decoration: none;">{{ $supportEmail }}</a>
                    </span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Grazie per essere parte del team QoffeRun! 🎉</p>
            <p>
                <a href="https://qofferun.com">QoffeRun</a> © {{ $currentYear }} - 
                <a href="mailto:{{ $supportEmail }}">Supporto</a>
            </p>
        </div>
    </div>
</body>
</html>