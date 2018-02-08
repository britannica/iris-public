FROM amazonlinux

ADD /config/gpg/nodesource.gpg.key /etc

WORKDIR /tmp

# Install the latest version of node that AWS Lambda supports: 6.10.3
# https://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html
# https://rpm.nodesource.com/pub_6.x/el/7/x86_64/
RUN yum -y install gcc-c++ && \
    rpm --import /etc/nodesource.gpg.key && \
    curl --location --output ns.rpm https://rpm.nodesource.com/pub_6.x/el/7/x86_64/nodejs-6.10.3-1nodesource.el7.centos.x86_64.rpm && \
    rpm --checksig ns.rpm && \
    rpm --install --force ns.rpm && \
    npm install -g npm@latest && \
    npm cache clean --force && \
    yum clean all && \
    rm --force ns.rpm

WORKDIR /app

ADD . /app

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
