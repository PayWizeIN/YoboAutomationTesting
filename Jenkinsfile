pipeline {
    agent any
    tools {
        nodejs 'NodeJS_20_LTS'
    }
    environment {
        // Essential for your auth-service.spec.js to find the right files/URLs
        TEST_ENV = 'dev'
        API_DEV_BASE_URL = 'https://api-dev.yobo.com' 
        // IMPORTANT: Add any other vars your .env usually has
    }
    stages {
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
    steps {
        // This will show us exactly what files exist in that folder
        sh 'ls -R api-tests/fixtures/' 
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