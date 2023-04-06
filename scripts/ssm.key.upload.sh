#!/usr/bin/env bash

declare KEY_ID=""
declare STACK=""
declare REGION=""
declare PUBLIC_INSTANCE_PUBLIC_DNS=""

aws ssm get-parameter \
  --name /ec2/keypair/$KEY_ID \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text >./.sensitive/$STACK-$REGION.pem

#for linux users use:
#chmod 400 ./.sensitive/$STACK-$REGION.pem

#for windows users use:
#icacls.exe ./.sensitive/$STACK-$REGION.pem /reset
#icacls.exe ./.sensitive/$STACK-$REGION.pem /grant:r "$($env:username):(r)"
#icacls.exe ./.sensitive/$STACK-$REGION.pem /inheritance:r
#openssl rsa -in ./.sensitive/$STACK-$REGION.pem -out ./.sensitive/$STACK-$REGION.key
# aws ssm get-parameter --name /ec2/keypair/key-058b80b1931426222 --with-decryption --query Parameter.Value --output text >./.sensitive/st-reg.pem

scp -i ./.sensitive/$STACK-$REGION.pem  cloudxinfo-eu-west-1.pem  ec2-user@$PUBLIC_INSTANCE_PUBLIC_DNS:~/.ssh


