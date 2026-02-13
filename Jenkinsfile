pipeline {
    agent any
    tools {
        nodejs 'node24'
    }
    stages {
        stage('Fetch & Inspect') {
            steps {
                checkout scm
                echo "Listing root directory content:"
                sh 'ls -F' // -F adds a / to folder names so they are easy to spot
            }
        }
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                // If 'ls -F' above shows that your folder is actually named differently, 
                // update this line to match it exactly.
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
