#!/bin/bash

#초기화 작업
exit_flag=0
trap reset SIGINT

function reset(){

sudo ./detector/killnfq
cd ./elastic


docker-compose down -v
cd ../


sudo iptables -D INPUT -s 127.0.0.1 -d 127.0.0.1 -j ACCEPT
sudo iptables -D INPUT -j NFQUEUE --queue-num 0
sudo kill `ps aux | grep suricata | awk '{print $2;}'`


# xterm 창으로 키 이벤트를 보냅니다.
for ps in "${pid_list[@]}"
do
	echo "${ps}"
	kill $ps
done
# xterm 세션이 종료될 때까지 대기합니다.
echo "reset complete"
exit
}

sudo sysctl -w vm.max_map_count=262144

# 스크립트 시작 준비
sudo iptables -A INPUT -s 127.0.0.1 -d 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -j NFQUEUE --queue-num 0
sleep 3


#pid를 담을 배열 선언
pid_list=()
command_list=(
"cd detector/model/PCA20 && uvicorn Load_Model:app --port 8501 --reload"
"cd detector && sudo node ./collector.js"
"cd detector && sudo suricata -c suricata.yaml -q 0"
"cd elastic && docker-compose up"
"cd web/backend && node api-server.js"
"cd web/frontend && npm run serve"

)


# xterm을 실행하고 PID를 저장합니다.
for ps in "${command_list[@]}"
do
	xterm -bg black -fg white -e "$ps" & mypid=$!
	pid_list+=($mypid)
	sleep 0.1
done



echo "please enter sudo's password for suricata, packet collector"

while [ $exit_flag -eq 0 ] ; do
  # xterm 창에서 키 입력을 읽어옵니다.
  read -rsn1 key

  # 'q'를 누르면 종료 조건 플래그를 설정합니다.
  #if [[ $key == "q" ]]; then
  #  exit_flag=1
  #fi
done


