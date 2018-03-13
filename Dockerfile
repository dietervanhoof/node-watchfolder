FROM node
ENV NPM_CONFIG_LOGLEVEL warn
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
RUN apt-get update -qqy 
RUN apt-get install -qyy -o APT::Install-Recommends=false \
	-o APT::Install-Suggests=false \
	locales \
	nano \
	make \
	openssh-client \
	sudo \
	&& locale-gen en_US.UTF-8 \
	&& echo "LC_ALL=en_US.UTF-8" >> /etc/environment \
	&& echo "LANG=en_US.UTF-8" >> /etc/environment \
	&& echo "LC_ALL=en_US.UTF-8" >> /etc/default/locale \
	&& echo "LANG=en_US.UTF-8" >> /etc/default/locale
# Bundle app source
COPY . /usr/src/app
ENV CP=viaa
ENV FLOW_ID=flowid_01
ENV ESSENCE_FILE_TYPE=.mxf
ENV SIDECAR_FILE_TYPE=.xml
ENV COLLATERAL_FILE_TYPE=srt
ENV NR_OF_COLLATERALS=0
ENV RABBIT_MQ_HOST=do-qas-rab-01.do.viaa.be
ENV VHOST=dev
ENV RABBIT_MQ_SUCCESS_EXCHANGE=success
ENV RABBIT_MQ_SUCCESS_QUEUE=watcher-docker
ENV RABBIT_MQ_ERROR_EXCHANGE=error
ENV RABBIT_MQ_ERROR_QUEUE=watcher-docker-err
ENV RABBIT_MQ_USER=admin
ENV RABBIT_MQ_PASSWORD=admin
ENV FTP_SERVER=so-prd-ftp-v1
ENV FTP_USERNAME=ftphaven 
ENV FTP_PASSWORD=tada
ENV PROCESSING_FOLDER_NAME=processing
ENV INCOMPLETE_FOLDER_NAME=incomplete
ENV REFUSED_FOLDER_NAME=refused
ENV FOLDER_TO_WATCH=/export/home/viaa/incoming/temp


RUN mkdir -p /home/ftphaven && \
    echo "ftphaven:x:1002:1002:ftphaven,,,:/home/ftphaven:/bin/bash" >> /etc/passwd && \
    echo "ftphaven:x:1001:" >> /etc/group && \
    echo "ftphaven ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/ftphaven && \
    chmod 0440 /etc/sudoers.d/ftphaven && \
    chown ftphaven:ftphaven -R /home/ftphaven && \
    chown root:root /usr/bin/sudo && chmod 4755 /usr/bin/sudo

#USER ftphaven
ENV HOME /home/ftphaven

RUN adduser node root
RUN chmod -R 775 /usr/src/app
RUN chown -R node:root /usr/src/app
USER 1002

#EXPOSE 8080
CMD [ "/bin/bash", "start.sh"]
