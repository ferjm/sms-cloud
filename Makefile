PROFILE_DIR=/tmp/maple_profile_dir
MAPLE_DIR=/mozilla/maple.old/
APP=http://localhost:8000/sms-cloud/app/list.html

run:
	rm -rf ${PROFILE_DIR} && mkdir ${PROFILE_DIR} && ${MAPLE_DIR}./mach run -profile ${PROFILE_DIR} ${APP}

run-old:
	${MAPLE_DIR}./mach run -profile ${PROFILE_DIR} ${APP} 
