Param(
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release"
)

throw @"
Le flux MSI/WiX est desactive.

Utilisez a la place :
  powershell -ExecutionPolicy Bypass -File "Vigitemp agent/installer/Prepare-AgentBuild.ps1" -Configuration $Configuration

Sortie produite :
  VigiSensysAgentSetup.exe
"@
