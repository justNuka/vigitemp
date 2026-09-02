FROM debian:bookworm-slim

ARG ASTERISK_VERSION=22.11.0

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    autoconf \
    automake \
    bison \
    build-essential \
    ca-certificates \
    curl \
    espeak-ng \
    flex \
    gettext-base \
    libasound2-dev \
    libcurl4-openssl-dev \
    libedit-dev \
    libjansson-dev \
    libncurses-dev \
    libnewt-dev \
    libogg-dev \
    libspeex-dev \
    libspeexdsp-dev \
    libsqlite3-dev \
    libsrtp2-dev \
    libssl-dev \
    libtool \
    libvorbis-dev \
    libxml2-dev \
    pkg-config \
    python3-dev \
    sox \
    uuid-dev \
    wget \
    zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src

RUN wget -q "https://downloads.asterisk.org/pub/telephony/asterisk/releases/asterisk-${ASTERISK_VERSION}.tar.gz" \
  && tar -xzf "asterisk-${ASTERISK_VERSION}.tar.gz" \
  && rm "asterisk-${ASTERISK_VERSION}.tar.gz"

WORKDIR /usr/src/asterisk-${ASTERISK_VERSION}

RUN ./configure --prefix=/usr --sysconfdir=/etc --localstatedir=/var --with-pjproject-bundled \
  && make -j"$(nproc)" \
  && make install \
  && make samples

RUN groupadd --system asterisk \
  && useradd --system --gid asterisk --home-dir /var/lib/asterisk --shell /usr/sbin/nologin asterisk

COPY templates/ /opt/vigisensys/asterisk/templates/
COPY docker-entrypoint.sh /usr/local/bin/vigisensys-asterisk-entrypoint

RUN chmod +x /usr/local/bin/vigisensys-asterisk-entrypoint \
  && mkdir -p /var/lib/asterisk/sounds/custom /var/log/asterisk /var/run/asterisk \
  && chown -R asterisk:asterisk /var/lib/asterisk /var/log/asterisk /var/run/asterisk

EXPOSE 5060/udp 8088/tcp 10000-10100/udp

ENTRYPOINT ["/usr/local/bin/vigisensys-asterisk-entrypoint"]
