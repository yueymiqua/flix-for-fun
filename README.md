# Flix-For-Fun

## Project Description:  
The project is building the server-side component of an "online-movie" web application. This is achieved by building an API to query information from client to server (and vice-versa), as well as transfer and model data that is stored inside a NoSQL database. This web application will allow users to register so that they can explore a great selection of movies along with related directors and genres they are interested in learning more about. Registered users will be able update their
personal information(such as username, password, email and birthday) and create a list of their favorite movies. User information will be server-side validated to meet certain input requirements which will assist with preventing malicious attacks and keeping user data safe. Passwords are hashed with bcrypt at registration and stored as encrypted files and compared with passwords entered during login(which are also hashed). Login is handle by Passport Local Strategy(Basic HTTP Authentication) and once the user is autheticated, they will be successfully logged in and be using JWT(JSON Web Token) Authentication to reach other server endpoints.


--------------------------------
## Ways to get the project running:
--------------------------------
1. Visit "https://flix-for-fun.herokuapp.com/" to access the API (platform hosted by Heroku). To be interfaced with front-end application built with React.
2. Download the project files off GitHub, then run "npm install" on your command line interface of command prompt. Then in the commmand prompt, navigate to the root folder of the project and run "node index.js". Once you receive a message saying the server is running on port 8080, launch your desktop Postman application. Open Postman and choose POST request, entering "https://flix-for-fun.herokuapp.com/users" as the endpoint. 
Create a new user: Select "Body" tab, check the radio button "raw", and type in an object with the keys "Username", "Password", "Email", and "Birthday"(entered in YYYY-MM-DD). Username and Password must be alphanumeric and have 5 or more characters. After you create a user profile, change the endpoint to "https://flix-for-fun.herokuapp.com/login" and keep method as POST. Then select "Params" tab and enter the Keys "Username" and "Password" for the Query Params. Enter the Values as the Username and Password created for the user profile. You can be successfully logged in and receive a JWT (JSON Web Token).
You can enter this JWT into the "Token" field under "Authorization" tab and change the "Type" to "Bearer Token" to reach other endpoints of this project.

--------------------------
## Endpoints of this project:
--------------------------
### No Authentication/Authorization Required:  
  
GET ./ - Main Welcome Page of the app  
![flix-for-fun-mainpage](/IMG/flix-for-fun-mainpage.png)

POST ./users - Registration page for new users (entering a user object with keys of Username, Password, Email, and Birthday)  
![create-a-user](/IMG/create-a-user.png)

POST ./login - Login page of the app for existing users (user will have to enter a Username and Password to match existing Username/Password set in database)  
![successful-user-login](/IMG/successful-user-login.png)

### Authentication/Authorization Required:  
  
GET ./movies - loads all the movie information available (in the form of an array of movie objects)

GET ./movies/:title - loads all the information related to a specific movie by title (ex. entering "John Wick" will return a movie JSON object)  
![getting-data-on-single-movie](/IMG/getting-data-on-single-movie.PNG)

GET ./movies/genres/:Name - loads information regarding a specific genre (ex. entering "Thriller" will return description as a string)  
![getting-a-genre-description](/IMG/getting-a-genre-description.PNG)

GET ./movies/directors/:Name - loads all information regarding a specific director (ex. entering "Christopher Nolan" will return a director JSON object)

![getting-data-on-a-director](/IMG/getting-data-on-a-director.PNG)  
UPDATE ./users/:Username - allows existing users to updated profile information (entering again a user object with keys of Username, Password, Email, and Birthday)

POST ./users/:Username/Movies/:MovieID - allows existing users to add a movie to their Favorite-list (using the movie's MovieID)  
![adding-a-movie-to-favorites](/IMG/adding-a-movie-to-favorites.png)

DELETE ./users/:Username/Movies/:MovieID - allows existing users to delete a movie from their Favorite-list (using the movie's MovieID)

DELETE ./users/:Username - allows existing users to delete their entire profile (by entering their Username)


---------------------
## Project Dependencies: 
---------------------
 - Local Dependencies:  
    "bcrypt": "^5.0.1",  
    "body-parser": "^1.19.0",  
    "cors": "^2.8.5",  
    "express": "^4.17.1",  
    "express-validator": "^6.10.0",  
    "jsonwebtoken": "^8.5.1",  
    "lodash": "^4.17.21",  
    "mongoose": "^5.12.0",  
    "morgan": "^1.10.0",  
    "passport": "^0.4.1",  
    "passport-jwt": "^4.0.0",  
    "passport-local": "^1.0.0"

 - devDependencies  
    "eslint": "^7.21.0"


---------------------------
## Which API the project uses:
--------------------------- 
 - Node.js and Express.js for server-side/backend programming
 - Data is stored in noQSL database (MongoDB)
 - The database is also hosted online with MongoDB Atlas
 - The website is hosted online by Heroku (Platform as a Service)