# Reelora

A full-stack video sharing platform built with Next.js 16. Upload, discover, and engage with video content — with subscriptions, comments, likes, and search.

---

## What it does

### Video Upload & Playback

Users can upload videos directly to Cloudinary from the browser. Cloudinary handles transcoding, thumbnail generation, and streaming. Videos play back on a dedicated watch page with view tracking.

### Feed & Discovery

The home feed surfaces trending videos and, for signed-in users, the latest uploads from subscribed channels. A full-text search covers video titles, descriptions, and tags, with filters for sort order and upload date.

### Channels

Every user has a channel page showing their profile and uploaded videos. Visitors can subscribe or unsubscribe directly from the channel.

### Engagement

Signed-in users can like or dislike any video, leave top-level comments, and reply in threads. Comments support likes too. Users can delete their own comments.

### Authentication

Sign in with Google or with an email and password. Sessions are JWT-based. Uploading and account settings are only accessible to authenticated users.
