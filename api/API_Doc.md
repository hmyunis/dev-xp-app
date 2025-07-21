## **Dev XP Camp API Documentation**

### **General Information**

#### **Base URL**
All API endpoints are prefixed with:
`http://<your-domain>/api/v1/`

#### **Authentication**
The API uses JSON Web Tokens (JWT) for authentication.

1.  Obtain an `access` and `refresh` token by sending a `POST` request to `/auth/token/` with user credentials.
2.  For all subsequent protected requests, include the access token in the `Authorization` header.

    **Header Format:** `Authorization: Bearer <your_access_token>`

#### **Case Convention**
All request and response bodies use **`camelCase`** for keys. The backend will automatically handle the conversion to and from Python's `snake_case`.

#### **Standard Response Format**

All API responses follow a consistent structure.

**Successful Response (`2xx` status code):**
```json
{
  "success": true,
  "data": {
    // The actual response data or object
  }
}
```
*For paginated lists, the `data` object will have a different structure (see below).*

**Error Response (`4xx` or `5xx` status code):**
```json
{
  "success": false,
  "error": "A friendly, human-readable error message to be shown on the frontend."
}
```

**Paginated Response Format:**
For endpoints that return a list of items, the response will be paginated.
```json
{
  "success": true,
  "data": {
    "items": [
      // ... list of objects ...
    ],
    "pagination": {
      "nextPage": "http://<your-domain>/api/v1/.../?page=2",
      "previousPage": null,
      "count": 50,
      "totalPages": 5,
      "currentPage": 1
    }
  }
}
```

---

### **1. Authentication Endpoints**

#### **1.1 Obtain JWT Tokens (Login)**
*   **Endpoint:** `POST /auth/token/`
*   **Permissions:** Public
*   **Description:** Authenticates a user with their username and password and returns access and refresh tokens.

**Request Body:**
```json
{
  "username": "student_john",
  "password": "a_strong_password"
}
```

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
*The access token payload will include `username`, `fullName`, and `role` claims.*

#### **1.2 Refresh Access Token**
*   **Endpoint:** `POST /auth/token/refresh/`
*   **Permissions:** Public
*   **Description:** Generates a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refresh": "your_long_refresh_token"
}
```

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "access": "a_new_access_token_string"
  }
}
```

---

### **2. User Management Endpoints**

#### **2.1 Manage Current User Profile**
*   **Endpoint:** `GET, PUT, PATCH /users/me/`
*   **Permissions:** Any Authenticated User
*   **Description:** Allows a logged-in user to view and update their own profile information.

**`GET /users/me/`**
*   **Description:** Retrieve the profile of the currently logged-in user.
*   **Success Response (`200 OK`):**
    ```json
    {
      "success": true,
      "data": {
        "id": 5,
        "username": "student_jane",
        "fullName": "Jane Doe",
        "email": "jane.doe@example.com",
        "phoneNumber": "1112223333",
        "role": "STUDENT",
        "lastLogin": "2024-08-15T10:00:00Z",
        "dateJoined": "2024-08-01T09:00:00Z"
      }
    }
    ```

**`PUT /users/me/` or `PATCH /users/me/`**
*   **Description:** Update the profile of the currently logged-in user. `role` cannot be changed via this endpoint.
*   **Request Body:**
    ```json
    {
      "fullName": "Jane A. Doe",
      "phoneNumber": "1112224444"
    }
    ```
*   **Success Response (`200 OK`):** The updated user object.

#### **2.2 Change Password**
*   **Endpoint:** `POST /auth/change-password/`
*   **Permissions:** Any Authenticated User
*   **Description:** Allows a user to change their own password by providing their old password.

