# Blog Website

โปรเจกต์นี้เป็นเว็บไซต์ **Blog อย่างง่าย** พัฒนาด้วย **Next.js** โดยมีระบบจัดการบทความ, ระบบแสดงความคิดเห็น, และ **Admin Panel** สำหรับจัดการ Blog และ Comment ตามข้อกำหนดของโจทย์

---

## Tech Stack

* **Frontend / Fullstack Framework:** Next.js
* **Database / Backend Service:** Supabase
* **Hosting / Deployment:** Vercel

---

## Features

### 1) Blog Listing Page

หน้ารวมบทความ Blog สำหรับแสดงรายการบทความทั้งหมด โดยมีรายละเอียดดังนี้

* แสดงรายการ Blog ทั้งหมด
* แสดง **รูปปก**, **ชื่อ Blog**, **เนื้อหาอย่างย่อ**, และ **วันที่โพสต์**
* รองรับการ **ค้นหาจากชื่อ Blog**
* รองรับ **Pagination** โดยแสดงผล **หน้าละ 10 รายการ**

---

### 2) Blog Detail Page

หน้ารายละเอียดของแต่ละบทความ โดยมีข้อมูลดังนี้

* รูปภาพของ Blog

  * **รูปปก 1 รูป**
  * **รูปเพิ่มเติมได้ไม่เกิน 6 รูป**
  * รวมทั้งหมด **ไม่เกิน 7 รูปต่อ 1 Blog**
* แสดง **ชื่อ Blog**
* แสดง **วันที่โพสต์**
* แสดง **เนื้อหาเต็มของบทความ**
* แสดง **จำนวนผู้เข้าชม (View Count)**

---

### 3) Comment System

ระบบแสดงความคิดเห็นใต้บทความ โดยมีเงื่อนไขดังนี้

* ผู้ใช้งานต้องกรอก **ชื่อผู้ส่ง**
* ข้อความ Comment ต้องเป็น **ภาษาไทย และ/หรือตัวเลขเท่านั้น**
* Comment ที่ส่งเข้ามาจะ **ยังไม่แสดงทันที**
* Comment จะต้องได้รับการ **Approve จาก Admin ก่อน** จึงจะแสดงบนหน้าเว็บไซต์

#### แนวทางการ Validate Comment

ระบบจะตรวจสอบข้อความ Comment ด้วย **Regular Expression (Regex)** เพื่ออนุญาตให้กรอกได้เฉพาะ

* ตัวอักษรภาษาไทย
* ตัวเลข
* ช่องว่าง

ตัวอย่าง Regex:

```regex
/^[ก-๙0-9\s$]/u
```
#### ตัวอย่างแนวทางการตรวจสอบ

* ถ้าผู้ใช้กรอกค่าเป็น `"สวัสดี 123"` → ผ่าน
* ถ้าผู้ใช้กรอกค่าเป็น `"comment abc"` → ไม่ผ่าน
* ถ้าผู้ใช้กรอกค่าว่าง → ไม่ผ่าน

> หมายเหตุ: หากต้องการให้รองรับเฉพาะ “ภาษาไทยและตัวเลข” แบบไม่รวมสัญลักษณ์พิเศษ ควรตรวจสอบทั้งฝั่ง **Client** และ **Server** เพื่อความถูกต้องและปลอดภัยของข้อมูล

---

### 4) Admin Panel

Admin Panel ใช้สำหรับจัดการข้อมูล Blog และ Comment โดยผู้ใช้งานต้อง **Login ก่อน** จึงจะสามารถเข้าถึงได้

#### ความสามารถของ Admin

* **Publish / Unpublish Blog**
* **Create Blog**
* **Read Blog**
* **Update Blog**
* **Delete Blog**
* **แก้ไข URL Slug ของ Blog**
* ดูรายการ Comment ที่ถูกส่งเข้ามา
* **Approve / Reject Comment**
* สามารถ **Reject Comment ที่เคย Approve ไปแล้วได้**

---

## Functional Requirements Summary

### Blog Management

* สร้างบทความใหม่
* แก้ไขบทความ
* ลบบทความ
* เปลี่ยนสถานะบทความเป็น Publish / Unpublish
* แก้ไข URL Slug

### Blog Display

* แสดงรายการ Blog ทั้งหมด
* ค้นหาบทความจากชื่อ
* แบ่งหน้าแสดงผล 10 รายการต่อหน้า
* แสดงรายละเอียดบทความพร้อมรูปภาพและจำนวนผู้เข้าชม

### Comment Moderation

* ผู้ใช้สามารถส่ง Comment ได้
* Comment ต้องผ่านการตรวจสอบรูปแบบข้อมูล
* Comment จะต้องรอการอนุมัติจาก Admin ก่อนจึงแสดง
* Admin สามารถเปลี่ยนสถานะ Comment ระหว่าง Approve / Reject ได้

---

## Database Design (Suggested)

ตัวอย่างการออกแบบฐานข้อมูลใน Supabase

---

### Table: `blogs`

ใช้เก็บข้อมูลบทความ

| Field        | Type          | Description        |
| ------------ | ------------- | ------------------ |
| id           | uuid / bigint | Primary Key        |
| title        | text          | ชื่อบทความ         |
| slug         | text          | URL Slug ของบทความ |
| dscription      | text          | เนื้อหาแบบย่อ      |
| content      | text          | เนื้อหาเต็ม        |
| cover_image  | text          | URL รูปปก          |
| is_published | boolean       | สถานะเผยแพร่       |
| author   | text       | ผู้เขียน     |
| is_published | boolean       | สถานะเผยแพร่       |
| created_at   | timestamp     | วันที่สร้าง        |
| updated_at   | timestamp     | วันที่แก้ไขล่าสุด  |
| is_deleted | Boolean     | สถานะการลบ     |
| deleted_at  | timestamp     | วันที่ลบ Blog             |
---

