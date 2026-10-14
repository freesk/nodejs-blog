# NodeJS Blog

A basic blog built with [Express](https://expressjs.com), [Jade](http://jade-lang.com) templates, [Bootstrap](https://getbootstrap.com), and [MongoDB](https://www.mongodb.com) (with [Mongoose](http://mongoosejs.com)). Images are hosted on [Imgur](https://imgur.com).

The site is still in development.

## Features

- **Accounts:** register with email confirmation, then log in and out. Passwords are hashed with bcrypt, and sessions are handled by Passport. Unconfirmed sign-ups expire after one hour.
- **Posts:** create and edit posts in a rich text editor ([CKEditor](https://ckeditor.com)), with a title, category, cover image, and SEO description and keywords. Only a post's author can edit or delete it.
- **Categories:** create, edit, and delete categories, each with its own description and image. Posts from a deleted category move to a "Default" category.
- **Comments:** logged-in users can comment on posts.
- **Browsing:** the home page shows the three latest posts, the blog page lists all posts with short previews, and each category has its own page.

## Installation

```
npm install
```

## Configuration

Before running the app, replace these placeholders with your own credentials:

- `misc/imageHost.js`: your Imgur access token (`<your_access_token>`), used to upload post and category images
- `routes/register.js`: your SMTP account (`<your_account_name>:<your_password>`), used to send confirmation emails

## Usage

Make sure MongoDB is running on `localhost:27017`, then run:

```
npm start
```

The site runs on http://localhost:3000.
