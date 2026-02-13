pipeline {
    agent any
    tools {
        nodejs 'NodeJS_20_LTS' // This must match the Name you gave in Step 2
    }
    stages {
        stage('Fetch Code') {
            steps {
                checkout scm
            }
        }
        stage('Install Playwright') {
            steps {
                sh 'npm install'
            }
        }
        stage('Execute API Tests') {
            steps {
                sh 'npm run api:dev'
            }
        }
    }
    post {
        always {
            publishHTML(target: [
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright API Report'
            ])
        }
    }
}