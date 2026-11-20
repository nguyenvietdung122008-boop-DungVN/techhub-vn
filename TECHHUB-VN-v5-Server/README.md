# TECHHUB VN v5 trên server riêng

Gói này chứa mã nguồn TECHHUB VN v5, cấu hình Docker Compose và các câu lệnh để vận hành trên một VPS Linux. Bản tự lưu trữ dùng Next.js, SQLite và Caddy. Dữ liệu mẫu của ứng dụng có sẵn trong mã nguồn.

Bản server riêng tạo cơ sở dữ liệu mới khi khởi động. Bài viết, tài khoản đăng nhập và ảnh trên website ChatGPT Sites cần được di chuyển riêng nếu bạn muốn mang sang. Gói này dành cho cộng đồng riêng tư. Quản trị viên tạo tài khoản cho từng thành viên. Giỏ hàng và đơn hàng vẫn là chức năng trải nghiệm.

## Bước 1 — Chuẩn bị VPS

- Có quyền SSH vào VPS Linux. Hướng dẫn cài Docker bên dưới dành cho Ubuntu 24.04. VPS cần truy cập Internet để tải image Docker và gói npm.
- Để chạy qua HTTPS, trỏ bản ghi DNS **A** của tên miền hoặc tên miền con về IPv4 của VPS. Chỉ đặt **AAAA** nếu VPS thực sự phục vụ được qua IPv6.
- Cho phép kết nối đến VPS trên TCP **80** và **443** ở firewall của nhà cung cấp. Nếu VPS đã có firewall hệ điều hành, cho phép hai cổng này ở đó nữa. Cổng SSH cần tiếp tục truy cập được. Cổng ứng dụng 3000 nằm trong mạng Docker.
- Nếu bạn chưa có tên miền, dùng phần [Thử qua đường hầm SSH](#thử-qua-đường-hầm-ssh-khi-chưa-có-tên-miền).

Caddy dùng tên miền và DNS hợp lệ để cấp chứng chỉ HTTPS. Xem [yêu cầu HTTPS của Caddy](https://caddyserver.com/docs/automatic-https#overview).

### Cài Docker nếu VPS chưa có

Trên VPS Ubuntu, kiểm tra trước:

```bash
sudo docker version
sudo docker compose version
```

Nếu hai lệnh chạy được, chuyển sang bước 2. Trên Ubuntu mới chưa cài Docker, thêm kho chính thức rồi cài:

```bash
sudo apt update
sudo apt install -y ca-certificates curl unzip
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

cat <<SOURCES | sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
SOURCES

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker compose version
```

Với hệ điều hành khác hoặc máy đã có một bản Docker từ kho khác, dùng [hướng dẫn Docker Engine](https://docs.docker.com/engine/install/) phù hợp với hệ điều hành.

## Bước 2 — Tải và giải nén

Tải `TECHHUB-VN-v5-Server.zip` về máy. Trong Terminal hoặc PowerShell trên máy của bạn, đi đến thư mục chứa ZIP rồi chạy. Đổi `USER` và `IP_VPS` thành tài khoản SSH và địa chỉ thật của bạn.

```bash
scp TECHHUB-VN-v5-Server.zip USER@IP_VPS:~/
ssh USER@IP_VPS
```

Sau khi SSH vào VPS:

```bash
sudo apt install -y unzip
unzip ~/TECHHUB-VN-v5-Server.zip -d ~/
cd ~/TECHHUB-VN-v5-Server
cp .env.example .env
nano .env
```

Trong `.env`, đặt `SITE_DOMAIN` bằng tên miền thật, dạng `techhub.example.com`. Nhập tên miền thuần, không kèm giao thức hay dấu gạch cuối. Lưu trong Nano bằng **Ctrl+O**, **Enter**, rồi **Ctrl+X**.

## Bước 3 — Build và chạy

Chạy trong thư mục có `compose.yaml`:

```bash
sudo docker compose config --quiet
sudo docker compose up -d --build
sudo docker compose ps
```

Cột trạng thái của `app` cần báo **healthy**. Để xem log khởi động:

```bash
sudo docker compose logs --tail=100 app proxy
```

Tiếp theo, thử thay tên miền vào hai lệnh:

```bash
curl -fsS https://techhub.example.com/api/health
curl -I https://techhub.example.com/
```

Lệnh đầu trả `{"status":"ok"}`. Lệnh sau chuyển tới `/sign-in` khi chưa đăng nhập. Truy cập `https://techhub.example.com` trên trình duyệt sau khi tạo tài khoản ở bước 4.

## Bước 4 — Tạo tài khoản và đăng nhập

```bash
sudo docker compose exec app node deployment/accounts.mjs create admin "Quản trị TECHHUB VN" admin
```

Lệnh in một mật khẩu ngẫu nhiên. Lưu mật khẩu vào trình quản lý mật khẩu rồi dùng tên `admin` và mật khẩu đó để đăng nhập. Để mời người thử, tạo cho họ một tài khoản riêng:

```bash
sudo docker compose exec app node deployment/accounts.mjs create thanhvien1 "Thành viên 1" member
```

Nếu quên mật khẩu, lệnh dưới tạo mật khẩu mới và kết thúc các phiên trước của tài khoản:

```bash
sudo docker compose exec app node deployment/accounts.mjs reset admin
```

Kiểm tra bằng hai tài khoản. Tài khoản quản trị đăng một bài thử tại **Cộng đồng → Viết bài**. Tài khoản thành viên mở bài, bình luận và trả lời một bình luận. Tải lại trang để xác nhận các nội dung vẫn được lưu.

## Bước 5 — Sao lưu và nâng cấp

Dữ liệu ứng dụng và tài khoản nằm trong volume Docker `techhub-vn_app-data`. Caddy lưu chứng chỉ trong volume riêng. Tạo bản sao SQLite trước mỗi đợt cập nhật:

```bash
mkdir -p -m 700 backups
sudo docker compose exec -T app node --input-type=module -e "import {DatabaseSync,backup} from 'node:sqlite';const db=new DatabaseSync('/app/data/techhub.sqlite',{readOnly:true});await backup(db,'/tmp/techhub-backup.sqlite');db.close()"
backup_file="backups/techhub-$(date +%Y%m%d-%H%M%S).sqlite"
sudo docker compose cp app:/tmp/techhub-backup.sqlite "$backup_file"
sudo chmod 600 "$backup_file"
sudo docker compose exec -T app rm /tmp/techhub-backup.sqlite
```

Giữ bản sao ở nơi bạn quản lý. File chứa cả tài khoản, phiên đăng nhập, ảnh và dữ liệu do thành viên nhập. Khi nâng cấp, giữ `.env` và tên dự án `techhub-vn`, cập nhật mã nguồn, rồi chạy lại `sudo docker compose up -d --build`. Kiểm tra `/api/health` và một bài đã đăng. Dùng `sudo docker compose stop` để dừng nếu cần. Lệnh `docker compose down -v` xóa cả volume dữ liệu.

## Thử qua đường hầm SSH khi chưa có tên miền

Đây là cách mở website riêng cho máy của bạn trước khi thiết lập DNS. Từ thư mục mã nguồn **trên VPS**:

```bash
sudo docker build -t techhub-vn:v5 .
sudo docker run -d --name techhub-vn-test \
  -p 127.0.0.1:3000:3000 \
  -e TECHHUB_ORIGIN=http://localhost:3000 \
  -v techhub-vn-test-data:/app/data \
  techhub-vn:v5
sudo docker exec techhub-vn-test node deployment/accounts.mjs create admin "Quản trị TECHHUB VN" admin
```

Ở một Terminal khác **trên máy bạn**:

```bash
ssh -N -L 3000:127.0.0.1:3000 USER@IP_VPS
```

Giữ cửa sổ SSH này mở và vào `http://localhost:3000`. Bản thử dùng volume riêng. Có thể dừng container thử bằng `sudo docker stop techhub-vn-test` trên VPS.

## Xử lý lỗi thường gặp

| Dấu hiệu | Kiểm tra |
|---|---|
| Chưa cấp được HTTPS | Kiểm tra DNS trỏ đúng VPS, cổng TCP 80 và 443 mở, rồi xem `sudo docker compose logs --tail=100 proxy`. |
| Cổng 80 hoặc 443 báo đã được sử dụng | Chạy `sudo ss -ltnp '( sport = :80 or sport = :443 )'` để xác định dịch vụ đang giữ cổng. Nếu VPS đang phục vụ website khác, cấu hình reverse proxy hiện có hoặc chọn VPS khác. |
| App không đạt trạng thái healthy | Chạy `sudo docker compose logs --tail=100 app`. Kiểm tra .env và dung lượng đĩa bằng `df -h`. |
| Đăng nhập báo nguồn không hợp lệ | Mở bằng đúng tên miền HTTPS đã đặt trong `.env`. Với bản thử qua SSH, dùng chính xác `http://localhost:3000`. |
| Build báo thiếu bộ nhớ hoặc npm mất kết nối | Đọc lỗi cuối của `sudo docker compose build app`. Kiểm tra RAM và kết nối từ VPS tới kho npm trước khi thử lại. |

Mã nguồn ứng dụng nằm trong `app/` và `lib/`. Phần tài khoản và lưu trữ của bản server riêng nằm trong `deployment/`. Tệp `package-lock.json` khóa các phiên bản phụ thuộc để cài lại bằng `npm ci`. Có thể chạy bộ kiểm thử nghiệp vụ bằng `npm test` sau khi cài các gói trên Node.js 24. Cách build standalone theo [tài liệu Next.js](https://nextjs.org/docs/app/getting-started/deploying#docker).
