up:
	docker compose up
down:
	docker compose down

reboot: down up

# Clean everything except caches that is docker related
clean:
	tools/docker_utils.sh 1
	tools/docker_utils.sh 2
	tools/docker_utils.sh 3

# Not sure if this work, double check during dev
rebuild: down
	docker compose up --build

studio:
	cd backend && npx prisma studio

env:
	tools/env_maker.sh

# Literally nuke everything docker related out of existence
nuke:
	tools/docker_utils.sh 6