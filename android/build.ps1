$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
Set-Location (Split-Path $PSScriptRoot)
$sdk = Join-Path $env:LOCALAPPDATA 'Android/Sdk'
$bin = Join-Path $sdk 'build-tools/35.0.0'
$platform = Join-Path $sdk 'platforms/android-35/android.jar'
$build = '.build/android'
$assets = "$build/assets/public"
if (!(Test-Path dist/main.js)) { throw 'Run npm run build first.' }
New-Item -ItemType Directory -Force "$build/classes", "$build/res/drawable", "$assets/dist", "$assets/src/art" | Out-Null
Copy-Item index.html "$assets/index.html"
Copy-Item dist/game.js,dist/main.js,dist/club-deals.js,dist/korea.js,dist/draft.js,dist/cashbook.js,dist/support.js "$assets/dist/"
Copy-Item src/style.css "$assets/src/style.css"
Copy-Item src/art/stadium.jpg,src/art/players.jpg,src/art/office.jpg "$assets/src/art/"
@'
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="48dp" android:height="48dp" android:viewportWidth="48" android:viewportHeight="48">
    <path android:fillColor="#141C29" android:pathData="M0,0H48V48H0Z"/>
    <path android:fillColor="#FFB677" android:pathData="M10,9H38V29L24,42L10,29Z"/>
    <path android:fillColor="#202A38" android:pathData="M24,16H31L25,23H30L19,33L22,25H17Z"/>
</vector>
'@ | Set-Content -LiteralPath "$build/res/drawable/launcher.xml" -Encoding utf8
& "$bin/aapt2.exe" compile --dir "$build/res" -o "$build/resources.zip"
& "$bin/aapt2.exe" link -I $platform --manifest android/AndroidManifest.xml -o "$build/resources.apk" "$build/resources.zip"
javac -encoding UTF-8 -source 8 -target 8 -classpath $platform -d "$build/classes" android/MainActivity.java
$classes = @(Get-ChildItem "$build/classes" -Recurse -Filter '*.class' | ForEach-Object FullName)
& "$bin/d8.bat" --min-api 32 --lib $platform --output $build @classes
Add-Type -AssemblyName System.IO.Compression
$archive = [IO.Compression.ZipFile]::Open((Join-Path $PWD "$build/resources.apk"), [IO.Compression.ZipArchiveMode]::Update)
try {
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,
        (Join-Path $PWD "$build/classes.dex"), 'classes.dex') | Out-Null
    $base = (Resolve-Path $build).Path
    foreach ($asset in Get-ChildItem -LiteralPath "$build/assets" -Recurse -File) {
        $name = [IO.Path]::GetRelativePath($base, $asset.FullName).Replace('\','/')
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $asset.FullName, $name) | Out-Null
    }
} finally { $archive.Dispose() }
& "$bin/zipalign.exe" -f 4 "$build/resources.apk" "$build/aligned.apk"
& "$bin/apksigner.bat" sign --ks debug.keystore --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android --out CallUp-Prototype.apk "$build/aligned.apk"
& "$bin/apksigner.bat" verify --verbose CallUp-Prototype.apk
