# Simple EC2 + Docker Compose Deployment

This is the simplest CI/CD setup for ResuWise:

1. GitHub Actions checks that the backend and frontend build.
2. GitHub Actions SSHs into your EC2 instance.
3. EC2 pulls the latest code.
4. EC2 runs `docker compose up -d --build`.

No ECR, no AWS access keys in GitHub, and no image registry setup.

---

## 1. Test Locally

From the project root:

```bash
docker compose up --build
```

Open:

```text
Frontend: http://localhost:3000
Backend health through frontend: http://localhost:3000/api/health
Backend direct: http://localhost:5000/health
```

Stop locally:

```bash
docker compose down
```

---

## 2. Create EC2 Instance

Recommended starting point:

```text
AMI: Amazon Linux 2 or Amazon Linux 2023
Instance type: t2.micro for testing, t3.small for smoother builds
Storage: 20 GB or more
```

Security group:

```text
SSH 22: your IP only
Custom TCP 3000: 0.0.0.0/0
Custom TCP 5000: optional, only if you want direct backend access
```

The app will be available at:

```text
http://YOUR_EC2_PUBLIC_IP:3000
```

---

## 3. Prepare EC2

SSH into the instance:

```bash
ssh -i /path/to/key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

Install Docker, Docker Compose, and Git:

```bash
sudo yum update -y
sudo yum install git -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
```

Install Docker Compose v2 plugin:

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -L "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

Reconnect so the Docker group permission applies:

```bash
exit
ssh -i /path/to/key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

Clone the repo once:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /home/ec2-user/resuwise
cd /home/ec2-user/resuwise
```

Create the first `.env` file:

```bash
cat > .env << 'EOF'
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
CORS_ORIGIN=http://YOUR_EC2_PUBLIC_IP:3000
EOF
```

Start the app manually once:

```bash
docker compose up -d --build
```

Verify:

```bash
curl http://localhost:3000
curl http://localhost:3000/api/health
```

---

## 4. GitHub Secrets

In GitHub:

```text
Repository → Settings → Secrets and variables → Actions → New repository secret
```

Add only these secrets:

```text
EC2_HOST          Your EC2 public IP or DNS name
EC2_USER          ec2-user
EC2_PRIVATE_KEY   Full content of your .pem private key
JWT_SECRET        Strong random string, at least 32 characters
```

To print your key:

```bash
cat /path/to/key.pem
```

Copy the entire output, including:

```text
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

---

## 5. Deploy

Push to `main`:

```bash
git add .
git commit -m "Add simple EC2 Docker Compose deployment"
git push origin main
```

GitHub Actions will:

```text
Test backend syntax
Build frontend
SSH into EC2
Pull latest code
Rebuild containers
Restart the app
Check http://localhost:3000/api/health
```

---

## Useful EC2 Commands

View containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Restart manually:

```bash
docker compose down
docker compose up -d --build
```

Check app:

```bash
curl http://localhost:3000
curl http://localhost:3000/api/health
```

Clean unused images:

```bash
docker image prune -f
```
