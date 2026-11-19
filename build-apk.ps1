# Construit Mirindra.apk (APK de debug, installable directement sur Android).
# Prerequis : Node, JDK 17 (deja presents) + SDK Android dans %LOCALAPPDATA%\Android\Sdk.
# Usage :  powershell -ExecutionPolicy Bypass -File build-apk.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:JAVA_HOME = (Get-Command java).Source | Split-Path | Split-Path
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$sm = Join-Path $sdk 'cmdline-tools\latest\bin\sdkmanager.bat'
if (-not (Test-Path $sm)) { throw "sdkmanager introuvable : $sm" }

# 1) Licences Android : a accepter par TOI (tape "y" a chaque question) - une seule fois.
if (-not (Test-Path (Join-Path $sdk 'licenses\android-sdk-license'))) {
  Write-Host "Acceptation des licences du SDK Android (tape y puis Entree a chaque question)..." -ForegroundColor Yellow
  & $sm "--sdk_root=$sdk" --licenses
}

# 2) Composants du SDK
& $sm "--sdk_root=$sdk" "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# 3) Jeu web -> projet Android
npm install
npm run build
npx cap sync android
"sdk.dir=$($sdk -replace '\\','/')" | Set-Content -Encoding ascii android\local.properties

# 4) APK
Push-Location android
.\gradlew.bat assembleDebug
Pop-Location

$apk = 'android\app\build\outputs\apk\debug\app-debug.apk'
if (Test-Path $apk) {
  Copy-Item $apk 'Mirindra.apk' -Force
  Write-Host "APK pret : $PWD\Mirindra.apk" -ForegroundColor Green
} else { throw 'APK non genere.' }
