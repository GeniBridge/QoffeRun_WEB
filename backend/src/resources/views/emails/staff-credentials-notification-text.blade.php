========================================
🍕 QoffeRun - Benvenuto nel team!
========================================

Ciao {{ $staffName }}!

Sei stato aggiunto come {{ $roleName }} presso la filiale {{ $branchName }}.

INFORMAZIONI FILIALE
--------------------
Nome Filiale: {{ $branchName }}
Catena: {{ $chainName }}
Indirizzo: {{ $branchAddress }}
@if($branchPhone !== 'Non specificato')
Telefono: {{ $branchPhone }}
@endif
@if($branchEmail !== 'Non specificato')
Email: {{ $branchEmail }}
@endif

DATI DI ACCESSO
---------------
Utilizza queste credenziali per accedere al pannello di gestione:

Email: {{ $email }}
Password: {{ $password }}
@if($employeeCode !== 'Non assegnato')
Codice Dipendente: {{ $employeeCode }}
@endif

ACCESSO AL PANNELLO
------------------
Collegati a: {{ $loginUrl }}

@if(count($permissions) > 0)
I TUOI PERMESSI
---------------
Come {{ $roleName }}, hai accesso alle seguenti funzionalità:

@foreach($permissions as $permission)
- {{ $permission }}
@endforeach
@endif

SICUREZZA
---------
⚠️ IMPORTANTE: Ti consigliamo di cambiare la password al primo accesso. 
Vai su "Profilo" → "Sicurezza" → "Cambia Password" dopo aver effettuato il login.

SUPPORTO
--------
Se hai domande o problemi con l'accesso, contattaci a: {{ $supportEmail }}

Grazie per essere parte del team QoffeRun! 🎉

========================================
QoffeRun © {{ $currentYear }}
Supporto: {{ $supportEmail }}
Website: https://qofferun.com
========================================