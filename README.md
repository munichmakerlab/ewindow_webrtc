# eWindow - WebRTC
First testing prototype. Not quite that fast, video is noticably jumpy, but at least it works with most webcams.

Based off of EasyRTC: https://github.com/priologic/easyrtc

## Target architecture
```
    +------------------------+           +------------------------+
    | +--------------------+ |           |  Server                |
    | |  Browser           +-----------> |  node.js + easyRTC     |
+---> |  WebRTC App        +----+        |  Public or PeerVPN?    |
|   | +--------------------+ |  |        |                        |
|   | +--------------------+ |  |        +------------------------+
|   | | Button LEDs        | <--+
|   | | Local Websercer    | |
|   | +--------------------+ |
|   | +--------------------+ |
|   | | Button Presses     | |
+-----+ Python App         | |
    | | Emulates Keyboard  | |
    | +--------------------+ |
    |       RaspberryPi      |
    +------------------------+
```

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
  * Write the SD card using Etcher: https://www.etcher.io/
* Chromium is now part of the standard image
* Rotate screen if necessary: Add ```display_rotate=3``` to ```/boot/config.txt``` ([Details](https://www.raspberrypi.org/forums/viewtopic.php?f=108&t=120793))
* Disable screen blanking ([howto](https://www.raspberrypi.org/forums/viewtopic.php?f=66&t=18200))
