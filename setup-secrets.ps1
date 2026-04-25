# Recruitation-AI -- Firebase Secrets Setup
# Run once to add all API keys to Firebase Secret Manager.
# Press Enter to skip any key you want to add later.

$secrets = @(
    @{ Name = "GEMINI_API_KEY";     Desc = "Google Gemini API key";                            Link = "https://aistudio.google.com/app/apikey" },
    @{ Name = "ANTHROPIC_API_KEY";  Desc = "Anthropic Claude API key (hiring recommendation)"; Link = "https://console.anthropic.com/settings/keys" },
    @{ Name = "GROQ_API_KEY";       Desc = "Groq API key (generates tailored questions)";      Link = "https://console.groq.com/keys" },
    @{ Name = "GOOGLE_CSE_KEY";     Desc = "Google Cloud API key (Custom Search)";             Link = "https://console.cloud.google.com/apis/credentials" },
    @{ Name = "GOOGLE_CSE_ID";      Desc = "Google CSE ID -- the cx= value (yours: d5eaa1f8999ce4bac)"; Link = "https://programmablesearchengine.google.com/controlpanel/all" },
    @{ Name = "RESEND_API_KEY";     Desc = "Resend API key (sends emails to candidates)";      Link = "https://resend.com/api-keys" },
    @{ Name = "ELEVENLABS_API_KEY"; Desc = "ElevenLabs API key (transcripts + audio)";        Link = "https://elevenlabs.io/app/settings/api-keys" },
    @{ Name = "APP_URL";            Desc = "Your public URL e.g. https://recruitation.io";     Link = "(your domain)" }
)

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Recruitation-AI -- Firebase Secrets Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to SKIP a key and add it later." -ForegroundColor Yellow
Write-Host ""

$set  = 0
$skip = 0
$fail = 0

foreach ($s in $secrets) {
    Write-Host "--------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  Secret : $($s.Name)" -ForegroundColor White
    Write-Host "  What   : $($s.Desc)" -ForegroundColor Gray
    Write-Host "  Link   : $($s.Link)" -ForegroundColor DarkCyan
    Write-Host ""

    $value = Read-Host "  Paste $($s.Name) (blank = skip)"

    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "  Skipped." -ForegroundColor Yellow
        $skip++
    } else {
        Write-Host "  Setting in Firebase..." -ForegroundColor Gray

        $value | firebase functions:secrets:set $s.Name --force 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Set!" -ForegroundColor Green
            $set++
        } else {
            Write-Host "  FAILED -- run 'firebase login' then 'firebase use recruitation-c64a9' and try again." -ForegroundColor Red
            $fail++
        }
    }
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Done.  Set: $set   Skipped: $skip   Failed: $fail" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if ($set -gt 0) {
    Write-Host "Next: deploy functions to pick up the new secrets:" -ForegroundColor White
    Write-Host "  firebase deploy --only functions" -ForegroundColor Yellow
    Write-Host ""
}

if ($skip -gt 0) {
    Write-Host "Re-run this script any time to fill in the skipped keys." -ForegroundColor Yellow
    Write-Host ""
}
