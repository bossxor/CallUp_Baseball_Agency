$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot
$sdk = $env:ANDROID_SDK_ROOT
if (!$sdk) { $sdk = $env:ANDROID_HOME }
if (!$sdk) { $sdk = 'C:/Android/Sdk' }
$platform = Join-Path $sdk 'platforms/android-35/android.jar'
$tools = Join-Path $sdk 'build-tools/35.0.0'
if (!(Test-Path -LiteralPath $platform) -or !(Test-Path -LiteralPath "$tools/aapt2.exe")) {
    throw 'Android SDK platform 35 and Build Tools 35.0.0 are required.'
}
$keystore = Join-Path $env:USERPROFILE '.android/debug.keystore'
if (!(Test-Path -LiteralPath $keystore)) {
    New-Item -ItemType Directory -Force (Split-Path $keystore) | Out-Null
    keytool -genkeypair -keystore $keystore -storepass android -keypass android -alias androiddebugkey -dname 'CN=Android Debug,O=Android,C=US' -keyalg RSA -keysize 2048 -validity 10000
    if ($LASTEXITCODE) { throw 'Debug signing key setup failed.' }
}

Push-Location $repo
try {
    npm run build
    if ($LASTEXITCODE) { throw 'Web build failed.' }
    $work = Join-Path $repo ('build/android-' + [guid]::NewGuid().ToString('N'))
    $classes = Join-Path $work 'classes'
    $dex = Join-Path $work 'dex'
    New-Item -ItemType Directory -Force $classes,$dex | Out-Null
    javac --release 11 -encoding UTF-8 -cp $platform -d $classes (Join-Path $repo 'android/MainActivity.java')
    if ($LASTEXITCODE) { throw 'Android Java compilation failed.' }
    $classFiles = @((Get-ChildItem -LiteralPath $classes -Recurse -Filter '*.class').FullName)
    & "$tools/d8.bat" --lib $platform --min-api 30 --output $dex @classFiles
    if ($LASTEXITCODE) { throw 'DEX compilation failed.' }
    $unsigned = Join-Path $work 'unsigned.apk'
    $aligned = Join-Path $work 'aligned.apk'
    $release = Join-Path $repo 'build/callup-debug.apk'
    & "$tools/aapt2.exe" link -I $platform --manifest (Join-Path $repo 'android/AndroidManifest.xml') -A (Join-Path $repo 'dist') -o $unsigned
    if ($LASTEXITCODE) { throw 'Android asset packaging failed.' }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [IO.Compression.ZipFile]::Open($unsigned, [IO.Compression.ZipArchiveMode]::Update)
    try {
        [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Join-Path $dex 'classes.dex'), 'classes.dex')
    } finally {
        $zip.Dispose()
    }
    & "$tools/zipalign.exe" -f 4 $unsigned $aligned
    if ($LASTEXITCODE) { throw 'APK alignment failed.' }
    & "$tools/apksigner.bat" sign --ks $keystore --ks-key-alias androiddebugkey --ks-pass pass:android --out $release $aligned
    if ($LASTEXITCODE) { throw 'APK signing failed.' }
    & "$tools/apksigner.bat" verify $release
    if ($LASTEXITCODE) { throw 'APK verification failed.' }
    & "$tools/aapt.exe" dump badging $release | Select-String '^package:|^launchable-activity:'
    if ($LASTEXITCODE) { throw 'APK inspection failed.' }
    Write-Output $release
} finally {
    Pop-Location
}
