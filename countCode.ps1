# Definition of extensions and languages
$extensionMap = @{
    ".java" = "Java"
    ".js"   = "JavaScript"
    ".ts"   = "TypeScript"
    ".tsx"  = "React TypeScript"
    ".jsx"  = "React JavaScript"
    ".py"   = "Python"
    ".html" = "HTML"
    ".css"  = "CSS"
}

# Folders to exclude (Regex)
$excludeFolders = "node_modules|bin|obj|dist|build|.git"

# Scanning, filtering, and counting
$results = Get-ChildItem -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch $excludeFolders -and 
        $extensionMap.ContainsKey($_.Extension) 
    } | 
    ForEach-Object {
        try {
            $content = Get-Content $_.FullName -ErrorAction SilentlyContinue
            if ($null -ne $content) {
                $lines = ($content | Measure-Object -Line).Lines
                [PSCustomObject]@{
                    Language = $extensionMap[$_.Extension]
                    Lines    = $lines
                }
            }
        } catch {
            # Skip locked files
        }
    }

# Display the summary table
if ($results) {
    $results | Group-Object Language | Select-Object `
        @{Name="Language"; Expression={$_.Name}}, 
        @{Name="TotalLines"; Expression={($_.Group | Measure-Object Lines -Sum).Sum}},
        @{Name="FileCount"; Expression={$_.Count}} | 
        Sort-Object "TotalLines" -Descending | 
        Format-Table -AutoSize
} else {
    Write-Host "No matching files found with the specified extensions." -ForegroundColor Yellow
}