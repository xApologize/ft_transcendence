#!/bin/bash
# Clean up docker related containers, images, volumes and caches
# Author producks 9/1/2023, updated 1/09/2024

# Reset
Reset='\033[0m'       # Text Reset

# Regular Colors
Black='\033[0;30m'        # Black
Red='\033[0;31m'          # Red
Green='\033[0;32m'        # Green
Yellow='\033[0;33m'       # Yellow
Blue='\033[0;34m'         # Blue
Purple='\033[0;35m'       # Purple
Cyan='\033[0;36m'         # Cyan
White='\033[0;37m'        # White

stop_all_containers() {
	if [ -z "$(docker ps -aq)" ]; then
		echo -e "${Red}No docker container are currently running${Reset}"
	else
		docker stop $(docker ps -aq) > /dev/null 2>&1
		echo -e "${Green}All docker containers currently running have been stopped🎉${Reset}"
	fi
}

clean_containers() {
	if [ -z "$(docker ps -aq)" ]; then
		echo -e "${Red}No containers found${Reset}"
	else
		if [ -n "$(docker ps -q)" ]; then
			docker stop $(docker ps -aq) > /dev/null 2>&1
			echo -e "${Green}All docker containers currently running have been stopped🎉${Reset}"
		fi
		docker rm $(docker ps -aq) > /dev/null 2>&1
		echo -e "${Green}All docker containers have been deleted🎉${Reset}"
	fi
}

clean_volumes() {
	if [ -z "$(docker volume ls)" ]; then
		echo -e "${Red}No volume found${Reset}"
	else
		docker volume rm $(docker volume ls -q) > /dev/null 2>&1
		if [ $? == 1 ]; then
			echo -e "${Red}Error happened${Reset}"
		else
			echo -e "${Green}All docker volumes have been deleted${Reset}"
		fi
	fi
}

clean_images() {
	if [ -z "$(docker images -q)" ]; then
		echo -e "${Red}No images found${Reset}"
	else
		docker rmi $(docker images -q) > /dev/null 2>&1
		if [ $? == 1 ]; then
			echo -e "${Red}Error happened, image is probably tied to container${Reset}"
		else
			echo -e "${Green}All docker images deleted🎉${Reset}"
		fi
	fi
}

clean_caches() {
	docker builder prune --all
}

clean_migration() {
	rm -rf backend/auth/migrations/*_initial.py
	rm -rf backend/friend_list/migrations/*_initial.py
	rm -rf backend/interactive/migrations/*_initial.py
	rm -rf backend/match_history/migrations/*_initial.py
	rm -rf backend/user_profile/migrations/*_initial.py
	rm -rf backend/game_invite/migrations/*_initial.py
	rm -rf backend/tournament/migrations/*_initial.py
}


if [ $# -eq 1 ]; then
	input="$1"
elif [ $# -eq 0 ]; then
	echo -e "${Purple}·▄▄▄▄         ▄▄· ▄ •▄ ▄▄▄ .▄▄▄      ▄• ▄▌▄▄▄▄▄▪  ▄▄▌  .▄▄ · "
	echo -e '██▪ ██ ▪     ▐█ ▌▪█▌▄▌▪▀▄.▀·▀▄ █·    █▪██▌•██  ██ ██•  ▐█ ▀. '
	echo -e "▐█· ▐█▌ ▄█▀▄ ██ ▄▄▐▀▀▄·▐▀▀▪▄▐▀▀▄     █▌▐█▌ ▐█.▪▐█·██▪  ▄▀▀▀█▄"
	echo -e "██. ██ ▐█▌.▐▌▐███▌▐█.█▌▐█▄▄▌▐█•█▌    ▐█▄█▌ ▐█▌·▐█▌▐█▌▐▌▐█▄▪▐█"
	echo -e "▀▀▀▀▀•  ▀█▄▀▪·▀▀▀ ·▀  ▀ ▀▀▀ .▀  ▀     ▀▀▀  ▀▀▀ ▀▀▀.▀▀▀  ▀▀▀▀ ${Reset}"
	echo -e "[0] Stop all running containers"
	echo -e "[1] Clean containers"
	echo -e "[2] Clean volumes"
	echo -e "[3] Clean images"
	echo -e "[4] Clean caches"
	echo -e "[5] Nuke all ☢️"
	read -n1 -p "Enter your input " input
	echo ""
else
	echo -e "${Red}Invalid numbers of args${Reset}"
	exit 1
fi

case $input in
	"0")
	stop_all_containers
	;;
	"1")
	clean_containers
	;;
	"2")
	clean_volumes
	;;
	"3")
	clean_images
	;;
	"4")
	clean_caches
	;;
	"5")
	stop_all_containers
	clean_containers
	clean_volumes
	clean_images
	clean_caches
	;;
	"6")
	stop_all_containers
	clean_containers
	clean_volumes
	clean_images
	clean_caches
	;;
	"8")
	stop_all_containers
	clean_containers
	clean_volumes
	clean_images
	clean_caches
	;;
	"7")
	clean_migration
	;;
	"9")
	clean_migration
	;;
	*)
	echo -e "${Red}Invalid input provided${Reset}"
esac
