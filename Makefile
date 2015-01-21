PROFILE_DIR=/tmp/maple_profile_dir
MAPLE_DIR=/mozilla/maple.old/obj-firefox/dist/Nightly.app/Contents/MacOS
APP=http://localhost:8000/sms-cloud/app/list.html

run:
	rm -rf ${PROFILE_DIR} && mkdir ${PROFILE_DIR} && ${MAPLE_DIR}/firefox -profile ${PROFILE_DIR} ${APP}

run-old:
	${MAPLE_DIR}/firefox -profile ${PROFILE_DIR} ${APP}
