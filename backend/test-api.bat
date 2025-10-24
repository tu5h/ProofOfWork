@echo off
echo 🧪 Testing Our ProofOfWork Backend API
echo ======================================

REM Check if server is running
echo 🔍 Checking if server is running...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server is not running. Please start it with 'npm run dev'
    pause
    exit /b 1
)

echo ✅ Server is running
echo.

echo 🚀 Running API Tests...
echo.

set passed=0
set total=0

REM Health check
echo Testing Health check...
curl -s -o nul -w "%%{http_code}" http://localhost:5000/health | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✓ PASS
    set /a passed+=1
) else (
    echo ✗ FAIL
)
set /a total+=1

REM Root endpoint
echo Testing Root endpoint...
curl -s -o nul -w "%%{http_code}" http://localhost:5000/ | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✓ PASS
    set /a passed+=1
) else (
    echo ✗ FAIL
)
set /a total+=1

REM Profiles endpoint
echo Testing Get profiles...
curl -s -o nul -w "%%{http_code}" http://localhost:5000/api/v1/profiles | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✓ PASS
    set /a passed+=1
) else (
    echo ✗ FAIL
)
set /a total+=1

REM Jobs endpoint
echo Testing Get jobs...
curl -s -o nul -w "%%{http_code}" http://localhost:5000/api/v1/jobs | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✓ PASS
    set /a passed+=1
) else (
    echo ✗ FAIL
)
set /a total+=1

REM Nearby jobs endpoint
echo Testing Get nearby jobs...
curl -s -o nul -w "%%{http_code}" "http://localhost:5000/api/v1/jobs/nearby?latitude=40.7589&longitude=-73.9851&radius=5000" | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✓ PASS
    set /a passed+=1
) else (
    echo ✗ FAIL
)
set /a total+=1

echo.
echo 📊 Test Results:
echo ================
echo Passed: %passed%/%total%

if %passed% equ %total% (
    echo 🎉 All tests passed! Our API is working correctly.
) else (
    echo ❌ Some tests failed. Check the output above.
)

pause
