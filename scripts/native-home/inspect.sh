set -u
printf 'CLEANFRAME_HOME_INSPECT_BEGIN\n'
id
uname -m
sed -n '/^Version=/p;/^Model=/p' /etc/prd_info.ini
cat /etc/tizen-release
printf '\nMEMORY_INFO\n'
head -n 5 /proc/meminfo 2>/dev/null || true
printf '\nTOP_MEMORY_PROCESSES\n'
ps -eo pid,user,rss,comm --sort=-rss 2>/dev/null | head -n 25 || ps -ef | head -n 25
printf '\nDOTNET\n'
ls -d /usr/share/dotnet/shared/Microsoft.NETCore.App/* 2>/dev/null || true
printf '\nHOME_PREFERENCES\n'
for k in db/appfw/home_appid db/appfw/startup_appid db/appfw/booting_appid_backup db/first_screen/type db/menu/smart_hub/ontvsetting/auto_start; do vconftool get "$k"; done
printf '\nNATIVE_LIBRARIES\n'
ls -l /usr/lib/libapp-context-manager-common.so /usr/lib/libcapi-appfw-app-operation-tv.so.0 /usr/lib/libvconf.so.0 2>/dev/null || true
printf '\nINSTALLED_LAUNCHER\n'
ls -ld /opt/usr/apps/nClrkHome1* 2>/dev/null || true
printf 'CLEANFRAME_HOME_INSPECT_END\n'
