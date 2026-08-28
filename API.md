# Dating Social API Documentation

Base URL: `http://localhost:3000`

Authentication: Bearer JWT token in `Authorization` header.

---

## Auth

### Register

`POST /auth/register`

**Body:**

```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "age": 25,
  "gender": "male|female|other",
  "gender_preference": "male|female|both|none",
  "bio": "string",
  "photo_url": "string",
  "location": "string"
}
```

### Login

`POST /auth/login`

**Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

### Get Current User

`GET /auth/me`

### Update Current User

`PUT /auth/me`

**Body:**

```json
{
  "name": "string",
  "age": 25,
  "gender": "male|female|other",
  "gender_preference": "male|female|both|none",
  "bio": "string",
  "photo_url": "string",
  "location": "string",
  "latitude": 40.7128,
  "longitude": -74.006
}
```

### Update Last Seen

`POST /auth/ping`

---

## Users / Profile

### Get My Full Profile

`GET /users/me/profile`

### Get User Profile by ID

`GET /users/:id/profile`

### Update My Profile

`PUT /users/me/profile`

**Body:**

```json
{
  "name": "string",
  "age": 25,
  "gender": "male|female|other",
  "bio": "string",
  "photo_url": "string",
  "location": "string",
  "latitude": 40.7128,
  "longitude": -74.006
}
```

### Upload My Profile Photo

`POST /users/me/photo-upload`

**Body:** `multipart/form-data` with a `file` field.

Accepted file types: JPEG, PNG, WEBP. Maximum size: 5 MB.

The response contains the stored `photo_url`, which can be used by the profile update and displayed from `/uploads/...`.

### Add Interest

`POST /users/me/interests`

**Body:**

```json
{
  "interest_tag": "string"
}
```

### Remove Interest

`DELETE /users/me/interests`

**Body:**

```json
{
  "interest_tag": "string"
}
```

### Get All Interests

`GET /interests`

### Follow User

`POST /users/:id/follow`

**Body:**

```json
{
  "user_id": 1
}
```

### Unfollow User

`DELETE /users/:id/follow`

**Body:**

```json
{
  "user_id": 1
}
```

### Get My Followers

`GET /users/me/followers`

### Get My Following

`GET /users/me/following`

### Get My Visitors

`GET /users/me/visitors`

### Submit Verification

`POST /users/me/verifications`

**Body:**

```json
{
  "type": "photo|id|video",
  "document_url": "string"
}
```

### Get My Verifications

`GET /users/me/verifications`

### Get User Posts

`GET /users/:id/posts`

---

## Discover

### Get Recommendations

`GET /discover/recommendations?limit=20`

### Get Nearby Users

`GET /discover/nearby?latitude=40.7128&longitude=-74.0060&radius_km=50&limit=20`

### Get Hot Users

`GET /discover/hot?limit=20`

### Get Newcomers

`GET /discover/newcomers?limit=20`

### Get User Posts

`GET /discover/user/:id/posts?limit=20`

---

## Chat

### Create Conversation

`POST /chat/conversations`

**Body:**

```json
{
  "user_id": 2
}
```

### Get My Conversations

`GET /chat/conversations`

### Get Conversation Messages

`GET /chat/conversations/:id/messages?limit=50&offset=0`

### Send Message

`POST /chat/messages`

**Body:**

```json
{
  "conversation_id": 1,
  "content": "Hello!",
  "type": "text|image|video|audio"
}
```

### Mark Messages as Read

`POST /chat/conversations/:id/read`

### Create Group Chat

`POST /chat/groups`

**Body:**

```json
{
  "name": "Group name",
  "member_ids": [2, 3]
}
```

### Get My Groups

`GET /chat/groups`

### Get Group Messages

`GET /chat/groups/:id/messages?limit=50&offset=0`

### Send Group Message

`POST /chat/groups/:id/messages`

**Body:**

```json
{
  "content": "Hello!",
  "type": "text|image|video|audio"
}
```

### Initiate Voice/Video Call

`POST /chat/calls`

**Body:**

```json
{
  "receiver_id": 2,
  "call_type": "voice|video"
}
```

### Send WebRTC Offer

`POST /chat/calls/:id/offer`

**Body:**

```json
{
  "offer_sdp": "string"
}
```

### Send WebRTC Answer

`POST /chat/calls/:id/answer`

**Body:**

```json
{
  "answer_sdp": "string"
}
```

### Send ICE Candidate

`POST /chat/calls/:id/ice`

**Body:**

```json
{
  "candidate": {}
}
```

### End Call

`POST /chat/calls/:id/end`

### Get Call History

