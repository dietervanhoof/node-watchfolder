# NodeJS watchfolder
Watches directories for packages and publishes messages when complete.

A package consists of 2 or 3 files, depending on the configuration. This service will monitor a folder for files and match these based on their name and extension.

####Example:
A complete package might be:
- Configured with only essence and sidecar
  - somefile.mxf
  - somefile.xml
- Configured with essence, sidecar and collateral
  - somefile.mxf
  - somefile.xml
  - somefile.srt

## How to use
This service can be started with the command line, passing all arguments:
```
node src/watchfolder.js \
	--CP=VRT \
	--FLOW_ID=VRT.VIDEO.1 \
	--ESSENCE_FILE_TYPE=.mxf,.txt \
	--SIDECAR_FILE_TYPE=.xml \
	--COLLATERAL_FILE_TYPE=.srt \
	--RABBIT_MQ_HOST=localhost \
	--RABBIT_MQ_PORT=5672 \
	--RABBIT_MQ_VHOST=/ \
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
	--CHECK_PACKAGE_INTERVAL=2000 \
	--CHECK_PACKAGE_AMOUNT=3 \
	--RETRY_PACKAGE_INTERVAL=15000 \
	--PROCESSING_FOLDER_NAME=processing \
	--INCOMPLETE_FOLDER_NAME=incomplete \
	--REFUSED_FOLDER_NAME=refused \
	/Users/dieter/watch_this_folder

```

####Arguments
Argument                        |Description                                                            |Required       |Default
|:---                           |:---                                                                   |:---           |:---
| CP                            |Can be filled in freely. Will be part of the message                   | True          | None|
| FLOW_ID                       |Can be filled in freely. Will be part of the message                   | True          | None|
| ESSENCE_FILE_TYPE             |File types that are recognized as essence, separated with a `,`        | True          | None|
| SIDECAR_FILE_TYPE             |File types that are recognized as sidecar, separated with a `,`        | True          | None|
| COLLATERAL_FILE_TYPE          |File types that are recognized as collateral, separated with a `,`     | False         | None|
| RABBIT_MQ_HOST                |AMQP host to connect to                                                | True          | None|
| RABBIT_MQ_PORT                |AMQP port to connect to                                                | True          | None|
| RABBIT_MQ_VHOST               |AMQP virtual host to connect to                                        | True          | None|
| RABBIT_MQ_SUCCESS_EXCHANGE    |AMQP exchange to publish correct packages to                           | True          | None|
| RABBIT_MQ_SUCCESS_QUEUE       |AMQP queue to publish correct packages to                              | True          | None|
| RABBIT_MQ_ERROR_EXCHANGE      |AMQP exchange to publish errors to                                     | True          | None|
| RABBIT_MQ_ERROR_QUEUE         |AMQP queue to publish errors to                                        | True          | None|
| RABBIT_MQ_TOPIC_TYPE          |AMQP type of the exchanges                                             | True          | None|
| RABBIT_MQ_USER                |AMQP user                                                              | True          | None|
| RABBIT_MQ_PASSWORD            |AMQP password                                                          | True          | None|
| FTP_SERVER                    |FTP host where the file resides                                        | True          | None|
| FTP_USERNAME                  |FTP username to log into that server                                   | True          | None|
| FTP_PASSWORD                  |FTP password to log into that server                                   | True          | None|
| CHECK_PACKAGE_INTERVAL        |Interval (in ms) to wait for accompanying files                        | True          | None|
| CHECK_PACKAGE_AMOUNT          |Amount of times to wait the above interval before making as incomplete | True          | None|
| RETRY_PACKAGE_INTERVAL        |Interval (in ms) to retry sending packages                             | False         | None|
| PROCESSING_FOLDER_NAME        |Folder to move completed packages to                                   | True          | None|
| INCOMPLETE_FOLDER_NAME        |Folder to move incomplete packages to                                  | True          | None|
| REFUSED_FOLDER_NAME           |Folder to move refused files to                                        | True          | None|