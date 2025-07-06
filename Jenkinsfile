pipeline {
    agent {
        label 'users-ec2'
    }

    environment {
        IMAGE_NAME = "users-ms"
        ENV_FILE = credentials('users-ms-env')  // Credencial del archivo env.txt
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm  // Clona el repositorio desde GitHub
            }
        }

        stage('Instalación de dependencias') {
            steps {
                dir('service_hexa') {
                    sh 'npm install'
                }
            }
        }

        stage('Compilar proyecto') {
            steps {
                dir('service_hexa') {
                    sh 'npm run build'
                }
            }
        }

        stage('Construir imagen Docker') {
            steps {
                dir('service_hexa') {
                    sh 'docker build -t $IMAGE_NAME .'
                }
            }
        }

        stage('Ejecutar contenedor') {
            steps {
                script {
                    // 1. Detener y eliminar el contenedor antiguo si existe
                    sh 'docker stop $IMAGE_NAME || true'
                    sh 'docker rm $IMAGE_NAME || true'
                    
                    // 2. Ejecutar el nuevo contenedor con el env.txt
                    sh """docker run -d \\
                          --name $IMAGE_NAME \\
                          --restart unless-stopped \\
                          -p 3000:3000 \\
                          --env-file "$ENV_FILE" \\
                          $IMAGE_NAME"""
                }
            }
        }
    }
}