`GET /chat/calls/history`

---

## Feed

### Get Feed

`GET /feed?limit=20&offset=0`

### Create Post

`POST /feed`

**Body:**

```json
{
  "content": "Hello world!",
  "media_urls": ["https://example.com/photo.jpg"],
  "type": "text|photo|video"
}
```

### Get Post by ID

`GET /feed/:id`

### Update Post

`PUT /feed/:id`

**Body:**

```json
{
  "content": "Updated content",
  "media_urls": ["https://example.com/photo.jpg"],
  "type": "text|photo|video"
}
```

### Delete Post

`DELETE /feed/:id`

### Like/Unlike Post

`POST /feed/:id/like`

### Get Post Comments

`GET /feed/:id/comments?limit=50&offset=0`

### Add Comment

`POST /feed/:id/comments`

**Body:**

```json
{
  "content": "Nice post!"
}
```

### Delete Comment

`DELETE /feed/comments/:id`

### Vote Contest Post

`POST /feed/:id/vote`

**Body:**

```json
{
  "contest_id": 1
}
```

### Get Active Contests

`GET /contests`

### Get Contest Posts

`GET /contests/:id/posts?limit=20`

---

## Games

### Get Available Games

`GET /games`

### Get User Level

`GET /games/level`

### Get Level XP

`GET /games/level/xp`

### Get Tasks

`GET /games/tasks`

### Get My Tasks

`GET /games/tasks/me`

### Start Task

`POST /games/tasks/start`

**Body:**

```json
{
  "task_id": 1
}
```

### Update Task Progress

`POST /games/tasks/progress`

**Body:**

```json
{
  "task_id": 1,
  "progress": 50
}
```

### Claim Task Reward

`POST /games/tasks/:id/claim`

### Get Badges

`GET /games/badges`

### Check Badge

`GET /games/badges/check?badge_id=1`

### Get Leaderboards

`GET /games/leaderboards`

### Get Leaderboard by ID

`GET /games/leaderboards/:id`

### Create Game Session

`POST /games/sessions`

**Body:**

```json
{
  "game_id": 1
}
```

### Join Game Session

`POST /games/sessions/:id/join`

### Submit Score

`POST /games/sessions/:id/score`

**Body:**

```json
{
  "score": 100
}
```

### End Game Session

`POST /games/sessions/:id/end`

---

## Wallet

### Get Wallet

`GET /wallet`

### Get Coins

`GET /wallet/coins`

### Get Points

`GET /wallet/points`

### Get Transactions

`GET /wallet/transactions?limit=50&offset=0`

### Get VIP Plans

`GET /wallet/vip/plans`

### Get VIP Status

`GET /wallet/vip/status`

### Subscribe to VIP

`POST /wallet/vip/subscribe`

**Body:**

```json
{
  "plan_id": 1
}
```

### Get Store Items

`GET /store`

### Buy Store Item

`POST /store/buy`

**Body:**

```json
{
  "item_id": 1
}
```

### Get Inventory

`GET /inventory`

### Send Gift

`POST /gifts/send`

**Body:**

```json
{
  "receiver_id": 2,
  "gift_id": 1
}
```

### Get Gifts

`GET /gifts`

### Get Referrals

`GET /referrals`

### Get Referral Stats

`GET /referrals/stats`

### Complete Referral

`POST /referrals/:id/complete`

---

## Safety

### Get Safety Tips

`GET /safety/tips`

### Report User

`POST /safety/reports`

**Body:**

```json
{
  "user_id": 2,
  "reason": "spam",
  "description": "Sending spam messages"
}
```

### Get Reports

`GET /safety/reports`

### Get Report by ID

`GET /safety/reports/:id`

### Update Report

`PUT /safety/reports/:id`

**Body:**

```json
{
  "status": "reviewed|resolved"
}
```

### Block User

`POST /safety/block`

**Body:**

```json
{
  "user_id": 2
}
```

### Unblock User

`POST /safety/unblock`

**Body:**

```json
{
  "user_id": 2
}
```

### Get Blocked Users

`GET /safety/blocks`

### Check if Blocked

`GET /safety/blocks/:id`

### Get Scam Alerts

`GET /safety/alerts`

### Dismiss Scam Alert

`POST /safety/alerts/:id/dismiss`

### Submit Verification

`POST /safety/verifications`

**Body:**

```json
{
  "photo_url": "https://example.com/verify.jpg"
}
```

### Get My Moderation Logs

`GET /safety/logs/me`

### Get All Moderation Logs

`GET /safety/logs`

### Moderate User

`POST /safety/moderate`

**Body:**

