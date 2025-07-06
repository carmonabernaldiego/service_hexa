pipeline {
  agent any

  stages {
    stage('Clonar y Compilar') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }

    stage('Empaquetar Docker') {
      steps {
        sh '''
          docker build -t users-ms .
          docker save users-ms | gzip > users-ms.tar.gz
        '''
      }
    }

    stage('Desplegar en EC2 Remota') {
      steps {
        // Invoca la credencial SSH guardada en Jenkins
        sshagent(['ec2-users-key']) {
          // Copiar el tar.gz a la instancia remota
          sh 'scp -o StrictHostKeyChecking=no users-ms.tar.gz ubuntu@18.220.22.105:/home/ubuntu/'

          // Ejecutar en remoto los comandos Docker
          sh '''
            ssh -o StrictHostKeyChecking=no ubuntu@18.220.22.105 << 'EOF'
              docker stop users-ms || true
              docker rm users-ms   || true
              gunzip -c users-ms.tar.gz | docker load
              docker run -d -p 3000:3000 --name users-ms users-ms
            EOF
          '''
        }
      }
    }
  }
}
