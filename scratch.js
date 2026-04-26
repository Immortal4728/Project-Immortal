const API_KEY = "AIzaSyCD0J__CAONV7heWPR2lKZkksyS7HxBsxI";
const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;

const payload = {
  email: "admin@projectimmortal.in",
  password: "@Admin123;",
  returnSecureToken: true
};

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(response => response.json())
.then(data => {
  if (data.error) {
    console.error("Error creating user:", data.error.message);
  } else {
    console.log("User created successfully:", data.email);
  }
})
.catch(error => {
  console.error("Fetch error:", error);
});
