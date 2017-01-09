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
|   | | Local Webserver    | |
|   | +--------------------+ |
|   | +--------------------+ |
|   | | Button Presses     | |
+-----+ Python App         | |
    | | Emulates Keyboard  | |
    | +--------------------+ |
    |       RaspberryPi      |
    +------------------------+
```

## Setup production server
Setup a production server using docker. Automatically generates TLS certificates for the service.

```bash
# Install Docker
curl -sSL https://get.docker.com/ | sh

# Get the ewindow repository
git clone https://github.com/munichmakerlab/ewindow_webrtc

# Build ewindow docker image
docker build -t ewindow ewindow_webrtc

# Create directories for reverse proxy
mkdir -p /data/rev-proxy/certs

# Start reverse proxy
docker run -d -p 80:80 -p 443:443 \
    --name nginx-proxy \
    -v /data/rev-proxy/certs:/etc/nginx/certs:ro \
    -v /etc/nginx/vhost.d \
    -v /usr/share/nginx/html \
    -v /var/run/docker.sock:/tmp/docker.sock:ro \
    jwilder/nginx-proxy

# Start letsencrypt tool
docker run -d \
    --name nginx-letsencrypt \
    -v /data/rev-proxy/certs:/etc/nginx/certs:rw \
    --volumes-from nginx-proxy \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    jrcs/letsencrypt-nginx-proxy-companion

# Start eWindow
docker run -d \
    --name ewindow01 \
    -e "VIRTUAL_HOST=ew01.munichmakerlab.de" \
    -e "LETSENCRYPT_HOST=ew01.munichmakerlab.de" \
    -e "LETSENCRYPT_EMAIL=ew01@tiefpunkt.com" \
    ewindow
```

## Setup Dev Server
* Install requirements
  ```bash
  npm install easyrtc express socket.io@0.9.16
  ```

* Create selfsigned TLS certificate, e.g. using GnuTLS certtool:

  ```bash
cat <<EOF >ca.cfg
cn = munichmakes.de
ca
cert_signing_key
EOF

certtool --generate-privkey --sec-param high > cakey.pem
certtool --generate-self-signed \
    --load-privkey cakey.pem \
    --template ca.cfg \
    --outfile cacert.pem \
    --sec-param high

cat <<EOF > ewindow.cfg
organization = munichmakes.de
cn = ewindow.munichmakes.de
tls_www_server
encryption_key
signing_key
EOF

certtool --generate-privkey \
    --sec-param high > ewindow_key.pem

certtool --generate-certificate \
    --load-privkey ewindow_key.pem \
    --load-ca-certificate cacert.pem \
    --load-ca-privkey cakey.pem \
    --template ewindow.cfg \
    --outfile ewindow_cert.pem \
    --sec-param high
  ```

* Run it: 
  ```bash
  node secure_server.js dev
  ```

## Setup Client
Using a RPi 3
* Install Raspbian on SD card, and boot
  * Download: https://www.raspberrypi.org/downloads/raspbian/
  * I used the full desktop image
  * Write the SD card using Etcher: https://www.etcher.io/
* Chromium is now part of the standard image
* Rotate screen if necessary: Add ```display_rotate=3``` to ```/boot/config.txt``` ([Details](https://www.raspberrypi.org/forums/viewtopic.php?f=108&t=120793))
* Disable screen blanking ([howto](https://www.raspberrypi.org/forums/viewtopic.php?f=66&t=18200))
