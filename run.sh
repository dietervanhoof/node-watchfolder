#!/usr/bin/env bash
nodemon src/watchfolder.js \
	--CP=VRT \
	--FLOW_ID=VRT.VIDEO.1 \
	--ESSENCE_FILE_TYPE=.mxf,.txt \
	--SIDECAR_FILE_TYPE=.xml \
	--COLLATERAL_FILE_TYPE= \
	--RABBIT_MQ_HOST=localhost \
	--RABBIT_MQ_PORT=5672 \
	--RABBIT_MQ_VHOST=/dev \
	--RABBIT_MQ_SUCCESS_EXCHANGE=borndigital.input \
	--RABBIT_MQ_SUCCESS_QUEUE=borndigital.input \
	--RABBIT_MQ_ERROR_EXCHANGE=born.digital.errors \
	--RABBIT_MQ_ERROR_QUEUE=incomplete_packages \
	--RABBIT_MQ_TOPIC_TYPE=direct \
	--RABBIT_MQ_USER=guest \
	--RABBIT_MQ_PASSWORD=guest \
	--FTP_SERVER=localhost \
	--FTP_USERNAME=admin \
	--FTP_PASSWORD=admin \
	--CHECK_PACKAGE_INTERVAL=10000 \
	--CHECK_PACKAGE_AMOUNT=10 \
	--PROCESSING_FOLDER_NAME=processing \
	--INCOMPLETE_FOLDER_NAME=incomplete \
	--REFUSED_FOLDER_NAME=refused \
	/Users/dieter/watch_this_folder
