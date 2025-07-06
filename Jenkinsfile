pipeline {
  agent {
    label 'users-ec2 ' // Usa aquí el nombre exacto del nodo EC2 conectado
  }

  environment {
    IMAGE_NAME = "users-ms"
  }

  stages {
    stage('Instalación de dependencias') {
      steps {
        sh 'npm install'
      }
    }

    stage('Compilar proyecto') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Construir imagen Docker') {
      steps {
        sh 'docker build -t $IMAGE_NAME .'
      }
    }

    stage('Ejecutar contenedor') {
      steps {
        sh '''
          docker stop $IMAGE_NAME || true
          docker rm $IMAGE_NAME || true
          docker run -d --name $IMAGE_NAME --restart unless-stopped -p 3000:3000 --env-file .env $IMAGE_NAME
        '''
      }
    }
  }
}
