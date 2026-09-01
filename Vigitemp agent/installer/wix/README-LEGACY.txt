Le flux WiX/MSI est conserve uniquement a titre d'archive.

Flux actif :
- build agent
- emballage des ressources dans VigitempAgentInstaller/Payload
- generation d'un unique EXE : VigiSensysAgentSetup.exe

Commande a utiliser :
  powershell -ExecutionPolicy Bypass -File "Vigitemp agent/installer/Prepare-AgentBuild.ps1" -Configuration Release
