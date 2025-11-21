<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuovo Turno Assegnato - QoffeRun</title>
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
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
        .shift-banner {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-align: center;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        .shift-banner h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .shift-banner .date {
            font-size: 18px;
            font-weight: 600;
        }
        .shift-details {
            background: #f0f9ff;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #3b82f6;
        }
        .shift-details h3 {
            margin: 0 0 20px 0;
            color: #1e40af;
            font-size: 20px;
            display: flex;
            align-items: center;
        }
        .shift-details h3::before {
            content: "🕐";
            margin-right: 10px;
            font-size: 24px;
        }
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .detail-item {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border: 2px solid #e5e7eb;
        }
        .detail-item .icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .detail-item .label {
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 5px;
        }
        .detail-item .value {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
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
        .cta-button {
            display: block;
            width: fit-content;
            margin: 30px auto;
            padding: 15px 30px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background: #1d4ed8;
        }
        .notes-section {
            background: #fffbeb;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .notes-section h4 {
            margin: 0 0 10px 0;
            color: #d97706;
            font-size: 16px;
        }
        .footer {
            background: #2d3748;
            color: white;
            padding: 25px;
            text-align: center;
            font-size: 14px;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .reminder-box {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .reminder-box .icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        @media (max-width: 600px) {
            .content {
                padding: 20px;
            }
            .detail-grid {
                grid-template-columns: 1fr;
            }
            .info-row {
                flex-direction: column;
            }
            .info-value {
                text-align: left;
                max-width: 100%;
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>📅 QoffeRun</h1>
            <p class="subtitle">Nuovo Turno Assegnato</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Shift Banner -->
            <div class="shift-banner">
                <h2>Ciao {{ $staffName }}!</h2>
                <p>Sei stato assegnato a un nuovo turno</p>
                <div class="date">{{ $shiftDate }}</div>
            </div>

            <!-- Shift Details -->
            <div class="shift-details">
                <h3>Dettagli del Turno</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="icon">📍</div>
                        <div class="label">Filiale</div>
                        <div class="value">{{ $branchName }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="icon">🏢</div>
                        <div class="label">Catena</div>
                        <div class="value">{{ $chainName }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="icon">⏰</div>
                        <div class="label">Tipo Turno</div>
                        <div class="value">{{ $shiftType }}</div>
                    </div>
                    <div class="detail-item">
                        <div class="icon">🕐</div>
                        <div class="label">Orario</div>
                        <div class="value">{{ $shiftTime }}</div>
                    </div>
                </div>
            </div>

            <!-- Branch Information -->
            <div class="info-card">
                <h3 data-icon="🏪">Informazioni Filiale</h3>
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
            </div>

            <!-- Notes Section -->
            @if($shiftNotes)
            <div class="notes-section">
                <h4>📝 Note del Turno</h4>
                <p>{{ $shiftNotes }}</p>
            </div>
            @endif

            <!-- Access Button -->
            <a href="{{ $loginUrl }}" class="cta-button">
                🖥️ Accedi al Pannello Bar
            </a>

            <!-- Reminder -->
            <div class="reminder-box">
                <div class="icon">⚠️</div>
                <h4>Promemoria</h4>
                <p>Ricordati di presentarti puntuale per il tuo turno. Puoi controllare tutti i tuoi turni assegnati nel pannello di gestione.</p>
            </div>

            <!-- Support -->
            <div class="info-card">
                <h3 data-icon="💬">Hai bisogno di aiuto?</h3>
                <p>Se hai domande sui tuoi turni o problemi con l'accesso al pannello:</p>
                <div class="info-row">
                    <span class="info-label">Email Supporto:</span>
                    <span class="info-value">
                        <a href="mailto:{{ $supportEmail }}" style="color: #3b82f6; text-decoration: none;">{{ $supportEmail }}</a>
                    </span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Buon lavoro con il tuo nuovo turno! 💪</p>
            <p>
                <a href="https://qofferun.com">QoffeRun</a> © {{ $currentYear }} - 
                <a href="mailto:{{ $supportEmail }}">Supporto</a>
            </p>
        </div>
    </div>
</body>
</html>