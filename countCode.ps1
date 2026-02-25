$extensionMap = @{
    ".java" = "Java"
    ".js"   = "JavaScript"
    ".ts"   = "TypeScript"
    ".tsx"  = "React TS"
    ".jsx"  = "React JS"
    ".py"   = "Python"
    ".html" = "HTML"
    ".css"  = "CSS"
}

$excludeFolders = "node_modules|bin|obj|dist|build|.git"

$stats = @{}

$files = Get-ChildItem -Recurse -File | Where-Object { 
    $_.FullName -notmatch $excludeFolders -and 
    $extensionMap.ContainsKey($_.Extension) 
}

foreach ($file in $files) {
    $lang = $extensionMap[$file.Extension]
    
    if (-not $stats.ContainsKey($lang)) {
        $stats[$lang] = @{ Files = 0; Total = 0; Code = 0; Comments = 0; Blank = 0 }
    }
    
    $stats[$lang].Files++

    try {
        $lines = Get-Content $file.FullName -ErrorAction SilentlyContinue
        if ($null -ne $lines) {
            $stats[$lang].Total += $lines.Count
            
            foreach ($line in $lines) {
                $trimmed = $line.Trim()
                if ($trimmed -eq "") {
                    $stats[$lang].Blank++
                } elseif ($trimmed.StartsWith("//") -or $trimmed.StartsWith("/*") -or $trimmed.StartsWith("*") -or $trimmed.StartsWith("#")) {
                    $stats[$lang].Comments++
                } else {
                    $stats[$lang].Code++
                }
            }
        }
    } catch {}
}

Write-Host ""
Write-Host "==================================================================================" -ForegroundColor White
Write-Host "                               Codebase Statistics                                " -ForegroundColor White
Write-Host "==================================================================================" -ForegroundColor White
Write-Host ""

if ($stats.Keys.Count -gt 0) {
    $results = foreach ($key in $stats.Keys) {
        [PSCustomObject]@{
            Language   = $key
            Files      = $stats[$key].Files
            TotalLines = $stats[$key].Total
            Code       = $stats[$key].Code
            Comments   = $stats[$key].Comments
            Blank      = $stats[$key].Blank
        }
    }
    
    $sorted = $results | Sort-Object TotalLines -Descending

    Write-Host "+------------------+---------+--------------+------------+------------+----------+" -ForegroundColor White
    Write-Host "| " -ForegroundColor White -NoNewline
    Write-Host ("{0,-16}" -f "Language") -ForegroundColor White -NoNewline
    Write-Host " | " -ForegroundColor White -NoNewline
    Write-Host ("{0,-7}" -f "Files") -ForegroundColor White -NoNewline
    Write-Host " | " -ForegroundColor White -NoNewline
    Write-Host ("{0,-12}" -f "Total Lines") -ForegroundColor White -NoNewline
    Write-Host " | " -ForegroundColor White -NoNewline
    Write-Host ("{0,-10}" -f "Code") -ForegroundColor White -NoNewline
    Write-Host " | " -ForegroundColor White -NoNewline
    Write-Host ("{0,-10}" -f "Comments") -ForegroundColor White -NoNewline
    Write-Host " | " -ForegroundColor White -NoNewline
    Write-Host ("{0,-8}" -f "Blank") -ForegroundColor White -NoNewline
    Write-Host " |" -ForegroundColor White

    Write-Host "+------------------+---------+--------------+------------+------------+----------+" -ForegroundColor White

    foreach ($row in $sorted) {
        Write-Host "| " -ForegroundColor White -NoNewline
        Write-Host ("{0,-16}" -f $row.Language) -ForegroundColor White -NoNewline
        Write-Host " | " -ForegroundColor White -NoNewline
        Write-Host ("{0,-7}" -f $row.Files) -ForegroundColor White -NoNewline
        Write-Host " | " -ForegroundColor White -NoNewline
        Write-Host ("{0,-12}" -f $row.TotalLines) -ForegroundColor White -NoNewline
        Write-Host " | " -ForegroundColor White -NoNewline
        Write-Host ("{0,-10}" -f $row.Code) -ForegroundColor White -NoNewline
        Write-Host " | " -ForegroundColor White -NoNewline
        Write-Host ("{0,-10}" -f $row.Comments) -ForegroundColor White -NoNewline
        Write-Host " | " -ForegroundColor White -NoNewline
        Write-Host ("{0,-8}" -f $row.Blank) -ForegroundColor White -NoNewline
        Write-Host " |" -ForegroundColor White
    }

    Write-Host "+------------------+---------+--------------+------------+------------+----------+" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host " No matching files found." -ForegroundColor White
    Write-Host ""
}