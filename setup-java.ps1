# Script para configurar JAVA_HOME no Windows
# Execute como Administrador: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Write-Host "Configurando JAVA_HOME..." -ForegroundColor Green

# Verificar se o JDK está instalado
$javaPaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Java\jdk-17*",
    "C:\Program Files\Android\Android Studio\jbr",
    "$env:LOCALAPPDATA\Programs\Android\Android Studio\jbr"
)

$jdkPath = $null
foreach ($path in $javaPaths) {
    $found = Get-ChildItem $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $jdkPath = $found.FullName
        Write-Host "JDK encontrado em: $jdkPath" -ForegroundColor Green
        break
    }
}

if (-not $jdkPath) {
    Write-Host "JDK não encontrado. Por favor, instale o JDK 17 primeiro." -ForegroundColor Red
    Write-Host "Download: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Yellow
    exit 1
}

# Configurar JAVA_HOME para a sessão atual
$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath\bin;$env:PATH"

# Configurar JAVA_HOME permanentemente
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkPath, [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkPath, [System.EnvironmentVariableTarget]::Machine)

# Adicionar ao PATH permanentemente
$currentPath = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User)
if ($currentPath -notlike "*$jdkPath\bin*") {
    [System.Environment]::SetEnvironmentVariable("PATH", "$currentPath;$jdkPath\bin", [System.EnvironmentVariableTarget]::User)
}

Write-Host "JAVA_HOME configurado para: $jdkPath" -ForegroundColor Green
Write-Host "Reinicie o terminal e execute: java -version" -ForegroundColor Yellow

