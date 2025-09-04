#!/usr/bin/env bash

echo  "Switching to branch production"
#git checkout production

echo "Deploying files to  dev server..."
HOST_IP=35.180.186.140
SCP_USER=idriss
SCP_PORT=22
FILE_2_COPY=docker-compose.yaml
DIR_2_COPY=/var/www/dev.cartekado.fr


function scpCopy(){
  HOST_IP="$1"
  SCP_USER="$2"
  SCP_PORT="$3"
  FILE_2_COPY="$4"
  DIR_2_COPY="$5"
  if [[ -d $FILE_2_COPY ]]; then
    echo " copy directory $FILE_2_COPY to the server"
    sshpass -p 'idriss' scp -oPort=$SCP_PORT -rp "$FILE_2_COPY"/* "$SCP_USER"@"$HOST_IP":"$DIR_2_COPY"/"$FILE_2_COPY"
  elif [[ -f $FILE_2_COPY ]]; then
      echo " copy file: $FILE_2_COPY to the server"
      sshpass -p 'idriss' scp -oPort=$SCP_PORT "$FILE_2_COPY" "$SCP_USER"@"$HOST_IP":$DIR_2_COPY
  else
      echo "$FILE_2_COPY is not valid"
    exit 1
  fi
}

for line in $(cat filename.txt)
do
  scpCopy "$HOST_IP" "$SCP_USER" "$SCP_PORT" "$line" "$DIR_2_COPY"
done
echo "Done!"
