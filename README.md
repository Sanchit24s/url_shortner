# URL Shortening Service

A powerful and feature-rich URL shortening service with analytics and user authentication capabilities.

## Features

- **Shorten URLs**: Generate a short, unique alias for any URL.
- **Redirection**: Automatically redirect users to the original URL via the alias.
- **Analytics**: Gain insights into overall and topic-based URL usage.
- **Authentication**: Secure access with authentication middleware.
- **Rate Limiting**: Prevent abuse using rate-limiting mechanisms.
- **Topic-Based Analytics**: Track URL performance by category or topic.

---

## API Endpoints

### 1. **Google Sign-In Authentication**

- Enables users to register and log in easily using their Google accounts.
- Follow these steps to authenticate:

  1. Enter the URL in the browser to access the login page.
  2. A "Login with Google" button will appear on the page.
  3. Click on the button and log in using your Google account.
  4. Upon successful login, a token and some user data will be displayed.
  5. Copy the token and use it as an Authorization header when sending HTTP requests to other routes.

- **Setting the Authentication Token:**
  - Use the format: `Bearer <your-token>` in the Authorization header of your HTTP requests.

This authentication mechanism enhances user experience and ensures secure access to the API.

### 2. **Create Short URL**

#### Endpoint: `/api/shorten`

**Method:** POST  
**Description:** Creates a short URL.

- **Middleware**: `authMiddleware`, `rateLimiter`
- **Request Body:**

  ```json
  {
    "longUrl": "string",
    "customAlias": "string (optional)",
    "topic": "string (optional)"
  }
  ```

- **Response**:
  ```json
  {
    "alias": "abc123",
    "shortUrl": "https://short.ly/abc123"
  }
  ```

### 3. **Redirect Short URL**

#### Endpoint: `/api/shorten/{alias}`

**Method:** GET  
**Description**: Redirects to the original URL.

- **Middleware**: `authMiddleware`
- **Handler**: `redirectShortUrl`
- **Response**: Redirects the user to the original URL.

### 4. **Get URL Analytics**

#### Endpoint: `/api/analytics/{alias}`

**Method:** GET  
**Description**: Retrieves analytics for a specific short URL.

- **Middleware**: `authMiddleware`
- **Handler**: `overallAnalytics`
- **Response**:

  ```json
  {
    "totalClicks": "number",
    "uniqueUsers": "number",
    "clicksByDate": [
      {
        "date": "string",
        "clicks": "number"
      }
    ],
    "osType": [
      {
        "osName": "string",
        "uniqueClicks": "number",
        "uniqueUsers": "number"
      }
    ],
    "deviceType": [
      {
        "deviceName": "string",
        "uniqueClicks": "number",
        "uniqueUsers": "number"
      }
    ]
  }
  ```

### 5. **Get Topic-Based Analytics**

#### Endpoint: `/api/analytics/topic/{topic}`

**Method:** GET  
**Description**: Retrieves analytics for all URLs under a specific topic.

- **Middleware**: `authMiddleware`
- **Handler**: `getAlias`
- **Response**:

  ```json
  {
    "totalClicks": "number",
    "uniqueUsers": "number",
    "clicksByDate": [
      {
        "date": "string",
        "clicks": "number"
      }
    ],
    "urls": [
      {
        "shortUrl": "string",
        "totalClicks": "number",
        "uniqueUsers": "number"
      }
    ]
  }
  ```

### 6. **Get Overall Analytics**

#### Endpoint: `/api/analytics/overall`

**Method:** GET  
**Description**: Retrieves overall analytics for all short URLs created by the authenticated user.

- **Middleware**: `authMiddleware`
- **Handler**: `getTopicBasedAnalytics`
- **Response**:

  ```json
  {
    "totalUrls": "number",
    "totalClicks": "number",
    "uniqueUsers": "number",
    "clicksByDate": [
      {
        "date": "string",
        "clicks": "number"
      }
    ],
    "osType": [
      {
        "osName": "string",
        "uniqueClicks": "number",
        "uniqueUsers": "number"
      }
    ],
    "deviceType": [
      {
        "deviceName": "string",
        "uniqueClicks": "number",
        "uniqueUsers": "number"
      }
    ]
  }
  ```

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Sanchit24s/url_shortner
   cd url-shortener
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the environment variables:
   Create a `.env` file and configure the following:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/url-shortener
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=YOUR_GOOGLE_ID
   GOOGLE_CLIENT_SECRET = YOUR_GOOGLE_CLIENT_SECRET
   REDIS_HOST = YOUR_REDIS_HOST
   REDIS_PORT = YOUR_REDIS_PORT
   REDIS_PASSWORD = YOUR_REDIS_PASSWORD
   GOOGLE_CALLBACK_URL = http://localhost:3000/auth/google/callback
   SERVER_URL = http://localhost:3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

---

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Middleware**: Authentication (JWT), Rate Limiting

---

## License

This project is licensed under the [Sanchit](LICENSE).
