========================================
📅 QoffeRun - Nuovo Turno Assegnato
========================================

Ciao {{ $staffName }}!

Sei stato assegnato a un nuovo turno per {{ $shiftDate }}.

DETTAGLI DEL TURNO
------------------
Filiale: {{ $branchName }}
Catena: {{ $chainName }}
Data: {{ $shiftDate }}
Tipo Turno: {{ $shiftType }}
Orario: {{ $shiftTime }}

INFORMAZIONI FILIALE
--------------------
Indirizzo: {{ $branchAddress }}
@if($branchPhone !== 'Non specificato')
Telefono: {{ $branchPhone }}
@endif

@if($shiftNotes)
NOTE DEL TURNO
--------------
{{ $shiftNotes }}
@endif

ACCESSO AL PANNELLO
------------------
Collegati a: {{ $loginUrl }}
per controllare tutti i tuoi turni e gestire le tue attività.

PROMEMORIA
----------
⚠️ Ricordati di presentarti puntuale per il tuo turno.
Puoi controllare tutti i tuoi turni assegnati nel pannello di gestione.

SUPPORTO
--------
Se hai domande sui tuoi turni o problemi con l'accesso al pannello:
Email Supporto: {{ $supportEmail }}

Buon lavoro con il tuo nuovo turno! 💪

========================================
QoffeRun © {{ $currentYear }}
Supporto: {{ $supportEmail }}
Website: https://qofferun.com
========================================