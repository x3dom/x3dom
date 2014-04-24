@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\he\bin\he" %*
) ELSE (
  node  "%~dp0\..\he\bin\he" %*
)