#!/bin/sh
###############################################################
##    Multifactory Project
##       eWindow WebRTC
##       Initial setup script
##
##    Severin Schols <severin@schols.de>, 2017
###############################################################

EWINDOW_MASTER=ew01.munichmakes.de
VERSION=0.3

echo
echo "  #######################################"
echo "  #    Multifactory Project - eWindow   #"
#echo "  #      v${VERSION}                    #"
echo "  #                                     #"
echo "  #    - Installation -                 #"
echo "  #######################################"
echo

echo -n "What's the nickname of this window? "
read nickname < /dev/tty

echo -n "What cluster does this window belong to (e.g. cityname)? "
read cluster < /dev/tty
echo

new_hostname="ewindow-${cluster}-${nickname}"

echo " - Setting hostname to ${new_hostname}..."

echo ${new_hostname} | sudo tee /etc/hostname > /dev/null
sudo sed -i.bak s/raspberrypi/${new_hostname}/g /etc/hosts

echo " - Updating repositories..."
sudo apt-get -y update > /dev/null

echo " - Installing software..."
sudo apt-get -y install salt-minion

echo " - Configuring management software..."
echo "master: ${EWINDOW_MASTER}" | sudo tee /etc/salt/minion.d/ewindow_master.conf > /dev/null
echo "${new_hostname}" | sudo tee /etc/salt/minion_id > /dev/null
echo "ewindow_version: ${VERSION}" | sudo tee /etc/salt/grains > /dev/null
echo "ewindow_cluster: ${cluster}" | sudo tee -a /etc/salt/grains > /dev/null
echo "ewindow_nickname: ${nickname}" | sudo tee -a /etc/salt/grains > /dev/null
key=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
echo "ewindow_key: ${key}" | sudo tee -a /etc/salt/grains > /dev/null

echo " - Starting management software..."
sudo systemctl restart salt-minion

echo " - Done"
