# setup-certs.ps1
# Trusted localhost certificates for Docker dev (Windows)
# Requires: PowerShell 5.1+

param (
    [string]$DomainList = "localhost 127.0.0.1 ::1",
    [string]$CertFile = "certif.pem",
    [string]$KeyFile = "certif-key.pem"
)

# Check if running as Administrator (needed for mkcert -install on Windows)
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "his script needs admin rights to install the mkcert CA." -ForegroundColor Yellow
    Write-Host "Restart PowerShell as Administrator and run again." -ForegroundColor Yellow
    exit 1
}

# Helper: Install mkcert via Scoop or Chocolatey
function Install-Mkcert {
    if (Get-Command mkcert -ErrorAction SilentlyContinue) {
        Write-Host "mkcert is already installed." -ForegroundColor Green
        return
    }

    Write-Host "mkcert not found. Installing..." -ForegroundColor Cyan

    # Try Scoop
    if (Get-Command scoop -ErrorAction SilentlyContinue) {
        Write-Host "Using Scoop to install mkcert..." -ForegroundColor Cyan
        scoop install mkcert
        return
    }

    # Try Chocolatey
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "Using Chocolatey to install mkcert..." -ForegroundColor Cyan
        choco install mkcert -y
        return
    }

    Write-Host "Neither Scoop nor Chocolatey found." -ForegroundColor Red
    Write-Host "Please install mkcert manually:" -ForegroundColor Yellow
    Write-Host "https://github.com/FiloSottile/mkcert#windows" -ForegroundColor Yellow
    exit 1
}

# Main
Write-Host "Setting up trusted localhost certificates..." -ForegroundColor Cyan

# Install mkcert if needed
Install-Mkcert

# Install local CA (this requires admin)
Write-Host "Installing mkcert CA into system trust store..." -ForegroundColor Cyan
mkcert -install

# Generate certificates
Write-Host "Generating certificates for: $DomainList" -ForegroundColor Cyan
mkcert $DomainList -cert-file $CertFile -key-file $KeyFile

if (Test-Path $CertFile -PathType Leaf -and Test-Path $KeyFile -PathType Leaf) {
    Write-Host "✅ Success! Certificates created:" -ForegroundColor Green
    Write-Host "   - $CertFile"
    Write-Host "   - $KeyFile"
} else {
    Write-Host "❌ Failed to generate certificates." -ForegroundColor Red
    exit 1
}