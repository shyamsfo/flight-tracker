export APP_ROOT=$(pwd)
export UI_ROOT=$(pwd)/ui
export s=$(pwd)

export APP_CONFIG_FILE=config.yaml
export APP_CONFIG_SECTION=development
export APP_ENV_FILE=deepstore.env
export FLASK_ENV=development
export FLASK_APP=dsrag

#export SYSTEM_VERSION_COMPAT=1
export DOCKER_BASE_DIR=${HOME}/docker-volumes

export DOCKER_TAG=registry.digitalocean.com/deepsearch-dev/deepstore_app:latest

env_nvm

export PATH=.:${APP_ROOT}/env/bin:${PATH}
echo "APP_ROOT = ${APP_ROOT}, python = $(which python)"
cd $s

mkdir -p ${APP_ROOT}/logs
