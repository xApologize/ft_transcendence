# Check by default if the user has the required .env, if not call the script to make them
up:
	@if [ ! -f ".env" ] || [ ! -f "backend/.env" ]; then \
		tools/env_maker.sh; \
	fi
	docker compose up

# Read the name
down:
	docker compose down

# Reboot the dockers currently running
reboot: down up

# Clean everything except caches that is docker related (container, images, volumes)
clean:
	tools/docker_utils.sh 1
	tools/docker_utils.sh 2
	tools/docker_utils.sh 3
	tools/docker_utils.sh 7

# For school mac
clean_school:
	tools/docker_utils.sh 1
	tools/docker_utils.sh 2
	tools/docker_utils.sh 3
	tools/docker_utils.sh 9

# For school mac
clean_mac:
	tools/docker_utils.sh 1
	tools/docker_utils.sh 2
	tools/docker_utils.sh 3
	tools/docker_utils.sh 9

# Not sure if this work, double check during dev
rebuild: down
	docker compose up --build

# Create your .env file needed for backend and root
env:
	tools/env_maker.sh

# Literally nuke everything docker related out of existence
nuke:
	tools/docker_utils.sh 6

# For school mac
nuke_mac:
	tools/docker_utils.sh 8

# Setup venv for the backend
venv:
	cd backend && rm -rf venv && python3 -m venv venv
	cd backend && . venv/bin/activate && pip install -r requirements.txt