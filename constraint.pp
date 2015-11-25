{$mode objfpc}
program constraint;
uses 
    {$ifdef unix}cthreads, cmem, {$endif}
    Classes,
    SysUtils,
    Process;

const PATH_SEPARATOR = {$ifdef win32}'\'{$else}'/'{$endif};
var   ENV_PATH: AnsiString;

function getApplicationDir(): AnsiString;
var s: AnsiString;
    i: Integer;
    len: Integer;
begin
    s := paramstr(0);
    len := length(s);
    result := PATH_SEPARATOR;
    for i := 1 to len do
    begin
        if s[i] = PATH_SEPARATOR then
            result := copy(s,1,i-1);
    end;
end;

function searchExecutable( exeNameWithoutExtension: AnsiString ): AnsiString;
var search_extensions: Array of AnsiString;
    i: integer;
    len: integer;
begin

    {$ifdef win32}

        setLength( search_extensions, 3 );
        search_extensions[0] := '';
        search_extensions[1] := '.exe';
        search_extensions[2] := '.com';
    {$else}
        setLength( search_extensions, 1 );
        search_extensions[0] := '';
    {$endif}

    result := '';

    len := Length( search_extensions );
    
    for i := 0 to len - 1 do
    begin
        result := ExeSearch( exeNameWithoutExtension + search_extensions[i], ENV_PATH );
        
        if ( not fileExists( result ) ) then
            result := '';

        if ( result <> '' ) then
            exit;
    end;

    result := '';

end;

var compilerSrc: AnsiString;
    nodejs: AnsiString;
    AProcess: TProcess;
    i: integer;
    bytesRead: Longint;
    bytesReadE: Longint;
    buffer : array[1..2048] of byte;
    exitCode: integer;

    appDir: AnsiString;
    currentDir: ansiString;

procedure die( message: AnsiString; const errorCode: Byte = 1 );
begin
    chdir( currentDir );
    writeln( stdErr, message );
    halt( errorCode );
end;

function expandPath( path: AnsiString ): AnsiString;
begin
    chdir( currentDir );
    result := ExpandFileName( path );
    chdir( appDir );
end;

function translateArgument( arg: AnsiString ): AnsiString;
begin
    result := arg;

    if copy( arg, 1, 6 ) = '--src:' then
    begin
        result := '--src:' + expandPath( copy( arg, 7, 512 ) );
    end else
    if copy( arg, 1, 14 ) = '--project-dir:' then
    begin
        result := '--project-dir:' + expandPath( copy( arg, 15, 512 ) );
    end;
end;


begin

    currentDir := getCurrentDir();
    appDir := getApplicationDir();

    chdir( appDir );

    ENV_PATH := sysutils.getEnvironmentVariable( 'PATH' );

    compilerSrc := getApplicationDir() + PATH_SEPARATOR + 'compiler.js';
    nodejs := searchExecutable( 'nodejs' );

    if nodejs = '' then
        nodejs := searchExecutable( 'node' );

    if nodejs = '' then
    begin
        die('Constraint compiler requires nodejs installed on your system.'#10#13'Please visit http://nodejs.org in order to obtain instructions about how to install it');
    end;

    if not fileExists( compilerSrc ) then
    begin
        die('Constraint compiler did not found file "' + compilerSrc + '". Compilation aborted' );
    end;
    
    if not fileExists( nodejs ) then
    begin
        die('Constraint compiler did not found nodejs executable at "' + nodejs + '". Compilation aborted' );
    end;

    AProcess := TProcess.create(nil);
    AProcess.executable := nodejs;

    AProcess.Parameters.Add( compilerSrc );

    for i := 1 to paramcount() do
        AProcess.Parameters.Add( translateArgument( paramstr(i) ) );
    
    AProcess.options := [ poUsePipes ];
    
    AProcess.Execute;
    
    repeat
    
        if ( AProcess.Output.NumBytesAvailable > 0 )
        then begin
            bytesRead := AProcess.Output.Read(buffer, 2048);
            for i := 1 to bytesRead do write( chr( buffer[i] ) );
        end else bytesRead := 0;

        if ( AProcess.StdErr.NumBytesAvailable > 0 )
        then begin
            bytesReadE := AProcess.Stderr.Read( buffer, 2048 );
            for i := 1 to bytesReadE do write( chr( buffer[i] ) );
        end else bytesReadE := 0;

    until AProcess.Running = false;
    
    exitCode := AProcess.ExitStatus;
    
    AProcess.Free;
    
    halt( exitCode );
    
end.