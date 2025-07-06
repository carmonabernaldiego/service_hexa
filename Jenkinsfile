pipeline {
    agent {
        label 'users-ec2'
    }

    environment {
        IMAGE_NAME = "users-ms"
        ENV_FILE = credentials('users-ms-env')  // Credencial subida
    }

    stages {
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
                dir('service_hexa') {
                    sh '''
                        docker stop $IMAGE_NAME || true
                        docker rm $IMAGE_NAME || true
                        docker run -d \
                          --name $IMAGE_NAME \
                          --restart unless-stopped \
                          -p 3000:3000 \
                          --env-file "$ENV_FILE" \
                          $IMAGE_NAME
                    '''
                }
            }
        }
    }
}