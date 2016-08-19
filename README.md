# eWindow - WebRTC
First testing prototype. Not quite that fast, video is noticably jumpy, but at least it works with most webcams.

Based off of EasyRTC: https://github.com/priologic/easyrtc

## Setup Server
* Install requirements
  `npm install easyrtc express socket.io@0.9.16`

* Create certificates. I used the GnuTLS cert tool for testing as follows. In a real installation, get some real TLS certs.

```
cat <<EOF >ca.cfg
cn = munichmakes.de
ca
cert_signing_key
EOF

certtool --generate-privkey --sec-param high > cakey.pem
certtool --generate-self-signed --load-privkey cakey.pem --template ca.cfg --outfile cacert.pem --sec-param high

cat <<EOF >ewindow.cfg
organization = munichmakes.de
cn = ewindow.munichmakes.de
tls_www_server
encryption_key
signing_key
EOF

certtool --generate-privkey --sec-param high > ewindow_key.pem
certtool --generate-certificate --load-privkey ldap_slapd_key.pem --load-ca-certificate cacert.pem --load-ca-privkey cakey.pem --template slapd.cfg --outfile ewindow_cert.pem --sec-param high
</code>
```

* Run it: `node secure_server.js`

## Setup Client
Using a RPi 3
* Install Raspbian on SD card, and boot
  * Download: https://www.raspberrypi.org/downloads/raspbian/
  * I used the full desktop image
  * How to write the image to an SD card: https://www.raspberrypi.org/documentation/installation/installing-images/
* Install Chromium
  * Follow the guide at https://www.raspberrypi.org/forums/viewtopic.php?t=121195
  * No need for the youtube plugin

```
wget -qO - http://bintray.com/user/downloadSubjectPublicKey?username=bintray | sudo apt-key add -
echo "deb http://dl.bintray.com/kusti8/chromium-rpi jessie main" | sudo tee -a /etc/apt/sources.list
sudo apt-get update
sudo apt-get install chromium-browser
```