```json
{
  "user_id": 2,
  "action": "warn|suspend|ban",
  "reason": "Violation of terms"
}
```

---

## Stories

### Create Story

`POST /stories`

**Body:**

```json
{
  "media_url": "https://example.com/photo.jpg",
  "media_type": "image|video",
  "caption": "Hello world!"
}
```

### Get Active Stories

`GET /stories`

### Get My Stories

`GET /stories/my`

### Delete Story

`DELETE /stories/:id`

### Get Story by ID

`GET /stories/:id`

---

## Notifications

### Get Notifications

`GET /notifications?limit=50&offset=0`

### Get Unread Count

`GET /notifications/unread-count`

### Mark as Read

`PUT /notifications/:id/read`

### Mark All as Read

`PUT /notifications/read-all`

### Delete Notification

`DELETE /notifications/:id`

---

## Matches

### Like User

`POST /matches/like`

**Body:**

```json
{
  "user_id": 2,
  "is_super_like": false
}
```

### Get Matches

`GET /matches`

### Get Sent Likes

`GET /matches/sent-likes`

### Get Received Likes

`GET /matches/received-likes`

### Check Match Status

`GET /matches/check/:user_id`

### Boost Profile

`POST /matches/boost`

**Body:**

```json
{
  "duration_hours": 24
}
```

### Get Active Boost

`GET /matches/boost`

---

## Icebreakers

### Send Icebreaker

`POST /icebreakers`

**Body:**

```json
{
  "receiver_id": 2,
  "message": "Hey! Love your profile!"
}
```

### Get My Icebreakers (Inbox)

`GET /icebreakers/inbox`

### Get Sent Icebreakers

`GET /icebreakers/sent`

### Mark as Read

`PUT /icebreakers/:id/read`

### Get by ID

`GET /icebreakers/:id`

---

## Anonymous Messages

### Send Anonymous Message

`POST /anonymous`

**Body:**

```json
{
  "receiver_id": 2,
  "message": "You look amazing!"
}
```

### Get My Anonymous Messages

`GET /anonymous`

### Mark as Read

`PUT /anonymous/:id/read`

### Get by ID

`GET /anonymous/:id`

### Delete

`DELETE /anonymous/:id`

---

## Prompts

### Add Prompt

`POST /prompts`

**Body:**

```json
{
  "prompt_text": "My ideal date",
  "answer": "Dinner and stargazing"
}
```

### Get My Prompts

`GET /prompts/me`

### Get User Prompts

`GET /prompts/user/:id`

### Update Prompt

`PUT /prompts/:id`

**Body:**

```json
{
  "prompt_text": "My ideal date",
  "answer": "Dinner and stargazing"
}
```

### Delete Prompt

`DELETE /prompts/:id`

---

## Photo Albums

### Add Photo

`POST /albums`

**Body:**

```json
{
  "photo_url": "https://example.com/photo.jpg",
  "caption": "My photo",
  "is_primary": true
}
```

### Get My Photos

`GET /albums/me`

### Get User Photos

`GET /albums/user/:id`

### Update Photo

`PUT /albums/:id`

**Body:**

```json
{
  "caption": "Updated caption",
  "is_primary": false
}
```

### Delete Photo

`DELETE /albums/:id`

### Set Primary Photo

`PUT /albums/:id/primary`

---

## Winks

### Send Wink

`POST /winks`

**Body:**

```json
{
  "receiver_id": 2,
  "message": "Hey there!"
}
```

### Get Received Winks

`GET /winks/inbox`

### Get Sent Winks

`GET /winks/sent`

### Mark as Read

`PUT /winks/:id/read`

### Get by ID

`GET /winks/:id`

### Delete Wink

`DELETE /winks/:id`

---

## Moods

### Set Mood

`POST /moods`

**Body:**

```json
{
  "mood": "happy|excited|adventurous|romantic|chill|bored|flirty|curious",
  "status_text": "Feeling great!",
  "expires_hours": 24
}
```

### Get My Mood

`GET /moods/me`

### Get User Mood

`GET /moods/user/:id`

### Get Active Moods

`GET /moods/active`

### Delete Mood

`DELETE /moods/:id`

---

## Notes

- All endpoints require JWT authentication except `/auth/register`, `/auth/login`, `/interests`, `/health`, `/docs`
- Gender preference enforcement: female users can only interact with males, and vice versa
- Stories expire after 24 hours
- Notifications are created for: likes, comments, follows, messages, visits, matches, winks, icebreakers
- Profile views record visitor and send notification
- Chat messages send notifications to receiver
- Feed interactions trigger notifications to post owners
