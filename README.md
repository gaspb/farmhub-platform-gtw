#platform
collaborative API and pipeline conception platform @FarmHub

1- start kafka and zookeper with docker
"docker-compose -f src/main/docker/kafka.yml up -d"
2- start registry (@farmhub-registry)
3- start uaa authentication server (@farmhub-uaa)
4- run the platform backend
"./mvnw"
5- run webpack
"yarn start"
