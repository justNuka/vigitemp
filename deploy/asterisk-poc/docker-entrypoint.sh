#!/usr/bin/env bash
set -euo pipefail

required_vars=(
  OVH_SIP_USERNAME
  OVH_SIP_AUTH_USERNAME
  OVH_SIP_PASSWORD
  OVH_SIP_DOMAIN
  OVH_SIP_OUTBOUND_PROXY
  ASTERISK_EXTERNAL_ADDRESS
  ASTERISK_LOCAL_NET
  ASTERISK_ARI_USERNAME
  ASTERISK_ARI_PASSWORD
)

for variable in "${required_vars[@]}"; do
  if [[ -z "${!variable:-}" ]]; then
    echo "[asterisk-poc] Missing required environment variable: ${variable}" >&2
    exit 1
  fi
done

export VIGISENSYS_TEST_MESSAGE="${VIGISENSYS_TEST_MESSAGE:-Ceci est un appel de test VigiSensys.}"

for template in pjsip.conf http.conf ari.conf extensions.conf rtp.conf; do
  envsubst < "/opt/vigisensys/asterisk/templates/${template}.template" > "/etc/asterisk/${template}"
done

mkdir -p /var/lib/asterisk/sounds/custom

espeak-ng \
  -v fr-fr \
  -s 145 \
  -w /tmp/vigisensys-test-source.wav \
  "${VIGISENSYS_TEST_MESSAGE}"

sox \
  /tmp/vigisensys-test-source.wav \
  -r 8000 \
  -c 1 \
  -e signed-integer \
  -b 16 \
  /var/lib/asterisk/sounds/custom/vigisensys-test.wav

rm -f /tmp/vigisensys-test-source.wav
chown -R asterisk:asterisk /var/lib/asterisk/sounds/custom /var/log/asterisk

exec /usr/sbin/asterisk -f -U asterisk -G asterisk -vvv
