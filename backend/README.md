# Medical Chat API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require authentication using Clerk. Include the authentication token in the Authorization header.

## Endpoints

### Doctor Management

#### 1. Get All Doctors
```http
GET /doctors
```
**Use Case:** Browse available doctors for consultation
- Lists all registered doctors with their availability status
- Includes basic info like name, speciality, and availability
- Shows doctor's post count and verification stats

#### 2. Get Specific Doctor
```http
GET /doctor/:id
```
**Use Case:** View detailed doctor profile
- Returns complete doctor profile
- Includes recent posts and verifications
- Shows current availability status

#### 3. Update Doctor Availability
```http
PUT /doctor/availability
```
**Use Case:** Doctors can toggle their availability for consultations
```json
{
  "doctorId": "string",
  "isAvailable": boolean
}
```

### Chat System

#### Socket.IO Events

1. **connection**
   - Establishes real-time communication
   - Automatically assigns a socket ID

2. **join_room**
   - User/doctor joins a specific chat room
   - Parameter: `sessionId`
   - Use Case: Start participating in a chat session

3. **send_message**
   - Send a message in real-time
   - Parameters: `{ sessionId, content, senderId, senderRole }`
   - Use Case: Real-time communication between user and doctor

4. **receive_message**
   - Receive messages in real-time
   - Use Case: Display incoming messages instantly

5. **leave_room**
   - Leave the chat room
   - Parameter: `sessionId`
   - Use Case: End participation in chat session

6. **end_chat**
   - End the chat session
   - Parameter: `sessionId`
   - Use Case: Complete consultation session

#### REST Endpoints for Chat

1. **Start Chat Session**
```http
POST /chat/start
```
**Use Case:** Initialize a new chat session between user and doctor
```json
{
  "userId": "string",
  "doctorId": "string"
}
```

2. **Get Chat Messages**
```http
GET /chat/:sessionId/messages
```
**Use Case:** Load chat history
- Retrieves all messages for a specific session
- Includes user/doctor information

3. **Save Message**
```http
POST /chat/:sessionId/message
```
**Use Case:** Persist messages in database
```json
{
  "content": "string",
  "senderId": "string",
  "senderRole": "USER" | "DOCTOR"
}
```

4. **End Chat Session**
```http
POST /chat/:sessionId/end
```
**Use Case:** Mark chat session as completed
- Updates session end time
- Triggers diagnostic report generation

### Diagnostic Reports

#### 1. Generate Diagnostic
```http
POST /diagnostic/:sessionId
```
**Use Case:** AI-powered analysis of chat session
- Processes chat transcript
- Generates preliminary diagnosis
- Creates initial diagnostic report

#### 2. Get Diagnostic Report
```http
GET /diagnostic/:sessionId
```
**Use Case:** View diagnostic results
- Returns complete diagnostic report
- Includes AI analysis and doctor notes
- Shows validation status

#### 3. Validate Diagnostic
```http
PUT /diagnostic/:sessionId/validate
```
**Use Case:** Doctor reviews and validates AI diagnosis
```json
{
  "doctorNotes": "string",
  "validatedById": "string"
}
```

### Social Features

#### Posts

1. **Get All Posts**
```http
GET /social
```
**Use Case:** Browse community content
- Lists public posts
- Includes engagement metrics
- Shows author information

2. **Create Post**
```http
POST /social
```
**Use Case:** Share experiences or medical information
```json
{
  "content": "string",
  "category": "GENERAL" | "QUESTION" | "EXPERIENCE" | "ADVICE_REQUEST" | "SUCCESS_STORY" | "MEDICAL_INFO",
  "isPrivate": boolean
}
```

3. **Update Post**
```http
PUT /social/:id
```
**Use Case:** Modify post content or visibility

4. **Delete Post**
```http
DELETE /social/:id
```
**Use Case:** Remove shared content

#### Comments

```http
POST /social/:postId/comments
```
**Use Case:** Engage with community posts
```json
{
  "content": "string",
  "userId": "string" // or doctorId for doctor comments
}
```

#### Likes & Saves

1. **Like Post**
```http
POST /social/:postId/like
```
**Use Case:** Show appreciation for content

2. **Save Post**
```http
POST /social/:postId/save
```
**Use Case:** Bookmark posts for later reference

#### Follows

1. **Follow User**
```http
POST /social/follow/:userId
```
**Use Case:** Follow other users for updates

2. **Unfollow User**
```http
DELETE /social/follow/:userId
```
**Use Case:** Stop following a user

### Admin/Moderation

#### 1. List Users
```http
GET /admin/users
```
**Use Case:** Monitor user activity and demographics
- View all registered users
- Access usage statistics
- Monitor engagement metrics

#### 2. List Doctors
```http
GET /admin/doctors
```
**Use Case:** Oversee medical professionals
- View all registered doctors
- Monitor consultation statistics
- Track verification activities

#### 3. Delete Chat Session
```http
DELETE /admin/chat/:sessionId
```
**Use Case:** Remove inappropriate or problematic content
- Removes chat session and related data
- Use for moderation purposes

### Notifications

#### 1. Send Notification
```http
POST /notifications/send
```
**Use Case:** Notify users of important events
```json
{
  "userId": "string",
  "type": "CHAT_REQUEST" | "DIAGNOSTIC_READY" | "POST_LIKED" | "NEW_FOLLOWER" | "COMMENT",
  "title": "string",
  "message": "string",
  "data": {}
}
```

#### 2. Get Notifications
```http
GET /notifications
```
**Use Case:** Retrieve user notifications
- Lists unread notifications
- Includes notification details and metadata

#### 3. Mark as Read
```http
PUT /notifications/:id/read
```
**Use Case:** Update notification status
- Marks notification as read
- Updates read timestamp

## Real-time Features

The API uses Socket.IO for real-time features:
1. Instant messaging in chat sessions
2. Real-time notification delivery
3. Online status updates for doctors
4. Chat typing indicators

## Error Handling

All endpoints follow a consistent error response format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
