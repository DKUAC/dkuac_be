echo ${{ secrets.DOCKER_TOKEN }} | sudo docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin

sudo docker pull ${{ secrets.DOCKER_USERNAME }}/dkuac_be:${{ github.sha }}

sudo docker rm -f dkuac-server || true

sudo docker run -d --name dkuac-server -p 3000:3000 --restart always ${{ secrets.DOCKER_USERNAME }}/dkuac_be:${{ github.sha }}