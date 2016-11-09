# webserver routes 

## Auth
* add initial user or reset token, if already exists

  * **URL**
    /auth/setup

  * **Method:** 
    `GET`

  *  **URL Params** 
    None

  * **Data Params** 
    None

  * **Success Response:**
    * **Code:** 200 <br />
    * **Content:** `{user: <USER-OBJECT>, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZVdpbmRvd01hc3RlciIsImlhdCI6MTQ3ODcxNDk4NCwiZXhwIjoxNzk0MjkwOTg0fQ.5SRzRipMBMSmwZ0XeppIk_mJrznyC_u6W0R81-7RZi0"}`
 
  * **Error Response:**
    * **Code:** 404 NOT FOUND <br />
    * **Content:** `{err: "Error occured: <DB-ERROR>"}`

    OR

    * **Code:** 404 NOT FOUND <br />
    * **Content:** `{err : "Admin user already exists!"}`

  * **Sample Call:**
    ```javascript
      $.ajax({
        url: "/auth/setup",
        type : "GET",
        success : function(r) {
          console.log(r);
        }
      });
    ```

* login to backend and database

  * **URL**
    /auth/authenticate

  * **Method:** 
    `POST`

  *  **URL Params** 
    None

  * **Data Params** 
    `{name: <USER-NAME>, password: <USER-PASSWORD>}`

  * **Success Response:**
    * **Code:** 200 <br />
    * **Content:** `{user: <USER-OBJECT>, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZVdpbmRvd01hc3RlciIsImlhdCI6MTQ3ODcxNDk4NCwiZXhwIjoxNzk0MjkwOTg0fQ.5SRzRipMBMSmwZ0XeppIk_mJrznyC_u6W0R81-7RZi0"}`
 
  * **Error Response:**
    * **Code:** 404 NOT FOUND <br />
    * **Content:** `{err: "Error occured: <DB-ERROR>"}`

    OR

    * **Code:** 404 NOT FOUND <br />
    * **Content:** `{err : "Wrong user or password or deactive"}`

    OR

    * **Code:** 404 NOT FOUND <br />
    * **Content:** `{err : "No username or password supplied"}`

  * **Sample Call:**
    ```javascript
      $.ajax({
        url: "/auth/authenticate",
        type: "POST",
        data: {name: "eWindowMaster", password: "test"},
        success : function(r) {
          console.log(r);
        }
      });
    ```

* signin to backend and create new user

  * **URL**
    /auth/signin

  * **Method:** 
    `POST`

  *  **URL Params** 
    None

  * **Data Params** 
    `{name: <USER-NAME>, password: <USER-PASSWORD>}`

  * **Success Response:**
    * **Code:** 200 <br />
    * **Content:** `{user: <USER-OBJECT>, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZVdpbmRvd01hc3RlciIsImlhdCI6MTQ3ODcxNDk4NCwiZXhwIjoxNzk0MjkwOTg0fQ.5SRzRipMBMSmwZ0XeppIk_mJrznyC_u6W0R81-7RZi0"}`
 
  * **Error Response:**
    * **Code:** 404 NOT FOUND <br />
    * **Content:** `{err: "Error occured: <DB-ERROR>"}`

    OR

    * **Code:** 404 NOT FOUND <br />
    * **Content:** `{err : "Password doesn't match"}`

    OR

    * **Code:** 404 NOT FOUND <br />
    * **Content:** `{err : "User already exists!"}`

  * **Sample Call:**
    ```javascript
      $.ajax({
        url: "/auth/signin",
        type: "POST",
        data: {name: "eWindowMaster", password: "test", confirmPassword: "test"},
        success : function(r) {
          console.log(r);
        }
      });
    ```

* logout from backend and clear token in database

  * **URL**
    /auth/logout

  * **Method:** 
    `POST`

  *  **URL Params** 
    None

  * **Data Params** 
    `{token: <ACCESS-TOKEN>}`

  * **Success Response:**
    * **Code:** 200 <br />
    * **Content:** `{status: "Logout User 'eWindowMaster' successful"}`
 
  * **Error Response:**
    * **Code:** 404 NOT FOUND <br />
    * **Content:** `{err: "Error occured: <DB-ERROR>"}`

    OR

    * **Code:** 401 UNAUTHORIZED <br />
    * **Content:** `{err : "No User Authorization found"}`

    OR

    * **Code:** 404 NOT FOUND <br />
    * **Content:** `{err : "No token found"}`

  * **Sample Call:**
    ```javascript
      $.ajax({
        url: "/auth/logout",
        type: "POST",
        data: {token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZVdpbmRvd01hc3RlciIsImlhdCI6MTQ3ODcxNDk4NCwiZXhwIjoxNzk0MjkwOTg0fQ.5SRzRipMBMSmwZ0XeppIk_mJrznyC_u6W0R81-7RZi0"},
        success : function(r) {
          console.log(r);
        }
      });
    ```

