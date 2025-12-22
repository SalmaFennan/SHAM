<#
Fichier: api_tests.ps1
Description: Tests complets pour l'API GymManager
#>

$BASE_URL = "http://localhost:3000"
$HEADERS = @{"Content-Type" = "application/json"}

# Fonction pour afficher les résultats
function Show-Result {
    param($success, $message, $data)
    $color = if ($success) { "Green" } else { "Red" }
    Write-Host "▶ $message" -ForegroundColor $color
    if ($data) { $data | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Cyan }
}

# 1. Test de connexion amélioré
try {
    $response = Invoke-RestMethod "$BASE_URL/api/members" -ErrorAction Stop
    Show-Result $true "API accessible - $($response.Count) membres trouvés"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Show-Result $false "Erreur $statusCode - Vérifiez que:"
    Write-Host "• Le serveur est lancé (npm run dev)" -ForegroundColor Yellow
    Write-Host "• Le fichier app.js configure bien les routes" -ForegroundColor Yellow
    Write-Host "• La base de données est connectée" -ForegroundColor Yellow
    exit
}

# 2. Tests CRUD pour les membres
Write-Host "`n=== TESTS MEMBRES ===" -ForegroundColor Magenta

$testMember = @{
    nom = "Dupont"
    prenom = "Jean"
    email = "jean.dupont@gym.com"
    telephone = "0612345678"
    date_adhesion = (Get-Date -Format "yyyy-MM-dd")
    date_expiration = (Get-Date).AddMonths(6).ToString("yyyy-MM-dd")
    type_adhesion = "prime"
    statut = "actif"
}

try {
    # CREATE
    $created = Invoke-RestMethod "$BASE_URL/api/members" -Method Post -Body ($testMember | ConvertTo-Json) -Headers $HEADERS
    Show-Result $true "Membre créé" $created

    # READ
    $member = Invoke-RestMethod "$BASE_URL/api/members/$($created.id)" -Headers $HEADERS
    Show-Result $true "Membre récupéré" $member

    # UPDATE
    $updateData = @{ prenom = "Jean-Paul"; type_adhesion = "premium" }
    $updated = Invoke-RestMethod "$BASE_URL/api/members/$($created.id)" -Method Put -Body ($updateData | ConvertTo-Json) -Headers $HEADERS
    Show-Result $true "Membre mis à jour" $updated

    # RENOUVELLEMENT
    $renewalData = @{ expirationDate = (Get-Date).AddMonths(8).ToString("yyyy-MM-dd") }
    $renewed = Invoke-RestMethod "$BASE_URL/api/members/$($created.id)/simple-renewal" -Method Post -Body ($renewalData | ConvertTo-Json) -Headers $HEADERS
    Show-Result $true "Adhésion renouvelée" $renewed

} catch {
    Show-Result $false "Erreur membres: $($_.Exception.Message)"
}

# 3. Tests employés
Write-Host "`n=== TESTS EMPLOYÉS ===" -ForegroundColor Magenta

$testEmployee = @{
    nom = "Martin"
    prenom = "Sophie"
    email = "sophie.martin@gym.com"
    poste = "Formateur Yoga"
    salaire = 2500
    date_embauche = (Get-Date -Format "yyyy-MM-dd")
    statut = "actif"
}

try {
    # CREATE
    $employee = Invoke-RestMethod "$BASE_URL/api/employees" -Method Post -Body ($testEmployee | ConvertTo-Json) -Headers $HEADERS
    Show-Result $true "Employé créé" $employee

    # PRÉSENCE - Check-in
    $checkin = Invoke-RestMethod "$BASE_URL/api/attendance/checkin/$($employee.id)" -Method Post -Headers $HEADERS
    Show-Result $true "Check-in enregistré" $checkin

    # Attendre 2 secondes (simule une séance de sport)
    Start-Sleep -Seconds 2

    # PRÉSENCE - Check-out
    $checkout = Invoke-RestMethod "$BASE_URL/api/attendance/checkout/$($employee.id)" -Method Post -Headers $HEADERS
    Show-Result $true "Check-out enregistré" $checkout

    # STATS TABLEAU DE BORD
    $dashboard = Invoke-RestMethod "$BASE_URL/api/employees/stats/dashboard" -Headers $HEADERS
    Show-Result $true "Statistiques employés" $dashboard

} catch {
    Show-Result $false "Erreur employés: $($_.Exception.Message)"
}

# 4. Tests financiers
Write-Host "`n=== TESTS FINANCIERS ===" -ForegroundColor Magenta

$testTransaction = @{
    type = "adhésion"
    montant = 80
    membre_id = $created.id
    description = "Paiement mensuel"
}

try {
    # CREATE TRANSACTION
    $transaction = Invoke-RestMethod "$BASE_URL/api/finances" -Method Post -Body ($testTransaction | ConvertTo-Json) -Headers $HEADERS
    Show-Result $true "Transaction créée" $transaction

    # OVERVIEW FINANCIER
    $overview = Invoke-RestMethod "$BASE_URL/api/finances/overview" -Headers $HEADERS
    Show-Result $true "Aperçu financier" $overview

} catch {
    Show-Result $false "Erreur finances: $($_.Exception.Message)"
}

# 5. Nettoyage (optionnel)
try {
    if ($created.id) {
        Invoke-RestMethod "$BASE_URL/api/members/$($created.id)" -Method Delete -Headers $HEADERS | Out-Null
        Show-Result $true "Membre de test supprimé"
    }
    if ($employee.id) {
        Invoke-RestMethod "$BASE_URL/api/employees/$($employee.id)" -Method Delete -Headers $HEADERS | Out-Null
        Show-Result $true "Employé de test supprimé"
    }
} catch {
    Write-Host "⚠️ Attention: Nettoyage partiel - certains éléments de test n'ont pas pu être supprimés" -ForegroundColor Yellow
}

Write-Host "`n=== TESTS TERMINÉS ===" -ForegroundColor Magenta