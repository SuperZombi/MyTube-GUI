; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{D4F2B9A2-8809-43BF-B170-9F0B52508B00}
AppName=MyTube Downloader
AppVersion=0.7.1
;AppVerName=MyTube Downloader 0.7.1
AppPublisher=Super Zombi
AppPublisherURL=https://github.com/SuperZombi/MyTube-GUI
AppSupportURL=https://github.com/SuperZombi/MyTube-GUI
AppUpdatesURL=https://github.com/SuperZombi/MyTube-GUI
DefaultDirName={autopf}\MyTube Downloader
; "ArchitecturesAllowed=x64compatible" specifies that Setup cannot run
; on anything but x64 and Windows 11 on Arm.
ArchitecturesAllowed=x64compatible
; "ArchitecturesInstallIn64BitMode=x64compatible" requests that the
; install be done in "64-bit mode" on x64 or Windows 11 on Arm,
; meaning it should use the native 64-bit Program Files directory and
; the 64-bit view of the registry.
ArchitecturesInstallIn64BitMode=x64compatible
DefaultGroupName=MyTube Downloader
AllowNoIcons=yes
; Remove the following line to run in administrative install mode (install for all users.)
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=C:\Users\rost\Downloads
OutputBaseFilename=mytube_setup
SetupIconFile=C:\Users\rost\Python\MyTube Downloader\GUI\build\icon.ico
UninstallDisplayIcon=C:\Users\rost\Python\MyTube Downloader\GUI\build\icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"
Name: "ukrainian"; MessagesFile: "compiler:Languages\Ukrainian.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "C:\Users\rost\Python\auto-py-to-exe-master\output\MyTube Downloader\MyTube Downloader.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\rost\Python\auto-py-to-exe-master\output\MyTube Downloader\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\MyTube Downloader"; Filename: "{app}\MyTube Downloader.exe"
Name: "{group}\{cm:UninstallProgram,MyTube Downloader}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\MyTube Downloader"; Filename: "{app}\MyTube Downloader.exe"; Tasks: desktopicon

[UninstallDelete]
Type: files; Name: "{app}\app.settings.json"
Type: files; Name: "{app}\cookies.json"
Type: filesandordirs; Name: "{userappdata}\MyTube"

[Run]
Filename: "{app}\MyTube Downloader.exe"; Description: "{cm:LaunchProgram,MyTube Downloader}"; Flags: nowait postinstall skipifsilent
