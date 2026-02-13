pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS_20_LTS' // Must match the name in Manage Jenkins -> Tools
    }

    environment {
        // We inject these so you don't need a .env file on the Jenkins server
        API_DEV_BASE_URL = 'https://api-dev.yobo.com' 
        // Add other necessary variables here or via Jenkins Credentials
    }

    stages {
        stage('Cleanup') {
            steps {
                deleteDir() // Clean workspace to avoid old file conflicts
            }
        }

        stage('Fetch Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                // Based on your README, you need to install browsers too
                sh 'npm run install-browsers'
            }
        }

        stage('Execute API Tests') {
            steps {
                // We use the headless version of your command
                // If 'api:dev' is your headless command:
                sh 'npm run api:dev'
            }
        }
    }

    post {
        always {
            // Updated to match your README's report location
            publishHTML(target: [
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'api-tests/reports/html', 
                reportFiles: 'index.html',
                reportName: 'Playwright API Report'
            ])
        }
    }
}
