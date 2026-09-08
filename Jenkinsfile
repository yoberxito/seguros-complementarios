@Library(['git_lib','docker_lib']) _

def gitLib = new git_lib()
def dockerLib = new docker_lib()

pipeline {

    agent { label 'master' }

    environment { APP_NAME = 'seguros-complementarios-web' }

    options {
        skipStagesAfterUnstable()
        disableConcurrentBuilds abortPrevious: true
        buildDiscarder(logRotator(numToKeepStr: "${JOB_MAX_DAYS}", daysToKeepStr: "${JOB_MAX_BUILDS}"))
    }

    stages {

        stage('Initialize') {
            steps {
                script { gitLib.loadJenkinsConfig() }
                stash name: 'source', includes: '**'
            }
        }

        stage('Check Agent') {
            agent { label "${env.agent}" }
            options { skipDefaultCheckout true }
            steps { script { dockerLib.showVersion() } }
        }

        stage('Copy Source') {
            agent { label "${env.agent}" }
            options { skipDefaultCheckout true }
            steps { unstash 'source' }
        }

        stage('Build Image') {
            agent { label "${env.agent}" }
            options { skipDefaultCheckout true }
            steps { script { dockerLib.buildImage() } }
        }

        stage('Run Container') {
            agent { label "${env.agent}" }
            options { skipDefaultCheckout true }
            steps { script { dockerLib.runContainer() } }
            post { always { cleanWs() } }
        }
    }

    post { always { cleanWs() } }

}
