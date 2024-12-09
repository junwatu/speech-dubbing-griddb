FROM rockylinux:9.3

ENV GRIDDB_NODE_API_VERSION=0.8.5
ENV NODE_PATH=/root/node-api-${GRIDDB_NODE_API_VERSION}

# Install base dependencies and build tools for FFmpeg
RUN set -eux \
    && dnf update -y \
    && dnf install -y \
       gcc gcc-c++ make cmake autoconf automake git libtool pkgconfig zlib-devel bzip2 bzip2-devel xz-devel \
       tar xz wget curl python3 --allowerasing \
    && dnf clean all
    
    
# Compile and install FFmpeg dependencies
# nasm
RUN curl -LO https://www.nasm.us/pub/nasm/releasebuilds/2.16.01/nasm-2.16.01.tar.gz \
    && tar -xzf nasm-2.16.01.tar.gz \
    && cd nasm-2.16.01 \
    && ./configure && make -j$(nproc) && make install \
    && cd .. && rm -rf nasm-2.16.01 nasm-2.16.01.tar.gz

# FFmpeg source build
RUN git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg \
    && cd ffmpeg \
    && ./configure --prefix=/usr --enable-gpl --enable-nonfree --enable-libmp3lame --enable-nonfree --disable-shared --enable-static \
    && make -j$(nproc) && make install \
    && cd .. && rm -rf ffmpeg

# Install NVM and Node.js
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash \
    && source ~/.nvm/nvm.sh \
    && nvm install 20 \
    && nvm use 20

# Install GridDB C client
COPY ./lib/griddb-c-client-5.5.0-linux.aarch64.rpm /
RUN rpm -Uvh /griddb-c-client-5.5.0-linux.aarch64.rpm

# Set bash as the default shell
SHELL ["/bin/bash", "--login", "-c"]

# Copy application files
COPY . /root/
WORKDIR /root

# Install Node.js client for GridDB
RUN curl -L https://github.com/griddb/node-api/archive/refs/tags/${GRIDDB_NODE_API_VERSION}.tar.gz -o ${GRIDDB_NODE_API_VERSION}.tar.gz -sS \
    && tar -xzvf ${GRIDDB_NODE_API_VERSION}.tar.gz \
    && cd node-api-${GRIDDB_NODE_API_VERSION} \
    && npm install \
    && rm /root/${GRIDDB_NODE_API_VERSION}.tar.gz

WORKDIR /root

# Install fluent-ffmpeg dependencies
RUN npm install fluent-ffmpeg

# Set permissions for the script
RUN chmod a+x run.sh

EXPOSE 3000
# Set permission executable for script
RUN chmod a+x run.sh
RUN npm install
RUN npm run build

# Run the application
CMD ["/bin/bash", "run.sh"]