### Table: `blog_images`

ใช้เก็บรูปภาพเพิ่มเติมของแต่ละ Blog

| Field      | Type          | Description        |
| ---------- | ------------- | ------------------ |
| id         | uuid / bigint | Primary Key        |
| blog_id    | uuid / bigint | อ้างอิงไปยัง blogs |
| image_url  | text          | URL ของรูปภาพ      |

> * `cover_image` อยู่ในตาราง `blogs`
> * รูปเพิ่มเติมอยู่ใน `blog_images` ไม่เกิน 6 รูป

---

### Table: `comments`

ใช้เก็บ Comment ของแต่ละบทความ

| Field       | Type          | Description                   |
| ----------- | ------------- | ----------------------------- |
| id          | uuid   | Primary Key                   |
| blog_id     | uuid   | อ้างอิงไปยังบทความ            |
| author_name | text          | ชื่อผู้ส่ง                    |
| comment_text     | text          | ข้อความ Comment               |
| status      | text          | pending / approved / rejected |
| created_at  | timestamp     | วันที่ส่ง Comment             |
| update_at  | timestamp     | วันที่แก้ไขล่าสุด Comment             |
| deleted_at  | timestamp     | วันที่ลบ Comment             |
| is_delete  | Boolean     | สถานะการลบ            |


---

### Table: `users`

ใช้เก็บข้อมูลผู้ดูแลระบบ

| Field         | Type          | Description      |
| ------------- | ------------- | ---------------- |
| id            | uuid  | Primary Key      |
| username      | text          | ชื่อผู้ใช้       |
| password_hash | text          | รหัสผ่านแบบ hash |

---

## Business Logic Overview

### 1. Blog Listing

* ดึงข้อมูลเฉพาะ Blog ที่ `is_published = true`
* รองรับการค้นหาด้วยชื่อบทความ
* แบ่งหน้าโดยใช้ `limit` และ `offset`
* เรียงลำดับตามวันที่โพสต์ใหม่สุดก่อน

### 2. Blog Detail

* ดึงข้อมูลบทความตาม `slug`
* เพิ่มจำนวน `view_count` เมื่อมีการเข้าชม
* ดึงรูปปกและรูปเพิ่มเติมมาแสดง
* ดึงเฉพาะ Comment ที่มีสถานะ `approved`

### 3. Comment Submission

เมื่อผู้ใช้ส่ง Comment:

1. ตรวจสอบว่ากรอกชื่อผู้ส่งหรือไม่
2. ตรวจสอบรูปแบบข้อความด้วย Regex
3. บันทึก Comment ลงฐานข้อมูลด้วยสถานะ `pending`
4. ยังไม่แสดงบนหน้า Blog จนกว่า Admin จะ approve

### 4. Comment Moderation
Admin สามารถสถานะ comment

เปลี่ยน pending → approved
เปลี่ยน pending → rejected
เปลี่ยน approved → rejected
เปลี่ยน rejected → approved

---

## Deployment

### Database

ใช้ **Supabase** สำหรับจัดเก็บข้อมูล Blog, รูปภาพ, Comment และข้อมูล Admin

### Hosting

Deploy เว็บไซต์ด้วย **Vercel**

---

## Example User Flow

### ฝั่งผู้ใช้งานทั่วไป

1. เข้าหน้ารวม Blog
2. ค้นหาบทความจากชื่อ
3. เลือกอ่านรายละเอียดบทความ
4. ดูเนื้อหา รูปภาพ และ Comment ที่ผ่านการอนุมัติแล้ว
5. ส่ง Comment ใหม่เข้าสู่ระบบ (สถานะ pending)

### ฝั่ง Admin

1. Login เข้าสู่ระบบ
2. สร้าง / แก้ไข / ลบ Blog
3. Publish หรือ Unpublish Blog
4. แก้ไข URL Slug
5. ตรวจสอบ Comment ที่ถูกส่งเข้ามา
6. Approve หรือ Reject Comment
7. เปลี่ยน Comment ที่เคย approve แล้วให้กลับเป็น reject ได้

---

## Validation Rules Summary

### Blog

* ชื่อ Blog ต้องไม่ว่าง
* เนื้อหาต้องไม่ว่าง
* จำนวนรูปทั้งหมดต้องไม่เกิน 7 รูป
* URL Slug ควรไม่ซ้ำกัน

### Comment

* ชื่อผู้ส่งต้องไม่ว่าง
* ข้อความ Comment ต้องไม่ว่าง
* ข้อความต้องเป็นภาษาไทยและ/หรือตัวเลขเท่านั้น
* บันทึกเป็นสถานะ `pending` ก่อนเสมอ

### Admin

* ต้อง login ก่อนเข้าหน้า Admin Panel
* ต้องตรวจสอบสิทธิ์ก่อนแก้ไขข้อมูล Blog และ Comment

---

## Conclusion

โปรเจกต์นี้เป็นระบบ Blog พื้นฐานที่ครอบคลุมทั้งฝั่งผู้ใช้งานทั่วไปและฝั่งผู้ดูแลระบบ โดยรองรับการแสดงผลบทความ, การค้นหา, การแบ่งหน้า, ระบบ Comment แบบมีการอนุมัติ, และระบบ Admin สำหรับจัดการ Blog อย่างครบถ้วนบนสถาปัตยกรรม **Next.js + Supabase + Vercel**
