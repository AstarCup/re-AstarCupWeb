## 更新数据库prisma

`npx prisma migrate dev --name init`
`npx prisma migrate dev`

Generate Prisma Client
`npx prisma generate`

### arch笔记本mysql测试服务器

``
mysqld --basedir=/usr \
  --datadir=/home/aecw/re-AstarCupWeb/database \
  --socket=/home/aecw/re-AstarCupWeb/database/mysql.sock \
  --pid-file=/home/aecw/re-AstarCupWeb/database/mysql.pid &
``
