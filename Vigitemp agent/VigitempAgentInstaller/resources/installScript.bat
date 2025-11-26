
@echo OFF

:: Function to check if a string is a valid IPv4 address
SETLOCAL ENABLEDELAYEDEXPANSION

FOR /F "tokens=* USEBACKQ" %%F IN (`reg query "hklm\system\controlset001\control\nls\language" /v Installlanguage`) DO (
SET var=%%F
)
FOR %%A IN (%var%) DO (
SET language=%%A
)
SET ip_address_string="IPv4 Address"



FOR /F "tokens=16 delims= " %%F IN ('ipconfig ^| findstr "Adresse IPv4"') DO (
    SET ipAdress=%%F
)
CALL :check_ip %ipAdress%
::pause
if %result% ==1 GOTO :nesth_commands

FOR /F "tokens=14 delims= " %%F IN ('ipconfig ^| findstr "IPv4 Address"') DO (
    SET ipAdress=%%F
)
CALL :check_ip %ipAdress%
::pause
if %result% ==1 GOTO :nesth_commands



:nesth_commands
::pause
if "%language%" == "040C" (
	ECHO FR
	netsh http delete urlacl url="http://%ipAdress%:8000/"
	netsh http add urlacl url="http://%ipAdress%:8000/" user="Tout le monde"
)
if "%language%" == "0409" (
	ECHO EN
	netsh http delete urlacl url="http://%ipAdress%:8000/"
	netsh http add urlacl url="http://%ipAdress%:8000/" user="Everyone"
)

::ECHO The script is located at: %~dp0
::ECHO %~dp0getServerIP.exe

:: Capture output into a variable
::FOR /F "tokens=* USEBACKQ " %%F IN (`"%~dp0getServerIP.exe"`) DO (
::    SET serverIP=%%F
::)

::ECHO Output: %serverIP%
::pause

netsh advfirewall firewall delete rule name="Vigitemp receive from server" dir=in
netsh advfirewall firewall delete rule name="Vigitemp send to server" dir=out

::netsh advfirewall firewall add rule name="Vigitemp receive from server" dir=in action=allow protocol=ANY remoteip=%serverIP%
netsh advfirewall firewall add rule name="Vigitemp receive from server" dir=in action=allow protocol=ANY remoteip=%1
::netsh advfirewall firewall add rule name="Vigitemp send to server" dir=out action=allow protocol=ANY remoteip=%serverIP%
netsh advfirewall firewall add rule name="Vigitemp send to server" dir=out action=allow protocol=ANY remoteip=%1

::pause

start /d "%~dp0" VigitempAgent.exe

::pause

GOTO :EOF


:check_ip
    SET stringToCheck=%1

    :: Use a FOR loop to split the string by dots and count segments
    FOR /F "tokens=1,2,3,4 delims=." %%A IN ("%stringToCheck%") DO (
        SET octet1=%%A
        SET octet2=%%B
        SET octet3=%%C
        SET octet4=%%D
    )

    :: Check if the string has 4 segments
    IF NOT "%octet1%"=="" (
        IF NOT "%octet2%"=="" (
            IF NOT "%octet3%"=="" (
                IF NOT "%octet4%"=="" (
                    CALL :ValidateOctet !octet1!
                    IF ERRORLEVEL 1 GOTO InvalidIP
                    CALL :ValidateOctet !octet2!
                    IF ERRORLEVEL 1 GOTO InvalidIP
                    CALL :ValidateOctet !octet3!
                    IF ERRORLEVEL 1 GOTO InvalidIP
                    CALL :ValidateOctet !octet4!
                    IF ERRORLEVEL 1 GOTO InvalidIP

                    ECHO The string contains a valid IPv4 address.
                    ::pause
                    set result=1
                    EXIT /B 
                )
            )
        )
    )

    :InvalidIP
    ECHO The string does not contain a valid IPv4 address.
    set result=0
    EXIT /B 

    :: Function to validate each octet (0-255)
    :ValidateOctet
    SET octet=%1

    :: Check if the octet is a number between 0 and 255
    FOR /F "delims=0123456789" %%A IN ("%octet%") DO (
        set result=1
        EXIT /B 
    )

    IF %octet% GTR 255 (
        set result=0
        EXIT /B 
    ) ELSE IF %octet% LSS 0 (
        set result=0
        EXIT /B 
    ) ELSE (
        set result=1
        EXIT /B 
    )