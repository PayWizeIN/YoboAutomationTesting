pipeline {
    agent any
    tools {
        nodejs 'NodeJS_20_LTS'
    }
    stages {
        stage('Cleanup') {
            steps {
                deleteDir()
            }
        }
        stage('Fetch Code') {
            steps {
                checkout scm
                sh 'sleep 2' // Give the filesystem a moment
                sh 'ls -la'  // Show hidden files and permissions
            }
        }
        stage('Install') {
            steps {
                // If package.json is in the root, this should work
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run api:dev' 
            }
        }
    }
    post {
        always {
            publishHTML(target: [
                alwaysLinkToLastBuild: true,
                reportDir: 'api-tests/reports/html',
                reportFiles: 'index.html',
                reportName: 'Playwright API Report'
            ])
        }
    }
}