**Request Body:**
```json
{
  "oldPassword": "current_secure_password",
  "newPassword": "new_very_secure_password",
  "confirmPassword": "new_very_secure_password"
}
```

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully."
  }
}
```

#### **2.3 Admin: Manage All Users**
*   **Endpoint:** `GET, POST /users/`
*   **Permissions:** Teacher Only
*   **Description:** List all users or create a new user (student or teacher).

**`GET /users/`**
*   **Description:** Get a paginated list of all users.
*   **Query Parameters:** `page`, `pageSize`, `ordering` (`username`, `email`, etc.), `search` (on `username`, `fullName`, `email`).
*   **Success Response (`200 OK`):** A paginated list of user objects.

**`POST /users/`**
*   **Description:** Create a new user. The `StudentProfile` is created automatically if `role` is `STUDENT`.
*   **Request Body:**
    ```json
    {
      "username": "new_student",
      "password": "a_strong_password",
      "fullName": "New Student Name",
      "email": "new.student@email.com",
      "phoneNumber": "5556667777",
      "role": "STUDENT" // or "TEACHER"
    }
    ```
*   **Success Response (`201 Created`):** The newly created user object.

#### **2.4 Admin: Manage a Specific User**
*   **Endpoint:** `GET, PUT, PATCH, DELETE /users/{id}/`
*   **Permissions:** Teacher Only
*   **Description:** Perform CRUD operations on a specific user.

---

### **3. Student & XP Endpoints**

#### **3.1 View Leaderboard**
*   **Endpoint:** `GET /students/leaderboard/`
*   **Permissions:** Any Authenticated User
*   **Description:** Get a paginated list of all students, ordered by their `totalXp` (highest first).

**Success Response (`200 OK`):**
*A paginated list of student profiles.*
```json
{
  // ... pagination wrapper ...
  "items": [
    {
      "user": { "id": 5, "username": "student_jane", "fullName": "Jane Doe", ... },
      "totalXp": 550,
      "availableXp": 400
    },
    {
      "user": { "id": 2, "username": "student_john", "fullName": "John Doe", ... },
      "totalXp": 520,
      "availableXp": 520
    }
  ]
}
```

#### **3.2 Teacher: Manage Student Profiles**
*   **Endpoint:** `GET /students/profiles/`
*   **Permissions:** Teacher Only
*   **Description:** Get a paginated list of all student profiles for the teacher dashboard.
*   **Query Parameters:** `page`, `pageSize`, `ordering` (`totalXp`, `availableXp`, etc.), `search` (on user's `username`, `fullName`, `email`).
*   **Success Response (`200 OK`):** A paginated list of student profiles, same format as the leaderboard.

#### **3.3 Teacher: Add XP to a Student**
*   **Endpoint:** `POST /students/profiles/{user_id}/add-xp/`
*   **Permissions:** Teacher Only
*   **Description:** Adds XP to a specific student. This increases both their `totalXp` and `availableXp`.

**Request Body:**
```json
{
  "xpPoints": 50,
  "reason": "Completed the advanced JavaScript module."
}
```
**Success Response (`200 OK`):**
*The student's updated profile object.*
```json
{
  "success": true,
  "data": {
    "user": { "id": 2, ... },
    "totalXp": 570,
    "availableXp": 570
  }
}
```

---

### **4. Store & Transactions Endpoints**

#### **4.1 Browse and Manage Store Items**
*   **Endpoint:** `GET, POST /store/items/`
*   **Permissions:** `GET`: Authenticated, `POST`: Teacher Only

**`GET /store/items/`**
*   **Description:** Get a list of store items.
    *   **Students:** see only active, in-stock items.
    *   **Teachers:** see all items.
*   **Query Parameters:** `page`, `pageSize`, `ordering` (`xpCost`, `name`), `search` (`name`, `description`).
*   **Success Response (`200 OK`):** A paginated list of store item objects.
    ```json
    {
      // ... pagination wrapper ...
      "items": [
        {
          "id": 1,
          "name": "Sticker Pack",
          "description": "A pack of cool dev stickers for your laptop.",
          "xpCost": 100,
          "imageUrl": "http://<your-domain>/media/store_items/1/stickers.png",
          "stockQuantity": 25,
          "isActive": true,
          "createdAt": "2024-08-10T12:00:00Z"
        }
      ]
    }
    ```

**`POST /store/items/`**
*   **Permissions:** Teacher Only
*   **Description:** Create a new item in the store. The request must be `multipart/form-data`.
*   **Request Body (form-data fields):** `name`, `description`, `xpCost`, `stockQuantity`, `isActive`, `image` (file upload).
*   **Success Response (`201 Created`):** The new store item object.

#### **4.2 Manage a Specific Store Item**
*   **Endpoint:** `GET, PUT, PATCH, DELETE /store/items/{id}/`
*   **Permissions:** `GET`: Authenticated, `PUT/PATCH/DELETE`: Teacher Only

#### **4.3 Teacher: Manage Transactions**
*   **Endpoint:** `GET, POST /store/transactions/`
*   **Permissions:** Teacher Only

**`GET /store/transactions/`**
*   **Description:** Get a paginated log of all purchase transactions.
*   **Query Parameters:** `page`, `pageSize`, `ordering` (`timestamp`), `student__id`, `item__id`, `timestamp__gte`, `timestamp__lte`.
*   **Success Response (`200 OK`):** A paginated list of transaction objects.
    ```json
    {
      // ... pagination wrapper ...
      "items": [
        {
          "id": 1,
          "student": { "id": 5, "username": "student_jane", ... },
          "item": { "id": 1, "name": "Sticker Pack", ... },
          "xpCostAtPurchase": 100,
          "timestamp": "2024-08-15T14:30:00Z"
        }
      ]
    }
    ```

**`POST /store/transactions/`**
*   **Description:** Record a new purchase for a student. This action is atomic and will:
    1.  Validate if the student has enough `availableXp`.
    2.  Validate if the item is in stock.
    3.  Decrement the student's `availableXp`.
    4.  Decrement the item's `stockQuantity`.
    5.  Create a transaction log entry.
*   **Request Body:**
    ```json
    {
      "studentId": 5,
      "itemId": 1
    }
    ```
*   **Success Response (`201 Created`):** The newly created transaction object.