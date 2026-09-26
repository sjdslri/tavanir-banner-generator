# استفاده از ایمیج رسمی Playwright که شامل Node.js و مرورگرهای لازم است
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

# تنظیم پوشه کاری
WORKDIR /app

# کپی فایل‌های package.json و package-lock.json
COPY package*.json ./

# نصب وابستگی‌های پروژه
RUN npm ci

# کپی کردن بقیه فایل‌های پروژه
COPY . .

# تنظیم متغیر محیطی برای مسیر مرورگرهای Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# اعلام پورت پیش‌فرض (Render این را به صورت خودکار تنظیم می‌کند)
EXPOSE 4001

# دستور اجرای پروژه
CMD ["node", "server.js"]